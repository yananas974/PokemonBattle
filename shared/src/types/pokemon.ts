// ✅ TYPES ET ENUMS COMMUNS
export enum PokemonType {
  NORMAL = 'normal',
  FIRE = 'fire', 
  WATER = 'water',
  ELECTRIC = 'electric',
  GRASS = 'grass',
  ICE = 'ice',
  FIGHTING = 'fighting',
  POISON = 'poison',
  GROUND = 'ground',
  FLYING = 'flying',
  PSYCHIC = 'psychic',
  BUG = 'bug',
  ROCK = 'rock',
  GHOST = 'ghost',
  DRAGON = 'dragon',
  DARK = 'dark',
  STEEL = 'steel',
  FAIRY = 'fairy'
}

// ✅ INTERFACE POKEMON API (format standardisé)
export interface Pokemon {
  id: number;
  name_fr: string;
  name_en?: string;
  type: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  height: number;
  weight: number;
  sprite_url: string;
  back_sprite_url?: string;
}

// ✅ POKEMON DANS UNE ÉQUIPE
export interface PokemonInTeam extends Pokemon {
  pokemon_id: number;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

// ✅ POKEMON DÉTAILLÉ (pour la page de détail)
export interface PokemonDetail extends Pokemon {
  types: string[];
  generation: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  description: string;
  moves: string[];
}

// ✅ POKEMON DE COMBAT
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
  status?: 'normal' | 'poisoned' | 'paralyzed' | 'sleeping' | 'frozen' | 'burned';
}

// ✅ REQUÊTES ET RÉPONSES API
export interface PokemonResponse {
  success: boolean;
  pokemon: Pokemon[];
  totalCount?: number;
  fallback?: boolean;
}

export interface PokemonDetailResponse {
  success: boolean;
  pokemon?: PokemonDetail;
  message?: string;
  error?: string;
}

export interface CreatePokemonRequest {
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
  back_sprite_url?: string;
} 