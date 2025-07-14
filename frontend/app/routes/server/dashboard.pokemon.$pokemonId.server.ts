import { apiCallWithRequest } from '~/utils/api';
import type { PokemonDetail } from '@pokemon-battle/shared';
import { withAuthLoader } from '~/utils/withAuthLoader';

export const loader = withAuthLoader(async (user, request, params) => {
  
  const pokemonId = params.pokemonId;
  
  
  if (!pokemonId || isNaN(Number(pokemonId))) {
    throw new Response('Pokemon ID invalide', { status: 400 });
  }

  const response = await apiCallWithRequest(`/api/pokemon/${pokemonId}`, request);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response('Pokemon non trouvé', { status: 404 });
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const pokemon = data.data?.pokemon || data.pokemon;
  
  if (!pokemon) {
    throw new Response('Pokemon non trouvé dans la réponse', { status: 404 });
  }
  
  return Response.json({ user, pokemon: pokemon as PokemonDetail });
});