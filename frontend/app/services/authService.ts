import { apiCall, handleApiError } from '~/utils/api';
import type { RegisterRequest, LoginRequest, AuthResponse } from '~/types/shared';

interface BackendAuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    user: any;
    token: string;
  };
}

export const authService = {
  // Inscription d'un nouvel utilisateur
  async signup(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
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
        token: backendResponse.data.token,
        message: backendResponse.message
      };
    }
    
    return {
      success: false,
      error: backendResponse.error || 'Erreur lors de l\'inscription'
    };
  },

  // Connexion d'un utilisateur
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
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
      
      // Sauvegarder le token côté client pour les futures requêtes
      if (typeof window !== 'undefined') {
        localStorage.setItem('backendToken', backendResponse.data.token);
      }
      
      return {
        success: true,
        user: userWithToken,
        token: backendResponse.data.token,
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
    
    // Nettoyer le token côté client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('backendToken');
    }
    
    return response.json();
  }
}; 