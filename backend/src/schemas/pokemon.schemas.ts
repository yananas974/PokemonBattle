import { z } from 'zod';
import { teamIdSchema, pokemonIdSchema, userIdSchema } from './common.schemas.js';

// ✅ Schémas spécifiques aux opérations Pokémon
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