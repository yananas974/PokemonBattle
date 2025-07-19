// ✅ CONFIGURATION DES TESTS FRONTEND

import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// ✅ NETTOYAGE AUTOMATIQUE APRÈS CHAQUE TEST
afterEach(() => {
  cleanup();
});

// ✅ CONFIGURATION GLOBALE
beforeAll(() => {
  // Mock du localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true
  });

  // Mock de fetch
  global.fetch = vi.fn();

  // Mock de HTMLAudioElement pour les tests audio
  global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    volume: 0.5,
    muted: false,
    paused: true,
    currentTime: 0,
    duration: 0,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));

  // Supprimer les erreurs de console pendant les tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// ✅ DONNÉES DE TEST
export const mockPokemon = {
  id: 1,
  name: 'Test Pokemon',
  name_fr: 'Pokemon Test',
  type: 'Normal',
  base_hp: 100,
  base_attack: 50,
  base_defense: 50,
  base_speed: 50,
  sprite_url: 'https://test.com/sprite.png'
};

export const mockUser = {
  id: 1,
  email: 'test@pokemon.com',
  username: 'testuser',
  backendToken: 'mock-token'
};

export const mockTeam = {
  id: 1,
  team_name: 'Test Team',
  user_id: 1,
  pokemon: [mockPokemon],
  created_at: new Date().toISOString()
};

// ✅ MOCK HELPERS
export const mockFetch = (data: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data)
  });
};

export const mockFetchError = (error: string, status = 500) => {
  global.fetch = vi.fn().mockRejectedValue(new Error(error));
};

// ✅ HELPERS POUR LES COMPOSANTS
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  // Pour les tests plus complexes qui nécessitent des providers
  return render(ui, options);
};

// ✅ MATCHERS PERSONNALISÉS POUR POKEMON
export const expectValidPokemonCard = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(/pokemon/i);
};

export const expectValidButton = (button: HTMLElement) => {
  expect(button).toBeInTheDocument();
  expect(button).not.toBeDisabled();
};

// ✅ HELPERS POUR LES TESTS AUDIO
export const mockAudioContext = () => {
  return {
    isPlaying: false,
    volume: 0.5,
    currentTrack: null,
    playDashboard: vi.fn(),
    playBattle: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    setVolume: vi.fn()
  };
};

// ✅ HELPERS POUR LES TESTS D'ERREUR
export const mockErrorContext = () => {
  return {
    errors: [],
    hasGlobalError: false,
    isLoading: false,
    addError: vi.fn(),
    addSuccess: vi.fn(),
    addWarning: vi.fn(),
    addInfo: vi.fn(),
    removeError: vi.fn(),
    clearAllErrors: vi.fn(),
    setGlobalError: vi.fn(),
    setLoading: vi.fn(),
    handleAsyncError: vi.fn()
  };
};