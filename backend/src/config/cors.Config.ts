import { cors } from "hono/cors";
import { CORS_ORIGIN, isDevelopment } from './env.Config';

// ✅ CONFIGURATION CORS SÉCURISÉE
const getAllowedOrigins = () => {
  if (isDevelopment) {
    return [
      'http://localhost:3000',
      'http://frontend:3000',
      'http://127.0.0.1:3000',
      CORS_ORIGIN
    ];
  }
  
  // En production, utiliser uniquement l'origine configurée
  return [CORS_ORIGIN];
};

export const corsMiddleware = cors({
  origin: getAllowedOrigins(),
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Auth-Token',
    'X-Requested-With'
  ],
  credentials: true,
  exposeHeaders: ['Authorization', 'X-Auth-Token'],
  maxAge: 86400, // 24 heures
});

// ✅ CONFIGURATION DES COOKIES SÉCURISÉE
export const cookieOptions = {
  httpOnly: true,
  secure: !isDevelopment, // HTTPS en production
  sameSite: isDevelopment ? 'lax' as const : 'strict' as const,
  maxAge: 3456, // 4 jours
  path: '/',
  ...(isDevelopment ? {} : { domain: new URL(CORS_ORIGIN).hostname })
};

// ✅ CONFIGURATION SÉCURITÉ SUPPLÉMENTAIRE
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  ...(isDevelopment ? {} : {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  })
}; 