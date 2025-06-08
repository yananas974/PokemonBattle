import { config } from '~/config/env';

// Configuration de base pour l'API
const API_BASE_URL = config.apiUrl;

// Fonction utilitaire pour faire des requêtes avec cookies
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Important pour inclure les cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log('API Call to:', url, 'with credentials: include');
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