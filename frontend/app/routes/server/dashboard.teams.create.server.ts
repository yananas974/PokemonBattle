import { redirect } from '@remix-run/node';
import { teamService } from '~/services/teamService';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';

export const loader = withAuthLoader(async (user, request) => { 
  return Response.json({ user });
});

export const action = withAuthAction(async (user, request) => {
  const formData = await request.formData();
  const teamName = formData.get('teamName') as string;

  if (!teamName || teamName.trim() === '') {
    throw new Response('Le nom de l\'équipe est requis', { status: 400 });
  }

  const response = await teamService.createTeam(
    { teamName: teamName.trim() },
    user.backendToken
  );

  if (response.success && response.team) {
    return redirect(`/dashboard/teams/${response.team.id}/select-pokemon?success=team-created`);
  }

  throw new Response(
    response.error || 'Erreur lors de la création de l\'équipe',
    { status: 500 }
  );
});