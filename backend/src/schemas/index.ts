// ✅ Exports centralisés de tous les schémas

// Schémas vraiment communs et génériques
export * from './common.schemas.js';

// Schémas spécialisés par domaine
export * from './auth.schemas.js';
export * from './pokemon.schemas.js';
export * from './team.schemas.js';
export * from './friendship.schemas.js';
export * from './battle.schemas.js';
export * from './weather.schemas.js';
export * from './interactiveBattle.schemas.js';
export * from './hackChallenge.schemas.js';

// Générateurs et utilitaires
export * from './generator.js'; 