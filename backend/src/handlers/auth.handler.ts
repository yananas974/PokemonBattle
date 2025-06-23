import { hashPassword, generateToken, cookieOptions, comparePassword } from '../utils/auth/auth.utils.js'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { createUser, getUserByEmail, getAllUsers } from '../services/services.js';
import type { Context } from 'hono';
import { mapCreateUserToDb, mapUserToApi, mapUsersToApi } from '../mapper/user.mapper.js';
import { User } from '../models/interfaces/interfaces.js';
import { emailSchema, passwordSchema, usernameSchema } from '../schemas/common.schemas.js'; 
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../models/errors.js';
import { TeamBattleService, TurnBasedBattleService, WeatherEffectService } from "../services/services.js";
import { mapBattleResultToApi, mapBattleErrorToApi } from '../mapper/battle.mapper.js';
import { Team } from "../models/interfaces/battle.interface.js";

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
});

// ✅ Validators middleware
export const signupValidator = zValidator('json', signupSchema);
export const loginValidator = zValidator('json', loginSchema);

// ✅ Handlers refactorisés sans try/catch
export const signupHandler = asyncHandler(async (c: Context) => {
  const { email, password, username } = await c.req.json();
  
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Un utilisateur avec cet email existe déjà');
  }
  
  const hashedPassword = await hashPassword(password);
  console.log('Attempting to create user:', { email, username });
  
  const user = await createUser(mapCreateUserToDb({ 
    email, 
    username, 
    password_hash: hashedPassword 
  })) as User;
  
  const token = await generateToken(String(user.id));
  setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
  
  return c.json({
    success: true,
    message: 'User created successfully',
    user: mapUserToApi(user)
  });
});

export const loginHandler = asyncHandler(async (c: Context) => {
  const { email, password } = await c.req.json();
  
  const user = await getUserByEmail(email) as User;
  if (!user) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  const token = await generateToken(String(user.id));
  setCookie(c, 'authToken', token, cookieOptions as CookieOptions);

  return c.json({
    success: true,
    message: 'Login successful',
    user: mapUserToApi(user),
    token: token
  });
});

export const logoutHandler = asyncHandler(async (c: Context) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
}); 

export const getUsersHandler = asyncHandler(async (c: Context) => {
  const users = await getAllUsers();
  
  return c.json({
    success: true,
    message: 'Users retrieved successfully',
    users: mapUsersToApi(users)
  });
});

// ✅ Schémas Zod
const teamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: z.string().min(1, "Team name is required"),
  pokemon: z.array(z.object({
    pokemon_id: z.number().min(1, "Pokemon ID must be positive"),
    name_fr: z.string().min(1, "Pokemon name is required"),
    type: z.string().min(1, "Pokemon type is required"),
    hp: z.number().min(1, "HP must be positive"),
    attack: z.number().min(1, "Attack must be positive"),
    defense: z.number().min(1, "Defense must be positive"),
    speed: z.number().min(1, "Speed must be positive"),
    sprite_url: z.string().optional()
  })).min(1, "Team must have at least one Pokemon")
});

const teamBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522)
});

const turnBasedBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522),
  mode: z.enum(['init', 'turn', 'full']).optional().default('full')
});

// ✅ Handlers refactorisés sans try/catch
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
  
  // ✅ Récupérer la météo
  let weatherCondition = 'ClearDay';
  const { WeatherService } = await import('../services/weatherService/weatherService.js');
  const weatherService = new WeatherService();
  const weatherData = await weatherService.getWeatherByCoordinates(lat || 48.8566, lon || 2.3522);
  
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour > 18;
  
  if (weatherData.description.toLowerCase().includes('clear') || weatherData.description.toLowerCase().includes('dégagé')) {
    weatherCondition = isNight ? 'ClearNight' : 'ClearDay';
  } else if (weatherData.description.toLowerCase().includes('rain') || weatherData.description.toLowerCase().includes('pluie')) {
    weatherCondition = 'Rain';
  } else if (weatherData.description.toLowerCase().includes('snow') || weatherData.description.toLowerCase().includes('neige')) {
    weatherCondition = 'Snow';
  } else if (weatherData.description.toLowerCase().includes('storm') || weatherData.description.toLowerCase().includes('orage')) {
    weatherCondition = 'Thunderstorm';
  }
  
  console.log(`🌤️ Condition météo détectée: ${weatherCondition} (${weatherData.description})`);
  
  const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
  const timeBonus = WeatherEffectService.calculateTimeBonus();

  const battleResult = await TeamBattleService.simulateTeamBattle(
    team1 as Team,
    team2 as Team,
    weatherEffects,
    timeBonus
  );
  
  console.log(`🏆 Résultat: ${battleResult.winner}`);
  
  return c.json(mapBattleResultToApi(battleResult));
});

export const simulateTurnBasedBattleHandler = asyncHandler(async (c: Context) => {
  const { team1, team2, lat, lon, mode = 'full' } = await c.req.json();
  
  if (!team1 || !team2) {
    throw new ValidationError('Deux équipes sont requises');
  }
  
  console.log(`🎮 Combat tour par tour: "${team1.teamName}" VS "${team2.teamName}"`);

  // ✅ Récupérer la météo
  let weatherCondition = 'ClearDay';
  const { WeatherService } = await import('../services/weatherService/weatherService.js');
  const weatherService = new WeatherService();
  const weatherData = await weatherService.getWeatherByCoordinates(lat || 48.8566, lon || 2.3522);
  
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour > 18;
  
  if (weatherData.description.toLowerCase().includes('clear') || weatherData.description.toLowerCase().includes('dégagé')) {
    weatherCondition = isNight ? 'ClearNight' : 'ClearDay';
  } else if (weatherData.description.toLowerCase().includes('rain') || weatherData.description.toLowerCase().includes('pluie')) {
    weatherCondition = 'Rain';
  } else if (weatherData.description.toLowerCase().includes('snow') || weatherData.description.toLowerCase().includes('neige')) {
    weatherCondition = 'Snow';
  } else if (weatherData.description.toLowerCase().includes('storm') || weatherData.description.toLowerCase().includes('orage')) {
    weatherCondition = 'Thunderstorm';
  }
  
  console.log(`🌤️ Condition météo combat: ${weatherCondition}`);
  
  const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
  const timeBonus = WeatherEffectService.calculateTimeBonus();
  
  let result;
  
  if (mode === 'init') {
    result = TurnBasedBattleService.initializeBattle(team1, team2, weatherEffects, timeBonus);
  } else if (mode === 'turn') {
    const battleState = await c.req.json();
    result = await TurnBasedBattleService.simulateFullBattle(
      battleState.team1, 
      battleState.team2, 
      weatherEffects, 
      timeBonus, 
      1
    );
  } else {
    result = await TurnBasedBattleService.simulateFullBattle(
      team1, 
      team2, 
      weatherEffects, 
      timeBonus, 
      1
    );
  }
  
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