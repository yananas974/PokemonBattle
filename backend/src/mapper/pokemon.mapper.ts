import { Pokemon, BattlePokemon, PokemonWithEffects } from '@pokemon-battle/shared';

// ✅ Types de base de données (basés sur le schéma Drizzle)
export interface PokemonDB {
  id: number;
  pokemon_reference_id: number;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  team_id: number | null;
  created_at: Date;
}

export interface PokemonReferenceDB {
  id: number;
  pokeapi_id: number;
  name: string;
  type: string;
  base_hp: number | null;
  base_attack: number | null;
  base_defense: number | null;
  base_speed: number | null;
  height: number | null;
  weight: number | null;
  sprite_url: string | null;
  back_sprite_url: string | null;
  created_at: Date;
}

// ✅ Type pour les données jointes (pokemon + pokemon_reference)
export interface PokemonWithReferenceDB extends PokemonDB {
  pokemon_reference: PokemonReferenceDB;
}

// ✅ MAPPERS - FOCUS SUR POKEMON (pas combat)

/**
 * Mapper: Base de données → Interface API Pokemon
 */
export const mapPokemonToApi = (pokemonDB: PokemonWithReferenceDB): Pokemon & { pokemon_reference_id: number } => ({
  id: pokemonDB.id,
  pokemon_reference_id: pokemonDB.pokemon_reference_id,
  name_fr: pokemonDB.pokemon_reference.name,
  name_en: pokemonDB.pokemon_reference.name,
  type: pokemonDB.pokemon_reference.type,
  base_hp: pokemonDB.pokemon_reference.base_hp || 50,
  base_attack: pokemonDB.pokemon_reference.base_attack || 50,
  base_defense: pokemonDB.pokemon_reference.base_defense || 50,
  base_speed: pokemonDB.pokemon_reference.base_speed || 50,
  height: pokemonDB.pokemon_reference.height || 0,
  weight: pokemonDB.pokemon_reference.weight || 0,
  sprite_url: pokemonDB.pokemon_reference.sprite_url || '',
  back_sprite_url: pokemonDB.pokemon_reference.back_sprite_url || ''
});

/**
 * Mapper: PokemonReferenceDB → Pokemon API (pour les données de référence)
 */
export const mapPokemonReferenceToApi = (pokemonRef: PokemonReferenceDB): Pokemon => ({
  id: pokemonRef.id,
  name_fr: pokemonRef.name,
  name_en: pokemonRef.name,
  type: pokemonRef.type,
  base_hp: pokemonRef.base_hp || 50,
  base_attack: pokemonRef.base_attack || 50,
  base_defense: pokemonRef.base_defense || 50,
  base_speed: pokemonRef.base_speed || 50,
  height: pokemonRef.height || 0,
  weight: pokemonRef.weight || 0,
  sprite_url: pokemonRef.sprite_url || '',
  back_sprite_url: pokemonRef.back_sprite_url || ''
});

/**
 * Mapper: Données jointes de requête → Pokemon API
 */
export const mapJoinedPokemonToApi = (joinedData: any): Pokemon => ({
  id: joinedData.id,
  name_fr: joinedData.name_fr || joinedData.name,
  name_en: joinedData.name_en || joinedData.name,
  type: joinedData.type,
  base_hp: joinedData.hp || joinedData.base_hp || 50,
  base_attack: joinedData.attack || joinedData.base_attack || 50,
  base_defense: joinedData.defense || joinedData.base_defense || 50,
  base_speed: joinedData.speed || joinedData.base_speed || 50,
  height: joinedData.height || 0,
  weight: joinedData.weight || 0,
  sprite_url: joinedData.sprite_url || '',
  back_sprite_url: joinedData.back_sprite_url || ''
});

/**
 * Mapper: Pokemon → Format Frontend
 */
export const mapPokemonToFrontend = (pokemon: Pokemon) => ({
  id: pokemon.id,
  nameFr: pokemon.name_fr,
  nameEn: pokemon.name_en,
  type: pokemon.type,
  baseHp: pokemon.base_hp,
  baseAttack: pokemon.base_attack,
  baseDefense: pokemon.base_defense,
  baseSpeed: pokemon.base_speed,
  height: pokemon.height,
  weight: pokemon.weight,
  sprite_url: pokemon.sprite_url,
  back_sprite_url: pokemon.back_sprite_url
});

/**
 * Utilitaires Pokemon
 */
export const validatePokemonStats = (pokemon: Partial<Pokemon>): boolean => {
  return !!(
    pokemon.base_hp && pokemon.base_hp > 0 &&
    pokemon.base_attack && pokemon.base_attack > 0 &&
    pokemon.base_defense && pokemon.base_defense > 0 &&
    pokemon.base_speed && pokemon.base_speed > 0
  );
};

export const calculatePokemonPower = (pokemon: Pokemon): number => {
  return pokemon.base_hp + pokemon.base_attack + pokemon.base_defense + pokemon.base_speed;
};

