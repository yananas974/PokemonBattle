import { useState, useEffect, useCallback } from 'react';
import { 
  WeatherResponse, 
  WeatherRequest,
  WeatherEffectWithBonus,
  WeatherCondition,
  weatherValidators,
  ValidationService,
  getWeatherIcon,
  getWeatherGradient,
  formatTemperature,
  formatWindSpeed,
  formatHumidity
} from '@pokemon-battle/shared';

// Interface spécifique pour le widget météo
export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country?: string;
  effects?: WeatherEffectWithBonus;
}

export interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  fetchWeatherByLocation: () => Promise<void>;
  clearError: () => void;
}

export const useWeather = (): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);

    try {
      // Validation des coordonnées avec le validateur shared
      const validatedCoords = ValidationService.validateWeatherQuery({ lat, lon });
      
      const response = await fetch(`/api/weather/effects?lat=${validatedCoords.lat}&lon=${validatedCoords.lon}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const apiResponse = await response.json();
      
      // Les données sont wrappées dans apiResponse.data par formatResponse
      const weatherData = apiResponse.data || apiResponse;
      
      console.log('🌤️ Structure des données reçues:', weatherData);
      
      const processedWeather: WeatherData = {
        location: weatherData.location || 'Position actuelle',
        temperature: Math.round(weatherData.temperature || 0),
        // Utiliser la description météo originale (ex: "ciel dégagé")
        description: weatherData.description || 'Temps variable',
        humidity: weatherData.humidity || 0,
        windSpeed: Math.round(weatherData.windSpeed || 0),
        // Utiliser l'icône météo pour déterminer l'icône à afficher
        icon: getWeatherIcon(weatherData.description || '', weatherData.temperature || 0),
        country: weatherData.country || '',
        effects: weatherData.effects
      };
      
      console.log('🌤️ Données traitées:', processedWeather);
      console.log('🌤️ Humidity brute:', weatherData.humidity, 'traitée:', processedWeather.humidity);
      console.log('🌤️ WindSpeed brute:', weatherData.windSpeed, 'traitée:', processedWeather.windSpeed);

      setWeather(processedWeather);
    } catch (err) {
      console.error('❌ Erreur météo:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non supportée'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            if (error.code === 1) {
              reject(new Error('Accès à la géolocalisation refusé'));
            } else if (error.code === 2) {
              reject(new Error('Position introuvable'));
            } else if (error.code === 3) {
              reject(new Error('Délai dépassé'));
            } else {
              reject(new Error('Erreur de géolocalisation'));
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      await fetchWeather(lat, lon);
      
    } catch (err) {
      console.error('❌ Erreur géolocalisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de géolocalisation');
    } finally {
      setLoading(false);
    }
  }, [fetchWeather]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weather,
    loading,
    error,
    fetchWeather,
    fetchWeatherByLocation,
    clearError
  };
}; 