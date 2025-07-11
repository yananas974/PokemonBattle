import React, { useState, useEffect } from 'react';
import { ModernCard } from './ui/ModernCard';
import { ModernButton } from './ui/ModernButton';
import { useWeather, type WeatherData } from '~/hooks/useWeather'; 
import { 
  WeatherCondition,
  getWeatherGradient,
  formatTemperature,
  formatWindSpeed,
  formatHumidity
} from '@pokemon-battle/shared';

interface ModernWeatherWidgetProps {
  className?: string;
  compact?: boolean;
  autoLoad?: boolean;
}

export const ModernWeatherWidget: React.FC<ModernWeatherWidgetProps> = ({
  className = '',
  compact = false,
  autoLoad = false
}) => {
  const { weather, loading, error, fetchWeatherByLocation, fetchWeather, clearError } = useWeather();
  const [isClient, setIsClient] = useState(false);
  const [showCityInput, setShowCityInput] = useState(false);
  const [city, setCity] = useState('');

  // Vérifier qu'on est côté client
  useEffect(() => {
    setIsClient(true);
    if (autoLoad) {
      // Auto-charger la météo au démarrage
      setTimeout(() => {
        fetchWeatherByLocation();
      }, 1000);
    }
  }, [autoLoad, fetchWeatherByLocation]);



  // Utilisation de l'utilitaire du shared pour le gradient météo
  const getWeatherGradientFromShared = (description: string, temperature: number) => {
    return getWeatherGradient(description, temperature);
  };

  const handleGeolocationError = () => {
    setShowCityInput(true);
  };

  const getWeatherByCity = async () => {
    if (!city.trim()) return;
    
    try {
      // Coordonnées par défaut (Paris) - À améliorer avec un service de géocodage
      const defaultCoords = { lat: 48.8566, lon: 2.3522 };
      await fetchWeather(defaultCoords.lat, defaultCoords.lon);
      setShowCityInput(false);
    } catch (err) {
      console.error('Erreur météo ville:', err);
    }
  };

  const tryWithDefaultLocation = async () => {
    try {
      await fetchWeather(48.8566, 2.3522); // Paris
    } catch (err) {
      console.error('Erreur météo par défaut:', err);
    }
  };

  // Rendu de chargement côté client
  if (!isClient) {
    return (
      <ModernCard variant="glass" className={`${className} animate-pulse`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
              <div className="h-3 bg-white bg-opacity-20 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="glass" className={className}>
      <div className={`${compact ? 'p-3' : 'p-4'} relative overflow-hidden`}>
                 {/* Gradient de fond basé sur la météo */}
         {weather && (
           <div 
             className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradientFromShared(weather.description, weather.temperature)} opacity-10`}
           />
         )}
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg flex items-center">
              <span className="mr-2">🌤️</span>
              {compact ? 'Météo' : 'Météo Locale'}
            </h3>
            
                         {weather && !loading && (
               <ModernButton
                 variant="secondary"
                 size="sm"
                 onClick={fetchWeatherByLocation}
                 className="text-white border-white border-opacity-30 hover:bg-white hover:bg-opacity-20"
               >
                 🔄
               </ModernButton>
             )}
          </div>

          {/* État de chargement */}
          {loading && (
            <div className="flex items-center space-x-3 text-white">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-sm">Récupération de la météo...</span>
            </div>
          )}

                     {/* Erreur */}
           {error && !loading && (
             <div className="bg-red-500 bg-opacity-30 border border-red-300 rounded-lg p-3 mb-3">
               <p className="text-white text-sm mb-2">⚠️ {error}</p>
               <div className="flex space-x-2">
                 <ModernButton
                   variant="secondary"
                   size="sm"
                   onClick={tryWithDefaultLocation}
                   className="text-white border-white border-opacity-30 text-xs"
                 >
                   Météo Paris
                 </ModernButton>
                 <ModernButton
                   variant="secondary"
                   size="sm"
                   onClick={() => {
                     clearError();
                     setShowCityInput(true);
                   }}
                   className="text-white border-white border-opacity-30 text-xs"
                 >
                   Autre ville
                 </ModernButton>
               </div>
             </div>
           )}

          {/* Input ville */}
          {showCityInput && (
            <div className="mb-4">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Entrez votre ville..."
                className="w-full p-2 rounded-lg text-black mb-2 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && getWeatherByCity()}
              />
              <div className="flex space-x-2">
                <ModernButton
                  variant="primary"
                  size="sm"
                  onClick={getWeatherByCity}
                  disabled={loading || !city.trim()}
                  className="flex-1"
                >
                  🏙️ Valider
                </ModernButton>
                <ModernButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCityInput(false)}
                  className="text-white border-white border-opacity-30"
                >
                  ✕
                </ModernButton>
              </div>
            </div>
          )}

          {/* Données météo */}
          {weather && !loading && (
            <div className="space-y-4">
              {/* Informations principales */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">
                    {weather.location}
                    {weather.country && `, ${weather.country}`}
                  </h4>
                  <p className="text-white opacity-80 text-sm capitalize">
                    {weather.description}
                  </p>
                </div>
                                 <div className="text-right">
                   <div className="text-white text-3xl font-bold">
                     {formatTemperature(weather.temperature)}
                   </div>
                   <div className="text-4xl">{weather.icon}</div>
                 </div>
              </div>

              {/* Détails */}
                             <div className="grid grid-cols-2 gap-3 text-sm">
                 <div className="bg-white bg-opacity-10 rounded-lg p-3">
                   <div className="text-white opacity-80">Humidité</div>
                   <div className="text-white font-bold">💧 {formatHumidity(weather.humidity)}</div>
                 </div>
                 <div className="bg-white bg-opacity-10 rounded-lg p-3">
                   <div className="text-white opacity-80">Vent</div>
                   <div className="text-white font-bold">💨 {formatWindSpeed(weather.windSpeed)}</div>
                 </div>
               </div>

              {/* Effets Pokemon */}
              {weather.effects && (
                <div className="bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="text-white opacity-80 text-xs mb-1">Effet Pokemon</div>
                  <div className="text-white font-medium text-sm">
                    {weather.effects.description}
                  </div>
                  {weather.effects.multiplier !== 1 && (
                    <div className="text-white opacity-70 text-xs mt-1">
                      Multiplicateur: {weather.effects.multiplier}x
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bouton initial */}
          {!weather && !loading && !error && (
            <div className="text-center">
              <div className="text-6xl mb-4">📍</div>
                             <ModernButton
                 variant="primary"
                 onClick={fetchWeatherByLocation}
                 className="w-full"
               >
                 📍 Obtenir ma météo locale
               </ModernButton>
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => setShowCityInput(true)}
                className="w-full mt-2 text-white border-white border-opacity-30"
              >
                🏙️ Météo par ville
              </ModernButton>
            </div>
          )}
        </div>
      </div>
    </ModernCard>
  );
}; 