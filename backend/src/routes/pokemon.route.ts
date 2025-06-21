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

// ✅ Routes publiques AVANT le middleware d'authentification
pokemonRoutes.get('/public/all', getAllPokemonHandler);
pokemonRoutes.get('/public/:id', getPokemonByIdHandler);

// ✅ Appliquer le middleware d'authentification SEULEMENT aux routes protégées
const protectedRoutes = new Hono();
protectedRoutes.use(authMiddleware);

// Routes protégées
protectedRoutes.get('/all', getAllPokemonHandler);
protectedRoutes.get('/:id', getPokemonByIdHandler);

// Routes Équipes (protégées)
protectedRoutes.post('/teams', createTeamHandler);
protectedRoutes.get('/teams', getTeamsHandler);
protectedRoutes.delete('/teams/:id', deleteTeamHandler);
  
//Routes Pokémon dans équipes (protégées)
protectedRoutes.post('/teams/add-pokemon', addPokemonToTeamHandler);
protectedRoutes.delete('/teams/remove-pokemon/:teamId/:pokemonId', removePokemonFromTeamHandler);

// ✅ Combiner les routes publiques et protégées
pokemonRoutes.route('/', protectedRoutes);

export { pokemonRoutes };