import { config } from '~/config/env';

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

// ✅ Côté client, plus besoin de localStorage - les cookies httpOnly sont automatiquement envoyés
const getTokenFromBrowser = (): string | null => {
  // Les tokens sont désormais dans les cookies httpOnly, pas accessible côté client
  // Cette fonction reste pour compatibilité mais retourne null
  return null;
};

// ✅ Fonction pour récupérer le token depuis la session côté serveur
const getBackendTokenFromSession = async (request: Request): Promise<string | null> => {
  if (typeof window !== 'undefined') return null; // Côté client, retourner null
  
  try {
    // Import dynamique pour éviter l'import côté client
    const { getBackendTokenFromSession: getToken } = await import('../sessions.server.js');
    const token = await getToken(request);
    console.log('🔍 Token récupéré de la session:', token ? 'PRÉSENT' : 'ABSENT');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch (error) {
    console.log('❌ Erreur récupération token:', error);
    return null;
  }
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
      finalToken = await getBackendTokenFromSession(request) || undefined;
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

  if (isValidToken(finalToken)) {
  } else {
  }
  
  const response = await fetch(url, defaultOptions);
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