import { useReducer, useCallback, useEffect, useMemo, useRef } from 'react';
import { InteractiveBattleData, InteractiveBattleResponse } from '@pokemon-battle/shared';
import { battleActionSchema, validateFormData, sanitizeString } from '~/utils/validation';

// Types pour les animations de bataille
export interface BattleAnimations {
  playerAttack: boolean;
  enemyAttack: boolean;
  playerHit: boolean;
  enemyHit: boolean;
}

// Types pour les actions
export type InteractiveBattleAction = 
  | { type: 'SET_BATTLE'; payload: InteractiveBattleData }
  | { type: 'SHOW_MOVE_SELECTOR'; payload: boolean }
  | { type: 'SET_ANIMATIONS'; payload: Partial<BattleAnimations> }
  | { type: 'RESET_ANIMATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'BATTLE_ACTION_SUCCESS'; payload: InteractiveBattleData }
  | { type: 'BATTLE_FINISHED'; payload: InteractiveBattleData };

// État de la bataille interactive
export interface InteractiveBattleState {
  currentBattle: InteractiveBattleData | null;
  showMoveSelector: boolean;
  battleAnimations: BattleAnimations;
  isLoading: boolean;
  error: string | null;
  lastAction: InteractiveBattleData | null;
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
  initialBattle?: InteractiveBattleData;
  onBattleEnd?: (result: InteractiveBattleData) => void;
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
  const setBattle = useCallback((battle: InteractiveBattleData) => {
    dispatch({ type: 'SET_BATTLE', payload: battle });
    
  }, []); // ✅ Plus de dépendances

  const showMoveSelector = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_MOVE_SELECTOR', payload: show });
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

  // ✅ Mémoriser onBattleEnd pour éviter les re-renders
  const memoizedOnBattleEnd = useCallback((battleData: InteractiveBattleData) => {
    onBattleEnd?.(battleData);
  }, [onBattleEnd]);

  // ✅ Référence stable pour le timeout d'animation
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleBattleActionSuccess = useCallback((actionData: InteractiveBattleResponse | InteractiveBattleData) => {
    // Extraire les données de bataille selon le type
    let battleData: InteractiveBattleData | null = null;
    let success = true;
    
    if ('success' in actionData) {
      // C'est une InteractiveBattleResponse
      battleData = actionData?.data?.battle || actionData?.battle || null;
      success = actionData.success;
    } else {
      // C'est directement une InteractiveBattleData
      battleData = actionData;
    }
    
    if (success && battleData) {
      dispatch({ type: 'BATTLE_ACTION_SUCCESS', payload: battleData });
      
      // ✅ Nettoyer le timeout précédent
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // ✅ Réinitialiser les animations après un délai
      animationTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RESET_ANIMATIONS' });
        animationTimeoutRef.current = null;
      }, animationDuration);
      
      // ✅ Vérifier si la bataille est terminée
      if (battleData.isFinished) {
        memoizedOnBattleEnd(battleData);
      }
    }
  }, [animationDuration, memoizedOnBattleEnd]);

  // ✅ Mémoriser battleId pour éviter les re-renders
  const currentBattleId = useMemo(() => state.currentBattle?.battleId, [state.currentBattle?.battleId]);

  const executeAction = useCallback(async (action: { type: string; moveId?: number }, submitFn: (formData: FormData) => void) => {
    if (!currentBattleId) {
      return;
    }

    setLoadingState(true);

    // ✅ Validation sécurisée de l'action
    const actionData = {
      battleId: currentBattleId,
      intent: action.type === 'attack' ? 'attack' as const : 
              action.type === 'flee' ? 'forfeit' as const : 'attack' as const,
      moveIndex: action.moveId
    };

    const validation = validateFormData(battleActionSchema, actionData);
    if (!validation.success) {
      const errorMessage = 'Action invalide: ' + Object.values(validation.errors || {}).join(', ');
      setErrorState(errorMessage);
      setLoadingState(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('battleId', sanitizeString(currentBattleId));
      
      if (action.type === 'attack' && action.moveId !== undefined) {
        formData.append('intent', 'attack');
        formData.append('moveIndex', action.moveId.toString());
      } else if (action.type === 'flee') {
        formData.append('intent', 'forfeit');
      }
      
      submitFn(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'action';
      setErrorState(errorMessage);
      setLoadingState(false);
    }
  }, [currentBattleId, setLoadingState, setErrorState]);

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

  // ✅ Cleanup des timeouts au démontage
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  // ✅ Note: Le polling est supprimé - on s'appuie sur les fetchers pour la mise à jour temps réel

  return {
    // État
    currentBattle: state.currentBattle,
    showMoveSelector: state.showMoveSelector,
    battleAnimations: state.battleAnimations,
    isLoading: state.isLoading,
    error: state.error,
    lastAction: state.lastAction,
    
    // Actions
    setBattle,
    setShowMoveSelector: showMoveSelector,
    setLoading: setLoadingState,
    setError: setErrorState,
    handleBattleActionSuccess,
    executeAction,
    handleForfeit,
    
    // Utilitaires
    canPlayerAct,
    getBattleStatus,
    getPlayerPokemon,
    getEnemyPokemon,
    getBattleLog
  };
} 