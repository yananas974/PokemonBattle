import { describe, test, expect, vi, beforeEach } from 'vitest';
import { pokemonService } from '~/services/pokemonService';

// Mock des modules API
vi.mock('~/utils/api', () => ({
  apiCall: vi.fn(),
  handleApiError: vi.fn()
}));

vi.mock('~/utils/api.server', () => ({
  apiCallServer: vi.fn()
}));

const mockPokemonBackend = {
  id: 1,
  name_fr: 'Pikachu',
  name_en: 'Pikachu',
  type: 'Electric',
  base_hp: 35,
  base_attack: 55,
  base_defense: 40,
  base_speed: 90,
  height: 0.4,
  weight: 6.0,
  sprite_url: '/sprites/pikachu.png',
  back_sprite_url: '/sprites/pikachu-back.png'
};

const mockPokemonFrontend = {
  id: 1,
  name_fr: 'Pikachu',
  name_en: 'Pikachu',
  type: 'Electric',
  base_hp: 35,
  base_attack: 55,
  base_defense: 40,
  base_speed: 90,
  height: 0.4,
  weight: 6.0,
  sprite_url: '/sprites/pikachu.png',
  back_sprite_url: '/sprites/pikachu-back.png'
};

const mockBackendResponse = {
  success: true,
  data: {
    pokemon: [mockPokemonBackend],
    totalCount: 1
  },
  message: 'Pokémon récupérés avec succès'
};

describe('pokemonService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPokemon', () => {
    test('fetches all pokemon with server request', async () => {
      const { apiCallServer } = await import('~/utils/api.server');
      const { handleApiError } = await import('~/utils/api');

      (apiCallServer as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const mockRequest = new Request('http://localhost:3000');
      const result = await pokemonService.getAllPokemon(mockRequest);

      expect(apiCallServer).toHaveBeenCalledWith('/api/pokemon/all', mockRequest);
      expect(handleApiError).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        pokemon: [mockPokemonFrontend],
        totalCount: 1
      });
    });

    test('fetches all pokemon with client token', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getAllPokemon('test-token');

      expect(apiCall).toHaveBeenCalledWith('/api/pokemon/all', {}, 'test-token');
      expect(handleApiError).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        pokemon: [mockPokemonFrontend],
        totalCount: 1
      });
    });

    test('handles empty pokemon list', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const emptyResponse = {
        success: true,
        data: {
          pokemon: [],
          totalCount: 0
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(emptyResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getAllPokemon('test-token');

      expect(result).toEqual({
        success: true,
        pokemon: [],
        totalCount: 0
      });
    });

    test('handles missing data in response', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const responseWithoutData = {
        success: true,
        data: null
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(responseWithoutData)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getAllPokemon('test-token');

      expect(result).toEqual({
        success: true,
        pokemon: [],
        totalCount: undefined
      });
    });
  });

  describe('getPokemonById', () => {
    test('fetches single pokemon by id with server request', async () => {
      const { apiCallServer } = await import('~/utils/api.server');
      const { handleApiError } = await import('~/utils/api');

      const singlePokemonResponse = {
        success: true,
        data: {
          pokemon: mockPokemonBackend
        },
        message: 'Pokémon trouvé'
      };

      (apiCallServer as any).mockResolvedValue({
        json: () => Promise.resolve(singlePokemonResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const mockRequest = new Request('http://localhost:3000');
      const result = await pokemonService.getPokemonById(1, mockRequest);

      expect(apiCallServer).toHaveBeenCalledWith('/api/pokemon/1', mockRequest);
      expect(result).toEqual({
        success: true,
        pokemon: mockPokemonFrontend,
        message: 'Pokémon trouvé'
      });
    });

    test('fetches single pokemon by id with client token', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const singlePokemonResponse = {
        success: true,
        data: {
          pokemon: mockPokemonBackend
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(singlePokemonResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getPokemonById(1, 'test-token');

      expect(apiCall).toHaveBeenCalledWith('/api/pokemon/1', {}, 'test-token');
      expect(result).toEqual({
        success: true,
        pokemon: mockPokemonFrontend,
        message: undefined,
        error: undefined
      });
    });

    test('handles pokemon not found', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const notFoundResponse = {
        success: false,
        error: 'Pokémon non trouvé',
        data: null
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(notFoundResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getPokemonById(999, 'test-token');

      expect(result).toEqual({
        success: false,
        pokemon: undefined,
        message: undefined,
        error: 'Pokémon non trouvé'
      });
    });

    test('handles missing pokemon data in response', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const responseWithoutPokemon = {
        success: true,
        data: {
          pokemon: null
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(responseWithoutPokemon)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getPokemonById(1, 'test-token');

      expect(result.pokemon).toBeUndefined();
    });
  });

  describe('searchPokemon', () => {
    test('searches pokemon by name with server request', async () => {
      const { apiCallServer } = await import('~/utils/api.server');
      const { handleApiError } = await import('~/utils/api');

      (apiCallServer as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const mockRequest = new Request('http://localhost:3000');
      const result = await pokemonService.searchPokemon(
        { name: 'Pikachu' }, 
        mockRequest
      );

      expect(apiCallServer).toHaveBeenCalledWith(
        '/api/pokemon/search?search=Pikachu', 
        mockRequest
      );
      expect(result).toEqual({
        success: true,
        pokemon: [mockPokemonFrontend],
        totalCount: 1
      });
    });

    test('searches pokemon by type with client token', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.searchPokemon(
        { type: 'Electric' }, 
        'test-token'
      );

      expect(apiCall).toHaveBeenCalledWith(
        '/api/pokemon/search?type=Electric', 
        {}, 
        'test-token'
      );
      expect(result).toEqual({
        success: true,
        pokemon: [mockPokemonFrontend],
        totalCount: 1
      });
    });

    test('searches pokemon by name and type', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.searchPokemon(
        { name: 'Pikachu', type: 'Electric' }, 
        'test-token'
      );

      expect(apiCall).toHaveBeenCalledWith(
        '/api/pokemon/search?search=Pikachu&type=Electric', 
        {}, 
        'test-token'
      );
    });

    test('handles empty search query', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.searchPokemon({}, 'test-token');

      expect(apiCall).toHaveBeenCalledWith(
        '/api/pokemon/search?', 
        {}, 
        'test-token'
      );
    });

    test('handles search with no results', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const noResultsResponse = {
        success: true,
        data: {
          pokemon: [],
          totalCount: 0,
          filters: {}
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(noResultsResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.searchPokemon(
        { name: 'NonExistentPokemon' }, 
        'test-token'
      );

      expect(result).toEqual({
        success: true,
        pokemon: [],
        totalCount: 0
      });
    });

    test('properly encodes search parameters', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.searchPokemon(
        { name: 'Pokémon Spécial' }, 
        'test-token'
      );

      expect(apiCall).toHaveBeenCalledWith(
        '/api/pokemon/search?search=Pok%C3%A9mon%20Sp%C3%A9cial', 
        {}, 
        'test-token'
      );
    });
  });

  describe('data mapping', () => {
    test('correctly maps backend pokemon data to frontend format', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const backendPokemonWithExtraFields = {
        ...mockPokemonBackend,
        extra_field: 'should be ignored',
        internal_id: 'should be ignored'
      };

      const responseWithExtraFields = {
        success: true,
        data: {
          pokemon: [backendPokemonWithExtraFields],
          totalCount: 1
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(responseWithExtraFields)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getAllPokemon('test-token');

      // Vérifier que seuls les champs attendus sont mappés
      expect(result.pokemon[0]).toEqual(mockPokemonFrontend);
      expect(result.pokemon[0]).not.toHaveProperty('extra_field');
      expect(result.pokemon[0]).not.toHaveProperty('internal_id');
    });

    test('handles missing fields in backend data', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      const incompletePokemon = {
        id: 1,
        name_fr: 'Pikachu',
        type: 'Electric'
        // Champs manquants: base_hp, base_attack, etc.
      };

      const responseWithIncompleteData = {
        success: true,
        data: {
          pokemon: [incompletePokemon],
          totalCount: 1
        }
      };

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(responseWithIncompleteData)
      });
      (handleApiError as any).mockResolvedValue(undefined);

      const result = await pokemonService.getAllPokemon('test-token');

      expect(result.pokemon[0]).toEqual({
        id: 1,
        name_fr: 'Pikachu',
        name_en: undefined,
        type: 'Electric',
        base_hp: undefined,
        base_attack: undefined,
        base_defense: undefined,
        base_speed: undefined,
        height: undefined,
        weight: undefined,
        sprite_url: undefined,
        back_sprite_url: undefined
      });
    });
  });

  describe('error handling', () => {
    test('propagates API errors correctly', async () => {
      const { apiCall, handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.resolve(mockBackendResponse)
      });
      (handleApiError as any).mockRejectedValue(new Error('API Error'));

      await expect(pokemonService.getAllPokemon('test-token')).rejects.toThrow('API Error');
    });

    test('handles network errors', async () => {
      const { apiCall } = await import('~/utils/api');

      (apiCall as any).mockRejectedValue(new Error('Network Error'));

      await expect(pokemonService.getAllPokemon('test-token')).rejects.toThrow('Network Error');
    });

    test('handles invalid JSON responses', async () => {
      const { apiCall } = await import('~/utils/api');
      const { handleApiError } = await import('~/utils/api');

      (apiCall as any).mockResolvedValue({
        json: () => Promise.reject(new Error('Invalid JSON'))
      });
      (handleApiError as any).mockResolvedValue(undefined);

      await expect(pokemonService.getAllPokemon('test-token')).rejects.toThrow('Invalid JSON');
    });
  });
});