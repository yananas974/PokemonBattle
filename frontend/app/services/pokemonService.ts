import type { PokemonResponse } from '~/types/pokemon';
import type { CreateTeamData, TeamsResponse, CreateTeamResponse } from '~/types/team';
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

export const pokemonService = {
  // ✅ Récupérer tous les Pokémon avec support Request et token
  async getAllPokemon(requestOrToken?: Request | string): Promise<PokemonResponse> {
    console.log('🔍 PokemonService: Récupération Pokemon...');
    
    if (requestOrToken instanceof Request) {
      // Côté serveur (loaders)
      console.log('🔍 PokemonService: Utilisation côté serveur avec Request');
      return makeApiCallServer('/api/pokemon/all', requestOrToken);
    } else {
      // Côté client (actions/client-side)
      console.log('🔍 PokemonService: Utilisation côté client avec token');
      return makeApiCall('/api/pokemon/all', {}, requestOrToken);
    }
  },

  async getPokemonById(id: number, requestOrToken?: Request | string) {
    if (requestOrToken instanceof Request) {
      return makeApiCallServer(`/api/pokemon/${id}`, requestOrToken);
    } else {
      return makeApiCall(`/api/pokemon/${id}`, {}, requestOrToken);
    }
  },
};

export const teamService = {
  // ✅ NOUVEAU: Resource Route interne
  async getMyTeams(): Promise<TeamsResponse> {
    const response = await fetch('/api/teams', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Erreur teams: ${response.status}`);
    }
    
    return response.json();
  },

  async createTeam(data: CreateTeamData): Promise<CreateTeamResponse> {
    const formData = new FormData();
    formData.append('teamName', data.teamName);
    
    const response = await fetch('/api/teams', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur création équipe');
    }
    
    return response.json();
  },

  // ✅ BONUS: Avec useFetcher pour optimistic UI
  createTeamWithFetcher(fetcher: any, teamName: string) {
    const formData = new FormData();
    formData.append('teamName', teamName);
    
    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/teams'
    });
  },
};