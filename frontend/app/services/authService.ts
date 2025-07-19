import { apiCall, handleApiError } from '~/utils/api';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '@pokemon-battle/shared';
import { loginSchema, registerSchema, sanitizeString, validateFormData } from '~/utils/validation';
import type { LoginData, RegisterData } from '~/utils/validation';

interface BackendAuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user: User;
    token: string;
  };
}

export const authService = {
  // Inscription d'un nouvel utilisateur
  async signup(data: RegisterRequest): Promise<AuthResponse> {
    // ✅ Validation côté client avant l'envoi
    const validation = validateFormData(registerSchema, data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides: ' + Object.values(validation.errors || {}).join(', ')
      };
    }
    
    // ✅ Sanitization des données
    const sanitizedData = {
      ...data,
      username: sanitizeString(data.username),
      email: sanitizeString(data.email)
    };
    const response = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
    await handleApiError(response);
    
    const backendResponse: BackendAuthResponse = await response.json();
    
    // Transformer la réponse backend en structure attendue
    if (backendResponse.success && backendResponse.data) {
      return {
        success: true,
        user: {
          ...backendResponse.data.user,
          token: backendResponse.data.token,
          backendToken: backendResponse.data.token
        },
        message: backendResponse.message
      };
    }
    
    return {
      success: false,
      error: backendResponse.error || 'Erreur lors de l\'inscription'
    };
  },

  // Connexion d'un utilisateur (côté client)
  async login(data: LoginRequest): Promise<AuthResponse> {
    // ✅ Validation côté client avant l'envoi
    const validation = validateFormData(loginSchema, data);
    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides: ' + Object.values(validation.errors || {}).join(', ')
      };
    }
    
    // ✅ Sanitization des données
    const sanitizedData = {
      ...data,
      email: sanitizeString(data.email)
    };
    
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    });
    await handleApiError(response);
    
    const backendResponse: BackendAuthResponse = await response.json();
    
    // Transformer la réponse backend en structure attendue
    if (backendResponse.success && backendResponse.data) {
      const userWithToken = {
        ...backendResponse.data.user,
        token: backendResponse.data.token,
        backendToken: backendResponse.data.token
      };
      
      // Le token backend est maintenant stocké de manière sécurisée côté serveur
      // Plus besoin de localStorage
      
      return {
        success: true,
        user: userWithToken,
        message: backendResponse.message
      };
    }
    
    return {
      success: false,
      error: backendResponse.error || 'Identifiants invalides'
    };
  },

  // Connexion d'un utilisateur (côté serveur avec request)
  async loginWithRequest(data: LoginRequest, request: Request): Promise<AuthResponse> {
    console.log('🔍 loginWithRequest - Début:', data);
    
    // ✅ Validation côté client avant l'envoi
    const validation = validateFormData(loginSchema, data);
    if (!validation.success) {
      console.log('❌ Validation failed:', validation.errors);
      console.log('📋 Détail des erreurs:', Object.entries(validation.errors || {}));
      return {
        success: false,
        error: 'Données invalides: ' + Object.values(validation.errors || {}).join(', ')
      };
    }
    
    // ✅ Sanitization des données
    const sanitizedData = {
      ...data,
      email: sanitizeString(data.email)
    };
    
    console.log('🌐 Appel API vers backend:', sanitizedData);
    
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(sanitizedData),
    }, undefined, request); // ✅ Passer l'objet request pour Docker
    
    console.log('📡 Réponse reçue, status:', response.status);
    await handleApiError(response);
    
    const backendResponse: BackendAuthResponse = await response.json();
    
    // Transformer la réponse backend en structure attendue
    if (backendResponse.success && backendResponse.data) {
      const userWithToken = {
        ...backendResponse.data.user,
        token: backendResponse.data.token,
        backendToken: backendResponse.data.token
      };
      
      return {
        success: true,
        user: userWithToken,
        message: backendResponse.message
      };
    }
    
    return {
      success: false,
      error: backendResponse.error || 'Identifiants invalides'
    };
  },

  // Déconnexion d'un utilisateur
  async logout(): Promise<{ message: string }> {
    const response = await apiCall('/api/auth/logout', {
      method: 'POST',
    });
    await handleApiError(response);
    
    // Les tokens sont maintenant gérés côté serveur via les sessions
    
    return response.json();
  }
}; 