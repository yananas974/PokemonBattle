import { Hono } from "hono";
import pokemonController from "../controllers/pokemon.controller";

const pokemonRoutes = new Hono();

pokemonRoutes.route('/api/pokemon', pokemonController);

export default pokemonRoutes;