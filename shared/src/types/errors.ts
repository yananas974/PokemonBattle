import { ErrorCode } from '../constants/errors';

// ✅ INTERFACE DE BASE POUR LES ERREURS
export interface BaseError {
  code: ErrorCode;
  message: string;
  timestamp: string;
  path?: string;
}

// ✅ ERREUR DE VALIDATION
export interface ValidationError extends BaseError {
  code: 'VALIDATION_ERROR';
  fields: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

// ✅ ERREUR DE RESSOURCE NON TROUVÉE
export interface NotFoundError extends BaseError {
  code: 'NOT_FOUND';
  resource: string;
  id?: string | number;
  query?: Record<string, any>;
}

// ✅ ERREUR D'AUTHENTIFICATION
export interface AuthenticationError extends BaseError {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'INVALID_CREDENTIALS';
  reason?: string;
  retryAfter?: number;
}

// ✅ ERREUR DE CONFLIT
export interface ConflictError extends BaseError {
  code: 'ALREADY_EXISTS' | 'CONFLICT';
  resource: string;
  conflictingField?: string;
  existingValue?: any;
}

// ✅ ERREUR DE SERVEUR
export interface ServerError extends BaseError {
  code: 'INTERNAL_SERVER_ERROR' | 'EXTERNAL_SERVICE_ERROR' | 'DATABASE_ERROR';
  service?: string;
  originalError?: string;
}

// ✅ ERREUR MÉTIER
export interface BusinessError extends BaseError {
  code: 'TEAM_FULL' | 'BATTLE_NOT_ACTIVE' | 'NOT_YOUR_TURN' | 'FRIENDSHIP_EXISTS' | 'HACK_CHALLENGE_EXPIRED';
  context?: Record<string, any>;
}

// ✅ ERREUR DE LIMITE
export interface RateLimitError extends BaseError {
  code: 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED';
  limit: number;
  current: number;
  resetTime?: number;
  retryAfter?: number;
}

// ✅ UNION DE TOUS LES TYPES D'ERREUR
export type ApplicationError = 
  | ValidationError
  | NotFoundError
  | AuthenticationError
  | ConflictError
  | ServerError
  | BusinessError
  | RateLimitError;

// ✅ CONTEXTE D'ERREUR POUR LE LOGGING
export interface ErrorContext {
  path: string;
  method: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  timestamp: string;
}

// ✅ ERREUR AVEC CONTEXTE COMPLET
export interface ErrorWithContext {
  error: ApplicationError;
  context: ErrorContext;
  stack?: string;
}

// ✅ TYPES POUR LES HANDLERS D'ERREUR
export type ErrorHandler = (error: ApplicationError, context: ErrorContext) => void;
export type ErrorLogger = (error: ErrorWithContext) => void;
export type ErrorFormatter = (error: ApplicationError) => Record<string, any>; 