import { WeatherCondition, WeatherConditionType } from '../enums';

// ✅ INTERFACE POUR LES EFFETS MÉTÉOROLOGIQUES
export interface WeatherEffect {
  condition: WeatherConditionType;
  bonusTypes: string[];
  malusTypes: string[];
  multiplier: number;
  description: string;
}

// ✅ INTERFACE POUR LES DONNÉES MÉTÉO BRUTES
export interface WeatherData {
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  icon: string;
  description: string;
  location: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
  timestamp: string;
}

// ✅ INTERFACE POUR LES EFFETS MÉTÉO AVEC BONUS
export interface WeatherEffectWithBonus extends WeatherEffect {
  timeBonus: number;
  isNight: boolean;
  seasonalMultiplier: number;
}

// ✅ REQUÊTE POUR LA MÉTÉO
export interface WeatherRequest {
  lat: number;
  lon: number;
  includeEffects?: boolean;
  includeForecast?: boolean;
}

// ✅ RÉPONSE MÉTÉO
export interface WeatherResponse {
  success: boolean;
  weather?: WeatherData;
  effects?: WeatherEffectWithBonus;
  forecast?: WeatherData[];
  message?: string;
  error?: string;
}

// ✅ CONFIGURATION DES EFFETS MÉTÉO
export interface WeatherEffectConfig {
  [key: string]: {
    bonusTypes: string[];
    malusTypes: string[];
    baseMultiplier: number;
    nightMultiplier: number;
    description: string;
  };
}

// ✅ DÉTECTION MÉTÉO
export interface WeatherDetection {
  weatherEffects: WeatherEffectWithBonus | null;
  timeBonus: number;
  detectionSource: 'api' | 'fallback' | 'cache';
  confidence: number;
}

// ✅ CACHE MÉTÉO
export interface WeatherCache {
  key: string;
  data: WeatherData;
  effects: WeatherEffectWithBonus;
  expiresAt: number;
  createdAt: number;
}

// ✅ TYPES POUR LES SERVICES MÉTÉO
export type WeatherService = 'openweather' | 'weatherapi' | 'fallback';
export type WeatherProvider = {
  name: WeatherService;
  apiKey?: string;
  baseUrl: string;
  isAvailable: boolean;
};

// ✅ PARAMÈTRES DE REQUÊTE MÉTÉO
export interface WeatherQueryParams {
  lat: number;
  lon: number;
  units?: 'metric' | 'imperial' | 'kelvin';
  lang?: string;
  appid?: string;
} 