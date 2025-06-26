import { z } from 'zod';
import { teamIdSchema } from './common.schemas.js';
import { coordinatesSchema } from './weather.schemas.js';
import { pokemonSchema } from './pokemon.schemas.js';

// ✅ Schémas spécialisés pour les batailles
export const battlePokemonSchema = pokemonSchema.extend({
  // Ajout des champs spécifiques au combat
  currentHp: z.number().min(0).optional(),
  status: z.enum(['normal', 'poisoned', 'paralyzed', 'burned', 'frozen', 'sleeping']).default('normal'),
  moves: z.array(z.object({
    name: z.string(),
    type: z.string(),
    power: z.number().min(0),
    accuracy: z.number().min(0).max(100),
    pp: z.number().min(0)
  })).optional()
});

// ✅ Équipe pour bataille
export const battleTeamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: z.string().min(1, "Team name is required"),
  pokemon: z.array(battlePokemonSchema).min(1, "Team must have at least one Pokemon")
});

// ✅ Schémas pour les différents types de bataille
export const teamBattleRequestSchema = z.object({
  team1: battleTeamSchema,
  team2: battleTeamSchema,
  ...coordinatesSchema.shape
});

export const turnBasedBattleRequestSchema = teamBattleRequestSchema.extend({
  mode: z.enum(['init', 'turn', 'full']).optional().default('full')
});

// ✅ Schémas pour les actions de combat
export const battleActionSchema = z.object({
  turn: z.number().min(1),
  attackerId: z.number(),
  targetId: z.number(),
  moveUsed: z.string(),
  damage: z.number().min(0),
  isCritical: z.boolean().default(false),
  typeEffectiveness: z.number().default(1),
  description: z.string()
});

// ✅ Schéma pour l'état d'une bataille
export const battleStateSchema = z.object({
  battleId: z.string().uuid(),
  team1: battleTeamSchema,
  team2: battleTeamSchema,
  currentTurn: z.number().min(1).default(1),
  isActive: z.boolean().default(true),
  winner: z.string().optional(),
  battleLog: z.array(battleActionSchema).default([]),
  weatherEffects: z.array(z.object({
    type: z.string(),
    duration: z.number(),
    intensity: z.number()
  })).default([]),
  timeBonus: z.number().default(1)
});

// ✅ Exports nommés pour rétrocompatibilité
export const teamBattleSchema = teamBattleRequestSchema;
export const turnBasedBattleSchema = turnBasedBattleRequestSchema; 