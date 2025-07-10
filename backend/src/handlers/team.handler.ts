import type { Context } from "hono";
import { TeamService } from "../services/createTeamService/teamService.js"; 
import { PokemonTeamService } from "../services/pokemonTeamService/pokemonTeamService.js";
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
import { zValidator } from '@hono/zod-validator';
import { formatResponse, TEAM_MESSAGES, validateId, User } from '@pokemon-battle/shared';

// ✅ TYPES
interface TeamHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

// ✅ HELPERS
const validateTeamOwnership = async (teamId: number, userId: number): Promise<any> => {
  const team = await Get(Team, and(eq(Team.id, teamId), eq(Team.user_id, userId))!);
  if (!team) {
    throw new NotFoundError('Équipe');
  }
  return team;
};

const withTeamOwnership = (handler: (c: Context, team: any) => Promise<Response>) => {
  return authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    const teamId = Number(c.req.param('teamId') || c.req.param('id'));
    
    if (!validateId(teamId)) {
      throw new ValidationError('ID d\'équipe invalide');
    }
    
    const team = await validateTeamOwnership(teamId, user.id);
    return handler(c, team);
  });
};

const formatTeamResponse = (message: string, data?: any) => {
  return formatResponse(message, data);
};

// ✅ VALIDATORS GROUPÉS
export const teamValidators = {
  create: zValidator('json', createTeamRequestSchema),
  delete: zValidator('param', deleteTeamParamsSchema),
  addPokemon: zValidator('json', addPokemonToTeamRequestSchema),
  removePokemon: zValidator('param', removePokemonFromTeamParamsSchema)
};

// ✅ HANDLERS GROUPÉS
export const teamHandlers: TeamHandler = {
  getTeams: authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    const teamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
    
    return c.json(formatTeamResponse(TEAM_MESSAGES.RETRIEVED, {
      teams: teamsWithPokemon,
      totalCount: teamsWithPokemon.length
    }));
  }),

  createTeam: authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    
    console.log('📝 Données reçues pour création équipe:', body);
    console.log('👤 Utilisateur:', user);
    
    try {
      const data = createTeamRequestSchema.parse(body);
      console.log('✅ Données validées:', data);
      
      const team = await TeamService.createTeam(data, user.id);
      console.log('✅ Équipe créée:', team);
      
      return c.json(formatTeamResponse(TEAM_MESSAGES.CREATED, { team }));
    } catch (error) {
      console.error('❌ Erreur création équipe:', error);
      throw error;
    }
  }),

  deleteTeam: withTeamOwnership(async (c: Context, team: any) => {
    const teamId = team.id;
    await Delete(Team, eq(Team.id, teamId));
    
    return c.json(formatTeamResponse(TEAM_MESSAGES.DELETED, { teamId }));
  }),

  addPokemonToTeam: authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    const body = await c.req.json();
    const teamId = Number(c.req.param('teamId'));
    
    if (!validateId(teamId)) {
      throw new ValidationError('ID d\'équipe invalide');
    }
    
    const data = addPokemonToTeamRequestSchema.parse({
      teamId,
      pokemonId: body.pokemonId
    });

    const result = await PokemonTeamService.addPokemonToTeam(
      data.teamId, 
      data.pokemonId, 
      user.id
    );
    
    return c.json(formatTeamResponse(TEAM_MESSAGES.POKEMON_ADDED, { 
      pokemon: result,
      teamId: data.teamId 
    }));
  }),

  removePokemonFromTeam: withTeamOwnership(async (c: Context, team: any) => {
    const pokemonId = Number(c.req.param('pokemonId'));
    
    if (!validateId(pokemonId)) {
      throw new ValidationError('ID de Pokémon invalide');
    }

    await Delete(pokemon, and(
      eq(pokemon.team_id, team.id), 
      eq(pokemon.id, pokemonId)
    )!);
    
    return c.json(formatTeamResponse(TEAM_MESSAGES.POKEMON_REMOVED, { 
      pokemonId,
      teamId: team.id 
    }));
  }),

  getTeamById: authAsyncHandler(async (c: Context) => {
    const user = c.get('user');
    const teamId = Number(c.req.param('id'));
    
    if (!validateId(teamId)) {
      throw new ValidationError('ID d\'équipe invalide');
    }
    
    const team = await validateTeamOwnership(teamId, user.id);
    const teamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
    const teamWithPokemon = teamsWithPokemon.find((t: any) => t.id === teamId);
    
    return c.json(formatTeamResponse('Team retrieved successfully', { 
      team: teamWithPokemon 
    }));
  })
};

