import type { Context } from "hono";
import { TeamBattleService, TurnBasedBattleService } from "../services/services.js";
import { mapBattleResultToApi, mapBattleErrorToApi } from '../mapper/battle.mapper.js';
import { Team } from "../models/interfaces/team.interface.js";
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError } from '../models/errors.js';
import { WeatherDetectionService } from '../services/weatherService/weatherDetectionService.js';
import { 
  teamBattleRequestSchema as teamBattleSchema, 
  turnBasedBattleRequestSchema as turnBasedBattleSchema 
} from '../schemas/index.js';
import { zValidator } from '@hono/zod-validator';
import { formatResponse, BATTLE_MESSAGES, validateCoordinates } from '@pokemon-battle/shared';

// ✅ TYPES
interface BattleHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

type BattleMode = 'init' | 'turn' | 'full';

// ✅ HELPERS
const validateTeams = (team1: any, team2: any) => {
  if (!team1?.pokemon || team1.pokemon.length === 0) {
    throw new ValidationError('L\'équipe 1 doit avoir au moins un Pokémon');
  }
  
  if (!team2?.pokemon || team2.pokemon.length === 0) {
    throw new ValidationError('L\'équipe 2 doit avoir au moins un Pokémon');
  }
};

const validateBattleCoordinates = (lat?: number, lon?: number) => {
  if (lat !== undefined && lon !== undefined) {
    if (!validateCoordinates(lat, lon)) {
      throw new ValidationError('Coordonnées géographiques invalides');
    }
  }
};

const getWeatherEffects = async (lat?: number, lon?: number) => {
  if (lat !== undefined && lon !== undefined) {
    return await WeatherDetectionService.detectWeatherEffects(lat, lon);
  }
  
  // Effets par défaut si pas de coordonnées
  return {
    weatherEffects: null,
    timeBonus: 1.0
  };
};

const formatBattleLog = (battleLog: any[]) => {
  return battleLog?.map(action => ({
    turn: action.turn,
    attacker: action.attacker.name_fr,
    move: action.move.name,
    moveType: action.move.type,
    damage: action.damage,
    description: action.description,
    isCritical: action.isCritical,
    typeEffectiveness: action.typeEffectiveness,
    stab: action.stab
  })) || [];
};

const executeTurnBasedBattle = async (
  team1: any, 
  team2: any, 
  weatherEffects: any, 
  timeBonus: any, 
  mode: BattleMode
) => {
  switch (mode) {
    case 'init':
      return TurnBasedBattleService.initializeBattle(team1, team2, weatherEffects, timeBonus);
    
    case 'turn':
      return await TurnBasedBattleService.simulateFullBattle(
        team1, 
        team2, 
        weatherEffects, 
        timeBonus, 
        1 // Limiter à 1 tour
      );
    
    case 'full':
    default:
      return await TurnBasedBattleService.simulateFullBattle(team1, team2, weatherEffects, timeBonus);
  }
};

const formatBattleResponse = (message: string, data?: any) => {
  return formatResponse(message, data);
};

// ✅ VALIDATORS GROUPÉS
export const battleValidators = {
  teamBattle: zValidator('json', teamBattleSchema),
  turnBasedBattle: zValidator('json', turnBasedBattleSchema)
};

// ✅ HANDLERS GROUPÉS
export const battleHandlers: BattleHandler = {
  simulateTeamBattle: asyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { team1, team2, lat, lon } = teamBattleSchema.parse(body);
    
    // Validations
    validateTeams(team1, team2);
    validateBattleCoordinates(lat, lon);
    
    // Récupérer les effets météo
    const { weatherEffects, timeBonus } = await getWeatherEffects(lat, lon);

    // Simuler le combat d'équipe
    const battleResult = await TeamBattleService.simulateTeamBattle(
      team1 as unknown as Team,
      team2 as unknown as Team,
      weatherEffects,
      timeBonus
    );
    
    return c.json(formatBattleResponse(BATTLE_MESSAGES.BATTLE_FINISHED, {
      battle: mapBattleResultToApi(battleResult),
      weatherEffects,
      timeBonus
    }));
  }),

  simulateTurnBasedBattle: asyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { team1, team2, lat, lon, mode = 'full' } = turnBasedBattleSchema.parse(body);
    
    // Validations
    validateTeams(team1, team2);
    validateBattleCoordinates(lat, lon);
    
    // Récupérer les effets météo
    const { weatherEffects, timeBonus } = await getWeatherEffects(lat, lon);
    
    // Exécuter le combat selon le mode
    const result = await executeTurnBasedBattle(team1, team2, weatherEffects, timeBonus, mode as BattleMode);
    
    const message = mode === 'init' ? BATTLE_MESSAGES.INITIALIZED : 
                   mode === 'turn' ? BATTLE_MESSAGES.MOVE_EXECUTED : 
                   BATTLE_MESSAGES.BATTLE_FINISHED;
    
    return c.json(formatBattleResponse(message, {
      battleState: result,
      combatLog: formatBattleLog(result.battleLog),
      mode,
      weatherEffects,
      timeBonus
    }));
  }),

  getBattleStatus: asyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    
    if (!battleId) {
      throw new ValidationError('ID de combat requis');
    }
    
    // TODO: Implémenter la récupération du statut de combat
    // Pour l'instant, retourner un placeholder
    return c.json(formatBattleResponse('Battle status retrieved', {
      battleId,
      status: 'active',
      message: 'Battle status feature coming soon'
    }));
  }),

  forfeitBattle: asyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    const body = await c.req.json();
    const { playerId } = body;
    
    if (!battleId || !playerId) {
      throw new ValidationError('ID de combat et ID de joueur requis');
    }
    
    // TODO: Implémenter la logique d'abandon
    return c.json(formatBattleResponse(BATTLE_MESSAGES.BATTLE_FORFEITED, {
      battleId,
      playerId,
      message: 'Forfeit feature coming soon'
    }));
  }),

  getBattleHistory: asyncHandler(async (c: Context) => {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '10');
    
    // TODO: Implémenter l'historique des combats
    return c.json(formatBattleResponse('Battle history retrieved', {
      battles: [],
      totalCount: 0,
      limit,
      message: 'Battle history feature coming soon'
    }));
  })
};