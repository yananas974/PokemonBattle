import { useState, useEffect } from 'react';
import { weatherService, type WeatherData } from '~/services/weatherService';

// ✅ Types pour les effets météo
interface WeatherEffects {
  condition: string;
  description: string;
  getMultiplierFor?: (pokemonType: string) => number;
}

// ✅ Liste des types de Pokémon
const POKEMON_TYPES = [
  'Normal', 'Feu', 'Eau', 'Plante', 'Électrik', 'Glace', 'Combat', 'Poison', 
  'Sol', 'Vol', 'Psy', 'Insecte', 'Roche', 'Spectre', 'Dragon', 'Ténèbres', 
  'Acier', 'Fée'
];

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherEffects, setWeatherEffects] = useState<WeatherEffects | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');

  // ✅ Charger automatiquement la météo au montage
  useEffect(() => {
    loadWeatherAuto();
  }, []); // Se lance une seule fois au montage

  const loadWeatherAuto = async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Géolocalisation non disponible');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMode('auto');
      
      const weatherData = await weatherService.getCurrentLocationWeather();
      setWeather(weatherData);
      
      // ✅ Récupérer aussi les effets météo
      await loadWeatherEffects(weatherData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur météo inconnue';
      setError(errorMessage);
      console.error('🔥 Erreur widget météo:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherByCity = async () => {
    if (!cityInput.trim()) {
      setError('Veuillez saisir une ville');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setMode('manual');
      
      const weatherData = await weatherService.getWeatherByCity(cityInput.trim());
      console.log('🔍 Mode:', mode, 'Weather data:', weatherData);
      setWeather(weatherData);
      
      // ✅ Récupérer aussi les effets météo
      await loadWeatherEffects(weatherData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ville non trouvée';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Plus simple : utiliser les données météo pour déterminer les effets
  const loadWeatherEffects = async (weatherData: WeatherData) => {
    try {
      const isNight = weatherData.icon.endsWith('n');
      const condition = isNight ? 'ClearNight' : 'ClearDay';
      
      setWeatherEffects({
        condition,
        description: isNight 
          ? 'Nuit étoilée - Types mystiques favorisés' 
          : 'Temps ensoleillé - Types solaires favorisés'
      });
    } catch (err) {
      console.error('Erreur effets météo:', err);
    }
  };

  // ✅ Calculer les bonus/malus pour chaque type
  const getTypeEffects = () => {
    if (!weatherEffects || !weather) return { bonus: [], malus: [], neutral: [] };
    
    const bonus = [];
    const malus = [];
    const neutral = [];
    
    // ✅ Effets selon le jour/nuit et conditions météo
    const isNight = weather.icon.endsWith('n');
    
    if (isNight) {
      // Nuit : types mystiques favorisés
      bonus.push('Spectre', 'Ténèbres', 'Psy', 'Fée');
      malus.push('Feu', 'Plante', 'Combat');
      neutral.push('Eau', 'Électrik', 'Glace', 'Poison', 'Sol', 'Vol', 'Insecte', 'Roche', 'Dragon', 'Acier', 'Normal');
    } else {
      // Jour : types solaires favorisés  
      bonus.push('Feu', 'Sol', 'Roche', 'Plante', 'Insecte');
      malus.push('Eau', 'Glace', 'Spectre', 'Ténèbres');
      neutral.push('Normal', 'Électrik', 'Combat', 'Poison', 'Vol', 'Psy', 'Dragon', 'Acier', 'Fée');
    }
    
    return { bonus, malus, neutral };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Chargement de la météo...</span>
        </div>
      </div>
    );
  }

  if (!weather && !error) {
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white">
        <h3 className="text-lg font-semibold mb-3">🌤️ Météo</h3>
        
        <button
          onClick={loadWeatherAuto}
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-3 mb-2 transition-colors"
        >
          📍 Utiliser ma position actuelle
        </button>
        
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ou saisissez une ville..."
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadWeatherByCity()}
            className="w-full px-3 py-2 rounded text-gray-700"
          />
          <button
            onClick={loadWeatherByCity}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-2 transition-colors"
          >
            🔍 Rechercher
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 rounded-lg p-4 border border-red-200">
        <div className="mb-3">
          <span className="text-red-600">❌ {error}</span>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={loadWeatherAuto}
            className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            📍 Réessayer géolocalisation
          </button>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Ou essayez une ville..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadWeatherByCity()}
              className="flex-1 px-3 py-2 border rounded text-gray-700"
            />
            <button
              onClick={loadWeatherByCity}
              className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
            >
              🔍
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const { bonus, malus, neutral } = getTypeEffects();

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-semibold">
              📍 {weather.location}, {weather.country}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {weather.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                  alt={weather.description}
                  className="w-8 h-8"
                />
              )}
              <span className="text-2xl font-bold">{weather.temperature}°C</span>
            </div>
            <div className="text-sm opacity-90">
              <div>{weather.description}</div>
              <div>💧 {weather.humidity}% • 💨 {weather.windSpeed} km/h</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {setWeather(null); setError(null); setCityInput(''); setWeatherEffects(null);}}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors ml-2"
          title="Changer"
        >
          🔄
        </button>
      </div>

      {/* ✅ Affichage des effets sur les types de Pokémon */}
      {weatherEffects && (
        <div className="mt-3 space-y-2">
          <div className="text-sm font-medium">
            🌤️ {weatherEffects.description}
          </div>
          
          {bonus.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs bg-green-500 bg-opacity-20 px-2 py-1 rounded">
                ⬆️ Bonus:
              </span>
              {bonus.map(type => (
                <span key={type} className="text-xs bg-green-400 bg-opacity-30 px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          )}

          {malus.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs bg-red-500 bg-opacity-20 px-2 py-1 rounded">
                ⬇️ Malus:
              </span>
              {malus.map(type => (
                <span key={type} className="text-xs bg-red-400 bg-opacity-30 px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 