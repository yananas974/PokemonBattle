import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { battleSimulationService } from '~/services/battleSimulationService';
import type { TeamBattleRequest, BattleResult, TurnBasedResult } from '~/services/battleSimulationService';
import { useState, useEffect } from 'react';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageButton } from '~/components/VintageButton';
import { StatusIndicator } from '~/components/StatusIndicator';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import { BattleResultModal } from '~/components/BattleResultModal';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';

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
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  try {
    const teamsData = await teamService.getMyTeams(user.backendToken);
    const readyTeams = (teamsData.teams || []).filter((team: any) => 
      team.pokemon && team.pokemon.length >= 1
    );

    // Si les équipes sont spécifiées en paramètres, les pré-sélectionner
    let preselectedPlayer = null;
    let preselectedEnemy = null;
    
    if (playerTeamId && enemyTeamId) {
      preselectedPlayer = readyTeams.find((team: any) => team.id === parseInt(playerTeamId));
      preselectedEnemy = readyTeams.find((team: any) => team.id === parseInt(enemyTeamId));
    }

    return json({
      user,
      teams: readyTeams,
      preselectedPlayer,
      preselectedEnemy
    });
  } catch (error) {
    return json({
      user,
      teams: [],
      preselectedPlayer: null,
      preselectedEnemy: null
    });
  }
};

// Types pour les étapes de progression
type BattleStep = 'team-selection' | 'mode-selection' | 'enemy-selection' | 'battle-ready' | 'battle-result';

export default function BattleSimulation() {
  const { user, teams, preselectedPlayer, preselectedEnemy } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { playDashboard } = useGlobalAudio();
  
  // État de progression - démarrer à l'étape appropriée
  const [currentStep, setCurrentStep] = useState<BattleStep>(
    preselectedPlayer && preselectedEnemy ? 'mode-selection' : 'team-selection'
  );
  const [selectedTeam, setSelectedTeam] = useState<any>(preselectedPlayer || null);
  const [battleMode, setBattleMode] = useState<'team' | 'turnbased'>('team');
  const [enemyTeam, setEnemyTeam] = useState<any>(preselectedEnemy || null);
  const [useWeather, setUseWeather] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  // État de combat
  const [isSimulating, setIsSimulating] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | TurnBasedResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Auto-start dashboard music
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  // Géolocalisation
  useEffect(() => {
    if (useWeather) {
      battleSimulationService.getCurrentLocation().then(setLocation);
    }
  }, [useWeather]);

  // Navigation entre étapes
  const handleTeamSelection = (team: any) => {
    setSelectedTeam(team);
    setCurrentStep('mode-selection');
  };

  const handleModeSelection = (mode: 'team' | 'turnbased') => {
    setBattleMode(mode);
    setCurrentStep('enemy-selection');
  };

  const handleEnemySelection = (enemy: any) => {
    setEnemyTeam(enemy);
    setCurrentStep('battle-ready');
  };

  const handleBackToStep = (step: BattleStep) => {
    setCurrentStep(step);
    if (step === 'team-selection') {
      setSelectedTeam(null);
      setEnemyTeam(null);
      setBattleResult(null);
    } else if (step === 'mode-selection') {
      setEnemyTeam(null);
      setBattleResult(null);
    } else if (step === 'enemy-selection') {
      setBattleResult(null);
    }
  };

  const handleStartBattle = async () => {
    if (!selectedTeam || !enemyTeam) {
      alert('Équipes manquantes');
      return;
    }

    console.log('🚀 Démarrage du combat simulé');
    setIsSimulating(true);
    setBattleResult(null);

    try {
      const request: TeamBattleRequest = {
        team1: {
          id: selectedTeam.id,
          teamName: selectedTeam.teamName || selectedTeam.name,
          pokemon: selectedTeam.pokemon
        },
        team2: {
          id: enemyTeam.id,
          teamName: enemyTeam.teamName || enemyTeam.name,
          pokemon: enemyTeam.pokemon
        },
        ...(useWeather && location ? { lat: location.lat, lon: location.lon } : {})
      };

      let result;
      if (battleMode === 'team') {
        result = await battleSimulationService.simulateTeamBattle(request, user.backendToken);
      } else {
        result = await battleSimulationService.simulateTurnBasedBattle(
          { ...request, mode: 'full' },
          user.backendToken
        );
      }

      console.log('✅ Résultat du combat reçu:', result);
      setBattleResult(result);
      console.log('🔄 État du modal avant:', showResultModal);
      setShowResultModal(true);
      console.log('🔄 État du modal après:', true);
      setCurrentStep('battle-result');
      console.log('🎯 Modal devrait être visible maintenant');
    } catch (error: any) {
      console.error('💥 Erreur lors de la simulation:', error);
      alert(`Erreur lors de la simulation du combat: ${error?.message || error}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Nouvelle bataille
  const handleNewBattle = () => {
    setCurrentStep('team-selection');
    setSelectedTeam(null);
    setEnemyTeam(null);
    setBattleResult(null);
    setIsSimulating(false);
    setShowResultModal(false);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  // Retour au menu
  const handleReturnToMenu = () => {
    setShowResultModal(false);
    navigate('/dashboard/battle');
  };



  // Helper pour les étapes
  const getStepStatus = (step: BattleStep) => {
    const steps = ['team-selection', 'mode-selection', 'enemy-selection', 'battle-ready', 'battle-result'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <PokemonAudioPlayer />
      
      {/* Header */}
      <VintageCard>
        <VintageTitle level={1}>
          ⚔️ SIMULATION DE COMBAT
        </VintageTitle>
        <p className="font-pokemon text-pokemon-blue text-sm text-center">
          CONFIGUREZ ET LANCEZ VOS COMBATS AUTOMATIQUES
        </p>
        {preselectedPlayer && preselectedEnemy && (
          <div className="mt-3 bg-green-100 border border-green-400 p-3 rounded text-center">
            <div className="font-pokemon text-xs text-green-800">
              ✅ ÉQUIPES PRÉ-SÉLECTIONNÉES
            </div>
                         <div className="text-xs text-green-700">
               {preselectedPlayer.teamName || 'Équipe du Joueur'} VS {preselectedEnemy.teamName || 'Équipe Adverse'}
            </div>
          </div>
        )}
      </VintageCard>

      {/* Barre de progression */}
      <VintageCard variant="highlighted">
        <div className="text-center space-y-4">
          <div className="font-pokemon text-pokemon-blue text-sm mb-3">
            📋 PROGRESSION DU COMBAT
          </div>
          
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {/* Étape 1: Sélection équipe */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-pokemon ${
                getStepStatus('team-selection') === 'completed' ? 'bg-pokemon-green text-white' :
                getStepStatus('team-selection') === 'current' ? 'bg-pokemon-blue text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {getStepStatus('team-selection') === 'completed' ? '✓' : '1'}
              </div>
              <span className="text-xs font-pokemon hidden sm:block">ÉQUIPE</span>
            </div>

            <div className="w-8 h-1 bg-gray-300"></div>

            {/* Étape 2: Mode de combat */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-pokemon ${
                getStepStatus('mode-selection') === 'completed' ? 'bg-pokemon-green text-white' :
                getStepStatus('mode-selection') === 'current' ? 'bg-pokemon-blue text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {getStepStatus('mode-selection') === 'completed' ? '✓' : '2'}
              </div>
              <span className="text-xs font-pokemon hidden sm:block">MODE</span>
            </div>

            <div className="w-8 h-1 bg-gray-300"></div>

            {/* Étape 3: Sélection ennemi */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-pokemon ${
                getStepStatus('enemy-selection') === 'completed' ? 'bg-pokemon-green text-white' :
                getStepStatus('enemy-selection') === 'current' ? 'bg-pokemon-blue text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {getStepStatus('enemy-selection') === 'completed' ? '✓' : '3'}
              </div>
              <span className="text-xs font-pokemon hidden sm:block">ENNEMI</span>
            </div>

            <div className="w-8 h-1 bg-gray-300"></div>

            {/* Étape 4: Combat */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-pokemon ${
                getStepStatus('battle-ready') === 'completed' ? 'bg-pokemon-green text-white' :
                getStepStatus('battle-ready') === 'current' ? 'bg-pokemon-red text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {getStepStatus('battle-ready') === 'completed' ? '✓' : '⚔️'}
              </div>
              <span className="text-xs font-pokemon hidden sm:block">COMBAT</span>
            </div>
          </div>

          {/* Indicateur textuel */}
          <div className="text-xs font-pokemon text-pokemon-blue-dark">
            {currentStep === 'team-selection' && "1️⃣ SÉLECTIONNEZ VOTRE ÉQUIPE"}
            {currentStep === 'mode-selection' && "2️⃣ CHOISISSEZ LE MODE DE COMBAT"}
            {currentStep === 'enemy-selection' && "3️⃣ SÉLECTIONNEZ L'ÉQUIPE ADVERSE"}
            {currentStep === 'battle-ready' && "4️⃣ PRÊT POUR LE COMBAT !"}
            {currentStep === 'battle-result' && "🏆 RÉSULTATS DU COMBAT"}
          </div>
        </div>
      </VintageCard>

      {/* Étape 1: Sélection de l'équipe */}
      {currentStep === 'team-selection' && (
        <VintageCard>
          <VintageTitle level={2}>
            🔵 SÉLECTIONNEZ VOTRE ÉQUIPE
          </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-xs mb-4">
            CHOISISSEZ L'ÉQUIPE QUI VOUS REPRÉSENTERA
          </p>
          
          {teams.length > 0 ? (
            <div className="grid gap-3">
              {teams.map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelection(team)}
                  className="p-4 rounded border-2 border-pokemon-blue hover:bg-pokemon-blue hover:text-white transition-colors text-left"
                >
                  <div className="font-pokemon text-sm">
                    {team.teamName || team.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {team.pokemon?.length || 0} Pokémon
                  </div>
                  <div className="text-xs text-pokemon-green mt-1">
                    👆 Cliquez pour sélectionner
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <StatusIndicator
              status="warning"
              showLabel={true}
              label="Aucune équipe disponible - Créez des équipes pour commencer"
            />
          )}
        </VintageCard>
      )}

      {/* Étape 2: Sélection du mode */}
      {currentStep === 'mode-selection' && (
      <VintageCard>
        <VintageTitle level={2}>
            ⚙️ CHOISISSEZ LE MODE DE COMBAT
        </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-xs mb-4">
            ÉQUIPE SÉLECTIONNÉE: {selectedTeam?.teamName || selectedTeam?.name}
          </p>
        
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleModeSelection('team')}
                className="p-6 rounded border-2 border-pokemon-green hover:bg-pokemon-green hover:text-white transition-colors"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🏆</div>
                  <div className="font-pokemon text-sm mb-2">COMBAT D'ÉQUIPE</div>
                  <div className="text-xs opacity-75">
                    Simulation rapide et automatique entre équipes complètes
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleModeSelection('turnbased')}
                className="p-6 rounded border-2 border-pokemon-red hover:bg-pokemon-red hover:text-white transition-colors"
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🎮</div>
                  <div className="font-pokemon text-sm mb-2">TOUR PAR TOUR</div>
                  <div className="text-xs opacity-75">
                    Simulation détaillée avec log complet de chaque action
                  </div>
            </div>
              </button>
          </div>

            {/* Options météo */}
            <div className="bg-gray-50 p-4 rounded">
              <div className="flex items-center justify-between mb-3">
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
          
            <div className="text-center">
              <VintageButton
                onClick={() => handleBackToStep('team-selection')}
                variant="gray"
                className="mr-2"
              >
                ← RETOUR
              </VintageButton>
          </div>
        </div>
      </VintageCard>
      )}

      {/* Étape 3: Sélection de l'ennemi */}
      {currentStep === 'enemy-selection' && (
        <VintageCard>
          <VintageTitle level={2}>
            🔴 SÉLECTIONNEZ L'ÉQUIPE ADVERSE
          </VintageTitle>
          <p className="font-pokemon text-pokemon-blue text-xs mb-4">
            MODE: {battleMode === 'team' ? '🏆 Combat d\'équipe' : '🎮 Tour par tour'}
          </p>
          
          {teams.filter((t: any) => t.id !== selectedTeam?.id).length > 0 ? (
            <div className="space-y-3">
              {teams.filter((t: any) => t.id !== selectedTeam?.id).map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => handleEnemySelection(team)}
                  className="w-full p-4 rounded border-2 border-pokemon-red hover:bg-pokemon-red hover:text-white transition-colors text-left"
                >
                  <div className="font-pokemon text-sm">
                    {team.teamName || team.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {team.pokemon?.length || 0} Pokémon
                  </div>
                  <div className="text-xs text-pokemon-red mt-1">
                    👆 Cliquez pour sélectionner comme adversaire
                  </div>
                </button>
              ))}
              
              <div className="text-center mt-4">
                <VintageButton
                  onClick={() => handleBackToStep('mode-selection')}
                  variant="gray"
                >
                  ← RETOUR
                </VintageButton>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-yellow-100 border border-yellow-400 p-4 rounded">
                <div className="font-pokemon text-xs text-yellow-800">
                  ⚠️ AUCUNE ÉQUIPE ADVERSE DISPONIBLE
                </div>
                <div className="text-xs text-yellow-700 mt-1">
                  Vous devez avoir au moins 2 équipes pour faire un combat
                </div>
              </div>
              
              <div className="space-x-2">
                <VintageButton
                  onClick={() => handleBackToStep('mode-selection')}
                  variant="gray"
                >
                  ← RETOUR
                </VintageButton>
                <VintageButton 
                  onClick={() => navigate('/dashboard/teams/create')} 
                  variant="yellow"
                >
                  🏗️ CRÉER UNE ÉQUIPE
                    </VintageButton>
                  </div>
            </div>
          )}
        </VintageCard>
      )}

      {/* Étape 4: Prêt pour le combat */}
      {currentStep === 'battle-ready' && (
        <VintageCard variant="highlighted">
          <VintageTitle level={2}>
            🚀 PRÊT POUR LE COMBAT !
          </VintageTitle>
          
          <div className="space-y-4">
            {/* Récapitulatif */}
            <div className="bg-white/50 p-4 rounded">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
                  <div className="font-pokemon text-sm text-pokemon-blue mb-2">
                    🔵 VOTRE ÉQUIPE
                  </div>
                  <div className="bg-pokemon-blue text-white p-3 rounded">
                    <div className="font-pokemon text-sm">
                      {selectedTeam?.teamName || selectedTeam?.name}
                </div>
                    <div className="text-xs opacity-75">
                      {selectedTeam?.pokemon?.length || 0} Pokémon
                </div>
              </div>
            </div>

                <div className="text-center">
                  <div className="font-pokemon text-sm text-pokemon-red mb-2">
                    🔴 ÉQUIPE ADVERSE
                  </div>
                  <div className="bg-pokemon-red text-white p-3 rounded">
                    <div className="font-pokemon text-sm">
                      {enemyTeam?.teamName || enemyTeam?.name}
                    </div>
                    <div className="text-xs opacity-75">
                      {enemyTeam?.pokemon?.length || 0} Pokémon
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="font-pokemon text-xs text-pokemon-blue-dark">
                  MODE: {battleMode === 'team' ? '🏆 Combat d\'équipe' : '🎮 Tour par tour'}
                  {useWeather && ' | 🌤️ Effets météo activés'}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="text-center space-x-3">
              <VintageButton
                onClick={() => handleBackToStep('enemy-selection')}
                variant="gray"
                disabled={isSimulating}
              >
                ← RETOUR
              </VintageButton>
              
              <VintageButton
                onClick={handleStartBattle}
                disabled={isSimulating}
                variant="green"
                className="px-8 py-4 text-lg"
              >
                {isSimulating ? '⏳ SIMULATION EN COURS...' : '🚀 LANCER LE COMBAT !'}
              </VintageButton>
            </div>
          </div>
        </VintageCard>
      )}



      {/* Diagnostics (uniquement en développement) */}
      {process.env.NODE_ENV === 'development' && (
        <VintageCard>
          <VintageTitle level={2}>
            🔧 DIAGNOSTICS (DEV)
          </VintageTitle>
          <div className="space-y-3">
            <VintageButton
              onClick={async () => {
                try {
                  const isConnected = await battleSimulationService.testBackendConnection(user.backendToken);
                  alert(isConnected ? '✅ Backend accessible !' : '❌ Backend non accessible');
                } catch (error) {
                  alert('❌ Erreur lors du test de connectivité');
                }
              }}
              variant="blue"
              className="w-full"
            >
              🔍 TESTER LA CONNECTIVITÉ BACKEND
            </VintageButton>

            <VintageButton
              onClick={() => {
                console.log('🔍 Test modal - États actuels:');
                console.log('- showResultModal:', showResultModal);
                console.log('- battleResult:', battleResult);
                console.log('- selectedTeam:', selectedTeam?.name);
                console.log('- enemyTeam:', enemyTeam?.name);
                
                // Force l'affichage du modal avec des données de test
                setBattleResult({
                  success: true,
                  winner: 'Test Team',
                  totalTurns: 5,
                  battleLog: [
                    {
                      turn: 1,
                      attacker: 'Pikachu',
                      move: 'Éclair',
                      moveType: 'Électrik',
                      damage: 25,
                      description: 'Test attack',
                      isCritical: false,
                      typeEffectiveness: 1,
                      stab: true
                    }
                  ]
                });
                setShowResultModal(true);
                console.log('🎯 Modal de test activé');
              }}
              variant="yellow"
              className="w-full"
            >
              🧪 TESTER LE MODAL (DONNÉES FICTIVES)
            </VintageButton>

            <div className="text-xs bg-gray-100 p-3 rounded">
              <div><strong>Étape actuelle:</strong> {currentStep}</div>
              <div><strong>Équipe sélectionnée:</strong> {selectedTeam?.name || 'Aucune'}</div>
              <div><strong>Mode:</strong> {battleMode}</div>
              <div><strong>Équipe ennemie:</strong> {enemyTeam?.name || 'Aucune'}</div>
              <div><strong>Token:</strong> {user.backendToken ? '✅ Présent' : '❌ Manquant'}</div>
              <div><strong>Modal visible:</strong> {showResultModal ? '✅ Oui' : '❌ Non'}</div>
              <div><strong>Résultat combat:</strong> {battleResult ? '✅ Présent' : '❌ Absent'}</div>
            </div>
          </div>
        </VintageCard>
      )}

      {/* Modal des résultats de combat */}
      <BattleResultModal
        isVisible={showResultModal}
        onClose={handleCloseModal}
        onNewBattle={handleNewBattle}
        onReturnToMenu={handleReturnToMenu}
        battleResult={battleResult}
        playerTeamName={selectedTeam?.teamName || selectedTeam?.name || 'Votre équipe'}
        enemyTeamName={enemyTeam?.teamName || enemyTeam?.name || 'Équipe adverse'}
        battleMode={battleMode}
      />
    </div>
  );
} 