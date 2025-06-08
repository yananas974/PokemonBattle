export const config = {
  // Pour le navigateur, on doit utiliser localhost car le navigateur ne peut pas accéder au réseau Docker interne
  // Le backend expose le port 3001 sur localhost depuis docker-compose.yml
  apiUrl: typeof window !== 'undefined' 
    ? 'http://localhost:3001' // Côté client (navigateur)
    : (process.env.API_URL || 'http://localhost:3001'), // Côté serveur
}; 