export interface Pokemon {
  id: number;
  nameFr: string;
  sprite_url: string;
}

export interface PokemonResponse {
  pokemon: Pokemon[];
} 