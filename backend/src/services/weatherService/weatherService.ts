import { OpenWeatherClient } from '../../infrastructure/http/apiClients/openWeatherClient.js';

export class WeatherService {
  private openWeatherClient: OpenWeatherClient;

  constructor() {
    const apiKey = process.env.OPENWEATHER_API_KEY || '';
    
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY manquante dans les variables d\'environnement');
    }
    
    this.openWeatherClient = new OpenWeatherClient(apiKey);
  }

  async getWeatherForCity(city: string) {
    return this.openWeatherClient.getCurrentWeather(city);
  }

  async getWeatherByCoordinates(lat: number, lon: number) {
    return this.openWeatherClient.getWeatherByCoordinates(lat, lon);
  }
} 