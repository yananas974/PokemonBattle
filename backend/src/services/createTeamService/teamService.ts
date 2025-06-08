import { Create } from "../../db/crud/create.js";
import { Team } from "../../db/schema.js";
import { Get } from "../../db/crud/get.js";
import { GetMany } from "../../db/crud/get.js";
import { eq } from "drizzle-orm";
import { Delete } from "../../db/crud/delete.js";
import { Update } from "../../db/crud/update.js";





export async function createTeam(teamName: string, userId: number) {
  return Create(Team, { team_name: teamName, user_id: userId });
}

export async function getTeamById(id: number) {
  return Get(Team, eq(Team.id, id));
}

export async function getAllTeams(userId: number) {
  return GetMany(Team, eq(Team.user_id, userId));
}

export async function getTeamByUserId(userId: number) {
  return GetMany(Team, eq(Team.user_id, userId));
}

export async function deleteTeam(id: number) {
  return Delete(Team, eq(Team.id, id));
}

export async function updateTeam(id: number, data: Partial<typeof Team>) {
  return Update(Team, eq(Team.id, id), data);
}