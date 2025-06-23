import type { Context } from "hono";
import { TeamBattleService, TurnBasedBattleService } from "../services/services.js";
import { mapBattleResultToApi, mapBattleErrorToApi } from '../mapper/battle.mapper.js';
import { Team } from "../models/interfaces/battle.interface.js";
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError } from '../models/errors.js';
import { WeatherDetectionService } from '../services/weatherService/weatherDetectionService.js';

// ✅ Schémas Zod centralisés
const pokemonSchema = z.object({
  pokemon_id: z.number().min(1, "Pokemon ID must be positive"),
  name_fr: z.string().min(1, "Pokemon name is required"),
  type: z.string().min(1, "Pokemon type is required"),
  hp: z.number().min(1, "HP must be positive"),
  attack: z.number().min(1, "Attack must be positive"),
  defense: z.number().min(1, "Defense must be positive"),
  speed: z.number().min(1, "Speed must be positive"),
  sprite_url: z.string().optional()
});

const teamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: z.string().min(1, "Team name is required"),
  pokemon: z.array(pokemonSchema).min(1, "Team must have at least one Pokemon")
});

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522)
});

const teamBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  ...coordinatesSchema.shape
});

const turnBasedBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  mode: z.enum(['init', 'turn', 'full']).optional().default('full'),
  ...coordinatesSchema.shape
});

// ✅ CORRIGÉ : Plus de try/catch manuel
export const simulateTeamBattleHandler = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  const { team1, team2, lat, lon } = teamBattleSchema.parse(body);
  
  if (!team1.pokemon || team1.pokemon.length === 0) {
    throw new ValidationError('L\'équipe 1 doit avoir au moins un Pokémon');
  }
  
  if (!team2.pokemon || team2.pokemon.length === 0) {
    throw new ValidationError('L\'équipe 2 doit avoir au moins un Pokémon');
  }

  console.log(`⚔️ Combat simulé entre "${team1.teamName}" VS "${team2.teamName}"`);
  
  // ✅ Utiliser le service centralisé
  const { weatherEffects, timeBonus } = await WeatherDetectionService.detectWeatherEffects(lat, lon);

  const battleResult = await TeamBattleService.simulateTeamBattle(
    team1 as Team,
    team2 as Team,
    weatherEffects,
    timeBonus
  );
  
  console.log(`🏆 Résultat: ${battleResult.winner}`);
  
  return c.json(mapBattleResultToApi(battleResult));
});

// ✅ CORRIGÉ : Plus de try/catch manuel
export const simulateTurnBasedBattleHandler = asyncHandler(async (c: Context) => {
  const body = await c.req.json();
  const { team1, team2, lat, lon, mode = 'full' } = turnBasedBattleSchema.parse(body);
  
  if (!team1 || !team2) {
    throw new ValidationError('Deux équipes sont requises');
  }
  
  console.log(`🎮 Combat tour par tour: "${team1.teamName}" VS "${team2.teamName}"`);

  // ✅ Utiliser le service centralisé
  const { weatherEffects, timeBonus } = await WeatherDetectionService.detectWeatherEffects(lat, lon);
  
  let result;
  
  if (mode === 'init') {
    result = TurnBasedBattleService.initializeBattle(team1, team2, weatherEffects, timeBonus);
  } else if (mode === 'turn') {
    result = await TurnBasedBattleService.simulateFullBattle(
      team1, 
      team2, 
      weatherEffects, 
      timeBonus, 
      1 // Limiter à 1 tour
    );
  } else {
    result = await TurnBasedBattleService.simulateFullBattle(team1, team2, weatherEffects, timeBonus);
  }
  
  console.log(`🏆 Résultat tour par tour: ${result.winner} en ${result.turn} tours`);

  return c.json({
    success: true,
    battleState: result,
    combatLog: result.battleLog?.map(action => ({
      turn: action.turn,
      attacker: action.attacker.name_fr,
      move: action.move.name,
      moveType: action.move.type,
      damage: action.damage,
      description: action.description,
      isCritical: action.isCritical,
      typeEffectiveness: action.typeEffectiveness,
      stab: action.stab
    })) || []
  });
});

// // Pour les combats en temps réel
// export const streamBattleHandler = async (c: Context) => {
//   c.header('Content-Type', 'text/event-stream');
//   c.header('Cache-Control', 'no-cache');
//   c.header('Connection', 'keep-alive');
  
//   return c.stream(async (stream) => {
//     await stream.write(new TextEncoder().encode('data: Combat commencé\n\n'));
//     await stream.write(new TextEncoder().encode('data: Tour 1 terminé\n\n'));
//   });
// };