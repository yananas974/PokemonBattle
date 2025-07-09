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
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { formatResponse, POKEMON_MESSAGES, validateId } from '@pokemon-battle/shared';
import { PokemonTypeService } from '../services/pokemonTypeService/pokemonTypeService.js';

// ✅ TYPES
interface PokemonHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

// ✅ HELPERS
const formatPokemonResponse = (pokemon: any) => ({
  id: pokemon.pokeapi_id,
  name_fr: pokemon.name,
  sprite_url: pokemon.sprite_url,
  type: pokemon.type,
  base_hp: pokemon.base_hp,
  base_attack: pokemon.base_attack,
  base_defense: pokemon.base_defense,
  base_speed: pokemon.base_speed,
  height: pokemon.height,
  weight: pokemon.weight
});

const withPokemonValidation = async (
  c: Context,
  pokemonId: number,
  handler: (pokemon: any) => any
) => {
  const pokemon = await db
    .select()
    .from(pokemonReference)
    .where(eq(pokemonReference.pokeapi_id, pokemonId))
    .limit(1);

  if (pokemon.length === 0) {
    throw new NotFoundError('Pokémon');
  }

  return handler(pokemon[0]);
};

// ✅ VALIDATORS GROUPÉS
export const pokemonValidators = {
  getPokemonById: zValidator('param', z.object({ 
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val), {
      message: 'Pokemon ID must be a valid number'
    })
  })),
  pokemonQuery: zValidator('query', pokemonQuerySchema.optional())
};

// ✅ HANDLERS GROUPÉS
export const pokemonHandlers: PokemonHandler = {
  getAllPokemon: asyncHandler(async (c: Context) => {
    const pokemon = await db
      .select()
      .from(pokemonReference)
      .orderBy(asc(pokemonReference.pokeapi_id));

    const formattedPokemon = pokemon.map(formatPokemonResponse);

    return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
      pokemon: formattedPokemon,
      totalCount: formattedPokemon.length
    }));
  }),

  getPokemonById: asyncHandler(async (c: Context) => {
    const pokemonId = validateId(c.req.param('id'), 'Pokemon ID');

    return withPokemonValidation(c, pokemonId, (pokemon) => {
      const formattedPokemon = formatPokemonResponse(pokemon);
      return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
        pokemon: formattedPokemon
      }));
    });
  }),

  getTypesDebug: asyncHandler(async (c: Context) => {
    const types = await PokemonTypeService.getUniqueTypes();
    const cacheStats = PokemonTypeService.getCacheStats();
    
    return c.json(formatResponse('Pokemon types debug info retrieved', {
      types,
      typesCount: types.length,
      cache: cacheStats
    }));
  }),

  invalidateTypeCache: asyncHandler(async (c: Context) => {
    PokemonTypeService.invalidateCache();
    
    return c.json(formatResponse('Pokemon type cache invalidated successfully'));
  }),

  searchPokemon: asyncHandler(async (c: Context) => {
    const query = c.req.query('search')?.toLowerCase();
    const type = c.req.query('type');
    
    let dbQuery = db.select().from(pokemonReference);
    
    if (query) {
      // Recherche par nom (simulation d'un LIKE en utilisant un filtre)
      const allPokemon = await dbQuery;
      const filtered = allPokemon.filter(p => 
        p.name.toLowerCase().includes(query)
      );
      
      if (type) {
        const typeFiltered = filtered.filter(p => 
          p.type.toLowerCase() === type.toLowerCase()
        );
        return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
          pokemon: typeFiltered.map(formatPokemonResponse),
          totalCount: typeFiltered.length,
          filters: { search: query, type }
        }));
      }
      
      return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
        pokemon: filtered.map(formatPokemonResponse),
        totalCount: filtered.length,
        filters: { search: query }
      }));
    }
    
    if (type) {
      const allPokemon = await dbQuery;
      const typeFiltered = allPokemon.filter(p => 
        p.type.toLowerCase() === type.toLowerCase()
      );
      
      return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
        pokemon: typeFiltered.map(formatPokemonResponse),
        totalCount: typeFiltered.length,
        filters: { type }
      }));
    }
    
    // Si aucun filtre, retourner tous les Pokemon
    const pokemon = await dbQuery.orderBy(asc(pokemonReference.pokeapi_id));
    return c.json(formatResponse(POKEMON_MESSAGES.RETRIEVED, {
      pokemon: pokemon.map(formatPokemonResponse),
      totalCount: pokemon.length
    }));
  })
};