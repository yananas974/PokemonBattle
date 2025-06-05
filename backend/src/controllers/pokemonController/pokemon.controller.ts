import { Hono } from 'hono';
import { createCache } from '../utils/cache';

const pokemonController = new Hono();

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 heures

// Ta vraie fonction fetch pour récupérer la liste + détails des Pokémon
const fetchGen1Pokemon = async () => {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  if (!response.ok) throw new Error('Failed to fetch Pokemon list');

  const listData = await response.json();

  const pokemon = await Promise.all(
    listData.results.map(async (p: { url: string }) => {
      const detailResponse = await fetch(p.url);
      if (!detailResponse.ok) return null;
      const data = await detailResponse.json();
      return {
        id: data.id,
        name: data.name,
        sprite_url: data.sprites.front_default, // par exemple
      };
    })
  );

  return pokemon.filter(Boolean);
};

// Crée la fonction cache une fois
const getCachedGen1Pokemon = createCache(fetchGen1Pokemon, CACHE_DURATION);

pokemonController.get('/gen1', async (c) => {
  try {
    // Appelle la fonction cache (qui fera fetch si besoin)
    const pokemon = await getCachedGen1Pokemon();
    return c.json({ pokemon });
  } catch (error) {
    console.error('Error in /gen1 endpoint:', error);
    return c.json({ error: 'Failed to fetch pokemon' }, 500);
  }
});

export default pokemonController;
