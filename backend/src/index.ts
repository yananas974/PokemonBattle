import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { corsMiddleware } from './config/cors.Config.js';
import routes from './routes/routes.js';
import { interactiveBattleRoutes } from './routes/interactiveBattle.route.js';



const app = new Hono()

// ✅ IMPORTANT: Enregistrer le gestionnaire d'erreurs AVANT tout le reste
app.onError(errorHandler);

// Middlewares globaux
app.use('*', logger());
app.use('*', corsMiddleware); 

// Routes
app.route('/api', routes);
app.route('/api/interactive-battle', interactiveBattleRoutes);

// Route de santé
app.get('/health', (c) => {
  return c.json({ 
    success: true,
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// 🚀 DÉMARRAGE SIMPLE - Plus de try/catch !
async function startServer() {
  console.log('🚀 === DÉMARRAGE DU SERVEUR ===');
  
  const port = 3001;
  console.log(`🌟 Server is running on port ${port}`);
  
  serve({
    fetch: app.fetch,
    port
  });
}

// Démarrer le serveur - Les erreurs seront gérées par le processus Node.js
startServer();

export default app; 