import { apiCall, handleApiError } from '~/utils/api';
import type { 
  BattleResponse, 
  InitBattleRequest, 
  ExecuteActionRequest,
  BattleUIState 
} from '~/types/battle';

export const interactiveBattleService = {
  // Initialiser un nouveau combat interactif
  async initBattle(request: InitBattleRequest, token?: string): Promise<BattleResponse> {
    
    const response = await apiCall('/api/interactive-battle/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(request)
    }, token);
    
    
    try {
      await handleApiError(response);
      const data = await response.json();
      
      // ✅ Validation supplémentaire
      if (!data.success) {
      }
      
      return data;
    } catch (error) {
      
      // ✅ Essayer de lire le body en cas d'erreur
      try {
        const errorBody = await response.text();
      } catch (bodyError) {
      }
      
      throw error;
    }
  },

  // Exécuter une action (attaque ou fuite)
  async executeAction(request: ExecuteActionRequest, token?: string): Promise<BattleResponse> {
    
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
    return data;
  },

  // Récupérer l'état actuel du combat
  async getBattleState(battleId: string, token?: string): Promise<BattleResponse> {
    
    const response = await apiCall(`/api/interactive-battle/state/${battleId}`, {}, token);
    await handleApiError(response);
    const data = await response.json();
    return data;
  },

  // Abandonner le combat
  async forfeitBattle(battleId: string, token?: string): Promise<BattleResponse> {
    
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
    return data;
  },

  // Résoudre un défi de hack
  async solveHackChallenge(battleId: string, answer: string, token?: string): Promise<BattleResponse> {
    
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
    return data;
  }
}; 