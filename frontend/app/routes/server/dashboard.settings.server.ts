import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'save-settings') {
    return json({ 
      success: true, 
      message: 'Paramètres sauvegardés avec succès !' 
    });
  }

  return json({ 
    success: false, 
    message: 'Action non reconnue' 
  });
}; 