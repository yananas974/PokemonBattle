import type { PokemonResponse } from '~/types/pokemon';
import type { CreateTeamData, TeamsResponse, CreateTeamResponse } from '~/types/team';

export const pokemonService = {
  // ✅ NOUVEAU: Utilise Resource Route interne
  async getAllPokemon(): Promise<PokemonResponse> {
    console.log('🔍 Récupération Pokemon via Resource Route...');
    
    const response = await fetch('/api/pokemon', {
      method: 'GET',
      credentials: 'include', // Important pour les cookies de session
    });
    
    if (!response.ok) {
      throw new Error(`Erreur Pokemon: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Pokemon récupérés via Resource Route:', data);
    return data;
  },

  async getPokemonById(id: number) {
    const response = await fetch(`/api/pokemon/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Pokemon ${id} non trouvé`);
    }
    
    return response.json();
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