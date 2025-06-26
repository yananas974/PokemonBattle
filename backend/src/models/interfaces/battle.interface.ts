import { WeatherEffectNew } from "../../services/weatherEffectService/weatherEffectService.js";
import { BattleTeam} from "../type/battle.type.js"; 
import { PokemonType } from "./pokemon.interface.js";

export interface BattlePokemonDetails {
  name: string;
  type: string;
  weatherStatus: string;
  multiplier: number;
}

export interface TeamStats {
  totalHP: number;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  weatherMultiplier: number;
  effectiveHP: number;
  effectiveAttack: number;
  effectiveDefense: number;
  pokemonDetails: BattlePokemonDetails[];
}

export interface BattleResult {
  winner: 'team1' | 'team2' | 'draw';
  team1Stats: TeamStats;
  team2Stats: TeamStats;
  battleLog: string[];
  weatherEffects: WeatherEffectNew | null;
  damage: {
    team1Damage: number;
    team2Damage: number;
  };
}
        
export interface BattleRequest {
  team1: BattleTeam;
  team2: BattleTeam;
  lat?: number;
  lon?: number;
}

export interface BattleResponse {
  success: boolean;
  result?: BattleResult;
  error?: string;
} 

export interface BattlePokemon {
  id: number;
  name_fr: string;
  type: PokemonType;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
}

export interface PokemonWithEffects extends Omit<BattlePokemon, 'base_hp' | 'base_attack' | 'base_defense' | 'base_speed'> {
  effective_hp: number;
  effective_attack: number;
  effective_defense: number;
  effective_speed: number;
  weatherStatus: string;
  totalMultiplier: number;
}