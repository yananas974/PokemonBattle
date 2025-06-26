import { z } from 'zod';

// ✅ Schémas pour les défis de hack
export const submitHackAnswerSchema = z.object({
  challengeId: z.string().min(1, "Challenge ID is required"),
  answer: z.string().min(1, "Answer is required")
});

export const triggerHackChallengeSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  userId: z.number().optional()
});

// ✅ Schéma pour la réponse de défi
export const hackChallengeResponseSchema = z.object({
  id: z.string().min(1, "Challenge ID is required"),
  encrypted_code: z.string(),
  algorithm: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  explanation: z.string(),
  time_limit: z.number().min(1),
  message: z.string()
});

// ✅ Types inférés
export type SubmitHackAnswerRequest = z.infer<typeof submitHackAnswerSchema>;
export type TriggerHackChallengeRequest = z.infer<typeof triggerHackChallengeSchema>;
export type HackChallengeResponse = z.infer<typeof hackChallengeResponseSchema>; 