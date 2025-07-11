import React from 'react';
import type { WeatherEffect as WeatherEffectType } from '~/types/battle';

interface WeatherEffectProps {
  weather: WeatherEffectType;
  animated?: boolean;
}

export const WeatherEffect: React.FC<WeatherEffectProps> = ({
  weather,
  animated = true
}) => {
  // Configuration des effets météo
  const getWeatherConfig = (weatherName: string) => {
    const name = weatherName?.toLowerCase() || '';
    
    if (name.includes('clear') || name.includes('day')) {
      return {
        icon: '☀️',
        color: 'from-yellow-400 to-orange-600',
        particles: '✨',
        animation: 'animate-pulse'
      };
    }
    
    if (name.includes('rain')) {
      return {
        icon: '🌧️',
        color: 'from-blue-600 to-blue-800',
        particles: '💧',
        animation: 'animate-bounce'
      };
    }
    
    if (name.includes('neige') || name.includes('snow')) {
      return {
        icon: '❄️',
        color: 'from-blue-200 to-white',
        particles: '❄️',
        animation: 'animate-spin'
      };
    }
    
    if (name.includes('orage') || name.includes('storm')) {
      return {
        icon: '⛈️',
        color: 'from-gray-700 to-purple-900',
        particles: '⚡',
        animation: 'animate-pulse'
      };
    }
    
    if (name.includes('vent') || name.includes('wind')) {
      return {
        icon: '💨',
        color: 'from-gray-400 to-gray-600',
        particles: '🍃',
        animation: 'animate-bounce'
      };
    }
    
    // Effet par défaut
    return {
      icon: '🌤️',
      color: 'from-blue-400 to-blue-600',
      particles: '✨',
      animation: 'animate-pulse'
    };
  };

  const config = getWeatherConfig(weather.name || weather.description || '');

  return (
    <div className={`relative bg-gradient-to-r ${config.color} p-3 text-white`}>
      {/* Particules animées */}
      {animated && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-xl ${config.animation}`}
              style={{
                left: `${(i * 15) + 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + (i * 0.3)}s`
              }}
            >
              {config.particles}
            </div>
          ))}
        </div>
      )}
      
      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center space-x-3">
        <span className="text-2xl">{config.icon}</span>
        <div className="text-center">
          <div className="font-bold text-lg">{weather.name || 'Temps inconnu'}</div>
          <div className="text-sm opacity-90">{weather.description}</div>
          {weather.multiplier !== 1 && (
            <div className="text-xs opacity-75">
              Multiplicateur: {weather.multiplier}x
            </div>
          )}
        </div>
        <span className="text-2xl">{config.icon}</span>
      </div>
    </div>
  );
}; 