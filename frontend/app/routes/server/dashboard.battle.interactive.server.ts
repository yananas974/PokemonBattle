import { interactiveBattleService } from '~/services/interactiveBattleService';
import { teamService } from '~/services/teamService';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';
import { getUserFromSession } from '~/sessions.server';

export const loader = withAuthLoader(async (user, request, params) => {
  const url = new URL(request.url);
  const battleId = url.searchParams.get('battleId');
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  const { user: userData } = await getUserFromSession(request);
  console.log(userData);
  
  try {
    if (battleId) {
      const battleResponse = await interactiveBattleService.getBattleState(battleId, userData.backendToken);
      
      if (battleResponse.success && battleResponse.battle) {
        return Response.json({
          user,
          battle: battleResponse.battle,
          error: null,
          mode: 'existing' as const
        });
      }
    }

    if (!playerTeamId || !enemyTeamId) {
      return Response.json({
        user,
        battle: null,
        error: 'IDs des équipes manquants pour créer un nouveau combat',
        mode: 'error' as const
      });
    }

    const teamsData = await teamService.getMyTeams(request);
    const playerTeam = teamsData.teams.find(t => t.id === parseInt(playerTeamId));
    const enemyTeam = teamsData.teams.find(t => t.id === parseInt(enemyTeamId));
    
    if (!playerTeam || !enemyTeam) {
      return Response.json({
        user,
        battle: null,
        error: 'Équipe introuvable',
        mode: 'error' as const
      });
    }

    console.log('🚀 Tentative d\'initialisation du combat:', { playerTeamId, enemyTeamId });
    
    const initResponse = await interactiveBattleService.initBattle({
      playerTeamId: parseInt(playerTeamId),
      enemyTeamId: parseInt(enemyTeamId)
    }, userData.backendToken);

    console.log('📦 Réponse de l\'API:', initResponse);

    const battleData = initResponse.data?.battle || initResponse.battle;
    console.log('⚔️ Données de combat extraites:', battleData);
    
    if (initResponse.success === true && battleData && typeof battleData === 'object') {
      console.log('✅ Combat initialisé avec succès, chargement de l\'interface');
      console.log('🎮 Battle ID:', battleData.battleId);
      console.log('👤 Pokémon joueur:', battleData.playerPokemon?.name_fr);
      console.log('🤖 Pokémon ennemi:', battleData.enemyPokemon?.name_fr);
      
      return Response.json({
        user,
        battle: battleData,
        error: null,
        mode: 'new' as const,
        playerTeam,
        enemyTeam
      });
    }

    console.log('❌ Échec de l\'initialisation:', initResponse.error || 'Données de combat manquantes');
    
    const errorMessage = initResponse.error || initResponse.message || 'Erreur lors de l\'initialisation du combat';
    console.error('🚨 ERREUR FINALE:', errorMessage);
    
    return Response.json({
      user,
      battle: null,
      error: errorMessage,
      mode: 'error' as const,
      debugInfo: {
        initResponse: initResponse,
        playerTeamId,
        enemyTeamId,
        hasToken: !!userData.backendToken,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('🚨 ERREUR DANS LE LOADER:', error);
    
    const errorDetails = {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'Pas de stack trace',
      timestamp: new Date().toISOString(),
      url: request.url
    };
    
    console.error('🚨 DÉTAILS COMPLETS DE L\'ERREUR:', errorDetails);
    
    return Response.json({
      user,
      battle: null,
      error: `ERREUR CAPTURÉE: ${errorDetails.message}`,
      mode: 'error' as const,
      debugInfo: errorDetails,
      forceErrorDisplay: true
    }, { status: 200 });
  }
});
  export const action = withAuthAction(async (user, request, params) => {
  const formData = await request.formData();
  const battleId = formData.get('battleId') as string;
  const moveIndex = formData.get('moveIndex') as string;
  const intent = formData.get('intent') as string;
  const answer = formData.get('answer') as string;
  const token = user.backendToken;

  try {
    if (intent === 'forfeit') {
      const response = await interactiveBattleService.forfeitBattle(battleId, token);
      return Response.json(response);
    } else if (intent === 'hack' && answer) {
      const response = await interactiveBattleService.solveHackChallenge(battleId, answer, token);
      return Response.json(response);
    } else if (moveIndex) {
      const response = await interactiveBattleService.executeAction({
        battleId,
        action: { type: 'attack', moveId: parseInt(moveIndex) }
      }, token);
      
      return Response.json(response);
    }

    return Response.json({
      success: false,
      error: 'Action non reconnue'
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'action'
    });
  }
}); 