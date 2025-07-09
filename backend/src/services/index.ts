/**
 * 🎯 Services Index - Point d'entrée central pour tous les services
 * 
 * Cette organisation permet :
 * - Import unifié : import { UserService, TeamService } from '@/services'
 * - TypeScript auto-completion optimisée
 * - Maintenance simplifiée
 */

// ✅ BARREL EXPORT PRINCIPAL
export * from './services.js';

// ✅ CONSTANTS PARTAGÉS
export const SERVICE_CONSTANTS = {
  CACHE_DURATION: 60 * 60 * 1000,         // 1 heure
  MAX_POKEMON_PER_TEAM: 6,               // Limite équipe
  DEFAULT_BATTLE_TIMEOUT: 300,            // 5 minutes
  HACK_CHALLENGE_TIME_LIMITS: {           // Temps par difficulté
    'facile': 30,
    'moyenne': 45, 
    'difficile': 60,
    'très difficile': 90
  }
} as const; 