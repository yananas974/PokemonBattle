// ✅ EXPORTS TYPES
export * from './types/api.js';
export * from './types/battle.js';
export * from './types/common.js';
export * from './types/errors.js';
export * from './types/friendship.js';
export * from './types/pokemon.js';
export * from './types/team.js';
export * from './types/user.js';
export * from './types/weather.js';

// ✅ EXPORTS CONSTANTES
export * from './constants/errors.js';
export * from './constants/messages.js';

// ✅ EXPORTS CONSTANTES BATTLES (avec résolution de conflits)
export { 
  BATTLE_CONSTANTS,
  DEFAULT_MOVE,
  POKEMON_STATUS,
  BATTLE_PHASES as BATTLE_PHASE_CONSTANTS,
  BATTLE_TEAMS,
  ACTION_SOURCES
} from './constants/battles.js';

// ✅ EXPORTS UTILITAIRES
export * from './utils/battleHelpers.js';
export * from './utils/formatters.js';

// ✅ EXPORTS ENUMS (avec résolution de conflits)
export { 
  BattleStatus, 
  FriendshipStatus, 
  WeatherCondition, 
  PokemonType as PokemonTypeEnum,
  HackDifficulty,
  HackAlgorithm,
  BattleAction,
  BattlePhase,
  UserRole
} from './enums/index.js';

// ✅ EXPORTS VALIDATION CENTRALISÉE
export {
  // Validateurs par domaine
  authValidators,
  pokemonValidators,
  teamValidators,
  friendshipValidators,
  battleValidators,
  weatherValidators,
  hackValidators,
  
  // Service de validation centralisé
  ValidationService,
  
  // Schémas de base
  baseSchemas,
  
  // Legacy (rétrocompatibilité)
  commonSchemas,
  
  // Fonctions utilitaires de validation
  validateId,
  validateEmail,
  validatePassword,
  validateCoordinates,
  sanitizeString
} from './utils/validators.js';