export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

interface WeatherQueryParams {
  q?: string;
  lat?: number;
  lon?: number;
}

export class OpenWeatherClient {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private commonParams = {
    appid: '',
    units: 'metric',
    lang: 'fr'
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.commonParams.appid = apiKey;
    console.log('🔑 OpenWeatherClient initialisé avec clé:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MANQUANTE');
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    return this.fetchWeatherData({ q: city }, `ville: ${city}`);
  }

  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    return this.fetchWeatherData({ lat, lon }, `coordonnées: ${lat}, ${lon}`);
  }

  private async fetchWeatherData(queryParams: WeatherQueryParams, logIdentifier: string): Promise<WeatherData> {
    try {
      const url = this.buildUrl(queryParams);
      console.log(`🌐 Appel API ${logIdentifier}:`, this.sanitizeUrlForLog(url));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Réponse API:', response.status, response.statusText, errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Données ${logIdentifier} reçues:`, data);
      
      return this.transformWeatherData(data);
    } catch (error) {
      console.error(`❌ Erreur météo ${logIdentifier}:`, error);
      throw new Error(`Erreur météo pour ${logIdentifier}: ${error}`);
    }
  }

  private buildUrl(queryParams: WeatherQueryParams): string {
    const allParams = { ...this.commonParams, ...queryParams };
    const searchParams = new URLSearchParams(
      Object.entries(allParams).map(([key, value]) => [key, String(value)])
    );
    return `${this.baseUrl}?${searchParams.toString()}`;
  }

  private sanitizeUrlForLog(url: string): string {
    return url.replace(this.apiKey, 'XXX');
  }

  private transformWeatherData(data: any): WeatherData {
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0]?.description || 'N/A',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s vers km/h
      icon: data.weather[0]?.icon || '',
      country: data.sys.country || '',
    };
  }
} 