import { useReducer, useCallback } from 'react';

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
        newState.battleAnimations = {
          ...state.battleAnimations,
          playerAttack: battleData.currentTurn === 'enemy',
          enemyAttack: battleData.currentTurn === 'player'
        };
      }

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

  const initialState: InteractiveBattleState = {
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
  };

  const [state, dispatch] = useReducer(interactiveBattleReducer, initialState);

  // Actions
  const setBattle = useCallback((battle: any) => {
    dispatch({ type: 'SET_BATTLE', payload: battle });
    
    // Vérifier si un hack challenge est actif
    if (battle?.isHackActive && battle.hackChallenge && !state.isHackModalVisible) {
      dispatch({ type: 'SHOW_HACK_MODAL', payload: true });
    }
  }, [state.isHackModalVisible]);

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
    const battleData = actionData?.data?.battle || actionData?.battle;
    
    if (actionData?.success && battleData) {
      dispatch({ type: 'BATTLE_ACTION_SUCCESS', payload: battleData });
      
      // Réinitialiser les animations après un délai
      setTimeout(() => {
        dispatch({ type: 'RESET_ANIMATIONS' });
      }, animationDuration);
      
      // Vérifier si la bataille est terminée
      if (battleData.isFinished) {
        onBattleEnd?.(battleData);
      }
    }
  }, [animationDuration, onBattleEnd]);

  const executeAction = useCallback(async (action: any, submitFn: (formData: FormData) => void) => {
    if (!state.currentBattle) return;

    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('battleId', state.currentBattle.battleId);
      
      if (action.type === 'attack' && action.moveId !== undefined) {
        formData.append('moveIndex', action.moveId.toString());
      } else if (action.type === 'flee') {
        formData.append('intent', 'forfeit');
      }

      submitFn(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'action';
      setErrorState(errorMessage);
    }
  }, [state.currentBattle, setLoadingState, setErrorState]);

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
  }, [state.currentBattle, setLoadingState, setErrorState]);

  const handleHackSubmit = useCallback(async (answer: string, submitFn: (formData: FormData) => void) => {
    if (!state.currentBattle || !state.currentBattle.hackChallenge) return;

    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('intent', 'hack');
      formData.append('battleId', state.currentBattle.battleId);
      formData.append('answer', answer);

      submitFn(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la soumission du hack';
      setErrorState(errorMessage);
    }
  }, [state.currentBattle, setLoadingState, setErrorState]);

  // Utilitaires
  const canPlayerAct = useCallback(() => {
    return state.currentBattle?.currentTurn === 'player' && !state.isLoading && !state.currentBattle?.isFinished;
  }, [state.currentBattle, state.isLoading]);

  const getBattleStatus = useCallback(() => {
    if (!state.currentBattle) return 'no-battle';
    if (state.currentBattle.isFinished) return 'finished';
    if (state.isLoading) return 'loading';
    if (state.currentBattle.currentTurn === 'player') return 'player-turn';
    return 'enemy-turn';
  }, [state.currentBattle, state.isLoading]);

  const getPlayerPokemon = useCallback(() => {
    return state.currentBattle?.playerPokemon || null;
  }, [state.currentBattle]);

  const getEnemyPokemon = useCallback(() => {
    return state.currentBattle?.enemyPokemon || null;
  }, [state.currentBattle]);

  const getBattleLog = useCallback(() => {
    return state.currentBattle?.battleLog || [];
  }, [state.currentBattle]);

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