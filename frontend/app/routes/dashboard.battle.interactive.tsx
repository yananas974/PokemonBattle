import { useLoaderData, useActionData, useNavigation, useSubmit, useFetcher } from '@remix-run/react';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import type { MetaFunction } from '@remix-run/react';
import { useInteractiveBattle } from '~/hooks/useInteractiveBattle';

// Import des fonctions serveur depuis le fichier .server.ts
export { loader, action } from './server/dashboard.battle.interactive.server';

// Client-side imports
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { BattleHeader, BattleEndScreen } from '~/components/battle';
import { 
  LazyBattleField,
  LazyBattleJournal,
  LazyBattleWeatherDisplay,
  LazyHackChallengeModal
} from '~/components/lazy';
import { BattleActions } from '~/components/battle';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat Interactif - Pokemon Battle Arena' },
    { name: 'description', content: 'Affrontez vos adversaires dans des combats épiques en temps réel !' },
  ];
};
export default function InteractiveBattlePage() {
  
  const loaderData = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const fetcher = useFetcher<any>();
  const { playBattle } = useGlobalAudio(); 
  const processedFetcherRef = useRef<any>(null);

  // ✅ Mémoriser les données de combat pour éviter les re-renders
  const battleData = useMemo(() => loaderData.battle, [loaderData.battle?.battleId]);

  // ✅ Callbacks mémorisés pour éviter les re-renders infinis
  const handleBattleEnd = useCallback((result: any) => {
  }, []);

  const handleBattleError = useCallback((error: string) => {
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
    battleAnimations,
    isLoading,
    error,
    setShowMoveSelector,
    handleBattleActionSuccess,
    executeAction,
    handleForfeit: handleForfeitAction,
    getPlayerPokemon,
    getEnemyPokemon,
    getBattleLog
  } = useInteractiveBattle(hookOptions);


  const actionDataDeps = useMemo(() => [
    actionData,
    handleBattleActionSuccess
  ], [actionData, handleBattleActionSuccess]);

  useEffect(() => {
    playBattle();
  }, [playBattle]);


  useEffect(() => {
    
    if (!actionData) return;
    
    const battleData = actionData?.data?.battle || actionData?.battle || actionData;
      
    // ✅ SIMPLIFICATION : Traiter toutes les réponses normalement
    if (actionData?.success && battleData) {
      handleBattleActionSuccess(actionData);
    }
  }, actionDataDeps);

  // ✅ Traitement direct des données fetcher (plus simple et fiable)
  useEffect(() => {
    // Éviter la boucle infinie en vérifiant si on a déjà traité ces données
    if (fetcher.data && fetcher.state === 'idle' && 
        fetcher.data !== processedFetcherRef.current) {
      
      processedFetcherRef.current = fetcher.data;
      
      const battleData = fetcher.data?.data?.battle || fetcher.data?.battle || fetcher.data;
      
      // ✅ Gérer les réponses de hack challenge (succès et échec)
      if (fetcher.data.battleState) {
        // C'est une réponse de hack challenge du backend
        const battleData = fetcher.data.battleState;
        
        if (fetcher.data.success) {
          // Hack réussi - bonus appliqué
          handleBattleActionSuccess({ success: true, data: { battle: battleData } });
        } else {
          // Hack échoué - malus appliqué ou challenge encore actif
          if (!battleData.isHackActive) {
            // Hack terminé avec malus (timeout) - continuer le combat
            handleBattleActionSuccess({ success: true, data: { battle: battleData } });
          } else {
            // Mauvaise réponse mais hack encore actif - garder le modal ouvert
            handleBattleActionSuccess({ success: true, data: { battle: battleData } });
          }
        }
        return;
      }
      
      // Traiter toutes les autres réponses normalement
      if (battleData && fetcher.data.success) {
        handleBattleActionSuccess(fetcher.data);
      }
    }
  }, [fetcher.data, fetcher.state, handleBattleActionSuccess]);


  // ✅ Mémoriser les handlers pour éviter les re-renders
  const handleAction = useCallback(async (action: any) => {
    await executeAction(action, (formData) => {
      fetcher.submit(formData, { method: 'post' });
    });
  }, [executeAction, fetcher.submit]);

  const handleForfeit = useCallback(async () => {
    await handleForfeitAction(submit);
  }, [handleForfeitAction, submit]);
  
  const isSubmitting = navigation.state === 'submitting';
  const effectiveLoading = isLoading || isSubmitting;
  
  if (!currentBattle || loaderData.forceErrorDisplay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
        <ModernCard className="text-center max-w-md">
          <div className="space-y-6">
            <div className="text-8xl">💀</div>
            <h1 className="text-4xl font-bold text-red-400">ERREUR DE COMBAT</h1>
            <div className="text-left bg-black/50 p-4 rounded text-xs text-white max-h-64 overflow-y-auto">
              <p><strong>Error:</strong> {loaderData.error || error}</p>
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
        <BattleHeader currentBattle={currentBattle} />

        {/* Terrain de combat */}
        <LazyBattleField 
          playerPokemon={getPlayerPokemon()}
          enemyPokemon={getEnemyPokemon()}
          battleAnimations={battleAnimations}
          weather={currentBattle.weather}
        />

        {/* Interface de combat */}
        {currentBattle.isFinished ? (
          <BattleEndScreen currentBattle={currentBattle} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Météo et Effets */}
            <div className="lg:col-span-1">
              {(() => {
                const weather = currentBattle.weather || { condition: 'ClearDay', description: 'Temps ensoleillé' };
                const playerPokemon = getPlayerPokemon();
                const enemyPokemon = getEnemyPokemon();

                return (
                  <LazyBattleWeatherDisplay
                    weather={weather}
                    playerPokemon={playerPokemon}
                    enemyPokemon={enemyPokemon}
                    turnCount={currentBattle.turnCount}
                    className="mb-6"
                  />
                );
              })()}
              
              {/* Journal de combat */}
              <LazyBattleJournal battleLog={getBattleLog()} />
            </div>

            {/* Actions de combat */}
            <div className="lg:col-span-2">
              <BattleActions 
                currentBattle={currentBattle}
                showMoveSelector={showMoveSelector}
                onShowMoveSelector={setShowMoveSelector}
                handleAction={handleAction}
                handleForfeit={handleForfeit}
                isLoading={effectiveLoading}
              />
            </div>
          </div>
        )}

        {/* Modal de hack */}
        <LazyHackChallengeModal
          currentBattle={currentBattle}
          isVisible={currentBattle?.isHackActive || false}
          onSubmit={async (answer: string) => {
            const formData = new FormData();
            formData.append('intent', 'hack');
            formData.append('battleId', currentBattle?.battleId || '');
            formData.append('answer', answer);
            fetcher.submit(formData, { method: 'post' });
            return { success: true };
          }}
          onClose={() => {}}
        />
      </div>
    </div>
  );
} 