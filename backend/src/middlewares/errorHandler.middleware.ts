import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { BaseError } from '../models/errors.js';
import { ErrorLogger } from '../services/errorService/errorLogger.js';
import { ErrorFormatter } from '../services/errorService/errorFormatter.js';
import { extractErrorContext, mapDatabaseError } from '../utils/errorUtils.js';

export const errorHandler: ErrorHandler = (err, c) => {
  const context = extractErrorContext(c);
  
  // Log toutes les erreurs
  ErrorLogger.log(err, context);

  // HTTPException de Hono
  if (err instanceof HTTPException) {
    const response = ErrorFormatter.format(err, context.path);
    return c.json(response, err.status);
  }

  // Nos erreurs personnalisées
  if (err instanceof BaseError) {
    const response = ErrorFormatter.format(err, context.path);
    return c.json(response, err.statusCode);
  }

  // Erreurs de base de données PostgreSQL
  if ('code' in err && typeof err.code === 'string' && err.code.startsWith('23')) {
    const mappedError = mapDatabaseError(err);
    const response = ErrorFormatter.format(mappedError, context.path);
    return c.json(response, mappedError.statusCode);
  }

  // Erreurs de validation (Zod, etc.)
  if (err.name === 'ZodError' || err.name === 'ValidationError') {
    const response = ErrorFormatter.format(err, context.path);
    return c.json(response, 400);
  }

  // Erreur générique
  const response = ErrorFormatter.format(
    new Error('Internal server error'), 
    context.path
  );
  return c.json(response, 500);
};

// ✅ Export des classes d'erreur pour compatibilité
export { BaseError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '../models/errors.js'; 