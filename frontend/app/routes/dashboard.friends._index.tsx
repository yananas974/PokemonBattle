// Import des fonctions serveur depuis le fichier .server.ts
export { loader, action } from './server/dashboard.friends._index.server';

import { useLoaderData, useActionData, useSubmit, useNavigation, useSearchParams, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { cn } from '~/utils/cn';

// Import des types depuis le package shared
import type { 
  User as SharedUser, 
  FriendshipWithUser, 
  FriendsListResponse,
  AvailableUser,
  AvailableUsersResponse,
  SendFriendRequestRequest
} from '@pokemon-battle/shared';

// Types locaux pour compatibilité
interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
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
  error?: string;
}

interface ActionData {
  success: boolean;
  message?: string;
  error?: string;
}

// Les fonctions loader et action sont importées depuis le fichier .server.ts

export default function FriendsPage() {
  const { user, friends, pendingRequests, sentRequests, availableUsers, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
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
    if (!availableUsers || !Array.isArray(availableUsers)) {
      setFilteredUsers([]);
      return;
    }

    const filtered = availableUsers.filter(u => {
      // Exclure soi-même
      if (u.id === user.id) return false;
      
      // Filtrer par recherche
      if (searchQuery && !u.username.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Exclure les amis existants
      if (friends?.some(f => f.friend?.id === u.id)) return false;
      
      // Exclure les demandes reçues
      if (pendingRequests?.some(p => p.userId === u.id)) return false;
      
      // Exclure les demandes envoyées
      if (sentRequests?.some(s => s.friend?.id === u.id)) return false;
      
      return true;
    });
    
    setFilteredUsers(filtered);
  }, [searchQuery, availableUsers, user.id, friends, pendingRequests, sentRequests]);

  // Fonction pour soumettre une action
  const handleAction = (actionType: string, data: Record<string, any>) => {
    const formData = new FormData();
    formData.append('actionType', actionType);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    submit(formData, { method: 'post' });
  };

  // Composant pour afficher un utilisateur/ami - VERSION AMÉLIORÉE
  const UserCard = ({ 
    user: userItem, 
    actionType, 
    actionLabel, 
    actionColor = 'secondary',
    friendship 
  }: { 
    user: User; 
    actionType?: string; 
    actionLabel?: string; 
    actionColor?: string;
    friendship?: Friendship;
  }) => {
    return (
      <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {userItem.username.charAt(0).toUpperCase()}
            </div>
            
            {/* Informations utilisateur */}
            <div className="flex-1">
              <h4 className="text-white font-bold text-xl mb-1">
                {userItem.username}
              </h4>
              <p className="text-white/70 text-sm mb-2">{userItem.email}</p>
              {friendship && (
                <span className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide",
                  friendship.status === 'pending' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30',
                  friendship.status === 'accepted' && 'bg-green-500/20 text-green-400 border border-green-400/30',
                  friendship.status === 'blocked' && 'bg-red-500/20 text-red-400 border border-red-400/30'
                )}>
                  {friendship.status === 'pending' ? '⏳ En attente' : 
                   friendship.status === 'accepted' ? '✅ Accepté' : 
                   friendship.status === 'blocked' ? '🚫 Bloqué' : friendship.status}
                </span>
              )}
            </div>
          </div>
          
          {actionType && actionLabel && (
            <button
              onClick={() => handleAction(actionType, {
                friendId: userItem.id,
                friendshipId: friendship?.id
              })}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                actionColor === 'pokemon' && 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg',
                actionColor === 'secondary' && 'bg-white/20 hover:bg-white/30 text-white border border-white/30',
                !actionColor && 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
              )}
            >
              {isLoading ? '⏳' : actionLabel}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Navigation Header */}
          <ModernCard variant="glass" className="backdrop-blur-xl bg-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white hover:scale-105"
                  >
                    <span className="text-lg">🏠</span>
                    <span className="font-medium">← Dashboard</span>
                  </Link>
                  <span className="text-white/60">→</span>
                  <h1 className="text-white font-bold text-2xl flex items-center space-x-3">
                    <span>🤝</span>
                    <span>Gestion des Amis</span>
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">👤 {user.username}</div>
                  <div className="text-white/70 text-sm">ID: {user.id}</div>
                </div>
              </div>
              
              {/* Message d'erreur de chargement */}
              {error && (
                <div className="p-4 rounded-lg border-l-4 bg-red-500/20 border-red-400 text-red-200 mb-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-bold mb-1">Erreur de chargement</h3>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message de succès/erreur d'action */}
              {(actionData || successMessage) && (
                <div className={cn(
                  "p-4 rounded-lg border-l-4 mb-4",
                  (actionData?.success || successMessage) 
                    ? 'bg-green-500/20 border-green-400 text-green-200' 
                    : 'bg-red-500/20 border-red-400 text-red-200'
                )}>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">
                      {(actionData?.success || successMessage) ? '✅' : '❌'}
                    </span>
                    <p className="font-medium">
                      {successMessage || (actionData?.success ? actionData.message : actionData?.error)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModernCard>



          {/* Tab Navigation */}
          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'friends', label: `Amis (${friends?.length || 0})`, icon: '👥', color: 'from-blue-500 to-cyan-600' },
                { key: 'pending', label: `Reçues (${pendingRequests?.length || 0})`, icon: '📥', color: 'from-green-500 to-emerald-600' },
                { key: 'sent', label: `Envoyées (${sentRequests?.length || 0})`, icon: '📤', color: 'from-orange-500 to-red-600' },
                { key: 'search', label: 'Rechercher', icon: '🔍', color: 'from-purple-500 to-pink-600' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "px-6 py-4 rounded-xl transition-all duration-300 text-white font-bold text-lg transform hover:scale-105 shadow-lg",
                    activeTab === tab.key 
                      ? `bg-gradient-to-r ${tab.color} scale-105 shadow-2xl` 
                      : 'bg-white/20 hover:bg-white/30 border border-white/30'
                  )}
                >
                  <span className="mr-3 text-2xl">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.key === 'friends' ? friends?.length || 0 : 
                     tab.key === 'pending' ? pendingRequests?.length || 0 :
                     tab.key === 'sent' ? sentRequests?.length || 0 : '🔍'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content based on active tab */}
          <div className="space-y-6">
            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                <h2 className="text-white font-bold text-3xl mb-8 flex items-center space-x-3">
                  <span className="text-4xl">👥</span>
                  <span>Mes Amis ({friends?.length || 0})</span>
                </h2>
                
                {!friends || friends.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-9xl mb-8 opacity-50">👥</div>
                    <h3 className="text-white font-bold text-2xl mb-4">Aucun ami pour le moment</h3>
                    <p className="text-white/70 text-lg mb-8">
                      Utilisez l'onglet RECHERCHER pour trouver des amis !
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🔍 Rechercher des amis
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {friends.map((friendship) => {
                      if (!friendship.friend) {
                        return (
                          <div key={friendship.id} className="p-6 bg-red-500/20 rounded-xl border border-red-400/30">
                            <p className="text-red-300 text-center">❌ Ami sans données: ID {friendship.id}</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={friendship.id} className="space-y-4">
                          <UserCard
                            user={friendship.friend}
                            friendship={friendship}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction('removeFriend', { friendshipId: friendship.id })}
                              disabled={isLoading}
                              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium border border-red-400/30 hover:border-red-400/50 disabled:opacity-50"
                            >
                              🗑️ Supprimer
                            </button>
                            <Link to={`/dashboard/friends/${friendship.friend?.id}/teams`} className="flex-1">
                              <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg transform hover:scale-105">
                                👀 Équipes
                              </button>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
              <ModernCard variant="glass" size="lg" className="shadow-2xl">
                <div className="p-8">
                  <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-2">
                    <span>📥</span>
                    <span>Demandes Reçues ({pendingRequests?.length || 0})</span>
                  </h2>
                  
                  {!pendingRequests || pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-8xl mb-6 opacity-50">📥</div>
                      <h3 className="text-white font-bold text-xl mb-4">Aucune demande en attente</h3>
                      <p className="text-white/70">
                        Les nouvelles demandes d'amitié apparaîtront ici
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map(request => {
                        // Chercher l'utilisateur qui a envoyé la demande dans availableUsers
                        const sender = availableUsers?.find(u => u.id === request.userId) || {
                          id: request.userId,
                          username: `User ${request.userId}`,
                          email: 'unknown@example.com'
                        } as User;
                        
                        return (
                          <ModernCard key={request.id} variant="glass" className="p-6 bg-green-500/10 border border-green-400/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white">
                                  {sender.username.charAt(0).toUpperCase()}
                                </div>
                                
                                {/* Informations utilisateur */}
                                <div className="flex-1">
                                  <h3 className="text-white font-bold text-xl mb-1">
                                    {sender.username}
                                  </h3>
                                  <p className="text-white/70 text-sm mb-2">
                                    {sender.email}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                      <span className="text-green-400">📥</span>
                                      <span className="text-white/80">Demande reçue</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <span className="text-yellow-400">⏳</span>
                                      <span className="px-2 py-1 rounded-full text-xs font-medium uppercase bg-yellow-500/20 text-yellow-400">
                                        En attente
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions et date */}
                              <div className="text-right space-y-3">
                                <div className="text-white/60 text-xs">
                                  <div className="flex items-center space-x-1 mb-1">
                                    <span>📅</span>
                                    <span>Reçue le:</span>
                                  </div>
                                  <div className="font-mono">
                                    {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="font-mono text-xs">
                                    {new Date(request.createdAt).toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  <ModernButton
                                    variant="pokemon"
                                    size="sm"
                                    onClick={() => handleAction('acceptRequest', { friendshipId: request.id })}
                                    disabled={isLoading}
                                  >
                                    ✅ Accepter
                                  </ModernButton>
                                  <ModernButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleAction('blockFriend', { friendshipId: request.id })}
                                    disabled={isLoading}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    🚫 Bloquer
                                  </ModernButton>
                                </div>
                              </div>
                            </div>
                            
                            {/* Informations détaillées */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400">🆔</span>
                                  <span className="text-white/70">ID Demande:</span>
                                  <span className="text-white font-mono">#{request.id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-400">👤</span>
                                  <span className="text-white/70">ID Expéditeur:</span>
                                  <span className="text-white font-mono">#{sender.id}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-green-400">🔄</span>
                                  <span className="text-white/70">Dernière MAJ:</span>
                                  <span className="text-white font-mono text-xs">
                                    {new Date(request.updatedAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </ModernCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              </ModernCard>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 'sent' && (
              <div className="p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                <h2 className="text-white font-bold text-3xl mb-8 flex items-center space-x-3">
                  <span className="text-4xl">📤</span>
                  <span>Demandes Envoyées ({sentRequests?.length || 0})</span>
                </h2>
                
                {!sentRequests || sentRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-9xl mb-8 opacity-50">📤</div>
                    <h3 className="text-white font-bold text-2xl mb-4">Aucune demande envoyée</h3>
                    <p className="text-white/70 text-lg mb-8">
                      Recherchez des utilisateurs pour leur envoyer des demandes d'amitié
                    </p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🔍 Rechercher des amis
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sentRequests.map((request) => {
                      if (!request.friend) {
                        return (
                          <div key={request.id} className="p-6 bg-red-500/20 rounded-xl border border-red-400/30">
                            <p className="text-red-300 text-center">❌ Demande sans données: ID {request.id}</p>
                          </div>
                        );
                      }
                      
                      return (
                        <div key={request.id} className="space-y-4">
                          <UserCard
                            user={request.friend}
                            friendship={request}
                          />
                          
                          {/* Informations de la demande */}
                          <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-orange-400 text-lg">📤</span>
                                <span className="text-white/80 text-sm font-medium">Demande envoyée</span>
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium uppercase",
                                request.status === 'pending' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30',
                                request.status === 'accepted' && 'bg-green-500/20 text-green-400 border border-green-400/30',
                                request.status === 'blocked' && 'bg-red-500/20 text-red-400 border border-red-400/30'
                              )}>
                                {request.status === 'pending' ? '⏳ En attente' : 
                                 request.status === 'accepted' ? '✅ Acceptée' : 
                                 request.status === 'blocked' ? '🚫 Bloquée' : request.status}
                              </span>
                            </div>
                            <div className="text-white/60 text-xs">
                              <div className="flex items-center space-x-1 mb-1">
                                <span>📅</span>
                                <span>Envoyée le:</span>
                              </div>
                              <div className="font-mono text-white/80">
                                {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })} à {new Date(request.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction('removeFriend', { friendshipId: request.id })}
                              disabled={isLoading}
                              className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium border border-red-400/30 hover:border-red-400/50 disabled:opacity-50"
                            >
                              ❌ Annuler la demande
                            </button>
                            {request.status === 'accepted' && (
                              <Link to={`/dashboard/friends/${request.friend?.id}/teams`} className="flex-1">
                                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg transform hover:scale-105">
                                  👀 Équipes
                                </button>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <ModernCard variant="glass" size="lg" className="shadow-2xl">
                <div className="p-8">
                  <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-2">
                    <span>🔍</span>
                    <span>Rechercher des Amis</span>
                  </h2>
                  
                  {/* Search bar */}
                  <div className="mb-8">
                    <input
                      type="text"
                      placeholder="Nom d'utilisateur..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm text-lg"
                    />
                  </div>

                  {/* Search results */}
                  {searchQuery.length > 0 ? (
                    <>
                      <h3 className="text-white font-bold text-lg mb-6 flex items-center space-x-2">
                        <span>👥</span>
                        <span>Utilisateurs trouvés ({filteredUsers?.length || 0})</span>
                      </h3>
                      {!filteredUsers || filteredUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4 opacity-50">🔍</div>
                          <h3 className="text-white font-bold text-lg mb-2">Aucun utilisateur trouvé</h3>
                          <p className="text-white/70">
                            Essayez un autre nom d'utilisateur
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredUsers.map(userItem => (
                            <div key={userItem.id} className="space-y-3">
                              <UserCard user={userItem} />
                              <ModernButton
                                variant="pokemon"
                                size="sm"
                                onClick={() => handleAction('sendRequest', { friendId: userItem.id })}
                                disabled={isLoading}
                                className="w-full"
                              >
                                ➕ Envoyer une demande
                              </ModernButton>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-8xl mb-6 opacity-50">🔍</div>
                      <h3 className="text-white font-bold text-xl mb-4">Tapez pour rechercher</h3>
                      <p className="text-white/70">
                        Recherchez des utilisateurs par nom d'utilisateur pour leur envoyer une demande d'ami
                      </p>
                    </div>
                  )}
                </div>
              </ModernCard>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '👥', value: friends?.length || 0, label: 'Amis', color: 'text-blue-400' },
              { icon: '📥', value: pendingRequests?.length || 0, label: 'Reçues', color: 'text-green-400' },
              { icon: '📤', value: sentRequests?.length || 0, label: 'Envoyées', color: 'text-orange-400' },
              { icon: '🌐', value: availableUsers?.length || 0, label: 'Utilisateurs', color: 'text-purple-400' }
            ].map((stat, index) => (
              <ModernCard key={index} variant="glass" className="p-6 text-center bg-white/5">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className={cn('text-3xl font-bold mb-2', stat.color)}>{stat.value}</div>
                <div className="text-white/70 text-sm uppercase tracking-wide">{stat.label}</div>
              </ModernCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}