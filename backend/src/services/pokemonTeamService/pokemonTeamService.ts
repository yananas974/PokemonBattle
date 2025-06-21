import { eq, and } from "drizzle-orm";
import { pokemon, pokemonReference } from "../../db/schema.js";
import { Create, Delete, GetMany } from "../../db/crud/crud.js";
import { db } from '../../config/drizzle.config.js';
import { TeamService } from "../createTeamService/teamService.js";
import { mapPokemonToApi, type PokemonWithReferenceDB } from "../../mapper/pokemon.mapper.js";
import type { Pokemon } from "../../models/interfaces/pokemon.interface.js";
import { z } from "zod";

const MAX_POKEMON_PER_TEAM = 6;

// ✅ Schémas Zod pour validation
const teamIdSchema = z.number().min(1, "Team ID must be positive");
const pokemonIdSchema = z.number().min(1, "Pokemon ID must be positive");
const userIdSchema = z.number().min(1, "User ID must be positive");

const addPokemonSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: pokemonIdSchema,
  userId: userIdSchema
});

const removePokemonSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: pokemonIdSchema,
  userId: userIdSchema
});

// ✅ SERVICE POKEMON - Gestion des Pokemon dans les équipes UNIQUEMENT
export class PokemonTeamService {

  /**
   * Récupérer tous les Pokemon d'une équipe
   */
  static async getTeamPokemon(teamId: number): Promise<Pokemon[]> {
    // ✅ Valider l'entrée
    teamIdSchema.parse(teamId);

    const result = await db
      .select({
        // Pokemon data
        pokemon: pokemon,
        // Pokemon reference data  
        pokemon_reference: pokemonReference
      })
      .from(pokemon)
      .innerJoin(pokemonReference, eq(pokemon.pokemon_reference_id, pokemonReference.id))
      .where(eq(pokemon.team_id, teamId));
      
    // ✅ Utiliser le mapper Pokemon unifié
    return result.map(row => mapPokemonToApi({
      ...row.pokemon,
      pokemon_reference: row.pokemon_reference
    } as PokemonWithReferenceDB));
  }

  /**
   * Compter le nombre de Pokemon dans une équipe
   */
  static async getTeamPokemonCount(teamId: number): Promise<number> {
    // ✅ Valider l'entrée
    teamIdSchema.parse(teamId);

    const teamPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, teamId));
    return teamPokemon.length;
  }

  /**
   * Récupérer une référence Pokemon par ID PokeAPI
   */
  static async getPokemonReference(pokemonId: number) {
    const existing = await db
      .select()
      .from(pokemonReference)
      .where(eq(pokemonReference.pokeapi_id, pokemonId))
      .limit(1);
    
    if (existing.length === 0) {
      throw new Error(`Pokémon ${pokemonId} non trouvé dans la base de données. Assurez-vous que le seed a été exécuté.`);
    }
    
    return existing[0];
  }

  /**
   * Ajouter un Pokemon à une équipe
   */
  static async addPokemonToTeam(teamId: number, pokemonId: number, userId: number) {
    // ✅ Valider toutes les entrées
    const validatedData = addPokemonSchema.parse({ teamId, pokemonId, userId });

    // Vérifier ownership
    const team = await TeamService.getTeamById(validatedData.teamId);
    if (!team || team.userId !== validatedData.userId) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }

    // Vérifier la limite
    const currentCount = await this.getTeamPokemonCount(validatedData.teamId);
    if (currentCount >= MAX_POKEMON_PER_TEAM) {
      throw new Error(`L'équipe ne peut contenir que ${MAX_POKEMON_PER_TEAM} Pokémon maximum`);
    }

    // ✅ Récupérer la référence Pokemon
    const pokemonRef = await this.getPokemonReference(validatedData.pokemonId);

    // ✅ Vérifier les doublons
    const existingPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, validatedData.teamId));
    const isDuplicate = existingPokemon.some(p => p.pokemon_reference_id === pokemonRef.id);
    
    if (isDuplicate) {
      throw new Error('Ce Pokémon est déjà dans l\'équipe');
    }

    // ✅ Créer le Pokemon avec les stats de base
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
  }

  /**
   * Retirer un Pokemon d'une équipe
   * @param teamId ID de l'équipe
   * @param pokemonPokeApiId ID PokeAPI du Pokemon (ex: 1 pour Bulbizarre)
   * @param userId ID de l'utilisateur
   */
  static async removePokemonFromTeam(teamId: number, pokemonPokeApiId: number, userId: number) {
    console.log('🗑️ === REMOVE POKEMON SERVICE APPELÉ ===');
    console.log('🔍 Paramètres:', { teamId, pokemonPokeApiId, userId });
    
    if (!teamId || !pokemonPokeApiId) {
      throw new Error('teamId et pokemonPokeApiId sont requis');
    }

    // ✅ Vérifier que l'équipe appartient à l'utilisateur
    const isOwner = await TeamService.verifyTeamOwnership(teamId, userId);
    if (!isOwner) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }

    // ✅ Trouver la référence Pokemon par PokeAPI ID
    console.log('🔍 Recherche référence Pokemon pour PokeAPI ID:', pokemonPokeApiId);
    const pokemonRef = await this.getPokemonReference(pokemonPokeApiId);
    console.log('✅ Référence trouvée:', pokemonRef);
    
    // ✅ Supprimer le Pokemon de l'équipe
    console.log('🗑️ Suppression Pokemon de l\'équipe:', { teamId, pokemon_reference_id: pokemonRef.id });
    const result = await Delete(pokemon, and(
      eq(pokemon.team_id, teamId), 
      eq(pokemon.pokemon_reference_id, pokemonRef.id)
    )!);
    
    console.log('✅ Pokemon supprimé avec succès');
    return result;
  }

  /**
   * Récupérer les équipes avec leurs Pokemon (méthode utilitaire)
   */
  static async getTeamsWithPokemon(userId: number) {
    const teams = await TeamService.getTeamsByUserId(userId);
    
    const teamsWithPokemon = await Promise.all(
      teams.map(async (team) => {
        try {
          const teamPokemon = await this.getTeamPokemon(team.id);
          return {
            ...team,
            pokemon: teamPokemon || []
          };
        } catch (error) {
          console.error(`Erreur récupération Pokemon équipe ${team.id}:`, error);
          return {
            ...team,
            pokemon: []
          };
        }
      })
    );
    
    return teamsWithPokemon;
  }

  static async deletePokemonSelection(teamId: number, pokemonId: number) {
    return Delete(pokemon, and(
      eq(pokemon.team_id, teamId), 
      eq(pokemon.pokemon_reference_id, pokemonId)
    )!);
  }
  
  
}

// ✅ Exports pour rétrocompatibilité
export const createPokemonSelection = PokemonTeamService.addPokemonToTeam;
export const deletePokemonSelection = PokemonTeamService.removePokemonFromTeam;
export const getTeamPokemon = PokemonTeamService.getTeamPokemon;
export const getTeamPokemonCount = PokemonTeamService.getTeamPokemonCount;
export const getTeamsWithPokemon = PokemonTeamService.getTeamsWithPokemon; 