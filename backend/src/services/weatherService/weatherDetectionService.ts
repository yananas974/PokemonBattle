import { WeatherService } from './weatherService.js';
import { WeatherEffectService } from '../weatherEffectService/weatherEffectService.js';
import { serviceWrapper } from '../../utils/asyncWrapper.js';

export class WeatherDetectionService {
  /**
   * Détecter la condition météo et retourner les effets
   */
  static async detectWeatherEffects(lat: number = 48.8566, lon: number = 2.3522) {
    return serviceWrapper(async () => {
      let weatherCondition = 'ClearDay'; // Défaut
      
      const weatherService = new WeatherService();
      const weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
      
      // Déterminer jour/nuit
      const currentHour = new Date().getHours();
      const isNight = currentHour < 6 || currentHour > 18;
      
      // Utiliser le même système de mapping que dans weather.handler.ts
      const description = weatherData.description.toLowerCase();
      
      const conditionMapping: Record<string, string> = {
        'ciel dégagé': isNight ? 'ClearNight' : 'ClearDay',
        'clear sky': isNight ? 'ClearNight' : 'ClearDay',
        'quelques nuages': 'Clouds',
        'few clouds': 'Clouds',
        'nuageux': 'Clouds',
        'cloudy': 'Clouds',
        'nuages épars': 'Clouds', 
        'scattered clouds': 'Clouds',
        'nuages fragmentés': 'Clouds',
        'broken clouds': 'Clouds',
        'couvert': 'Clouds',
        'overcast clouds': 'Clouds',
        'légère pluie': 'Rain',
        'light rain': 'Rain',
        'bruine légère': 'Rain',
        'light drizzle': 'Rain',
        'bruine': 'Rain',
        'drizzle': 'Rain',
        'pluie modérée': 'Rain',
        'moderate rain': 'Rain',
        'forte pluie': 'Rain',
        'heavy intensity rain': 'Rain',
        'neige': 'Snow',
        'snow': 'Snow',
        'orage': 'Thunderstorm',
        'thunderstorm': 'Thunderstorm'
      };
      
      weatherCondition = conditionMapping[description] || (isNight ? 'ClearNight' : 'ClearDay');
      
      console.log(`🌤️ Mapping météo: "${description}" -> "${weatherCondition}"`)
      
      const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
      const timeBonus = WeatherEffectService.calculateTimeBonus();
      
      return { 
        weatherEffects, 
        timeBonus, 
        weatherCondition,
        // Ajouter les données complètes de l'API météo
        weatherData: {
          condition: weatherCondition,
          description: weatherData.description,
          icon: weatherData.icon,
          location: weatherData.location,
          country: weatherData.country,
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed
        }
      };
    });
  }

  /**
   * Version avec fallback silencieux pour les cas où la météo n'est pas critique
   */
  static async detectWeatherEffectsSafe(lat: number = 48.8566, lon: number = 2.3522) {
    try {
      return await this.detectWeatherEffects(lat, lon);
    } catch (error) {
      const weatherEffects = WeatherEffectService.getWeatherEffectByCondition('ClearDay');
      const timeBonus = WeatherEffectService.calculateTimeBonus();
      return { 
        weatherEffects, 
        timeBonus, 
        weatherCondition: 'ClearDay',
        weatherData: {
          condition: 'ClearDay',
          description: 'Temps ensoleillé',
          icon: '01d',
          location: 'Inconnu',
          country: 'FR',
          temperature: 20,
          humidity: 50,
          windSpeed: 10
        }
      };
    }
  }
} 