import { Hono } from 'hono';
import { createCache } from '../../utils/cache.utils';
import { PokemonSprite } from '../../models/types/pokemonSprite.type';
import { PokemonName } from '../../models/types/pokemonName.type';

const pokemonController = new Hono();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 heures

const fetchSprites = async () => {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
  const data = await res.json();

  const pokemons = await Promise.all(
    data.results.map(async (p: { url: string }) => {
      const detail = await fetch(p.url);
      if (!detail.ok) return null;
      const d = await detail.json();
      return { id: d.id, name: d.name, sprite_url: d.sprites.front_default };
    })
  );

  return pokemons.filter(Boolean);
};

const fetchNamesFr = async () => {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=151');
  const data = await res.json();

  const names = await Promise.all(
    data.results.map(async (p: { url: string }) => {
      const detail = await fetch(p.url);
      if (!detail.ok) return null;
      const d = await detail.json();

      // Garde seulement les Pokémon sans pré-évolution
      if (d.evolves_from_species !== null) {
        return null;
      }

      const frNameObj = d.names.find((n: any) => n.language.name === 'fr');
      return { id: d.id, nameFr: frNameObj ? frNameObj.name : d.name };
    })
  );

  return names.filter(Boolean);
};

const getCachedSprites = createCache(fetchSprites, CACHE_DURATION);
const getCachedNamesFr = createCache(fetchNamesFr, CACHE_DURATION);

pokemonController.get('/fusion', async (c) => {
  const sprites = await getCachedSprites();
  const namesFr = await getCachedNamesFr();

  const baseIds = new Set(namesFr.map((n: PokemonName) => n.id));

  // Filtrer les sprites pour ne garder que les Pokémon de base
  const filteredSprites = sprites.filter((p: PokemonSprite) => baseIds.has(p.id));

  // Fusionner noms et sprites
  const fullList = filteredSprites.map((p: PokemonSprite) => {
    const nameEntry = namesFr.find((n: PokemonName) => n.id === p.id);
    return {
      id: p.id,
      nameFr: nameEntry ? nameEntry.nameFr : null,
      sprite_url: p.sprite_url,
    };
  });

  return c.json({ pokemon: fullList });
});

export default pokemonController;
