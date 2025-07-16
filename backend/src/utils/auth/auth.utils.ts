import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET, isDevelopment } from '../../config/env.Config';
import { cookieOptions as secureCookieOptions } from '../../config/cors.Config';

// ✅ GÉNÉRATION DE TOKEN SÉCURISÉE
export const generateToken = async (user_id: string) => {
  if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET non configuré');
  }
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user_id,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 jours (réduit de 30 jours)
    iss: 'pokemon-battle-api',
    aud: 'pokemon-battle-app'
  };
  
  const token = jwt.sign(payload, JWT_SECRET);
  
  // ✅ LOG SÉCURISÉ (pas de token en clair)
  if (isDevelopment) {
    console.log('🔑 Token généré pour utilisateur:', user_id);
  }
  
  return token;
};

// ✅ VERIFICATION DE TOKEN SÉCURISÉE
export const verifyToken = async (token: string) => {
  try {
    if (!JWT_SECRET) {
      throw new Error('❌ JWT_SECRET non configuré');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (isDevelopment) {
      console.warn('⚠️  Token invalide:', error instanceof Error ? error.message : 'Erreur inconnue');
    }
    throw new Error('Token invalide');
  }
};

// ✅ UTILISATION DES OPTIONS DE COOKIE SÉCURISÉES
export const cookieOptions = secureCookieOptions;

// ✅ FONCTIONS DE HACHAGE SÉCURISÉES
export const hashPassword = async (password: string) => {
  if (!password || password.length < 8) {
    throw new Error('❌ Mot de passe trop court (minimum 8 caractères)');
  }
  
  // Utilisation d'un salt plus élevé pour plus de sécurité
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string) => {
  if (!password || !hash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    if (isDevelopment) {
      console.warn('⚠️  Erreur lors de la comparaison de mot de passe:', error);
    }
    return false;
  }
};

export const verifyPassword = comparePassword;

// ✅ VALIDATION DE MOT DE PASSE
export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Minimum ${minLength} caractères requis`);
  }
  if (!hasUpper) {
    errors.push('Au moins une majuscule requise');
  }
  if (!hasLower) {
    errors.push('Au moins une minuscule requise');
  }
  if (!hasNumbers) {
    errors.push('Au moins un chiffre requis');
  }
  if (!hasSpecial) {
    errors.push('Au moins un caractère spécial requis');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: errors.length === 0 ? 'fort' : errors.length <= 2 ? 'moyen' : 'faible'
  };
};

// ✅ NETTOYAGE DES LOGS SENSIBLES
export const sanitizeForLogging = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[MASQUE]';
    }
  });
  
  return sanitized;
};