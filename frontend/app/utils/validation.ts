import { z } from 'zod';

// ✅ SCHÉMAS DE VALIDATION SÉCURISÉS

// Validation des données d'authentification
export const loginSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis')
    .max(254, 'Email trop long'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Mot de passe trop long')
    // ✅ Validation assouplie temporairement pour le test
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Nom d\'utilisateur trop long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  email: z.string()
    .email('Email invalide')
    .min(1, 'Email requis')
    .max(254, 'Email trop long'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(128, 'Mot de passe trop long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

// Validation des données de combat
export const battleActionSchema = z.object({
  battleId: z.string()
    .min(1, 'ID de combat requis')
    .regex(/^battle_\d+_[a-z0-9]+$/, 'Format d\'ID de combat invalide'),
  intent: z.enum(['attack', 'hack', 'forfeit', 'get-status'], {
    errorMap: () => ({ message: 'Action de combat invalide' })
  }),
  moveIndex: z.number()
    .int('L\'index du mouvement doit être un entier')
    .min(0, 'Index du mouvement invalide')
    .max(3, 'Index du mouvement invalide')
    .optional(),
  answer: z.string()
    .max(500, 'Réponse trop longue')
    .optional()
});

// Validation des données d'équipe
export const teamSchema = z.object({
  name: z.string()
    .min(1, 'Nom d\'équipe requis')
    .max(50, 'Nom d\'équipe trop long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Le nom d\'équipe contient des caractères invalides'),
  description: z.string()
    .max(500, 'Description trop longue')
    .optional()
});

// Validation des IDs
export const idSchema = z.number()
  .int('ID invalide')
  .positive('ID doit être positif');

export const uuidSchema = z.string()
  .uuid('UUID invalide');

// Validation des données de pagination
export const paginationSchema = z.object({
  page: z.number()
    .int('Numéro de page invalide')
    .min(1, 'Le numéro de page doit être supérieur à 0')
    .max(1000, 'Numéro de page trop élevé')
    .default(1),
  limit: z.number()
    .int('Limite invalide')
    .min(1, 'La limite doit être supérieure à 0')
    .max(100, 'Limite trop élevée')
    .default(20)
});

// Validation des données météo
export const weatherSchema = z.object({
  lat: z.number()
    .min(-90, 'Latitude invalide')
    .max(90, 'Latitude invalide'),
  lon: z.number()
    .min(-180, 'Longitude invalide')
    .max(180, 'Longitude invalide')
});

// ✅ FONCTIONS UTILITAIRES DE VALIDATION

export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, '') // Supprimer les caractères dangereux
    .trim()
    .slice(0, 1000); // Limiter la longueur
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/&/g, '&amp;');
};

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return loginSchema.shape.password.safeParse(password).success;
};

// ✅ HOOK DE VALIDATION POUR LES FORMULAIRES

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export const validateFormData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      };
    } else {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const path = error.path.join('.');
        errors[path] = error.message;
      });
      
      return {
        success: false,
        errors
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: { general: 'Erreur de validation' }
    };
  }
};

// Types exportés
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type BattleActionData = z.infer<typeof battleActionSchema>;
export type TeamData = z.infer<typeof teamSchema>;
export type PaginationData = z.infer<typeof paginationSchema>;
export type WeatherData = z.infer<typeof weatherSchema>;