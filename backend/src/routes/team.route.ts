import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  createTeamHandler,
  getTeamsHandler,
  deleteTeamHandler,
  addPokemonToTeamHandler,
  removePokemonFromTeamHandler
} from '../handlers/team.handler.js';

const teamRoutes = new Hono();

teamRoutes.get('/', authMiddleware, getTeamsHandler);
teamRoutes.post('/createTeam', authMiddleware, createTeamHandler);
teamRoutes.post('/:teamId/pokemon', authMiddleware, addPokemonToTeamHandler);
teamRoutes.delete('/:id', authMiddleware, deleteTeamHandler);
teamRoutes.delete('/:teamId/pokemon/:pokemonId', authMiddleware, removePokemonFromTeamHandler);

export { teamRoutes }; 