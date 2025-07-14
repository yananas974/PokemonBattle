import { useReducer, useCallback, useMemo } from 'react';
import type { TeamWithPokemon, User } from '@pokemon-battle/shared';

// Types
interface FriendTeamsState {
  selectedTeam: TeamWithPokemon | null;
  isLoading: boolean;
  error: string | null;
}

type FriendTeamsAction =
  | { type: 'SET_SELECTED_TEAM'; payload: TeamWithPokemon | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: FriendTeamsState = {
  selectedTeam: null,
  isLoading: false,
  error: null,
};

function friendTeamsReducer(state: FriendTeamsState, action: FriendTeamsAction): FriendTeamsState {
  switch (action.type) {
    case 'SET_SELECTED_TEAM':
      return { ...state, selectedTeam: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface UseFriendTeamsParams {
  friend: User;
  teams: TeamWithPokemon[];
  friendId: number;
}

export function useFriendTeams({ friend, teams, friendId }: UseFriendTeamsParams) {
  const [state, dispatch] = useReducer(friendTeamsReducer, initialState);

  // Actions
  const setSelectedTeam = useCallback((team: TeamWithPokemon | null) => {
    dispatch({ type: 'SET_SELECTED_TEAM', payload: team });
  }, []);

  const toggleTeamSelection = useCallback((team: TeamWithPokemon) => {
    setSelectedTeam(state.selectedTeam?.id === team.id ? null : team);
  }, [state.selectedTeam?.id, setSelectedTeam]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Memoized statistics
  const statistics = useMemo(() => {
    const totalPokemon = teams.reduce((total, team) => total + (team.pokemon?.length || 0), 0);
    const completeTeams = teams.filter(team => team.pokemon && team.pokemon.length === 6).length;
    const averagePokemonPerTeam = teams.length > 0 ? Math.round(totalPokemon / teams.length) : 0;
    
    return {
      totalTeams: teams.length,
      totalPokemon,
      completeTeams,
      incompleteTeams: teams.length - completeTeams,
      averagePokemonPerTeam,
      completionRate: teams.length > 0 ? Math.round((completeTeams / teams.length) * 100) : 0,
    };
  }, [teams]);

  // Memoized team categories
  const teamCategories = useMemo(() => {
    const complete = teams.filter(team => team.pokemon && team.pokemon.length === 6);
    const incomplete = teams.filter(team => !team.pokemon || team.pokemon.length < 6);
    const empty = teams.filter(team => !team.pokemon || team.pokemon.length === 0);
    
    return {
      complete,
      incomplete,
      empty,
      hasTeams: teams.length > 0,
      hasCompleteTeams: complete.length > 0,
    };
  }, [teams]);

  // Helper functions
  const getTeamStatus = useCallback((team: TeamWithPokemon) => {
    const pokemonCount = team.pokemon?.length || 0;
    if (pokemonCount === 0) return { status: 'empty', color: 'text-gray-400', label: 'Vide' };
    if (pokemonCount === 6) return { status: 'complete', color: 'text-green-400', label: 'Complète' };
    return { status: 'incomplete', color: 'text-orange-400', label: 'Incomplète' };
  }, []);

  const getTeamPokemon = useCallback((team: TeamWithPokemon) => {
    return team.pokemon?.slice(0, 6) || [];
  }, []);

  // Quick actions
  const quickActions = useMemo(() => [
    {
      id: 'challenge',
      label: `Défier ${friend.username}`,
      icon: '⚔️',
      href: `/dashboard/battle/interactive?friendId=${friendId}`,
      variant: 'pokemon' as const,
      description: 'Lancer un combat interactif'
    },
    {
      id: 'my-teams',
      label: 'Mes équipes',
      icon: '🛠️',
      href: '/dashboard/teams',
      variant: 'secondary' as const,
      description: 'Gérer mes équipes'
    },
    {
      id: 'friends',
      label: 'Autres amis',
      icon: '👥',
      href: '/dashboard/friends',
      variant: 'secondary' as const,
      description: 'Retour à la liste des amis'
    }
  ], [friend.username, friendId]);

  return {
    // State
    selectedTeam: state.selectedTeam,
    isLoading: state.isLoading,
    error: state.error,
    
    // Data
    statistics,
    teamCategories,
    quickActions,
    
    // Actions
    setSelectedTeam,
    toggleTeamSelection,
    clearError,
    
    // Helpers
    getTeamStatus,
    getTeamPokemon,
    
    // Computed values
    hasSelectedTeam: !!state.selectedTeam,
    canChallenge: teamCategories.hasCompleteTeams,
  };
} 