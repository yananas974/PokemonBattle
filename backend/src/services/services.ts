// ✅ Barrel export : Tous les services en un seul endroit

// Auth Services
export * from './authService/userService.js';

// Team Services  
export { TeamService } from './createTeamService/teamService.js';
export * from './createTeamService/teamService.js';

// Pokemon Team Services
export { PokemonTeamService } from './pokemonTeamService/pokemonTeamService.js';
export * from './pokemonTeamService/pokemonTeamService.js';

// Friendship Services
export { FriendshipService } from './friendshipService/friendshipService.js';
export * from './friendshipService/friendshipService.js';

// Note: friendsService/ est vide, donc pas d'export 

// ✅ Ajouter le service de combat
export { TeamBattleService } from './battle/teamBattleService.js';
export { TurnBasedBattleService } from './battle/turnBasedBattleService.js';

// Weather Services
export { WeatherService } from './weatherService/weatherService.js';
export { WeatherDetectionService } from './weatherService/weatherDetectionService.js';
export { WeatherEffectService } from './weatherEffectService/weatherEffectService.js';
