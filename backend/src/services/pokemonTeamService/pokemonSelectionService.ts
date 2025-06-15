import { eq, and } from "drizzle-orm";
import { pokemon, pokemonReference, Team } from "../../db/schema.js";
import { Create, CreateMany } from "../../db/crud/create.js";
import { Delete } from "../../db/crud/delete.js";
import { Get, GetMany } from "../../db/crud/get.js";
import { db } from '../../config/drizzle.config.js';


const MAX_POKEMON_PER_TEAM = 6;

async function countPokemonInTeam(teamId: number): Promise<number> {
  try {
    const teamPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, teamId));
    return teamPokemon.length;
  } catch (error) {
    console.error(`Erreur lors du comptage des Pokemon de l'équipe ${teamId}:`, error);
    return 0;
  }
}

export async function getOrCreatePokemonReference(pokemonId: number) {
  try {
    const existing = await db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, pokemonId))
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    throw new Error(`Pokémon ${pokemonId} non trouvé dans la base de données. Assurez-vous que le seed a été exécuté.`);
    
  } catch (error) {
    console.error(`❌ Erreur récupération Pokémon ${pokemonId} depuis BDD:`, error);
    throw error;
  }
}

export async function createPokemonSelection(teamId: number, pokemonId: number) {
  try {
    const pokemonRef = await getOrCreatePokemonReference(pokemonId);
    
    const pokemonData = {
      pokemon_reference_id: pokemonRef.id,
      level: 1,
      hp: pokemonRef.base_hp || 100,
      attack: pokemonRef.base_attack || 50,
      defense: pokemonRef.base_defense || 50,
      speed: pokemonRef.base_speed || 50,
      team_id: teamId,
    };
    
    return Create(pokemon, pokemonData);
  } catch (error) {
    console.error(`❌ Erreur création sélection Pokémon:`, error);
    throw error;
  }
}

export async function createManyPokemonSelection(teamId: number, pokemonIds: number[]) {
  try {
    const currentCount = await countPokemonInTeam(teamId);
    const totalAfterAdd = currentCount + pokemonIds.length;
    
    if (totalAfterAdd > MAX_POKEMON_PER_TEAM) {
      throw new Error(`L'équipe ne peut contenir que ${MAX_POKEMON_PER_TEAM} Pokémon maximum`);
    }

    // Obtenir toutes les références Pokemon
    const pokemonRefs = await Promise.all(
      pokemonIds.map(pokemonId => getOrCreatePokemonReference(pokemonId))
    );

    // Vérifier les doublons
    const existingPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, teamId));
    const existingRefIds = existingPokemon.map(p => p.pokemon_reference_id);
    const duplicates = pokemonRefs.filter(ref => existingRefIds.includes(ref.id));
    
    if (duplicates.length > 0) {
      throw new Error(`Ces Pokémon sont déjà dans l'équipe`);
    }

    // Créer les enregistrements
    const pokemonRecords = pokemonRefs.map(pokemonRef => ({
      pokemon_reference_id: pokemonRef.id,
      level: 1,
      hp: pokemonRef.base_hp || 100,
      attack: pokemonRef.base_attack || 50,
      defense: pokemonRef.base_defense || 50,
      speed: pokemonRef.base_speed || 50,
      team_id: teamId
    }));
    
    return CreateMany(pokemon, pokemonRecords);
  } catch (error) {
    console.error('Erreur lors de la création multiple de sélections Pokemon:', error);
    throw error;
  }
}

export async function deletePokemonSelection(teamId: number, pokemonId: number) {
  try {
    const pokemonRef = await Get<typeof pokemonReference.$inferSelect>(pokemonReference, eq(pokemonReference.pokeapi_id, pokemonId));
    
    if (!pokemonRef) {
      throw new Error('Pokémon non trouvé');
    }

    return Delete(pokemon, and(
      eq(pokemon.team_id, teamId), 
      eq(pokemon.pokemon_reference_id, pokemonRef.id)
    )!);
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
}

export async function getTeamPokemonCount(teamId: number): Promise<number> {
  return countPokemonInTeam(teamId);
}







