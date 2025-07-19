import { interactiveBattleService } from '~/services/interactiveBattleService';
import { teamService } from '~/services/teamService';


export const loader = async ({ request }: { request: Request }) => {
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(request.url);
  const battleId = url.searchParams.get('battleId');
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  
  try {
    if (battleId) {
      const battleResponse = await interactiveBattleService.getBattleState(battleId, user.backendToken);
      
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

    const teamsData = await teamService.getMyTeams(user.backendToken);
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

    
    const initResponse = await interactiveBattleService.initBattle({
      playerTeamId: parseInt(playerTeamId),
      enemyTeamId: parseInt(enemyTeamId)
    }, user.backendToken);


    const battleData = initResponse.battle || (initResponse as any).data?.battle;
    
    if (initResponse.success === true && battleData && typeof battleData === 'object') {
      
      return Response.json({
        user,
        battle: battleData,
        error: null,
        mode: 'new' as const,
        playerTeam,
        enemyTeam
      });
    }

    
    const errorMessage = initResponse.error || initResponse.message || 'Erreur lors de l\'initialisation du combat';
    
    return Response.json({
      user,
      battle: null,
      error: errorMessage,
      mode: 'error' as const,
      debugInfo: {
        initResponse: initResponse,
        playerTeamId,
        enemyTeamId,
        hasToken: !!user.backendToken,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    
    const errorDetails = {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'Pas de stack trace',
      timestamp: new Date().toISOString(),
      url: request.url
    };
    
    
    return Response.json({
      user,
      battle: null,
      error: `ERREUR CAPTURÉE: ${errorDetails.message}`,
      mode: 'error' as const,
      debugInfo: errorDetails,
      forceErrorDisplay: true
    }, { status: 200 });
  } 
};
export const action = async ({ request }: { request: Request }) => {
  
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    const battleId = formData.get('battleId') as string;
    
    
    // Import dynamique pour éviter l'import côté client
    const { apiCallServer } = await import('~/utils/api.server');
    const { getUserFromSession } = await import('~/sessions.server');
    
    // Vérifier l'authentification
    const { user } = await getUserFromSession(request);
    if (!user) {
      return Response.json({
        success: false,
        error: 'Non autorisé'
      });
    }
    
    
    // Router selon le type d'action
    switch (intent) {
      case 'attack': {
        const moveIndex = formData.get('moveIndex') as string;
        
        const response = await apiCallServer('/api/interactive-battle/move', request, {
          method: 'POST',
          body: JSON.stringify({
            battleId,
            moveIndex: parseInt(moveIndex)
          })
        });
        
        const data = await response.json();
        
        // ✅ Si après l'attaque du joueur, c'est le tour de l'ennemi, 
        // attendre un peu puis récupérer l'état mis à jour
        if (data.success && data.data?.battle?.currentTurn === 'enemy') {
          
          // Attendre que l'ennemi attaque automatiquement (0.7s pour être sûr que le backend a terminé)
          await new Promise(resolve => setTimeout(resolve, 700));
          
          // Récupérer l'état mis à jour
          const statusResponse = await apiCallServer(`/api/interactive-battle/${battleId}`, request, {
            method: 'GET'
          });
          
          const statusData = await statusResponse.json();
          
          if (statusData.success && statusData.data?.battle) {
            // Retourner l'état mis à jour au lieu de l'état initial
            return Response.json(statusData);
          }
        }
        
        return Response.json(data);
      }
      
      case 'hack': {
        const answer = formData.get('answer') as string;
        
        const response = await apiCallServer('/api/interactive-battle/solve-hack', request, {
          method: 'POST',
          body: JSON.stringify({
            battleId,
            answer
          })
        });
        
        const data = await response.json();
        return Response.json(data);
      }
      
      case 'forfeit': {
        
        const response = await apiCallServer(`/api/interactive-battle/${battleId}/forfeit`, request, {
          method: 'POST'
        });
        
        const data = await response.json();
        return Response.json(data);
      }
      
      case 'get-status': {
        
        const response = await apiCallServer(`/api/interactive-battle/${battleId}`, request, {
          method: 'GET'
        });
        
        const data = await response.json();
        return Response.json(data);
      }
      
      default:
        return Response.json({
          success: false,
          error: `Action non reconnue: ${intent}`
        });
    }
    
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'action'
    });
  }
};
