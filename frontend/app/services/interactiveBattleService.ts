import { apiCall, handleApiError } from '~/utils/api';
import type { 
  BattleResponse, 
  InitBattleRequest, 
  ExecuteActionRequest,
  BattleState 
} from '~/types/battle';

export const interactiveBattleService = {
  // Initialiser un nouveau combat interactif
  async initBattle(request: InitBattleRequest, token?: string): Promise<BattleResponse> {
    console.log('🚀 Frontend: Initialisation du combat interactif:', request);
    console.log('🔑 Token utilisé:', token ? token.substring(0, 20) + '...' : 'AUCUN');
    
    const response = await apiCall('/api/interactive-battle/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(request)
    }, token);
    
    console.log('📡 Réponse HTTP:', response.status, response.statusText);
    
    try {
      await handleApiError(response);
      const data = await response.json();
      console.log('✅ Frontend: Combat initialisé, données reçues:', data);
      
      // ✅ Validation supplémentaire
      if (!data.success) {
        console.error('🚨 API a retourné success=false:', data);
      }
      
      return data;
    } catch (error) {
      console.error('🚨 ERREUR dans initBattle service:', error);
      console.error('📡 Statut de la réponse:', response.status);
      console.error('📄 Headers de la réponse:', Object.fromEntries(response.headers.entries()));
      
      // ✅ Essayer de lire le body en cas d'erreur
      try {
        const errorBody = await response.text();
        console.error('📄 Body de la réponse d\'erreur:', errorBody);
      } catch (bodyError) {
        console.error('❌ Impossible de lire le body d\'erreur:', bodyError);
      }
      
      throw error;
    }
  },

  // Exécuter une action (attaque ou fuite)
  async executeAction(request: ExecuteActionRequest, token?: string): Promise<BattleResponse> {
    console.log('⚔️ Exécution de l\'action:', request);
    
    const response = await apiCall('/api/interactive-battle/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        battleId: request.battleId,
        moveIndex: request.action.moveId
      })
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Action exécutée:', data);
    return data;
  },

  // Récupérer l'état actuel du combat
  async getBattleState(battleId: string, token?: string): Promise<BattleResponse> {
    console.log('📊 Récupération de l\'état du combat:', battleId);
    
    const response = await apiCall(`/api/interactive-battle/state/${battleId}`, {}, token);
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ État récupéré:', data);
    return data;
  },

  // Abandonner le combat
  async forfeitBattle(battleId: string, token?: string): Promise<BattleResponse> {
    console.log('🏃‍♂️ Abandon du combat:', battleId);
    
    const response = await apiCall(`/api/interactive-battle/${battleId}/forfeit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({})
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Combat abandonné:', data);
    return data;
  },

  // Résoudre un défi de hack
  async solveHackChallenge(battleId: string, answer: string, token?: string): Promise<BattleResponse> {
    console.log('🧩 Résolution du défi de hack:', { battleId, answer });
    
    const response = await apiCall('/api/interactive-battle/solve-hack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        battleId,
        answer: answer.trim()
      })
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Défi de hack résolu:', data);
    return data;
  }
}; 