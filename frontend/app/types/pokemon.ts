export interface Pokemon {
  id: number;
  nameFr: string;
  sprite_url: string;
  type: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  height: number;
  weight: number;
}

export interface PokemonInTeam extends Pokemon {
  pokemon_id: number;
  name_fr: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

export interface PokemonResponse {
  success: boolean;
  pokemon: Pokemon[];
} 