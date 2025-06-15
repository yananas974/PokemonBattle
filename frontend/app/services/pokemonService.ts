import { apiCall, handleApiError } from '~/utils/api';
import type { PokemonResponse } from '~/types/pokemon';

export const pokemonService = {
  // Récupérer tous les Pokémon depuis notre BDD
  async getAllPokemon(token?: string): Promise<PokemonResponse> {
    console.log('🔍 Récupération des Pokémon...');
    const response = await apiCall('/api/pokemon/all', {}, token);
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Pokémon récupérés:', data);
    return data;
  },

  // Récupérer un Pokémon spécifique
  async getPokemonById(id: number, token?: string) {
    const response = await apiCall(`/api/pokemon/${id}`, {}, token);
    await handleApiError(response);
    return response.json();
  },
}; 