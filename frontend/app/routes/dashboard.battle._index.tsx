import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { teamService } from '~/services/teamService';
import { useEffect } from 'react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { useBattleHub } from '~/hooks/useBattleHub';
import { cn } from '~/utils/cn';



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

// Composant pour afficher une équipe
const TeamCard = ({ 
  team, 
  isSelected, 
  onSelect, 
  variant = 'player',
  getTeamStatus 
}: {
  team: any;
  isSelected: boolean;
  onSelect: (team: any) => void;
  variant?: 'player' | 'enemy';
  getTeamStatus: (team: any) => { status: string; label: string; color: string };
}) => {
  const status = getTeamStatus(team);
  const isPlayerVariant = variant === 'player';
  
  return (
    <ModernCard
      variant="glass"
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl",
        isSelected 
          ? isPlayerVariant
            ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-yellow-400 shadow-yellow-400/20 shadow-lg"
            : "bg-gradient-to-br from-red-400/20 to-pink-500/20 border-red-400 shadow-red-400/20 shadow-lg"
          : "bg-white/10 hover:bg-white/20 border-white/20"
      )}
      onClick={() => onSelect(team)}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">
            {team.teamName || team.name}
          </h3>
          <span className={cn(
            "px-3 py-1 rounded-full font-medium text-sm",
            isPlayerVariant 
              ? "bg-white/20 text-white"
              : "bg-red-500/20 text-red-200"
          )}>
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
                  ? isPlayerVariant
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg'
                    : 'bg-gradient-to-r from-red-400 to-pink-500 shadow-lg'
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
            <div className={cn("font-bold", status.color)}>
              {status.label}
            </div>
          </div>
        </div>
        
        {isSelected && (
          <div className={cn(
            "mt-4 p-3 rounded-lg border",
            isPlayerVariant
              ? "bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-yellow-400/30"
              : "bg-gradient-to-r from-red-400/20 to-pink-500/20 border-red-400/30"
          )}>
            <div className={cn(
              "flex items-center justify-center space-x-2",
              isPlayerVariant ? "text-yellow-200" : "text-red-200"
            )}>
              <span className="text-lg">✓</span>
              <span className="font-bold">
                {isPlayerVariant ? 'Équipe Sélectionnée' : 'Adversaire Sélectionné'}
              </span>
            </div>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

// Composant pour les modes de combat
const BattleModeCard = ({ 
  mode, 
  onSelect, 
  getBattleModeInfo 
}: {
  mode: 'interactive' | 'simulated';
  onSelect: (mode: 'interactive' | 'simulated') => void;
  getBattleModeInfo: (mode: 'interactive' | 'simulated') => any;
}) => {
  const info = getBattleModeInfo(mode);
  
  return (
    <ModernCard variant="glass" className={cn("bg-gradient-to-br", info.color, info.borderColor)}>
      <div className="p-8 text-center space-y-6">
        <div className={cn(
          "text-8xl",
          mode === 'interactive' ? 'animate-pulse' : 'animate-bounce'
        )}>
          {info.icon}
        </div>
        
        <div>
          <h3 className="text-white font-bold text-2xl mb-2">
            {info.title}
          </h3>
          <p className="text-white/70">
            {info.description}
          </p>
        </div>
        
        <div className="space-y-3">
          {info.features.map((feature: string, index: number) => (
            <div key={index} className="flex items-center justify-center space-x-2 text-white/60 text-sm">
              <span>⚡</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        <ModernButton
          variant="pokemon"
          size="lg"
          className="w-full"
          onClick={() => onSelect(mode)}
        >
          <span className="text-xl">
            {mode === 'interactive' ? '⚔️ Combat Interactif' : '⚡ Combat Simulé'}
          </span>
        </ModernButton>
      </div>
    </ModernCard>
  );
};

export default function BattleHub() {
  const { user, teams } = useLoaderData<typeof loader>();
  const { playDashboard } = useGlobalAudio();

  // Utilisation du hook useBattleHub
  const battleHub = useBattleHub({
    onTeamSelected: (team) => {
      console.log('🛡️ Équipe sélectionnée:', team);
    },
    onEnemySelected: (enemy) => {
      console.log('⚔️ Adversaire sélectionné:', enemy);
    },
    onBattleModeSelected: (mode) => {
      console.log('🎮 Mode de combat sélectionné:', mode);
    },
    onBattleReady: (selectedTeam, enemyTeam, mode) => {
      console.log('🚀 Prêt pour le combat:', { selectedTeam, enemyTeam, mode });
    },
    onError: (error) => {
      console.error('❌ Erreur du hub de combat:', error);
    }
  });

  // Auto-start dashboard music when component mounts
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Erreur globale */}
          {battleHub.error && (
            <ModernCard variant="glass" className="bg-red-500/20 border-red-400/30">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="text-red-200 font-bold mb-2">Erreur</h3>
                    <p className="text-red-100">{battleHub.error}</p>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

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
                      <TeamCard
                        key={team.id}
                        team={team}
                        isSelected={battleHub.selectedTeam?.id === team.id}
                        onSelect={battleHub.selectTeam}
                        variant="player"
                        getTeamStatus={battleHub.getTeamStatus}
                      />
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
          {battleHub.showEnemySelection && battleHub.selectedTeam && (
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
                    {battleHub.getAvailableEnemyTeams(teams).map((team: any) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        isSelected={battleHub.enemyTeam?.id === team.id}
                        onSelect={battleHub.selectEnemy}
                        variant="enemy"
                        getTeamStatus={battleHub.getTeamStatus}
                      />
                    ))}
                  </div>
                  
                  <div className="flex justify-center space-x-4 mt-8">
                    <ModernButton 
                      variant="secondary" 
                      size="lg"
                      onClick={battleHub.cancelEnemySelection}
                      className="inline-flex items-center space-x-2"
                    >
                      <span>↩️</span>
                      <span>Annuler</span>
                    </ModernButton>
                    
                    {battleHub.canStartBattle() && battleHub.getBattleUrl() && (
                      <ModernButton 
                        href={battleHub.getBattleUrl()!}
                        variant="pokemon"
                        size="lg"
                        className="inline-flex items-center space-x-2"
                      >
                        <span>🚀</span>
                        <span>
                          {battleHub.battleMode === 'interactive' ? 'Combat Interactif' : 'Combat Simulé'}
                        </span>
                      </ModernButton>
                    )}
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Battle Modes */}
          {!battleHub.showEnemySelection && battleHub.selectedTeam && (
            <ModernCard variant="glass" size="xl" className="shadow-2xl">
              <div className="p-8">
                <h2 className="text-white font-bold text-2xl mb-6 flex items-center space-x-3">
                  <span className="text-3xl">🎮</span>
                  <span>Modes de Combat</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BattleModeCard
                    mode="interactive"
                    onSelect={battleHub.selectBattleMode}
                    getBattleModeInfo={battleHub.getBattleModeInfo}
                  />
                  
                  <BattleModeCard
                    mode="simulated"
                    onSelect={battleHub.selectBattleMode}
                    getBattleModeInfo={battleHub.getBattleModeInfo}
                  />
                </div>
              </div>
            </ModernCard>
          )}

          {/* Selection Prompt */}
          {!battleHub.showEnemySelection && !battleHub.selectedTeam && teams.length > 0 && (
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