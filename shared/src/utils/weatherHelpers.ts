import { WeatherCondition } from '../enums/index.js';

// ✅ MAPPING DES CONDITIONS MÉTÉO VERS LES ICÔNES
export const WEATHER_ICONS = {
  [WeatherCondition.CLEAR_DAY]: '☀️',
  [WeatherCondition.CLEAR_NIGHT]: '🌙',
  [WeatherCondition.RAIN]: '🌧️',
  [WeatherCondition.SNOW]: '❄️',
  [WeatherCondition.CLOUDS]: '☁️',
  [WeatherCondition.THUNDERSTORM]: '⛈️',
  [WeatherCondition.DRIZZLE]: '🌦️',
  [WeatherCondition.MIST]: '🌫️',
  [WeatherCondition.FOG]: '🌫️'
} as const;

// ✅ MAPPING DES CONDITIONS MÉTÉO VERS LES GRADIENTS TAILWIND
export const WEATHER_GRADIENTS = {
  [WeatherCondition.CLEAR_DAY]: 'from-yellow-400 via-orange-500 to-red-500',
  [WeatherCondition.CLEAR_NIGHT]: 'from-indigo-800 via-purple-800 to-blue-900',
  [WeatherCondition.RAIN]: 'from-blue-600 via-blue-700 to-blue-800',
  [WeatherCondition.SNOW]: 'from-blue-200 via-blue-300 to-blue-400',
  [WeatherCondition.CLOUDS]: 'from-gray-400 via-gray-500 to-gray-600',
  [WeatherCondition.THUNDERSTORM]: 'from-gray-700 via-purple-800 to-gray-900',
  [WeatherCondition.DRIZZLE]: 'from-blue-500 via-blue-600 to-blue-700',
  [WeatherCondition.MIST]: 'from-gray-300 via-gray-400 to-gray-500',
  [WeatherCondition.FOG]: 'from-gray-300 via-gray-400 to-gray-500'
} as const;

// ✅ FONCTION POUR OBTENIR L'ICÔNE MÉTÉO
export const getWeatherIcon = (description: string, temperature?: number): string => {
  const desc = description.toLowerCase();
  
  // Mapping direct avec les enums (français et anglais)
  if (desc.includes('clear') || desc.includes('ensoleillé') || desc.includes('ciel dégagé') || desc.includes('dégagé')) {
    if (temperature !== undefined) {
      return temperature > 25 ? WEATHER_ICONS[WeatherCondition.CLEAR_DAY] : '🌤️';
    }
    return WEATHER_ICONS[WeatherCondition.CLEAR_DAY];
  }
  
  if (desc.includes('rain') || desc.includes('pluie')) {
    return WEATHER_ICONS[WeatherCondition.RAIN];
  }
  
  if (desc.includes('snow') || desc.includes('neige')) {
    return WEATHER_ICONS[WeatherCondition.SNOW];
  }
  
  if (desc.includes('storm') || desc.includes('orage')) {
    return WEATHER_ICONS[WeatherCondition.THUNDERSTORM];
  }
  
  if (desc.includes('cloud') || desc.includes('nuageux')) {
    return WEATHER_ICONS[WeatherCondition.CLOUDS];
  }
  
  if (desc.includes('drizzle')) {
    return WEATHER_ICONS[WeatherCondition.DRIZZLE];
  }
  
  if (desc.includes('mist') || desc.includes('fog')) {
    return WEATHER_ICONS[WeatherCondition.MIST];
  }
  
  // Détection par enum direct
  for (const [condition, icon] of Object.entries(WEATHER_ICONS)) {
    if (desc.includes(condition.toLowerCase())) {
      return icon;
    }
  }
  
  return '🌤️'; // Icône par défaut
};

// ✅ FONCTION POUR OBTENIR LE GRADIENT MÉTÉO
export const getWeatherGradient = (description: string, temperature?: number): string => {
  const desc = description.toLowerCase();
  
  // Mapping direct avec les enums (français et anglais)
  if (desc.includes('clear') || desc.includes('ensoleillé') || desc.includes('ciel dégagé') || desc.includes('dégagé')) {
    if (temperature !== undefined && temperature > 25) {
      return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.CLEAR_DAY]}`;
    }
    return 'bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-600';
  }
  
  if (desc.includes('rain') || desc.includes('pluie')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.RAIN]}`;
  }
  
  if (desc.includes('snow') || desc.includes('neige')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.SNOW]}`;
  }
  
  if (desc.includes('storm') || desc.includes('orage')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.THUNDERSTORM]}`;
  }
  
  if (desc.includes('cloud') || desc.includes('nuageux') || desc.includes('nuage')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.CLOUDS]}`;
  }
  
  if (desc.includes('drizzle')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.DRIZZLE]}`;
  }
  
  if (desc.includes('mist') || desc.includes('fog')) {
    return `bg-gradient-to-r ${WEATHER_GRADIENTS[WeatherCondition.MIST]}`;
  }
  
  // Détection par enum direct
  for (const [condition, gradient] of Object.entries(WEATHER_GRADIENTS)) {
    if (desc.includes(condition.toLowerCase())) {
      return `bg-gradient-to-r ${gradient}`;
    }
  }
  
  return 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'; // Gradient par défaut
};

// ✅ FONCTION POUR DÉTECTER LA CONDITION MÉTÉO
export const detectWeatherCondition = (description: string): WeatherCondition => {
  const desc = description.toLowerCase();
  
  if (desc.includes('clear') || desc.includes('ensoleillé')) {
    return WeatherCondition.CLEAR_DAY;
  }
  if (desc.includes('rain') || desc.includes('pluie')) {
    return WeatherCondition.RAIN;
  }
  if (desc.includes('snow') || desc.includes('neige')) {
    return WeatherCondition.SNOW;
  }
  if (desc.includes('storm') || desc.includes('orage')) {
    return WeatherCondition.THUNDERSTORM;
  }
  if (desc.includes('cloud') || desc.includes('nuageux')) {
    return WeatherCondition.CLOUDS;
  }
  if (desc.includes('drizzle')) {
    return WeatherCondition.DRIZZLE;
  }
  if (desc.includes('mist')) {
    return WeatherCondition.MIST;
  }
  if (desc.includes('fog')) {
    return WeatherCondition.FOG;
  }
  
  return WeatherCondition.CLEAR_DAY; // Condition par défaut
};

// ✅ FONCTION POUR FORMATER LA TEMPÉRATURE
export const formatTemperature = (temperature: number, unit: 'C' | 'F' = 'C'): string => {
  const rounded = Math.round(temperature);
  return `${rounded}°${unit}`;
};

// ✅ FONCTION POUR FORMATER LA VITESSE DU VENT
export const formatWindSpeed = (speed: number, unit: 'kmh' | 'mph' = 'kmh'): string => {
  const rounded = Math.round(speed);
  const unitLabel = unit === 'kmh' ? 'km/h' : 'mph';
  return `${rounded} ${unitLabel}`;
};

// ✅ FONCTION POUR FORMATER L'HUMIDITÉ
export const formatHumidity = (humidity: number): string => {
  return `${Math.round(humidity)}%`;
};

// ✅ TYPES POUR LES HELPERS
export type WeatherIconType = typeof WEATHER_ICONS[keyof typeof WEATHER_ICONS];
export type WeatherGradientType = typeof WEATHER_GRADIENTS[keyof typeof WEATHER_GRADIENTS]; 