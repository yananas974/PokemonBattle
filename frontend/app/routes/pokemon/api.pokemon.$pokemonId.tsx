import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions';
import { apiCall, handleApiError } from '~/utils/api';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  const { pokemonId } = params;
  
  if (!pokemonId) {
    throw new Response('Pokemon ID requis', { status: 400 });
  }
  
  try {
    const response = await apiCall(`/api/pokemon/${pokemonId}`, {}, user?.backendToken);
    await handleApiError(response);
    const data = await response.json();
    
    return json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache 1 heure
        'Vary': 'Authorization'
      }
    });
  } catch (error) {
    throw new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Pokemon non trouvé' 
      }), 
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
