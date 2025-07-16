import { getBackendTokenFromSession } from '~/sessions.server';

// ✅ Version serveur uniquement de la fonction API
export const getTokenFromSession = async (request: Request): Promise<string | null> => {
  try {
    console.log('🔍 Récupération token depuis session...');
    const token = await getBackendTokenFromSession(request);
    console.log('🔑 Token récupéré:', token ? token.substring(0, 20) + '...' : 'AUCUN');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  } catch (error) {
    console.log('⚠️ Impossible de récupérer le token de la session:', error);
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

  console.log('🌐 API Call Server to:', url);
  console.log('🔧 Environment BACKEND_URL:', process.env.BACKEND_URL);
  if (token) {
    console.log('🔑 Token serveur envoyé:', token.substring(0, 20) + '...');
  } else {
    console.log('❌ Aucun token serveur disponible');
  }
  
  try {
    const response = await fetch(url, defaultOptions);
    console.log('✅ API Server Response status:', response.status);
    return response;
  } catch (error) {
    console.error('❌ Fetch error:', error);
    console.error('🌐 URL tentée:', url);
    console.error('📦 Options:', defaultOptions);
    throw error;
  }
};