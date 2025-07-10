// ✅ Types temporaires tirés de @pokemon-battle/shared
// TODO: Remplacer par l'importation du package partagé quand le problème sera résolu

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithToken extends User {
  token: string;
  backendToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserWithToken;
  token?: string; // ✅ Ajout du token au niveau de la réponse
  message?: string;
  error?: string;
}

// ✅ Interface d'erreur de validation
export interface ValidationError extends Error {
  errors: Array<{
    path: string[];
    message: string;
  }>;
}

// ✅ Validation schemas avec gestion d'erreurs appropriée
export const authValidators = {
  login: {
    parse: (data: LoginRequest) => {
      const errors: Array<{ path: string[]; message: string }> = [];
      
      if (!data.email) {
        errors.push({ path: ['email'], message: 'L\'email est requis' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ path: ['email'], message: 'Format d\'email invalide' });
      }
      
      if (!data.password) {
        errors.push({ path: ['password'], message: 'Le mot de passe est requis' });
      } else if (data.password.length < 6) {
        errors.push({ path: ['password'], message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      if (errors.length > 0) {
        const error = new Error('Validation failed') as ValidationError;
        error.errors = errors;
        throw error;
      }
      
      return data;
    }
  },
  register: {
    parse: (data: RegisterRequest) => {
      const errors: Array<{ path: string[]; message: string }> = [];
      
      if (!data.email) {
        errors.push({ path: ['email'], message: 'L\'email est requis' });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push({ path: ['email'], message: 'Format d\'email invalide' });
      }
      
      if (!data.username) {
        errors.push({ path: ['username'], message: 'Le nom d\'utilisateur est requis' });
      } else if (data.username.length < 2) {
        errors.push({ path: ['username'], message: 'Le nom d\'utilisateur doit contenir au moins 2 caractères' });
      }
      
      if (!data.password) {
        errors.push({ path: ['password'], message: 'Le mot de passe est requis' });
      } else if (data.password.length < 6) {
        errors.push({ path: ['password'], message: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      
      if (errors.length > 0) {
        const error = new Error('Validation failed') as ValidationError;
        error.errors = errors;
        throw error;
      }
      
      return data;
    }
  }
};

// ✅ Types Pokémon temporaires
export interface Pokemon {
  id: number;
  name_fr: string;
  name_en?: string;
  type: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  height: number;
  weight: number;
  sprite_url: string;
  back_sprite_url?: string;
} 