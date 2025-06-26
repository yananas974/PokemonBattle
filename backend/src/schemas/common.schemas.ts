import { z } from "zod";

// ✅ Schémas d'ID communs (utilisés partout)
export const idSchema = z.number().min(1, "ID must be positive");
export const userIdSchema = z.number().min(1, "User ID must be positive");
export const teamIdSchema = z.number().min(1, "Team ID must be positive");
export const pokemonIdSchema = z.number().min(1, "Pokemon ID must be positive");
export const friendIdSchema = z.number().min(1, "Friend ID must be positive");
export const friendshipIdSchema = z.number().min(1, "Friendship ID must be positive");

// ✅ Schémas génériques vraiment communs (utilisés partout)
export const positiveNumberSchema = z.number().min(1, "Must be positive");
export const nonEmptyStringSchema = z.string().min(1, "Cannot be empty");
export const optionalStringSchema = z.string().optional();
export const urlSchema = z.string().url("Invalid URL format").optional();

// ✅ Schémas de pagination (utilisés dans plusieurs endpoints)
export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0)
});

// ✅ Schémas de réponse standard API
export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional()
});

export const errorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  details: z.any().optional()
});

// ✅ Schémas de dates communes
export const dateStringSchema = z.string().datetime("Invalid date format");
export const timestampSchema = z.number().min(0, "Timestamp must be positive");

// ✅ Types inférés
export type Pagination = z.infer<typeof paginationSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
