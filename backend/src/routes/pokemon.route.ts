import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  getAllPokemonHandler,
  getPokemonByIdHandler
} from '../handlers/pokemon.handler.js';
import { 
  createTeamHandler,
  getTeamsHandler,
  deleteTeamHandler,
  addPokemonToTeamHandler,
  removePokemonFromTeamHandler
} from '../handlers/team.handler.js';

const pokemonRoutes = new Hono();


const protectedRoutes = new Hono();

protectedRoutes.get('/all', authMiddleware, getAllPokemonHandler);
protectedRoutes.get('/:id', authMiddleware, getPokemonByIdHandler);

protectedRoutes.post('/teams', authMiddleware, createTeamHandler);
protectedRoutes.get('/teams', authMiddleware, getTeamsHandler);
protectedRoutes.delete('/teams/:id', authMiddleware, deleteTeamHandler);
  
protectedRoutes.post('/teams/add-pokemon', authMiddleware, addPokemonToTeamHandler);
protectedRoutes.delete('/teams/remove-pokemon/:teamId/:pokemonId', authMiddleware, removePokemonFromTeamHandler);

pokemonRoutes.route('/', protectedRoutes);

export { pokemonRoutes };