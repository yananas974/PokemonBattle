import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions';
import { apiCall, handleApiError } from '~/utils/api';

// GET /api/teams - Récupérer les équipes
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user?.backendToken) {
    throw new Response('Non authentifié', { status: 401 });
  }
  
  try {
    const response = await apiCall('/api/teams', {}, user.backendToken);
    await handleApiError(response);
    const data = await response.json();
    
    return json(data, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache 1 minute (données personnelles)
      }
    });
  } catch (error) {
    throw new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erreur teams' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// POST /api/teams - Créer une équipe
export const action = async ({ request }: ActionFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user?.backendToken) {
    throw new Response('Non authentifié', { status: 401 });
  }
  
  if (request.method !== 'POST') {
    throw new Response('Méthode non supportée', { status: 405 });
  }
  
  try {
    const formData = await request.formData();
    const teamName = formData.get('teamName') as string;
    
    if (!teamName) {
      throw new Error('Nom d\'équipe requis');
    }
    
    const response = await apiCall('/api/teams/createTeam', {
      method: 'POST',
      body: JSON.stringify({ teamName }),
    }, user.backendToken);
    
    await handleApiError(response);
    const data = await response.json();
    
    return json(data);
  } catch (error) {
    return json(
      { 
        error: error instanceof Error ? error.message : 'Erreur création équipe',
        success: false 
      }, 
      { status: 400 }
    );
  }
};
