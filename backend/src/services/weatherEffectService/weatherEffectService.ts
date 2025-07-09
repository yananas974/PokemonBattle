import { WeatherEffect } from '@pokemon-battle/shared';

export const WEATHER_EFFECTS: WeatherEffect[] = [
  {
    condition: 'ClearDay',
    bonusTypes: ['Feu', 'Sol', 'Roche'],
    malusTypes: ['Eau', 'Glace'],
    multiplier: 1.2,
    description: 'Temps ensoleillé - Les types Feu, Sol et Roche sont renforcés'
  },
  {
    condition: 'Rain',
    bonusTypes: ['Eau', 'Électrik', 'Plante'],
    malusTypes: ['Feu', 'Sol', 'Roche'],
    multiplier: 1.2,
    description: 'Temps pluvieux - Les types Eau, Électrik et Plante sont renforcés'
  },
  {
    condition: 'Snow',
    bonusTypes: ['Glace', 'Acier'],
    malusTypes: ['Feu', 'Plante', 'Vol'],
    multiplier: 1.2,
    description: 'Temps neigeux - Les types Glace et Acier sont renforcés'
  },
  {
    condition: 'Thunderstorm',
    bonusTypes: ['Électrik', 'Ténèbres'],
    malusTypes: ['Vol', 'Eau'],
    multiplier: 1.3,
    description: 'Orage - Les types Électrik et Ténèbres sont très renforcés'
  },
  {
    condition: 'Clouds',
    bonusTypes: ['Vol', 'Dragon'],
    malusTypes: ['Sol', 'Roche'],
    multiplier: 1.1,
    description: 'Temps nuageux - Les types Vol et Dragon sont légèrement renforcés'
  },
  {
    condition: 'Fog',
    bonusTypes: ['Spectre', 'Psy'],
    malusTypes: ['Normal', 'Combat'],
    multiplier: 1.15,
    description: 'Brouillard - Les types Spectre et Psy sont renforcés'
  },
  {
    condition: 'Mist',
    bonusTypes: ['Vol', 'Insecte'],
    malusTypes: ['Feu', 'Poison'],
    multiplier: 1.1,
    description: 'Temps brumeux - Les types Vol et Insecte sont renforcés'
  }
];

// ✅ Tableau des faiblesses/résistances des types Pokémon
export const TYPE_EFFECTIVENESS: Record<PokemonType, {
  weakTo: PokemonType[];
  resistantTo: PokemonType[];
  immuneTo: PokemonType[];
  superEffectiveAgainst: PokemonType[];
  notVeryEffectiveAgainst: PokemonType[];
  noEffectAgainst: PokemonType[];
}> = {
  'Normal': {
    weakTo: ['Combat'],
    resistantTo: [],
    immuneTo: ['Spectre'],
    superEffectiveAgainst: [],
    notVeryEffectiveAgainst: ['Roche', 'Acier'],
    noEffectAgainst: ['Spectre']
  },
  'Feu': {
    weakTo: ['Eau', 'Sol', 'Roche'],
    resistantTo: ['Feu', 'Plante', 'Glace', 'Insecte', 'Acier', 'Fée'],
    immuneTo: [],
    superEffectiveAgainst: ['Plante', 'Glace', 'Insecte', 'Acier'],
    notVeryEffectiveAgainst: ['Feu', 'Eau', 'Roche', 'Dragon'],
    noEffectAgainst: []
  },
  'Eau': {
    weakTo: ['Plante', 'Électrik'],
    resistantTo: ['Feu', 'Eau', 'Glace', 'Acier'],
    immuneTo: [],
    superEffectiveAgainst: ['Feu', 'Sol', 'Roche'],
    notVeryEffectiveAgainst: ['Eau', 'Plante', 'Dragon'],
    noEffectAgainst: []
  },
  'Plante': {
    weakTo: ['Feu', 'Glace', 'Poison', 'Vol', 'Insecte'],
    resistantTo: ['Eau', 'Électrik', 'Plante', 'Sol'],
    immuneTo: [],
    superEffectiveAgainst: ['Eau', 'Sol', 'Roche'],
    notVeryEffectiveAgainst: ['Feu', 'Plante', 'Poison', 'Vol', 'Insecte', 'Dragon', 'Acier'],
    noEffectAgainst: []
  },
  'Électrik': {
    weakTo: ['Sol'],
    resistantTo: ['Électrik', 'Vol', 'Acier'],
    immuneTo: [],
    superEffectiveAgainst: ['Eau', 'Vol'],
    notVeryEffectiveAgainst: ['Électrik', 'Plante', 'Dragon'],
    noEffectAgainst: ['Sol']
  },
  'Glace': {
    weakTo: ['Feu', 'Combat', 'Roche', 'Acier'],
    resistantTo: ['Glace'],
    immuneTo: [],
    superEffectiveAgainst: ['Plante', 'Sol', 'Vol', 'Dragon'],
    notVeryEffectiveAgainst: ['Feu', 'Eau', 'Glace', 'Acier'],
    noEffectAgainst: []
  },
  'Combat': {
    weakTo: ['Vol', 'Psy', 'Fée'],
    resistantTo: ['Insecte', 'Roche', 'Ténèbres'],
    immuneTo: [],
    superEffectiveAgainst: ['Normal', 'Glace', 'Roche', 'Ténèbres', 'Acier'],
    notVeryEffectiveAgainst: ['Poison', 'Vol', 'Psy', 'Insecte', 'Fée'],
    noEffectAgainst: ['Spectre']
  },
  'Poison': {
    weakTo: ['Sol', 'Psy'],
    resistantTo: ['Plante', 'Combat', 'Poison', 'Insecte', 'Fée'],
    immuneTo: [],
    superEffectiveAgainst: ['Plante', 'Fée'],
    notVeryEffectiveAgainst: ['Poison', 'Sol', 'Roche', 'Spectre'],
    noEffectAgainst: ['Acier']
  },
  'Sol': {
    weakTo: ['Eau', 'Plante', 'Glace'],
    resistantTo: ['Poison', 'Roche'],
    immuneTo: ['Électrik'],
    superEffectiveAgainst: ['Feu', 'Électrik', 'Poison', 'Roche', 'Acier'],
    notVeryEffectiveAgainst: ['Plante', 'Insecte'],
    noEffectAgainst: ['Vol']
  },
  'Vol': {
    weakTo: ['Électrik', 'Glace', 'Roche'],
    resistantTo: ['Plante', 'Combat', 'Insecte'],
    immuneTo: ['Sol'],
    superEffectiveAgainst: ['Plante', 'Combat', 'Insecte'],
    notVeryEffectiveAgainst: ['Électrik', 'Roche', 'Acier'],
    noEffectAgainst: []
  },
  'Psy': {
    weakTo: ['Insecte', 'Spectre', 'Ténèbres'],
    resistantTo: ['Combat', 'Psy'],
    immuneTo: [],
    superEffectiveAgainst: ['Combat', 'Poison'],
    notVeryEffectiveAgainst: ['Psy', 'Acier'],
    noEffectAgainst: ['Ténèbres']
  },
  'Insecte': {
    weakTo: ['Feu', 'Vol', 'Roche'],
    resistantTo: ['Plante', 'Combat', 'Sol'],
    immuneTo: [],
    superEffectiveAgainst: ['Plante', 'Psy', 'Ténèbres'],
    notVeryEffectiveAgainst: ['Feu', 'Combat', 'Poison', 'Vol', 'Spectre', 'Acier', 'Fée'],
    noEffectAgainst: []
  },
  'Roche': {
    weakTo: ['Eau', 'Plante', 'Combat', 'Sol', 'Acier'],
    resistantTo: ['Normal', 'Feu', 'Poison', 'Vol'],
    immuneTo: [],
    superEffectiveAgainst: ['Feu', 'Glace', 'Vol', 'Insecte'],
    notVeryEffectiveAgainst: ['Combat', 'Sol', 'Acier'],
    noEffectAgainst: []
  },
  'Spectre': {
    weakTo: ['Spectre', 'Ténèbres'],
    resistantTo: ['Poison', 'Insecte'],
    immuneTo: ['Normal', 'Combat'],
    superEffectiveAgainst: ['Psy', 'Spectre'],
    notVeryEffectiveAgainst: ['Ténèbres'],
    noEffectAgainst: ['Normal']
  },
  'Dragon': {
    weakTo: ['Glace', 'Dragon', 'Fée'],
    resistantTo: ['Feu', 'Eau', 'Électrik', 'Plante'],
    immuneTo: [],
    superEffectiveAgainst: ['Dragon'],
    notVeryEffectiveAgainst: ['Acier'],
    noEffectAgainst: ['Fée']
  },
  'Ténèbres': {
    weakTo: ['Combat', 'Insecte', 'Fée'],
    resistantTo: ['Spectre', 'Ténèbres'],
    immuneTo: ['Psy'],
    superEffectiveAgainst: ['Psy', 'Spectre'],
    notVeryEffectiveAgainst: ['Combat', 'Ténèbres', 'Fée'],
    noEffectAgainst: []
  },
  'Acier': {
    weakTo: ['Feu', 'Combat', 'Sol'],
    resistantTo: ['Normal', 'Plante', 'Glace', 'Vol', 'Psy', 'Insecte', 'Roche', 'Dragon', 'Acier', 'Fée'],
    immuneTo: ['Poison'],
    superEffectiveAgainst: ['Glace', 'Roche', 'Fée'],
    notVeryEffectiveAgainst: ['Feu', 'Eau', 'Électrik', 'Acier'],
    noEffectAgainst: []
  },
  'Fée': {
    weakTo: ['Poison', 'Acier'],
    resistantTo: ['Combat', 'Insecte', 'Ténèbres'],
    immuneTo: ['Dragon'],
    superEffectiveAgainst: ['Combat', 'Dragon', 'Ténèbres'],
    notVeryEffectiveAgainst: ['Feu', 'Poison', 'Acier'],
    noEffectAgainst: []
  }
};

// ✅ Exporter le type
export type PokemonType = 'Normal' | 'Feu' | 'Eau' | 'Plante' | 'Électrik' | 'Glace' | 'Combat' | 'Poison' | 'Sol' | 'Vol' | 'Psy' | 'Insecte' | 'Roche' | 'Spectre' | 'Dragon' | 'Ténèbres' | 'Acier' | 'Fée';

// ✅ Définir les affinités de chaque type Pokémon
export const POKEMON_AFFINITIES: Record<PokemonType, {
  solar: number;      // Affinité solaire (-1 à 1)
  aquatic: number;    // Affinité aquatique
  nocturnal: number;  // Affinité nocturne
  aerial: number;     // Affinité aérienne
  terrestrial: number;// Affinité terrestre
  mystical: number;   // Affinité mystique
  elemental: number;  // Affinité élémentaire
}> = {
  'Feu': { solar: 1, aquatic: -0.8, nocturnal: -0.3, aerial: 0, terrestrial: 0.2, mystical: 0, elemental: 0.8 },
  'Eau': { solar: -0.2, aquatic: 1, nocturnal: 0.1, aerial: 0, terrestrial: 0, mystical: 0, elemental: 0.6 },
  'Plante': { solar: 0.8, aquatic: 0.3, nocturnal: -0.4, aerial: 0, terrestrial: 0.5, mystical: 0.2, elemental: 0.4 },
  'Électrik': { solar: 0.2, aquatic: 0.5, nocturnal: 0, aerial: 0.3, terrestrial: -0.2, mystical: 0.3, elemental: 1 },
  'Glace': { solar: -0.8, aquatic: 0.2, nocturnal: 0.2, aerial: 0.1, terrestrial: 0, mystical: 0, elemental: 0.5 },
  'Combat': { solar: 0.3, aquatic: 0, nocturnal: -0.4, aerial: 0, terrestrial: 0.2, mystical: -0.3, elemental: 0 },
  'Poison': { solar: -0.2, aquatic: 0.2, nocturnal: 0.6, aerial: 0, terrestrial: 0.3, mystical: 0.4, elemental: 0.3 },
  'Sol': { solar: 0.6, aquatic: -0.5, nocturnal: 0, aerial: -0.3, terrestrial: 1, mystical: 0, elemental: 0.4 },
  'Vol': { solar: 0.4, aquatic: 0, nocturnal: -0.2, aerial: 1, terrestrial: -0.5, mystical: 0.2, elemental: 0.3 },
  'Psy': { solar: 0.1, aquatic: 0, nocturnal: 0.7, aerial: 0.2, terrestrial: 0, mystical: 1, elemental: 0.2 },
  'Insecte': { solar: 0.6, aquatic: -0.3, nocturnal: 0.3, aerial: 0.4, terrestrial: 0.2, mystical: 0, elemental: 0.2 },
  'Roche': { solar: 0.4, aquatic: -0.4, nocturnal: 0, aerial: -0.2, terrestrial: 0.8, mystical: 0, elemental: 0.3 },
  'Spectre': { solar: -0.6, aquatic: 0, nocturnal: 1, aerial: 0.3, terrestrial: 0, mystical: 0.9, elemental: 0 },
  'Dragon': { solar: 0.3, aquatic: 0.2, nocturnal: 0.4, aerial: 0.6, terrestrial: 0.1, mystical: 0.7, elemental: 0.8 },
  'Ténèbres': { solar: -0.7, aquatic: 0, nocturnal: 0.9, aerial: 0.1, terrestrial: 0.2, mystical: 0.6, elemental: 0.1 },
  'Acier': { solar: -0.1, aquatic: -0.3, nocturnal: 0, aerial: 0, terrestrial: 0.4, mystical: -0.2, elemental: 0.5 },
  'Fée': { solar: 0.4, aquatic: 0.1, nocturnal: 0.5, aerial: 0.3, terrestrial: 0.2, mystical: 0.8, elemental: 0.4 },
  'Normal': { solar: 0.2, aquatic: 0, nocturnal: -0.2, aerial: 0, terrestrial: 0.1, mystical: 0, elemental: 0 }
};

// ✅ Définir les conditions météo avec leurs effets sur les affinités
export const WEATHER_CONDITIONS: Record<string, {
  effects: Record<keyof typeof POKEMON_AFFINITIES[PokemonType], number>;
  baseMultiplier: number;
  description: string;
}> = {
  'ClearDay': {
    effects: { 
      solar: 0.4,      // +40% si affinité solaire forte
      aquatic: -0.2,   // -20% si affinité aquatique
      nocturnal: -0.3, // -30% si affinité nocturne
      aerial: 0.2,     // +20% courants thermiques
      terrestrial: 0.1,
      mystical: 0,
      elemental: 0.1
    },
    baseMultiplier: 1.0,
    description: 'Temps ensoleillé - Favorise les affinités solaires'
  },
  
  'ClearNight': {
    effects: {
      solar: -0.3,
      aquatic: 0.1,
      nocturnal: 0.5,  // +50% si affinité nocturne
      aerial: -0.1,
      terrestrial: 0,
      mystical: 0.3,   // +30% mystique
      elemental: 0
    },
    baseMultiplier: 1.0,
    description: 'Nuit étoilée - Favorise les types mystiques et nocturnes'
  },
  
  'Rain': {
    effects: {
      solar: -0.4,
      aquatic: 0.6,    // +60% si affinité aquatique
      nocturnal: 0.1,
      aerial: -0.3,    // Vols difficiles
      terrestrial: -0.2, // Boue
      mystical: 0,
      elemental: 0.2   // Conductivité électrique
    },
    baseMultiplier: 1.0,
    description: 'Temps pluvieux - Favorise les types aquatiques'
  },

  'Snow': {
    effects: {
      solar: -0.5,
      aquatic: -0.1,
      nocturnal: 0.2,
      aerial: -0.4,
      terrestrial: -0.3,
      mystical: 0.1,
      elemental: -0.2
    },
    baseMultiplier: 1.0,
    description: 'Temps neigeux - Conditions difficiles pour la plupart'
  },

  'Thunderstorm': {
    effects: {
      solar: -0.3,
      aquatic: 0.3,
      nocturnal: 0.2,
      aerial: -0.6,    // Très dangereux de voler
      terrestrial: 0,
      mystical: 0.2,
      elemental: 0.8   // Électricité très forte
    },
    baseMultiplier: 1.0,
    description: 'Orage - Très favorable aux types électriques'
  }
};

// ✅ Fonction pour calculer dynamiquement l'effet sur un type
export function calculateWeatherMultiplier(pokemonType: PokemonType, weatherCondition: string): number {
  const affinities = POKEMON_AFFINITIES[pokemonType];
  const weather = WEATHER_CONDITIONS[weatherCondition];
  
  if (!affinities || !weather) return 1.0;
  
  let totalEffect = weather.baseMultiplier;
  
  // ✅ Calculer l'effet basé sur chaque affinité
  Object.entries(weather.effects).forEach(([affinity, weatherEffect]) => {
    const pokemonAffinity = affinities[affinity as keyof typeof affinities];
    totalEffect += pokemonAffinity * weatherEffect;
  });
  
  // ✅ Limiter entre 0.5 et 1.5 pour éviter les extrêmes
  return Math.max(0.5, Math.min(1.5, totalEffect));
}

// ✅ Interface mise à jour (remplace l'ancienne)
export interface WeatherEffectNew {
  condition: string;
  description: string;
  getMultiplierFor: (pokemonType: PokemonType) => number;
}

// ✅ Générateur d'effets météo
export function createWeatherEffect(condition: string): WeatherEffectNew | null {
  const weatherData = WEATHER_CONDITIONS[condition];
  if (!weatherData) return null;
  
  return {
    condition,
    description: weatherData.description,
    getMultiplierFor: (pokemonType: PokemonType) => calculateWeatherMultiplier(pokemonType, condition)
  };
}

export class WeatherEffectService {
  
  // ✅ GARDER - Logique pure
  static calculateTypeEffectiveness(attackerType: PokemonType, defenderType: PokemonType): number {
    const typeData = TYPE_EFFECTIVENESS[attackerType];
    if (!typeData) return 1.0;
    
    if (typeData.noEffectAgainst.includes(defenderType)) return 0;
    if (typeData.superEffectiveAgainst.includes(defenderType)) return 2.0;
    if (typeData.notVeryEffectiveAgainst.includes(defenderType)) return 0.5;
    
    return 1.0;
  }

  // ✅ GARDER - Calcul des stats avec effets météo
  static calculatePokemonStats(pokemon: any, weatherEffect: WeatherEffectNew | null, timeBonus: number): any {
    let finalStats = { ...pokemon };
    let weatherMultiplier = 1.0;
    
    if (weatherEffect && pokemon.type) {
      weatherMultiplier = weatherEffect.getMultiplierFor(pokemon.type);
      
      if (weatherMultiplier > 1.05) {
        finalStats.weatherStatus = `Renforcé (+${Math.round((weatherMultiplier - 1) * 100)}%)`;
      } else if (weatherMultiplier < 0.95) {
        finalStats.weatherStatus = `Affaibli (-${Math.round((1 - weatherMultiplier) * 100)}%)`;
      } else {
        finalStats.weatherStatus = 'Peu affecté';
      }
    }
    
    const finalMultiplier = weatherMultiplier * timeBonus;
    
    finalStats.effective_hp = Math.round((pokemon.base_hp || 100) * finalMultiplier);
    finalStats.effective_attack = Math.round((pokemon.base_attack || 50) * finalMultiplier);
    finalStats.effective_defense = Math.round((pokemon.base_defense || 50) * finalMultiplier);
    finalStats.effective_speed = Math.round((pokemon.base_speed || 50) * finalMultiplier);
    finalStats.totalMultiplier = finalMultiplier;
    
    return finalStats;
  }

  // ✅ AJOUTER - Trouver l'effet météo par condition
  static getWeatherEffectByCondition(condition: string): WeatherEffectNew | null {
    return createWeatherEffect(condition);
  }

  // ✅ AJOUTER - Calculer le bonus temporel
  static calculateTimeBonus(): number {
    const currentHour = new Date().getHours();
    return (currentHour >= 6 && currentHour <= 18) ? 1.1 : 0.95;
  }
}

