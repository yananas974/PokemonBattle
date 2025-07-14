import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { teamService } from '~/services/teamService';
import { useState, useEffect } from 'react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { cn } from '~/utils/cn';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat - Pokemon Battle' },
    { name: 'description', content: 'Hub de combat Pokemon - Combat interactif et simulé' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const teamsData = await teamService.getMyTeams(user.backendToken);
    const readyTeams = (teamsData.teams || []).filter((team: any) => 
      team.pokemon && team.pokemon.length >= 3
    );

    return json({
      user,
      teams: readyTeams
    });
  } catch (error) {
    return json({
      user,
      teams: []
    });
  }
};

export default function BattleHub() {
  const { user, teams } = useLoaderData<typeof loader>();
  const { playDashboard } = useGlobalAudio();
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [enemyTeam, setEnemyTeam] = useState<any>(null);
  const [showEnemySelection, setShowEnemySelection] = useState(false);
  const [battleMode, setBattleMode] = useState<'interactive' | 'simulated' | null>(null);

  // Auto-start dashboard music when component mounts
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Team Selection */}
          <ModernCard variant="glass" size="xl" className="shadow-2xl">
            <div className="p-8">
              <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-3">
                <span className="text-3xl">🛡️</span>
                <span>Sélection d'Équipe</span>
              </h2>
              
              {teams.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-white/70 text-lg">
                    Choisissez votre équipe pour commencer le combat
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team: any) => (
                      <ModernCard
                        key={team.id}
                        variant="glass"
                        className={cn(
                          "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
                          selectedTeam?.id === team.id 
                            ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400 shadow-yellow-400/20 shadow-lg" 
                            : "bg-white/10 hover:bg-white/20 border-white/20"
                        )}
                        onClick={() => setSelectedTeam(team)}
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">
                              {team.teamName || team.name}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-medium text-sm">
                              {team.pokemon?.length || 0}/6
                            </span>
                          </div>
                          
                          {/* Pokemon indicators */}
                          <div className="flex items-center space-x-2">
                            {[...Array(6)].map((_, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "w-4 h-4 rounded-full transition-all duration-200",
                                  index < (team.pokemon?.length || 0)
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg'
                                    : 'bg-white/20'
                                )}
                              />
                            ))}
                          </div>
                          
                          {/* Team stats */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-white/70">Pokémon</div>
                              <div className="text-white font-bold">{team.pokemon?.length || 0}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white/70">Statut</div>
                              <div className={cn(
                                "font-bold",
                                (team.pokemon?.length || 0) >= 6 ? "text-green-400" : 
                                (team.pokemon?.length || 0) >= 3 ? "text-yellow-400" : "text-red-400"
                              )}>
                                {(team.pokemon?.length || 0) >= 6 ? "Complète" : 
                                 (team.pokemon?.length || 0) >= 3 ? "Prête" : "Incomplète"}
                              </div>
                            </div>
                          </div>
                          
                          {selectedTeam?.id === team.id && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
                              <div className="flex items-center justify-center space-x-2 text-yellow-200">
                                <span className="text-lg">✓</span>
                                <span className="font-bold">Équipe Sélectionnée</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-8xl mb-6 opacity-50">⚠️</div>
                  <h3 className="text-white font-bold text-2xl mb-4">Aucune équipe prête</h3>
                  <p className="text-white/70 text-lg mb-8">
                    Vous devez créer une équipe avec au moins 3 Pokémon pour commencer un combat
                  </p>
                  <ModernButton
                    href="/dashboard/teams/create"
                    variant="pokemon"
                    size="lg"
                    className="inline-flex items-center space-x-2"
                  >
                    <span>🏗️</span>
                    <span>Créer une Équipe</span>
                  </ModernButton>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Enemy Team Selection */}
          {showEnemySelection && selectedTeam && (
            <ModernCard variant="glass" size="xl" className="shadow-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-400/30">
              <div className="p-8">
                <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-3">
                  <span className="text-3xl">⚔️</span>
                  <span>Sélection d'Adversaire</span>
                </h2>
                
                <div className="space-y-6">
                  <p className="text-white/70 text-lg">
                    Choisissez une équipe comme adversaire
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.filter(team => team.id !== selectedTeam.id).map((team: any) => (
                      <ModernCard
                        key={team.id}
                        variant="glass"
                        className={cn(
                          "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
                          enemyTeam?.id === team.id 
                            ? "bg-gradient-to-br from-red-400/20 to-pink-500/20 border-red-400 shadow-red-400/20 shadow-lg" 
                            : "bg-white/10 hover:bg-white/20 border-white/20"
                        )}
                        onClick={() => setEnemyTeam(team)}
                      >
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">
                              {team.teamName || team.name}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-200 font-medium text-sm">
                              {team.pokemon?.length || 0}/6
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {[...Array(6)].map((_, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "w-4 h-4 rounded-full transition-all duration-200",
                                  index < (team.pokemon?.length || 0)
                                    ? 'bg-gradient-to-r from-red-400 to-pink-500 shadow-lg'
                                    : 'bg-white/20'
                                )}
                              />
                            ))}
                          </div>
                          
                          {enemyTeam?.id === team.id && (
                            <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-red-400/20 to-pink-500/20 border border-red-400/30">
                              <div className="flex items-center justify-center space-x-2 text-red-200">
                                <span className="text-lg">✓</span>
                                <span className="font-bold">Adversaire Sélectionné</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </ModernCard>
                    ))}
                  </div>
                  
                  <div className="flex justify-center space-x-4 mt-8">
                    <ModernButton 
                      variant="secondary" 
                      size="lg"
                      onClick={() => {
                        setShowEnemySelection(false);
                        setEnemyTeam(null);
                        setBattleMode(null);
                      }}
                      className="inline-flex items-center space-x-2"
                    >
                      <span>↩️</span>
                      <span>Annuler</span>
                    </ModernButton>
                    
                    {enemyTeam && battleMode && (
                      <ModernButton 
                        href={
                          battleMode === 'interactive' 
                            ? `/dashboard/battle/interactive?playerTeamId=${selectedTeam.id}&enemyTeamId=${enemyTeam.id}`
                            : `/dashboard/battle/simulate?playerTeamId=${selectedTeam.id}&enemyTeamId=${enemyTeam.id}`
                        }
                        variant="pokemon"
                        size="lg"
                        className="inline-flex items-center space-x-2"
                      >
                        <span>🚀</span>
                        <span>
                          {battleMode === 'interactive' ? 'Combat Interactif' : 'Combat Simulé'}
                        </span>
                      </ModernButton>
                    )}
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Battle Modes */}
          {!showEnemySelection && selectedTeam && (
            <ModernCard variant="glass" size="xl" className="shadow-2xl">
              <div className="p-8">
                <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-3">
                  <span className="text-3xl">🎮</span>
                  <span>Modes de Combat</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Interactive Battle */}
                  <ModernCard variant="glass" className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/30">
                    <div className="p-8 text-center space-y-6">
                      <div className="text-8xl animate-pulse">🎮</div>
                      
                      <div>
                        <h3 className="text-white font-bold text-2xl mb-2">
                          Combat Interactif
                        </h3>
                        <p className="text-white/70">
                          Contrôlez chaque attaque de vos Pokémon et combattez contre une autre équipe
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>⚡</span>
                          <span>Combat en temps réel</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>🎯</span>
                          <span>Stratégie requise</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>🏆</span>
                          <span>Expérience immersive</span>
                        </div>
                      </div>
                      
                      <ModernButton
                        variant="pokemon"
                        size="lg"
                        className="w-full"
                        onClick={() => {
                          setBattleMode('interactive');
                          setShowEnemySelection(true);
                        }}
                      >
                        <span className="text-xl">⚔️ Combat Interactif</span>
                      </ModernButton>
                    </div>
                  </ModernCard>

                  {/* Simulated Battle */}
                  <ModernCard variant="glass" className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/30">
                    <div className="p-8 text-center space-y-6">
                      <div className="text-8xl animate-bounce">⚡</div>
                      
                      <div>
                        <h3 className="text-white font-bold text-2xl mb-2">
                          Combat Simulé
                        </h3>
                        <p className="text-white/70">
                          Combat automatique rapide avec résultat instantané
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>⚡</span>
                          <span>Résultat instantané</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>🤖</span>
                          <span>Combat automatique</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                          <span>📊</span>
                          <span>Statistiques détaillées</span>
                        </div>
                      </div>
                      
                      <ModernButton
                        variant="pokemon"
                        size="lg"
                        className="w-full"
                        onClick={() => {
                          setBattleMode('simulated');
                          setShowEnemySelection(true);
                        }}
                      >
                        <span className="text-xl">⚡ Combat Simulé</span>
                      </ModernButton>
                    </div>
                  </ModernCard>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Selection Prompt */}
          {!showEnemySelection && !selectedTeam && teams.length > 0 && (
            <ModernCard variant="glass" className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
              <div className="p-12 text-center">
                <div className="text-8xl mb-6 opacity-50 animate-pulse">🎯</div>
                <h3 className="text-white font-bold text-2xl mb-4">
                  Sélectionnez votre Équipe
                </h3>
                <p className="text-white/70 text-lg">
                  Choisissez une équipe ci-dessus pour accéder aux modes de combat
                </p>
              </div>
            </ModernCard>
          )}
        </div>
      </div>
    </div>
  );
} 