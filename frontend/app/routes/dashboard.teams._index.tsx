import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import type { Team } from '~/types/team';
import { 
  PokemonAudioPlayer,
  VintageCard, 
  VintageButton,
  StatusIndicator,
  TeamCard
} from '~/components';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import ClientOnly from '~/components/ClientOnly';
import { cn } from '~/utils/cn';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mes Équipes - Pokédex National' },
    { name: 'description', content: 'Gérez vos équipes Pokémon et préparez vos combats stratégiques' },
  ];
};

interface LoaderData {
  user: any;
  teams: Team[];
  message?: string;
  error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await teamService.getMyTeams(request);
    
    return json({
      user,
      teams: data.teams || [],
      message: data.success ? 'Équipes chargées avec succès' : undefined
    } as unknown as LoaderData);
  } catch (error) {
    console.error('❌ Erreur lors du chargement des équipes:', error);
    
    return json({
      user,
      teams: [],
      error: 'Impossible de charger les équipes'
    } as unknown as LoaderData);
  }
};

// Composant pour les particules d'arrière-plan
const TeamParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        >
          {['👥', '⚔️', '🛡️', '⭐', '🎯', '🏆'][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );
};

// Composant pour les statistiques modernes
const ModernStatCard = ({ value, label, emoji, color }: { 
  value: number; 
  label: string; 
  emoji: string; 
  color: string; 
}) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
      <div className="text-4xl mb-2">{emoji}</div>
      <div className={cn('text-3xl font-bold mb-1', color)}>{value}</div>
      <div className="text-white text-sm opacity-75">{label}</div>
    </div>
  );
};

// Composant pour les actions rapides modernes
const ModernQuickAction = ({ title, description, emoji, href, variant }: {
  title: string;
  description: string;
  emoji: string;
  href: string;
  variant: string;
}) => {
  return (
    <Link to={href} className="group">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-white border-opacity-20">
        <div className="text-center">
          <div className="text-5xl mb-4 group-hover:animate-bounce">{emoji}</div>
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <p className="text-white opacity-75 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default function ModernTeamsIndex() {
  const data = useLoaderData<LoaderData>();
  const { teams, message, user } = data;
  const error = 'error' in data ? data.error : undefined;
  const { playDashboard } = useGlobalAudio();

  // Auto-start dashboard music
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  // Calcul des statistiques
  const totalPokemon = teams.reduce((acc, team) => acc + (team.pokemon?.length || 0), 0);
  const completeTeams = teams.filter(team => (team.pokemon?.length || 0) === 6).length;
  const activeTeams = teams.filter(team => (team.pokemon?.length || 0) > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      <PokemonAudioPlayer variant="compact" />
      
      {/* Particules d'arrière-plan */}
      <ClientOnly>
        <TeamParticles />
      </ClientOnly>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation moderne */}
        <div className="mb-6">
          <VintageButton 
            variant="modern" 
            href="/dashboard"
            className="inline-flex items-center space-x-2"
          >
            <span>🏠</span>
            <span>Retour au Dashboard</span>
          </VintageButton>
        </div>

        {/* Header principal */}
        <VintageCard variant="glass" className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 flex items-center space-x-3">
                <span>👥</span>
                <span>Mes Équipes</span>
                <span className="animate-pulse">⚡</span>
              </h1>
              <p className="text-xl text-white opacity-80">
                Gérez vos équipes Pokémon et préparez vos stratégies de combat
              </p>
              <div className="mt-4 text-white opacity-75">
                {teams.length} équipe{teams.length !== 1 ? 's' : ''} disponible{teams.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {teams.length > 0 && (
              <div className="mt-6 lg:mt-0">
                <VintageButton 
                  variant="pokemon" 
                  href="/dashboard/teams/create"
                  size="lg"
                  className="inline-flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Nouvelle Équipe</span>
                </VintageButton>
              </div>
            )}
          </div>
        </VintageCard>

        {/* Messages d'état */}
        {error && (
          <VintageCard variant="glass" className="mb-8">
            <div className="flex items-center space-x-4">
              <StatusIndicator status="error" size="lg" />
              <div>
                <h3 className="text-red-400 font-bold text-lg">Erreur de chargement</h3>
                <p className="text-white opacity-75">{error}</p>
              </div>
            </div>
          </VintageCard>
        )}

        {message && !error && (
          <VintageCard variant="glass" className="mb-8">
            <div className="flex items-center space-x-4">
              <StatusIndicator status="success" size="lg" />
              <div>
                <h3 className="text-green-400 font-bold text-lg">Succès</h3>
                <p className="text-white opacity-75">{message}</p>
              </div>
            </div>
          </VintageCard>
        )}

        {/* Statistiques des équipes */}
        {teams.length > 0 && (
          <VintageCard variant="glass" className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>📊</span>
              <span>Statistiques</span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <ModernStatCard
                value={teams.length}
                label="Équipes Créées"
                emoji="👥"
                color="text-blue-400"
              />
              <ModernStatCard
                value={totalPokemon}
                label="Pokémon Total"
                emoji="⚡"
                color="text-yellow-400"
              />
              <ModernStatCard
                value={completeTeams}
                label="Équipes Complètes"
                emoji="🏆"
                color="text-green-400"
              />
              <ModernStatCard
                value={activeTeams}
                label="Équipes Actives"
                emoji="🎯"
                color="text-purple-400"
              />
            </div>
          </VintageCard>
        )}

        {/* Actions rapides */}
        <VintageCard variant="glass" className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
            <span>🎮</span>
            <span>Actions Rapides</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ModernQuickAction
              title="Nouvelle Équipe"
              description="Créer une équipe personnalisée"
              emoji="➕"
              href="/dashboard/teams/create"
              variant="green"
            />
            <ModernQuickAction
              title="Démarrer Combat"
              description="Lancer un combat avec vos équipes"
              emoji="⚔️"
              href="/dashboard/battle"
              variant="red"
            />
            <ModernQuickAction
              title="Explorer Pokémon"
              description="Découvrir de nouveaux Pokémon"
              emoji="🔍"
              href="/dashboard/pokemon"
              variant="yellow"
            />
          </div>
        </VintageCard>

        {/* Liste des équipes ou message vide */}
        {teams.length === 0 ? (
          <VintageCard variant="glass" className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">👥</div>
            <h3 className="text-4xl font-bold text-white mb-4">Aucune équipe créée</h3>
            <p className="text-xl text-white opacity-75 mb-8 max-w-md mx-auto">
              Créez votre première équipe pour commencer vos aventures Pokémon et affronter d'autres dresseurs
            </p>
            <VintageButton 
              variant="pokemon" 
              href="/dashboard/teams/create"
              size="xl"
              className="inline-flex items-center space-x-3"
            >
              <span>➕</span>
              <span>Créer ma première équipe</span>
            </VintageButton>
          </VintageCard>
        ) : (
          <VintageCard variant="glass">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>🏆</span>
              <span>Mes Équipes ({teams.length})</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team: Team) => (
                <div key={team.id} className="group">
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-white border-opacity-20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xl truncate">
                        {team.teamName}
                      </h3>
                      <StatusIndicator 
                        status={(team.pokemon?.length || 0) === 6 ? "success" : "warning"} 
                        label={`${team.pokemon?.length || 0}/6`}
                        showLabel
                      />
                    </div>
                    
                    {/* Pokémon de l'équipe */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Array.from({ length: 6 }).map((_, index) => {
                        const pokemon = team.pokemon?.[index];
                        return (
                          <div 
                            key={index}
                            className="aspect-square bg-white bg-opacity-10 rounded-lg flex items-center justify-center"
                          >
                            {pokemon ? (
                              <img 
                                src={pokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                alt={pokemon.name_fr}
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <span className="text-white opacity-30 text-2xl">?</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Actions de l'équipe */}
                    <div className="flex space-x-2">
                      <VintageButton 
                        variant="water" 
                        href={`/dashboard/teams/${team.id}`}
                        size="sm"
                        fullWidth
                      >
                        👁️ Voir
                      </VintageButton>
                      <VintageButton 
                        variant="grass" 
                        href={`/dashboard/teams/${team.id}/select-pokemon`}
                        size="sm"
                        fullWidth
                      >
                        ✏️ Modifier
                      </VintageButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </VintageCard>
        )}
      </div>
    </div>
  );
} 