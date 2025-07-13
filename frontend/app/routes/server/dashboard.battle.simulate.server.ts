import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { teamService } from '~/services/teamService';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  // Récupérer les paramètres d'URL
  const url = new URL(request.url);
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  try {
    const teamsData = await teamService.getMyTeams(user.backendToken);
    const readyTeams = (teamsData.teams || []).filter((team: any) => 
      team.pokemon && team.pokemon.length >= 1
    );

    // Si les équipes sont spécifiées en paramètres, les pré-sélectionner
    let preselectedPlayer = null;
    let preselectedEnemy = null;
    
    if (playerTeamId && enemyTeamId) {
      preselectedPlayer = readyTeams.find((team: any) => team.id === parseInt(playerTeamId));
      preselectedEnemy = readyTeams.find((team: any) => team.id === parseInt(enemyTeamId));
    }

    return json({
      user,
      teams: readyTeams,
      preselectedPlayer,
      preselectedEnemy
    });
  } catch (error) {
    return json({
      user,
      teams: [],
      preselectedPlayer: null,
      preselectedEnemy: null
    });
  }
}; 