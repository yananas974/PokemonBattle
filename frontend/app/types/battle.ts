// ✅ RÉEXPORT DES TYPES BATTLE SHARED AVEC ADAPTATIONS FRONTEND
export { 
  type Battle, 
  type BattlePokemon, 
  type ExtendedBattlePokemon,
  type BattleResult, 
  type BattleLogEntry,
  type InteractiveBattleState,
  type TurnBasedBattleState,
  type TurnAction,
  type PokemonMove,
  type HackChallenge,
  type PlayerMoveRequest,
  type HackChallengeResponse,
  type TeamStats,
  type BattleResponse,
  type InteractiveBattleResponse,
  type InteractiveBattleData,
  type CreateBattleRequest,
  type BattleActionRequest,
  type BattleActionResponse,
  type BattleWithDetails,
  type CreateBattleResponse,
  type PokemonWithEffects
} from '@pokemon-battle/shared';

// ✅ RÉEXPORT DES TYPES WEATHER
export { 
  type WeatherEffect 
} from '@pokemon-battle/shared';

// ✅ TYPES MANQUANTS POUR COMPATIBILITÉ
export interface BattleAction {
  type: string;
  moveId?: any;
  moveName?: any;
}

export interface InitBattleRequest {
  playerTeamId: number;
  enemyTeamId: number;
  lat?: number;
  lon?: number;
}

export interface ExecuteActionRequest {
  battleId: string;
  action: BattleAction;
}

// ✅ TYPES SPÉCIFIQUES AU FRONTEND POUR LES BATAILLES
export interface BattleUIState {
  isLoading: boolean;
  isAnimating: boolean;
  currentTurn: number;
  phase: 'setup' | 'battle' | 'result';
  selectedMove?: string;
  showMoveSelector: boolean;
  showResultModal: boolean;
}

export interface BattleSimulationState {
  currentStep: number;
  selectedTeam: any;
  enemyTeam: any;
  battleMode: 'quick' | 'detailed';
  useWeather: boolean;
  isSimulating: boolean;
  battleResult: any;
  showResultModal: boolean;
}

export interface HackChallengeState {
  isOpen: boolean;
  currentChallenge: any;
  userInput: string;
  isSubmitting: boolean;
}