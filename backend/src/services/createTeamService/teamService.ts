import { Create, Get, GetMany, Delete, Update } from "../../db/crud/crud.js";
import { Team } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import type { CreateTeamData, TeamDB, Team as TeamAPI, UpdateTeamData } from "../../models/interfaces/interfaces.js";
import { 
  transformTeamForAPI,
  transformTeamForDB 
} from "../../models/interfaces/team.interface.js";
import { createPokemonSelection, deletePokemonSelection } from "../services.js";

// ✅ DRY : Classe avec méthodes typées
export class TeamService {
  
  static async createTeam(data: CreateTeamData, userId: number): Promise<TeamAPI> {
    const teamDB = await Create<TeamDB>(Team, {
      team_name: data.teamName,
      user_id: userId
    });
    return transformTeamForAPI(teamDB);
  }

  static async getTeamById(id: number): Promise<TeamAPI | null> {
    const teamDB = await Get<TeamDB>(Team, eq(Team.id, id));
    return teamDB ? transformTeamForAPI(teamDB) : null;
  }

  // ✅ UNE SEULE fonction pour récupérer les équipes d'un user
  static async getTeamsByUserId(userId: number): Promise<TeamAPI[]> {
    const teamsDB = await GetMany<TeamDB>(Team, eq(Team.user_id, userId));
    return teamsDB.map(transformTeamForAPI);
  }

  static async updateTeam(id: number, data: UpdateTeamData): Promise<TeamAPI> {
    const updateData = data.teamName ? { team_name: data.teamName } : {};
    const teamDB = await Update<TeamDB>(Team, eq(Team.id, id), updateData);
    return transformTeamForAPI(teamDB);
  }

  static async deleteTeam(id: number): Promise<void> {
    await Delete(Team, eq(Team.id, id));
  }

  static async addPokemonToTeam(teamId: number, pokemonId: number, userId: number) {
    const team = await this.getTeamById(teamId);
    if (!team || team.userId !== userId) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }
    return await createPokemonSelection(teamId, pokemonId);
  }

  static async removePokemonFromTeam(teamId: number, pokemonId: number, userId: number) {
    const team = await this.getTeamById(teamId);
    if (!team || team.userId !== userId) {
      throw new Error('Équipe non trouvée ou non autorisée');
    }
    return await deletePokemonSelection(teamId, pokemonId);
  }
}

// ✅ Export des fonctions individuelles (rétrocompatibilité)
export const createTeam = TeamService.createTeam;
export const getTeamById = TeamService.getTeamById;
export const getTeamByUserId = TeamService.getTeamsByUserId; // ✅ Plus de doublon
export const updateTeam = TeamService.updateTeam;
export const deleteTeam = TeamService.deleteTeam;