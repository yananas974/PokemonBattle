import { Create, Get, GetMany, Delete, Update } from "../../db/crud/crud.js";
import { Team } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { mapCreateTeamToDb, mapUpdateTeamToDb, mapTeamToApi, mapTeamsToApi } from "../../mapper/team.mapper.js";
import type { CreateTeamData, UpdateTeamData, TeamDB, Team as TeamAPI } from "../../models/interfaces/interfaces.js";
import { z } from "zod";

const createTeamSchema = z.object({
  teamName: z.string().min(1)
});

const updateTeamSchema = z.object({
  teamName: z.string().min(1).optional(),
  userId: z.number().optional()
});

export class TeamService {
  
  static async createTeam(data: CreateTeamData, userId: number): Promise<TeamAPI> {
    const parsed = createTeamSchema.parse(data);
    const completeData = { ...parsed, userId };
    const teamDB = await Create<TeamDB>(Team, mapCreateTeamToDb(completeData));
    return mapTeamToApi(teamDB);
  }

  static async updateTeam(id: number, data: UpdateTeamData): Promise<TeamAPI> {
    const parsed = updateTeamSchema.parse(data);
    const teamDB = await Update<TeamDB>(Team, eq(Team.id, id), mapUpdateTeamToDb(parsed));
    return mapTeamToApi(teamDB);
  }

  static async getTeamById(id: number): Promise<TeamAPI | null> {
    const teamDB = await Get<TeamDB>(Team, eq(Team.id, id));
    return teamDB ? mapTeamToApi(teamDB) : null;
  }

  static async getTeamsByUserId(userId: number): Promise<TeamAPI[]> {
    const teamsDB = await GetMany<TeamDB>(Team, eq(Team.user_id, userId));
    return mapTeamsToApi(teamsDB);
  }

  static async deleteTeam(id: number): Promise<void> {
    await Delete(Team, eq(Team.id, id));
  }

  /**
   * Vérifier si une équipe appartient à un utilisateur
   */
  static async verifyTeamOwnership(teamId: number, userId: number): Promise<boolean> {
    const team = await this.getTeamById(teamId);
    return team ? team.userId === userId : false;
    }
}
export const createTeam = TeamService.createTeam;
export const getTeamById = TeamService.getTeamById;
export const getTeamByUserId = TeamService.getTeamsByUserId;
export const updateTeam = TeamService.updateTeam;
export const deleteTeam = TeamService.deleteTeam;
export const verifyTeamOwnership = TeamService.verifyTeamOwnership;