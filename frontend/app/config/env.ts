export const config = {
  // Configuration API différente côté client vs serveur
  apiUrl: typeof window !== 'undefined' 
    ? 'http://localhost:3001' // Côté client (navigateur)
    : 'http://backend:3001', // Côté serveur (réseau Docker)
}; 