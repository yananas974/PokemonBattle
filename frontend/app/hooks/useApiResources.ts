import { useFetcher } from '@remix-run/react';
import { useCallback } from 'react';

// ✅ Hook pour utiliser les resource routes facilement
export function useApiResources() {
  const pokemonFetcher = useFetcher();
  const teamsFetcher = useFetcher();

  // Pokemon API calls
  const pokemon = {
    // Rechercher des Pokémon
    search: useCallback((query: { name?: string; type?: string }) => {
      const params = new URLSearchParams({
        action: 'search',
        ...(query.name && { search: query.name }),
        ...(query.type && { type: query.type })
      });
      pokemonFetcher.load(`/api/pokemon?${params}`);
    }, [pokemonFetcher]),

    // Obtenir les détails d'un Pokémon
    getDetail: useCallback((pokemonId: number) => {
      const params = new URLSearchParams({
        action: 'detail',
        id: pokemonId.toString()
      });
      pokemonFetcher.load(`/api/pokemon?${params}`);
    }, [pokemonFetcher]),

    // Obtenir la liste paginée
    getList: useCallback((options?: { limit?: number; offset?: number }) => {
      const params = new URLSearchParams({
        action: 'list',
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });
      pokemonFetcher.load(`/api/pokemon?${params}`);
    }, [pokemonFetcher]),

    // Ajouter aux favoris
    addToFavorites: useCallback((pokemonId: number) => {
      const formData = new FormData();
      formData.append('intent', 'favorite');
      formData.append('pokemonId', pokemonId.toString());
      pokemonFetcher.submit(formData, { method: 'post', action: '/api/pokemon' });
    }, [pokemonFetcher]),

    // État et données
    data: pokemonFetcher.data,
    state: pokemonFetcher.state,
    isLoading: pokemonFetcher.state === 'loading'
  };

  // Teams API calls
  const teams = {
    // Obtenir toutes les équipes
    getAll: useCallback((includeStats = false) => {
      const params = new URLSearchParams({
        action: 'list',
        ...(includeStats && { includeStats: 'true' })
      });
      teamsFetcher.load(`/api/teams?${params}`);
    }, [teamsFetcher]),

    // Obtenir les détails d'une équipe
    getDetail: useCallback((teamId: number) => {
      const params = new URLSearchParams({
        action: 'detail',
        id: teamId.toString()
      });
      teamsFetcher.load(`/api/teams?${params}`);
    }, [teamsFetcher]),

    // Obtenir les statistiques
    getStats: useCallback(() => {
      const params = new URLSearchParams({ action: 'stats' });
      teamsFetcher.load(`/api/teams?${params}`);
    }, [teamsFetcher]),

    // Créer une équipe
    create: useCallback((teamData: { name: string; description?: string }) => {
      const formData = new FormData();
      formData.append('intent', 'create');
      formData.append('name', teamData.name);
      if (teamData.description) {
        formData.append('description', teamData.description);
      }
      teamsFetcher.submit(formData, { method: 'post', action: '/api/teams' });
    }, [teamsFetcher]),

    // Mettre à jour une équipe
    update: useCallback((teamId: number, updates: { name?: string; description?: string }) => {
      const formData = new FormData();
      formData.append('intent', 'update');
      formData.append('teamId', teamId.toString());
      if (updates.name) formData.append('name', updates.name);
      if (updates.description) formData.append('description', updates.description);
      teamsFetcher.submit(formData, { method: 'post', action: '/api/teams' });
    }, [teamsFetcher]),

    // Supprimer une équipe
    delete: useCallback((teamId: number) => {
      const formData = new FormData();
      formData.append('intent', 'delete');
      formData.append('teamId', teamId.toString());
      teamsFetcher.submit(formData, { method: 'post', action: '/api/teams' });
    }, [teamsFetcher]),

    // Ajouter un Pokémon à une équipe
    addPokemon: useCallback((teamId: number, pokemonId: number) => {
      const formData = new FormData();
      formData.append('intent', 'add-pokemon');
      formData.append('teamId', teamId.toString());
      formData.append('pokemonId', pokemonId.toString());
      teamsFetcher.submit(formData, { method: 'post', action: '/api/teams' });
    }, [teamsFetcher]),

    // État et données
    data: teamsFetcher.data,
    state: teamsFetcher.state,
    isLoading: teamsFetcher.state === 'loading'
  };

  return {
    pokemon,
    teams
  };
}

// ✅ Types pour les réponses API
export interface ApiPokemonResponse {
  success: boolean;
  pokemon?: any[];
  pokemon?: any;
  totalCount?: number;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
  error?: string;
}

export interface ApiTeamsResponse {
  success: boolean;
  teams?: any[];
  team?: any;
  stats?: {
    totalTeams: number;
    totalPokemon: number;
    averageLevel: number;
    favoriteTeam: any;
  };
  error?: string;
}