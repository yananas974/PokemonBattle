import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { pokemonService } from '~/services/pokemonService';

// ✅ Resource route pour les données Pokemon côté client
export const loader = withAuthLoader(async (user, request, _params) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Gestion des différents types de requêtes
  const action = searchParams.get('action');
  const pokemonId = searchParams.get('id');
  const searchQuery = searchParams.get('search');
  const type = searchParams.get('type');
  const limit = searchParams.get('limit') || '20';
  const offset = searchParams.get('offset') || '0';
  
  try {
    switch (action) {
      case 'search':
        // Recherche de Pokémon
        const searchResults = await pokemonService.searchPokemon(
          { name: searchQuery || undefined, type: type || undefined },
          request
        );
        return Response.json(searchResults);
      
      case 'detail':
        // Détails d'un Pokémon spécifique
        if (!pokemonId) {
          return Response.json({ error: 'Pokemon ID required' }, { status: 400 });
        }
        const pokemonDetail = await pokemonService.getPokemonById(parseInt(pokemonId), request);
        return Response.json(pokemonDetail);
      
      case 'list':
      default:
        // Liste paginée des Pokémon
        const pokemonList = await pokemonService.getAllPokemon(request);
        return Response.json({
          ...pokemonList,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: pokemonList.totalCount
          }
        });
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch Pokemon data' },
      { status: 500 }
    );
  }
});

// ✅ Actions pour les opérations sur les Pokémon (si nécessaire)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  // Import dynamique pour éviter l'import côté client
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    switch (intent) {
      case 'favorite':
        // Ajouter aux favoris (si implémenté)
        const pokemonId = formData.get('pokemonId');
        return Response.json({ 
          success: true, 
          message: 'Pokemon added to favorites',
          pokemonId 
        });
      
      case 'unfavorite':
        // Retirer des favoris (si implémenté)
        const removePokemonId = formData.get('pokemonId');
        return Response.json({ 
          success: true, 
          message: 'Pokemon removed from favorites',
          pokemonId: removePokemonId 
        });
      
      default:
        return Response.json({ error: 'Invalid intent' }, { status: 400 });
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
};