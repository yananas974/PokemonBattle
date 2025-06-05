import { Hono } from 'hono';

const pokemonController = new Hono();

let cachedPokemon: any[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 heures

pokemonController.get('/api/pokemon/gen1', async (c) => {
  const currentTime = Date.now();
  if(cachedPokemon && currentTime - lastFetchTime < CACHE_DURATION){
    return c.json({pokemon: cachedPokemon});
  }
 
  try{
    const pokemon = await Promise.all(
      Array.from({length: 151}, async (__,i) => i + 1).map(async (id)=>{
        const reponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if(!reponse.ok){
          throw new Error(`Failed to fetch pokemon ${id}`);
        }
        const data = await reponse.json();
        return {
          id: data.id,
          name: data.name,
          sprite_url: data.sprites.front_default,
        }
      })
    )
    const filtredPokemon = pokemon.filter(Boolean)
    cachedPokemon = filtredPokemon;
    lastFetchTime = currentTime;
    return c.json({pokemon: filtredPokemon});
  } catch (error) {
    console.error('Error fetching pokemon:', error);
    return c.json({ error: 'Failed to fetch pokemon' }, 500);
  }
});

export default pokemonController;