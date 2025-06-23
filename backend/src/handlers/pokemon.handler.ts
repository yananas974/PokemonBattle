import { db } from "../config/drizzle.config.js";
import { pokemonReference } from "../db/schema.js";
import { asc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../models/errors.js';

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
  const pokemonId = parseInt(c.req.param('id'));
  
  if (isNaN(pokemonId)) {
    throw new ValidationError('ID Pokémon invalide');
  }

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
      nameFr: p.name,
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