import { rateLimiter } from 'hono-rate-limiter';

export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard'
}); 