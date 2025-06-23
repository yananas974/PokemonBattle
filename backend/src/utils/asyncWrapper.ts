import type { Context, Next } from 'hono';
import { UnauthorizedError } from '../models/errors.js';

// ✅ Wrapper de base - plus de try/catch !
export const asyncHandler = (fn: (c: Context, next?: Next) => Promise<any>) => {
  return async (c: Context, next?: Next) => {
    return await fn(c, next); // Le middleware global gère les erreurs
  };
};

// ✅ Wrapper avec authentification
export const authAsyncHandler = (fn: (c: Context) => Promise<any>) => {
  return asyncHandler(async (c: Context) => {
    const user = c.get('user');
    if (!user?.id) {
      throw new UnauthorizedError('Authentication required');
    }
    return await fn(c);
  });
};

// ✅ Wrapper pour services (sans Context)
export const serviceWrapper = async <T>(fn: () => Promise<T>): Promise<T> => {
  return await fn(); // Les erreurs remontent naturellement
};

// ✅ Wrapper pour opérations de base de données
export const dbWrapper = async <T>(fn: () => Promise<T>): Promise<T> => {
  return await fn(); // Les erreurs DB seront mappées par le middleware
}; 