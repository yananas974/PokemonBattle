import { config } from '~/config/env';

// Configuration de base pour l'API
const API_BASE_URL = config.apiUrl;

// Fonction utilitaire pour faire des requêtes avec token
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {},
  token?: string // ✅ Le token est maintenant passé en paramètre
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('API Call to:', url, 'with credentials: include');
  if (token) {
    console.log('🔑 Token envoyé:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Aucun token disponible');
  }
  const response = await fetch(url, defaultOptions);
  console.log('API Response status:', response.status);
  return response;
};

// Fonction pour gérer les erreurs d'API
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response;
}; 