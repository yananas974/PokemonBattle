import { apiCall, handleApiError } from '~/utils/api';

export interface TeamBattleRequest {
  team1: {
    id: number;
    teamName: string;
    pokemon: Array<{
      pokemon_id: number;
      name_fr: string;
      type: string;
      level: number;
      attack: number;
      defense: number;
      hp: number;
      speed: number;
      moves: Array<{
        id: number;
        name: string;
        type: string;
        power: number;
        accuracy: number;
        pp: number;
      }>;
    }>;
  };
  team2: {
    id: number;
    teamName: string;
    pokemon: Array<{
      pokemon_id: number;
      name_fr: string;
      type: string;
      level: number;
      attack: number;
      defense: number;
      hp: number;
      speed: number;
      moves: Array<{
        id: number;
        name: string;
        type: string;
        power: number;
        accuracy: number;
        pp: number;
      }>;
    }>;
  };
  lat?: number;
  lon?: number;
}

export interface TurnBasedBattleRequest extends TeamBattleRequest {
  mode?: 'init' | 'turn' | 'full';
}

export interface BattleResult {
  success: boolean;
  winner: string;
  totalTurns: number;
  battleLog: Array<{
    turn: number;
    attacker: string;
    move: string;
    moveType: string;
    damage: number;
    description: string;
    isCritical: boolean;
    typeEffectiveness: number;
    stab: boolean;
  }>;
  weatherEffects?: Array<{
    name: string;
    description: string;
    multiplier: number;
    affectedTypes: string[];
  }>;
  timeBonus?: number;
}

export interface TurnBasedResult {
  success: boolean;
  battleState: {
    winner: string;
    turn: number;
    battleLog: Array<{
      turn: number;
      attacker: { name_fr: string };
      move: { name: string; type: string };
      damage: number;
      description: string;
      isCritical: boolean;
      typeEffectiveness: number;
      stab: boolean;
    }>;
  };
  combatLog: Array<{
    turn: number;
    attacker: string;
    move: string;
    moveType: string;
    damage: number;
    description: string;
    isCritical: boolean;
    typeEffectiveness: number;
    stab: boolean;
  }>;
}

export const battleSimulationService = {
  // Simuler un combat d'équipe complet
  async simulateTeamBattle(request: TeamBattleRequest, token?: string): Promise<BattleResult> {
    console.log('⚔️ Simulation de combat d\'équipe:', request);
    
    const response = await apiCall('/api/battle/team-battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Combat simulé:', data);
    return data;
  },

  // Simuler un combat tour par tour
  async simulateTurnBasedBattle(request: TurnBasedBattleRequest, token?: string): Promise<TurnBasedResult> {
    console.log('🎮 Simulation de combat tour par tour:', request);
    
    const response = await apiCall('/api/battle/turn-based', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }, token);
    
    await handleApiError(response);
    const data = await response.json();
    console.log('✅ Combat tour par tour simulé:', data);
    return data;
  },

  // Obtenir la géolocalisation de l'utilisateur pour les effets météo
  async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Géolocalisation non supportée');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Erreur de géolocalisation:', error);
          resolve(null);
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    });
  }
}; 