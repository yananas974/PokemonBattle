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
    console.log('🔍 Test de connectivité au backend...');
    
    try {
      // Utiliser une route simple pour tester la connectivité
      const response = await apiCall('/api/pokemon/all', {
        method: 'GET',
      }, token);
      
      console.log('📡 Test connectivité - Status:', response.status);
      
      if (response.ok) {
        console.log('✅ Backend accessible !');
        return true;
      } else {
        console.log('❌ Backend non accessible, status:', response.status);
        return false;
      }
    } catch (error: any) {
      console.error('💥 Erreur de connectivité:', error.message);
      return false;
    }
  },

  // Simuler un combat d'équipe complet
  async simulateTeamBattle(request: TeamBattleRequest, token?: string): Promise<BattleResult> {
    console.log('⚔️ Début simulation de combat d\'équipe');
    console.log('📡 URL attendue: /api/battle/team-battle');
    console.log('📄 Données envoyées:', JSON.stringify(request, null, 2));
    console.log('🔑 Token fourni:', token ? `${token.substring(0, 20)}...` : 'AUCUN');
    
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
      
      console.log('📡 Réponse HTTP reçue:', response.status, response.statusText);
      console.log('📡 Headers de réponse:', Object.fromEntries(response.headers.entries()));
      
      // Vérifier d'abord si la réponse est ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Données JSON reçues:', JSON.stringify(data, null, 2));
      
      // Vérifier le format de la réponse
      if (!data || typeof data !== 'object') {
        console.error('❌ Format de réponse invalide:', data);
        throw new Error('Format de réponse invalide du serveur');
      }
      
      console.log('✅ Combat d\'équipe simulé avec succès');
      return data;
      
    } catch (error: any) {
      console.error('💥 Erreur dans simulateTeamBattle:', error);
      console.error('💥 Stack trace:', error.stack);
      
      // Ajouter des détails sur l'erreur
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚫 Erreur de réseau - serveur backend inaccessible');
        throw new Error('Serveur backend inaccessible. Vérifiez que le serveur est démarré.');
      }
      
      throw error;
    }
  },

  // Simuler un combat tour par tour
  async simulateTurnBasedBattle(request: TurnBasedBattleRequest, token?: string): Promise<TurnBasedResult> {
    console.log('🎮 Début simulation de combat tour par tour');
    console.log('📡 URL attendue: /api/battle/turn-based');
    console.log('📄 Données envoyées:', JSON.stringify(request, null, 2));
    console.log('🔑 Token fourni:', token ? `${token.substring(0, 20)}...` : 'AUCUN');
    
    try {
      const response = await apiCall('/api/battle/turn-based', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      }, token);
      
      console.log('📡 Réponse HTTP reçue:', response.status, response.statusText);
      console.log('📡 Headers de réponse:', Object.fromEntries(response.headers.entries()));
      
      // Vérifier d'abord si la réponse est ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Données JSON reçues:', JSON.stringify(data, null, 2));
      
      // Vérifier le format de la réponse
      if (!data || typeof data !== 'object') {
        console.error('❌ Format de réponse invalide:', data);
        throw new Error('Format de réponse invalide du serveur');
      }
      
      console.log('✅ Combat tour par tour simulé avec succès');
      return data;
      
    } catch (error: any) {
      console.error('💥 Erreur dans simulateTurnBasedBattle:', error);
      console.error('💥 Stack trace:', error.stack);
      
      // Ajouter des détails sur l'erreur
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚫 Erreur de réseau - serveur backend inaccessible');
        throw new Error('Serveur backend inaccessible. Vérifiez que le serveur est démarré.');
      }
      
      throw error;
    }
  },

  // Obtenir la géolocalisation de l'utilisateur pour les effets météo
  async getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
    console.log('📍 Tentative de récupération de la géolocalisation...');
    
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('🚫 Géolocalisation non supportée par le navigateur');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          console.log('✅ Géolocalisation récupérée:', coords);
          resolve(coords);
        },
        (error) => {
          console.warn('⚠️ Erreur de géolocalisation:', error.message);
          console.log('🏠 Utilisation de coordonnées par défaut (Paris)');
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