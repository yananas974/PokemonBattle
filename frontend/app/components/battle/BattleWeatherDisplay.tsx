import React, { useMemo, useState } from 'react';
import { cn } from '~/utils/cn';

interface WeatherData {
  condition: string;
  description: string;
  icon?: string;
  [key: string]: any;
}

interface PokemonData {
  type: string;
  weatherStatus?: string;
  weatherMultiplier?: number;
  name_fr?: string;
  [key: string]: any;
}

interface BattleWeatherDisplayProps {
  weather: WeatherData;
  playerPokemon?: PokemonData;
  enemyPokemon?: PokemonData;
  turnCount?: number;
  timeBonus?: number;
  className?: string;
}

export const BattleWeatherDisplay: React.FC<BattleWeatherDisplayProps> = ({
  weather,
  playerPokemon,
  enemyPokemon,
  turnCount = 1,
  timeBonus = 1,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // Fonction pour obtenir l'icône selon l'API OpenWeatherMap
  const getOpenWeatherIcon = (iconCode: string): string => {
    // Mapping des codes d'icône OpenWeatherMap vers des émojis
    const iconMapping: Record<string, string> = {
      '01d': '☀️',    // clear sky day
      '01n': '🌙',    // clear sky night
      '02d': '⛅',    // few clouds day
      '02n': '☁️',    // few clouds night
      '03d': '☁️',    // scattered clouds day
      '03n': '☁️',    // scattered clouds night
      '04d': '☁️',    // broken clouds day
      '04n': '☁️',    // broken clouds night
      '09d': '🌦️',   // shower rain day
      '09n': '🌧️',   // shower rain night
      '10d': '🌦️',   // rain day
      '10n': '🌧️',   // rain night
      '11d': '⛈️',    // thunderstorm day
      '11n': '⛈️',    // thunderstorm night
      '13d': '🌨️',   // snow day
      '13n': '🌨️',   // snow night
      '50d': '🌫️',   // mist day
      '50n': '🌫️',   // mist night
    };
    
    return iconMapping[iconCode] || '🌤️';
  };

  // Fonction pour obtenir le nom selon l'icône API
  const getNameForIcon = (iconCode: string, condition: string): string => {
    const nameMapping: Record<string, string> = {
      '01d': 'Temps Ensoleillé',
      '01n': 'Nuit Étoilée',
      '02d': 'Partiellement Nuageux',
      '02n': 'Nuit Nuageuse',
      '03d': 'Nuageux',
      '03n': 'Nuit Nuageuse',
      '04d': 'Très Nuageux',
      '04n': 'Nuit Couverte',
      '09d': 'Bruine',
      '09n': 'Pluie Nocturne',
      '10d': 'Temps Pluvieux',
      '10n': 'Pluie Nocturne',
      '11d': 'Orage',
      '11n': 'Orage Nocturne',
      '13d': 'Temps Neigeux',
      '13n': 'Neige Nocturne',
      '50d': 'Brouillard',
      '50n': 'Brouillard Nocturne',
    };
    
    return nameMapping[iconCode] || getDefaultNameForCondition(condition);
  };

  // Fonction pour obtenir le nom par défaut selon la condition
  const getDefaultNameForCondition = (condition: string): string => {
    const defaultNames: Record<string, string> = {
      'ClearDay': 'Temps Ensoleillé',
      'ClearNight': 'Nuit Étoilée',
      'Rain': 'Temps Pluvieux',
      'Snow': 'Temps Neigeux',
      'Thunderstorm': 'Orage',
      'Clouds': 'Temps Nuageux',
      'Fog': 'Brouillard'
    };
    
    return defaultNames[condition] || 'Temps Variable';
  };

  // Configuration des conditions météo
  const getWeatherConfig = (condition: string, apiIcon?: string) => {
    // Utiliser l'icône de l'API si disponible
    const displayIcon = apiIcon ? getOpenWeatherIcon(apiIcon) : undefined;
    const displayName = apiIcon ? getNameForIcon(apiIcon, condition) : getDefaultNameForCondition(condition);
    
    switch (condition) {
      case 'ClearDay':
        return {
          icon: displayIcon || '☀️',
          name: displayName,
          color: 'from-yellow-400 to-orange-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          particles: ['✨', '🌞', '☀️'],
          effects: 'Favorise Feu, Sol, Roche'
        };
      case 'ClearNight':
        return {
          icon: displayIcon || '🌙',
          name: displayName,
          color: 'from-indigo-600 to-purple-800',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-800',
          effects: 'Favorise Spectre, Psy, Ténèbres'
        };
      case 'Rain':
        return {
          icon: displayIcon || '🌧️',
          name: displayName,
          color: 'from-blue-500 to-blue-700',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          effects: 'Favorise Eau, Électrik, Plante'
        };
      case 'Snow':
        return {
          icon: displayIcon || '❄️',
          name: displayName,
          color: 'from-blue-200 to-white',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-900',
          effects: 'Favorise Glace, Acier'
        };
      case 'Thunderstorm':
        return {
          icon: displayIcon || '⛈️',
          name: displayName,
          color: 'from-gray-700 to-purple-900',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-800',
     
          effects: 'Très favorable Électrik'
        };
      case 'Clouds':
        return {
          icon: displayIcon || '☁️',
          name: displayName,
          color: 'from-gray-400 to-gray-600',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          
          effects: 'Favorise Vol, Dragon'
        };
      case 'Fog':
        return {
          icon: displayIcon || '🌫️',
          name: displayName,
          color: 'from-gray-300 to-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
         
          effects: 'Favorise Spectre, Psy'
        };
      default:
        return {
          icon: displayIcon || '🌤️',
          name: displayName,
          color: 'from-blue-400 to-blue-600',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
        
          effects: 'Effets neutres'
        };
    }
  };

  // Fonction pour obtenir les particules par défaut selon la condition
  const getDefaultParticlesForCondition = (condition: string): string[] => {
    const defaultParticles: Record<string, string[]> = {
      'ClearDay': ['✨', '🌞', '☀️'],
      'ClearNight': ['⭐', '🌟', '✨'],
      'Rain': ['💧', '🌧️', '💦'],
      'Snow': ['❄️', '🌨️', '⛄'],
      'Thunderstorm': ['⚡', '🌩️', '⛈️'],
      'Clouds': ['☁️', '🌫️', '💨'],
      'Fog': ['🌫️', '👻', '🔮']
    };
    
    return defaultParticles[condition] || ['🌤️', '☁️', '✨'];
  };

  // Calculer dynamiquement l'effet météo sur un Pokémon
  const calculateWeatherMultiplier = (pokemonType: string, weatherCondition: string): number => {
    
    // Correspondance types français -> anglais
    const typeMapping: Record<string, string> = {
      'Feu': 'Fire', 'Eau': 'Water', 'Plante': 'Grass', 'Électrik': 'Electric',
      'Glace': 'Ice', 'Combat': 'Fighting', 'Poison': 'Poison', 'Sol': 'Ground',
      'Vol': 'Flying', 'Psy': 'Psychic', 'Insecte': 'Bug', 'Roche': 'Rock',
      'Spectre': 'Ghost', 'Dragon': 'Dragon', 'Ténèbres': 'Dark', 'Acier': 'Steel',
      'Fée': 'Fairy', 'Normal': 'Normal'
    };

    const englishType = typeMapping[pokemonType] || pokemonType;

    // Affinités simplifiées pour le frontend
    const typeAffinities: Record<string, { solar: number; aquatic: number; nocturnal: number; aerial: number; terrestrial: number; mystical: number; elemental: number }> = {
      'Fire': { solar: 1, aquatic: -0.8, nocturnal: -0.3, aerial: 0, terrestrial: 0.2, mystical: 0, elemental: 0.8 },
      'Water': { solar: -0.2, aquatic: 1, nocturnal: 0.1, aerial: 0, terrestrial: 0, mystical: 0, elemental: 0.6 },
      'Grass': { solar: 0.8, aquatic: 0.3, nocturnal: -0.4, aerial: 0, terrestrial: 0.5, mystical: 0.2, elemental: 0.4 },
      'Electric': { solar: 0.2, aquatic: 0.5, nocturnal: 0, aerial: 0.3, terrestrial: -0.2, mystical: 0.3, elemental: 1 },
      'Ice': { solar: -0.8, aquatic: 0.2, nocturnal: 0.2, aerial: 0.1, terrestrial: 0, mystical: 0, elemental: 0.5 },
      'Fighting': { solar: 0.3, aquatic: 0, nocturnal: -0.4, aerial: 0, terrestrial: 0.2, mystical: -0.3, elemental: 0 },
      'Poison': { solar: -0.2, aquatic: 0.2, nocturnal: 0.6, aerial: 0, terrestrial: 0.3, mystical: 0.4, elemental: 0.3 },
      'Ground': { solar: 0.6, aquatic: -0.5, nocturnal: 0, aerial: -0.3, terrestrial: 1, mystical: 0, elemental: 0.4 },
      'Flying': { solar: 0.4, aquatic: 0, nocturnal: -0.2, aerial: 1, terrestrial: -0.5, mystical: 0.2, elemental: 0.3 },
      'Psychic': { solar: 0.1, aquatic: 0, nocturnal: 0.7, aerial: 0.2, terrestrial: 0, mystical: 1, elemental: 0.2 },
      'Bug': { solar: 0.6, aquatic: -0.3, nocturnal: 0.3, aerial: 0.4, terrestrial: 0.2, mystical: 0, elemental: 0.2 },
      'Rock': { solar: 0.4, aquatic: -0.4, nocturnal: 0, aerial: -0.2, terrestrial: 0.8, mystical: 0, elemental: 0.3 },
      'Ghost': { solar: -0.6, aquatic: 0, nocturnal: 1, aerial: 0.3, terrestrial: 0, mystical: 0.9, elemental: 0 },
      'Dragon': { solar: 0.3, aquatic: 0.2, nocturnal: 0.4, aerial: 0.6, terrestrial: 0.1, mystical: 0.7, elemental: 0.8 },
      'Dark': { solar: -0.7, aquatic: 0, nocturnal: 0.9, aerial: 0.1, terrestrial: 0.2, mystical: 0.6, elemental: 0.1 },
      'Steel': { solar: -0.1, aquatic: -0.3, nocturnal: 0, aerial: 0, terrestrial: 0.4, mystical: -0.2, elemental: 0.5 },
      'Fairy': { solar: 0.4, aquatic: 0.1, nocturnal: 0.5, aerial: 0.3, terrestrial: 0.2, mystical: 0.8, elemental: 0.4 },
      'Normal': { solar: 0.2, aquatic: 0, nocturnal: -0.2, aerial: 0, terrestrial: 0.1, mystical: 0, elemental: 0 }
    };

    // Effets météo
    const weatherEffects: Record<string, Record<string, number>> = {
      'ClearDay': { solar: 0.4, aquatic: -0.2, nocturnal: -0.3, aerial: 0.2, terrestrial: 0.1, mystical: 0, elemental: 0.1 },
      'ClearNight': { solar: -0.3, aquatic: 0.1, nocturnal: 0.5, aerial: -0.1, terrestrial: 0, mystical: 0.3, elemental: 0 },
      'Rain': { solar: -0.4, aquatic: 0.6, nocturnal: 0.1, aerial: -0.3, terrestrial: -0.2, mystical: 0, elemental: 0.2 },
      'Snow': { solar: -0.5, aquatic: -0.1, nocturnal: 0.2, aerial: -0.4, terrestrial: -0.3, mystical: 0.1, elemental: -0.2 },
      'Thunderstorm': { solar: -0.3, aquatic: 0.3, nocturnal: 0.2, aerial: -0.6, terrestrial: 0, mystical: 0.2, elemental: 0.8 },
      'Clouds': { solar: -0.1, aquatic: 0.1, nocturnal: 0.1, aerial: 0.3, terrestrial: 0, mystical: 0.1, elemental: 0 },
      'Fog': { solar: -0.4, aquatic: 0.1, nocturnal: 0.4, aerial: -0.2, terrestrial: 0, mystical: 0.5, elemental: 0 }
    };

    const affinities = typeAffinities[englishType];
    const weather = weatherEffects[weatherCondition];
    
    
    if (!affinities || !weather) {
      return 1.0;
    }
    
    let totalEffect = 1.0;
    
    // Calculer l'effet basé sur chaque affinité
    Object.entries(weather).forEach(([affinity, weatherEffect]) => {
      const pokemonAffinity = affinities[affinity as keyof typeof affinities];
      const contribution = pokemonAffinity * weatherEffect;
      totalEffect += contribution;
    });
    
    
    // Limiter entre 0.5 et 1.5 pour éviter les extrêmes
    const finalEffect = Math.max(0.5, Math.min(1.5, totalEffect));
    
    return finalEffect;
  };

  // Obtenir le statut d'effet pour un Pokémon
  const getPokemonWeatherEffect = (pokemon?: PokemonData) => {
    if (!pokemon) return null;
    
    // FORCER le recalcul car le backend ne calcule pas correctement
    const multiplier = calculateWeatherMultiplier(pokemon.type, weather.condition);
    
    // Debug: afficher aussi la valeur backend pour comparaison
    if (pokemon.weatherMultiplier !== undefined) {
    }
    
    if (multiplier > 1.05) {
      return {
        status: 'Renforcé',
        icon: '⬆️',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        value: `+${Math.round((multiplier - 1) * 100)}%`
      };
    } else if (multiplier < 0.95) {
      return {
        status: 'Affaibli',
        icon: '⬇️',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        value: `-${Math.round((1 - multiplier) * 100)}%`
      };
    } else {
      return {
        status: 'Neutre',
        icon: '➖',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        value: '0%'
      };
    }
  };

  
  
  const config = getWeatherConfig(weather.condition, weather.icon);
  
  // Mémoriser les effets pour forcer la mise à jour quand les données changent
  const playerEffect = useMemo(() => {
    return getPokemonWeatherEffect(playerPokemon);
  }, [playerPokemon?.type, playerPokemon?.name_fr, playerPokemon?.weatherMultiplier, weather.condition]);
  
  const enemyEffect = useMemo(() => {
    return getPokemonWeatherEffect(enemyPokemon);
  }, [enemyPokemon?.type, enemyPokemon?.name_fr, enemyPokemon?.weatherMultiplier, weather.condition]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg border shadow-lg", config.bgColor, className)}>
      {/* Header avec animation météo */}
      <div className={cn("relative p-4 bg-gradient-to-r", config.color)}>

        {/* Contenu du header */}
        <div className="relative z-10 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h3 className="text-lg font-bold">{config.name}</h3>
              <p className="text-sm opacity-90">{weather.description}</p>
              {weather.icon && (
                <p className="text-xs opacity-75">Code: {weather.icon}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm">
              <div>Tour {turnCount}</div>
              {timeBonus !== 1 && (
                <div className="opacity-75">
                  Bonus temps: {timeBonus > 1 ? '+' : ''}{Math.round((timeBonus - 1) * 100)}%
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title={isExpanded ? 'Masquer les effets' : 'Afficher les effets'}
            >
              <span className={`text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Effets généraux */}
      {isExpanded && (
        <div className={cn("px-4 py-2 border-b", config.textColor)}>
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium">🎯 Effets:</span>
            <span>{config.effects}</span>
          </div>
        </div>
      )}

      {/* Effets sur les Pokémon */}
      {isExpanded && (
        <div className="p-4 space-y-3">
        {/* Pokémon Joueur */}
        {playerPokemon && playerEffect && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="text-lg">🟢</div>
              <div>
                <div className="font-medium text-gray-800">
                  {playerPokemon.name_fr || 'Votre Pokémon'}
                </div>
                <div className="text-sm text-gray-600">
                  Type {playerPokemon.type}
                </div>
              </div>
            </div>
            <div className={cn("flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium", 
              playerEffect.bgColor, playerEffect.color)}>
              <span>{playerEffect.icon}</span>
              <span>{playerEffect.status}</span>
              <span className="font-bold">{playerEffect.value}</span>
            </div>
          </div>
        )}

        {/* Pokémon Ennemi */}
        {enemyPokemon && enemyEffect && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="text-lg">🔴</div>
              <div>
                <div className="font-medium text-gray-800">
                  {enemyPokemon.name_fr || 'Pokémon Ennemi'}
                </div>
                <div className="text-sm text-gray-600">
                  Type {enemyPokemon.type}
                </div>
              </div>
            </div>
            <div className={cn("flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium",
              enemyEffect.bgColor, enemyEffect.color)}>
              <span>{enemyEffect.icon}</span>
              <span>{enemyEffect.status}</span>
              <span className="font-bold">{enemyEffect.value}</span>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default BattleWeatherDisplay;