import { useState } from 'react';
import ClientOnly from './ClientOnly';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

function WeatherWidgetContent() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeatherWithLocation = async () => {
    console.log('🌤️ Récupération météo avec géolocalisation...');
    setLoading(true);
    setError(null);

    try {
      // Géolocalisation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log('✅ Position obtenue:', { lat, lon });

      // ✅ Appel API météo avec VOS coordonnées
      const response = await fetch(`http://localhost:3001/api/weather/effects?lat=${lat}&lon=${lon}`, {
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
      
      // ✅ Structure des données météo du backend
      setWeather({
        location: weatherData.location || 'Position actuelle',
        temperature: Math.round(weatherData.temperature || 0),
        description: weatherData.effects?.description || weatherData.description || 'Temps variable',
        humidity: weatherData.humidity || 0,
        windSpeed: Math.round(weatherData.windSpeed || 0),
        icon: weatherData.icon || '🌤️',
        country: weatherData.country || ''
      });
      
    } catch (err) {
      console.error('❌ Erreur météo:', err);
      if (err instanceof Error) {
        if (err.message.includes('denied')) {
          setError('Accès à la géolocalisation refusé. Veuillez autoriser l\'accès à votre position.');
        } else if (err.message.includes('unavailable')) {
          setError('Géolocalisation non disponible sur cet appareil.');
        } else if (err.message.includes('timeout')) {
          setError('Délai dépassé pour obtenir votre position.');
        } else {
          setError(`Erreur: ${err.message}`);
        }
      } else {
        setError('Erreur inconnue lors de la récupération de la météo.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <span className="ml-2">🌍 Récupération de votre position...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-30 border border-red-300 rounded p-3 mb-3">
          <p className="text-sm">⚠️ {error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs underline mt-1 hover:no-underline"
          >
            Réessayer
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

      <button
        onClick={getWeatherWithLocation}
        disabled={loading}
        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded transition-all duration-200 flex items-center justify-center space-x-2"
      >
        <span>
          {loading ? '📍 Localisation...' : weather ? '🔄 Actualiser' : '📍 Ma météo locale'}
        </span>
      </button>
    </div>
  );
}

export default function SimpleWeatherWidget() {
  return (
    <ClientOnly fallback={
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
    }>
      <WeatherWidgetContent />
    </ClientOnly>
  );
} 