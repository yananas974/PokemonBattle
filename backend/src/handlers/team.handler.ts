import type { Context } from "hono";
import { TeamService } from "../services/createTeamService/teamService.js"; 
import { PokemonTeamService } from "../services/pokemonTeamService/pokemonTeamService.js";
import { User } from "../models/interfaces/user.interface.js";
import { Delete, Get } from "../db/crud/crud.js";
import { Team, pokemon } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { asyncHandler, authAsyncHandler } from "../utils/asyncWrapper.js";
import { NotFoundError, ValidationError, UnauthorizedError } from "../models/errors.js";
import { 
  createTeamRequestSchema,
  deleteTeamParamsSchema,
  addPokemonToTeamRequestSchema,
  removePokemonFromTeamParamsSchema
} from "../schemas/index.js";

export const getTeamsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  
  const teamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
  
  return c.json({
    success: true,
    teams: teamsWithPokemon
  });
});

export const createTeamHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  const data = createTeamRequestSchema.parse(body);
  
  const team = await TeamService.createTeam(data, user.id);
  
  return c.json({
    success: true,
    message: 'Team created successfully',
    team
  });
});

export const deleteTeamHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const params = deleteTeamParamsSchema.parse({ id: c.req.param('id') });
  const teamId = params.id;

  const team = await Get(Team, and(eq(Team.id, teamId), eq(Team.user_id, user.id))!);
  if (!team) {
    throw new NotFoundError('Équipe');
  }

  await Delete(Team, eq(Team.id, teamId));
  
  return c.json({
    success: true,
    message: 'Équipe supprimée avec succès'
  });
});

export const addPokemonToTeamHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const body = await c.req.json();
  const teamId = c.req.param('teamId');
  
  const data = addPokemonToTeamRequestSchema.parse({
    teamId: Number(teamId),
    pokemonId: body.pokemonId
  });

  const result = await PokemonTeamService.addPokemonToTeam(
    data.teamId, 
    data.pokemonId, 
    user.id
  );
  
  return c.json({
    success: true,
    message: 'Pokémon ajouté à l\'équipe avec succès',
    pokemon: result
  });
});

export const removePokemonFromTeamHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const params = removePokemonFromTeamParamsSchema.parse({
    teamId: c.req.param('teamId'),
    pokemonId: c.req.param('pokemonId')
  });

  const team = await Get(Team, and(eq(Team.id, params.teamId), eq(Team.user_id, user.id))!);
  if (!team) {
    throw new NotFoundError('Équipe');
  }

  await Delete(pokemon, and(eq(pokemon.team_id, params.teamId), eq(pokemon.id, params.pokemonId))!);
  
  return c.json({
    success: true,
    message: 'Pokémon retiré de l\'équipe avec succès'
  });
});

