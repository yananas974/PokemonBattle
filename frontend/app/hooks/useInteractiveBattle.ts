import { useReducer, useCallback, useEffect, useMemo } from 'react';

// Types pour les animations de bataille
export interface BattleAnimations {
  playerAttack: boolean;
  enemyAttack: boolean;
  playerHit: boolean;
  enemyHit: boolean;
}

// Types pour les actions
export type InteractiveBattleAction = 
  | { type: 'SET_BATTLE'; payload: any }
  | { type: 'SHOW_MOVE_SELECTOR'; payload: boolean }
  | { type: 'SHOW_HACK_MODAL'; payload: boolean }
  | { type: 'SET_ANIMATIONS'; payload: Partial<BattleAnimations> }
  | { type: 'RESET_ANIMATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'BATTLE_ACTION_SUCCESS'; payload: any }
  | { type: 'BATTLE_FINISHED'; payload: any };

// État de la bataille interactive
export interface InteractiveBattleState {
  currentBattle: any | null;
  showMoveSelector: boolean;
  isHackModalVisible: boolean;
  battleAnimations: BattleAnimations;
  isLoading: boolean;
  error: string | null;
  lastAction: any | null;
}

// Reducer pour la bataille interactive
function interactiveBattleReducer(
  state: InteractiveBattleState,
  action: InteractiveBattleAction
): InteractiveBattleState {
  switch (action.type) {
    case 'SET_BATTLE':
      return {
        ...state,
        currentBattle: action.payload,
        error: null
      };

    case 'SHOW_MOVE_SELECTOR':
      return {
        ...state,
        showMoveSelector: action.payload
      };

    case 'SHOW_HACK_MODAL':
      return {
        ...state,
        isHackModalVisible: action.payload
      };

    case 'SET_ANIMATIONS':
      return {
        ...state,
        battleAnimations: {
          ...state.battleAnimations,
          ...action.payload
        }
      };

    case 'RESET_ANIMATIONS':
      return {
        ...state,
        battleAnimations: {
          playerAttack: false,
          enemyAttack: false,
          playerHit: false,
          enemyHit: false
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        ...(action.payload ? {} : { error: null })
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'BATTLE_ACTION_SUCCESS':
      const battleData = action.payload;
      console.log('🔧 REDUCER BATTLE_ACTION_SUCCESS:', {
        oldTurn: state.currentBattle?.currentTurn,
        newTurn: battleData.currentTurn,
        oldTurnCount: state.currentBattle?.turnCount,
        newTurnCount: battleData.turnCount
      });
      
      const newState = {
        ...state,
        currentBattle: battleData,
        showMoveSelector: false,
        isLoading: false,
        error: null,
        lastAction: battleData
      };

      // Gérer les animations si le tour a changé
      if (battleData.currentTurn !== state.currentBattle?.currentTurn) {
        console.log('🎬 Animation: Changement de tour détecté');
        newState.battleAnimations = {
          ...state.battleAnimations,
          playerAttack: battleData.currentTurn === 'enemy',
          enemyAttack: battleData.currentTurn === 'player'
        };
      }

      console.log('🎯 REDUCER: Nouvel état de combat:', {
        currentTurn: newState.currentBattle.currentTurn,
        turnCount: newState.currentBattle.turnCount,
        isLoading: newState.isLoading
      });

      return newState;

    case 'BATTLE_FINISHED':
      return {
        ...state,
        currentBattle: action.payload,
        showMoveSelector: false,
        isLoading: false,
        error: null
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UseInteractiveBattleOptions {
  initialBattle?: any;
  onBattleEnd?: (result: any) => void;
  onError?: (error: string) => void;
  animationDuration?: number;
}

// Hook principal
export function useInteractiveBattle(options: UseInteractiveBattleOptions = {}) {
  const {
    initialBattle,
    onBattleEnd,
    onError,
    animationDuration = 1000
  } = options;

  // ✅ Mémoriser l'état initial pour éviter les re-renders
  const initialState = useMemo((): InteractiveBattleState => ({
    currentBattle: initialBattle || null,
    showMoveSelector: false,
    isHackModalVisible: false,
    battleAnimations: {
      playerAttack: false,
      enemyAttack: false,
      playerHit: false,
      enemyHit: false
    },
    isLoading: false,
    error: null,
    lastAction: null
  }), [initialBattle?.battleId]); // ✅ Utiliser battleId au lieu de l'objet entier

  const [state, dispatch] = useReducer(interactiveBattleReducer, initialState);

  // ✅ Mettre à jour l'état quand initialBattle change
  useEffect(() => {
    if (initialBattle && initialBattle.battleId !== state.currentBattle?.battleId) {
      dispatch({ type: 'SET_BATTLE', payload: initialBattle });
    }
  }, [initialBattle?.battleId, state.currentBattle?.battleId]);


  // ✅ Actions - Suppression des dépendances problématiques
  const setBattle = useCallback((battle: any) => {
    dispatch({ type: 'SET_BATTLE', payload: battle });
    
    // ✅ Vérifier si un hack challenge est actif sans dépendance à state
    if (battle?.isHackActive && battle.hackChallenge) {
      dispatch({ type: 'SHOW_HACK_MODAL', payload: true });
    }
  }, []); // ✅ Plus de dépendances

  const showMoveSelector = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_MOVE_SELECTOR', payload: show });
  }, []);

  const showHackModal = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_HACK_MODAL', payload: show });
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const handleBattleActionSuccess = useCallback((actionData: any) => {
    console.log('🔄 handleBattleActionSuccess appelé avec:', actionData);
    const battleData = actionData?.data?.battle || actionData?.battle || actionData;
    console.log('🎮 battleData extrait:', battleData);
    
    if (actionData?.success && battleData) {
      console.log('✅ Mise à jour de l\'état du combat avec:', {
        currentTurn: battleData.currentTurn,
        turnCount: battleData.turnCount,
        battleId: battleData.battleId
      });
      dispatch({ type: 'BATTLE_ACTION_SUCCESS', payload: battleData });
      
      // ✅ Réinitialiser les animations après un délai
      setTimeout(() => {
        dispatch({ type: 'RESET_ANIMATIONS' });
      }, animationDuration);
      
      // ✅ Si après l'action du joueur, c'est le tour de l'ennemi, fermer le modal hack s'il était ouvert
      if (battleData.currentTurn === 'enemy' && battleData.hackChallenge === null && state.isHackModalVisible) {
        console.log('🚨 Fermeture du modal hack car challenge résolu');
        dispatch({ type: 'SHOW_HACK_MODAL', payload: false });
      }
      
      // ✅ Vérifier si la bataille est terminée
      if (battleData.isFinished) {
        onBattleEnd?.(battleData);
      }
    } else {
      console.log('❌ handleBattleActionSuccess: Pas de mise à jour', {
        success: actionData?.success,
        hasBattleData: !!battleData
      });
    }
  }, [animationDuration, onBattleEnd, state.isHackModalVisible]);

  const executeAction = useCallback(async (action: any, submitFn: (formData: FormData) => void) => {
    if (!state.currentBattle) {
      console.log('❌ executeAction: Pas de combat actuel');
      return;
    }

    console.log('⚔️ executeAction: Début de l\'exécution REMIX', { action, battleId: state.currentBattle.battleId });
    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('battleId', state.currentBattle.battleId);
      
      if (action.type === 'attack' && action.moveId !== undefined) {
        formData.append('intent', 'attack');
        formData.append('moveIndex', action.moveId.toString());
        console.log('⚔️ Préparation FormData attaque:', { 
          battleId: state.currentBattle.battleId, 
          moveIndex: action.moveId 
        });
      } else if (action.type === 'flee') {
        formData.append('intent', 'forfeit');
        console.log('🏃‍♂️ Préparation FormData forfait');
      }
      
      submitFn(formData);
    } catch (error) {
      console.error('❌ executeAction: Erreur capturée:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'action';
      setErrorState(errorMessage);
      setLoadingState(false);
    }
  }, [state.currentBattle?.battleId, setLoadingState, setErrorState]);

  const handleForfeit = useCallback(async (submitFn: (formData: FormData) => void) => {
    if (!state.currentBattle) return;
    if (!confirm('Voulez-vous vraiment abandonner le combat ?')) return;

    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('intent', 'forfeit');
      formData.append('battleId', state.currentBattle.battleId);

      submitFn(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'abandon';
      setErrorState(errorMessage);
    }
  }, [state.currentBattle?.battleId, setLoadingState, setErrorState]);

  const handleHackSubmit = useCallback(async (answer: string, submitFn: (formData: FormData) => void) => {
    if (!state.currentBattle || !state.currentBattle.hackChallenge) return;

    console.log('🚨 handleHackSubmit appelé avec:', { answer, battleId: state.currentBattle.battleId });
    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('intent', 'hack');
      formData.append('battleId', state.currentBattle.battleId);
      formData.append('answer', answer);

      console.log('🚨 Préparation FormData hack:', { 
        battleId: state.currentBattle.battleId, 
        answer 
      });

      submitFn(formData);
    } catch (error) {
      console.error('❌ handleHackSubmit: Erreur capturée:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la soumission du hack';
      setErrorState(errorMessage);
      setLoadingState(false);
    }
  }, [state.currentBattle?.battleId, state.currentBattle?.hackChallenge, setLoadingState, setErrorState]);

  // ✅ Utilitaires - Utilisation de propriétés spécifiques
  const canPlayerAct = useCallback(() => {
    return state.currentBattle?.currentTurn === 'player' && !state.isLoading && !state.currentBattle?.isFinished;
  }, [state.currentBattle?.currentTurn, state.isLoading, state.currentBattle?.isFinished]);

  const getBattleStatus = useCallback(() => {
    if (!state.currentBattle) return 'no-battle';
    if (state.currentBattle.isFinished) return 'finished';
    if (state.isLoading) return 'loading';
    if (state.currentBattle.currentTurn === 'player') return 'player-turn';
    return 'enemy-turn';
  }, [state.currentBattle?.isFinished, state.isLoading, state.currentBattle?.currentTurn]);

  const getPlayerPokemon = useCallback(() => {
    return state.currentBattle?.playerPokemon || null;
  }, [state.currentBattle?.playerPokemon]);

  const getEnemyPokemon = useCallback(() => {
    return state.currentBattle?.enemyPokemon || null;
  }, [state.currentBattle?.enemyPokemon]);

  const getBattleLog = useCallback(() => {
    return state.currentBattle?.battleLog || [];
  }, [state.currentBattle?.battleLog]);

  // ✅ Note: Le polling est supprimé - on s'appuie sur les fetchers pour la mise à jour temps réel

  return {
    // État
    currentBattle: state.currentBattle,
    showMoveSelector: state.showMoveSelector,
    isHackModalVisible: state.isHackModalVisible,
    battleAnimations: state.battleAnimations,
    isLoading: state.isLoading,
    error: state.error,
    lastAction: state.lastAction,
    
    // Actions
    setBattle,
    setShowMoveSelector: showMoveSelector,
    setIsHackModalVisible: showHackModal,
    setLoading: setLoadingState,
    setError: setErrorState,
    handleBattleActionSuccess,
    executeAction,
    handleForfeit,
    handleHackSubmit,
    
    // Utilitaires
    canPlayerAct,
    getBattleStatus,
    getPlayerPokemon,
    getEnemyPokemon,
    getBattleLog
  };
} 