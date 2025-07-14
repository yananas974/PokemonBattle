import { pokemonService } from '~/services/pokemonService';
import { withAuthLoader } from '~/utils/withAuthLoader';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokédex National - Explorer les Pokémon' },
    { name: 'description', content: 'Découvrez tous les Pokémon dans le Pokédex National moderne' },
  ];
};


export const loader = withAuthLoader(async (user, request, params) => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  const typeFilter = url.searchParams.get('type') || '';

  let pokemonResponse;
  
  // Si il y a des filtres, utiliser la recherche
  if (searchQuery || typeFilter) {
    pokemonResponse = await pokemonService.searchPokemon(
      { 
        name: searchQuery || undefined, 
        type: typeFilter || undefined 
      },
      request
    );
  } else {
    // Sinon récupérer tous les Pokémon
    pokemonResponse = await pokemonService.getAllPokemon(request);
  }

  const pokemon = pokemonResponse.pokemon || [];
  const totalCount = pokemonResponse.totalCount || pokemon.length;

  // Extraire les types uniques pour les filtres
  const availableTypes = [...new Set(pokemon.map((p: any) => p.type))].sort();

  return Response.json({
    user,
    pokemon,
    totalCount,
    availableTypes,
    currentSearch: searchQuery,
    currentType: typeFilter
  });
});