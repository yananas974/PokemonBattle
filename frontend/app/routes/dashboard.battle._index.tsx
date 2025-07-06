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
    { name: 'description', content: 'Hub de combat Pokemon - Combat interactif et simulé' },
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
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [enemyTeam, setEnemyTeam] = useState<any>(null);
  const [showEnemySelection, setShowEnemySelection] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header de combat */}
      
     

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

      {/* Sélection d'équipe ennemie */}
      {showEnemySelection && selectedTeam && (
        <VintageCard variant="highlighted">
          <VintageTitle level={2}>
            ⚔️ ÉQUIPE ENNEMIE
          </VintageTitle>
          
          <div className="space-y-3">
            <p className="font-pokemon text-pokemon-blue text-xs">
              CHOISISSEZ UNE ÉQUIPE COMME ADVERSAIRE
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
                      <span className="font-pokemon text-xs text-pokemon-red">
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

      {/* Modes de combat simplifiés */}
      {!showEnemySelection && selectedTeam && (
        <VintageCard>
          <VintageTitle level={2}>
            🎮 MODES DE COMBAT
          </VintageTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Combat Interactif */}
            <VintageCard padding="lg" className="text-center">
              <div className="space-y-4">
                <div className="text-6xl">🎮</div>
                
                <VintageTitle level={3}>
                  COMBAT INTERACTIF
                </VintageTitle>
                
                <p className="font-pokemon text-xs text-pokemon-blue">
                  CONTRÔLEZ CHAQUE ATTAQUE DE VOS POKÉMON<br/>
                  COMBATTEZ CONTRE UNE AUTRE ÉQUIPE
                </p>
                
                <VintageButton
                  variant="red"
                  className="w-full py-4"
                  onClick={() => setShowEnemySelection(true)}
                >
                  <span className="text-lg">⚔️ COMBAT INTERACTIF</span>
                </VintageButton>
              </div>
            </VintageCard>

            {/* Combat Simulé */}
            <VintageCard padding="lg" className="text-center">
              <div className="space-y-4">
                <div className="text-6xl">⚡</div>
                
                <VintageTitle level={3}>
                  COMBAT SIMULÉ
                </VintageTitle>
                
                <p className="font-pokemon text-xs text-pokemon-blue">
                  COMBAT AUTOMATIQUE RAPIDE<br/>
                  RÉSULTAT INSTANTANÉ
                </p>
                
                <VintageButton
                  variant="yellow"
                  className="w-full py-4"
                  onClick={() => {
                    // TODO: Implémenter combat simulé
                    alert('Combat simulé bientôt disponible !');
                  }}
                >
                  <span className="text-lg">🏃‍♂️ COMBAT SIMULÉ</span>
                </VintageButton>
              </div>
            </VintageCard>
          </div>
        </VintageCard>
      )}

      {/* Message si aucune équipe sélectionnée */}
      {!showEnemySelection && !selectedTeam && teams.length > 0 && (
        <VintageCard>
          <div className="text-center py-8">
            <div className="text-6xl mb-4 text-pokemon-blue opacity-50">🎯</div>
            <VintageTitle level={3}>
              SÉLECTIONNEZ VOTRE ÉQUIPE
            </VintageTitle>
            <p className="font-pokemon text-pokemon-blue text-sm mt-2">
              CHOISISSEZ UNE ÉQUIPE CI-DESSUS POUR ACCÉDER AUX MODES DE COMBAT
            </p>
          </div>
        </VintageCard>
      )}

      {/* Actions rapides */}
      <VintageCard>
        <VintageTitle level={3}>
          ⚡ ACTIONS RAPIDES
        </VintageTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <VintageButton 
            href="/dashboard/teams" 
            variant="blue"
            className="flex items-center justify-center space-x-2"
          >
            <span>👥</span>
            <span>GÉRER MES ÉQUIPES</span>
          </VintageButton>
          
          <VintageButton 
            href="/dashboard/pokemon" 
            variant="green"
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