import type { Context } from "hono";
import { TeamService } from "../services/createTeamService/teamService.js"; 
import { PokemonTeamService } from "../services/pokemonTeamService/pokemonTeamService.js";
import { User } from "../models/interfaces/user.interface.js";
import { Delete, Get } from "../db/crud/crud.js";
import { Team, pokemon } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { asyncHandler, authAsyncHandler } from "../utils/asyncWrapper.js";
import { NotFoundError, ValidationError } from "../middlewares/errorHandler.middleware.js";

export const getTeamsHandler = authAsyncHandler(async (c: Context) => {
  const user = c.get('user');
  
  const teamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
  
  return c.json({
    success: true,
    teams: teamsWithPokemon
  });
});

export const createTeamHandler = async (c: Context) => {
  
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }
   
    const team = await TeamService.createTeam(data, user.id);
    
    return c.json({
      success: true,
      message: 'Team created successfully',
      team
    });
  } catch (error: any) {
    console.error('❌ Erreur dans createTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to create team' 
    }, 500);
  }
};

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

export const addPokemonToTeamHandler = async (c: Context) => {
  
  try {
    const user = c.get('user') as any;
    const data = await c.req.json();
    
    if (!user?.id) {
      return c.json({ success: false, error: 'User not authenticated' }, 401);
    }

    const teamId = c.req.param('teamId');
    const pokemonId = data.pokemonId;

    console.log('🔍 TeamId depuis URL:', teamId);
    console.log('🔍 PokemonId depuis body:', pokemonId);

    if (!teamId || !pokemonId) {
      return c.json({ 
        success: false, 
        error: 'TeamId et PokemonId sont requis' 
      }, 400);
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
  } catch (error: any) {
    console.error('❌ Erreur dans addPokemonToTeamHandler:', error);
    return c.json({ 
      success: false, 
      error: error.message || 'Failed to add pokemon' 
    }, 500);
  }
};

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

