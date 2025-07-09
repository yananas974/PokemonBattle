import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { battleSimulationService } from '~/services/battleSimulationService';
import type { TeamBattleRequest, BattleResult, TurnBasedResult } from '~/services/battleSimulationService';
import { useState, useEffect } from 'react';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageButton } from '~/components/VintageButton';
import { StatusIndicator } from '~/components/StatusIndicator';

export const meta: MetaFunction = () => {
  return [
    { title: 'Simulation de Combat - Pokemon Battle' },
    { name: 'description', content: 'Simuler des combats Pokemon automatiques' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Récupérer les paramètres d'URL
  const url = new URL(request.url);
  const preselectedTeam1Id = url.searchParams.get('team1');

  try {
    const teamsData = await teamService.getMyTeams(user.backendToken);
    const readyTeams = (teamsData.teams || []).filter((team: any) => 
      team.pokemon && team.pokemon.length >= 1
    );

    return json({
      user,
      teams: readyTeams,
      preselectedTeam1Id: preselectedTeam1Id ? parseInt(preselectedTeam1Id) : null
    });
  } catch (error) {
    return json({
      user,
      teams: [],
      preselectedTeam1Id: null
    });
  }
};

export default function BattleSimulation() {
  const { user, teams, preselectedTeam1Id } = useLoaderData<typeof loader>();
  const [team1, setTeam1] = useState<any>(null);
  const [team2, setTeam2] = useState<any>(null);
  const [battleType, setBattleType] = useState<'team' | 'turnbased'>('team');
  const [isSimulating, setIsSimulating] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | TurnBasedResult | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [useWeather, setUseWeather] = useState(false);

  // Pré-sélectionner l'équipe si elle est passée en paramètre
  useEffect(() => {
    if (preselectedTeam1Id && teams.length > 0) {
      const preselectedTeam = teams.find((team: any) => team.id === preselectedTeam1Id);
      if (preselectedTeam) {
        setTeam1(preselectedTeam);
      }
    }
  }, [preselectedTeam1Id, teams]);

  // Obtenir la géolocalisation au chargement
  useEffect(() => {
    if (useWeather) {
      battleSimulationService.getCurrentLocation().then(setLocation);
    }
  }, [useWeather]);

  const handleSimulateBattle = async () => {
    if (!team1 || !team2) {
      alert('Veuillez sélectionner deux équipes');
      return;
    }

    setIsSimulating(true);
    setBattleResult(null);

    try {
      const request: TeamBattleRequest = {
        team1: {
          id: team1.id,
          teamName: team1.teamName || team1.name,
          pokemon: team1.pokemon
        },
        team2: {
          id: team2.id,
          teamName: team2.teamName || team2.name,
          pokemon: team2.pokemon
        },
        ...(useWeather && location ? { lat: location.lat, lon: location.lon } : {})
      };

      let result;
      if (battleType === 'team') {
        result = await battleSimulationService.simulateTeamBattle(request, user.backendToken);
      } else {
        result = await battleSimulationService.simulateTurnBasedBattle(
          { ...request, mode: 'full' },
          user.backendToken
        );
      }

      setBattleResult(result);
    } catch (error) {
      console.error('Erreur lors de la simulation:', error);
      alert('Erreur lors de la simulation du combat');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatBattleLog = (result: BattleResult | TurnBasedResult) => {
    if ('battleLog' in result) {
      return result.battleLog;
    } else if ('combatLog' in result) {
      return result.combatLog;
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <VintageCard>
        <VintageTitle level={1}>
          ⚔️ SIMULATION DE COMBAT
        </VintageTitle>
        <p className="font-pokemon text-pokemon-blue text-sm text-center">
          SIMULEZ DES COMBATS AUTOMATIQUES ENTRE VOS ÉQUIPES
        </p>
        {preselectedTeam1Id && team1 && (
          <div className="mt-3 bg-pokemon-green text-white p-2 rounded text-center">
            <div className="font-pokemon text-xs">
              ✅ ÉQUIPE "{team1.teamName || team1.name}" PRÉ-SÉLECTIONNÉE
            </div>
          </div>
        )}
      </VintageCard>

      {/* Configuration du combat */}
      <VintageCard>
        <VintageTitle level={2}>
          ⚙️ CONFIGURATION
        </VintageTitle>
        
        <div className="space-y-4">
          {/* Type de combat */}
          <div>
            <label className="block font-pokemon text-pokemon-blue text-xs mb-2">
              TYPE DE SIMULATION
            </label>
            <div className="flex gap-2">
              <VintageButton
                variant={battleType === 'team' ? 'blue' : 'gray'}
                onClick={() => setBattleType('team')}
                className="flex-1"
              >
                🏆 COMBAT D'ÉQUIPE
              </VintageButton>
              <VintageButton
                variant={battleType === 'turnbased' ? 'blue' : 'gray'}
                onClick={() => setBattleType('turnbased')}
                className="flex-1"
              >
                🎮 TOUR PAR TOUR
              </VintageButton>
            </div>
          </div>

          {/* Effets météo */}
          <div className="flex items-center justify-between">
            <label className="font-pokemon text-pokemon-blue text-xs">
              UTILISER EFFETS MÉTÉO
            </label>
            <button
              onClick={() => setUseWeather(!useWeather)}
              className={`w-12 h-6 rounded-full transition-colors ${
                useWeather ? 'bg-pokemon-blue' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  useWeather ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {useWeather && location && (
            <div className="text-xs font-pokemon text-pokemon-green">
              📍 Géolocalisation: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
            </div>
          )}
        </div>
      </VintageCard>

      {/* Instructions et progression */}
      <VintageCard variant="highlighted">
        <div className="text-center space-y-3">
          <div className="font-pokemon text-pokemon-blue text-sm mb-2">
            📋 PROGRESSION
          </div>
          
          {/* Barre de progression */}
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-pokemon ${
              team1 ? 'bg-pokemon-blue text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {team1 ? '✓' : '1'}
            </div>
            <div className={`w-12 h-1 ${team1 ? 'bg-pokemon-blue' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-pokemon ${
              team2 ? 'bg-pokemon-red text-white' : team1 ? 'bg-yellow-400 text-black' : 'bg-gray-300 text-gray-600'
            }`}>
              {team2 ? '✓' : '2'}
            </div>
            <div className={`w-12 h-1 ${team1 && team2 ? 'bg-pokemon-green' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-pokemon ${
              team1 && team2 ? 'bg-pokemon-green text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {team1 && team2 ? '✓' : '🚀'}
            </div>
          </div>
          
          <div className="text-xs font-pokemon text-pokemon-blue-dark">
            {!team1 && !team2 && "1️⃣ SÉLECTIONNEZ D'ABORD VOTRE ÉQUIPE"}
            {team1 && !team2 && "2️⃣ MAINTENANT CHOISISSEZ L'ÉQUIPE ADVERSE"}
            {team1 && team2 && "✅ PRÊT ! CLIQUEZ SUR 'LANCER LA SIMULATION'"}
          </div>

          {/* Debug info */}
          <div className="bg-gray-100 p-2 rounded text-xs">
            <div>🔍 Debug: {teams.length} équipes disponibles</div>
            <div>Équipe 1: {team1 ? `${team1.teamName || team1.name} (ID: ${team1.id})` : 'Aucune'}</div>
            <div>Équipe 2: {team2 ? `${team2.teamName || team2.name} (ID: ${team2.id})` : 'Aucune'}</div>
            <div>Équipes adverses disponibles: {teams.filter((t: any) => t.id !== team1?.id).length}</div>
          </div>
        </div>
      </VintageCard>

      {/* Sélection des équipes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Équipe 1 */}
        <VintageCard variant={team1 ? "highlighted" : "default"}>
          <VintageTitle level={2}>
            🔵 VOTRE ÉQUIPE
          </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-xs mb-3">
            CHOISISSEZ VOTRE ÉQUIPE POUR CE COMBAT
          </p>
          
          {teams.length > 0 ? (
            <div className="space-y-3">
              {team1 ? (
                <div className="bg-pokemon-blue text-white p-3 rounded">
                  <div className="font-pokemon text-sm">
                    ✓ {team1.teamName || team1.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {team1.pokemon?.length || 0} Pokémon
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 text-gray-600 p-3 rounded border-2 border-dashed border-gray-400">
                  <div className="font-pokemon text-sm text-center">
                    👆 SÉLECTIONNEZ VOTRE ÉQUIPE
                  </div>
                  <div className="text-xs text-center opacity-75">
                    Cliquez sur une équipe ci-dessous
                  </div>
                </div>
              )}
              
              <div className="grid gap-2">
                {teams.map((team: any) => (
                  <button
                    key={team.id}
                    onClick={() => setTeam1(team)}
                    disabled={team2?.id === team.id}
                    className={`p-2 rounded border text-left transition-colors ${
                      team1?.id === team.id
                        ? 'border-pokemon-blue bg-pokemon-blue text-white'
                        : team2?.id === team.id
                        ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 hover:border-pokemon-blue'
                    }`}
                  >
                    <div className="font-pokemon text-xs">
                      {team.teamName || team.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {team.pokemon?.length || 0} Pokémon
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <StatusIndicator
              type="warning"
              title="Aucune équipe disponible"
              message="Créez des équipes pour commencer"
              icon="⚠️"
            />
          )}
        </VintageCard>

        {/* Équipe 2 */}
        <VintageCard variant={team2 ? "highlighted" : "default"}>
          <VintageTitle level={2}>
            🔴 ÉQUIPE ADVERSE
          </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-xs mb-3">
            SÉLECTIONNEZ L'ÉQUIPE QUI VOUS AFFRONTERA
          </p>
          
          {teams.length > 0 ? (
            <div className="space-y-3">
              {team2 ? (
                <div className="bg-pokemon-red text-white p-3 rounded">
                  <div className="font-pokemon text-sm">
                    ✓ {team2.teamName || team2.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {team2.pokemon?.length || 0} Pokémon
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 text-gray-600 p-3 rounded border-2 border-dashed border-gray-400">
                  <div className="font-pokemon text-sm text-center">
                    👆 SÉLECTIONNEZ UNE ÉQUIPE ADVERSE
                  </div>
                  <div className="text-xs text-center opacity-75">
                    Cliquez sur une équipe ci-dessous
                  </div>
                </div>
              )}
              
              {teams.filter((t: any) => t.id !== team1?.id).length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 p-3 rounded">
                  <div className="font-pokemon text-xs text-yellow-800 text-center">
                    ⚠️ AUCUNE ÉQUIPE ADVERSE DISPONIBLE
                  </div>
                  <div className="text-xs text-yellow-700 text-center mt-1">
                    Vous devez avoir au moins 2 équipes pour faire un combat
                  </div>
                  <div className="mt-2 text-center">
                    <VintageButton href="/dashboard/teams/create" variant="yellow" className="text-xs">
                      🏗️ CRÉER UNE AUTRE ÉQUIPE
                    </VintageButton>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2">
                  {teams.map((team: any) => {
                    const isTeam1Selected = team1?.id === team.id;
                    const isTeam2Selected = team2?.id === team.id;
                    const isDisabled = isTeam1Selected;

                    return (
                      <button
                        key={team.id}
                        onClick={() => {
                          console.log('Clic sur équipe adverse:', team.teamName || team.name, 'ID:', team.id);
                          console.log('Team1 sélectionnée:', team1?.id);
                          console.log('Est désactivé:', isDisabled);
                          if (!isDisabled) {
                            setTeam2(team);
                          }
                        }}
                        disabled={isDisabled}
                        className={`p-2 rounded border text-left transition-colors ${
                          isTeam2Selected
                            ? 'border-pokemon-red bg-pokemon-red text-white'
                            : isDisabled
                            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-pokemon-red cursor-pointer'
                        }`}
                      >
                        <div className="font-pokemon text-xs">
                          {team.teamName || team.name}
                          {isDisabled && ' (DÉJÀ SÉLECTIONNÉE)'}
                        </div>
                        <div className="text-xs opacity-75">
                          {team.pokemon?.length || 0} Pokémon
                        </div>
                        {!isDisabled && !isTeam2Selected && (
                          <div className="text-xs text-pokemon-red mt-1">
                            👆 Cliquez pour sélectionner
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <StatusIndicator
              type="warning"
              title="Aucune équipe disponible"
              message="Créez des équipes pour commencer"
              icon="⚠️"
            />
          )}
        </VintageCard>
      </div>

      {/* Bouton de simulation */}
      {team1 && team2 && (
        <div className="text-center">
          <VintageButton
            onClick={handleSimulateBattle}
            disabled={isSimulating}
            variant="green"
            className="px-8 py-4 text-lg"
          >
            {isSimulating ? '⏳ SIMULATION EN COURS...' : '🚀 LANCER LA SIMULATION'}
          </VintageButton>
        </div>
      )}

      {/* Résultats */}
      {battleResult && (
        <VintageCard variant="highlighted">
          <VintageTitle level={2}>
            🏆 RÉSULTATS DU COMBAT
          </VintageTitle>
          
          <div className="space-y-4">
            {/* Winner */}
            <div className="text-center">
              <div className="bg-pokemon-yellow text-pokemon-blue-dark p-4 rounded-lg">
                <div className="font-pokemon text-lg">
                  🏆 VAINQUEUR: {
                    'winner' in battleResult 
                      ? battleResult.winner 
                      : battleResult.battleState.winner
                  }
                </div>
                <div className="text-sm">
                  Combat terminé en {
                    'totalTurns' in battleResult 
                      ? battleResult.totalTurns 
                      : battleResult.battleState.turn
                  } tours
                </div>
              </div>
            </div>

            {/* Effets météo si présents */}
            {battleResult && 'weatherEffects' in battleResult && battleResult.weatherEffects && (
              <div className="bg-blue-50 p-3 rounded">
                <div className="font-pokemon text-xs text-blue-800 mb-2">☁️ EFFETS MÉTÉO</div>
                {battleResult.weatherEffects.map((effect, index) => (
                  <div key={index} className="text-xs text-blue-700">
                    • {effect.name}: {effect.description}
                  </div>
                ))}
              </div>
            )}

            {/* Journal de combat */}
            <div>
              <div className="font-pokemon text-pokemon-blue text-sm mb-2">
                📜 JOURNAL DE COMBAT
              </div>
              <div className="max-h-60 overflow-y-auto bg-gray-50 p-3 rounded space-y-1">
                {formatBattleLog(battleResult).map((action, index) => (
                  <div key={index} className="text-xs border-b pb-1">
                    <div className="flex justify-between items-center">
                      <span className="font-pokemon text-pokemon-blue-dark">
                        Tour {action.turn}: {action.attacker}
                      </span>
                      <span className={`text-xs ${action.isCritical ? 'text-red-600 font-bold' : ''}`}>
                        {action.damage} dégâts
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {action.move} ({action.moveType})
                      {action.isCritical && ' - CRITIQUE!'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </VintageCard>
      )}
    </div>
  );
} 