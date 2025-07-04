import { db } from "../config/drizzle.config.js";
import { pokemonReference } from "../db/schema.js";
import { asc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../models/errors.js';
import { 
  getPokemonByIdParamsSchema,
  pokemonQuerySchema
} from '../schemas/index.js';
import { PokemonTypeService } from '../services/pokemonTypeService/pokemonTypeService.js';

// ✅ Handlers refactorisés sans try/catch
export const getAllPokemonHandler = asyncHandler(async (c: Context) => {
  const pokemon = await db
    .select()
    .from(pokemonReference)
    .orderBy(asc(pokemonReference.pokeapi_id));

  return c.json({
    success: true,
    pokemon: pokemon.map(p => ({
      id: p.pokeapi_id,
      nameFr: p.name,
      sprite_url: p.sprite_url,
      type: p.type,
      base_hp: p.base_hp,
      base_attack: p.base_attack,
      base_defense: p.base_defense,
      base_speed: p.base_speed,
      height: p.height,
      weight: p.weight
    }))
  });
});

export const getPokemonByIdHandler = asyncHandler(async (c: Context) => {
  const params = getPokemonByIdParamsSchema.parse({ id: c.req.param('id') });
  const pokemonId = params.id;

  const pokemon = await db
    .select()
    .from(pokemonReference)
    .where(eq(pokemonReference.pokeapi_id, pokemonId))
    .limit(1);

  if (pokemon.length === 0) {
    throw new NotFoundError('Pokémon');
  }

  const p = pokemon[0];
  return c.json({
    success: true,
    pokemon: {
      id: p.pokeapi_id,
      name_fr: p.name,
      sprite_url: p.sprite_url,
      type: p.type,
      base_hp: p.base_hp,
      base_attack: p.base_attack,
      base_defense: p.base_defense,
      base_speed: p.base_speed,
      height: p.height,
      weight: p.weight
    }
  });
});

// ✅ Endpoint de debug pour les types Pokemon
export const getTypesDebugHandler = asyncHandler(async (c: Context) => {
  const types = await PokemonTypeService.getUniqueTypes();
  const cacheStats = PokemonTypeService.getCacheStats();
  
  return c.json({
    success: true,
    data: {
      types,
      typesCount: types.length,
      cache: cacheStats
    }
  });
});

// ✅ Endpoint pour invalider le cache des types
export const invalidateTypeCacheHandler = asyncHandler(async (c: Context) => {
  PokemonTypeService.invalidateCache();
  
  return c.json({
    success: true,
    message: 'Cache des types Pokemon invalidé'
  });
});