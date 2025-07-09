// ✅ CONSTANTES DE COMBAT INTERACTIF

// ✅ Probabilités et timing
export const BATTLE_CONSTANTS = {
  HACK_PROBABILITY: 0.15, // 15% de chance par tour
  BATTLE_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  ATTACK_BONUS_MULTIPLIER: 1.15, // +15% d'attaque pour hack réussi
  HP_PENALTY_MULTIPLIER: 0.2, // -20% HP pour hack échoué
  DEFAULT_CRITICAL_HIT_RATIO: 6.25, // Valeur par défaut Gen 1
  STAB_MULTIPLIER: 1.5, // Same Type Attack Bonus
  MAX_POKEMON_PER_TEAM: 6,
  MIN_HP_AFTER_PENALTY: 1 // HP minimum après pénalité
} as const;

// ✅ Messages par défaut pour les attaques
export const DEFAULT_MOVE = {
  name: 'Charge',
  type: 'Normal',
  power: 40,
  accuracy: 100,
  pp: 35,
  category: 'physical' as const,
  criticalHitRatio: 6.25,
  description: 'Attaque de base'
} as const;

// ✅ États de statut Pokémon
export const POKEMON_STATUS = {
  NONE: 'none',
  NORMAL: 'normal',
  POISONED: 'poisoned',
  PARALYZED: 'paralyzed',
  SLEEPING: 'sleeping',
  FROZEN: 'frozen',
  BURNED: 'burned'
} as const;

// ✅ Types d'actions de combat
export const BATTLE_ACTION_TYPES = {
  ATTACK: 'attack',
  SWITCH: 'switch',
  ITEM: 'item',
  STATUS: 'status',
  HACK: 'hack'
} as const;

// ✅ Phases de combat
export const BATTLE_PHASES = {
  INIT: 'init',
  BATTLE: 'battle',
  FINISHED: 'finished',
  MOVE_SELECTION: 'move_selection',
  MOVE_EXECUTION: 'move_execution',
  SWITCH: 'switch'
} as const;

// ✅ Équipes
export const BATTLE_TEAMS = {
  TEAM1: 'team1',
  TEAM2: 'team2'
} as const;

// ✅ Sources d'actions
export const ACTION_SOURCES = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  SYSTEM: 'system'
} as const;

// ✅ Résultats de combat
export const BATTLE_WINNERS = {
  TEAM1: 'team1',
  TEAM2: 'team2',
  DRAW: 'draw',
  NONE: null
} as const;

export type BattleWinner = typeof BATTLE_WINNERS[keyof typeof BATTLE_WINNERS];
export type BattleTeam = typeof BATTLE_TEAMS[keyof typeof BATTLE_TEAMS];
export type ActionSource = typeof ACTION_SOURCES[keyof typeof ACTION_SOURCES];
export type BattlePhase = typeof BATTLE_PHASES[keyof typeof BATTLE_PHASES];
export type PokemonStatusType = typeof POKEMON_STATUS[keyof typeof POKEMON_STATUS]; 