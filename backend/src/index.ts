import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { corsMiddleware, securityHeaders } from './config/cors.Config.js';
import { PORT, validateConfiguration } from './config/env.Config.js';
import routes from './routes/routes.js';

// ✅ VALIDATION DE LA CONFIGURATION AU DÉMARRAGE
try {
  validateConfiguration();
} catch (error) {
  console.error('❌ Erreur de configuration:', error);
  process.exit(1);
}

const app = new Hono()

// ✅ IMPORTANT: Enregistrer le gestionnaire d'erreurs AVANT tout le reste
app.onError(errorHandler);

// Middlewares globaux
app.use('*', logger());
app.use('*', corsMiddleware);

// ✅ AJOUT DES HEADERS DE SÉCURITÉ
app.use('*', async (c, next) => {
  await next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });
}); 

// Routes
app.route('/api', routes);


// Route de santé
app.get('/health', (c) => {
  return c.json({ 
    success: true,
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// 🚀 DÉMARRAGE SÉCURISÉ DU SERVEUR
async function startServer() {
  console.log('🚀 === DÉMARRAGE DU SERVEUR ===');
  
  console.log(`🌟 Server is running on port ${PORT}`);
  console.log('🔒 Headers de sécurité activés');
  console.log('🌐 CORS configuré');
  
  serve({
    fetch: app.fetch,
    port: PORT
  });
}

// Démarrer le serveur - Les erreurs seront gérées par le processus Node.js
startServer();

export default app; 