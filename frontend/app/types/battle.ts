export interface PokemonMove {
  id: number;
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  description?: string;
}

export interface BattlePokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite_url: string;
  sprite_back_url?: string;
  moves: PokemonMove[];
  status?: 'normal' | 'poisoned' | 'paralyzed' | 'sleeping' | 'frozen' | 'burned';
}

export interface WeatherEffect {
  id: number;
  name: string;
  description: string;
  multiplier: number;
  affectedTypes: string[];
}

export interface BattleState {
  battleId: string;
  playerPokemon: BattlePokemon;
  enemyPokemon: BattlePokemon;
  currentTurn: 'player' | 'enemy';
  battleLog: string[];
  weather?: WeatherEffect;
  isFinished: boolean;
  winner?: 'player' | 'enemy' | 'draw';
  turnCount: number;
  isHackActive?: boolean;
  hackChallenge?: {
    id: string;
    encrypted_code: string;
    algorithm: string;
    difficulty: string;
    explanation: string;
    time_limit: number;
  } | null;
}

export interface BattleAction {
  type: 'attack' | 'flee';
  moveId?: number;
  moveName?: string;
}

export interface BattleResponse {
  success: boolean;
  battle?: BattleState;
  message?: string;
  error?: string;
}

export interface InitBattleRequest {
  playerTeamId: number;
  enemyTeamId: number;
}

export interface ExecuteActionRequest {
  battleId: string;
  action: BattleAction;
} 