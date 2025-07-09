import type { Context } from 'hono';
import type { ErrorContext } from '@pokemon-battle/shared';

export const extractErrorContext = (c: Context): ErrorContext => ({
  path: c.req.path,
  method: c.req.method,
  userId: c.get('userId'),
  ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
  userAgent: c.req.header('user-agent') || 'unknown',
  timestamp: new Date().toISOString()
});

export const mapDatabaseError = (error: any) => {
  const { DatabaseError, ConflictError, ValidationError } = require('../models/errors.js');
  
  switch (error.code) {
    case '23505': // Unique constraint violation
      return new ConflictError('Cette ressource existe déjà');
    case '23503': // Foreign key violation
      return new ValidationError('Référence invalide');
    case '23502': // Not null violation
      return new ValidationError('Champ requis manquant');
    case '42P01': // Table doesn't exist
      return new DatabaseError('Table introuvable');
    default:
      return new DatabaseError(`Erreur de base de données: ${error.message}`);
  }
}; 