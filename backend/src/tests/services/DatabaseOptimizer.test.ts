// ✅ TESTS POUR LE SERVICE D'OPTIMISATION DE BASE DE DONNÉES

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseOptimizer } from '../../services/optimized/DatabaseOptimizer.js';

// Mock des données de test
const mockPokemon = {
  id: 1,
  name: 'Test Pokemon',
  type: 'Normal',
  base_hp: 100,
  base_attack: 50,
  base_defense: 50,
  base_speed: 50,
  sprite_url: 'https://test.com/sprite.png'
};

const mockTeam = {
  id: 1,
  name: 'Test Team',
  user_id: 1,
  pokemon: [mockPokemon]
};

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com'
};

// Mock des méthodes DatabaseOptimizer
vi.mock('../../services/optimized/DatabaseOptimizer.js', () => ({
  DatabaseOptimizer: {
    getOptimizedPokemonList: vi.fn(),
    getOptimizedTeamWithPokemon: vi.fn(),
    getOptimizedUserStats: vi.fn(),
    invalidateCache: vi.fn(),
    getCacheStats: vi.fn()
  }
}));

function expectValidTeam(team: any) {
  expect(team).toHaveProperty('id');
  expect(team).toHaveProperty('name');
  expect(team).toHaveProperty('user_id');
  expect(Array.isArray(team.pokemon)).toBe(true);
}

function expectValidPokemon(pokemon: any) {
  expect(pokemon).toHaveProperty('id');
  expect(pokemon).toHaveProperty('name');
  expect(pokemon).toHaveProperty('type');
}

describe('DatabaseOptimizer', () => {
  let testData: any;

  beforeEach(async () => {
    testData = {
      pokemon: mockPokemon,
      team: mockTeam,
      user: mockUser
    };
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('getOptimizedPokemonList', () => {
    it('devrait retourner une liste de Pokémon avec pagination', async () => {
      const result = await DatabaseOptimizer.getOptimizedPokemonList(5, 0);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
      
      if (result.length > 0) {
        expectValidPokemon(result[0]);
      }
    });

    it('devrait filtrer par type', async () => {
      const result = await DatabaseOptimizer.getOptimizedPokemonList(10, 0, 'Normal');
      
      if (result.length > 0) {
        result.forEach((pokemon: any) => {
          expect(pokemon.type).toBe('Normal');
        });
      }
    });

    it('devrait rechercher par nom', async () => {
      const result = await DatabaseOptimizer.getOptimizedPokemonList(10, 0, undefined, 'Test');
      
      if (result.length > 0) {
        result.forEach((pokemon: any) => {
          expect(pokemon.name.toLowerCase()).toContain('test');
        });
      }
    });

    it('devrait utiliser le cache pour les requêtes répétées', async () => {
      const start1 = Date.now();
      const result1 = await DatabaseOptimizer.getOptimizedPokemonList(5, 0);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const result2 = await DatabaseOptimizer.getOptimizedPokemonList(5, 0);
      const time2 = Date.now() - start2;

      expect(result1).toEqual(result2);
      expect(time2).toBeLessThan(time1); // Le cache devrait être plus rapide
    });
  });

  describe('getOptimizedTeamWithPokemon', () => {
    it('devrait retourner une équipe avec ses Pokémon', async () => {
      const result = await DatabaseOptimizer.getOptimizedTeamWithPokemon(
        testData.team.id,
        testData.user.id
      );

      expect(result).not.toBeNull();
      if (result) {
        expectValidTeam(result);
        expect(result.pokemon).toBeInstanceOf(Array);
      }
    });

    it('devrait retourner null pour une équipe inexistante', async () => {
      const result = await DatabaseOptimizer.getOptimizedTeamWithPokemon(99999, testData.user.id);
      expect(result).toBeNull();
    });

    it('devrait retourner null pour un mauvais utilisateur', async () => {
      const result = await DatabaseOptimizer.getOptimizedTeamWithPokemon(testData.team.id, 99999);
      expect(result).toBeNull();
    });
  });

  describe('getOptimizedUserStats', () => {
    it('devrait retourner les statistiques utilisateur', async () => {
      const result = await DatabaseOptimizer.getOptimizedUserStats(testData.user.id);

      expect(result).toHaveProperty('totalTeams');
      expect(result).toHaveProperty('totalPokemon');
      expect(result).toHaveProperty('favoriteType');
      
      expect(typeof result.totalTeams).toBe('number');
      expect(typeof result.totalPokemon).toBe('number');
    });

    it('devrait retourner des stats vides pour un utilisateur sans données', async () => {
      const result = await DatabaseOptimizer.getOptimizedUserStats(99999);

      expect(result.totalTeams).toBe(0);
      expect(result.totalPokemon).toBe(0);
    });
  });

  describe('Cache Management', () => {
    it('devrait pouvoir invalider le cache', () => {
      DatabaseOptimizer.invalidateCache('pokemon_');
      
      const stats = DatabaseOptimizer.getCacheStats();
      expect(stats.totalEntries).toBeGreaterThanOrEqual(0);
    });

    it('devrait pouvoir vider complètement le cache', () => {
      DatabaseOptimizer.invalidateCache();
      
      const stats = DatabaseOptimizer.getCacheStats();
      expect(stats.totalEntries).toBe(0);
    });

    it('devrait retourner des statistiques de cache valides', () => {
      const stats = DatabaseOptimizer.getCacheStats();
      
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('validEntries');
      expect(stats).toHaveProperty('expiredEntries');
      expect(stats).toHaveProperty('cacheHitRate');
      
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.validEntries).toBe('number');
      expect(typeof stats.expiredEntries).toBe('number');
      expect(typeof stats.cacheHitRate).toBe('number');
    });
  });

  describe('Performance', () => {
    it('les requêtes optimisées devraient être rapides', async () => {
      const start = Date.now();
      await DatabaseOptimizer.getOptimizedPokemonList(20, 0);
      const duration = Date.now() - start;

      // Les requêtes devraient prendre moins de 1 seconde
      expect(duration).toBeLessThan(1000);
    });

    it('le cache devrait améliorer les performances', async () => {
      // Première requête (sans cache)
      const start1 = Date.now();
      await DatabaseOptimizer.getOptimizedUserStats(testData.user.id);
      const time1 = Date.now() - start1;

      // Deuxième requête (avec cache)
      const start2 = Date.now();
      await DatabaseOptimizer.getOptimizedUserStats(testData.user.id);
      const time2 = Date.now() - start2;

      // Le cache devrait être significativement plus rapide
      expect(time2).toBeLessThan(time1 * 0.5);
    });
  });
});