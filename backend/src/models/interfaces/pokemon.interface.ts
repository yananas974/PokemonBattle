import type { PokemonType } from '../../services/weatherEffectService/weatherEffectService.js';
export type { PokemonType };

export interface Pokemon {
  id: number; 
  pokemon_id: number;
  name: string;
  type: string; 
  level: number; 
  hp: number;
  attack: number; 
  defense: number; 
  speed: number; 
  height: number; 
  weight: number; 
  sprite_url: string; 
  user_id: number; 
  created_at: Date; 
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

export interface PokemonWithEffects extends BattlePokemon {
  effective_hp: number;
  effective_attack: number;
  effective_defense: number;
  effective_speed: number;
  weatherStatus: string;
  totalMultiplier: number;
}