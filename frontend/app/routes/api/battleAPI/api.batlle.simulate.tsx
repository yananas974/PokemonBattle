import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions';
import { apiCall, handleApiError } from '~/utils/api';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user?.backendToken) {
    throw new Response('Non authentifié', { status: 401 });
  }
  
  if (request.method !== 'POST') {
    throw new Response('Méthode non supportée', { status: 405 });
  }
  
  try {
    const body = await request.json();
    const { team1, team2, lat, lon } = body;
    
    console.log('🎮 Resource Route: Simulation de combat...');
    
    const response = await apiCall('/api/battle/simulate', {
      method: 'POST',
      body: JSON.stringify({ team1, team2, lat, lon }),
    }, user.backendToken);
    
    await handleApiError(response);
    const data = await response.json();
    
    console.log('✅ Resource Route: Combat simulé');
    
    return json(data, {
      headers: {
        'Cache-Control': 'no-cache', // Les combats ne doivent pas être cachés
      }
    });
  } catch (error) {
    console.error('❌ Resource Route Battle error:', error);
    return json(
      { 
        error: error instanceof Error ? error.message : 'Erreur combat',
        success: false 
      }, 
      { status: 500 }
    );
  }
};
