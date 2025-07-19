import { getBackendTokenFromSession } from '~/sessions.server';

// ✅ Version serveur uniquement de la fonction API
export const getTokenFromSession = async (request: Request): Promise<string | null> => {
  try {
    const token = await getBackendTokenFromSession(request);
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch (error) {
    return null;
  }
};

// ✅ Fonction d'appel API côté serveur avec authentification automatique
export const apiCallServer = async (
  endpoint: string,
  request: Request,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getTokenFromSession(request);
  
  // ✅ Utiliser l'URL backend appropriée selon l'environnement
  const API_BASE_URL = process.env.BACKEND_URL || 'http://backend:3001';
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 
        'Authorization': `Bearer ${token}`,
        'X-Auth-Token': token
      }),
      ...options.headers,
    },
    ...options,
  };

  if (token) {
  } else {
  }
  
  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    throw error;
  }
};