// Import des fonctions serveur depuis le fichier .server.ts
export { loader } from './server/dashboard.friends.$friendId.teams.server';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { cn } from '~/utils/cn';
import { useFriendTeams } from '~/hooks/useFriendTeams';
import type { 
  User,
  TeamWithPokemon,
  LoaderFriendTeamsData
} from '@pokemon-battle/shared';

// Type local pour les Pokémon dans les équipes
type TeamPokemon = {
  id: number;
  name: string;
  name_fr: string;
  type: string;
  level: number;
  sprite_url: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  pokemon_id?: number;
};

export const meta: MetaFunction = () => {
  return [
    { title: 'Équipes d\'un ami - Pokemon Battle' },
    { name: 'description', content: 'Consultez les équipes de vos amis' },
  ];
};

// Composant pour l'en-tête avec informations de l'ami
const FriendHeader = ({ user, friend }: { user: User; friend: User }) => (
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
        
        <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
            🎮
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">{friend.username}</h2>
            <p className="text-white/50 text-sm">{friend.email}</p>
          </div>
        </div>
      </div>
    </ModernCard>
  </div>
);

// Composant pour une carte d'équipe
const TeamCard = ({ 
  team, 
  getTeamStatus, 
  getTeamPokemon 
}: { 
  team: TeamWithPokemon; 
  getTeamStatus: (team: TeamWithPokemon) => any;
  getTeamPokemon: (team: TeamWithPokemon) => any[];
}) => {
  const status = getTeamStatus(team);
  const pokemon = getTeamPokemon(team);

  return (
    <ModernCard variant="glass" className="bg-white/10 hover:bg-white/20 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg flex items-center space-x-2">
            <span>🏆</span>
            <span>{team.teamName}</span>
          </h3>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              status.status === 'complete' && "bg-green-500/20 text-green-200",
              status.status === 'incomplete' && "bg-orange-500/20 text-orange-200",
              status.status === 'empty' && "bg-gray-500/20 text-gray-200"
            )}>
              {team.pokemon?.length || 0}/6
            </div>
          </div>
        </div>

        {pokemon.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {pokemon.map((poke: TeamPokemon, index: number) => (
              <div key={index} className="bg-white/20 rounded-lg p-2 text-center">
                {poke.sprite_url && (
                  <img 
                    src={poke.sprite_url} 
                    alt={poke.name_fr || poke.name || 'Pokemon'} 
                    className="w-8 h-8 mx-auto mb-1" 
                  />
                )}
                <div className="text-white text-xs font-medium truncate">
                  {poke.name_fr || poke.name || 'Unknown'}
                </div>
                <div className="text-white/60 text-xs">
                  Nv. {poke.level || 1}
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

        <div className="mt-4 flex items-center justify-center">
          <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-200 text-xs font-medium">
            👁️ Lecture seule
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

// Composant pour l'état vide
const EmptyState = ({ friend }: { friend: User }) => (
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
);

// Les fonctions loader sont importées depuis le fichier .server.ts

export default function FriendTeams() {
  const { user, friend, friendTeams, canViewTeams, error } = useLoaderData<LoaderFriendTeamsData>();
  
  const friendTeamsHook = useFriendTeams({
    friend,
    teams: friendTeams,
    friendId: friend.id,
  });

  console.log('🎯 Component data:', { friend, teams: friendTeams?.length, canViewTeams, error });

  if (error) {
    return (
      <div className="min-h-screen p-6">
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

  if (!canViewTeams) {
    return (
      <div className="min-h-screen p-6">
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <FriendHeader user={user} friend={friend} />

        {/* Liste des équipes */}
        {!friendTeamsHook.teamCategories.hasTeams ? (
          <EmptyState friend={friend} />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {friendTeams.map((team) => (
                <TeamCard
                  key={team.id} 
                  team={team}
                  getTeamStatus={friendTeamsHook.getTeamStatus}
                  getTeamPokemon={friendTeamsHook.getTeamPokemon}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 