import { createPokemonSelection, deletePokemonSelection, TeamService as ExistingTeamService, getTeamPokemon } from "../services.js";
import { CreateTeamData } from "../../models/interfaces/interfaces.js";

// ✅ Service avec TOUTE la logique métier
export class TeamService {
  
  // ✅ Ajouter un Pokémon à une équipe (avec vérifications)
  static async addPokemonToTeam(teamId: number, pokemonId: number, userId: number) {
    if (!teamId || !pokemonId) {
      throw new Error('teamId et pokemonId sont requis');
    }

    // Vérifier que l'équipe appartient à l'utilisateur
    const team = await ExistingTeamService.getTeamById(teamId);
    if (!team || team.userId !== userId) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }

    // Ajouter le Pokémon
    const result = await createPokemonSelection(teamId, pokemonId);
    return result;
  }

  // ✅ Retirer un Pokémon d'une équipe (avec vérifications)
  static async removePokemonFromTeam(teamId: number, pokemonId: number, userId: number) {
    if (!teamId || !pokemonId) {
      throw new Error('teamId et pokemonId sont requis');
    }

    // Vérifier que l'équipe appartient à l'utilisateur
    const team = await ExistingTeamService.getTeamById(teamId);
    if (!team || team.userId !== userId) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }

    // Supprimer le Pokémon
    await deletePokemonSelection(teamId, pokemonId);
    return { success: true };
  }

  // ✅ Créer une équipe
  static async createTeam(data: CreateTeamData, userId: number) {
    if (!data.teamName) {
      throw new Error('Team name is required');
    }

    const team = await ExistingTeamService.createTeam(data, userId);
    return team;
  }

  // ✅ Récupérer les équipes d'un utilisateur avec Pokémon
  static async getTeamsWithPokemon(userId: number) {
    // Récupérer les équipes
    const teams = await ExistingTeamService.getTeamsByUserId(userId);
    
    // Ajouter les Pokemon à chaque équipe
    const teamsWithPokemon = await Promise.all(
      teams.map(async (team) => {
        try {
          const teamPokemon = await getTeamPokemon(team.id);
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

  // ✅ Supprimer une équipe (avec vérifications)
  static async deleteTeam(teamId: number, userId: number) {
    if (!teamId || isNaN(teamId)) {
      throw new Error('Invalid team ID');
    }

    // Vérifier que l'équipe appartient à l'utilisateur
    const existingTeam = await ExistingTeamService.getTeamById(teamId);
    if (!existingTeam) {
      throw new Error('Team not found');
    }

    if (existingTeam.userId !== userId) {
      throw new Error('Unauthorized access to this team');
    }
    
    await ExistingTeamService.deleteTeam(teamId);
    return { success: true };
  }
} 