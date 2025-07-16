import type { LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import type { PokemonDetail } from '@pokemon-battle/shared';
import { getUserFromSession } from '~/sessions.server';
import { apiCallWithRequest } from '~/utils/api';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return redirect('/login');
  }

  const pokemonId = params.pokemonId;
  
  if (!pokemonId || isNaN(Number(pokemonId))) {
    throw new Response('Pokemon ID invalide', { status: 400 });
  }

  try {
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
    
    return json({ pokemon: pokemon as PokemonDetail });
  } catch (error) {
    return json({
      pokemon: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};