import { useReducer, useCallback } from 'react';

// Types pour le hub de combat
export interface BattleHubState {
  selectedTeam: any | null;
  enemyTeam: any | null;
  battleMode: 'interactive' | 'simulated' | null;
  showEnemySelection: boolean;
  currentStep: 'team-selection' | 'mode-selection' | 'enemy-selection' | 'ready';
  isLoading: boolean;
  error: string | null;
}

// Actions pour le reducer
export type BattleHubAction = 
  | { type: 'SELECT_TEAM'; payload: any }
  | { type: 'SELECT_ENEMY'; payload: any }
  | { type: 'SELECT_BATTLE_MODE'; payload: 'interactive' | 'simulated' }
  | { type: 'SHOW_ENEMY_SELECTION'; payload: boolean }
  | { type: 'SET_CURRENT_STEP'; payload: BattleHubState['currentStep'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_BATTLE' }
  | { type: 'CANCEL_ENEMY_SELECTION' };

// État initial
const initialState: BattleHubState = {
  selectedTeam: null,
  enemyTeam: null,
  battleMode: null,
  showEnemySelection: false,
  currentStep: 'team-selection',
  isLoading: false,
  error: null
};

// Reducer pour le hub de combat
function battleHubReducer(state: BattleHubState, action: BattleHubAction): BattleHubState {
  switch (action.type) {
    case 'SELECT_TEAM':
      return {
        ...state,
        selectedTeam: action.payload,
        currentStep: 'mode-selection',
        error: null
      };

    case 'SELECT_ENEMY':
      return {
        ...state,
        enemyTeam: action.payload,
        currentStep: 'ready',
        error: null
      };

    case 'SELECT_BATTLE_MODE':
      return {
        ...state,
        battleMode: action.payload,
        showEnemySelection: true,
        currentStep: 'enemy-selection',
        error: null
      };

    case 'SHOW_ENEMY_SELECTION':
      return {
        ...state,
        showEnemySelection: action.payload,
        currentStep: action.payload ? 'enemy-selection' : 'mode-selection'
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'CANCEL_ENEMY_SELECTION':
      return {
        ...state,
        showEnemySelection: false,
        enemyTeam: null,
        battleMode: null,
        currentStep: 'mode-selection'
      };

    case 'RESET_BATTLE':
      return {
        ...initialState,
        selectedTeam: null
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UseBattleHubOptions {
  onTeamSelected?: (team: any) => void;
  onEnemySelected?: (enemy: any) => void;
  onBattleModeSelected?: (mode: 'interactive' | 'simulated') => void;
  onBattleReady?: (selectedTeam: any, enemyTeam: any, mode: 'interactive' | 'simulated') => void;
  onError?: (error: string) => void;
}

export function useBattleHub(options: UseBattleHubOptions = {}) {
  const {
    onTeamSelected,
    onEnemySelected,
    onBattleModeSelected,
    onBattleReady,
    onError
  } = options;

  const [state, dispatch] = useReducer(battleHubReducer, initialState);

  // Actions
  const selectTeam = useCallback((team: any) => {
    if (!team) {
      dispatch({ type: 'SET_ERROR', payload: 'Équipe invalide' });
      return;
    }

    dispatch({ type: 'SELECT_TEAM', payload: team });
    onTeamSelected?.(team);
  }, [onTeamSelected]);

  const selectEnemy = useCallback((enemy: any) => {
    if (!enemy) {
      dispatch({ type: 'SET_ERROR', payload: 'Équipe ennemie invalide' });
      return;
    }

    if (enemy.id === state.selectedTeam?.id) {
      dispatch({ type: 'SET_ERROR', payload: 'Vous ne pouvez pas combattre contre votre propre équipe' });
      return;
    }

    dispatch({ type: 'SELECT_ENEMY', payload: enemy });
    onEnemySelected?.(enemy);

    // Vérifier si on est prêt pour le combat
    if (state.selectedTeam && state.battleMode) {
      onBattleReady?.(state.selectedTeam, enemy, state.battleMode);
    }
  }, [state.selectedTeam, state.battleMode, onEnemySelected, onBattleReady]);

  const selectBattleMode = useCallback((mode: 'interactive' | 'simulated') => {
    if (!state.selectedTeam) {
      dispatch({ type: 'SET_ERROR', payload: 'Veuillez d\'abord sélectionner une équipe' });
      return;
    }

    dispatch({ type: 'SELECT_BATTLE_MODE', payload: mode });
    onBattleModeSelected?.(mode);
  }, [state.selectedTeam, onBattleModeSelected]);

  const cancelEnemySelection = useCallback(() => {
    dispatch({ type: 'CANCEL_ENEMY_SELECTION' });
  }, []);

  const resetBattle = useCallback(() => {
    dispatch({ type: 'RESET_BATTLE' });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const goToStep = useCallback((step: BattleHubState['currentStep']) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  // Utilitaires
  const canSelectBattleMode = useCallback(() => {
    return !!state.selectedTeam;
  }, [state.selectedTeam]);

  const canSelectEnemy = useCallback(() => {
    return !!(state.selectedTeam && state.battleMode);
  }, [state.selectedTeam, state.battleMode]);

  const canStartBattle = useCallback(() => {
    return !!(state.selectedTeam && state.enemyTeam && state.battleMode);
  }, [state.selectedTeam, state.enemyTeam, state.battleMode]);

  const getBattleUrl = useCallback(() => {
    if (!canStartBattle()) return null;

    const baseUrl = state.battleMode === 'interactive' 
      ? '/dashboard/battle/interactive' 
      : '/dashboard/battle/simulate';

    return `${baseUrl}?playerTeamId=${state.selectedTeam.id}&enemyTeamId=${state.enemyTeam.id}`;
  }, [state.selectedTeam, state.enemyTeam, state.battleMode, canStartBattle]);

  const getAvailableEnemyTeams = useCallback((allTeams: any[]) => {
    if (!state.selectedTeam) return [];
    return allTeams.filter(team => team.id !== state.selectedTeam.id);
  }, [state.selectedTeam]);

  const getTeamStatus = useCallback((team: any) => {
    const pokemonCount = team.pokemon?.length || 0;
    
    if (pokemonCount >= 6) return { status: 'complete', label: 'Complète', color: 'text-green-400' };
    if (pokemonCount >= 3) return { status: 'ready', label: 'Prête', color: 'text-yellow-400' };
    return { status: 'incomplete', label: 'Incomplète', color: 'text-red-400' };
  }, []);

  const getBattleModeInfo = useCallback((mode: 'interactive' | 'simulated') => {
    const modes = {
      interactive: {
        title: 'Combat Interactif',
        description: 'Contrôlez chaque attaque de vos Pokémon et combattez contre une autre équipe',
        icon: '🎮',
        features: ['Combat en temps réel', 'Stratégie requise', 'Expérience immersive'],
        color: 'from-blue-500/20 to-purple-500/20',
        borderColor: 'border-blue-400/30'
      },
      simulated: {
        title: 'Combat Simulé',
        description: 'Combat automatique rapide avec résultat instantané',
        icon: '⚡',
        features: ['Résultat instantané', 'Combat automatique', 'Statistiques détaillées'],
        color: 'from-yellow-500/20 to-orange-500/20',
        borderColor: 'border-yellow-400/30'
      }
    };

    return modes[mode];
  }, []);

  return {
    // État
    selectedTeam: state.selectedTeam,
    enemyTeam: state.enemyTeam,
    battleMode: state.battleMode,
    showEnemySelection: state.showEnemySelection,
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    selectTeam,
    selectEnemy,
    selectBattleMode,
    cancelEnemySelection,
    resetBattle,
    setLoading,
    setError,
    goToStep,

    // Utilitaires
    canSelectBattleMode,
    canSelectEnemy,
    canStartBattle,
    getBattleUrl,
    getAvailableEnemyTeams,
    getTeamStatus,
    getBattleModeInfo
  };
} 