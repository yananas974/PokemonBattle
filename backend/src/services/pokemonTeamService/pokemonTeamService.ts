import { eq, and } from "drizzle-orm";
import { pokemon, pokemonReference } from "../../db/schema.js";
import { Create, Delete, GetMany } from "../../db/crud/crud.js";
import { db } from '../../config/drizzle.config.js';
import { TeamService } from "../createTeamService/teamService.js";
import { mapPokemonToApi, type PokemonWithReferenceDB } from "../../mapper/pokemon.mapper.js";
import type { Pokemon } from '@pokemon-battle/shared';
import { z } from "zod";
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../../models/errors.js';
import { addPokemonToTeamSchema, removePokemonFromTeamSchema, teamIdSchema } from '../../schemas/index.js';
import { userIdSchema } from '../../schemas/common.schemas.js';

const MAX_POKEMON_PER_TEAM = 6;

// ✅ SERVICE POKEMON - Gestion des Pokemon dans les équipes UNIQUEMENT
export class PokemonTeamService {

  /**
   * Récupérer tous les Pokemon d'une équipe
   */
  static async getTeamPokemon(teamId: number): Promise<Pokemon[]> {
    return serviceWrapper(async () => {
      // ✅ Utiliser le schéma centralisé
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
    });
  }

  /**
   * Compter le nombre de Pokemon dans une équipe
   */
  static async getTeamPokemonCount(teamId: number): Promise<number> {
    return serviceWrapper(async () => {
      // ✅ Valider l'entrée
      teamIdSchema.parse(teamId);

      const teamPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, teamId));
      return teamPokemon.length;
    });
  }

  /**
   * Récupérer une référence Pokemon par ID PokeAPI
   */
  static async getPokemonReference(pokemonId: number) {
    return serviceWrapper(async () => {
      const existing = await db
        .select()
        .from(pokemonReference)
        .where(eq(pokemonReference.pokeapi_id, pokemonId))
        .limit(1);
      
      if (existing.length === 0) {
        throw new NotFoundError(`Pokémon ${pokemonId} non trouvé dans la base de données. Assurez-vous que le seed a été exécuté.`);
      }
      
      return existing[0];
    });
  }

  /**
   * Ajouter un Pokemon à une équipe
   */
  static async addPokemonToTeam(teamId: number, pokemonId: number, userId: number) {
    return serviceWrapper(async () => {
      // ✅ Utiliser le schéma centralisé
      const validatedData = addPokemonToTeamSchema.parse({ teamId, pokemonId, userId });

      // ✅ Utiliser la méthode existante qui fonctionne déjà
      const isOwner = await TeamService.verifyTeamOwnership(validatedData.teamId, validatedData.userId);
      if (!isOwner) {
        throw new NotFoundError('Équipe non trouvée ou non autorisée');
      }

      // Vérifier la limite
      const currentCount = await this.getTeamPokemonCount(validatedData.teamId);
      if (currentCount >= MAX_POKEMON_PER_TEAM) {
        throw new ValidationError(`L'équipe ne peut contenir que ${MAX_POKEMON_PER_TEAM} Pokémon maximum`);
      }

      // ✅ Récupérer la référence Pokemon
      const pokemonRef = await this.getPokemonReference(validatedData.pokemonId);

      // ✅ Vérifier les doublons
      const existingPokemon = await GetMany<typeof pokemon.$inferSelect>(pokemon, eq(pokemon.team_id, validatedData.teamId));
      const isDuplicate = existingPokemon.some(p => p.pokemon_reference_id === pokemonRef.id);
      
      if (isDuplicate) {
        throw new ValidationError('Ce Pokémon est déjà dans l\'équipe');
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
    });
  }

  /**
   * Retirer un Pokemon d'une équipe
   */
  static async removePokemonFromTeam(teamId: number, pokemonPokeApiId: number, userId: number) {
    return serviceWrapper(async () => {
      console.log('🗑️ === REMOVE POKEMON SERVICE APPELÉ ===');
      console.log('🔍 Paramètres:', { teamId, pokemonPokeApiId, userId });
      
      if (!teamId || !pokemonPokeApiId) {
        throw new ValidationError('teamId et pokemonPokeApiId sont requis');
      }

      // ✅ Vérifier que l'équipe appartient à l'utilisateur
      const isOwner = await TeamService.verifyTeamOwnership(teamId, userId);
      if (!isOwner) {
        throw new NotFoundError('Équipe non trouvée ou non autorisée');
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
    });
  }

  /**
   * Récupérer les équipes avec leurs Pokemon (méthode utilitaire)
   */
  static async getTeamsWithPokemon(userId: number) {
    return serviceWrapper(async () => {
      const teams = await TeamService.getTeamsByUserId(userId);
      
      const teamsWithPokemon = await Promise.all(
        teams.map(async (team) => {
          const teamPokemon = await this.getTeamPokemon(team.id).catch(error => {
            console.error(`Erreur récupération Pokemon équipe ${team.id}:`, error);
            return [];
          });
          
          return {
            ...team,
            pokemon: teamPokemon || []
          };
        })
      );
      
      return teamsWithPokemon;
    });
  }

  static async deletePokemonSelection(teamId: number, pokemonId: number) {
    return serviceWrapper(async () => {
      return Delete(pokemon, and(
        eq(pokemon.team_id, teamId), 
        eq(pokemon.pokemon_reference_id, pokemonId)
      )!);
    });
  }
}

// ✅ Exports pour rétrocompatibilité
export const createPokemonSelection = PokemonTeamService.addPokemonToTeam;
export const deletePokemonSelection = PokemonTeamService.removePokemonFromTeam;
export const getTeamPokemon = PokemonTeamService.getTeamPokemon;
export const getTeamPokemonCount = PokemonTeamService.getTeamPokemonCount;
export const getTeamsWithPokemon = PokemonTeamService.getTeamsWithPokemon; 