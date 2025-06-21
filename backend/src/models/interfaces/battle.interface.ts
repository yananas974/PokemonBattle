import { WeatherEffectNew } from "../../services/weatherEffectService/weatherEffectService.js";


export interface Pokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite_url: string;
}

export interface Team {
  id: string;
  teamName: string;
  pokemon: Pokemon[];
  owner?: string;
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

export interface TeamStats {
  totalHP: number;
  totalAttack: number;
  totalDefense: number;
  totalSpeed: number;
  weatherMultiplier: number;
  effectiveHP: number;
  effectiveAttack: number;
  effectiveDefense: number;
  pokemonDetails: Array<{
    name: string;
    type: string;
    weatherStatus: string;
    multiplier: number;
  }>;
}

// ✅ Interfaces pour les données d'entrée (API)
export interface BattleRequest {
  team1: Team;
  team2: Team;
  lat?: number;
  lon?: number;
}

export interface BattleResponse {
  success: boolean;
  result?: BattleResult;
  error?: string;
} 