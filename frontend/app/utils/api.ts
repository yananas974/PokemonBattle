import { config } from '~/config/env';
import { getBackendTokenFromSession } from '~/sessions';

// Configuration de base pour l'API
const API_BASE_URL = config.apiUrl;

// ✅ Fonction pour valider un token
const isValidToken = (token: string | undefined | null): token is string => {
  return !!(token && 
    typeof token === 'string' && 
    token !== 'undefined' && 
    token !== 'null' && 
    token.trim() !== '' &&
    token.split('.').length === 3);
};

// ✅ Fonction pour récupérer le token depuis le DOM/localStorage côté client
const getTokenFromBrowser = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('backendToken') || null;
};

// ✅ Fonction améliorée pour les appels API avec gestion automatique du token
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {},
  token?: string,
  request?: Request // Ajouté pour récupérer le token de la session côté serveur
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // ✅ Récupération automatique du token
  let finalToken = token;
  
     if (!finalToken) {
     if (typeof window !== 'undefined') {
       // Côté client : récupérer depuis localStorage
       finalToken = getTokenFromBrowser() || undefined;
     } else if (request) {
      // Côté serveur : récupérer depuis la session
      try {
        finalToken = await getBackendTokenFromSession(request);
        if (!finalToken || finalToken === 'undefined' || finalToken === 'null') {
          finalToken = undefined;
        }
      } catch (error) {
        console.log('⚠️ Impossible de récupérer le token de la session:', error);
        finalToken = undefined;
      }
    }
  }
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // ✅ Envoyer le token dans les headers si disponible et valide
      ...(isValidToken(finalToken) && { 
        'Authorization': `Bearer ${finalToken}`,
        'X-Auth-Token': finalToken
      }),
      ...options.headers,
    },
    ...options,
  };

  console.log('API Call to:', url, 'with credentials: include');
  if (isValidToken(finalToken)) {
    console.log('🔑 Token valide envoyé:', finalToken.substring(0, 20) + '...');
  } else {
    console.log('❌ Aucun token valide disponible (token reçu:', finalToken, ')');
  }
  
  const response = await fetch(url, defaultOptions);
  console.log('API Response status:', response.status);
  return response;
};

// ✅ Fonction helper pour les appels côté serveur (loaders)
export const apiCallWithRequest = async (
  endpoint: string,
  request: Request,
  options: RequestInit = {}
): Promise<Response> => {
  return apiCall(endpoint, options, undefined, request);
};

// Fonction pour gérer les erreurs d'API
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response;
}; 