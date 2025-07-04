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