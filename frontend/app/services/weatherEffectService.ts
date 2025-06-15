interface WeatherEffects {
  weather: any;
  effects: any;
  timeBonus: number;
}

interface BattleSimulation {
  battle: any;
  weatherEffects: any;
  timeBonus: number;
}

export const weatherEffectService = {
  // ✅ Récupérer les effets météo actuels
  async getCurrentEffects(lat?: number, lon?: number): Promise<WeatherEffects> {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat.toString());
    if (lon) params.append('lon', lon.toString());
    
    const response = await fetch(`http://backend:3001/api/weather/effects?${params}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Erreur récupération effets météo');
    }
    
    return response.json();
  },

  // ✅ Simuler un combat avec effets météo
  async simulateBattle(attacker: any, defender: any, lat?: number, lon?: number): Promise<BattleSimulation> {
    const response = await fetch('http://backend:3001/api/weather/simulate-battle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attacker, defender, lat, lon }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Erreur simulation combat');
    }
    
    return response.json();
  },
}; 