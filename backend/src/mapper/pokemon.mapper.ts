import { Pokemon } from "../models/interfaces/pokemon.interface.js";
import { BattlePokemon, PokemonWithEffects } from "../models/interfaces/battle.interface.js";
import { PokemonType } from "../services/weatherEffectService/weatherEffectService.js";

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

// ✅ Type pour les requêtes de création
export type CreatePokemonRequest = Omit<Pokemon, 'id' | 'user_id' | 'created_at'>;

// ✅ MAPPERS - FOCUS SUR POKEMON (pas combat)

/**
 * Mapper: Base de données → Interface API Pokemon
 */
export const mapPokemonToApi = (pokemonDB: PokemonWithReferenceDB): Pokemon => ({
  id: pokemonDB.id,
  pokemon_id: pokemonDB.pokemon_reference.pokeapi_id,
  name: pokemonDB.pokemon_reference.name,
  type: pokemonDB.pokemon_reference.type,
  level: pokemonDB.level || 1,
  hp: pokemonDB.hp || 100,
  attack: pokemonDB.attack || 50,
  defense: pokemonDB.defense || 50,
  speed: pokemonDB.speed || 50,
  height: pokemonDB.pokemon_reference.height || 0,
  weight: pokemonDB.pokemon_reference.weight || 0,
  sprite_url: pokemonDB.pokemon_reference.sprite_url || '',
  back_sprite_url: pokemonDB.pokemon_reference.back_sprite_url || '',
  user_id: pokemonDB.team_id || 0,
  created_at: pokemonDB.created_at
});

/**
 * Mapper: PokemonReferenceDB → Pokemon API (pour les données de référence)
 */
export const mapPokemonReferenceToApi = (pokemonRef: PokemonReferenceDB): Omit<Pokemon, 'id' | 'user_id' | 'created_at' | 'level'> => ({
  pokemon_id: pokemonRef.pokeapi_id,
  name: pokemonRef.name,
  type: pokemonRef.type,
  hp: pokemonRef.base_hp || 50,
  attack: pokemonRef.base_attack || 50,
  defense: pokemonRef.base_defense || 50,
  speed: pokemonRef.base_speed || 50,
  height: pokemonRef.height || 0,
  weight: pokemonRef.weight || 0,
  sprite_url: pokemonRef.sprite_url || '',
  back_sprite_url: pokemonRef.back_sprite_url || ''
});

/**
 * Mapper: Requête de création → Données pour la base
 */
export const mapCreatePokemonToDb = (
  request: CreatePokemonRequest,
  teamId?: number
): Omit<PokemonDB, 'id' | 'created_at'> => ({
  pokemon_reference_id: request.pokemon_id,
  level: request.level || 1,
  hp: request.hp || 100,
  attack: request.attack || 50,
  defense: request.defense || 50,
  speed: request.speed || 50,
  team_id: teamId || null
});

/**
 * Mapper: Données jointes de requête → Pokemon API
 * Utilisé pour les requêtes avec jointure pokemon + pokemon_reference
 */
export const mapJoinedPokemonToApi = (joinedData: {
  id: number;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  team_id: number | null;
  pokemon_id: number;
  name_fr: string;
  sprite_url: string | null;
  back_sprite_url?: string | null;
  type: string;
  height?: number | null;
  weight?: number | null;
  created_at?: Date;
}): Pokemon => ({
  id: joinedData.id,
  pokemon_id: joinedData.pokemon_id,
  name: joinedData.name_fr,
  type: joinedData.type,
  level: joinedData.level,
  hp: joinedData.hp,
  attack: joinedData.attack,
  defense: joinedData.defense,
  speed: joinedData.speed,
  height: joinedData.height || 0,
  weight: joinedData.weight || 0,
  sprite_url: joinedData.sprite_url || '',
  back_sprite_url: joinedData.back_sprite_url || '',
  user_id: joinedData.team_id || 0,
  created_at: joinedData.created_at || new Date()
});

/**
 * Mapper: Pokemon → Format Frontend
 */
export const mapPokemonToFrontend = (pokemon: Pokemon) => ({
  id: pokemon.id,
  pokemon_id: pokemon.pokemon_id,
  nameFr: pokemon.name,
  type: pokemon.type,
  level: pokemon.level,
  hp: pokemon.hp,
  attack: pokemon.attack,
  defense: pokemon.defense,
  speed: pokemon.speed,
  height: pokemon.height,
  weight: pokemon.weight,
  sprite_url: pokemon.sprite_url,
  back_sprite_url: pokemon.back_sprite_url,
    userId: pokemon.user_id,
  createdAt: pokemon.created_at.toISOString()
});

/**
 * Utilitaires Pokemon (pas de doublon avec battle.mapper.ts)
 */
export const validatePokemonStats = (pokemon: Partial<Pokemon>): boolean => {
  return !!(
    pokemon.hp && pokemon.hp > 0 &&
    pokemon.attack && pokemon.attack > 0 &&
    pokemon.defense && pokemon.defense > 0 &&
    pokemon.speed && pokemon.speed > 0
  );
};

export const calculatePokemonPower = (pokemon: Pokemon): number => {
  return pokemon.hp + pokemon.attack + pokemon.defense + pokemon.speed;
};

/**
 * Mapper: BattlePokemon → PokemonWithEffects (avec effets météo)
 * ⚠️ Complément au battle.mapper.ts, pas de doublon
 */
export const mapBattlePokemonWithEffects = (
  battlePokemon: BattlePokemon,
  weatherMultiplier: number,
  weatherStatus: string
): PokemonWithEffects => ({
  ...battlePokemon,
  effective_hp: Math.round(battlePokemon.base_hp * weatherMultiplier),
  effective_attack: Math.round(battlePokemon.base_attack * weatherMultiplier),
  effective_defense: Math.round(battlePokemon.base_defense * weatherMultiplier),
  effective_speed: Math.round(battlePokemon.base_speed * weatherMultiplier),
  weatherStatus,
  totalMultiplier: weatherMultiplier
});

