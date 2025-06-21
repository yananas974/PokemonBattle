import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  createTeamHandler,
  getTeamsHandler,
  deleteTeamHandler,
  addPokemonToTeamHandler,
  removePokemonFromTeamHandler
} from '../handlers/team.handler.js';

console.log('🔥 === TEAM ROUTE FILE LOADED ===');

const teamRoutes = new Hono();

// ✅ MIDDLEWARE DE DEBUG
teamRoutes.use('*', async (c, next) => {
  console.log('🔥 === REQUÊTE DANS TEAMROUTES ===');
  console.log('🔥 Method:', c.req.method);
  console.log('🔥 URL:', c.req.url);
  console.log('🔥 Path:', c.req.path);
  
  await next();
  console.log('🔥 === RETOUR DU MIDDLEWARE DEBUG ===');
});

// ✅ SEULEMENT LES VRAIES ROUTES - PAS DE ROUTES DE TEST
teamRoutes.get('/', authMiddleware, getTeamsHandler);
teamRoutes.post('/createTeam', authMiddleware, createTeamHandler);
teamRoutes.post('/:teamId/pokemon', authMiddleware, addPokemonToTeamHandler);
teamRoutes.delete('/:id', authMiddleware, deleteTeamHandler);
teamRoutes.delete('/:teamId/pokemon/:pokemonId', authMiddleware, removePokemonFromTeamHandler);

console.log('🔥 === TEAM ROUTES DEFINED ===');

export { teamRoutes }; 