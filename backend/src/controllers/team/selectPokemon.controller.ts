import { Hono } from "hono";
import { createPokemonSelection, deletePokemonSelection, createManyPokemonSelection } from "../../services/pokemonTeamService.ts/pokemonSelectionService.js";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";
import { getUserById } from "../../services/authService/userService.js";


const selectPokemonController = new Hono();

const authMiddleware = async (c: any, next: any) => {
  const token = getCookie(c, 'authToken');
  if (!token) {
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    (c as any).user = user;
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

selectPokemonController.post("/team/:teamId/pokemon/:pokemonId", async (c) => {
  const teamId = parseInt(c.req.param('teamId'));
  const pokemonId = parseInt(c.req.param('pokemonId'));
  const pokemonSelection = await createPokemonSelection(teamId, pokemonId);
  return c.json(pokemonSelection);
});

selectPokemonController.delete("/team/:teamId/pokemon/:pokemonId", async (c) => {
  const teamId = parseInt(c.req.param('teamId'));
  const pokemonId = parseInt(c.req.param('pokemonId'));
  await deletePokemonSelection(teamId, pokemonId);
  return c.json({ success: true, message: 'Pokemon retiré de l\'équipe' });
});



export default selectPokemonController;