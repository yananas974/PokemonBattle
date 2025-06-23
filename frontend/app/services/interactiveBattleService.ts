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
    console.log('🚀 Initialisation du combat interactif:', request);
    
    const response = await apiCall('/api/interactive-battle/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        token
      })
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Combat initialisé:', data);
    return data;
  },

  // Exécuter une action (attaque ou fuite)
  async executeAction(request: ExecuteActionRequest, token?: string): Promise<BattleResponse> {
    console.log('⚔️ Exécution de l\'action:', request);
    
    const response = await apiCall('/api/interactive-battle/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        battleId: request.battleId,
        moveIndex: request.action.moveId,
        token
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
      },
      body: JSON.stringify({ token })
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Combat abandonné:', data);
    return data;
  }
}; 