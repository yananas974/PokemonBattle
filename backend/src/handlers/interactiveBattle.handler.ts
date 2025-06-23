import type { Context } from 'hono';
import { InteractiveBattleService } from '../services/battle/interactiveBattleService.js';
import { getUserById } from '../services/services.js';
import { PokemonTeamService } from '../services/pokemonTeamService/pokemonTeamService.js';
import { authAsyncHandler, asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError, UnauthorizedError } from '../models/errors.js';
import { WeatherDetectionService } from '../services/weatherService/weatherDetectionService.js';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const initBattleSchema = z.object({
  playerTeamId: z.number(),
  enemyTeamId: z.number(),
  token: z.string().optional(),
  lat: z.number().optional().default(48.8566),
  lon: z.number().optional().default(2.3522)
});

const playerMoveSchema = z.object({
  battleId: z.string(),
  moveIndex: z.number().min(0).max(3)
});

// ✅ CORRIGÉ : Plus de try/catch manuel
export const initInteractiveBattleHandler = asyncHandler(async (c: Context) => {
  console.log('🎮 === HANDLER COMBAT INTERACTIF ===');
  
  const body = await c.req.json();
  const { playerTeamId, enemyTeamId, token, lat, lon } = initBattleSchema.parse(body);
  
  // Authentification par token
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
  
  // Récupérer les équipes
  const allTeamsWithPokemon = await PokemonTeamService.getTeamsWithPokemon(user.id);
  
  const playerTeam = allTeamsWithPokemon.find(t => t.id === playerTeamId);
  const enemyTeam = allTeamsWithPokemon.find(t => t.id === enemyTeamId);
  
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
  
  // Préparer les équipes
  const team1 = {
    teamName: playerTeam.teamName,
    pokemon: playerTeam.pokemon.map(p => ({
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
  };
  
  const team2 = {
    teamName: enemyTeam.teamName,
    pokemon: enemyTeam.pokemon.map(p => ({
      pokemon_id: p.pokemon_id,
      name_fr: p.name,
      type: p.type,
      level: p.level,
      hp: p.hp,
      maxHp: p.hp,
      currentHp: p.hp,
      attack: p.attack,
      defense: p.defense,
      speed: p.speed,
      sprite_url: p.sprite_url,
      sprite_back_url: p.sprite_url.replace('front', 'back'),
      moves: []
    }))
  };
  
  // ✅ Utiliser le service centralisé
  const { weatherEffects, timeBonus } = await WeatherDetectionService.detectWeatherEffects(lat, lon);
  
  const battleState = await InteractiveBattleService.initializeInteractiveBattle(
    team1,
    team2,
    weatherEffects,
    timeBonus,
    user.id
  );
  
  return c.json({
    success: true,
    message: 'Combat interactif initialisé',
    battle: {
      battleId: battleState.battleId,
      playerPokemon: battleState.currentTeam1Pokemon ? {
        ...battleState.currentTeam1Pokemon,
        currentHp: battleState.currentTeam1Pokemon.current_hp ?? 100,
        maxHp: battleState.currentTeam1Pokemon.base_hp ?? 100,
        moves: battleState.availableMoves
      } : null,
      enemyPokemon: battleState.currentTeam2Pokemon ? {
        ...battleState.currentTeam2Pokemon,
        currentHp: battleState.currentTeam2Pokemon.current_hp ?? 100,
        maxHp: battleState.currentTeam2Pokemon.base_hp ?? 100,
      } : null,
      currentTurn: battleState.isPlayerTurn ? 'player' : 'enemy',
      battleLog: battleState.battleLog || ['Combat commencé !'],
      weather: weatherEffects,
      isFinished: !!battleState.winner,
      winner: battleState.winner,
      turnCount: battleState.turn || 1
    }
  });
});

// ✅ CORRIGÉ : Plus de try/catch manuel
export const executePlayerMoveHandler = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  const { battleId, moveIndex, token } = body;
  
  // Authentification manuelle
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

  const { battleId: validatedBattleId, moveIndex: validatedMoveIndex } = playerMoveSchema.parse({ battleId, moveIndex });
  
  const battleState = await InteractiveBattleService.executePlayerMove({
    battleId: validatedBattleId,
    moveIndex: validatedMoveIndex,
    userId: user.id
  });
  
  return c.json({
    success: true,
    message: 'Attaque exécutée',
    battle: battleState
  });
});

export const getBattleStateHandler = authAsyncHandler(async (c: Context) => {
  const battleId = c.req.param('battleId');
  
  if (!battleId) {
    throw new ValidationError('ID de combat requis');
  }
  
  const battleState = InteractiveBattleService.getBattleState(battleId);
  
  if (!battleState) {
    throw new NotFoundError('Combat non trouvé');
  }
  
  return c.json({
    success: true,
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
  });
});

// ✅ CORRIGÉ : Plus de try/catch manuel  
export const forfeitBattleHandler = asyncHandler(async (c: Context) => {
  const battleId = c.req.param('battleId');
  
  // Récupérer le token
  let token;
  const body = await c.req.json().catch(() => ({}));
  token = body.token;
  
  if (!token) {
    const authHeader = c.req.header('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }
  
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
  
  if (!battleId) {
    throw new ValidationError('ID de combat requis');
  }
  
  const success = InteractiveBattleService.forfeitBattle(battleId, user.id);
  
  if (!success) {
    throw new NotFoundError('Combat non trouvé');
  }
  
  return c.json({
    success: true,
    message: 'Combat abandonné'
  });
}); 