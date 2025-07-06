import { useState, useEffect } from 'react';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

export default function SimpleWeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showCityInput, setShowCityInput] = useState(false);
  const [city, setCity] = useState('');

  // Vérifier qu'on est côté client
  useEffect(() => {
    setIsClient(true);
    console.log('✅ SimpleWeatherWidget monté côté client');
  }, []);

  const getWeatherWithLocation = async () => {
    console.log('🌤️ Récupération météo avec géolocalisation...');
    setLoading(true);
    setError(null);

    try {
      // Géolocalisation avec gestion d'erreur améliorée
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non supportée'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            console.error('❌ Erreur géolocalisation:', error);
            if (error.code === 1) {
              reject(new Error('denied'));
            } else if (error.code === 2) {
              reject(new Error('unavailable'));
            } else if (error.code === 3) {
              reject(new Error('timeout'));
            } else {
              reject(new Error('unknown'));
            }
          },
          {
            enableHighAccuracy: false, // Réduire la précision pour éviter les erreurs
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log('✅ Position obtenue:', { lat, lon });

      await fetchWeatherData(lat, lon);
      
    } catch (err) {
      console.error('❌ Erreur météo:', err);
      handleGeolocationError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    const response = await fetch(`/api/weather/effects?lat=${lat}&lon=${lon}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const weatherData = await response.json();
    console.log('✅ Données météo reçues:', weatherData);
    
    setWeather({
      location: weatherData.location || 'Position actuelle',
      temperature: Math.round(weatherData.temperature || 0),
      description: weatherData.effects?.description || weatherData.description || 'Temps variable',
      humidity: weatherData.humidity || 0,
      windSpeed: Math.round(weatherData.windSpeed || 0),
      icon: weatherData.icon || '🌤️',
      country: weatherData.country || ''
    });
  };

  const handleGeolocationError = (err: any) => {
    if (err instanceof Error) {
      if (err.message.includes('denied')) {
        setError('Accès à la géolocalisation refusé. Essayez avec une ville ?');
      } else if (err.message.includes('unavailable') || err.message.includes('unknown')) {
        setError('Position introuvable. Essayez avec une ville ?');
      } else if (err.message.includes('timeout')) {
        setError('Délai dépassé. Essayez avec une ville ?');
      } else {
        setError(`Géolocalisation impossible. Essayez avec une ville ?`);
      }
    } else {
      setError('Erreur de géolocalisation. Essayez avec une ville ?');
    }
    setShowCityInput(true);
  };

  const getWeatherByCity = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      // Utiliser des coordonnées par défaut pour Paris si la ville est vide
      // ou essayer de géocoder la ville (pour l'instant, fallback sur Paris)
      const defaultCoords = { lat: 48.8566, lon: 2.3522 }; // Paris
      await fetchWeatherData(defaultCoords.lat, defaultCoords.lon);
      
    } catch (err) {
      console.error('❌ Erreur météo ville:', err);
      setError('Impossible de récupérer la météo pour cette ville.');
    } finally {
      setLoading(false);
    }
  };

  const tryWithDefaultLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Coordonnées par défaut (Paris)
      await fetchWeatherData(48.8566, 2.3522);
      setError(null);
    } catch (err) {
      setError('Impossible de récupérer la météo par défaut.');
    } finally {
      setLoading(false);
    }
  };

  // Afficher le fallback si on n'est pas encore côté client
  if (!isClient) {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white shadow-lg mb-4">
        <h3 className="text-lg font-semibold mb-3">🌤️ Météo Locale</h3>
        <div className="text-center mb-3">
          <div className="animate-pulse">
            <div className="text-6xl mb-2">📍</div>
            <p className="text-sm opacity-90">Initialisation...</p>
          </div>
        </div>
        <div className="w-full bg-white bg-opacity-20 py-3 px-4 rounded">
          <div className="h-6 bg-white bg-opacity-20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white shadow-lg mb-4">
      <h3 className="text-lg font-semibold mb-3">🌤️ Météo Locale</h3>
      
      {!weather && !loading && !error && (
        <div className="text-center mb-3">
          <p className="text-sm opacity-90 mb-2">
            Cliquez pour obtenir la météo de votre position
          </p>
          <div className="text-6xl mb-2">📍</div>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="ml-2">🌍 Récupération de la météo...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-30 border border-red-300 rounded p-3 mb-3">
          <p className="text-sm">⚠️ {error}</p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => setError(null)}
              className="text-xs underline hover:no-underline"
            >
              Réessayer géolocalisation
            </button>
            <button
              onClick={tryWithDefaultLocation}
              className="text-xs underline hover:no-underline"
            >
              Météo Paris
            </button>
          </div>
        </div>
      )}

      {showCityInput && (
        <div className="mb-3">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Entrez votre ville..."
            className="w-full p-2 rounded text-black mb-2"
            onKeyPress={(e) => e.key === 'Enter' && getWeatherByCity()}
          />
          <button
            onClick={getWeatherByCity}
            disabled={loading || !city.trim()}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 text-white py-2 px-4 rounded"
          >
            🏙️ Météo par ville
          </button>
        </div>
      )}

      {weather && (
        <div className="space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">
                {weather.location}{weather.country && `, ${weather.country}`}
              </h4>
              <p className="text-sm opacity-90 capitalize">{weather.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
              <div className="text-2xl">{weather.icon}</div>
            </div>
          </div>
          <div className="flex justify-between text-sm opacity-80 bg-white bg-opacity-10 rounded p-2">
            <span>💧 Humidité: {weather.humidity}%</span>
            <span>💨 Vent: {weather.windSpeed} km/h</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={getWeatherWithLocation}
          disabled={loading}
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>
            {loading ? '📍 Localisation...' : weather ? '🔄 Actualiser' : '📍 Ma météo locale'}
          </span>
        </button>
        
        {!showCityInput && (
          <button
            onClick={() => setShowCityInput(true)}
            className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-white text-sm py-2 px-4 rounded"
          >
            🏙️ Météo par ville
          </button>
        )}
      </div>
    </div>
  );
} 