import { OpenWeatherClient } from '../../infrastructure/http/apiClients/openWeatherClient.js';

export class WeatherService {
  private openWeatherClient: OpenWeatherClient;

  constructor() {
    const apiKey = process.env.OPENWEATHER_API_KEY || '';
    
    console.log('🔑 WeatherService - Clé API:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MANQUANTE');
    console.log('🔑 Variables d\'environnement disponibles:', Object.keys(process.env).filter(k => k.includes('WEATHER')));
    
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY manquante dans les variables d\'environnement');
    }
    
    this.openWeatherClient = new OpenWeatherClient(apiKey);
  }

  async getWeatherForCity(city: string) {
    console.log(`🌤️ WeatherService.getWeatherForCity(${city})`);
    return this.openWeatherClient.getCurrentWeather(city);
  }

  async getWeatherByCoordinates(lat: number, lon: number) {
    console.log(`🌍 WeatherService.getWeatherByCoordinates(${lat}, ${lon})`);
    return this.openWeatherClient.getWeatherByCoordinates(lat, lon);
  }
} 