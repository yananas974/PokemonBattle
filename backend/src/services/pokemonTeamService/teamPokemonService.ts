import { eq } from "drizzle-orm";
import { pokemon, pokemonReference } from "../../db/schema.js";
import { db } from "../../config/drizzle.config.js";

export async function getTeamPokemon(teamId: number) {
  // ✅ Jointure pour récupérer les données complètes
  const result = await db
    .select({
      id: pokemon.id,
      level: pokemon.level,
      hp: pokemon.hp,
      attack: pokemon.attack,
      defense: pokemon.defense,
      speed: pokemon.speed,
      team_id: pokemon.team_id,
      // Données de référence
      pokemon_id: pokemonReference.pokeapi_id,
      name_fr: pokemonReference.name,
      sprite_url: pokemonReference.sprite_url,
      type: pokemonReference.type,
    })
    .from(pokemon)
    .innerJoin(pokemonReference, eq(pokemon.pokemon_reference_id, pokemonReference.id))
    .where(eq(pokemon.team_id, teamId));
    
  return result;
} 