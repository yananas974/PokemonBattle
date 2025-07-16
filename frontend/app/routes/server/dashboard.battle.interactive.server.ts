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

  console.log('🔐 Loader: Utilisateur authentifié:', user);
  
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

    console.log('🚀 Tentative d\'initialisation du combat:', { playerTeamId, enemyTeamId });
    
    const initResponse = await interactiveBattleService.initBattle({
      playerTeamId: parseInt(playerTeamId),
      enemyTeamId: parseInt(enemyTeamId)
    }, user.backendToken);

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
        hasToken: !!user.backendToken,
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
};

export const action = async ({ request }: { request: Request }) => {
  console.log('🎯 === ACTION REMIX BRUTE APPELÉE ===');
  console.log('🌐 Request method:', request.method);
  console.log('🌐 Request URL:', request.url);
  
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    console.log('❌ User non authentifié dans action');
    return Response.json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }
  
  console.log('🔐 User dans action:', { id: user.id, username: user.username, hasBackendToken: !!user.backendToken });
  
  const formData = await request.formData();
  const battleId = formData.get('battleId') as string;
  const moveIndex = formData.get('moveIndex') as string;
  const intent = formData.get('intent') as string;
  const answer = formData.get('answer') as string;
  const token = user.backendToken;
  
  console.log('📦 Action Remix - FormData reçue:', {
    battleId,
    moveIndex,
    intent,
    answer,
    hasToken: !!token,
    url: request.url,
    method: request.method
  });
  
  console.log('📋 FormData complète:', Object.fromEntries(formData.entries()));

  try {
    if (intent === 'forfeit') {
      const response = await interactiveBattleService.forfeitBattle(battleId, token);
      return Response.json(response);
    } else if (intent === 'hack' && answer) {
      const response = await interactiveBattleService.solveHackChallenge(battleId, answer, token);
      return Response.json(response);
    } else if (moveIndex) {
      console.log('🎯 Action Remix: Exécution de l\'attaque', { battleId, moveIndex });
      console.log('🌐 Backend URL:', process.env.BACKEND_URL || 'http://localhost:3001');
      console.log('🔑 Token présent:', !!token);
      
      // ✅ Appel direct au backend au lieu de passer par le service frontend
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const requestBody = {
          battleId,
          moveIndex: parseInt(moveIndex)
        };
        
        console.log('📤 Envoi vers backend:', { url: `${backendUrl}/api/interactive-battle/move`, body: requestBody });
        
        const apiResponse = await fetch(`${backendUrl}/api/interactive-battle/move`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log('📊 Réponse backend status:', apiResponse.status, apiResponse.statusText);
        
        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('❌ Erreur backend:', { status: apiResponse.status, text: errorText });
          throw new Error(`Backend API error: ${apiResponse.status} - ${errorText}`);
        }
        
        const response = await apiResponse.json();
        console.log('📦 Action Remix: Réponse reçue du backend:', response);
        console.log('✅ Action Remix: Renvoi de la réponse au client');
        
        return Response.json(response);
      } catch (error) {
        console.error('❌ Action Remix: Erreur appel backend:', error);
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Erreur lors de l\'appel backend'
        });
      }
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
};