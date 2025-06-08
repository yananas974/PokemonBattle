import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { addPokemonToTeam, removePokemonFromTeam } from '../controllers/pokemonTeamController';

const pokemonTeamRoutes = new Hono();

// Middleware d'authentification inline
const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'authToken');
  if (!token) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    c.set('user', { id: Number(payload.sub) });
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// Toutes les routes nécessitent une authentification
pokemonTeamRoutes.use(authMiddleware);

// Route pour ajouter un Pokemon à une équipe
pokemonTeamRoutes.post('/add', addPokemonToTeam);

// Route pour retirer un Pokemon d'une équipe
pokemonTeamRoutes.delete('/:teamId/:pokemonId', removePokemonFromTeam);

export default pokemonTeamRoutes; 