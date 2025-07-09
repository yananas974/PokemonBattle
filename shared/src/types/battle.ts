import { BattlePokemon } from './pokemon';

// ✅ INTERFACE COMBAT
export interface Battle {
  id: number;
  player1_id: number;
  player2_id?: number;
  status: 'waiting' | 'active' | 'finished';
  winner_id?: number;
  created_at: string;
  updated_at: string;
}

// ✅ POKEMON DE COMBAT ÉTENDU (pour les combats interactifs)
export interface ExtendedBattlePokemon extends BattlePokemon {
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  current_hp: number;
  max_hp: number;
  effective_attack: number;
  effective_defense: number;
  effective_speed: number;
  is_ko: boolean;
  team: 'team1' | 'team2';
  position: number;
  weatherMultiplier: number;
  weatherStatus: string;
  statusCondition: 'none' | 'burn' | 'freeze' | 'paralysis' | 'poison' | 'sleep';
  statusTurns: number;
}

// ✅ COMBAT AVEC DÉTAILS
export interface BattleWithDetails extends Battle {
  player1_pokemon: BattlePokemon[];
  player2_pokemon?: BattlePokemon[];
  battle_log: BattleLogEntry[];
}

// ✅ ENTRÉE DE LOG DE COMBAT
export interface BattleLogEntry {
  id: number;
  battle_id: number;
  action_type: 'attack' | 'switch' | 'item' | 'status';
  pokemon_id: number;
  target_id?: number;
  move_name?: string;
  damage?: number;
  message: string;
  timestamp: string;
}

// ✅ MOVE POKÉMON
export interface PokemonMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
  criticalHitRatio: number;
  description: string;
}

// ✅ ACTION DE COMBAT DÉTAILLÉE
export interface TurnAction {
  turn: number;
  phase: string;
  attacker: ExtendedBattlePokemon;
  defender: ExtendedBattlePokemon;
  move: PokemonMove;
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
  stab: boolean;
  weatherBonus: number;
  accuracy: boolean;
  description: string;
  remainingHP: number;
  isKO: boolean;
}

// ✅ ÉTAT DE COMBAT TOUR PAR TOUR
export interface TurnBasedBattleState {
  turn: number;
  phase: 'init' | 'battle' | 'finished';
  battlePhase: 'move_selection' | 'move_execution' | 'switch' | 'finished';
  currentTeam1Pokemon: ExtendedBattlePokemon | null;
  currentTeam2Pokemon: ExtendedBattlePokemon | null;
  team1Pokemon: any[];
  team2Pokemon: any[];
  battleLog: TurnAction[];
  weatherEffects: any;
  winner: 'team1' | 'team2' | 'draw' | null;
}

// ✅ ÉTAT DE COMBAT INTERACTIF
export interface InteractiveBattleState extends TurnBasedBattleState {
  isPlayerTurn: boolean;
  waitingForPlayerMove: boolean;
  availableMoves: PokemonMove[];
  battleId: string;
  weatherTurns: number;
  timeBonus: number;
  hackChallenge?: HackChallenge | null;
  isHackActive: boolean;
  hackStartTime?: number;
}

// ✅ CHALLENGE DE HACK
export interface HackChallenge {
  id: string;
  encrypted_code: string;
  solution: string;
  algorithm: string;
  difficulty: string;
  explanation: string;
  time_limit: number;
}

// ✅ REQUÊTE DE MOUVEMENT JOUEUR
export interface PlayerMoveRequest {
  battleId: string;
  moveIndex: number;
  userId: number;
}

// ✅ RÉPONSE DE HACK CHALLENGE
export interface HackChallengeResponse {
  success: boolean;
  message: string;
  battleState?: InteractiveBattleState;
}

// ✅ STATISTIQUES D'ÉQUIPE
export interface TeamStats {
  totalHP: number;
  remainingHP: number;
  pokemonCount: number;
  activePokemon: number;
  faintedPokemon: number;
  averageLevel: number;
  typeAdvantages: string[];
}

// ✅ RÉSULTAT DE COMBAT
export interface BattleResult {
  winner: 'team1' | 'team2' | 'draw';
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  battleLog: BattleLogEntry[];
  duration: number;
  totalTurns: number;
  weatherEffects?: any;
  timeBonus?: number;
}

// ✅ RÉPONSE DE COMBAT
export interface BattleResponse {
  success: boolean;
  battle?: BattleResult;
  message?: string;
  error?: string;
  weatherEffects?: any;
  timeBonus?: number;
}

// ✅ POKÉMON AVEC EFFETS
export interface PokemonWithEffects extends BattlePokemon {
  statusEffects: string[];
  temporaryStats: {
    attack: number;
    defense: number;
    speed: number;
  };
  weatherBonus: number;
  typeEffectiveness: number;
}

// ✅ REQUÊTES ET RÉPONSES API
export interface CreateBattleRequest {
  team_id: number;
}

export interface CreateBattleResponse {
  success: boolean;
  battle?: BattleWithDetails;
  message?: string;
  error?: string;
}

export interface BattleActionRequest {
  action_type: 'attack' | 'switch' | 'item';
  pokemon_id: number;
  target_id?: number;
  move_name?: string;
  item_id?: number;
}

export interface BattleActionResponse {
  success: boolean;
  battle?: BattleWithDetails;
  message?: string;
  error?: string;
} 