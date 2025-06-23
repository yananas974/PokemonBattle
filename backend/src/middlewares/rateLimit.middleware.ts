import { rateLimiter } from 'hono-rate-limiter';

export const apiRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard',
  keyGenerator: (c) => {
    // Générer une clé unique basée sur l'IP
    return c.req.header('x-forwarded-for') || 
           c.req.header('x-real-ip') || 
           c.req.header('cf-connecting-ip') || 
           'unknown';
  },
  // Optionnel : personnaliser la réponse
  handler: (c) => {
    return c.json({
      error: 'Trop de requêtes',
      message: 'Réessayez plus tard',
      retryAfter: Math.ceil(15 * 60) // 15 minutes en secondes
    }, 429);
  }
});