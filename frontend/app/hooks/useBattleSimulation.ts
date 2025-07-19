import { useReducer, useCallback } from 'react';
import { Team, BattleResult } from '@pokemon-battle/shared';

// Types pour les étapes de bataille
export type BattleStep = 'team-selection' | 'mode-selection' | 'enemy-selection' | 'battle-ready' | 'battle-result';
export type BattleMode = 'team' | 'turnbased';

// Types pour les actions
export type BattleSimulationAction = 
  | { type: 'SELECT_TEAM'; payload: Team }
  | { type: 'SELECT_MODE'; payload: BattleMode }
  | { type: 'SELECT_ENEMY'; payload: Team }
  | { type: 'SET_STEP'; payload: BattleStep }
  | { type: 'SET_WEATHER'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: { lat: number; lon: number } | null }
  | { type: 'START_SIMULATION' }
  | { type: 'SIMULATION_SUCCESS'; payload: BattleResult }
  | { type: 'SIMULATION_ERROR'; payload: string }
  | { type: 'SHOW_RESULT_MODAL'; payload: boolean }
  | { type: 'RESET_BATTLE' }
  | { type: 'BACK_TO_STEP'; payload: BattleStep };

// État de la simulation
export interface BattleSimulationState {
  currentStep: BattleStep;
  selectedTeam: Team | null;
  battleMode: BattleMode;
  enemyTeam: Team | null;
  useWeather: boolean;
  location: { lat: number; lon: number } | null;
  isSimulating: boolean;
  battleResult: BattleResult | null;
  showResultModal: boolean;
  error: string | null;
}

// Reducer pour la simulation de bataille
function battleSimulationReducer(
  state: BattleSimulationState,
  action: BattleSimulationAction
): BattleSimulationState {
  switch (action.type) {
    case 'SELECT_TEAM':
      return {
        ...state,
        selectedTeam: action.payload,
        currentStep: 'mode-selection',
        error: null
      };

    case 'SELECT_MODE':
      return {
        ...state,
        battleMode: action.payload,
        currentStep: 'enemy-selection',
        error: null
      };

    case 'SELECT_ENEMY':
      return {
        ...state,
        enemyTeam: action.payload,
        currentStep: 'battle-ready',
        error: null
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        error: null
      };

    case 'SET_WEATHER':
      return {
        ...state,
        useWeather: action.payload,
        error: null
      };

    case 'SET_LOCATION':
      return {
        ...state,
        location: action.payload,
        error: null
      };

    case 'START_SIMULATION':
      return {
        ...state,
        isSimulating: true,
        battleResult: null,
        error: null
      };

    case 'SIMULATION_SUCCESS':
      return {
        ...state,
        isSimulating: false,
        battleResult: action.payload,
        showResultModal: true,
        currentStep: 'battle-result',
        error: null
      };

    case 'SIMULATION_ERROR':
      return {
        ...state,
        isSimulating: false,
        error: action.payload
      };

    case 'SHOW_RESULT_MODAL':
      return {
        ...state,
        showResultModal: action.payload
      };

    case 'BACK_TO_STEP':
      const newState = { ...state, currentStep: action.payload, error: null };
      
      // Réinitialiser les états selon l'étape
      if (action.payload === 'team-selection') {
        newState.selectedTeam = null;
        newState.enemyTeam = null;
        newState.battleResult = null;
        newState.showResultModal = false;
      } else if (action.payload === 'mode-selection') {
        newState.enemyTeam = null;
        newState.battleResult = null;
        newState.showResultModal = false;
      } else if (action.payload === 'enemy-selection') {
        newState.battleResult = null;
        newState.showResultModal = false;
      }
      
      return newState;

    case 'RESET_BATTLE':
      return {
        currentStep: 'team-selection',
        selectedTeam: null,
        battleMode: 'team',
        enemyTeam: null,
        useWeather: false,
        location: null,
        isSimulating: false,
        battleResult: null,
        showResultModal: false,
        error: null
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UseBattleSimulationOptions {
  initialTeam?: Team;
  initialEnemy?: Team;
  onSimulationStart?: () => void;
  onSimulationEnd?: (result: BattleResult) => void;
  onError?: (error: string) => void;
}

// Hook principal
export function useBattleSimulation(options: UseBattleSimulationOptions = {}) {
  const {
    initialTeam,
    initialEnemy,
    onSimulationStart,
    onSimulationEnd,
    onError
  } = options;

  const initialState: BattleSimulationState = {
    currentStep: initialTeam && initialEnemy ? 'mode-selection' : 'team-selection',
    selectedTeam: initialTeam || null,
    battleMode: 'team',
    enemyTeam: initialEnemy || null,
    useWeather: false,
    location: null,
    isSimulating: false,
    battleResult: null,
    showResultModal: false,
    error: null
  };

  const [state, dispatch] = useReducer(battleSimulationReducer, initialState);

  // Actions
  const selectTeam = useCallback((team: Team) => {
    dispatch({ type: 'SELECT_TEAM', payload: team });
  }, []);

  const selectMode = useCallback((mode: BattleMode) => {
    dispatch({ type: 'SELECT_MODE', payload: mode });
  }, []);

  const selectEnemy = useCallback((enemy: Team) => {
    dispatch({ type: 'SELECT_ENEMY', payload: enemy });
  }, []);

  const setWeather = useCallback((useWeather: boolean) => {
    dispatch({ type: 'SET_WEATHER', payload: useWeather });
  }, []);

  const setLocation = useCallback((location: { lat: number; lon: number } | null) => {
    dispatch({ type: 'SET_LOCATION', payload: location });
  }, []);

  const startSimulation = useCallback(async (simulationFn: () => Promise<BattleResult>) => {
    if (!state.selectedTeam || !state.enemyTeam) {
      const error = 'Équipes manquantes';
      dispatch({ type: 'SIMULATION_ERROR', payload: error });
      onError?.(error);
      return;
    }

    dispatch({ type: 'START_SIMULATION' });
    onSimulationStart?.();

    try {
      const result = await simulationFn();
      dispatch({ type: 'SIMULATION_SUCCESS', payload: result });
      onSimulationEnd?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la simulation';
      dispatch({ type: 'SIMULATION_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    }
  }, [state.selectedTeam, state.enemyTeam, onSimulationStart, onSimulationEnd, onError]);

  const backToStep = useCallback((step: BattleStep) => {
    dispatch({ type: 'BACK_TO_STEP', payload: step });
  }, []);

  const resetBattle = useCallback(() => {
    dispatch({ type: 'RESET_BATTLE' });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'SHOW_RESULT_MODAL', payload: false });
  }, []);

  const showModal = useCallback(() => {
    dispatch({ type: 'SHOW_RESULT_MODAL', payload: true });
  }, []);

  // Utilitaires
  const getStepStatus = useCallback((step: BattleStep) => {
    const steps = ['team-selection', 'mode-selection', 'enemy-selection', 'battle-ready', 'battle-result'];
    const currentIndex = steps.indexOf(state.currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  }, [state.currentStep]);

  const canStartBattle = useCallback(() => {
    return state.selectedTeam && state.enemyTeam && !state.isSimulating;
  }, [state.selectedTeam, state.enemyTeam, state.isSimulating]);

  return {
    // État
    ...state,
    
    // Actions
    selectTeam,
    selectMode,
    selectEnemy,
    setWeather,
    setLocation,
    startSimulation,
    backToStep,
    resetBattle,
    closeModal,
    showModal,
    
    // Utilitaires
    getStepStatus,
    canStartBattle
  };
} 