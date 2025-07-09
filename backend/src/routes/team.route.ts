import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { teamHandlers, teamValidators } from '../handlers/team.handler.js';

const teamRoutes = new Hono();

// ✅ Routes d'équipe (toutes protégées par authMiddleware)
teamRoutes.get('/', authMiddleware, teamHandlers.getTeams);
teamRoutes.get('/:id', authMiddleware, teamHandlers.getTeamById);
teamRoutes.post('/createTeam', authMiddleware, teamValidators.create, teamHandlers.createTeam);
teamRoutes.delete('/:id', authMiddleware, teamHandlers.deleteTeam);

// ✅ Gestion des Pokémon dans les équipes
teamRoutes.post('/:teamId/pokemon', authMiddleware, teamHandlers.addPokemonToTeam);
teamRoutes.delete('/:teamId/pokemon/:pokemonId', authMiddleware, teamHandlers.removePokemonFromTeam);

export { teamRoutes }; 