import { Create, Update, GetMany, Get } from "../../db/crud/crud.js";
import { Team } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { CreateTeamData, TeamDB } from '@pokemon-battle/shared';
import { ValidationService } from '@pokemon-battle/shared';
import { mapTeamToApi } from "../../mapper/team.mapper.js";

export class TeamService {

  static async createTeam(data: CreateTeamData, userId: number) {
    // ✅ Validation centralisée
    const validatedData = ValidationService.validateCreateTeam(data);
    ValidationService.validateUserId(userId);
    
    const teamDB = await Create<TeamDB>(Team, {
      team_name: validatedData.teamName,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    return mapTeamToApi(teamDB);
  }

  static async updateTeam(data: any, teamId: number) {
    // ✅ Validation centralisée
    const validatedData = ValidationService.validateUpdateTeam(data);
    ValidationService.validateTeamId(teamId);
    
    const updatedTeam = await Update<TeamDB>(Team, eq(Team.id, teamId), {
      team_name: validatedData.teamName,
      updated_at: new Date()
    });
    
    return mapTeamToApi(updatedTeam);
  }

  static async getUserTeams(userId: number) {
    // ✅ Validation centralisée
    ValidationService.validateUserId(userId);
    
    const teamsDB = await GetMany<TeamDB>(Team, eq(Team.user_id, userId));
    return teamsDB.map(mapTeamToApi);
  }

  static async getTeamsByUserId(userId: number) {
    // Alias for getUserTeams for backward compatibility
    return this.getUserTeams(userId);
  }

  static async verifyTeamOwnership(teamId: number, userId: number): Promise<boolean> {
    // ✅ Validation centralisée
    ValidationService.validateTeamId(teamId);
    ValidationService.validateUserId(userId);
    
    const team = await Get<TeamDB>(Team, and(eq(Team.id, teamId), eq(Team.user_id, userId))!);
    return !!team;
  }
}