import type { CreateTeamData, UpdateTeamData, TeamDB, Team as TeamAPI } from '@pokemon-battle/shared';


export const mapCreateTeamToDb = (data: CreateTeamData & { userId: number }): Omit<TeamDB, 'id' | 'created_at' | 'updated_at'> => ({
  team_name: data.teamName,
  user_id: data.userId
});

export const mapUpdateTeamToDb = (data: UpdateTeamData): Partial<TeamDB> => {
  const dbData: Partial<TeamDB> = {};
  
  if (data.teamName !== undefined) dbData.team_name = data.teamName;
  
  return dbData;
};

export const mapTeamToApi = (teamDB: TeamDB): TeamAPI => ({
  id: teamDB.id,
  teamName: teamDB.team_name,
  userId: teamDB.user_id,
  createdAt: teamDB.created_at.toISOString(),
  updatedAt: teamDB.updated_at.toISOString()
});



export const mapTeamsToApi = (teamsDB: TeamDB[]): TeamAPI[] => 
  teamsDB.map(mapTeamToApi);
