import { db } from "../config/drizzle.config.js";
import { pokemonReference } from "../db/schema.js";
import { asc } from "drizzle-orm";
import type { Context } from "hono";
import { eq } from "drizzle-orm";

  export const getAllPokemonHandler = async (c: Context) => {
  try {
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
  } catch (error) {
    console.error('❌ Erreur récupération Pokémon BDD:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur lors de la récupération des Pokémon' 
    }, 500);
  }
};

export const getPokemonByIdHandler = async (c: Context) => {
  try {
    const pokemonId = parseInt(c.req.param('id'));
    
    if (isNaN(pokemonId)) {
      return c.json({ error: 'ID Pokémon invalide' }, 400);
    }

    const pokemon = await db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, pokemonId))
      .limit(1);

    if (pokemon.length === 0) {
      return c.json({ error: 'Pokémon non trouvé' }, 404);
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
  } catch (error) {
    console.error('❌ Erreur récupération Pokémon:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur lors de la récupération du Pokémon' 
    }, 500);
  }
};