// ✅ Barrel export : Tous les services en un seul endroit

// Auth Services
export * from './authService/userService.js';

// Team Services  
export { TeamService } from './createTeamService/teamService.js';
export * from './createTeamService/teamService.js';

// Pokemon Team Services
export { PokemonTeamService } from './pokemonTeamService/pokemonTeamService.js';
export * from './pokemonTeamService/pokemonTeamService.js';

// Pokemon Move Services
export { PokemonMoveService } from './pokemonMoveService/pokemonMoveService.js';
export * from './pokemonMoveService/pokemonMoveService.js';

// Pokemon Type Services
export { PokemonTypeService } from './pokemonTypeService/pokemonTypeService.js';

// Friendship Services
export { FriendshipService } from './friendshipService/friendshipService.js';
export * from './friendshipService/friendshipService.js';

// Battle Services
export { BattleService } from './battle/battleService.js';
export { TeamBattleService } from './battle/teamBattleService.js';
export { TurnBasedBattleService } from './battle/turnBasedBattleService.js';
export { InteractiveBattleService } from './battle/interactiveBattleService.js';

// Hack Challenge Services
export { HackChallengeService } from './hackService/hackChallengeService.js';
export * from './hackService/hackChallengeService.js';

// Weather Services
export { WeatherService } from './weatherService/weatherService.js';
export { WeatherDetectionService } from './weatherService/weatherDetectionService.js';
export { WeatherEffectService } from './weatherEffectService/weatherEffectService.js';

// Error Services
export { ErrorFormatter } from './errorService/errorFormatter.js';
export { ErrorLogger } from './errorService/errorLogger.js';
