import { Hono } from 'hono';

const pokemonNameFrController = new Hono();

pokemonNameFrController.get('/nameFr', async (c) => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=151');
    if (!response.ok) throw new Error('Failed to fetch species list');

    const data = await response.json();

    // On va chercher le nom FR pour chaque espèce
    const pokemonWithFrNames = await Promise.all(
      data.results.map(async (species: { name: string; url: string }) => {
        const speciesRes = await fetch(species.url);
        if (!speciesRes.ok) return null;
        const speciesData = await speciesRes.json();

        const nameFrObj = speciesData.names.find((n: any) => n.language.name === 'fr');
        return {
          id: speciesData.id,
          nameFr: nameFrObj ? nameFrObj.name : species.name, // fallback au nom anglais
        };
      })
    );

    const filtered = pokemonWithFrNames.filter(Boolean);

    return c.json({ pokemon: filtered });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch French names' }, 500);
  }
});

export default pokemonNameFrController;
