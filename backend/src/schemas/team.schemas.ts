import { z } from 'zod';
import { teamIdSchema } from './common.schemas.js';
import { pokemonSchema } from './pokemon.schemas.js';

// ✅ Schéma de nom d'équipe
export const teamNameSchema = z.string().min(1, "Team name is required").max(100, "Team name too long");

// ✅ Schéma d'équipe complet
export const teamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: teamNameSchema,
  pokemon: z.array(pokemonSchema).min(1, "Team must have at least one Pokemon")
});

// ✅ Schémas pour la gestion des équipes
export const createTeamRequestSchema = z.object({
  teamName: teamNameSchema,
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false)
});

export const updateTeamRequestSchema = z.object({
  teamName: teamNameSchema.optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional()
});

export const deleteTeamParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0, {
    message: "Team ID must be a positive number"
  })
});

export const addPokemonToTeamRequestSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: z.number().min(1, "Pokemon ID must be positive")
});

export const removePokemonFromTeamParamsSchema = z.object({
  teamId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0),
  pokemonId: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0)
});

// ✅ Types inférés
export type Team = z.infer<typeof teamSchema>;
export type CreateTeamRequest = z.infer<typeof createTeamRequestSchema>;
export type UpdateTeamRequest = z.infer<typeof updateTeamRequestSchema>;
export type AddPokemonToTeamRequest = z.infer<typeof addPokemonToTeamRequestSchema>;
export type DeleteTeamParams = z.infer<typeof deleteTeamParamsSchema>;
export type RemovePokemonFromTeamParams = z.infer<typeof removePokemonFromTeamParamsSchema>; 