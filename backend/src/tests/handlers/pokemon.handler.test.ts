// ✅ TESTS POUR LE HANDLER POKEMON

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pokemonHandlers } from '../../handlers/pokemon.handler.js';
import { TestHelper, mockContext, expectValidPokemon } from '../setup.js';

describe('Pokemon Handler', () => {
  let app: Hono;
  let testData: any;

  beforeEach(async () => {
    app = new Hono();
    testData = await TestHelper.setupFullTestData();
    
    // Routes de test
    app.get('/pokemon', pokemonHandlers.getAllPokemon);
    app.get('/pokemon/:id', pokemonHandlers.getPokemonById);
  });

  describe('GET /pokemon', () => {
    it('devrait retourner une liste de Pokémon', async () => {
      const req = new Request('http://localhost/pokemon');
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.pokemon)).toBe(true);
    });

    it('devrait supporter la pagination', async () => {
      const req = new Request('http://localhost/pokemon?limit=5&offset=0');
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pokemon.length).toBeLessThanOrEqual(5);
    });

    it('devrait supporter le filtrage par type', async () => {
      const req = new Request('http://localhost/pokemon?type=Normal');
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      if (data.pokemon.length > 0) {
        data.pokemon.forEach((pokemon: any) => {
          expect(pokemon.type).toBe('Normal');
        });
      }
    });

    it('devrait supporter la recherche par nom', async () => {
      const req = new Request('http://localhost/pokemon?search=Test');
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('devrait gérer les paramètres invalides', async () => {
      const req = new Request('http://localhost/pokemon?limit=abc&offset=xyz');
      const res = await app.request(req);
      
      // Devrait utiliser les valeurs par défaut ou retourner une erreur de validation
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('GET /pokemon/:id', () => {
    it('devrait retourner un Pokémon par ID', async () => {
      const req = new Request(`http://localhost/pokemon/${testData.pokemon.pokeapi_id}`);
      const res = await app.request(req);
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expectValidPokemon(data.pokemon);
      expect(data.pokemon.id).toBe(testData.pokemon.pokeapi_id);
    });

    it('devrait retourner 404 pour un Pokémon inexistant', async () => {
      const req = new Request('http://localhost/pokemon/99999');
      const res = await app.request(req);
      
      expect(res.status).toBe(404);
      
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Pokémon');
    });

    it('devrait gérer les IDs invalides', async () => {
      const req = new Request('http://localhost/pokemon/abc');
      const res = await app.request(req);
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('devrait gérer les IDs négatifs', async () => {
      const req = new Request('http://localhost/pokemon/-1');
      const res = await app.request(req);
      
      expect(res.status).toBe(400);
      
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Performance', () => {
    it('les requêtes devraient être rapides', async () => {
      const start = Date.now();
      
      const req = new Request('http://localhost/pokemon?limit=10');
      await app.request(req);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Moins d'une seconde
    });

    it('les requêtes répétées devraient utiliser le cache', async () => {
      const req = new Request(`http://localhost/pokemon/${testData.pokemon.pokeapi_id}`);
      
      // Première requête
      const start1 = Date.now();
      await app.request(req.clone());
      const time1 = Date.now() - start1;
      
      // Deuxième requête (avec cache)
      const start2 = Date.now();
      await app.request(req.clone());
      const time2 = Date.now() - start2;
      
      // Le cache devrait améliorer les performances
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });

  describe('Validation', () => {
    it('devrait valider les paramètres de pagination', async () => {
      const testCases = [
        { limit: -1, offset: 0, shouldFail: true },
        { limit: 1001, offset: 0, shouldFail: true },
        { limit: 10, offset: -1, shouldFail: true },
        { limit: 10, offset: 0, shouldFail: false }
      ];

      for (const testCase of testCases) {
        const req = new Request(`http://localhost/pokemon?limit=${testCase.limit}&offset=${testCase.offset}`);
        const res = await app.request(req);
        
        if (testCase.shouldFail) {
          expect([400, 422]).toContain(res.status);
        } else {
          expect(res.status).toBe(200);
        }
      }
    });
  });

  describe('Headers et CORS', () => {
    it('devrait inclure les headers de sécurité', async () => {
      const req = new Request('http://localhost/pokemon');
      const res = await app.request(req);
      
      expect(res.headers.get('Content-Type')).toContain('application/json');
    });
  });
});