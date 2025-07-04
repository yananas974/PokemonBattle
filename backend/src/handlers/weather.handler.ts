import type { Context } from "hono";    
import { WeatherEffectService, WEATHER_EFFECTS } from "../services/weatherEffectService/weatherEffectService.js";
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, ExternalServiceError } from '../models/errors.js';

// ✅ Handlers refactorisés sans try/catch
export const getWeatherEffectsHandler = asyncHandler(async (c: Context) => {
  const lat = parseFloat(c.req.query('lat') || '48.8566');
  const lon = parseFloat(c.req.query('lon') || '2.3522');
  
  if (isNaN(lat) || isNaN(lon)) {
    throw new ValidationError('Coordonnées invalides');
  }
  
  console.log(`🌍 Récupération météo pour coordonnées: ${lat}, ${lon}`);
  
  let weatherData;
  let effectCondition = 'ClearDay';
  
  // Essayer de récupérer la vraie météo
  const { WeatherService } = await import('../services/weatherService/weatherService.js');
  const weatherService = new WeatherService();
  weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
  
  console.log('✅ Données météo OpenWeatherMap reçues:', weatherData);
  
  // ✅ Déterminer si c'est jour ou nuit basé sur l'icône
  const isNight = weatherData.icon.endsWith('n');
  
  // ✅ Mapper vers nos nouvelles conditions
  const conditionMapping: Record<string, string> = {
    'ciel dégagé': isNight ? 'ClearNight' : 'ClearDay',
    'clear sky': isNight ? 'ClearNight' : 'ClearDay',
    'quelques nuages': 'Clouds',
    'few clouds': 'Clouds',
    'nuages épars': 'Clouds', 
    'scattered clouds': 'Clouds',
    'nuages fragmentés': 'Clouds',
    'broken clouds': 'Clouds',
    'couvert': 'Clouds',
    'overcast clouds': 'Clouds',
    'légère pluie': 'Rain',
    'light rain': 'Rain',
    'pluie modérée': 'Rain',
    'moderate rain': 'Rain',
    'forte pluie': 'Rain',
    'heavy intensity rain': 'Rain',
    'neige': 'Snow',
    'snow': 'Snow',
    'orage': 'Thunderstorm',
    'thunderstorm': 'Thunderstorm'
  };
  
  effectCondition = conditionMapping[weatherData.description.toLowerCase()] || (isNight ? 'ClearNight' : 'ClearDay');
  
  // ✅ Utiliser le nouveau système d'effets
  const effects = WeatherEffectService.getWeatherEffectByCondition(effectCondition);
  const timeBonus = WeatherEffectService.calculateTimeBonus();
  
  console.log('🎯 Effets calculés:', effects);
  console.log('🌙 Est-ce la nuit?', isNight);
  console.log('🔧 Condition utilisée:', effectCondition);

  return c.json({
    success: true,
    location: weatherData.location,
    country: weatherData.country,
    temperature: weatherData.temperature,
    description: weatherData.description,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    icon: weatherData.icon,
    weather: { condition: effectCondition },
    effects,
    timeBonus
  });
});

export const simulateBattleHandler = asyncHandler(async (c: Context) => {
  const { attacker, defender, lat, lon } = await c.req.json();
  
  if (!attacker || !defender) {
    throw new ValidationError('Attaquant et défenseur requis');
  }
  
  // ✅ Récupérer les effets météo
  const mockWeatherCondition = 'Rain'; // À remplacer par votre API
  const effects = WeatherEffectService.getWeatherEffectByCondition(mockWeatherCondition);
  const timeBonus = WeatherEffectService.calculateTimeBonus();
  
  // ✅ Calculer les stats avec météo
  const finalAttacker = WeatherEffectService.calculatePokemonStats(attacker, effects, timeBonus);
  const finalDefender = WeatherEffectService.calculatePokemonStats(defender, effects, timeBonus);
  const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(attacker.type, defender.type);
  
  // ✅ Logique de combat simple
  const attackerScore = finalAttacker.effective_attack + finalAttacker.effective_speed;
  const defenderScore = finalDefender.effective_defense + finalDefender.effective_speed;
  const winner = attackerScore > defenderScore ? 'attacker' : 'defender';
  
  return c.json({
    success: true,
    battle: {
      winner,
      attackerStats: finalAttacker,
      defenderStats: finalDefender,
      typeEffectiveness,
      weatherEffects: effects
    }
  });
});