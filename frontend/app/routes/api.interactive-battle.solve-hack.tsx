import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions';

export const action = async ({ request }: ActionFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { battleId, answer } = body;
    
    if (!battleId || !answer) {
      return json({ error: 'Données manquantes', success: false }, { status: 400 });
    }

    const token = user.backendToken;
    
    // Appel vers le backend
    const response = await fetch('http://backend:3001/api/interactive-battle/solve-hack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        battleId,
        answer,
        token
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json({ 
        error: errorData.error || 'Erreur du serveur', 
        success: false 
      }, { status: response.status });
    }

    const result = await response.json();
    return json(result);
    
  } catch (error) {
    console.error('Erreur API solve-hack:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur', 
      success: false 
    }, { status: 500 });
  }
}; 