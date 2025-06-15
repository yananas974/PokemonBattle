import 'dotenv/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ✅ IMPORTS DIRECTS (plus fiables)
import authRoutes from './routes/auth.route.js';
import pokemonRoutes from './routes/pokemon.route.js';
import friendshipRoutes from './routes/friendship.route.js';
import teamRoutes from './routes/team.route.js';
import weatherRoutes from './routes/weather.route.js';

const app = new Hono();

// ✅ CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  credentials: true,
}));

// ✅ Middleware de debug
app.use('*', (c, next) => {
  console.log(`🌐 REQUÊTE REÇUE: ${c.req.method} ${c.req.url}`);
  return next();
});

// ✅ Routes principales PROPRES
app.route('/api/auth', authRoutes);
app.route('/api/pokemon', pokemonRoutes);
app.route('/api/friends', friendshipRoutes);
app.route('/api/teams', teamRoutes);
app.route('/api/weather', weatherRoutes);

// ✅ Route de test racine seulement
app.get('/', (c) => {
  return c.text('Pokemon Battle API is running! 🚀');
});

const port = 3001;
console.log(`🚀 Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
}); 