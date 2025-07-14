import { useReducer, useCallback, useMemo } from 'react';
import type { Pokemon, PokemonDetail } from '@pokemon-battle/shared';

// Types pour le détail d'un Pokémon
export interface PokemonDetailState {
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
  showStats: boolean;
  statsExpanded: boolean;
}

// Actions pour le reducer
export type PokemonDetailAction = 
  | { type: 'SET_POKEMON'; payload: Pokemon | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_STATS'; payload: boolean }
  | { type: 'TOGGLE_STATS_EXPANDED'; payload: boolean }
  | { type: 'RESET' };

// État initial
const initialState: PokemonDetailState = {
  pokemon: null,
  isLoading: false,
  error: null,
  showStats: true,
  statsExpanded: false
};

// Reducer pour le détail du Pokémon
function pokemonDetailReducer(state: PokemonDetailState, action: PokemonDetailAction): PokemonDetailState {
  switch (action.type) {
    case 'SET_POKEMON':
      return {
        ...state,
        pokemon: action.payload,
        isLoading: false,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'TOGGLE_STATS':
      return {
        ...state,
        showStats: action.payload
      };

    case 'TOGGLE_STATS_EXPANDED':
      return {
        ...state,
        statsExpanded: action.payload
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Options pour le hook
export interface UsePokemonDetailOptions {
  initialPokemon?: Pokemon | null;
  initialLoading?: boolean;
  initialError?: string | null;
  onPokemonLoad?: (pokemon: Pokemon) => void;
  onError?: (error: string) => void;
}

export function usePokemonDetail(options: UsePokemonDetailOptions = {}) {
  const {
    initialPokemon = null,
    initialLoading = false,
    initialError = null,
    onPokemonLoad,
    onError
  } = options;

  const [state, dispatch] = useReducer(pokemonDetailReducer, {
    ...initialState,
    pokemon: initialPokemon,
    isLoading: initialLoading,
    error: initialError
  });

  // Actions
  const setPokemon = useCallback((pokemon: Pokemon | null) => {
    dispatch({ type: 'SET_POKEMON', payload: pokemon });
    if (pokemon) {
      onPokemonLoad?.(pokemon);
    }
  }, [onPokemonLoad]);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
    if (error) {
      onError?.(error);
    }
  }, [onError]);

  const toggleStats = useCallback((show: boolean) => {
    dispatch({ type: 'TOGGLE_STATS', payload: show });
  }, []);

  const toggleStatsExpanded = useCallback((expanded: boolean) => {
    dispatch({ type: 'TOGGLE_STATS_EXPANDED', payload: expanded });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Calculs des statistiques
  const stats = useMemo(() => {
    if (!state.pokemon) return null;

    const safeStats = {
      base_hp: state.pokemon.base_hp || 0,
      base_attack: state.pokemon.base_attack || 0,
      base_defense: state.pokemon.base_defense || 0,
      base_speed: state.pokemon.base_speed || 0
    };

    const statsValues = Object.values(safeStats).map(v => Number(v) || 0);
    const maxStat = statsValues.length > 0 ? Math.max(...statsValues) : 100;
    const minStat = statsValues.length > 0 ? Math.min(...statsValues) : 0;
    const totalStats = statsValues.reduce((a: number, b: number) => a + b, 0);
    const averageStat = totalStats / 4;

    return {
      safeStats,
      statsValues,
      maxStat,
      minStat,
      totalStats,
      averageStat: Math.round(averageStat)
    };
  }, [state.pokemon]);

  // Informations du Pokémon
  const pokemonInfo = useMemo(() => {
    if (!state.pokemon) return null;

    return {
      id: state.pokemon.id || 0,
      name: state.pokemon.name_fr || 'Pokémon Inconnu',
      type: state.pokemon.type || 'Normal',
      height: state.pokemon.height || 0,
      weight: state.pokemon.weight || 0,
      sprite_url: state.pokemon.sprite_url,
      formattedId: (state.pokemon.id || 0).toString().padStart(3, '0')
    };
  }, [state.pokemon]);

  // Noms des statistiques avec emojis
  const statNames = useMemo(() => ({
    base_hp: { label: 'Points de Vie', emoji: '❤️' },
    base_attack: { label: 'Attaque', emoji: '⚔️' },
    base_defense: { label: 'Défense', emoji: '🛡️' },
    base_speed: { label: 'Vitesse', emoji: '💨' }
  }), []);

  // Utilitaires
  const hasPokemon = useCallback(() => {
    return !!state.pokemon;
  }, [state.pokemon]);

  const hasError = useCallback(() => {
    return !!state.error;
  }, [state.error]);

  const hasStats = useCallback(() => {
    return !!(stats && stats.totalStats > 0);
  }, [stats]);

  const getStatPercentage = useCallback((value: number, maxValue: number) => {
    return Math.min((value / maxValue) * 100, 100);
  }, []);

  const getStatColor = useCallback((value: number, maxValue: number) => {
    const percentage = getStatPercentage(value, maxValue);
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-600';
    if (percentage >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
  }, [getStatPercentage]);

  return {
    // État
    pokemon: state.pokemon,
    isLoading: state.isLoading,
    error: state.error,
    showStats: state.showStats,
    statsExpanded: state.statsExpanded,

    // Actions
    setPokemon,
    setLoading,
    setError,
    toggleStats,
    toggleStatsExpanded,
    reset,

    // Données calculées
    stats,
    pokemonInfo,
    statNames,

    // Utilitaires
    hasPokemon,
    hasError,
    hasStats,
    getStatPercentage,
    getStatColor
  };
} 