import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { battleSimulationService } from '~/services/battleSimulationService';
import type { TeamBattleRequest, BattleResult, TurnBasedResult } from '~/services/battleSimulationService';
import { useState, useEffect } from 'react';
import { ModernPokemonCard, ModernBattleInterface } from "~/components/modern";
import "~/styles/pokemon-modern.css";

export const meta: MetaFunction = () => {
  return [
    { title: 'Simulation de Combat Pokemon - Version Moderne' },
    { name: 'description', content: 'Interface moderne pour simuler des combats Pokemon' },
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

export default function ModernBattleSimulation() {
  const { user, teams, preselectedTeam1Id } = useLoaderData<typeof loader>();
  const [team1, setTeam1] = useState<any>(null);
  const [team2, setTeam2] = useState<any>(null);
  const [battleType, setBattleType] = useState<'team' | 'turnbased'>('team');
  const [isSimulating, setIsSimulating] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | TurnBasedResult | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [useWeather, setUseWeather] = useState(false);
  const [currentStep, setCurrentStep] = useState<'config' | 'teams' | 'battle'>('config');

  // Pré-sélectionner l'équipe si elle est passée en paramètre
  useEffect(() => {
    if (preselectedTeam1Id && teams.length > 0) {
      const preselectedTeam = teams.find((team: any) => team.id === preselectedTeam1Id);
      if (preselectedTeam) {
        setTeam1(preselectedTeam);
        setCurrentStep('teams');
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
    setCurrentStep('battle');

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

  const resetBattle = () => {
    setBattleResult(null);
    setCurrentStep('config');
    setTeam1(null);
    setTeam2(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header moderne */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center py-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            ⚔️ ARENA POKEMON
          </h1>
          <p className="text-xl text-white opacity-90 drop-shadow-lg">
            Simulation de combat nouvelle génération
          </p>
        </div>
        
        {/* Particules d'arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Navigation par étapes */}
        <div className="mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-yellow-400' : team1 && team2 ? 'text-green-400' : 'text-white opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'config' ? 'bg-yellow-400 text-black' : team1 && team2 ? 'bg-green-400 text-black' : 'bg-white bg-opacity-20'}`}>
                  1
                </div>
                <span className="font-semibold">CONFIGURATION</span>
              </div>
              
              <div className={`w-16 h-1 ${team1 && team2 ? 'bg-green-400' : 'bg-white bg-opacity-20'} rounded`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'teams' ? 'text-yellow-400' : team1 && team2 ? 'text-green-400' : 'text-white opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'teams' ? 'bg-yellow-400 text-black' : team1 && team2 ? 'bg-green-400 text-black' : 'bg-white bg-opacity-20'}`}>
                  2
                </div>
                <span className="font-semibold">ÉQUIPES</span>
              </div>
              
              <div className={`w-16 h-1 ${battleResult ? 'bg-green-400' : 'bg-white bg-opacity-20'} rounded`}></div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'battle' ? 'text-yellow-400' : battleResult ? 'text-green-400' : 'text-white opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${currentStep === 'battle' ? 'bg-yellow-400 text-black' : battleResult ? 'bg-green-400 text-black' : 'bg-white bg-opacity-20'}`}>
                  3
                </div>
                <span className="font-semibold">COMBAT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu selon l'étape */}
        {currentStep === 'config' && (
          <div className="space-y-6">
            {/* Configuration du combat */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">⚙️ Configuration du Combat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Type de combat */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-4">Type de Simulation</label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setBattleType('team')}
                      className={`w-full p-4 rounded-xl font-semibold transition-all duration-200 ${
                        battleType === 'team'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl'
                          : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                      }`}
                    >
                      🏆 Combat d'Équipe Complet
                    </button>
                    <button
                      onClick={() => setBattleType('turnbased')}
                      className={`w-full p-4 rounded-xl font-semibold transition-all duration-200 ${
                        battleType === 'turnbased'
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-xl'
                          : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                      }`}
                    >
                      🎮 Combat Tour par Tour
                    </button>
                  </div>
                </div>

                {/* Effets météo */}
                <div>
                  <label className="block text-white text-lg font-semibold mb-4">Effets Météorologiques</label>
                  <div className="bg-white bg-opacity-10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white">Activer les effets météo</span>
                      <button
                        onClick={() => setUseWeather(!useWeather)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                          useWeather ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                      >
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                          useWeather ? 'translate-x-6' : ''
                        }`}></div>
                      </button>
                    </div>
                    {useWeather && location && (
                      <div className="text-sm text-blue-300">
                        📍 Position: {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setCurrentStep('teams')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Continuer vers la Sélection d'Équipes →
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'teams' && (
          <div className="space-y-6">
            {/* Sélection des équipes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Équipe 1 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🔵</span>
                  Votre Équipe
                </h3>
                
                {team1 ? (
                  <div className="text-center mb-6">
                    <div className="bg-blue-500 bg-opacity-20 rounded-xl p-4 mb-4">
                      <div className="text-white font-bold text-lg">{team1.teamName || team1.name}</div>
                      <div className="text-blue-200 text-sm">{team1.pokemon?.length || 0} Pokémon</div>
                    </div>
                    <button
                      onClick={() => setTeam1(null)}
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      🔄 Changer d'équipe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team: any) => (
                      <button
                        key={team.id}
                        onClick={() => setTeam1(team)}
                        disabled={team2?.id === team.id}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                          team2?.id === team.id
                            ? 'bg-gray-500 bg-opacity-30 text-gray-400 cursor-not-allowed'
                            : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20 hover:scale-105'
                        }`}
                      >
                        <div className="font-semibold">{team.teamName || team.name}</div>
                        <div className="text-sm opacity-75">{team.pokemon?.length || 0} Pokémon</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Équipe 2 */}
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="mr-3">🔴</span>
                  Équipe Adverse
                </h3>
                
                {team2 ? (
                  <div className="text-center mb-6">
                    <div className="bg-red-500 bg-opacity-20 rounded-xl p-4 mb-4">
                      <div className="text-white font-bold text-lg">{team2.teamName || team2.name}</div>
                      <div className="text-red-200 text-sm">{team2.pokemon?.length || 0} Pokémon</div>
                    </div>
                    <button
                      onClick={() => setTeam2(null)}
                      className="text-red-300 hover:text-white transition-colors"
                    >
                      🔄 Changer d'équipe
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.filter(t => t.id !== team1?.id).length > 0 ? (
                      teams.filter(t => t.id !== team1?.id).map((team: any) => (
                        <button
                          key={team.id}
                          onClick={() => setTeam2(team)}
                          className="w-full p-4 rounded-xl text-left transition-all duration-200 bg-white bg-opacity-10 text-white hover:bg-opacity-20 hover:scale-105"
                        >
                          <div className="font-semibold">{team.teamName || team.name}</div>
                          <div className="text-sm opacity-75">{team.pokemon?.length || 0} Pokémon</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-2">⚠️</div>
                        <p className="text-white opacity-70">Aucune équipe adverse disponible</p>
                        <p className="text-white opacity-50 text-sm">Créez une autre équipe pour combattre</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setCurrentStep('config')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                ← Retour
              </button>
              
              {team1 && team2 && (
                <button
                  onClick={handleSimulateBattle}
                  disabled={isSimulating}
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                >
                  {isSimulating ? '⏳ Simulation...' : '🚀 Lancer le Combat'}
                </button>
              )}
            </div>
          </div>
        )}

        {currentStep === 'battle' && (
          <div className="space-y-6">
            {/* Interface de combat */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
              {isSimulating ? (
                <div className="text-center py-16">
                  <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                  <h3 className="text-2xl font-bold text-white mb-2">Combat en cours...</h3>
                  <p className="text-white opacity-70">Simulation en cours, veuillez patienter</p>
                </div>
              ) : battleResult ? (
                <div className="space-y-6">
                  {/* Résultat */}
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-2xl p-8 mb-6">
                      <div className="text-4xl font-bold mb-2">
                        🏆 {
                          'winner' in battleResult 
                            ? battleResult.winner 
                            : battleResult.battleState.winner
                        }
                      </div>
                      <div className="text-lg">
                        Combat terminé en {
                          'totalTurns' in battleResult 
                            ? battleResult.totalTurns 
                            : battleResult.battleState.turn
                        } tours
                      </div>
                    </div>
                  </div>

                  {/* Journal de combat */}
                  <div className="bg-white bg-opacity-10 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4">📜 Journal de Combat</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {formatBattleLog(battleResult).map((action, index) => (
                        <div key={index} className="bg-white bg-opacity-10 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-blue-300">
                              Tour {action.turn}: {action.attacker}
                            </span>
                            <span className={`text-sm ${action.isCritical ? 'text-red-400 font-bold' : 'text-white'}`}>
                              {action.damage} dégâts
                            </span>
                          </div>
                          <div className="text-sm text-white opacity-75">
                            {action.move} ({action.moveType})
                            {action.isCritical && ' - CRITIQUE!'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={resetBattle}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      🔄 Nouveau Combat
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/battle'}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
                    >
                      🏠 Retour au Hub
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 