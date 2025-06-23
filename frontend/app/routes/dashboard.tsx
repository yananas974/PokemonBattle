import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, Form, Link, useNavigation, useRevalidator } from '@remix-run/react';
import { teamService } from '~/services/teamService';
import { authService } from '~/services/authService';
import { pokemonService } from '~/services/pokemonService';
import { getUserFromSession, logout, getTokenFromSession } from '~/sessions';
import { friendshipService } from '~/services/friendshipService';
import type { Friendship } from '~/services/friendshipService';
import type { Team } from '~/types/team';
import type { Pokemon, PokemonInTeam } from '~/types/pokemon';
import { useState, useEffect } from 'react';
import SimpleWeatherWidget from '~/components/SimpleWeatherWidget';
import { weatherEffectService } from '~/services/weatherEffectService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - Pokemon Battle' },
    { name: 'description', content: 'Gérez vos équipes Pokemon et vos amis' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('=== DASHBOARD LOADER ===');
  
  const { userId, user } = await getUserFromSession(request);
  console.log('Session utilisateur:', { userId, user });
  console.log('🔍 Type de user:', typeof user);
  console.log('🔍 user est un objet?', typeof user === 'object' && user !== null);
  console.log('🔍 Propriétés de user:', user && typeof user === 'object' ? Object.keys(user) : 'N/A');
  
  if (!userId || !user) {
    console.log('Utilisateur non authentifié, redirection vers login');
    throw redirect('/login');
  }
  
  const token = typeof user === 'object' && user !== null ? user.backendToken : null;
  console.log('🔑 Token récupéré:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  
  try {
    console.log('🔍 Récupération des équipes...');
    const teamsData = await teamService.getMyTeams(token);
    console.log('🔍 DEBUG TEAMS DATA:', teamsData);
    console.log('🔍 DEBUG TEAMS DATA STRUCTURE:', JSON.stringify(teamsData, null, 2));

    // Vérifier chaque équipe individuellement
    if (teamsData.teams && Array.isArray(teamsData.teams)) {
      teamsData.teams.forEach((team, index) => {
        console.log(`🔍 Équipe ${index}:`, team);
        console.log(`🔍 Équipe ${index} - pokemon:`, team.pokemon);
        console.log(`🔍 Équipe ${index} - pokemon length:`, team.pokemon?.length);
      });
    }

    console.log('🔍 Récupération des Pokémon...');
    const pokemonData = await pokemonService.getAllPokemon(token);
    console.log('✅ Pokémon chargés:', pokemonData.pokemon?.length || 0);

    console.log('🔍 Récupération des amis...');
    const friendsData = await friendshipService.getFriends(token);
    console.log('✅ Amis chargés:', friendsData.friends.length);
    console.log('📋 Détails amis:', friendsData.friends.map(f => ({ id: f.id, friend: f.friend?.username, status: f.status })));

    console.log('🔍 Récupération des demandes d\'amis en attente...');
    let pendingRequestsData;
    if (token) {
      pendingRequestsData = await friendshipService.getPendingRequests(token);
    } else {
      pendingRequestsData = await friendshipService.getPendingRequests();
    }
    console.log('✅ Demandes en attente:', pendingRequestsData.friends?.length || 0);
    console.log('📋 Détails demandes:', pendingRequestsData.friends?.map(f => ({ id: f.id, friend: f.friend?.username, status: f.status })));

    console.log('🔍 Récupération des utilisateurs disponibles pour les demandes d\'amis...');
    let availableUsersData;
    if (token) {
      availableUsersData = await friendshipService.searchUsers('', token);
    } else {
      availableUsersData = await friendshipService.searchUsers('');
    }
    console.log('✅ Utilisateurs disponibles:', availableUsersData.users?.length || 0);

    let sentRequestsData;
    if (token) {
      sentRequestsData = await friendshipService.getSentRequests(token);
    } else {
      sentRequestsData = await friendshipService.getSentRequests();
    }
    console.log('✅ Demandes envoyées:', sentRequestsData.friends?.length || 0);

    console.log('🔍 Récupération des équipes des amis...');
    const friendsTeams: { [friendId: number]: any[] } = {};
    if (friendsData.friends.length > 0) {
      for (const friendship of friendsData.friends) {
        if (friendship.friend?.id) {
          try {
            let friendTeamsData;
            if (token) {
              friendTeamsData = await friendshipService.getFriendTeams(friendship.friend.id, token);
            } else {
              friendTeamsData = await friendshipService.getFriendTeams(friendship.friend.id);
            }
            friendsTeams[friendship.friend.id] = friendTeamsData.teams || [];
            console.log(`✅ Équipes de ${friendship.friend.username}:`, friendTeamsData.teams?.length || 0);
          } catch (error) {
            console.error(`❌ Erreur récupération équipes de ${friendship.friend.username}:`, error);
            friendsTeams[friendship.friend.id] = [];
          }
        }
      }
    }

    console.log('🔍 Récupération des effets météo...');
    let weatherEffects;
    try {
      weatherEffects = await weatherEffectService.getCurrentEffects();
      console.log('✅ Effets météo chargés:', weatherEffects.effects?.description);
    } catch (error) {
      console.error('❌ Erreur effets météo:', error);
      weatherEffects = null;
    }

    return json({
      teams: teamsData.teams,
      pokemon: pokemonData.pokemon || [],
      friends: friendsData.friends,
      friendsTeams,
      pendingRequests: pendingRequestsData.friends || [],
      availableUsers: availableUsersData.users || [],
      weatherEffects,
      error: null,
      user
    });
  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    return json({ 
      teams: [], 
      pokemon: [],
      friends: [],
      friendsTeams: {},
      pendingRequests: [],
      availableUsers: [],
      weatherEffects: null,
      error: error instanceof Error ? error.message : 'Erreur de chargement',
      user 
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false });
  }

  const token = user.backendToken;
  console.log(`🎯 Action: ${intent}`);
  console.log('🔑 Token pour action:', token ? token.substring(0, 20) + '...' : 'AUCUN');

  // Actions pour les équipes
  if (intent === 'createTeam') {
    const teamName = formData.get('teamName') as string;
    
    if (!teamName) {
      return json({ error: 'Le nom de l\'équipe est requis', success: false });
    }

    try {
      console.log('🏗️ Création équipe:', teamName);
      const result = await teamService.createTeam({ teamName }, token);
      console.log('✅ Équipe créée:', result);
      
      return json({ 
        success: true, 
        message: 'Équipe créée avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur création équipe:', error);
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création',
        success: false 
      });
    }
  }

  if (intent === 'removePokemon') {
    const teamId = parseInt(formData.get('teamId') as string);
    const pokemonId = parseInt(formData.get('pokemonId') as string);
    
    console.log('🗑️ Suppression Pokémon:', { teamId, pokemonId });
    
    if (!teamId || !pokemonId) {
      return json({ error: 'ID équipe et Pokemon requis', success: false });
    }

    try {
      const result = await teamService.removePokemonFromTeam(teamId, pokemonId, token);
      console.log('✅ Pokémon supprimé:', result);
      
      return json({ 
        success: true, 
        message: 'Pokémon retiré avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur suppression Pokémon:', error);
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        success: false 
      });
    }
  }

  if (intent === 'deleteTeam') {
    const teamId = parseInt(formData.get('teamId') as string);
    
    if (!teamId) {
      return json({ error: 'ID de l\'équipe requis', success: false });
    }

    try {
      await teamService.deleteTeam(teamId, token);
      
      return json({ 
        success: true, 
        message: 'Équipe supprimée avec succès'
      });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        success: false 
      });
    }
  }

  // Actions pour les amis
  if (intent === 'sendFriendRequest') {
    const friendId = parseInt(formData.get('friendId') as string);
    
    if (!friendId) {
      return json({ error: 'ID de l\'ami requis', success: false });
    }

    try {
      console.log(`📤 Envoi demande d'ami vers ${friendId}`);
      
      if (token) {
        await friendshipService.sendFriendRequest({ friendId }, token);
      } else {
        await friendshipService.sendFriendRequest({ friendId });
      }
      
      console.log(`✅ Demande envoyée avec succès`);
      return json({ success: true, message: 'Demande d\'ami envoyée avec succès' });
    } catch (error) {
      console.error(`❌ Erreur envoi demande:`, error);
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la demande',
        success: false 
      });
    }
  }

  if (intent === 'acceptFriendRequest') {
    const friendshipId = parseInt(formData.get('friendshipId') as string);
    
    if (!friendshipId) {
      return json({ error: 'ID de l\'amitié requis', success: false });
    }

    try {
      console.log(`🤝 Acceptation demande ${friendshipId}`);
      
      if (token) {
        await friendshipService.acceptFriendRequest(friendshipId, token);
      } else {
        await friendshipService.acceptFriendRequest(friendshipId);
      }
      
      console.log(`✅ Demande acceptée avec succès`);
      return json({ success: true, message: 'Demande d\'ami acceptée avec succès' });
    } catch (error) {
      console.error(`❌ Erreur acceptation:`, error);
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'acceptation',
        success: false 
      });
    }
  }

  if (intent === 'removeFriend') {
    const friendshipId = parseInt(formData.get('friendshipId') as string);
    
    if (!friendshipId) {
      return json({ error: 'ID de l\'amitié requis', success: false });
    }

    try {
      if (token) {
        await friendshipService.removeFriend(friendshipId, token);
      } else {
        await friendshipService.removeFriend(friendshipId);
      }
      return json({ success: true, message: 'Ami supprimé avec succès' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        success: false 
      });
    }
  }

  if (intent === 'blockFriend') {
    const friendshipId = parseInt(formData.get('friendshipId') as string);
    
    if (!friendshipId) {
      return json({ error: 'ID de l\'amitié requis', success: false });
    }

    try {
      if (token) {
        await friendshipService.blockFriend(friendshipId, token);
      } else {
        await friendshipService.blockFriend(friendshipId);
      }
      return json({ success: true, message: 'Ami bloqué avec succès' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors du blocage',
        success: false 
      });
    }
  }

  if (intent === 'logout') {
    return logout(request);
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function Dashboard() {
  const loaderData = useLoaderData();
  
  // ✅ SÉCURISATION : Valeurs par défaut pour éviter les erreurs
  const teams = loaderData?.teams || [];
  const pokemon = loaderData?.pokemon || [];
  const friends = loaderData?.friends || [];
  const pendingRequests = loaderData?.pendingRequests || [];
  const error = loaderData?.error || null;
  const friendsTeams = loaderData?.friendsTeams || {};
  const availableUsers = loaderData?.availableUsers || [];
  const weatherEffects = loaderData?.weatherEffects || null;
  const user = loaderData?.user || null;
  
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const revalidator = useRevalidator();
  const isSubmitting = navigation.state === 'submitting';
  
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonInTeam | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'friends' | 'friendsTeams' | 'combat' | 'pokemon'>('teams');

  // ✅ DEBUG : Afficher l'onglet actuel
  console.log('🔍 DEBUG - Onglet actuel:', activeTab);

  // ✅ DEBUG : Fonction de changement d'onglet avec logging
  const handleTabChange = (tab: 'teams' | 'friends' | 'friendsTeams' | 'combat' | 'pokemon') => {
    console.log('🔄 Changement d\'onglet de', activeTab, 'vers', tab);
    setActiveTab(tab);
  };

  // Revalidation automatique après les actions réussies
  useEffect(() => {
    if (actionData?.success && !isSubmitting) {
      setTimeout(() => {
        revalidator.revalidate();
      }, 100);
    }
  }, [actionData?.success, isSubmitting, revalidator]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Pokemon Battle
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            {/* ✅ RÉACTIVER LE WIDGET MÉTÉO */}
            <SimpleWeatherWidget />
            
            {/* ✅ Affichage des effets météo sur les types */}
            {weatherEffects?.effects && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">
                  🌤️ Effets météorologiques actuels
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  {weatherEffects.effects.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    🌤️ Condition: {weatherEffects.effects.condition}
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                    🕐 Bonus temps: {Math.round((weatherEffects.timeBonus - 1) * 100)}%
                  </div>
                  <div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    ⚡ Effets dynamiques selon le type de Pokémon
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ DEBUG : Affichage de l'état actuel */}
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔍 DEBUG - Onglet actuel: <strong>{activeTab}</strong>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Équipes: {teams?.length || 0} | Amis: {friends?.length || 0} | Pokémon: {pokemon?.length || 0}
            </p>
          </div>

          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-700">❌ {error}</p>
            </div>
          )}
          
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-700">❌ {actionData.error}</p>
            </div>
          )}

          {actionData?.success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-sm text-green-700">✅ {actionData.message}</p>
            </div>
          )}

          {/* Onglets de navigation - VERSION ALTERNATIVE */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <div
                  onClick={() => {
                    console.log('🔥 CLIC DÉTECTÉ sur teams');
                    handleTabChange('teams');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'teams'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mes Équipes ({teams?.length || 0})
                </div>
                
                <div
                  onClick={() => {
                    console.log('🔥 CLIC DÉTECTÉ sur friends');
                    handleTabChange('friends');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'friends'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mes Amis ({friends?.length || 0})
                  {(pendingRequests?.length || 0) > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingRequests?.length || 0}
                    </span>
                  )}
                </div>
                
                <div
                  onClick={() => {
                    console.log('🔥 CLIC DÉTECTÉ sur friendsTeams');
                    handleTabChange('friendsTeams');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'friendsTeams'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Équipes d'Amis
                </div>
                
                <div
                  onClick={() => {
                    console.log('🔥 CLIC DÉTECTÉ sur combat');
                    handleTabChange('combat');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'combat'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚔️ Combat
                </div>
                
                <div
                  onClick={() => {
                    console.log('🔥 CLIC DÉTECTÉ sur pokemon');
                    handleTabChange('pokemon');
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    activeTab === 'pokemon'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pokémon ({pokemon?.length || 0})
                </div>
              </nav>
            </div>
          </div>

          {/* ✅ CONTENU DES ONGLETS - Vérifiez que tous existent */}
          
          {/* DEBUG: Contenu conditionnel visible */}
          <div className="mb-4 p-2 bg-blue-100 rounded">
            <p className="text-xs text-blue-700">
              Rendu conditionnel - activeTab: {activeTab}
              {activeTab === 'teams' && ' → Affichage ÉQUIPES'}
              {activeTab === 'friends' && ' → Affichage AMIS'}
              {activeTab === 'friendsTeams' && ' → Affichage ÉQUIPES D\'AMIS'}
              {activeTab === 'combat' && ' → Affichage COMBAT'}
              {activeTab === 'pokemon' && ' → Affichage POKÉMON'}
            </p>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'teams' && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">✅ Mes Équipes</h2>
              </div>
              
              {/* Formulaire création équipe */}
              <Form method="post" className="mb-6">
                <input type="hidden" name="intent" value="createTeam" />
                <div className="flex gap-4">
                  <input
                    type="text"
                    name="teamName"
                    placeholder="Nom de l'équipe"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Création...' : 'Créer une équipe'}
                  </button>
                </div>
              </Form>

              {/* Liste des équipes */}
              {teams.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  {teams.map((team: Team) => (
                    <div key={team.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {team.teamName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Créée le {new Date(team.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="deleteTeam" />
                          <input type="hidden" name="teamId" value={team.id} />
                          <button
                            type="submit"
                            className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                            onClick={(e) => {
                              if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            🗑️ Supprimer
                          </button>
                        </Form>
                      </div>

                      {/* Pokémon dans l'équipe */}
                      {team.pokemon && team.pokemon.length > 0 ? (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Pokémon dans l'équipe ({team.pokemon.length}/6):
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {team.pokemon.map((pokemon: any, index: number) => (
                              <div 
                                key={index} 
                                className="bg-white rounded-lg p-2 text-center shadow-sm relative group cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setSelectedPokemon(pokemon)}
                              >
                                <Form method="post" className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <input type="hidden" name="intent" value="removePokemon" />
                                  <input type="hidden" name="teamId" value={team.id} />
                                  <input type="hidden" name="pokemonId" value={pokemon.pokemon_id} />
                                  <button
                                    type="submit"
                                    className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center z-10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!confirm(`Retirer ${pokemon.name} de l'équipe ?`)) {
                                        e.preventDefault();
                                      }
                                    }}
                                    title={`Retirer ${pokemon.name}`}
                                  >
                                    ×
                                  </button>
                                </Form>
                                
                                <img 
                                  src={pokemon.sprite_url} 
                                  alt={pokemon.name}
                                  className="w-12 h-12 mx-auto mb-1"
                                />
                                <p className="text-xs font-medium text-gray-800 truncate">
                                  {pokemon.name}
                                </p>
                                <p className="text-xs text-gray-500">#{pokemon.pokemon_id}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-700">
                            🔍 Aucun Pokémon dans cette équipe
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link
                          to={`/team/${team.id}/select-pokemon`}
                          className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          ⚡ Gérer les Pokémon
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">Vous n'avez pas encore d'équipe</p>
                  <p className="text-sm text-gray-400">Créez votre première équipe pour commencer !</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-6">
              {/* Demandes d'amis en attente */}
              {pendingRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                    Demandes d'amis en attente ({pendingRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{request.friend?.username}</p>
                          <p className="text-sm text-gray-500">{request.friend?.email}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="acceptFriendRequest" />
                            <input type="hidden" name="friendshipId" value={request.id} />
                            <button
                              type="submit"
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Accepter
                            </button>
                          </Form>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="blockFriend" />
                            <input type="hidden" name="friendshipId" value={request.id} />
                            <button
                              type="submit"
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Refuser
                            </button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des amis */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Amis ({friends.length})</h2>
                
                {friends.length > 0 ? (
                  <div className="space-y-4">
                    {friends.map((friendship) => (
                      <div key={friendship.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{friendship.friend?.username}</h3>
                          <p className="text-sm text-gray-500">{friendship.friend?.email}</p>
                          <p className="text-xs text-gray-400">
                            Amis depuis le {new Date(friendship.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="removeFriend" />
                            <input type="hidden" name="friendshipId" value={friendship.id} />
                            <button
                              type="submit"
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Supprimer
                            </button>
                          </Form>
                          <Form method="post" className="inline">
                            <input type="hidden" name="intent" value="blockFriend" />
                            <input type="hidden" name="friendshipId" value={friendship.id} />
                            <button
                              type="submit"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                              onClick={(e) => {
                                if (!confirm('Êtes-vous sûr de vouloir bloquer cet ami ?')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              Bloquer
                            </button>
                          </Form>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore d'amis</p>
                    <p className="text-sm text-gray-400">Ajoutez des amis pour commencer !</p>
                  </div>
                )}
              </div>

              {/* Ajouter des amis */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter des amis</h3>
                
                {availableUsers.length > 0 ? (
                  <div className="space-y-3">
                    {availableUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="sendFriendRequest" />
                          <input type="hidden" name="friendId" value={user.id} />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Ajouter
                          </button>
                        </Form>
                      </div>
                    ))}
                    {availableUsers.length > 5 && (
                      <div className="text-center">
                        <Link
                          to="/friends/search"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Voir tous les utilisateurs ({availableUsers.length})
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Aucun utilisateur disponible pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friendsTeams' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Équipes de mes Amis</h2>
                
                {friends.length > 0 ? (
                  <div className="space-y-8">
                    {friends.map((friendship) => {
                      const friendTeams = friendsTeams[friendship.friend?.id || 0] || [];
                      
                      return (
                        <div key={friendship.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-600 font-semibold">
                                {friendship.friend?.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {friendship.friend?.username}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {friendTeams.length} équipe(s)
                              </p>
                            </div>
                          </div>

                          {friendTeams.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              {friendTeams.map((team: any) => (
                                <div key={team.id} className="bg-gray-50 rounded-lg p-4 relative">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-medium text-gray-900">{team.teamName}</h4>
                                    <span className="text-xs text-gray-500">
                                      {new Date(team.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                  </div>

                                  {team.pokemon && team.pokemon.length > 0 ? (
                                    <>
                                      <div className="grid grid-cols-3 gap-2 mb-4">
                                        {team.pokemon.map((pokemon: any, index: number) => (
                                          <div 
                                            key={index}
                                            className="bg-white rounded p-2 text-center shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => setSelectedPokemon(pokemon)}
                                          >
                                            <img 
                                              src={pokemon.sprite_url} 
                                              alt={pokemon.name}
                                              className="w-10 h-10 mx-auto mb-1"
                                            />
                                            <p className="text-xs font-medium text-gray-800 truncate">
                                              {pokemon.name}
                                            </p>
                                            <p className="text-xs text-gray-500">Niv. {pokemon.level}</p>
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* ✅ Bouton de combat */}
                                      <div className="flex justify-center">
                                        <button
                                          onClick={() => {
                                            // TODO: Implémenter la logique de combat
                                            alert(`Combat contre l'équipe "${team.teamName}" de ${friendship.friend?.username} - À implémenter !`);
                                          }}
                                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                        >
                                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                          </svg>
                                          ⚔️ Combattre
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center py-4 text-gray-500">
                                      <p className="text-sm">Équipe vide</p>
                                      <p className="text-xs text-gray-400 mt-1">Impossible de combattre</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                              <p className="text-gray-500">
                                {friendship.friend?.username} n'a pas encore d'équipes
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore d'amis</p>
                    <p className="text-sm text-gray-400">Ajoutez des amis pour voir leurs équipes !</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'combat' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">⚔️ Combat</h2>
              <div className="space-y-6">
                <TeamBattleComponent teams={teams} friendsTeams={friendsTeams} token={user?.backendToken} />
              </div>
            </div>
          )}

          {activeTab === 'pokemon' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pokémon Disponibles ({pokemon.length})
              </h2>
              
              {pokemon.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {pokemon.slice(0, 18).map((poke) => (
                    <div
                      key={poke.id}
                      className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer"
                      onClick={() => setSelectedPokemon({
                        ...poke,
                        pokemon_id: poke.id,
                        name_fr: poke.nameFr,
                        level: poke.level || 1,
                        hp: poke.base_hp,
                        attack: poke.base_attack,
                        defense: poke.base_defense,
                        speed: poke.base_speed
                      })}
                    >
                      <div className="aspect-square mb-2">
                        <img
                          src={poke.sprite_url}
                          alt={poke.nameFr}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {poke.nameFr}
                        </h3>
                        <p className="text-xs text-gray-500">#{poke.id}</p>
                        <p className="text-xs text-indigo-600 font-medium">{poke.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-4">Aucun Pokémon disponible</p>
                  <p className="text-sm text-gray-400">Vérifiez que le seed a été exécuté</p>
                </div>
              )}
              
              {pokemon.length > 18 && (
                <div className="text-center mt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200"
                  >
                    Voir tous les Pokémon ({pokemon.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal détails Pokémon */}
      {selectedPokemon && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPokemon(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPokemon(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>

            <div className="text-center">
              <img 
                src={selectedPokemon.sprite_url} 
                alt={selectedPokemon.name_fr || selectedPokemon.nameFr}
                className="w-24 h-24 mx-auto mb-4"
              />
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedPokemon.name_fr || selectedPokemon.nameFr}
              </h3>
              
              <p className="text-gray-500 mb-4">#{selectedPokemon.pokemon_id || selectedPokemon.id}</p>
              
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-red-50 p-3 rounded">
                  <span className="text-sm font-medium text-red-600">HP</span>
                  <p className="text-lg font-bold text-red-700">{selectedPokemon.hp || selectedPokemon.base_hp || 100}</p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded">
                  <span className="text-sm font-medium text-orange-600">Attaque</span>
                  <p className="text-lg font-bold text-orange-700">{selectedPokemon.attack || selectedPokemon.base_attack || 50}</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded">
                  <span className="text-sm font-medium text-blue-600">Défense</span>
                  <p className="text-lg font-bold text-blue-700">{selectedPokemon.defense || selectedPokemon.base_defense || 50}</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded">
                  <span className="text-sm font-medium text-green-600">Vitesse</span>
                  <p className="text-lg font-bold text-green-700">{selectedPokemon.speed || selectedPokemon.base_speed || 50}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedPokemon.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant Combat Simplifié
function TeamBattleComponent({ teams, friendsTeams, token }: { teams: any[], friendsTeams: any, token?: string }) {
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [battleResult, setBattleResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Sécurisation complète des données
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeFriendsTeams = friendsTeams || {};
  
  // ✅ Convertir friendsTeams objet en tableau de façon sécurisée
  const friendTeamsArray = Object.values(safeFriendsTeams).flat().filter(team => team && team.id);
  const allTeams = [...safeTeams, ...friendTeamsArray];

  const simulateBattle = async () => {
    if (!selectedTeam1 || !selectedTeam2) {
      alert('Sélectionnez deux équipes !');
      return;
    }

    if (!token) {
      alert('Token d\'authentification manquant !');
      return;
    }

    const team1 = allTeams.find(t => String(t.id) === String(selectedTeam1));
    const team2 = allTeams.find(t => String(t.id) === String(selectedTeam2));

    if (!team1 || !team2) {
      alert(`Équipes non trouvées !`);
      return;
    }

    // ✅ Vérifier que les équipes ont des Pokémon
    if (!team1.pokemon || team1.pokemon.length === 0) {
      alert(`L'équipe "${team1.teamName}" n'a pas de Pokémon !`);
      return;
    }

    if (!team2.pokemon || team2.pokemon.length === 0) {
      alert(`L'équipe "${team2.teamName}" n'a pas de Pokémon !`);
      return;
    }

    console.log('🚀 Lancement du combat:', {
      team1: { name: team1.teamName, pokemon: team1.pokemon.length },
      team2: { name: team2.teamName, pokemon: team2.pokemon.length }
    });

    setLoading(true);
    try {
      // ✅ Préparer les données de combat
      const combatData = {
        team1: {
          id: String(team1.id),
          teamName: team1.teamName,
          pokemon: team1.pokemon.map((p: any) => ({
            pokemon_id: p.pokemon_id,
            name_fr: p.name,
            type: p.type,
            base_hp: p.hp,
            base_attack: p.attack,
            base_defense: p.defense,
            base_speed: p.speed,
            sprite_url: p.sprite_url
          }))
        },
        team2: {
          id: String(team2.id),
          teamName: team2.teamName,
          pokemon: team2.pokemon.map((p: any) => ({
            pokemon_id: p.pokemon_id,
            name_fr: p.name,
            type: p.type,
            base_hp: p.hp,
            base_attack: p.attack,
            base_defense: p.defense,
            base_speed: p.speed,
            sprite_url: p.sprite_url
          }))
        },
        lat: 48.8566,
        lon: 2.3522,
        mode: 'full'
      };

      console.log('📤 Données envoyées:', combatData);

      // ✅ Appel API
      const { apiCall } = await import('~/utils/api');
      const response = await apiCall('/api/battle/turn-based', {
        method: 'POST',
        body: JSON.stringify(combatData)
      }, token);

      console.log('📡 Réponse serveur status:', response.status);
      const data = await response.json();
      console.log('📡 Réponse serveur data:', data);

      if (data.success) {
        // ✅ Récupérer toutes les données détaillées
        const team1Pokemon = data.battleState.team1Pokemon;
        const team2Pokemon = data.battleState.team2Pokemon;
        const battleLog = data.battleState.battleLog;
        const weatherEffects = data.battleState.weatherEffects;
        
        setBattleResult({
          winner: data.battleState.winner,
          battleLog: battleLog,
          weatherEffects: weatherEffects,
          turns: data.battleState.turn - 1,
          fullBattleState: data.battleState,
          team1Stats: { 
            teamName: combatData.team1.teamName,
            pokemon: team1Pokemon,
            survivingPokemon: team1Pokemon.filter((p: any) => !p.is_ko).length,
            totalPokemon: team1Pokemon.length
          },
          team2Stats: { 
            teamName: combatData.team2.teamName,
            pokemon: team2Pokemon,
            survivingPokemon: team2Pokemon.filter((p: any) => !p.is_ko).length,
            totalPokemon: team2Pokemon.length
          }
        });
      } else {
        alert('Erreur serveur: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('❌ Erreur combat:', error);
      alert('Erreur de connexion: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Debug Panel */}
      <div className="bg-yellow-50 p-3 rounded text-xs">
        <div><strong>Debug Info:</strong></div>
        <div>Équipes perso: {safeTeams.length} | Équipes amis: {friendTeamsArray.length}</div>
        <div>Total équipes: {allTeams.length}</div>
        <div>Selected: {selectedTeam1} & {selectedTeam2}</div>
        {allTeams.length > 0 && (
          <details className="mt-2">
            <summary>Voir toutes les équipes</summary>
            <div className="mt-1 text-xs">
              {allTeams.map(team => (
                <div key={team.id}>ID: {team.id} | Nom: {team.teamName} | Pokémon: {team.pokemon?.length || 0}</div>
              ))}
            </div>
          </details>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Équipe 1</label>
          <select 
            value={selectedTeam1} 
            onChange={(e) => setSelectedTeam1(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisir une équipe...</option>
            {safeTeams.map(team => (
              <option key={team.id} value={team.id}>
                🔵 {team.teamName} ({team.pokemon?.length || 0} Pokémon)
              </option>
            ))}
            {friendTeamsArray.map(team => (
              <option key={team.id} value={team.id}>
                👥 {team.teamName} ({team.pokemon?.length || 0} Pokémon)
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Équipe 2</label>
          <select 
            value={selectedTeam2} 
            onChange={(e) => setSelectedTeam2(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisir une équipe...</option>
            {safeTeams.map(team => (
              <option key={team.id} value={team.id}>
                🔵 {team.teamName} ({team.pokemon?.length || 0} Pokémon)
              </option>
            ))}
            {friendTeamsArray.map(team => (
              <option key={team.id} value={team.id}>
                👥 {team.teamName} ({team.pokemon?.length || 0} Pokémon)
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={simulateBattle}
        disabled={loading || !selectedTeam1 || !selectedTeam2}
        className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? '⚔️ Combat en cours...' : '⚔️ LANCER LE COMBAT !'}
      </button>

      {battleResult && (
        <div className="mt-6 space-y-6">
          {/* ✅ NOUVEAU : Conditions météo du combat */}
          {battleResult.weatherEffects && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg shadow-lg">
              <h4 className="font-bold text-lg mb-2 flex items-center">
                🌤️ Conditions Météorologiques
              </h4>
              <p className="text-blue-100 mb-3">
                {battleResult.weatherEffects.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-20 p-3 rounded">
                  <h5 className="font-semibold mb-2">🔵 Effets sur {battleResult.team1Stats?.teamName}</h5>
                  <div className="space-y-1">
                    {battleResult.team1Stats?.pokemon?.map((pokemon: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{pokemon.name_fr}</span>
                        <span className={`font-bold ${
                          pokemon.weatherMultiplier > 1.05 ? 'text-green-200' : 
                          pokemon.weatherMultiplier < 0.95 ? 'text-red-200' : 'text-gray-200'
                        }`}>
                          {pokemon.weatherStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-20 p-3 rounded">
                  <h5 className="font-semibold mb-2">🔴 Effets sur {battleResult.team2Stats?.teamName}</h5>
                  <div className="space-y-1">
                    {battleResult.team2Stats?.pokemon?.map((pokemon: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{pokemon.name_fr}</span>
                        <span className={`font-bold ${
                          pokemon.weatherMultiplier > 1.05 ? 'text-green-200' : 
                          pokemon.weatherMultiplier < 0.95 ? 'text-red-200' : 'text-gray-200'
                        }`}>
                          {pokemon.weatherStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Résultat principal */}
          <div className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-2">
              🏆 {battleResult.winner === 'team1' ? battleResult.team1Stats?.teamName : 
                   battleResult.winner === 'team2' ? battleResult.team2Stats?.teamName : 
                   'MATCH NUL'} REMPORTE LE COMBAT !
            </h3>
            <p className="text-yellow-100">Combat terminé en {battleResult.turns} tours</p>
          </div>

          {/* ✅ État final des équipes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Équipe 1 */}
            <div className={`p-4 rounded-lg border-2 ${battleResult.winner === 'team1' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <h4 className={`font-bold text-lg mb-3 ${battleResult.winner === 'team1' ? 'text-green-700' : 'text-gray-700'}`}>
                🔵 {battleResult.team1Stats?.teamName}
                {battleResult.winner === 'team1' && ' 👑'}
              </h4>
              <p className="text-sm mb-3">
                <span className="font-semibold">{battleResult.team1Stats?.survivingPokemon}</span>/{battleResult.team1Stats?.totalPokemon} Pokémon survivants
              </p>
              
              <div className="space-y-2">
                {battleResult.team1Stats?.pokemon?.map((pokemon: any, index: number) => (
                  <div key={index} className={`p-2 rounded text-sm ${pokemon.is_ko ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={pokemon.sprite_url} alt={pokemon.name_fr} className="w-6 h-6" />
                        <span className="font-medium">{pokemon.name_fr}</span>
                        <span className="text-xs bg-gray-200 px-1 rounded">{pokemon.type}</span>
                      </div>
                      <div className="text-right">
                        {pokemon.is_ko ? (
                          <span className="font-bold text-red-600">💀 K.O.</span>
                        ) : (
                          <span className="font-bold text-green-600">❤️ {pokemon.current_hp} HP</span>
                        )}
                      </div>
                    </div>
                    {/* ✅ NOUVEAU : Affichage de l'effet météo */}
                    <div className="text-xs mt-1 text-center">
                      <span className={`px-2 py-1 rounded ${
                        pokemon.weatherMultiplier > 1.05 ? 'bg-green-200 text-green-800' :
                        pokemon.weatherMultiplier < 0.95 ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        🌤️ {pokemon.weatherStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Équipe 2 */}
            <div className={`p-4 rounded-lg border-2 ${battleResult.winner === 'team2' ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
              <h4 className={`font-bold text-lg mb-3 ${battleResult.winner === 'team2' ? 'text-green-700' : 'text-gray-700'}`}>
                🔴 {battleResult.team2Stats?.teamName}
                {battleResult.winner === 'team2' && ' 👑'}
              </h4>
              <p className="text-sm mb-3">
                <span className="font-semibold">{battleResult.team2Stats?.survivingPokemon}</span>/{battleResult.team2Stats?.totalPokemon} Pokémon survivants
              </p>
              
              <div className="space-y-2">
                {battleResult.team2Stats?.pokemon?.map((pokemon: any, index: number) => (
                  <div key={index} className={`p-2 rounded text-sm ${pokemon.is_ko ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={pokemon.sprite_url} alt={pokemon.name_fr} className="w-6 h-6" />
                        <span className="font-medium">{pokemon.name_fr}</span>
                        <span className="text-xs bg-gray-200 px-1 rounded">{pokemon.type}</span>
                      </div>
                      <div className="text-right">
                        {pokemon.is_ko ? (
                          <span className="font-bold text-red-600">💀 K.O.</span>
                        ) : (
                          <span className="font-bold text-green-600">❤️ {pokemon.current_hp} HP</span>
                        )}
                      </div>
                    </div>
                    {/* ✅ NOUVEAU : Affichage de l'effet météo */}
                    <div className="text-xs mt-1 text-center">
                      <span className={`px-2 py-1 rounded ${
                        pokemon.weatherMultiplier > 1.05 ? 'bg-green-200 text-green-800' :
                        pokemon.weatherMultiplier < 0.95 ? 'bg-red-200 text-red-800' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        🌤️ {pokemon.weatherStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}