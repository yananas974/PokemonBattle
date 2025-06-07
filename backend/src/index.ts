import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware } from './config/cors.Config';
import { PORT } from './config/env.Config';
import pokemonRoutes from './routes/pokemon.route';
import pokemonFrController from './controllers/pokemonController/pokemonFr.controller';
import authRoutes from './routes/auth.route';
import teamController from './controllers/team/team.controller';

const app = new Hono();

// Configurer CORS pour permettre les requêtes
app.use('*', corsMiddleware);

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Pokemon Battle API is running!' });
});

// Route pour les Pokemon
app.route('/api/pokemon', pokemonRoutes);
app.route('/api/pokemon/fusion', pokemonFrController);
app.route('/api/auth', authRoutes);
app.route('/api/teams', teamController);

app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const port = Number(PORT);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}); 