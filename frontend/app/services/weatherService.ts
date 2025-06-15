import { apiCall, handleApiError } from '~/utils/api';

export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
}

export const weatherService = {
  // Récupérer la géolocalisation avec paramètres optimisés
  async getCurrentPosition(): Promise<GeolocationCoords> {
    console.log('🌍 Demande de géolocalisation...');
    
    // ✅ Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      throw new Error('Géolocalisation non disponible côté serveur');
    }
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Géolocalisation non supportée'));
        return;
      }

      // ✅ Stratégie à plusieurs niveaux
      const tryGeolocation = (options: PositionOptions) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ Coordonnées obtenues:', position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('❌ Tentative échouée:', error);
            // Essayer la stratégie suivante
            if (options.enableHighAccuracy) {
              console.log('🔄 Retry avec précision réduite...');
              tryGeolocation({
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
              });
            } else {
              reject(new Error(`Géolocalisation impossible: ${error.message}`));
            }
          },
          options
        );
      };

      // ✅ Première tentative : haute précision
      tryGeolocation({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      });
    });
  },

  // Récupérer la météo par coordonnées avec debug
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    console.log('🌤️ Appel API météo pour:', { lat, lon });
    
    try {
      const response = await apiCall(`/api/weather/effects?lat=${lat}&lon=${lon}`);
      console.log('📡 Réponse API météo status:', response.status);
      
      await handleApiError(response);
      const result = await response.json();
      
      console.log('✅ Données météo COMPLÈTES reçues:', result);
      console.log('🔍 result.location:', result.location);
      console.log('🔍 result.temperature:', result.temperature);
      console.log('🔍 result.description:', result.description);
      
      return {
        location: result.location || 'Ville inconnue',
        temperature: result.temperature || 20,
        description: result.description || result.weather?.condition || 'Temps clair',
        humidity: result.humidity || 50,
        windSpeed: result.windSpeed || 10,
        icon: result.icon || '01d',
        country: result.country || 'FR'
      };
    } catch (error) {
      console.error('❌ Erreur appel API météo:', error);
      throw error;
    }
  },

  // RETOUR au comportement original - pas de fallback automatique
  async getCurrentLocationWeather(): Promise<WeatherData> {
    try {
      console.log('🚀 Début récupération météo automatique');
      const coords = await this.getCurrentPosition();
      const weather = await this.getWeatherByCoordinates(coords.latitude, coords.longitude);
      console.log('🎉 Météo récupérée avec succès:', weather);
      return weather;
    } catch (error) {
      console.error('💥 Erreur météo complète:', error);
      throw new Error(`Impossible de récupérer la météo: ${error}`);
    }
  },

  // Fonction séparée pour météo par ville (si besoin)
  async getWeatherByCity(city: string): Promise<WeatherData> {
    console.log('🏙️ Météo par ville temporairement désactivée');
    throw new Error('Météo par ville non disponible pour le moment');
  },
};