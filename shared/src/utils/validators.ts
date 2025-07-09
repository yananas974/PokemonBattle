import { z } from 'zod';

// ✅ SCHÉMAS COMMUNS RÉUTILISABLES
export const commonSchemas = {
  id: z.string().transform((val: string) => parseInt(val)).refine((val: number) => !isNaN(val), {
    message: 'ID must be a valid number'
  }),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180)
  }),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional()
  })
};

// ✅ VALIDATEUR D'ID GÉNÉRIQUE
export const validateId = (id: string | number, fieldName: string = 'ID') => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  if (isNaN(numId) || numId <= 0) {
    throw new Error(`${fieldName} invalide`);
  }
  return numId;
};

// ✅ VALIDATEUR D'EMAIL
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ VALIDATEUR DE MOT DE PASSE
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ VALIDATEUR DE COORDONNÉES
export const validateCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

// ✅ SANITIZE STRING (pour éviter les injections)
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// ✅ TYPES POUR LES VALIDATEURS
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type IdValidation = number;
export type EmailValidation = boolean;
export type PasswordValidation = ValidationResult;
export type CoordinatesValidation = boolean; 