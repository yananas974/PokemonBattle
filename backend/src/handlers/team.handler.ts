import type { Context } from "hono";
import { TeamService } from "../services/createTeamService/teamService.js"; 
import { PokemonTeamService } from "../services/pokemonTeamService/pokemonTeamService.js";
import { User } from "../models/interfaces/user.interface.js";
import { Delete, Get } from "../db/crud/crud.js";
import { Team, pokemon } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { asyncHandler, authAsyncHandler } from "../utils/asyncWrapper.js";
import { NotFoundError, ValidationError, UnauthorizedError } from "../models/errors.js";

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
  const data = await c.req.json();
  
  const team = await TeamService.createTeam(data, user.id);
  
  return c.json({
    success: true,
    message: 'Team created successfully',
    team
  });
});

export const deleteTeamHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  const teamId = parseInt(c.req.param('id'));
  
  if (!teamId || isNaN(teamId)) {
    throw new ValidationError('ID d\'équipe invalide');
  }

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
  const data = await c.req.json();
  
  const teamId = c.req.param('teamId');
  const pokemonId = data.pokemonId;

  if (!teamId || !pokemonId) {
    throw new ValidationError('TeamId et PokemonId sont requis');
  }

  const result = await PokemonTeamService.addPokemonToTeam(
    Number(teamId), 
    Number(pokemonId), 
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
  const teamId = parseInt(c.req.param('teamId'));
  const pokemonId = parseInt(c.req.param('pokemonId'));
  
  if (!teamId || !pokemonId || isNaN(teamId) || isNaN(pokemonId)) {
    throw new ValidationError('ID d\'équipe et ID de Pokémon valides requis');
  }

  const team = await Get(Team, and(eq(Team.id, teamId), eq(Team.user_id, user.id))!);
  if (!team) {
    throw new NotFoundError('Équipe');
  }

  await Delete(pokemon, and(eq(pokemon.team_id, teamId), eq(pokemon.id, pokemonId))!);
  
  return c.json({
    success: true,
    message: 'Pokémon retiré de l\'équipe avec succès'
  });
});

