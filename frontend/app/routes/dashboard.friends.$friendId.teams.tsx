import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { friendshipService } from '~/services/friendshipService';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageButton } from '~/components/VintageButton';
import { StatusIndicator } from '~/components/StatusIndicator';
import { TeamCard } from '~/components/TeamCard';
import type { Team } from '~/types/team';

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
    // Récupérer les informations de l'ami
    const friendsResponse = await friendshipService.getFriends(request);
    const friend = friendsResponse.friends.find(f => 
      f.friend?.id === friendIdNumber
    );

    if (!friend) {
      throw new Response('Friend not found or not authorized', { status: 404 });
    }

    // Récupérer les équipes de l'ami
    const teamsResponse = await friendshipService.getFriendTeams(friendIdNumber, request);
    
    console.log('🔍 Teams response:', JSON.stringify(teamsResponse, null, 2));
    console.log('🔍 Teams data:', teamsResponse.teams);
    console.log('🔍 Teams length:', teamsResponse.teams?.length || 0);

    return json({
      user,
      friend: friend.friend,
      teams: teamsResponse.teams as Team[],
      friendId: friendIdNumber
    });
  } catch (error) {
    console.error('Error loading friend teams:', error);
    return json({
      user,
      friend: null,
      teams: [],
      friendId: friendIdNumber,
      error: 'Impossible de charger les équipes de cet ami'
    });
  }
};

export default function FriendTeams() {
  const data = useLoaderData<typeof loader>();
  const { friend, teams, friendId } = data;
  const error = 'error' in data ? data.error : undefined;

  console.log('🎯 Component data:', { friend, teams, friendId, error });
  console.log('🎯 Teams in component:', teams);
  console.log('🎯 Teams length in component:', teams?.length || 0);

  if (error) {
    return (
      <div className="space-y-6">
        <VintageCard>
          <VintageTitle level={1}>
            ⚠️ ERREUR
          </VintageTitle>
          <StatusIndicator
            type="error"
            title="Erreur de chargement"
            message={error}
          />
          <div className="mt-4">
            <VintageButton href="/dashboard/friends" variant="blue">
              ← RETOUR AUX AMIS
            </VintageButton>
          </div>
        </VintageCard>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="space-y-6">
        <VintageCard>
          <VintageTitle level={1}>
            🚫 ACCÈS REFUSÉ
          </VintageTitle>
          <StatusIndicator
            type="warning"
            title="Ami introuvable"
            message="Cet utilisateur n'est pas dans votre liste d'amis"
          />
          <div className="mt-4">
            <VintageButton href="/dashboard/friends" variant="blue">
              ← RETOUR AUX AMIS
            </VintageButton>
          </div>
        </VintageCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec infos de l'ami */}
      <VintageCard>
        <VintageTitle level={1} animated>
          👥 ÉQUIPES DE {friend.username.toUpperCase()}
        </VintageTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-pokemon text-pokemon-blue-dark text-sm">
                DRESSEUR: {friend.username}
              </p>
              <p className="font-pokemon text-pokemon-blue text-xs">
                ID: #{friend.id}
              </p>
            </div>
          </div>
          <VintageButton href="/dashboard/friends" variant="gray" size="sm">
            ← RETOUR
          </VintageButton>
        </div>
      </VintageCard>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VintageCard padding="sm" variant="compact">
          <div className="text-center">
            <div className="text-2xl mb-2 text-pokemon-yellow">⚔️</div>
            <div className="font-pokemon text-lg text-pokemon-blue-dark">
              {teams.length}
            </div>
            <div className="font-pokemon text-xs text-pokemon-blue uppercase">
              ÉQUIPES
            </div>
          </div>
        </VintageCard>

        <VintageCard padding="sm" variant="compact">
          <div className="text-center">
            <div className="text-2xl mb-2 text-pokemon-yellow">👾</div>
            <div className="font-pokemon text-lg text-pokemon-blue-dark">
              {teams.reduce((total, team) => total + (team.pokemon?.length || 0), 0)}
            </div>
            <div className="font-pokemon text-xs text-pokemon-blue uppercase">
              POKÉMON
            </div>
          </div>
        </VintageCard>

        <VintageCard padding="sm" variant="compact">
          <div className="text-center">
            <div className="text-2xl mb-2 text-pokemon-yellow">🏆</div>
            <div className="font-pokemon text-lg text-pokemon-blue-dark">
              {teams.filter(team => team.pokemon && team.pokemon.length === 6).length}
            </div>
            <div className="font-pokemon text-xs text-pokemon-blue uppercase">
              COMPLÈTES
            </div>
          </div>
        </VintageCard>
      </div>

      {/* Liste des équipes */}
      {teams.length === 0 ? (
        <VintageCard>
          <div className="text-center py-8">
            <div className="text-6xl mb-4 text-pokemon-yellow opacity-50">😴</div>
            <VintageTitle level={2}>
              AUCUNE ÉQUIPE
            </VintageTitle>
            <p className="font-pokemon text-pokemon-blue text-sm mt-2">
              {friend.username} n'a pas encore créé d'équipes
            </p>
          </div>
        </VintageCard>
      ) : (
        <div className="space-y-4">
          <VintageTitle level={2}>
            📋 ÉQUIPES DISPONIBLES ({teams.length})
          </VintageTitle>
          
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {teams.map((team) => (
               <div key={team.id} className="relative">
                 <VintageCard>
                   <VintageTitle level={3}>
                     🏆 {team.teamName}
                   </VintageTitle>
                   <div className="space-y-2">
                     <p className="font-pokemon text-pokemon-blue text-xs">
                       ID: #{team.id} | POKÉMON: {team.pokemon?.length || 0}/6
                     </p>
                     {team.pokemon && team.pokemon.length > 0 ? (
                       <div className="grid grid-cols-2 gap-2">
                                                   {team.pokemon.slice(0, 6).map((pokemon, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-pokemon-cream rounded">
                              <div className="flex items-center space-x-2">
                                {pokemon.sprite_url && (
                                  <img 
                                    src={pokemon.sprite_url} 
                                    alt={(pokemon as any).name || pokemon.name_fr || 'Pokemon'} 
                                    className="w-8 h-8" 
                                  />
                                )}
                                <div>
                                  <span className="font-pokemon text-xs text-pokemon-blue-dark block">
                                    {(pokemon as any).name || pokemon.name_fr || 'Unknown'}
                                  </span>
                                  <span className="font-pokemon text-xs text-pokemon-blue opacity-60">
                                    Nv. {pokemon.level || 1}
                                  </span>
                                </div>
                              </div>
                              <VintageButton 
                                href={`/dashboard/pokemon/${pokemon.pokemon_id}`}
                                variant="blue" 
                                size="sm"
                                className="px-2 py-1 text-xs"
                              >
                                👁️
                              </VintageButton>
                            </div>
                          ))}
                       </div>
                     ) : (
                       <div className="text-center py-4 text-pokemon-blue opacity-60">
                         <span className="text-2xl block mb-1">❌</span>
                         <span className="font-pokemon text-xs">ÉQUIPE VIDE</span>
                       </div>
                     )}
                     <div className="bg-pokemon-yellow text-pokemon-blue-dark px-2 py-1 rounded font-pokemon text-xs text-center">
                       👁️ LECTURE SEULE
                     </div>
                   </div>
                 </VintageCard>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Actions rapides */}
      <VintageCard>
        <VintageTitle level={3}>
          ⚡ ACTIONS RAPIDES
        </VintageTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VintageButton 
            href={`/battle/interactive?friendId=${friendId}`} 
            variant="red"
            className="flex items-center justify-center space-x-2"
          >
            <span>⚔️</span>
            <span>DÉFIER {friend.username.toUpperCase()}</span>
          </VintageButton>
          
          <VintageButton 
            href="/dashboard/teams" 
            variant="green"
            className="flex items-center justify-center space-x-2"
          >
            <span>🛠️</span>
            <span>MES ÉQUIPES</span>
          </VintageButton>
        </div>
      </VintageCard>
    </div>
  );
} 