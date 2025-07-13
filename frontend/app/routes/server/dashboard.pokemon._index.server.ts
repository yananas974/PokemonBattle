import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { pokemonService } from '~/services/pokemonService';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const typeFilter = url.searchParams.get('type') || '';

  try {
    let pokemonResponse;
    
    // Si il y a des filtres, utiliser la recherche
    if (searchQuery || typeFilter) {
      pokemonResponse = await pokemonService.searchPokemon(
        { 
          name: searchQuery || undefined, 
          type: typeFilter || undefined 
        },
        user.backendToken
      );
    } else {
      // Sinon récupérer tous les Pokémon
      pokemonResponse = await pokemonService.getAllPokemon(user.backendToken);
    }

    const pokemon = pokemonResponse.pokemon || [];
    const totalCount = pokemonResponse.totalCount || pokemon.length;

    // Extraire les types uniques pour les filtres
    const availableTypes = [...new Set(pokemon.map((p: any) => p.type))].sort();

    return json({
      user,
      pokemon,
      totalCount,
      availableTypes,
      currentSearch: searchQuery,
      currentType: typeFilter
    });
  } catch (error) {
    console.error('Erreur lors du chargement des Pokémon:', error);
    return json({
      user,
      pokemon: [],
      totalCount: 0,
      availableTypes: [],
      currentSearch: searchQuery,
      currentType: typeFilter,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des Pokémon'
    });
  }
}; 