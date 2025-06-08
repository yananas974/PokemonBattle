export interface Team {
  id: number;
  teamName: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamData {
  teamName: string;
}

export interface TeamsResponse {
  message: string;
  teams: Team[];
}

export interface CreateTeamResponse {
  message: string;
  team: Team;
} 