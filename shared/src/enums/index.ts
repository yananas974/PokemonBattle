// ✅ ENUMS POUR LES STATUTS DE COMBAT
export enum BattleStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished'
}

// ✅ ENUMS POUR LES STATUTS D'AMITIÉ
export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  REMOVED = 'removed'
}

// ✅ ENUMS POUR LES CONDITIONS MÉTÉOROLOGIQUES
export enum WeatherCondition {
  CLEAR_DAY = 'ClearDay',
  CLEAR_NIGHT = 'ClearNight',
  RAIN = 'Rain',
  SNOW = 'Snow',
  CLOUDS = 'Clouds',
  THUNDERSTORM = 'Thunderstorm',
  DRIZZLE = 'Drizzle',
  MIST = 'Mist',
  FOG = 'Fog'
}

// ✅ ENUMS POUR LES TYPES DE POKÉMON
export enum PokemonType {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  ELECTRIC = 'Electric',
  GRASS = 'Grass',
  ICE = 'Ice',
  FIGHTING = 'Fighting',
  POISON = 'Poison',
  GROUND = 'Ground',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  BUG = 'Bug',
  ROCK = 'Rock',
  GHOST = 'Ghost',
  DRAGON = 'Dragon',
  DARK = 'Dark',
  STEEL = 'Steel',
  FAIRY = 'Fairy'
}

// ✅ ENUMS POUR LES DIFFICULTÉS DE HACK CHALLENGE
export enum HackDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

// ✅ ENUMS POUR LES ALGORITHMES DE HACK CHALLENGE
export enum HackAlgorithm {
  CAESAR = 'caesar',
  BASE64 = 'base64',
  ROT13 = 'rot13',
  REVERSE = 'reverse',
  MORSE = 'morse'
}

// ✅ ENUMS POUR LES ACTIONS DE COMBAT
export enum BattleAction {
  ATTACK = 'attack',
  SWITCH = 'switch',
  ITEM = 'item',
  FORFEIT = 'forfeit'
}

// ✅ ENUMS POUR LES PHASES DE COMBAT
export enum BattlePhase {
  INIT = 'init',
  PLAYER_TURN = 'player_turn',
  ENEMY_TURN = 'enemy_turn',
  HACK_CHALLENGE = 'hack_challenge',
  FINISHED = 'finished'
}

// ✅ ENUMS POUR LES RÔLES UTILISATEUR
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

// ✅ TYPES DÉRIVÉS DES ENUMS
export type BattleStatusType = `${BattleStatus}`;
export type FriendshipStatusType = `${FriendshipStatus}`;
export type WeatherConditionType = `${WeatherCondition}`;
export type PokemonTypeType = `${PokemonType}`;
export type HackDifficultyType = `${HackDifficulty}`;
export type HackAlgorithmType = `${HackAlgorithm}`;
export type BattleActionType = `${BattleAction}`;
export type BattlePhaseType = `${BattlePhase}`;
export type UserRoleType = `${UserRole}`; 