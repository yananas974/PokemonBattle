import { Hono } from "hono";

import type { User } from "../../models/interfaces/user.interface.js";
import { authMiddleware } from "../../middlewares/authMiddleware/auth.middleware.js";
import { addPokemonToTeamHandler, removePokemonFromTeamHandler, createTeamHandler, getTeamsHandler, deleteTeamHandler } from '../../handlers/team.handler.js';

// ✅ Typage propre avec l'interface User
type Variables = {
  user: User;
};

const pokemonTeamController = new Hono<{ Variables: Variables }>();

pokemonTeamController.use(authMiddleware);

pokemonTeamController.post('/add', addPokemonToTeamHandler);
pokemonTeamController.delete('/remove/:teamId/:pokemonId', removePokemonFromTeamHandler);
pokemonTeamController.post('/createTeam', createTeamHandler);
pokemonTeamController.get('/myTeams', getTeamsHandler);
pokemonTeamController.delete('/:id', deleteTeamHandler);

export default pokemonTeamController; 

