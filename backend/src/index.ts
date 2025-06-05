import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware } from './config/cors.Config';
import { PORT, DATABASE_URL } from './config/env.Config';
import { connectToDatabase, closeDatabase } from './config/dataBase.Config';
import pokemonRoutes from './routes/pokemon.routes';
const app = new Hono();


app.use('*', corsMiddleware);
await connectToDatabase();
console.log(`Le Server est en court sur le port: ${PORT} est utilise l'URl: ${DATABASE_URL}`);

app.route('/api/pokemon', pokemonRoutes);


// Routes
app.get('/', (c) => {
  return c.json({ message: 'Pokemon Battle API is running!' });
});

app.get('/api/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});


const port = parseInt(process.env.PORT || '3001');
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
}); 