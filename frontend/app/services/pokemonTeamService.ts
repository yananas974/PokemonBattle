import { apiWithAuth, apiWithToken } from '~/utils/api';

interface AddPokemonToTeamRequest {
  teamId: number;
  pokemonId: number;
}

interface AddPokemonToTeamResponse {
  success: boolean;
  message: string;
  pokemon?: any;
}

interface RemovePokemonFromTeamResponse {
  success: boolean;
  message: string;
}

export const pokemonTeamService = {
  // Ajouter un Pokemon à une équipe (méthode avec cookies)
  async addPokemonToTeam(data: AddPokemonToTeamRequest): Promise<AddPokemonToTeamResponse> {
    const response = await apiWithAuth('/api/pokemon-team/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'ajout du Pokemon');
    }

    return response.json();
  },

  // Ajouter un Pokemon à une équipe (méthode avec token)
  async addPokemonToTeamWithToken(data: AddPokemonToTeamRequest, token: string): Promise<AddPokemonToTeamResponse> {
    const response = await apiWithToken('/api/pokemon-team/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }, token);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'ajout du Pokemon');
    }

    return response.json();
  },

  // Retirer un Pokemon d'une équipe (méthode avec cookies)
  async removePokemonFromTeam(teamId: number, pokemonId: number): Promise<RemovePokemonFromTeamResponse> {
    const response = await apiWithAuth(`/api/pokemon-team/${teamId}/${pokemonId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression du Pokemon');
    }

    return response.json();
  },

  // Retirer un Pokemon d'une équipe (méthode avec token)
  async removePokemonFromTeamWithToken(teamId: number, pokemonId: number, token: string): Promise<RemovePokemonFromTeamResponse> {
    const response = await apiWithToken(`/api/pokemon-team/${teamId}/${pokemonId}`, {
      method: 'DELETE',
    }, token);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression du Pokemon');
    }

    return response.json();
  },
}; 