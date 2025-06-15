import type { 
  CreateTeamData, 
  TeamsResponse, 
  CreateTeamResponse 
} from '../../../backend/src/models/interfaces/team.interface';
import { apiCall, handleApiError } from '~/utils/api';

// ✅ HELPER DRY POUR LES APPELS API
async function makeApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await apiCall(endpoint, options, token);
  await handleApiError(response);
  return response.json();
}

export const teamService = {
  // ✅ DRY : Une seule méthode avec token optionnel
  async createTeam(data: CreateTeamData, token?: string): Promise<CreateTeamResponse> {
    return makeApiCall('/api/teams/createTeam', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  async getMyTeams(token?: string): Promise<TeamsResponse> {
    return makeApiCall('/api/teams', {}, token);
  },

  async addPokemonToTeam(teamId: number, pokemonId: number, token?: string) {
    return makeApiCall(`/api/teams/${teamId}/pokemon`, {
      method: 'POST',
      body: JSON.stringify({ pokemonId }),
    }, token);
  },

  async removePokemonFromTeam(teamId: number, pokemonId: number, token?: string) {
    return makeApiCall(`/api/teams/${teamId}/pokemon/${pokemonId}`, {
      method: 'DELETE',
    }, token);
  },

  async deleteTeam(teamId: number, token?: string) {
    return makeApiCall(`/api/teams/${teamId}`, {
      method: 'DELETE',
    }, token);
  },
}; 