import { useState } from 'react';

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

  const getWeather = async () => {
    console.log('🌤️ Récupération météo...');
    setLoading(true);
    setError(null);

    try {
      // Utiliser la géolocalisation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });

      console.log('✅ Position obtenue:', position.coords);

      // Appel à votre API (qui fonctionne maintenant !)
      const response = await fetch(`/api/weather/effects?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
      
      console.log('📡 Status:', response.status);

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Données reçues:', data);

      setWeather({
        location: data.location,
        temperature: data.temperature,
        description: data.description,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        icon: data.icon,
        country: data.country
      });

    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white shadow-lg">
      <h3 className="text-lg font-semibold mb-3">🌤️ Météo Actuelle</h3>
      
      {loading && (
        <div className="flex items-center space-x-2 mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Chargement...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-500 bg-opacity-30 border border-red-300 rounded p-3 mb-3">
          <p className="text-sm">❌ {error}</p>
        </div>
      )}

      {weather && (
        <div className="space-y-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-lg">{weather.location}, {weather.country}</h4>
              <p className="text-sm opacity-90 capitalize">{weather.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{weather.temperature}°C</div>
            </div>
          </div>
          <div className="flex justify-between text-sm opacity-80 bg-white bg-opacity-10 rounded p-2">
            <span>💧 Humidité: {weather.humidity}%</span>
            <span>💨 Vent: {weather.windSpeed} km/h</span>
          </div>
        </div>
      )}

      <button
        onClick={getWeather}
        disabled={loading}
        className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 text-white font-medium py-3 px-4 rounded transition-all duration-200"
      >
        {loading ? 'Chargement...' : weather ? '🔄 Actualiser' : '📍 Obtenir la météo'}
      </button>
    </div>
  );
} 