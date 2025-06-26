import { z } from 'zod';
import { teamIdSchema, userIdSchema } from './common.schemas.js';
import { coordinatesSchema } from './weather.schemas.js';

export const initBattleSchema = z.object({
  playerTeamId: teamIdSchema,
  enemyTeamId: teamIdSchema,
  token: z.string().optional(),
  ...coordinatesSchema.shape
});

export const playerMoveSchema = z.object({
  battleId: z.string().min(1, "Battle ID is required"),
  moveIndex: z.number().min(0).max(3, "Move index must be between 0 and 3")
});

export const battleStateQuerySchema = z.object({
  battleId: z.string().min(1, "Battle ID is required")
});

export const executePlayerMoveSchema = z.object({
  battleId: z.string().min(1, "Battle ID is required"),
  moveIndex: z.number().min(0).max(3),
  token: z.string().optional()
});

export type InitBattleRequest = z.infer<typeof initBattleSchema>;
export type PlayerMoveRequest = z.infer<typeof playerMoveSchema>;
export type ExecutePlayerMoveRequest = z.infer<typeof executePlayerMoveSchema>; 