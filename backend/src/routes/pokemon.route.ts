import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';
import { 
  pokemonHandlers,
  pokemonValidators
} from '../handlers/pokemon.handler.js';

const pokemonRoutes = new Hono();

const protectedRoutes = new Hono();

// ✅ Routes Pokemon avec la nouvelle structure
protectedRoutes.get('/all', authMiddleware, pokemonHandlers.getAllPokemon);
protectedRoutes.get('/search', authMiddleware, pokemonHandlers.searchPokemon);
protectedRoutes.get('/:id', authMiddleware, pokemonValidators.getPokemonById, pokemonHandlers.getPokemonById);

// ✅ Routes de debug pour les types Pokemon
protectedRoutes.get('/types/debug', authMiddleware, pokemonHandlers.getTypesDebug);
protectedRoutes.post('/types/invalidate-cache', authMiddleware, pokemonHandlers.invalidateTypeCache);

pokemonRoutes.route('/', protectedRoutes);

export { pokemonRoutes };