import { eq, and } from "drizzle-orm";
import { pokemon, Team } from "../../db/schema.js";
import { Create } from "../../db/crud/create.js";
import { CreateMany } from "../../db/crud/create.js";
import { Delete } from "../../db/crud/delete.js";





export async function createPokemonSelection(teamId: number, pokemonId: number) {
  return Create(pokemon, { team_id: teamId, pokemon_id: pokemonId });
}

export async function createManyPokemonSelection(teamId: number, pokemonIds: number[]) {
  return CreateMany(pokemon, pokemonIds.map(pokemonId => ({ team_id: teamId, pokemon_id: pokemonId })));
}

export async function deletePokemonSelection(teamId: number, pokemonId: number) {
  return Delete(pokemon, eq(pokemon.id, pokemonId));
}





