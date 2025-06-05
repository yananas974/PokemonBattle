import { Hono } from 'hono';

import pokemonFrController from "../controllers/pokemonController/pokemonFr.controller";

const pokemonRoutes = new Hono();

// Utiliser le contrôleur directement

pokemonRoutes.route('', pokemonFrController);

export default pokemonRoutes;