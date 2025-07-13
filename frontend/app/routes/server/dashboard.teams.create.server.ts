import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { teamService } from '~/services/teamService';

export const loader = async ({ request }: LoaderFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const formData = await request.formData();
  const teamName = formData.get('teamName') as string;

  if (!teamName || teamName.trim() === '') {
    return json({ 
      success: false, 
      error: 'Le nom de l\'équipe est requis' 
    }, { status: 400 });
  }

  try {
    const response = await teamService.createTeam(
      { teamName: teamName.trim() },
      user.backendToken
    );

    if (response.success && response.team) {
      return redirect(`/dashboard/teams/${response.team.id}/select-pokemon?success=team-created`);
    } else {
      return json({
        success: false,
        error: response.error || 'Erreur lors de la création de l\'équipe'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'équipe:', error);
    return json({
      success: false,
      error: error.message || 'Erreur lors de la création de l\'équipe'
    }, { status: 500 });
  }
}; 