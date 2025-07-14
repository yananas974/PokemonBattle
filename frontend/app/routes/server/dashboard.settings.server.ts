import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';

export const loader = withAuthLoader(async (user) => {
  return Response.json({ user });
});

export const action = withAuthAction(async (user, request) => {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'save-settings') {
    return Response.json({ 
      success: true, 
      message: 'Paramètres sauvegardés avec succès !' 
    }, { status: 200 });
  }
  return Response.json({ 
    success: false, 
    message: 'Action non reconnue' 
  }, { status: 400 });
});