import { redirect } from '@remix-run/node';
import { teamService } from '~/services/teamService';
import { interactiveBattleService } from '~/services/interactiveBattleService';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';

export const loader = withAuthLoader(async (user, request, params) => {
  const url = new URL(request.url);
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  try {
    // Récupérer les équipes disponibles
    const teamsResponse = await teamService.getMyTeams(request);
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

    return Response.json({
      user,
      teams: readyTeams,
      selectedPlayerTeam,
      selectedEnemyTeam,
      canStartBattle: !!(selectedPlayerTeam && selectedEnemyTeam)
    });
  } catch (error) {
    return Response.json({
      user,
      teams: [],
      selectedPlayerTeam: null,
      selectedEnemyTeam: null,
      canStartBattle: false,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement'
    });
  }
});

export const action = withAuthAction(async (user, request, params) => {
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
          return Response.json({ 
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

        if (battleResponse.success && battleResponse.battle) {
          // Utiliser un ID temporaire si battleId n'est pas disponible
          const battleId = (battleResponse.battle as any).battleId || `temp-${Date.now()}`;
          return redirect(`/dashboard/battle/interactive?battleId=${battleId}`);
        } else {
          return Response.json({
            success: false,
            error: battleResponse.error || 'Erreur lors de l\'initialisation du combat'
          }, { status: 500 });
        }
      }

      default:
        return Response.json({ 
          success: false, 
          error: 'Action non reconnue' 
        }, { status: 400 });
    }
  } catch (error: any) {
    return Response.json({
      success: false,
      error: error.message || 'Erreur lors de l\'action'
    }, { status: 500 });
  }
}); 