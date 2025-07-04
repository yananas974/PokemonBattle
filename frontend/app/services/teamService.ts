import type { 
  CreateTeamData, 
  TeamsResponse, 
  CreateTeamResponse 
} from '../../../backend/src/models/interfaces/team.interface';
import { apiCallWithRequest, apiCall, handleApiError } from '~/utils/api';

// ✅ HELPER DRY POUR LES APPELS API côté serveur (loaders)
async function makeApiCallServer<T>(
  endpoint: string, 
  request: Request,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiCallWithRequest(endpoint, request, options);
  await handleApiError(response);
  return response.json();
}

// ✅ HELPER DRY POUR LES APPELS API côté client (actions)
async function makeApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  token?: string
): Promise<T> {
  const response = await apiCall(endpoint, options, token);
  await handleApiError(response);
  return response.json();
}

export const teamService = {
  // ✅ Méthodes avec surcharge : Request (loaders) ou token (actions)
  async createTeam(data: CreateTeamData, requestOrToken?: Request | string): Promise<CreateTeamResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/teams/createTeam', requestOrToken, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } else {
      return makeApiCall('/api/teams/createTeam', {
        method: 'POST',
        body: JSON.stringify(data),
      }, requestOrToken);
    }
  },

  async getMyTeams(requestOrToken?: Request | string): Promise<TeamsResponse> {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer('/api/teams', requestOrToken);
    } else {
      return makeApiCall('/api/teams', {}, requestOrToken);
    }
  },

  async addPokemonToTeam(teamId: number, pokemonId: number, requestOrToken?: Request | string) {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/teams/${teamId}/pokemon`, requestOrToken, {
        method: 'POST',
        body: JSON.stringify({ pokemonId }),
      });
    } else {
      return makeApiCall(`/api/teams/${teamId}/pokemon`, {
        method: 'POST',
        body: JSON.stringify({ pokemonId }),
      }, requestOrToken);
    }
  },

  async removePokemonFromTeam(teamId: number, pokemonId: number, requestOrToken?: Request | string) {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/teams/${teamId}/pokemon/${pokemonId}`, requestOrToken, {
        method: 'DELETE',
      });
    } else {
      return makeApiCall(`/api/teams/${teamId}/pokemon/${pokemonId}`, {
        method: 'DELETE',
      }, requestOrToken);
    }
  },

  async deleteTeam(teamId: number, requestOrToken?: Request | string) {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/teams/${teamId}`, requestOrToken, {
        method: 'DELETE',
      });
    } else {
      return makeApiCall(`/api/teams/${teamId}`, {
        method: 'DELETE',
      }, requestOrToken);
    }
  },
}; 