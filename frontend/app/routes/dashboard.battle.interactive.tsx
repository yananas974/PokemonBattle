import { useLoaderData, useActionData, useNavigation, useSubmit, useFetcher } from '@remix-run/react';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import type { MetaFunction } from '@remix-run/react';
import { useInteractiveBattle } from '~/hooks/useInteractiveBattle';

// Import des fonctions serveur depuis le fichier .server.ts
export { loader } from './server/dashboard.battle.interactive.server';

// Client-side imports
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { StatusIndicator } from '~/components/StatusIndicator';
import { HackChallengeModal } from '~/components/HackChallengeModal';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { cn } from '~/utils/cn';
import { getTypeColor } from '~/utils/pokemonTypes';
import type {  PokemonMove } from '@pokemon-battle/shared';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat Interactif - Pokemon Battle Arena' },
    { name: 'description', content: 'Affrontez vos adversaires dans des combats épiques en temps réel !' },
  ];
};

// Action Remix complète pour le combat interactif
export const action = async ({ request }: { request: Request }) => {
  console.log('🎯 === ACTION REMIX COMBAT INTERACTIF ===');
  
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    const battleId = formData.get('battleId') as string;
    
    console.log('📋 FormData reçue:', { intent, battleId });
    
    // Import dynamique pour éviter l'import côté client
    const { apiCallServer } = await import('~/utils/api.server');
    const { getUserFromSession } = await import('~/sessions.server');
    
    // Vérifier l'authentification
    const { user } = await getUserFromSession(request);
    if (!user) {
      return Response.json({
        success: false,
        error: 'Non autorisé'
      });
    }
    
    console.log('🔐 User authentifié:', user.username);
    
    // Router selon le type d'action
    switch (intent) {
      case 'attack': {
        const moveIndex = formData.get('moveIndex') as string;
        console.log('⚔️ Action attaque:', { battleId, moveIndex });
        
        const response = await apiCallServer('/api/interactive-battle/move', request, {
          method: 'POST',
          body: JSON.stringify({
            battleId,
            moveIndex: parseInt(moveIndex)
          })
        });
        
        const data = await response.json();
        console.log('✅ Réponse attaque:', data);
        
        // ✅ Si après l'attaque du joueur, c'est le tour de l'ennemi, 
        // attendre un peu puis récupérer l'état mis à jour
        if (data.success && data.data?.battle?.currentTurn === 'enemy') {
          console.log('🤖 Tour ennemi détecté dans l\'action, attente de 0.7 secondes...');
          
          // Attendre que l'ennemi attaque automatiquement (0.7s pour être sûr que le backend a terminé)
          await new Promise(resolve => setTimeout(resolve, 700));
          
          // Récupérer l'état mis à jour
          const statusResponse = await apiCallServer(`/api/interactive-battle/${battleId}`, request, {
            method: 'GET'
          });
          
          const statusData = await statusResponse.json();
          console.log('🔄 État récupéré après attaque ennemi:', statusData);
          
          if (statusData.success && statusData.data?.battle) {
            // Retourner l'état mis à jour au lieu de l'état initial
            return Response.json(statusData);
          }
        }
        
        return Response.json(data);
      }
      
      case 'hack': {
        const answer = formData.get('answer') as string;
        console.log('🚨 Action hack challenge:', { battleId, answer });
        
        const response = await apiCallServer('/api/interactive-battle/solve-hack', request, {
          method: 'POST',
          body: JSON.stringify({
            battleId,
            answer
          })
        });
        
        const data = await response.json();
        console.log('✅ Réponse hack:', data);
        return Response.json(data);
      }
      
      case 'forfeit': {
        console.log('🏃‍♂️ Action forfait:', { battleId });
        
        const response = await apiCallServer(`/api/interactive-battle/${battleId}/forfeit`, request, {
          method: 'POST'
        });
        
        const data = await response.json();
        console.log('✅ Réponse forfait:', data);
        return Response.json(data);
      }
      
      case 'get-status': {
        console.log('🔄 Action récupération état:', { battleId });
        
        const response = await apiCallServer(`/api/interactive-battle/${battleId}`, request, {
          method: 'GET'
        });
        
        const data = await response.json();
        console.log('✅ Réponse état:', data);
        return Response.json(data);
      }
      
      default:
        console.log('❌ Intent non reconnu:', intent);
        return Response.json({
          success: false,
          error: `Action non reconnue: ${intent}`
        });
    }
    
  } catch (error) {
    console.error('❌ Erreur dans action Remix:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'action'
    });
  }
};



// Composant pour la barre de HP moderne
const PokemonHealthBar = ({ 
  currentHp, 
  maxHp, 
  name, 
  level, 
  position = 'enemy' 
}: { 
  currentHp: number; 
  maxHp: number; 
  name: string; 
  level: number; 
  position?: 'player' | 'enemy' 
}) => {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  const getHpColor = (pct: number) => {
    if (pct > 50) return 'bg-green-500';
    if (pct > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn(
      "bg-white/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]",
      position === 'player' ? 'ml-auto' : 'mr-auto'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-gray-800 text-sm">{name}</span>
        <span className="text-xs text-gray-600">Niv. {level}</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", getHpColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 mt-1 text-center">
        {currentHp} / {maxHp} HP
      </div>
    </div>
  );
};

// Terrain de combat
const BattleField = ({ 
  playerPokemon, 
  enemyPokemon, 
  battleAnimations 
}: {
  playerPokemon: any;
  enemyPokemon: any;
  battleAnimations: any;
}) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-300 via-green-200 to-green-400 rounded-lg overflow-hidden">
      {/* Arrière-plan de terrain */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-green-100 to-green-300" />
      
      {/* Ligne de terrain */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-600 to-green-400" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-800" />
      
      {/* Pokémon ennemi (arrière-plan, plus petit) */}
      {enemyPokemon && (
        <div className="absolute top-8 right-16">
          <div className="flex flex-col items-center space-y-2">
            <PokemonHealthBar 
              currentHp={enemyPokemon.currentHp || 0}
              maxHp={enemyPokemon.maxHp || 1}
              name={enemyPokemon.name_fr || 'Pokémon Ennemi'}
              level={enemyPokemon.level || 1}
              position="enemy"
            />
            <div className="relative">
              <img 
                src={enemyPokemon.sprite_url || '/placeholder-pokemon.png'} 
                alt={enemyPokemon.name_fr || 'Pokémon ennemi'}
                className={cn(
                  "w-24 h-24 object-contain drop-shadow-lg transition-all duration-300",
                  battleAnimations.enemyAttack && "animate-pulse scale-110",
                  battleAnimations.enemyHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Ombre du Pokémon ennemi */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Pokémon joueur (premier plan, plus grand) */}
      {playerPokemon && (
        <div className="absolute bottom-8 left-16">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img 
                src={
                  playerPokemon.sprite_url
                    ? playerPokemon.sprite_url.replace('/pokemon/', '/pokemon/back/')
                    : '/placeholder-pokemon.png'
                } 
                alt={playerPokemon.name_fr || 'Votre Pokémon'}
                className={cn(
                  "w-32 h-32 object-contain drop-shadow-xl transition-all duration-300",
                  battleAnimations.playerAttack && "animate-pulse scale-110",
                  battleAnimations.playerHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Ombre du Pokémon joueur */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/30 rounded-full blur-sm" />
            </div>
            <PokemonHealthBar 
              currentHp={playerPokemon.currentHp || 0}
              maxHp={playerPokemon.maxHp || 1}
              name={playerPokemon.name_fr || 'Votre Pokémon'}
              level={playerPokemon.level || 1}
              position="player"
            />
          </div>
        </div>
      )}

      {/* Effets de combat */}
      {(battleAnimations.playerAttack || battleAnimations.enemyAttack) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-ping">💥</div>
        </div>
      )}
    </div>
  );
};

// Composant pour les actions de combat
const BattleActions = ({ 
  currentBattle, 
  showMoveSelector, 
  onShowMoveSelector, 
  handleAction, 
  handleForfeit, 
  isLoading 
}: {
  currentBattle: any;
  showMoveSelector: boolean;
  onShowMoveSelector: (show: boolean) => void;
  handleAction: (action: any) => void;
  handleForfeit: () => void;
  isLoading: boolean;
}) => {
  if (currentBattle.currentTurn !== 'player' || isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-gray-600 font-medium">
          {isLoading ? 'Combat en cours...' : 'L\'ennemi réfléchit à son attaque...'}
        </p>
        <div className="mt-4">
          <div className="animate-pulse bg-gray-300 h-2 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (showMoveSelector) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
        <div className="text-lg font-bold text-gray-800 mb-4">Choisissez une attaque :</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(currentBattle.playerPokemon?.moves || []).map((move: PokemonMove, index: number) => (
            <button
              key={move.name || index}
              onClick={() => handleAction({ type: 'attack', moveId: index, moveName: move.name })}
              disabled={isLoading}
              className={cn(
                "p-3 rounded-lg text-white font-bold text-left transition-all duration-200",
                "hover:scale-105 active:scale-95 disabled:opacity-50",
                getTypeColor(move.type)
              )}
            >
              <div className="font-bold text-sm uppercase">{move.name}</div>
              <div className="text-xs opacity-90">
                {move.power ? `Puissance: ${move.power}` : 'Statut'}
              </div>
              <div className="text-xs opacity-75">PP: {move.pp}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => onShowMoveSelector(false)}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onShowMoveSelector(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105"
        >
          ⚔️ ATTAQUE
        </button>
        <button
          onClick={handleForfeit}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105"
        >
          🏃‍♂️ FUIR
        </button>
      </div>
    </div>
  );
};

export default function InteractiveBattlePage() {
  console.log('🎮 COMBAT INTERACTIF CHARGÉ');
  
  const loaderData = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const fetcher = useFetcher<any>();
  const statusFetcher = useFetcher<any>();
  const { playBattle } = useGlobalAudio();
  
  // ✅ Référence pour éviter la boucle infinie
  const processedFetcherRef = useRef<any>(null);

  console.log('🔄 Fetcher state:', fetcher.state);
  console.log('🔄 Fetcher data:', fetcher.data);
  console.log('🔄 StatusFetcher state:', statusFetcher.state);
  console.log('🔄 StatusFetcher data:', statusFetcher.data);

  // ✅ Mémoriser les données de combat pour éviter les re-renders
  const battleData = useMemo(() => loaderData.battle, [loaderData.battle?.battleId]);

  // ✅ Callbacks mémorisés pour éviter les re-renders infinis
  const handleBattleEnd = useCallback((result: any) => {
    console.log('🏁 Combat terminé:', result);
  }, []);

  const handleBattleError = useCallback((error: string) => {
    console.error('❌ Erreur de combat:', error);
  }, []);

  // ✅ Mémoriser les options du hook pour éviter les re-renders
  const hookOptions = useMemo(() => ({
    initialBattle: battleData,
    onBattleEnd: handleBattleEnd,
    onError: handleBattleError
  }), [battleData, handleBattleEnd, handleBattleError]);

  // Utilisation du hook useInteractiveBattle avec options mémorisées
  const {
    currentBattle,
    showMoveSelector,
    isHackModalVisible,
    battleAnimations,
    isLoading,
    error,
    setBattle,
    setShowMoveSelector,
    setIsHackModalVisible,
    handleBattleActionSuccess,
    executeAction,
    handleForfeit: handleForfeitAction,
    handleHackSubmit: handleHackSubmitAction,
    canPlayerAct,
    getBattleStatus,
    getPlayerPokemon,
    getEnemyPokemon,
    getBattleLog
  } = useInteractiveBattle(hookOptions);

  // ✅ Mémoriser les dépendances des useEffect
  const hackModalDeps = useMemo(() => [
    currentBattle?.isHackActive,
    currentBattle?.hackChallenge,
    isHackModalVisible,
    setIsHackModalVisible
  ], [currentBattle?.isHackActive, currentBattle?.hackChallenge, isHackModalVisible, setIsHackModalVisible]);

  const actionDataDeps = useMemo(() => [
    actionData,
    handleBattleActionSuccess
  ], [actionData, handleBattleActionSuccess]);

  useEffect(() => {
    playBattle();
  }, [playBattle]);

  useEffect(() => {
    if (currentBattle?.isHackActive && currentBattle.hackChallenge && !isHackModalVisible) {
      setIsHackModalVisible(true);
    }
  }, hackModalDeps);

  useEffect(() => {
    console.log('🔄 Frontend: ActionData reçue:', actionData);
    
    const battleData = actionData?.data?.battle || actionData?.battle || actionData;
    
    console.log('🎮 Frontend: BattleData extraite:', battleData);
    
    if (actionData?.success && battleData) {
      console.log('✅ Frontend: Mise à jour de l\'état du combat');
      handleBattleActionSuccess(actionData);
    } else {
      console.log('❌ Frontend: Pas de mise à jour - success:', actionData?.success, 'battleData:', !!battleData);
    }
  }, actionDataDeps);

  // ✅ Traitement direct des données fetcher (plus simple et fiable)
  useEffect(() => {
    console.log('🔄 Effect fetcher: fetcher.data exists:', !!fetcher.data, 'fetcher.state:', fetcher.state);
    
    // Éviter la boucle infinie en vérifiant si on a déjà traité ces données
    if (fetcher.data && fetcher.state === 'idle' && fetcher.data.success && 
        fetcher.data !== processedFetcherRef.current) {
      
      processedFetcherRef.current = fetcher.data;
      
      console.log('🚀 Frontend: Traitement direct des données fetcher');
      console.log('🚀 Frontend: FetcherData complète:', fetcher.data);
      
      const battleData = fetcher.data?.data?.battle || fetcher.data?.battle || fetcher.data;
      
      console.log('🎮 Frontend: FetcherBattleData extraite:', battleData);
      
      if (battleData && battleData.currentTurn) {
        console.log('✅ Frontend: Mise à jour de l\'état du combat via Fetcher');
        handleBattleActionSuccess(fetcher.data);
        
        // ✅ L'action Remix gère maintenant l'attente de l'ennemi automatiquement
      } else {
        console.log('❌ Frontend: Pas de battleData valide dans fetcher:', battleData);
      }
    }
  }, [fetcher.data, fetcher.state, handleBattleActionSuccess]);

  // ✅ Gérer les données du status fetcher
  useEffect(() => {
    if (statusFetcher.data && statusFetcher.state === 'idle') {
      console.log('🔄 StatusFetcher data reçue:', statusFetcher.data);
      
      const battleData = statusFetcher.data?.battle;
      if (battleData) {
        console.log('✅ Mise à jour via statusFetcher');
        handleBattleActionSuccess({ success: true, data: { battle: battleData } });
      }
    }
  }, [statusFetcher.data, statusFetcher.state, handleBattleActionSuccess]);

  // ✅ Mémoriser les handlers pour éviter les re-renders
  const handleAction = useCallback(async (action: any) => {
    console.log('🎯 handleAction appelé avec:', action);
    await executeAction(action, (formData) => {
      console.log('🚀 Utilisation du fetcher pour l\'action');
      fetcher.submit(formData, { method: 'post' });
    });
  }, [executeAction, fetcher]);

  const handleForfeit = useCallback(async () => {
    await handleForfeitAction(submit);
  }, [handleForfeitAction, submit]);

  const handleHackSubmit = useCallback(async (answer: string) => {
    await handleHackSubmitAction(answer, (formData) => {
      console.log('🚀 Utilisation du fetcher pour le hack');
      fetcher.submit(formData, { method: 'post' });
    });
  }, [handleHackSubmitAction, fetcher]);

  console.log('🎮 État du combat:', currentBattle);
  console.log('📊 Infos render:', { 
    hasActionData: !!actionData, 
    isLoading, 
    navigationState: navigation.state,
    currentTurn: currentBattle?.currentTurn,
    waitingForPlayerMove: currentBattle?.waitingForPlayerMove 
  });
  
  const isSubmitting = navigation.state === 'submitting';
  const effectiveLoading = isLoading || isSubmitting;
  
  if (!currentBattle || loaderData.forceErrorDisplay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
        <ModernCard className="text-center max-w-md">
          <div className="space-y-6">
            <div className="text-8xl">💀</div>
            <h1 className="text-4xl font-bold text-red-400">ERREUR DE COMBAT</h1>
            <StatusIndicator
              status="error"
              showLabel={true}
              label={loaderData.error || error || 'Une erreur est survenue'}
            />
            
            <div className="text-left bg-black/50 p-4 rounded text-xs text-white max-h-64 overflow-y-auto">
              <p><strong>Mode:</strong> {loaderData.mode}</p>
              <p><strong>Error:</strong> {loaderData.error || error}</p>
              <p><strong>Battle data:</strong> {currentBattle ? 'Présent' : 'Absent'}</p>
              <p><strong>User:</strong> {loaderData.user?.username || 'Non défini'}</p>
              
              {loaderData.debugInfo && (
                <div className="mt-4 border-t border-gray-600 pt-2">
                  <p><strong>Debug Info:</strong></p>
                  <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(loaderData.debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <ModernButton href="/dashboard/battle" variant="primary" size="lg">
              ← Retour au Hub de Combat
            </ModernButton>
          </div>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header de combat */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">⚔️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">COMBAT POKÉMON</h1>
                <p className="text-gray-600">Tour {currentBattle.turnCount || 1}</p>
              </div>
            </div>
            
            <div className={cn(
              "px-4 py-2 rounded-full font-bold text-white",
              currentBattle.currentTurn === 'player' ? "bg-green-500" : "bg-red-500"
            )}>
              {currentBattle.currentTurn === 'player' ? '🟢 VOTRE TOUR' : '🔴 TOUR ENNEMI'}
            </div>
          </div>
        </div>

        {/* Terrain de combat */}
        <BattleField 
          playerPokemon={getPlayerPokemon()}
          enemyPokemon={getEnemyPokemon()}
          battleAnimations={battleAnimations}
        />

        {/* Interface de combat */}
        {currentBattle.isFinished ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="text-8xl mb-4">
              {currentBattle.winner === 'player' ? '🏆' : '💀'}
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              {currentBattle.winner === 'player' ? 'VICTOIRE !' : 'DÉFAITE'}
            </h2>
            <div className="flex justify-center space-x-4">
              <ModernButton href="/dashboard/battle" variant="primary" size="lg">
                🏠 Retour au Hub
              </ModernButton>
              <ModernButton href="/dashboard/teams" variant="secondary" size="lg">
                👥 Mes Équipes
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Journal de combat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📜 Journal de Combat</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getBattleLog().slice(-8).map((entry: any, index: number) => (
                  <div key={index} className="bg-gray-100 rounded p-2 text-sm text-gray-700">
                    {typeof entry === 'string' ? entry : entry.description || 'Action de combat'}
                  </div>
                ))}
                {getBattleLog().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">⚔️</div>
                    <p>Le combat commence...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions de combat */}
            <BattleActions 
              currentBattle={currentBattle}
              showMoveSelector={showMoveSelector}
              onShowMoveSelector={setShowMoveSelector}
              handleAction={handleAction}
              handleForfeit={handleForfeit}
              isLoading={effectiveLoading}
            />
          </div>
        )}

        {/* Erreurs */}
        {(actionData?.error || error) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <StatusIndicator status="error" showLabel={true} label={actionData?.error || error} />
          </div>
        )}

        {/* Modal de hack */}
        <HackChallengeModal
          currentBattle={currentBattle}
          isVisible={isHackModalVisible}
          onClose={() => setIsHackModalVisible(false)}
          onSubmit={handleHackSubmit}
        />
      </div>
    </div>
  );
} 