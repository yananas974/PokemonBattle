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
  // Test de connectivité du backend
  async testBackendConnection(token?: string): Promise<boolean> {
    
    try {
      // Utiliser une route simple pour tester la connectivité
      const response = await apiCall('/api/pokemon/all', {
        method: 'GET',
      }, token);
      
      
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error: unknown) {
      return false;
    }
  },

  // Simuler un combat d'équipe complet
  async simulateTeamBattle(request: TeamBattleRequest, token?: string): Promise<BattleResult> {
    
    // Test de connectivité d'abord
    const isConnected = await this.testBackendConnection(token);
    if (!isConnected) {
      throw new Error('Backend non accessible. Vérifiez que le serveur est démarré sur le port 3001.');
    }
    
    try {
    const response = await apiCall('/api/battle/team-battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }, token);
    
      
      // Vérifier d'abord si la réponse est ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
    const data = await response.json();
      
      // Vérifier le format de la réponse
      if (!data || typeof data !== 'object') {
        throw new Error('Format de réponse invalide du serveur');
      }
      
    return data;
      
    } catch (error: unknown) {
      
      // Ajouter des détails sur l'erreur
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Serveur backend inaccessible. Vérifiez que le serveur est démarré.');
      }
      
      throw error;
    }
  },

  // Simuler un combat tour par tour
  async simulateTurnBasedBattle(request: TurnBasedBattleRequest, token?: string): Promise<TurnBasedResult> {
    
    try {
    const response = await apiCall('/api/battle/turn-based', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    }, token);
    
      
      // Vérifier d'abord si la réponse est ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
    const data = await response.json();
      
      // Vérifier le format de la réponse
      if (!data || typeof data !== 'object') {
        throw new Error('Format de réponse invalide du serveur');
      }
      
    return data;
      
    } catch (error: unknown) {
      
      // Ajouter des détails sur l'erreur
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Serveur backend inaccessible. Vérifiez que le serveur est démarré.');
      }
      
      throw error;
    }
  },

  // Obtenir la géolocalisation de l'utilisateur pour les effets météo
  async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          resolve(coords);
        },
        (error) => {
          resolve({ lat: 48.8566, lon: 2.3522 }); // Paris par défaut
        },
        {
          timeout: 5000,
          enableHighAccuracy: false
        }
      );
    });
  }
}; 