import teamRoutes from './team.route.js';
console.log('🔄 Routes.ts loaded, teamRoutes:', typeof teamRoutes);

// ✅ Barrel export : Toutes les routes en un seul endroit
export { default as authRoutes } from './auth.route.js';
export { default as pokemonRoutes } from './pokemon.route.js';
export { default as friendshipRoutes } from './friendship.route.js';
export { default as teamRoutes } from './team.route.js';
export { default as weatherRoutes } from './weather.route.js';




