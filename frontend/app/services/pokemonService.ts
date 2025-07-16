import { 
  Pokemon, 
  PokemonResponse, 
  PokemonDetailResponse, 
  StandardApiResponse 
} from '@pokemon-battle/shared';
import { apiCall, handleApiError } from '~/utils/api';
import { apiCallServer } from '~/utils/api.server';

// ✅ HELPER DRY POUR LES APPELS API côté serveur (loaders)
async function makeApiCallServer<T>(
  endpoint: string, 
  request: Request,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiCallServer(endpoint, request, options);
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

// ✅ HELPER pour mapper les données du backend vers le format frontend
const mapPokemonData = (backendPokemon: any): Pokemon => ({
  id: backendPokemon.id,
  name_fr: backendPokemon.name_fr,
  name_en: backendPokemon.name_en,
  type: backendPokemon.type,
  base_hp: backendPokemon.base_hp,
  base_attack: backendPokemon.base_attack,
  base_defense: backendPokemon.base_defense,
  base_speed: backendPokemon.base_speed,
  height: backendPokemon.height,
  weight: backendPokemon.weight,
  sprite_url: backendPokemon.sprite_url,
  back_sprite_url: backendPokemon.back_sprite_url
});

export const pokemonService = {
  // ✅ Récupérer tous les Pokémon avec support Request et token
  async getAllPokemon(requestOrToken?: Request | string): Promise<PokemonResponse> {
    console.log('🔍 PokemonService: Récupération Pokemon...');
    
    let backendResponse: StandardApiResponse<{ pokemon: Pokemon[]; totalCount: number }>;
    
    if (requestOrToken instanceof Request) {
      // Côté serveur (loaders)
      console.log('🔍 PokemonService: Utilisation côté serveur avec Request');
      backendResponse = await makeApiCallServer('/api/pokemon/all', requestOrToken);
    } else {
      // Côté client (actions/client-side)
      console.log('🔍 PokemonService: Utilisation côté client avec token');
      backendResponse = await makeApiCall('/api/pokemon/all', {}, requestOrToken);
    }
    
    // ✅ Adapter le format du backend (StandardApiResponse) vers PokemonResponse
    const rawPokemon = backendResponse.data?.pokemon || [];
    const mappedPokemon = rawPokemon.map(mapPokemonData);
    
    return {
      success: backendResponse.success,
      pokemon: mappedPokemon,
      totalCount: backendResponse.data?.totalCount
    };
  },

  async getPokemonById(id: number, requestOrToken?: Request | string): Promise<{ success: boolean; pokemon?: Pokemon; message?: string; error?: string }> {
    let backendResponse: StandardApiResponse<{ pokemon: Pokemon }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer(`/api/pokemon/${id}`, requestOrToken);
    } else {
      backendResponse = await makeApiCall(`/api/pokemon/${id}`, {}, requestOrToken);
    }
    
    // ✅ Adapter le format du backend vers PokemonDetailResponse
    const rawPokemon = backendResponse.data?.pokemon;
    const mappedPokemon = rawPokemon ? mapPokemonData(rawPokemon) : undefined;
    
    return {
      success: backendResponse.success,
      pokemon: mappedPokemon,
      message: backendResponse.message,
      error: backendResponse.error
    };
  },

  async searchPokemon(query: { name?: string; type?: string }, requestOrToken?: Request | string): Promise<PokemonResponse> {
    const params = new URLSearchParams();
    if (query.name) params.append('search', query.name);
    if (query.type) params.append('type', query.type);
    
    const endpoint = `/api/pokemon/search?${params.toString()}`;
    
    let backendResponse: StandardApiResponse<{ pokemon: Pokemon[]; totalCount: number; filters: any }>;
    
    if (requestOrToken instanceof Request) {
      backendResponse = await makeApiCallServer(endpoint, requestOrToken);
    } else {
      backendResponse = await makeApiCall(endpoint, {}, requestOrToken);
    }
    
    // ✅ Adapter le format du backend vers PokemonResponse
    const rawPokemon = backendResponse.data?.pokemon || [];
    const mappedPokemon = rawPokemon.map(mapPokemonData);
    
    return {
      success: backendResponse.success,
      pokemon: mappedPokemon,
      totalCount: backendResponse.data?.totalCount
    };
  },
};