import { 
  CreateTeamData, 
  TeamsResponse, 
  CreateTeamResponse,
  StandardApiResponse,
  TeamWithPokemon
} from '@pokemon-battle/shared';
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
    let backendResponse: StandardApiResponse<{ team: TeamWithPokemon }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer('/api/teams/createTeam', requestOrToken, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } else {
      backendResponse = await makeApiCall('/api/teams/createTeam', {
        method: 'POST',
        body: JSON.stringify(data),
      }, requestOrToken);
    }
    
    return {
      success: backendResponse.success,
      team: backendResponse.data?.team,
      message: backendResponse.message,
      error: backendResponse.error
    };
  },

  async getMyTeams(requestOrToken?: Request | string): Promise<TeamsResponse> {
    let backendResponse: StandardApiResponse<{ teams: TeamWithPokemon[]; totalCount: number }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer('/api/teams', requestOrToken);
    } else {
      backendResponse = await makeApiCall('/api/teams', {}, requestOrToken);
    }
    
    return {
      success: backendResponse.success,
      teams: backendResponse.data?.teams || [],
      totalCount: backendResponse.data?.totalCount
    };
  },

  async addPokemonToTeam(teamId: number, pokemonId: number, requestOrToken?: Request | string) {
    let backendResponse: StandardApiResponse<{ team: TeamWithPokemon }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer(`/api/teams/${teamId}/pokemon`, requestOrToken, {
        method: 'POST',
        body: JSON.stringify({ pokemonId }),
      });
    } else {
      backendResponse = await makeApiCall(`/api/teams/${teamId}/pokemon`, {
        method: 'POST',
        body: JSON.stringify({ pokemonId }),
      }, requestOrToken);
    }
    
    return {
      success: backendResponse.success,
      team: backendResponse.data?.team,
      message: backendResponse.message,
      error: backendResponse.error
    };
  },

  async removePokemonFromTeam(teamId: number, pokemonId: number, requestOrToken?: Request | string) {
    let backendResponse: StandardApiResponse<{ team: TeamWithPokemon }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer(`/api/teams/${teamId}/pokemon/${pokemonId}`, requestOrToken, {
        method: 'DELETE',
      });
    } else {
      backendResponse = await makeApiCall(`/api/teams/${teamId}/pokemon/${pokemonId}`, {
        method: 'DELETE',
      }, requestOrToken);
    }
    
    return {
      success: backendResponse.success,
      team: backendResponse.data?.team,
      message: backendResponse.message,
      error: backendResponse.error
    };
  },

  async deleteTeam(teamId: number, requestOrToken?: Request | string) {
    let backendResponse: StandardApiResponse<{}>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer(`/api/teams/${teamId}`, requestOrToken, {
        method: 'DELETE',
      });
    } else {
      backendResponse = await makeApiCall(`/api/teams/${teamId}`, {
        method: 'DELETE',
      }, requestOrToken);
    }
    
    return {
      success: backendResponse.success,
      message: backendResponse.message,
      error: backendResponse.error
    };
  },
}; 