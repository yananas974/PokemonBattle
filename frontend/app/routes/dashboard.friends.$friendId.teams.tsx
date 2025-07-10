import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useState } from 'react';
import { getUserFromSession } from '~/sessions';
import { friendshipService } from '~/services/friendshipService';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { cn } from '~/utils/cn';
import type { Team } from '~/types/team';

// Import des types depuis le package shared
import type { 
  User as SharedUser, 
  FriendshipWithUser
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
  friend: User | null;
  teams: Team[];
  friendId: number;
  error?: string;
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Équipes d\'un ami - Pokemon Battle' },
    { name: 'description', content: 'Consultez les équipes de vos amis' },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const friendId = params.friendId;
  const friendIdNumber = friendId ? parseInt(friendId, 10) : null;

  if (!friendIdNumber || isNaN(friendIdNumber)) {
    throw new Response('Invalid friend ID', { status: 400 });
  }

  try {
    console.log('🔄 Chargement des équipes pour l\'ami ID:', friendIdNumber);
    
    // Récupérer les informations de l'ami avec la structure corrigée
    const friendsResponse = await friendshipService.getFriends(request);
    console.log('✅ Friends response:', friendsResponse);
    
    const friend = friendsResponse?.data?.friends?.find(f => 
      f.friend?.id === friendIdNumber
    );

    if (!friend) {
      console.error('❌ Ami non trouvé dans la liste:', friendIdNumber);
      throw new Response('Friend not found or not authorized', { status: 404 });
    }

    console.log('✅ Ami trouvé:', friend.friend);

    // Récupérer les équipes de l'ami
    const teamsResponse = await friendshipService.getFriendTeams(friendIdNumber, request);
    console.log('🔍 Teams response structure:', JSON.stringify(teamsResponse, null, 2));
    
    // Adapter la structure selon la réponse de l'API
    // Le backend retourne { success: true, message: string, data: teams }
    const teams = teamsResponse?.data || [];
    console.log('✅ Teams extracted:', teams);

    return json<LoaderData>({
      user,
      friend: friend.friend || null,
      teams: teams as Team[],
      friendId: friendIdNumber
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des équipes:', error);
    return json<LoaderData>({
      user,
      friend: null,
      teams: [],
      friendId: friendIdNumber,
      error: error instanceof Error ? error.message : 'Impossible de charger les équipes de cet ami'
    });
  }
};

export default function FriendTeams() {
  const { user, friend, teams, friendId, error } = useLoaderData<LoaderData>();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  console.log('🎯 Component data:', { friend, teams: teams?.length, friendId, error });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ModernCard variant="glass" className="bg-red-500/20 border border-red-400/30">
            <div className="p-8 text-center">
              <div className="text-8xl mb-6">⚠️</div>
              <h1 className="text-white font-bold text-3xl mb-4">Erreur de chargement</h1>
              <p className="text-red-200 mb-6">{error}</p>
              <Link to="/dashboard/friends">
                <ModernButton variant="secondary" size="lg">
                  ← Retour aux amis
                </ModernButton>
              </Link>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <ModernCard variant="glass" className="bg-orange-500/20 border border-orange-400/30">
            <div className="p-8 text-center">
              <div className="text-8xl mb-6">🚫</div>
              <h1 className="text-white font-bold text-3xl mb-4">Accès refusé</h1>
              <p className="text-orange-200 mb-6">Cet utilisateur n'est pas dans votre liste d'amis</p>
              <Link to="/dashboard/friends">
                <ModernButton variant="secondary" size="lg">
                  ← Retour aux amis
                </ModernButton>
              </Link>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  const totalPokemon = teams.reduce((total, team) => total + (team.pokemon?.length || 0), 0);
  const completeTeams = teams.filter(team => team.pokemon && team.pokemon.length === 6).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header avec animation et effets décoratifs */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
          <ModernCard variant="glass" className="relative border border-white/20">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard/friends"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white hover:scale-105"
                  >
                    <span className="text-lg">👥</span>
                    <span className="font-medium">← Amis</span>
                  </Link>
                  <span className="text-white/60">→</span>
                  <h1 className="text-white font-bold text-2xl flex items-center space-x-3">
                    <span>🏆</span>
                    <span>Équipes de {friend.username}</span>
                  </h1>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">👤 {user.username}</div>
                  <div className="text-white/70 text-sm">Visualisant: {friend.username}</div>
                </div>
              </div>
              
              {/* Informations de l'ami */}
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                  🎮
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{friend.username}</h2>
                  <p className="text-white/70">Dresseur ID: #{friend.id}</p>
                  <p className="text-white/50 text-sm">{friend.email}</p>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard variant="glass" className="bg-blue-500/20 border border-blue-400/30">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">⚔️</div>
              <div className="text-white font-bold text-3xl mb-2">{teams.length}</div>
              <div className="text-blue-200 text-sm uppercase font-medium">Équipes</div>
            </div>
          </ModernCard>

          <ModernCard variant="glass" className="bg-purple-500/20 border border-purple-400/30">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">👾</div>
              <div className="text-white font-bold text-3xl mb-2">{totalPokemon}</div>
              <div className="text-purple-200 text-sm uppercase font-medium">Pokémon Total</div>
            </div>
          </ModernCard>

          <ModernCard variant="glass" className="bg-green-500/20 border border-green-400/30">
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-white font-bold text-3xl mb-2">{completeTeams}</div>
              <div className="text-green-200 text-sm uppercase font-medium">Équipes Complètes</div>
            </div>
          </ModernCard>
        </div>

        {/* Liste des équipes */}
        {teams.length === 0 ? (
          <ModernCard variant="glass" className="bg-gray-500/20">
            <div className="p-12 text-center">
              <div className="text-8xl mb-6 opacity-50">😴</div>
              <h3 className="text-white font-bold text-2xl mb-4">Aucune équipe</h3>
              <p className="text-white/70 mb-6">
                {friend.username} n'a pas encore créé d'équipes
              </p>
              <Link to="/dashboard/teams">
                <ModernButton variant="pokemon" size="lg">
                  🛠️ Créer mes équipes
                </ModernButton>
              </Link>
            </div>
          </ModernCard>
        ) : (
          <div className="space-y-6">
            <ModernCard variant="glass" className="bg-white/10">
              <div className="p-6">
                <h2 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Équipes disponibles ({teams.length})</span>
                </h2>
              </div>
            </ModernCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => (
                <ModernCard 
                  key={team.id} 
                  variant="glass" 
                  className={cn(
                    "transition-all duration-300 hover:scale-105 cursor-pointer",
                    selectedTeam?.id === team.id 
                      ? "bg-blue-500/30 border-blue-400" 
                      : "bg-white/10 hover:bg-white/20"
                  )}
                  onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                        <span>🏆</span>
                        <span>{team.teamName}</span>
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 text-sm">#{team.id}</span>
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          team.pokemon && team.pokemon.length === 6
                            ? "bg-green-500/20 text-green-200"
                            : "bg-orange-500/20 text-orange-200"
                        )}>
                          {team.pokemon?.length || 0}/6
                        </div>
                      </div>
                    </div>

                    {team.pokemon && team.pokemon.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {team.pokemon.slice(0, 6).map((pokemon, index) => (
                          <div key={index} className="bg-white/20 rounded-lg p-2 text-center">
                            {pokemon.sprite_url && (
                              <img 
                                src={pokemon.sprite_url} 
                                alt={(pokemon as any).name || pokemon.name_fr || 'Pokemon'} 
                                className="w-8 h-8 mx-auto mb-1" 
                              />
                            )}
                            <div className="text-white text-xs font-medium truncate">
                              {(pokemon as any).name || pokemon.name_fr || 'Unknown'}
                            </div>
                            <div className="text-white/60 text-xs">
                              Nv. {pokemon.level || 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-white/50">
                        <span className="text-3xl block mb-2">❌</span>
                        <span className="text-sm">Équipe vide</span>
                      </div>
                    )}

                    {selectedTeam?.id === team.id && team.pokemon && team.pokemon.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t border-white/20">
                        <h4 className="text-white font-medium text-sm mb-2">Actions disponibles:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {team.pokemon.slice(0, 6).map((pokemon, index) => (
                            <Link 
                              key={index}
                              to={`/dashboard/pokemon/${pokemon.pokemon_id}`}
                              className="block"
                            >
                              <ModernButton 
                                variant="secondary" 
                                size="sm"
                                className="w-full text-xs"
                              >
                                👁️ Voir {(pokemon as any).name || pokemon.name_fr || 'Pokemon'}
                              </ModernButton>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center justify-center">
                      <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-xs font-medium">
                        👁️ Lecture seule
                      </div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <ModernCard variant="glass" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="p-8">
            <h3 className="text-white font-bold text-xl mb-6 flex items-center space-x-2">
              <span>⚡</span>
              <span>Actions rapides</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to={`/dashboard/battle/interactive?friendId=${friendId}`}>
                <ModernButton 
                  variant="pokemon"
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <span>⚔️</span>
                  <span>Défier {friend.username}</span>
                </ModernButton>
              </Link>
              
              <Link to="/dashboard/teams">
                <ModernButton 
                  variant="secondary"
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <span>🛠️</span>
                  <span>Mes équipes</span>
                </ModernButton>
              </Link>

              <Link to="/dashboard/friends">
                <ModernButton 
                  variant="secondary"
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <span>👥</span>
                  <span>Autres amis</span>
                </ModernButton>
              </Link>
            </div>
          </div>
        </ModernCard>

        {/* Effets décoratifs flottants */}
        <div className="fixed top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="fixed top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="fixed bottom-40 left-20 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="fixed bottom-20 right-10 w-2 h-2 bg-indigo-400/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  );
} 