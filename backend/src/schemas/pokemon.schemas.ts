import { z } from 'zod';
import { pokemonIdSchema, teamIdSchema, userIdSchema } from './common.schemas.js';

// ✅ Schémas de base Pokemon
export const pokemonNameSchema = z.string().min(1, "Pokemon name is required");
export const pokemonTypeSchema = z.string().min(1, "Pokemon type is required");
export const statSchema = z.number().min(1, "Stat must be positive");
export const spriteUrlSchema = z.string().optional();

// ✅ Schéma Pokemon de base
export const basePokemonSchema = z.object({
  pokemon_id: pokemonIdSchema,
  name_fr: pokemonNameSchema,
  type: pokemonTypeSchema,
  hp: statSchema,
  attack: statSchema,
  defense: statSchema,
  speed: statSchema,
  sprite_url: spriteUrlSchema
});

// ✅ Pokémon complet
export const completePokemonSchema = basePokemonSchema.extend({
  id: z.number().min(1, "ID must be positive"),
  name: z.string().min(1, "Pokemon name is required"),
  level: z.number().min(1).max(100).default(50),
  height: z.number().min(0),
  weight: z.number().min(0),
  back_sprite_url: z.string().optional(),
  user_id: userIdSchema,
  created_at: z.date().optional()
});

// ✅ Alias pour rétrocompatibilité
export const pokemonSchema = basePokemonSchema;

// ✅ Schémas existants (à garder pour la compatibilité)
export const addPokemonToTeamSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: pokemonIdSchema,
  userId: userIdSchema
});

export const removePokemonFromTeamSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: pokemonIdSchema,
  userId: userIdSchema
});

export const pokemonStatsSchema = z.object({
  pokemon_id: pokemonIdSchema,
  name_fr: z.string().min(1),
  type: z.string().min(1),
  hp: z.number().min(1),
  attack: z.number().min(1),
  defense: z.number().min(1),
  speed: z.number().min(1),
  sprite_url: z.string().default('')
});

export const getPokemonByIdParamsSchema = z.object({
  id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val > 0, {
    message: "Pokemon ID must be a positive number"
  })
});

export const pokemonQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  type: z.string().optional(),
  search: z.string().optional()
});

// ✅ Types inférés
export type BasePokemon = z.infer<typeof basePokemonSchema>;
export type CompletePokemon = z.infer<typeof completePokemonSchema>;
export type PokemonStats = z.infer<typeof pokemonStatsSchema>;
export type GetPokemonByIdParams = z.infer<typeof getPokemonByIdParamsSchema>;
export type PokemonQuery = z.infer<typeof pokemonQuerySchema>; 