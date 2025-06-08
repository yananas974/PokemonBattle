import { apiCall, handleApiError } from '~/utils/api';
import type { PokemonResponse } from '~/types/pokemon';

export const pokemonService = {
  // Récupérer tous les Pokémon avec noms français et sprites
  async getAllPokemon(): Promise<PokemonResponse> {
    const response = await apiCall('/api/pokemon/fusion');
    await handleApiError(response);
    return response.json();
  },
}; 