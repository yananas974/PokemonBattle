// ✅ CODES D'ERREUR STANDARDISÉS
export const ERROR_CODES = {
  // Erreurs de validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Erreurs d'authentification
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Erreurs de ressources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Erreurs de serveur
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Erreurs métier
  TEAM_FULL: 'TEAM_FULL',
  BATTLE_NOT_ACTIVE: 'BATTLE_NOT_ACTIVE',
  NOT_YOUR_TURN: 'NOT_YOUR_TURN',
  FRIENDSHIP_EXISTS: 'FRIENDSHIP_EXISTS',
  HACK_CHALLENGE_EXPIRED: 'HACK_CHALLENGE_EXPIRED',
  
  // Erreurs de limite
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED'
} as const;

// ✅ MESSAGES D'ERREUR PAR DÉFAUT
export const DEFAULT_ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  VALIDATION_ERROR: 'Invalid input data',
  INVALID_INPUT: 'Invalid input provided',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  EXTERNAL_SERVICE_ERROR: 'External service unavailable',
  DATABASE_ERROR: 'Database error',
  TEAM_FULL: 'Team is full',
  BATTLE_NOT_ACTIVE: 'Battle is not active',
  NOT_YOUR_TURN: 'Not your turn',
  FRIENDSHIP_EXISTS: 'Friendship already exists',
  HACK_CHALLENGE_EXPIRED: 'Hack challenge has expired',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  QUOTA_EXCEEDED: 'Quota exceeded'
} as const;

// ✅ TYPES POUR LES CODES D'ERREUR
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type DefaultErrorMessage = typeof DEFAULT_ERROR_MESSAGES[keyof typeof DEFAULT_ERROR_MESSAGES]; 