import { z } from 'zod';

// ✅ SCHÉMAS DE BASE RÉUTILISABLES
export const baseSchemas = {
  // IDs
  positiveId: z.number().min(1, "ID must be positive"),
  stringToId: z.string().transform((val: string) => parseInt(val)).refine((val: number) => !isNaN(val), {
    message: 'ID must be a valid number'
  }),
  
  // Strings
  nonEmptyString: z.string().min(1, "Field cannot be empty"),
  teamName: z.string().min(1, "Team name is required"),
  pokemonType: z.string().min(1, "Pokemon type is required"),
  
  // Auth
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  
  // Coordinates
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180)
  }),
  
  // Pagination
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional()
  })
};

// ✅ VALIDATEURS PAR DOMAINE MÉTIER

// 🔹 AUTH VALIDATIONS
export const authValidators = {
  userId: z.number().min(1, "User ID must be positive"),
  email: baseSchemas.email,
  password: baseSchemas.password,
  login: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password
  }),
  register: z.object({
    email: baseSchemas.email,
    password: baseSchemas.password,
    username: baseSchemas.nonEmptyString
  })
};

// 🔹 POKEMON VALIDATIONS
export const pokemonValidators = {
  pokemonId: baseSchemas.positiveId,
  pokemonIdParam: baseSchemas.stringToId,
  pokemonStats: z.object({
    pokemon_id: baseSchemas.positiveId,
    name_fr: baseSchemas.nonEmptyString,
    type: baseSchemas.pokemonType,
    hp: z.number().min(1, "HP must be positive"),
    attack: z.number().min(1, "Attack must be positive"),
    defense: z.number().min(1, "Defense must be positive"),
    speed: z.number().min(1, "Speed must be positive"),
    sprite_url: z.string().default('')
  }),
  pokemonMove: z.object({
    name: z.string(),
    type: z.string(),
    power: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    pp: z.number().min(0)
  })
};

// 🔹 TEAM VALIDATIONS
export const teamValidators = {
  teamId: baseSchemas.positiveId,
  teamIdParam: baseSchemas.stringToId,
  teamName: baseSchemas.teamName,
  createTeam: z.object({
    teamName: baseSchemas.teamName
  }),
  updateTeam: z.object({
    teamName: baseSchemas.teamName.optional(),
    userId: baseSchemas.positiveId.optional()
  }),
  addPokemonToTeam: z.object({
    teamId: baseSchemas.positiveId,
    pokemonId: baseSchemas.positiveId,
    userId: baseSchemas.positiveId
  }),
  teamSchema: z.object({
    id: z.string().min(1, "Team ID is required"),
    teamName: baseSchemas.teamName,
    pokemon: z.array(pokemonValidators.pokemonStats),
    owner: z.string().optional()
  })
};

// 🔹 FRIENDSHIP VALIDATIONS
export const friendshipValidators = {
  friendshipId: baseSchemas.positiveId,
  friendId: baseSchemas.positiveId,
  userId: baseSchemas.positiveId,
  
  sendFriendRequest: z.object({
    friendId: z.number().min(1, "Friend ID must be positive")
  }),
  
  friendshipAction: z.object({
    friendshipId: z.number().min(1, "Friendship ID must be positive"),
    userId: z.number().min(1, "User ID must be positive")
  }),
  
  updateFriendshipStatus: z.object({
    friendshipId: z.number().min(1, "Friendship ID must be positive"),
    userId: z.number().min(1, "User ID must be positive"),
    status: z.enum(['blocked', 'pending', 'accepted'])
  }),
  
  getFriendTeams: z.object({
    friendId: z.number().min(1, "Friend ID must be positive"),
    userId: z.number().min(1, "User ID must be positive")
  }),
  
  removeFriend: z.object({
    friendshipId: z.number().min(1, "Friendship ID must be positive"),
    userId: z.number().min(1, "User ID must be positive")
  }),
  
  searchUsers: z.object({
    query: z.string().min(0).max(100),
    currentUserId: z.number().min(1)
  })
};

// 🔹 BATTLE VALIDATIONS
export const battleValidators = {
  battleId: z.string().min(1, "Battle ID is required"),
  moveIndex: z.number().min(0, "Move index must be non-negative"),
  
  teamBattle: z.object({
    team1: teamValidators.teamSchema,
    team2: teamValidators.teamSchema,
    lat: baseSchemas.latitude.default(48.8566),
    lon: baseSchemas.longitude.default(2.3522)
  }),
  
  playerMove: z.object({
    battleId: z.string().min(1, "Battle ID is required"),
    moveIndex: z.number().min(0, "Move index must be non-negative")
  }),
  
  initBattle: z.object({
    playerTeamId: baseSchemas.positiveId,
    enemyTeamId: baseSchemas.positiveId,
    token: z.string().optional(),
    lat: baseSchemas.latitude.default(48.8566),
    lon: baseSchemas.longitude.default(2.3522)
  }),
  
  simulateBattleWithWeather: z.object({
    attacker: pokemonValidators.pokemonStats,
    defender: pokemonValidators.pokemonStats,
    lat: baseSchemas.latitude.default(48.8566),
    lon: baseSchemas.longitude.default(2.3522)
  })
};

// 🔹 WEATHER VALIDATIONS
export const weatherValidators = {
  coordinates: baseSchemas.coordinates,
  weatherQuery: z.object({
    lat: z.number().min(-90).max(90).optional().default(48.8566),
    lon: z.number().min(-180).max(180).optional().default(2.3522)
  })
};

// 🔹 HACK CHALLENGE VALIDATIONS
export const hackValidators = {
  challengeId: z.string().min(1, "Challenge ID is required"),
  answer: z.string().min(1, "Answer is required"),
  
  submitAnswer: z.object({
    challengeId: z.string().min(1, "Challenge ID is required"),
    answer: z.string().min(1, "Answer is required")
  }),
  
  triggerChallenge: z.object({
    difficulty: z.string().optional(),
    userId: z.number().optional()
  }),
  
  challengeResponse: z.object({
    id: z.string().min(1, "Challenge ID is required"),
    encrypted_code: z.string(),
    algorithm: z.string(),
    difficulty: z.string(),
    explanation: z.string(),
    time_limit: z.number().min(1),
    message: z.string()
  })
};

// ✅ SERVICE DE VALIDATION CENTRALISÉ
export class ValidationService {
  
  // 🔹 AUTH
  static validateUserId(userId: number): number {
    return authValidators.userId.parse(userId);
  }
  
  static validateLogin(data: unknown) {
    return authValidators.login.parse(data);
  }
  
  static validateRegister(data: unknown) {
    return authValidators.register.parse(data);
  }
  
  // 🔹 POKEMON
  static validatePokemonId(pokemonId: number): number {
    return pokemonValidators.pokemonId.parse(pokemonId);
  }
  
  static validatePokemonStats(data: unknown) {
    return pokemonValidators.pokemonStats.parse(data);
  }
  
  // 🔹 TEAM
  static validateTeamId(teamId: number): number {
    return teamValidators.teamId.parse(teamId);
  }
  
  static validateCreateTeam(data: unknown) {
    return teamValidators.createTeam.parse(data);
  }
  
  static validateUpdateTeam(data: unknown) {
    return teamValidators.updateTeam.parse(data);
  }
  
  static validateAddPokemonToTeam(data: unknown) {
    return teamValidators.addPokemonToTeam.parse(data);
  }
  
  // 🔹 FRIENDSHIP
  static validateFriendshipAction(data: unknown) {
    return friendshipValidators.friendshipAction.parse(data);
  }
  
  static validateSendFriendRequest(data: unknown) {
    return friendshipValidators.sendFriendRequest.parse(data);
  }
  
  static validateUpdateFriendshipStatus(data: unknown) {
    return friendshipValidators.updateFriendshipStatus.parse(data);
  }
  
  static validateSearchUsers(data: unknown) {
    return friendshipValidators.searchUsers.parse(data);
  }
  
  // 🔹 BATTLE
  static validatePlayerMove(data: unknown) {
    return battleValidators.playerMove.parse(data);
  }
  
  static validateInitBattle(data: unknown) {
    return battleValidators.initBattle.parse(data);
  }
  
  static validateTeamBattle(data: unknown) {
    return battleValidators.teamBattle.parse(data);
  }
  
  // 🔹 WEATHER
  static validateWeatherQuery(data: unknown) {
    return weatherValidators.weatherQuery.parse(data);
  }
  
  // 🔹 HACK CHALLENGE
  static validateSubmitAnswer(data: unknown) {
    return hackValidators.submitAnswer.parse(data);
  }
  
  static validateTriggerChallenge(data: unknown) {
    return hackValidators.triggerChallenge.parse(data);
  }
}

// ✅ LEGACY VALIDATORS (conservés pour rétrocompatibilité)
export const commonSchemas = baseSchemas;

export const validateId = (id: string | number, fieldName: string = 'ID') => {
  const numId = typeof id === 'string' ? parseInt(id) : id;
  if (isNaN(numId) || numId <= 0) {
    throw new Error(`${fieldName} invalide`);
  }
  return numId;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// ✅ TYPES
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type IdValidation = number;
export type EmailValidation = boolean;
export type PasswordValidation = ValidationResult;
export type CoordinatesValidation = boolean; 