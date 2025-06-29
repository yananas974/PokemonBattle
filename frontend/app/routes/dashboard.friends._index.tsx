import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, useSubmit, useNavigation, Form, useSearchParams } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { friendshipService } from '~/services/friendshipService';
import { 
  VintageCard, 
  VintageButton, 
  VintageTitle
} from '~/components';

// Types
interface User {
  id: number;
  username: string;
  email: string;
}

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  friend?: User;
}

interface LoaderData {
  user: User;
  friends: Friendship[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  availableUsers: User[];
}

// Loader - Récupérer toutes les données d'amitié
export async function loader({ request }: LoaderFunctionArgs) {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const user = sessionData.user;

  try {
    console.log('🔄 Chargement des données d\'amitié...');
    
    // Récupérer le token pour les appels API
    const token = user.token || user.backendToken;
    if (!token) {
      console.error('❌ Aucun token disponible pour les appels d\'amitié');
      throw new Error('Token manquant');
    }
    
    // Récupération parallèle de toutes les données
    const [
      friendsResponse,
      pendingResponse,
      sentResponse,
      usersResponse
    ] = await Promise.all([
      friendshipService.getFriends(token),
      friendshipService.getPendingRequests(token),
      friendshipService.getSentRequests(token),
      friendshipService.searchUsers('', token)
    ]);

    console.log('✅ Données d\'amitié chargées:', {
      friends: friendsResponse.friends?.length || 0,
      pending: pendingResponse.friends?.length || 0,
      sent: sentResponse.friends?.length || 0,
      users: usersResponse.users?.length || 0
    });

    return json<LoaderData>({
      user,
      friends: friendsResponse.friends || [],
      pendingRequests: pendingResponse.friends || [],
      sentRequests: sentResponse.friends || [],
      availableUsers: usersResponse.users || []
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des amis:', error);
    return json<LoaderData>({
      user,
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      availableUsers: []
    });
  }
}

// Action - Gérer les actions d'amitié
export async function action({ request }: ActionFunctionArgs) {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    return json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const user = sessionData.user;
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  
  // Conversion sécurisée des IDs
  const friendshipIdStr = formData.get('friendshipId') as string;
  const friendIdStr = formData.get('friendId') as string;
  
  const friendshipId = friendshipIdStr ? parseInt(friendshipIdStr) : undefined;
  const friendId = friendIdStr ? parseInt(friendIdStr) : undefined;
  
  console.log('📝 Données action:', { actionType, friendshipId, friendId, friendshipIdStr, friendIdStr });

  // Récupérer le token pour les appels API
  const token = user.token || user.backendToken;
  if (!token) {
    return json({ success: false, error: 'Token manquant' }, { status: 401 });
  }

  try {
    switch (actionType) {
      case 'sendRequest':
        if (!friendId) {
          return json({ success: false, error: 'ID ami manquant' }, { status: 400 });
        }
        await friendshipService.sendFriendRequest({ friendId }, token);
        return redirect('/dashboard/friends?tab=sent&success=request-sent');

      case 'acceptRequest':
        if (!friendshipId) {
          return json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.acceptFriendRequest(friendshipId, token);
        return redirect('/dashboard/friends?tab=friends&success=request-accepted');

      case 'blockFriend':
        if (!friendshipId) {
          return json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.blockFriend(friendshipId, token);
        return redirect('/dashboard/friends?success=user-blocked');

      case 'removeFriend':
        if (!friendshipId) {
          return json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.removeFriend(friendshipId, token);
        return redirect('/dashboard/friends?success=friend-removed');

      default:
        return json({ success: false, error: 'Action inconnue' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Erreur action amitié:', error);
    return json({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'action' 
    }, { status: 500 });
  }
}

export default function FriendsPage() {
  const { user, friends, pendingRequests, sentRequests, availableUsers } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ success: boolean; message?: string; error?: string }>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'sent' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const isLoading = navigation.state === 'submitting';

  // Lire le paramètre URL pour définir l'onglet actif au montage
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['friends', 'pending', 'sent', 'search'].includes(tabParam)) {
      setActiveTab(tabParam as 'friends' | 'pending' | 'sent' | 'search');
    }
  }, [searchParams]);

  // Gérer les messages de succès depuis les paramètres URL
  const successParam = searchParams.get('success');
  const successMessage = successParam ? {
    'request-sent': '✅ Demande d\'ami envoyée avec succès !',
    'request-accepted': '✅ Demande d\'ami acceptée !',
    'user-blocked': '🚫 Utilisateur bloqué !',
    'friend-removed': '🗑️ Ami supprimé !'
  }[successParam] : null;

  // Filtrer les utilisateurs disponibles pour la recherche
  useEffect(() => {
    console.log('🔍 Filtrage des utilisateurs:', {
      availableUsers,
      searchQuery,
      userId: user.id,
      friends,
      pendingRequests,
      sentRequests
    });
    
    const filtered = availableUsers.filter(u => 
      u.id !== user.id && // Exclure soi-même
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !friends.some(f => f.friend?.id === u.id) && // Exclure les amis existants
      !pendingRequests.some(p => p.userId === u.id) && // Exclure les demandes reçues
      !sentRequests.some(s => s.friend?.id === u.id) // Exclure les demandes envoyées
    );
    
    console.log('✅ Utilisateurs filtrés:', filtered);
    setFilteredUsers(filtered);
  }, [searchQuery, availableUsers, user.id, friends, pendingRequests, sentRequests]);

  // Fonction pour soumettre une action
  const handleAction = (actionType: string, data: Record<string, any>) => {
    console.log('🔄 HandleAction appelé:', { actionType, data });
    const formData = new FormData();
    formData.append('actionType', actionType);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    console.log('📤 Envoi de la requête avec FormData:', Object.fromEntries(formData.entries()));
    submit(formData, { method: 'post' });
  };

  // Composant pour afficher un utilisateur/ami
  const UserCard = ({ 
    user: userItem, 
    actionType, 
    actionLabel, 
    actionColor = 'pokemon-blue',
    friendship 
  }: { 
    user: User; 
    actionType?: string; 
    actionLabel?: string; 
    actionColor?: string;
    friendship?: Friendship;
  }) => (
    <VintageCard className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-pokemon text-pokemon-blue-dark text-sm uppercase tracking-wide mb-1">
            {userItem.username}
          </h4>
          <p className="text-xs text-gray-600 mb-2">{userItem.email}</p>
          {friendship && (
            <span className={`text-xs px-2 py-1 rounded uppercase font-pokemon ${
              friendship.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
              friendship.status === 'accepted' ? 'bg-green-200 text-green-800' :
              'bg-red-200 text-red-800'
            }`}>
              {friendship.status}
            </span>
          )}
        </div>
        {actionType && actionLabel && (
          <button
            onClick={() => {
              console.log('🔥 BOUTON CLIQUÉ DIRECTEMENT!', { actionType, userItem });
              handleAction(actionType, {
                friendId: userItem.id,
                friendshipId: friendship?.id
              });
            }}
            disabled={isLoading}
            className="text-xs px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
          >
            {isLoading ? '...' : actionLabel}
          </button>
        )}
      </div>
    </VintageCard>
  );

  return (
    <div className="min-h-screen bg-pokemon-vintage-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <VintageTitle className="text-center mb-4">
            🤝 GESTION DES AMIS
          </VintageTitle>
          
          {/* Message de retour */}
          {(actionData || successMessage) && (
            <div className={`p-3 rounded border text-center text-sm font-pokemon uppercase tracking-wide mb-4 ${
              (actionData?.success || successMessage) 
                ? 'bg-green-100 border-green-400 text-green-800' 
                : 'bg-red-100 border-red-400 text-red-800'
            }`}>
              {successMessage || (actionData?.success ? actionData.message : actionData?.error)}
            </div>
          )}
        </div>

        {/* Navigation par onglets */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { key: 'friends', label: `AMIS (${friends.length})`, icon: '👥' },
            { key: 'pending', label: `REÇUES (${pendingRequests.length})`, icon: '📥' },
            { key: 'sent', label: `ENVOYÉES (${sentRequests.length})`, icon: '📤' },
            { key: 'search', label: 'RECHERCHER', icon: '🔍' }
          ].map(tab => (
            <VintageButton
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-xs py-2 ${
                activeTab === tab.key 
                  ? 'bg-pokemon-blue-dark text-white' 
                  : 'bg-pokemon-blue-light text-pokemon-blue-dark'
              }`}
            >
              {tab.icon} {tab.label}
            </VintageButton>
          ))}
        </div>

        {/* Contenu selon l'onglet actif */}
        <div className="space-y-4">
          {/* Onglet Amis */}
          {activeTab === 'friends' && (
            <VintageCard className="p-6">
              <h3 className="font-pokemon text-pokemon-blue-dark text-lg uppercase tracking-wide mb-4 text-center">
                👥 MES AMIS ({friends.length})
              </h3>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-pokemon text-sm uppercase tracking-wide">
                    Aucun ami pour le moment
                  </p>
                  <p className="text-xs mt-2">
                    Utilisez l'onglet RECHERCHER pour trouver des amis !
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map(friendship => friendship.friend && (
                    <div key={friendship.id} className="relative">
                      <UserCard
                        user={friendship.friend}
                        friendship={friendship}
                      />
                      <div className="flex gap-2 mt-2">
                        <VintageButton
                          onClick={() => handleAction('removeFriend', { friendshipId: friendship.id })}
                          disabled={isLoading}
                          className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white flex-1"
                        >
                          🗑️ SUPPRIMER
                        </VintageButton>
                        <VintageButton
                          onClick={() => window.location.href = `/dashboard/friends/${friendship.friend?.id}/teams`}
                          className="text-xs px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white flex-1"
                        >
                          👀 ÉQUIPES
                        </VintageButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </VintageCard>
          )}

          {/* Onglet Demandes reçues */}
          {activeTab === 'pending' && (
            <VintageCard className="p-6">
              <h3 className="font-pokemon text-pokemon-blue-dark text-lg uppercase tracking-wide mb-4 text-center">
                📥 DEMANDES REÇUES ({pendingRequests.length})
              </h3>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-pokemon text-sm uppercase tracking-wide">
                    Aucune demande en attente
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map(request => {
                    // Trouver l'utilisateur qui a envoyé la demande
                    const sender = availableUsers.find(u => u.id === request.userId);
                    if (!sender) return null;
                    
                    return (
                      <div key={request.id} className="relative">
                        <UserCard
                          user={sender}
                          friendship={request}
                        />
                        <div className="flex gap-2 mt-2">
                          <VintageButton
                            onClick={() => handleAction('acceptRequest', { friendshipId: request.id })}
                            disabled={isLoading}
                            className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white flex-1"
                          >
                            ✅ ACCEPTER
                          </VintageButton>
                          <VintageButton
                            onClick={() => handleAction('blockFriend', { friendshipId: request.id })}
                            disabled={isLoading}
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white flex-1"
                          >
                            🚫 BLOQUER
                          </VintageButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </VintageCard>
          )}

          {/* Onglet Demandes envoyées */}
          {activeTab === 'sent' && (
            <VintageCard className="p-6">
              <h3 className="font-pokemon text-pokemon-blue-dark text-lg uppercase tracking-wide mb-4 text-center">
                📤 DEMANDES ENVOYÉES ({sentRequests.length})
              </h3>
              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-pokemon text-sm uppercase tracking-wide">
                    Aucune demande envoyée
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sentRequests.map(request => request.friend && (
                    <UserCard
                      key={request.id}
                      user={request.friend}
                      friendship={request}
                      actionType="removeFriend"
                      actionLabel="❌ ANNULER"
                      actionColor="red"
                    />
                  ))}
                </div>
              )}
            </VintageCard>
          )}

          {/* Onglet Recherche */}
          {activeTab === 'search' && (
            <VintageCard className="p-6">
              <h3 className="font-pokemon text-pokemon-blue-dark text-lg uppercase tracking-wide mb-4 text-center">
                🔍 RECHERCHER DES AMIS
              </h3>
              
              {/* Message d'accueil quand on vient du dashboard */}
              {searchParams.get('tab') === 'search' && (
                <div className="mb-6 p-4 bg-pokemon-blue-light bg-opacity-30 border border-pokemon-blue-dark rounded">
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">🎮</span>
                    <p className="font-pokemon text-sm text-pokemon-blue-dark uppercase tracking-wide">
                      BIENVENUE DANS LA RECHERCHE D'AMIS !
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Tapez un nom d'utilisateur ci-dessous pour commencer
                    </p>
                  </div>
                </div>
              )}
              
              {/* Barre de recherche */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Nom d'utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 font-pokemon text-xs bg-pokemon-cream border-2 border-pokemon-blue-dark rounded focus:outline-none focus:border-pokemon-yellow focus:bg-white transition-all duration-200 placeholder-pokemon-blue uppercase"
                  style={{
                    boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
              </div>

              {/* Résultats de recherche */}
              {searchQuery.length > 0 && (
                <>
                  <h4 className="font-pokemon text-pokemon-blue-dark text-sm uppercase tracking-wide mb-3">
                    UTILISATEURS TROUVÉS ({filteredUsers.length})
                  </h4>
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <p className="font-pokemon text-sm uppercase tracking-wide">
                        Aucun utilisateur trouvé
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUsers.map(userItem => (
                        <UserCard
                          key={userItem.id}
                          user={userItem}
                          actionType="sendRequest"
                          actionLabel="➕ AJOUTER"
                          actionColor="green"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Aide */}
              {searchQuery.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-pokemon text-sm uppercase tracking-wide mb-2">
                    🔍 TAPEZ POUR RECHERCHER
                  </p>
                  <p className="text-xs">
                    Recherchez des utilisateurs par nom d'utilisateur pour leur envoyer une demande d'ami
                  </p>
                </div>
              )}
            </VintageCard>
          )}
        </div>

        {/* Statistiques en bas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <VintageCard className="p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-pokemon text-pokemon-blue-dark text-lg">{friends.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Amis</div>
          </VintageCard>
          
          <VintageCard className="p-4 text-center">
            <div className="text-2xl mb-2">📥</div>
            <div className="font-pokemon text-pokemon-blue-dark text-lg">{pendingRequests.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Reçues</div>
          </VintageCard>
          
          <VintageCard className="p-4 text-center">
            <div className="text-2xl mb-2">📤</div>
            <div className="font-pokemon text-pokemon-blue-dark text-lg">{sentRequests.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Envoyées</div>
          </VintageCard>
          
          <VintageCard className="p-4 text-center">
            <div className="text-2xl mb-2">🌐</div>
            <div className="font-pokemon text-pokemon-blue-dark text-lg">{availableUsers.length}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Utilisateurs</div>
          </VintageCard>
        </div>
      </div>
    </div>
  );
}