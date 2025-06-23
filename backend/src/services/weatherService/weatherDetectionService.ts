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
      
      // Mapper la condition OpenWeatherMap vers nos conditions
      const description = weatherData.description.toLowerCase();
      
      if (description.includes('clear') || description.includes('dégagé')) {
        weatherCondition = isNight ? 'ClearNight' : 'ClearDay';
      } else if (description.includes('rain') || description.includes('pluie')) {
        weatherCondition = 'Rain';
      } else if (description.includes('snow') || description.includes('neige')) {
        weatherCondition = 'Snow';
      } else if (description.includes('storm') || description.includes('orage')) {
        weatherCondition = 'Thunderstorm';
      }
      
      const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
      const timeBonus = WeatherEffectService.calculateTimeBonus();
      
      return { weatherEffects, timeBonus, weatherCondition };
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
      return { weatherEffects, timeBonus, weatherCondition: 'ClearDay' };
    }
  }
} 