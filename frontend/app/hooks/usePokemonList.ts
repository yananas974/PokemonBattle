import { useReducer, useCallback } from 'react';
import type { Pokemon } from '@pokemon-battle/shared';

// Types pour les actions
export type PokemonListAction = 
  | { type: 'SET_POKEMON'; payload: Pokemon[] }
  | { type: 'SET_SEARCH_FILTER'; payload: string }
  | { type: 'SET_TYPE_FILTER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOTAL_COUNT'; payload: number }
  | { type: 'SET_AVAILABLE_TYPES'; payload: string[] }
  | { type: 'RESET_FILTERS' };

// État de la liste des Pokémon
export interface PokemonListState {
  pokemon: Pokemon[];
  searchFilter: string;
  typeFilter: string;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  availableTypes: string[];
}

// Reducer pour la liste des Pokémon
function pokemonListReducer(state: PokemonListState, action: PokemonListAction): PokemonListState {
  switch (action.type) {
    case 'SET_POKEMON':
      return {
        ...state,
        pokemon: action.payload,
        error: null
      };

    case 'SET_SEARCH_FILTER':
      return {
        ...state,
        searchFilter: action.payload,
        error: null
      };

    case 'SET_TYPE_FILTER':
      return {
        ...state,
        typeFilter: action.payload,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        ...(action.payload ? { error: null } : {})
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'SET_TOTAL_COUNT':
      return {
        ...state,
        totalCount: action.payload
      };

    case 'SET_AVAILABLE_TYPES':
      return {
        ...state,
        availableTypes: action.payload
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        searchFilter: '',
        typeFilter: '',
        error: null
      };

    default:
      return state;
  }
}

// Options pour le hook
export interface UsePokemonListOptions {
  initialPokemon?: Pokemon[];
  initialSearchFilter?: string;
  initialTypeFilter?: string;
  onSearch?: (search: string, type: string) => Promise<Pokemon[]>;
  onError?: (error: string) => void;
}

// Hook principal
export function usePokemonList(options: UsePokemonListOptions = {}) {
  const {
    initialPokemon = [],
    initialSearchFilter = '',
    initialTypeFilter = '',
    onSearch,
    onError
  } = options;

  const initialState: PokemonListState = {
    pokemon: initialPokemon,
    searchFilter: initialSearchFilter,
    typeFilter: initialTypeFilter,
    isLoading: false,
    error: null,
    totalCount: initialPokemon.length,
    availableTypes: []
  };

  const [state, dispatch] = useReducer(pokemonListReducer, initialState);

  // Actions
  const setPokemon = useCallback((pokemon: Pokemon[]) => {
    dispatch({ type: 'SET_POKEMON', payload: pokemon });
    dispatch({ type: 'SET_TOTAL_COUNT', payload: pokemon.length });
    
    // Extraire les types disponibles
    const types = [...new Set(pokemon.map(p => p.type))].sort();
    dispatch({ type: 'SET_AVAILABLE_TYPES', payload: types });
  }, []);

  const setSearchFilter = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH_FILTER', payload: search });
  }, []);

  const setTypeFilter = useCallback((type: string) => {
    dispatch({ type: 'SET_TYPE_FILTER', payload: type });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Recherche avec filtres
  const searchPokemon = useCallback(async (search?: string, type?: string) => {
    const searchQuery = search !== undefined ? search : state.searchFilter;
    const typeQuery = type !== undefined ? type : state.typeFilter;

    setLoading(true);

    try {
      if (onSearch) {
        const results = await onSearch(searchQuery, typeQuery);
        setPokemon(results);
      } else {
        // Filtrage local si pas de fonction de recherche
        const filtered = initialPokemon.filter(pokemon => {
          const matchesSearch = !searchQuery || 
            pokemon.name_fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pokemon.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesType = !typeQuery || typeQuery === 'all' || pokemon.type === typeQuery;
          
          return matchesSearch && matchesType;
        });
        
        setPokemon(filtered);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la recherche';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [state.searchFilter, state.typeFilter, onSearch, initialPokemon, setPokemon]);

  // Filtrage en temps réel
  const getFilteredPokemon = useCallback(() => {
    if (!state.searchFilter && !state.typeFilter) {
      return state.pokemon;
    }

    return state.pokemon.filter(pokemon => {
      const matchesSearch = !state.searchFilter || 
        pokemon.name_fr?.toLowerCase().includes(state.searchFilter.toLowerCase()) ||
        pokemon.name_en?.toLowerCase().includes(state.searchFilter.toLowerCase());
      
      const matchesType = !state.typeFilter || state.typeFilter === 'all' || pokemon.type === state.typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [state.pokemon, state.searchFilter, state.typeFilter]);

  // Utilitaires
  const getPokemonById = useCallback((id: number) => {
    return state.pokemon.find(p => p.id === id);
  }, [state.pokemon]);

  const getPokemonByType = useCallback((type: string) => {
    return state.pokemon.filter(p => p.type === type);
  }, [state.pokemon]);

  const hasFilters = useCallback(() => {
    return state.searchFilter !== '' || state.typeFilter !== '';
  }, [state.searchFilter, state.typeFilter]);

  return {
    // État
    pokemon: state.pokemon,
    searchFilter: state.searchFilter,
    typeFilter: state.typeFilter,
    isLoading: state.isLoading,
    error: state.error,
    totalCount: state.totalCount,
    availableTypes: state.availableTypes,
    
    // Actions
    setPokemon,
    setSearchFilter,
    setTypeFilter,
    setLoading,
    setError,
    resetFilters,
    searchPokemon,
    
    // Utilitaires
    getFilteredPokemon,
    getPokemonById,
    getPokemonByType,
    hasFilters
  };
} 