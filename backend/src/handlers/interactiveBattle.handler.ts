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

// ✅ HELPERS - Fonction d'authentification simplifiée (l'auth est gérée par le middleware)
const getAuthenticatedUser = (c: Context) => {
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
    pokemon_id: p.pokemon_reference_id, // Use reference ID for moves lookup
    name_fr: p.name_fr,
    type: p.type,
    level: p.level || 50,
    base_hp: p.base_hp,
    current_hp: p.base_hp,
    max_hp: p.base_hp,
    base_attack: p.base_attack,
    base_defense: p.base_defense,
    base_speed: p.base_speed,
    sprite_url: p.sprite_url,
    sprite_back_url: p.back_sprite_url || p.sprite_url,
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
  weather: battleState.weatherData || battleState.weatherEffects,
  isFinished: !!battleState.winner,
  winner: battleState.winner === 'team1' ? 'player' : 
         battleState.winner === 'team2' ? 'enemy' : 
         battleState.winner,
  turnCount: battleState.turn || 1,
  hackChallenge: battleState.hackChallenge || null,
  isHackActive: battleState.isHackActive || false
});

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
  initBattle: authAsyncHandler(async (c: Context) => {
    console.log('🎮 === HANDLER COMBAT INTERACTIF ===');
    
    const body = await c.req.json();
    const { playerTeamId, enemyTeamId, lat = 48.8566, lon = 2.3522 } = initBattleSchema.parse(body);
    
    // Authentification - L'utilisateur est déjà authentifié par le middleware
    const user = getAuthenticatedUser(c);
    
    // Récupérer les équipes
    const allTeamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
    const playerTeam = allTeamsWithPokemon.find((t: any) => t.id === playerTeamId);
    const enemyTeam = allTeamsWithPokemon.find((t: any) => t.id === enemyTeamId);
    
    // Validations
    validateTeamsExist(playerTeam, enemyTeam, playerTeamId, enemyTeamId);
    
    // Préparer les équipes
    const team1 = prepareBattleTeam(playerTeam);
    const team2 = prepareBattleTeam(enemyTeam);
    
    // Récupérer les effets météo
    const { weatherEffects, timeBonus, weatherData } = await WeatherDetectionService.detectWeatherEffects(lat, lon);
    
    // Initialiser le combat
    const battleState = await InteractiveBattleService.initializeInteractiveBattle(
      team1,
      team2,
      weatherEffects,
      timeBonus,
      user.id,
      weatherData
    );
    
    return c.json(formatInteractiveBattleResponse(BATTLE_MESSAGES.INITIALIZED, {
      battle: formatBattleState(battleState)
    }));
  }),

  executePlayerMove: authAsyncHandler(async (c: Context) => {
    console.log('🎯 === HANDLER EXECUTE PLAYER MOVE APPELÉ ===');
    
    const body = await c.req.json();
    const { battleId, moveIndex } = body;
    
    console.log('📦 Données reçues:', { battleId, moveIndex });
    
    // Authentification - L'utilisateur est déjà authentifié par le middleware
    const user = getAuthenticatedUser(c);
    console.log('👤 Utilisateur authentifié:', user.id);
    
    // Validation
    const { battleId: validatedBattleId, moveIndex: validatedMoveIndex } = playerMoveSchema.parse({ battleId, moveIndex });
    console.log('✅ Données validées:', { validatedBattleId, validatedMoveIndex });
    
    // Exécuter le mouvement
    console.log('⚔️ Exécution du mouvement...');
    const battleState = await InteractiveBattleService.executePlayerMove({
      battleId: validatedBattleId,
      moveIndex: validatedMoveIndex,
      userId: user.id
    });
    
    console.log('🎮 État de combat retourné:', {
      battleId: battleState.battleId,
      turn: battleState.turn,
      isPlayerTurn: battleState.isPlayerTurn,
      currentTurn: battleState.isHackActive ? 'hack' : (battleState.isPlayerTurn ? 'player' : 'enemy')
    });
    
    const formattedResponse = formatInteractiveBattleResponse(BATTLE_MESSAGES.MOVE_EXECUTED, {
      battle: formatBattleState(battleState)
    });
    
    console.log('📤 Réponse formatée:', formattedResponse);
    
    return c.json(formattedResponse);
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
      battle: formatBattleState(battleState)
    }));
  }),

  // ✅ NOUVEAU : Route pour récupérer l'état via /state/{battleId}
  getBattleStateByPath: authAsyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    
    if (!battleId) {
      throw new ValidationError('ID de combat requis');
    }
    
    const battleState = InteractiveBattleService.getBattleState(battleId);
    
    if (!battleState) {
      throw new NotFoundError('Combat non trouvé');
    }
    
    return c.json(formatInteractiveBattleResponse('Battle state retrieved', {
      battle: formatBattleState(battleState)
    }));
  }),

  forfeitBattle: authAsyncHandler(async (c: Context) => {
    const battleId = c.req.param('battleId');
    
    if (!battleId) {
      throw new ValidationError('ID de combat requis');
    }
    
    // Authentification - L'utilisateur est déjà authentifié par le middleware
    const user = getAuthenticatedUser(c);
    
    // Abandonner le combat
    const success = InteractiveBattleService.forfeitBattle(battleId, user.id);
    
    if (!success) {
      throw new NotFoundError('Combat non trouvé');
    }
    
    return c.json(formatInteractiveBattleResponse(BATTLE_MESSAGES.BATTLE_FORFEITED, {
      battleId
    }));
  }),

  solveHackChallenge: authAsyncHandler(async (c: Context) => {
    const body = await c.req.json();
    const { battleId, answer } = body;
    
    console.log('🧩 Handler solveHackChallenge:', { battleId, answer });
    
    // Authentification - L'utilisateur est déjà authentifié par le middleware
    const user = getAuthenticatedUser(c);
    
    // Résoudre le challenge
    const result = await InteractiveBattleService.solveHackChallenge(battleId, answer);
    
    console.log('🎯 Résultat du service:', result);
    
    // Formater la réponse de manière cohérente
    if (result.battleState) {
      const response = {
        success: result.success,
        message: result.message,
        battle: formatBattleState(result.battleState)
      };
      
      console.log('📤 Réponse formatée:', response);
      return c.json(response);
    }
    
    console.log('📤 Réponse directe:', result);
    return c.json(result);
  })
};

 