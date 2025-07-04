import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { apiCallWithRequest, handleApiError } from '~/utils/api';
import type { PokemonResponse } from '~/types/pokemon';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    console.log('🔍 Resource Route: Récupération des Pokémon...');
    
    // ✅ Appel au backend avec token automatique
    const response = await apiCallWithRequest('/api/pokemon/all', request);
    await handleApiError(response);
    const data = await response.json();
    
    console.log('✅ Resource Route: Pokémon récupérés:', data.pokemon?.length);
    
    return json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache 5 minutes
        'Vary': 'Authorization'
      }
    });
  } catch (error) {
    console.error('❌ Resource Route Pokemon error:', error);
    throw new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur Pokemon' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
