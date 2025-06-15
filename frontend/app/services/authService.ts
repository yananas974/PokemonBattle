import { apiCall, handleApiError } from '~/utils/api';
import type { SignupData, LoginData, AuthResponse } from '~/types/auth';

export const authService = {
  // Inscription d'un nouvel utilisateur
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await handleApiError(response);
    return response.json();
  },

  // Connexion d'un utilisateur
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await handleApiError(response);
    return response.json();
  },

  // Déconnexion d'un utilisateur
  async logout(): Promise<{ message: string }> {
    const response = await apiCall('/api/auth/logout', {
      method: 'POST',
    });
    await handleApiError(response);
    return response.json();
  }
}; 