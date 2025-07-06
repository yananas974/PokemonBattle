import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { useState, useEffect } from 'react';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageButton } from '~/components/VintageButton';
import { StatCard } from '~/components/StatCard';
import { StatusIndicator } from '~/components/StatusIndicator';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat - Pokemon Battle' },
    { name: 'description', content: 'Hub de combat Pokemon - Matchmaking et gestion des combats' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
      teams: readyTeams,
      stats: {
        totalBattles: 0,
        winRate: 0,
        activeBattles: 0,
        rank: 'Débutant'
      }
    });
  } catch (error) {
    return json({
      user,
      teams: [],
      stats: { totalBattles: 0, winRate: 0, activeBattles: 0, rank: 'Débutant' }
    });
  }
};

export default function BattleHub() {
  const { user, teams, stats } = useLoaderData<typeof loader>();
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [enemyTeam, setEnemyTeam] = useState<any>(null);
  const [showEnemySelection, setShowEnemySelection] = useState(false);

  const battleModes = [
    {
      id: 'ranked',
      title: 'COMBAT CLASSÉ',
      description: 'Combattez pour monter dans le classement',
      icon: '🏆',
      variant: 'yellow' as const,
      href: '/battle/ranked',
      needsEnemy: false
    },
    {
      id: 'casual',
      title: 'COMBAT AMICAL',
      description: 'Combat décontracté sans impact sur le rang',
      icon: '⚔️',
      variant: 'blue' as const,
      href: '/battle/casual',
      needsEnemy: false
    },
    {
      id: 'ai',
      title: 'ENTRAÎNEMENT IA',
      description: 'Pratiquez contre une intelligence artificielle',
      icon: '🤖',
      variant: 'green' as const,
      href: '/battle/ai',
      needsEnemy: false
    },
    {
      id: 'interactive',
      title: 'COMBAT INTERACTIF',
      description: 'Combat temps réel avec des équipes',
      icon: '🎮',
      variant: 'red' as const,
      href: '/dashboard/battle/interactive',
      needsEnemy: true
    }
  ];

  const getHref = (mode: any) => {
    if (mode.needsEnemy && selectedTeam && enemyTeam) {
      return `${mode.href}?playerTeamId=${selectedTeam.id}&enemyTeamId=${enemyTeam.id}`;
    } else if (!mode.needsEnemy && selectedTeam) {
      return `${mode.href}?teamId=${selectedTeam.id}`;
    }
    return undefined;
  };

  const handleModeClick = (mode: any) => {
    if (mode.needsEnemy && selectedTeam && !enemyTeam) {
      setShowEnemySelection(true);
      return;
    }
    // Le lien se chargera du reste
  };

  return (
    <div className="space-y-6">
      {/* Header de combat */}
      <VintageCard variant="highlighted">
        <div className="flex items-center justify-between">
          <div>
            <VintageTitle level={1} animated>
              ⚔️ HUB DE COMBAT
            </VintageTitle>
            <p className="font-pokemon text-pokemon-blue text-sm mt-2">
              CHOISISSEZ VOTRE MODE DE COMBAT ET VOTRE ÉQUIPE
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-pokemon text-pokemon-yellow mb-1">
              {stats.rank.toUpperCase()}
            </div>
            <div className="font-pokemon text-xs text-pokemon-blue uppercase">
              RANG ACTUEL
            </div>
          </div>
        </div>
      </VintageCard>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon="⚔️"
          value={stats.totalBattles}
          label="COMBATS"
          variant="compact"
        />
        <StatCard
          icon="🏆"
          value={`${stats.winRate}%`}
          label="VICTOIRES"
          variant="compact"
        />
        <StatCard
          icon="🔥"
          value={stats.activeBattles}
          label="ACTIFS"
          variant="compact"
        />
        <StatCard
          icon="👥"
          value={teams.length}
          label="ÉQUIPES"
          variant="compact"
        />
      </div>

      {/* Sélection d'équipe du joueur */}
      <VintageCard>
        <VintageTitle level={2}>
          🛡️ VOTRE ÉQUIPE
        </VintageTitle>
        
        {teams.length > 0 ? (
          <div className="space-y-3">
            <p className="font-pokemon text-pokemon-blue text-xs">
              SÉLECTIONNEZ VOTRE ÉQUIPE POUR COMMENCER LE COMBAT
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team: any) => (
                <VintageCard
                  key={team.id}
                  variant={selectedTeam?.id === team.id ? "highlighted" : "default"}
                  className="cursor-pointer transition-all duration-200 hover:scale-105"
                  padding="sm"
                >
                  <div 
                    onClick={() => setSelectedTeam(team)}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-pokemon text-pokemon-blue-dark text-sm uppercase">
                        {team.teamName || team.name}
                      </h3>
                      <span className="font-pokemon text-xs text-pokemon-yellow">
                        {team.pokemon?.length || 0}/6
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index < (team.pokemon?.length || 0)
                              ? 'bg-pokemon-yellow'
                              : 'bg-pokemon-blue opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="font-pokemon text-xs text-pokemon-blue">
                      {team.pokemon?.length >= 3 ? 'PRÊT AU COMBAT' : 'ÉQUIPE INCOMPLÈTE'}
                    </p>
                    
                    {selectedTeam?.id === team.id && (
                      <div className="bg-pokemon-yellow text-pokemon-blue-dark px-2 py-1 rounded font-pokemon text-xs text-center">
                        ✓ ÉQUIPE SÉLECTIONNÉE
                      </div>
                    )}
                  </div>
                </VintageCard>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <StatusIndicator
              type="warning"
              title="Aucune équipe prête"
              message="Vous devez créer une équipe avec au moins 3 Pokémon pour commencer un combat"
              icon="⚠️"
            />
            <div className="mt-4">
              <VintageButton href="/dashboard/teams/create" variant="green">
                🏗️ CRÉER UNE ÉQUIPE
              </VintageButton>
            </div>
          </div>
        )}
      </VintageCard>

      {/* Sélection d'équipe ennemie (pour combat interactif) */}
      {showEnemySelection && selectedTeam && (
        <VintageCard variant="highlighted">
          <VintageTitle level={2}>
            ⚔️ ÉQUIPE ENNEMIE
          </VintageTitle>
          
          <div className="space-y-3">
            <p className="font-pokemon text-pokemon-blue text-xs">
              CHOISISSEZ UNE ÉQUIPE COMME ADVERSAIRE POUR LE COMBAT INTERACTIF
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.filter(team => team.id !== selectedTeam.id).map((team: any) => (
                <VintageCard
                  key={team.id}
                  variant={enemyTeam?.id === team.id ? "highlighted" : "default"}
                  className="cursor-pointer transition-all duration-200 hover:scale-105"
                  padding="sm"
                >
                  <div 
                    onClick={() => setEnemyTeam(team)}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-pokemon text-pokemon-blue-dark text-sm uppercase">
                        {team.teamName || team.name}
                      </h3>
                      <span className="font-pokemon text-xs text-pokemon-yellow">
                        {team.pokemon?.length || 0}/6
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className={`w-3 h-3 rounded-full ${
                            index < (team.pokemon?.length || 0)
                              ? 'bg-pokemon-red'
                              : 'bg-pokemon-blue opacity-30'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="font-pokemon text-xs text-pokemon-blue">
                      ÉQUIPE ENNEMIE
                    </p>
                    
                    {enemyTeam?.id === team.id && (
                      <div className="bg-pokemon-red text-white px-2 py-1 rounded font-pokemon text-xs text-center">
                        ✓ ADVERSAIRE SÉLECTIONNÉ
                      </div>
                    )}
                  </div>
                </VintageCard>
              ))}
            </div>
            
            <div className="flex justify-center space-x-4 mt-4">
              <VintageButton 
                variant="gray" 
                onClick={() => {
                  setShowEnemySelection(false);
                  setEnemyTeam(null);
                }}
              >
                ↩️ ANNULER
              </VintageButton>
              
              {enemyTeam && (
                <VintageButton 
                  href={`/dashboard/battle/interactive?playerTeamId=${selectedTeam.id}&enemyTeamId=${enemyTeam.id}`}
                  variant="red"
                >
                  🚀 COMMENCER LE COMBAT
                </VintageButton>
              )}
            </div>
          </div>
        </VintageCard>
      )}

      {/* Modes de combat */}
      {!showEnemySelection && (
        <VintageCard>
          <VintageTitle level={2}>
            🎮 MODES DE COMBAT
          </VintageTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {battleModes.map((mode) => {
              const isInteractive = mode.id === 'interactive';
              const isReady = selectedTeam && (!isInteractive || enemyTeam);
              const needsEnemySelection = isInteractive && selectedTeam && !enemyTeam;
              
              return (
                <VintageCard key={mode.id} padding="sm" className="text-center">
                  <div className="space-y-3">
                    <div className="text-4xl mb-2">{mode.icon}</div>
                    
                    <VintageTitle level={3}>
                      {mode.title}
                    </VintageTitle>
                    
                    <p className="font-pokemon text-xs text-pokemon-blue">
                      {mode.description.toUpperCase()}
                    </p>
                    
                    <VintageButton
                      href={isReady ? getHref(mode) : undefined}
                      variant={selectedTeam ? mode.variant : 'gray'}
                      className="w-full"
                      disabled={!selectedTeam}
                      onClick={needsEnemySelection ? () => handleModeClick(mode) : undefined}
                    >
                      {!selectedTeam ? (
                        <>
                          <span className="mr-2">⚠️</span>
                          <span>SÉLECTIONNEZ UNE ÉQUIPE</span>
                        </>
                      ) : needsEnemySelection ? (
                        <>
                          <span className="mr-2">👥</span>
                          <span>CHOISIR ADVERSAIRE</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🚀</span>
                          <span>COMMENCER</span>
                        </>
                      )}
                    </VintageButton>
                  </div>
                </VintageCard>
              );
            })}
          </div>
        </VintageCard>
      )}

      {/* Statistiques détaillées */}
      <VintageCard>
        <VintageTitle level={2}>
          📊 HISTORIQUE DE COMBAT
        </VintageTitle>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4 text-pokemon-yellow opacity-50">📈</div>
          <VintageTitle level={3}>
            SECTION EN DÉVELOPPEMENT
          </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-sm mt-2">
            L'HISTORIQUE DÉTAILLÉ SERA BIENTÔT DISPONIBLE
          </p>
        </div>
      </VintageCard>

      {/* Actions rapides */}
      <VintageCard>
        <VintageTitle level={3}>
          ⚡ ACTIONS RAPIDES
        </VintageTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <VintageButton 
            href="/dashboard/teams" 
            variant="blue"
            className="flex items-center justify-center space-x-2"
          >
            <span>👥</span>
            <span>MES ÉQUIPES</span>
          </VintageButton>
          
          <VintageButton 
            href="/dashboard/friends" 
            variant="green"
            className="flex items-center justify-center space-x-2"
          >
            <span>🤝</span>
            <span>MES AMIS</span>
          </VintageButton>
          
          <VintageButton 
            href="/dashboard/pokemon" 
            variant="yellow"
            className="flex items-center justify-center space-x-2"
          >
            <span>🎯</span>
            <span>POKÉDEX</span>
          </VintageButton>
        </div>
      </VintageCard>
    </div>
  );
} 