import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { teamService } from '~/services/teamService';
import { interactiveBattleService } from '~/services/interactiveBattleService';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const url = new URL(request.url);
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  try {
    // Récupérer les équipes disponibles
    const teamsResponse = await teamService.getMyTeams(user.backendToken);
    const teams = teamsResponse.teams || [];
    
    // Filtrer les équipes qui ont au moins un Pokémon
    const readyTeams = teams.filter((team: any) => team.pokemon && team.pokemon.length > 0);

    // Pré-sélectionner les équipes si spécifiées
    let selectedPlayerTeam = null;
    let selectedEnemyTeam = null;

    if (playerTeamId && enemyTeamId) {
      selectedPlayerTeam = readyTeams.find((team: any) => team.id === parseInt(playerTeamId));
      selectedEnemyTeam = readyTeams.find((team: any) => team.id === parseInt(enemyTeamId));
    }

    return json({
      user,
      teams: readyTeams,
      selectedPlayerTeam,
      selectedEnemyTeam,
      canStartBattle: !!(selectedPlayerTeam && selectedEnemyTeam)
    });
  } catch (error) {
    console.error('Erreur lors du chargement des équipes:', error);
    return json({
      user,
      teams: [],
      selectedPlayerTeam: null,
      selectedEnemyTeam: null,
      canStartBattle: false,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement'
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  try {
    switch (intent) {
      case 'initBattle': {
        const playerTeamId = formData.get('playerTeamId') as string;
        const enemyTeamId = formData.get('enemyTeamId') as string;
        const lat = formData.get('lat') as string;
        const lon = formData.get('lon') as string;

        if (!playerTeamId || !enemyTeamId) {
          return json({ 
            success: false, 
            error: 'Équipes manquantes' 
          }, { status: 400 });
        }

        const battleRequest = {
          playerTeamId: parseInt(playerTeamId),
          enemyTeamId: parseInt(enemyTeamId),
          lat: lat ? parseFloat(lat) : 48.8566,
          lon: lon ? parseFloat(lon) : 2.3522
        };

        const battleResponse = await interactiveBattleService.initBattle(
          battleRequest,
          user.backendToken
        );

        if (battleResponse.success && battleResponse.data?.battle) {
          return redirect(`/dashboard/battle/interactive?battleId=${battleResponse.data.battle.battleId}`);
        } else {
          return json({
            success: false,
            error: battleResponse.error || 'Erreur lors de l\'initialisation du combat'
          }, { status: 500 });
        }
      }

      default:
        return json({ 
          success: false, 
          error: 'Action non reconnue' 
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erreur dans l\'action de combat:', error);
    return json({
      success: false,
      error: error.message || 'Erreur lors de l\'action'
    }, { status: 500 });
  }
}; 