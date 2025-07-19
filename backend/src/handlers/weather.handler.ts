import type { Context } from "hono";    
import { WeatherEffectService, WEATHER_EFFECTS } from "../services/weatherEffectService/weatherEffectService.js";
import { PokemonTypeService } from "../services/pokemonTypeService/pokemonTypeService.js";
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, ExternalServiceError } from '../models/errors.js';
import { 
  weatherQuerySchema,
  simulateBattleWithWeatherSchema
} from '../schemas/index.js';
import { zValidator } from '@hono/zod-validator';
import { formatResponse, WEATHER_MESSAGES, validateCoordinates } from '@pokemon-battle/shared';

// ✅ TYPES
interface WeatherHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

// ✅ HELPERS
const determineWeatherCondition = (description: string, isNight: boolean): string => {
  const conditionMapping: Record<string, string> = {
    'ciel dégagé': isNight ? 'ClearNight' : 'ClearDay',
    'clear sky': isNight ? 'ClearNight' : 'ClearDay',
    'quelques nuages': 'Clouds',
    'few clouds': 'Clouds',
    'nuageux': 'Clouds',
    'cloudy': 'Clouds',
    'nuages épars': 'Clouds', 
    'scattered clouds': 'Clouds',
    'nuages fragmentés': 'Clouds',
    'broken clouds': 'Clouds',
    'couvert': 'Clouds',
    'overcast clouds': 'Clouds',
    'légère pluie': 'Rain',
    'light rain': 'Rain',
    'bruine légère': 'Rain',
    'light drizzle': 'Rain',
    'bruine': 'Rain',
    'drizzle': 'Rain',
    'pluie modérée': 'Rain',
    'moderate rain': 'Rain',
    'forte pluie': 'Rain',
    'heavy intensity rain': 'Rain',
    'neige': 'Snow',
    'snow': 'Snow',
    'orage': 'Thunderstorm',
    'thunderstorm': 'Thunderstorm'
  };
  
  return conditionMapping[description.toLowerCase()] || (isNight ? 'ClearNight' : 'ClearDay');
};

const fetchWeatherData = async (lat: number, lon: number) => {
  console.log(`🌍 Récupération météo pour coordonnées: ${lat}, ${lon}`);
  
  const { WeatherService } = await import('../services/weatherService/weatherService.js');
  const weatherService = new WeatherService();
  const weatherData = await weatherService.getWeatherByCoordinates(lat, lon);
  
  console.log('✅ Données météo OpenWeatherMap reçues:', weatherData);
  return weatherData;
};

const calculateBattleStats = (attacker: any, defender: any, effects: any, timeBonus: any) => {
  const finalAttacker = WeatherEffectService.calculatePokemonStats(attacker, effects, timeBonus);
  const finalDefender = WeatherEffectService.calculatePokemonStats(defender, effects, timeBonus);
  
  const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(
    attacker.type as any,
    defender.type as any
  );
  
  const attackerScore = finalAttacker.effective_attack + finalAttacker.effective_speed;
  const defenderScore = finalDefender.effective_defense + finalDefender.effective_speed;
  const winner = attackerScore > defenderScore ? 'attacker' : 'defender';
  
  return {
    winner,
    attackerStats: finalAttacker,
    defenderStats: finalDefender,
    typeEffectiveness
  };
};

const validatePokemonTypes = async (attackerType: string, defenderType: string) => {
  console.log('🔍 Validation des types Pokemon...');
  const typeValidation = await PokemonTypeService.areValidTypes([attackerType, defenderType]);
  
  if (!typeValidation.valid) {
    const validTypes = await PokemonTypeService.getUniqueTypes();
    throw new ValidationError(
      `Types Pokemon invalides: ${typeValidation.invalidTypes.join(', ')}. ` +
      `Types valides: ${validTypes.join(', ')}`
    );
  }
  
  console.log('✅ Types Pokemon validés:', attackerType, 'vs', defenderType);
};

const formatWeatherResponse = (message: string, data?: any) => {
  return formatResponse(message, data);
};

// ✅ VALIDATORS GROUPÉS
export const weatherValidators = {
  simulateBattle: zValidator('json', simulateBattleWithWeatherSchema)
};

// ✅ HANDLERS GROUPÉS
export const weatherHandlers: WeatherHandler = {
  getWeatherEffects: asyncHandler(async (c: Context) => {
    // Parse and validate query parameters
    const { lat, lon } = weatherQuerySchema.parse({
      lat: c.req.query('lat'),
      lon: c.req.query('lon')
    });
    
    // Validation des coordonnées
    if (!validateCoordinates(lat, lon)) {
      throw new ValidationError('Coordonnées invalides');
    }
    
    const weatherData = await fetchWeatherData(lat, lon);
    
    // Déterminer si c'est jour ou nuit basé sur l'icône
    const isNight = weatherData.icon.endsWith('n');
    const effectCondition = determineWeatherCondition(weatherData.description, isNight);
    
    // Utiliser le nouveau système d'effets
    const effects = WeatherEffectService.getWeatherEffectByCondition(effectCondition);
    const timeBonus = WeatherEffectService.calculateTimeBonus();
    
    console.log('🎯 Effets calculés:', effects);
    console.log('🌙 Est-ce la nuit?', isNight);
    console.log('🔧 Condition utilisée:', effectCondition);

    return c.json(formatWeatherResponse(WEATHER_MESSAGES.RETRIEVED, {
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
    }));
  }),

  simulateBattle: asyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { attacker, defender, lat, lon } = simulateBattleWithWeatherSchema.parse(body);
    
    // Validation des types Pokemon
    await validatePokemonTypes(attacker.type, defender.type);
    
    // Récupérer les effets météo
    const mockWeatherCondition = 'Rain'; // À remplacer par votre API
    const effects = WeatherEffectService.getWeatherEffectByCondition(mockWeatherCondition);
    const timeBonus = WeatherEffectService.calculateTimeBonus();
    
    // Calculer les stats de combat
    const battleResult = calculateBattleStats(attacker, defender, effects, timeBonus);
    
    return c.json(formatWeatherResponse('Battle simulation completed', {
      battle: {
        ...battleResult,
        weatherEffects: effects
      }
    }));
  }),

  getAvailableEffects: asyncHandler(async (c: Context) => {
    const availableEffects = Object.keys(WEATHER_EFFECTS);
    
    return c.json(formatWeatherResponse('Available weather effects retrieved', {
      effects: availableEffects,
      totalCount: availableEffects.length,
      conditions: WEATHER_EFFECTS
    }));
  }),

  getCurrentTimeBonus: asyncHandler(async (c: Context) => {
    const timeBonus = WeatherEffectService.calculateTimeBonus();
    
    return c.json(formatWeatherResponse('Current time bonus calculated', {
      timeBonus,
      timestamp: new Date().toISOString()
    }));
  })
};