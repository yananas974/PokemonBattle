// ✅ CONFIGURATION DES TESTS BACKEND

import { beforeAll, afterAll, beforeEach, afterEach, expect } from 'vitest';
import { db } from '../config/drizzle.config.js';
import { users, Team, pokemon, pokemonReference } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ✅ DONNÉES DE TEST
export const TEST_USER = {
  email: 'test@pokemon.com',
  username: 'testuser',
  password_hash: '$2b$10$test.hash.for.testing'
};

export const TEST_POKEMON = {
  pokeapi_id: 999,
  name: 'Test Pokemon',
  type: 'Normal',
  base_hp: 100,
  base_attack: 50,
  base_defense: 50,
  base_speed: 50,
  height: 10,
  weight: 10,
  sprite_url: 'https://test.com/sprite.png'
};

export const TEST_TEAM = {
  team_name: 'Test Team',
  user_id: 1
};

// ✅ UTILITAIRES DE TEST
export class TestHelper {
  static testUserId: number | null = null;
  static testPokemonId: number | null = null;
  static testTeamId: number | null = null;

  /**
   * Créer un utilisateur de test
   */
  static async createTestUser() {
    const result = await db.insert(users).values(TEST_USER).returning();
    this.testUserId = result[0].id;
    return result[0];
  }

  /**
   * Créer un Pokémon de test
   */
  static async createTestPokemon() {
    const result = await db.insert(pokemonReference).values(TEST_POKEMON).returning();
    this.testPokemonId = result[0].id;
    return result[0];
  }

  /**
   * Créer une équipe de test
   */
  static async createTestTeam(userId?: number) {
    const teamData = {
      ...TEST_TEAM,
      user_id: userId || this.testUserId || 1
    };
    const result = await db.insert(Team).values(teamData).returning();
    this.testTeamId = result[0].id;
    return result[0];
  }

  /**
   * Nettoyer les données de test
   */
  static async cleanup() {
    try {
      // Supprimer dans l'ordre inverse des dépendances
      if (this.testTeamId) {
        await db.delete(Team).where(eq(Team.id, this.testTeamId));
      }
      
      if (this.testPokemonId) {
        await db.delete(pokemonReference).where(eq(pokemonReference.id, this.testPokemonId));
      }
      
      if (this.testUserId) {
        await db.delete(users).where(eq(users.id, this.testUserId));
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage des tests:', error);
    }
    
    // Reset des IDs
    this.testUserId = null;
    this.testPokemonId = null;
    this.testTeamId = null;
  }

  /**
   * Vérifier que la base de données est accessible
   */
  static async checkDatabase() {
    try {
      await db.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Base de données inaccessible pour les tests:', error);
      return false;
    }
  }

  /**
   * Créer des données de test complètes
   */
  static async setupFullTestData() {
    const user = await this.createTestUser();
    const pokemon = await this.createTestPokemon();
    const team = await this.createTestTeam(user.id);
    
    return { user, pokemon, team };
  }
}

// ✅ HOOKS DE TEST GLOBAUX
beforeAll(async () => {
  console.log('🧪 Configuration des tests...');
  
  const dbAvailable = await TestHelper.checkDatabase();
  if (!dbAvailable) {
    throw new Error('Base de données non disponible pour les tests');
  }
  
  console.log('✅ Base de données accessible');
});

afterAll(async () => {
  console.log('🧹 Nettoyage final des tests...');
  await TestHelper.cleanup();
});

beforeEach(async () => {
  // Nettoyage avant chaque test
  await TestHelper.cleanup();
});

afterEach(async () => {
  // Nettoyage après chaque test
  await TestHelper.cleanup();
});

// ✅ MOCK HELPERS
export const mockRequest = (overrides: any = {}) => ({
  method: 'GET',
  url: '/',
  headers: new Headers(),
  json: async () => ({}),
  ...overrides
});

export const mockContext = (overrides: any = {}) => ({
  req: mockRequest(overrides.req),
  json: (data: any) => Response.json(data),
  text: (text: string) => new Response(text),
  status: (code: number) => ({ json: (data: any) => Response.json(data, { status: code }) }),
  ...overrides
});

// ✅ MATCHERS PERSONNALISÉS
export const expectValidPokemon = (pokemon: any) => {
  expect(pokemon).toHaveProperty('id');
  expect(pokemon).toHaveProperty('name');
  expect(pokemon).toHaveProperty('type');
  expect(pokemon).toHaveProperty('base_hp');
  expect(pokemon).toHaveProperty('base_attack');
  expect(pokemon).toHaveProperty('base_defense');
  expect(pokemon).toHaveProperty('base_speed');
};

export const expectValidTeam = (team: any) => {
  expect(team).toHaveProperty('id');
  expect(team).toHaveProperty('team_name');
  expect(team).toHaveProperty('user_id');
  expect(team).toHaveProperty('created_at');
};

export const expectValidUser = (user: any) => {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
  expect(user).toHaveProperty('created_at');
  // Ne pas exposer le password_hash dans les réponses
  expect(user).not.toHaveProperty('password_hash');
};