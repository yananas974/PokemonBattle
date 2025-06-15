// ✅ Barrel export : Tous les services en un seul endroit

// Auth Services
export * from './authService/userService.js';

// Team Services  
export { TeamService } from './createTeamService/teamService.js';
export * from './createTeamService/teamService.js'; // Pour les exports individuels
export { TeamService as NewTeamService } from './teamService/gestionTeamService.js'; // ✅ Nouveau service

// Pokemon Team Services
export * from './pokemonTeamService/pokemonSelectionService.js';
export * from './pokemonTeamService/teamPokemonService.js';

// Friendship Services
export { FriendshipService } from './friendshipService/friendshipService.js';
export * from './friendshipService/friendshipService.js'; // Pour les exports individuels

// Note: friendsService/ est vide, donc pas d'export 

// ✅ Ajouter le service de combat
export { BattleService } from './battle/battleService.js'; 