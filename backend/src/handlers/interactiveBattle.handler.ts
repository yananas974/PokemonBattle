import type { Context } from 'hono';
import { InteractiveBattleService } from '../services/battle/interactiveBattleService.js';
import { getUserById } from '../services/services.js';
import { PokemonTeamService } from '../services/pokemonTeamService/pokemonTeamService.js';
import { authAsyncHandler, asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../models/errors.js';
import { WeatherDetectionService } from '../services/weatherService/weatherDetectionService.js';
import { 
  initBattleSchema,
  playerMoveSchema,
  executePlayerMoveSchema
} from '../schemas/index.js';
import { zValidator } from '@hono/zod-validator';
import { formatResponse, BATTLE_MESSAGES, validateId } from '@pokemon-battle/shared';
import jwt from 'jsonwebtoken';

// ✅ TYPES
interface InteractiveBattleHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

interface BattleResponseData {
  battleId: string;
  playerPokemon: any;
  enemyPokemon: any;
  currentTurn: string;
  battleLog: string[];
  weather: any;
  isFinished: boolean;
  winner: string | null;
  turnCount: number;
  hackChallenge?: any;
  isHackActive: boolean;
}

// ✅ HELPERS
const authenticateUser = async (c: Context, token?: string) => {
  if (token) {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      throw new UnauthorizedError('Invalid token');
    }
    c.set('user', user);
  }
  
  const user = c.get('user');
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }
  
  return user;
};

const validateTeamsExist = (playerTeam: any, enemyTeam: any, playerTeamId: number, enemyTeamId: number) => {
  if (!playerTeam) {
    throw new NotFoundError(`Équipe joueur ${playerTeamId} introuvable`);
  }
  
  if (!enemyTeam) {
    throw new NotFoundError(`Équipe ennemie ${enemyTeamId} introuvable`);
  }
  
  if (!playerTeam.pokemon || playerTeam.pokemon.length === 0) {
    throw new ValidationError('L\'équipe du joueur ne contient aucun Pokémon');
  }
  
  if (!enemyTeam.pokemon || enemyTeam.pokemon.length === 0) {
    throw new ValidationError('L\'équipe ennemie ne contient aucun Pokémon');
  }
};

const prepareBattleTeam = (team: any) => ({
  teamName: team.teamName,
  pokemon: team.pokemon.map((p: any) => ({
    pokemon_id: p.pokemon_id,
    name_fr: p.name,
    type: p.type,
    level: p.level,
    base_hp: p.hp,
    current_hp: p.hp,
    max_hp: p.hp,
    base_attack: p.attack,
    base_defense: p.defense,
    base_speed: p.speed,
    sprite_url: p.sprite_url,
    sprite_back_url: p.sprite_url.replace('front', 'back'),
    moves: []
  }))
});

const formatBattleState = (battleState: any): BattleResponseData => ({
  battleId: battleState.battleId,
  playerPokemon: battleState.currentTeam1Pokemon ? {
    ...battleState.currentTeam1Pokemon,
    currentHp: battleState.currentTeam1Pokemon.current_hp ?? 100,
    maxHp: battleState.currentTeam1Pokemon.max_hp ?? battleState.currentTeam1Pokemon.base_hp ?? 100,
    moves: battleState.availableMoves
  } : null,
  enemyPokemon: battleState.currentTeam2Pokemon ? {
    ...battleState.currentTeam2Pokemon,
    currentHp: battleState.currentTeam2Pokemon.current_hp ?? 100,
    maxHp: battleState.currentTeam2Pokemon.max_hp ?? battleState.currentTeam2Pokemon.base_hp ?? 100,
  } : null,
  currentTurn: battleState.isHackActive ? 'hack' : (battleState.isPlayerTurn ? 'player' : 'enemy'),
  battleLog: battleState.battleLog || [],
  weather: battleState.weatherEffects,
  isFinished: !!battleState.winner,
  winner: battleState.winner === 'team1' ? 'player' : 
         battleState.winner === 'team2' ? 'enemy' : 
         battleState.winner,
  turnCount: battleState.turn || 1,
  hackChallenge: battleState.hackChallenge || null,
  isHackActive: battleState.isHackActive || false
});

const extractTokenFromRequest = async (c: Context) => {
  let token;
  
  // Essayer d'abord le body
  try {
    const body = await c.req.json();
    token = body.token;
  } catch {
    // Si pas de body JSON, continuer
  }
  
  // Puis l'header Authorization
  if (!token) {
    const authHeader = c.req.header('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }
  
  return token;
};

const formatInteractiveBattleResponse = (message: string, data?: any) => {
  return formatResponse(message, data);
};

// ✅ VALIDATORS GROUPÉS
export const interactiveBattleValidators = {
  initBattle: zValidator('json', initBattleSchema),
  playerMove: zValidator('json', playerMoveSchema),
  executeMove: zValidator('json', executePlayerMoveSchema)
};

// ✅ HANDLERS GROUPÉS
export const interactiveBattleHandlers: InteractiveBattleHandler = {
  initBattle: asyncHandler(async (c: Context) => {
    console.log('🎮 === HANDLER COMBAT INTERACTIF ===');
    
    const body = await c.req.json();
    const { playerTeamId, enemyTeamId, token, lat, lon } = initBattleSchema.parse(body);
    
    // Authentification
    const user = await authenticateUser(c, token);
    
    // Récupérer les équipes
    const allTeamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
    const playerTeam = allTeamsWithPokemon.find(t => t.id === playerTeamId);
    const enemyTeam = allTeamsWithPokemon.find(t => t.id === enemyTeamId);
    
    // Validations
    validateTeamsExist(playerTeam, enemyTeam, playerTeamId, enemyTeamId);
    
    // Préparer les équipes
    const team1 = prepareBattleTeam(playerTeam);
    const team2 = prepareBattleTeam(enemyTeam);
    
    // Récupérer les effets météo
    const { weatherEffects, timeBonus } = await WeatherDetectionService.detectWeatherEffects(lat, lon);
    
    // Initialiser le combat
    const battleState = await InteractiveBattleService.initializeInteractiveBattle(
      team1,
      team2,
      weatherEffects,
      timeBonus,
      user.id
    );
    
    return c.json(formatInteractiveBattleResponse(BATTLE_MESSAGES.INITIALIZED, {
      battle: formatBattleState(battleState)
    }));
  }),

  executePlayerMove: asyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { battleId, moveIndex, token } = body;
    
    // Authentification
    const user = await authenticateUser(c, token);
    
    // Validation
    const { battleId: validatedBattleId, moveIndex: validatedMoveIndex } = playerMoveSchema.parse({ battleId, moveIndex });
    
    // Exécuter le mouvement
    const battleState = await InteractiveBattleService.executePlayerMove({
      battleId: validatedBattleId,
      moveIndex: validatedMoveIndex,
      userId: user.id
    });
    
    return c.json(formatInteractiveBattleResponse(BATTLE_MESSAGES.MOVE_EXECUTED, {
      battle: formatBattleState(battleState)
    }));
  }),

  getBattleState: authAsyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    
    if (!battleId) {
      throw new ValidationError('ID de combat requis');
    }
    
    const battleState = InteractiveBattleService.getBattleState(battleId);
    
    if (!battleState) {
      throw new NotFoundError('Combat non trouvé');
    }
    
    return c.json(formatInteractiveBattleResponse('Battle state retrieved', {
      battleState: {
        battleId: battleState.battleId,
        turn: battleState.turn,
        phase: battleState.phase,
        winner: battleState.winner,
        isPlayerTurn: battleState.isPlayerTurn,
        waitingForPlayerMove: battleState.waitingForPlayerMove,
        currentPlayerPokemon: battleState.currentTeam1Pokemon,
        currentEnemyPokemon: battleState.currentTeam2Pokemon,
        availableMoves: battleState.availableMoves,
        battleLog: battleState.battleLog,
        weatherEffects: battleState.weatherEffects
      }
    }));
  }),

  forfeitBattle: asyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    
    if (!battleId) {
      throw new ValidationError('ID de combat requis');
    }
    
    // Récupérer le token depuis différentes sources
    const token = await extractTokenFromRequest(c);
    
    // Authentification
    const user = await authenticateUser(c, token);
    
    // Abandonner le combat
    const success = InteractiveBattleService.forfeitBattle(battleId, user.id);
    
    if (!success) {
      throw new NotFoundError('Combat non trouvé');
    }
    
    return c.json(formatInteractiveBattleResponse(BATTLE_MESSAGES.BATTLE_FORFEITED, {
      battleId
    }));
  }),

  solveHackChallenge: asyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { battleId, answer, token } = body;
    
    // Authentification
    const user = await authenticateUser(c, token);
    
    // Résoudre le challenge
    const result = await InteractiveBattleService.solveHackChallenge(battleId, answer);
    
    if (result.battleState) {
      return c.json({
        ...result,
        battle: formatBattleState(result.battleState)
      });
    }
    
    return c.json(result);
  })
};

 