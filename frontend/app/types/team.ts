import type { PokemonInTeam } from './pokemon';

export interface Team {
  id: number;
  teamName: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  pokemon?: PokemonInTeam[];
}

export interface CreateTeamData {
  teamName: string;
}

export interface TeamsResponse {
  success: boolean;
  teams: Team[];
}

export interface CreateTeamResponse {
  success: boolean;
  message: string;
  team: Team;
} 