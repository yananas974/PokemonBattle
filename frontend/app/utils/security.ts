// ✅ UTILITAIRES DE SÉCURITÉ

// Content Security Policy headers pour protection XSS
export const getCSPHeader = (nonce?: string): string => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://api.openweathermap.org ws: wss:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  if (nonce) {
    // Ajouter le nonce pour les scripts inline sécurisés
    policies[1] = policies[1].replace("'unsafe-inline'", `'nonce-${nonce}'`);
  }

  return policies.join('; ');
};

// Autres headers de sécurité
export const getSecurityHeaders = (nonce?: string): Record<string, string> => {
  return {
    // Content Security Policy
    'Content-Security-Policy': getCSPHeader(nonce),
    
    // Strict Transport Security (HTTPS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Prévention du clickjacking
    'X-Frame-Options': 'DENY',
    
    // Protection XSS intégrée du navigateur
    'X-Content-Type-Options': 'nosniff',
    
    // Contrôle du referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (remplace Feature-Policy)
    'Permissions-Policy': [
      'geolocation=(self)',
      'camera=()',
      'microphone=()',
      'payment=()',
      'usb=()',
      'screen-wake-lock=()'
    ].join(', '),
    
    // Cross-Origin policies
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  };
};

// Génération d'un nonce sécurisé
export const generateNonce = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  
  // Fallback pour les environnements sans crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Validation des URLs pour éviter les redirections malveillantes
export const isValidRedirectUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    
    // Autoriser seulement les URLs de même origine
    return parsedUrl.origin === window.location.origin;
  } catch {
    return false;
  }
};

// Nettoyage des URLs pour éviter les injections
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    
    // Supprimer les protocoles dangereux
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      return '/';
    }
    
    return parsedUrl.href;
  } catch {
    return '/';
  }
};

// Rate limiting côté client (basique)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const isRateLimited = (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= maxAttempts) {
    return true;
  }
  
  record.count++;
  return false;
};

// Nettoyage des données sensibles en mémoire
export const secureCleanup = (obj: any): void => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          // Overwrite strings with random data
          obj[key] = Math.random().toString(36);
        } else if (typeof obj[key] === 'object') {
          secureCleanup(obj[key]);
        }
        delete obj[key];
      }
    }
  }
};