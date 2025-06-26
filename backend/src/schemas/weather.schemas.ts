import { z } from 'zod';

// ✅ Schémas géographiques (déplacés depuis common)
export const latitudeSchema = z.number().min(-90).max(90).optional().default(48.8566);
export const longitudeSchema = z.number().min(-180).max(180).optional().default(2.3522);

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90).default(48.8566),
  lon: z.number().min(-180).max(180).default(2.3522)
});

// ✅ Validation flexible - les types seront validés côté service avec la DB
const pokemonTypeSchema = z.string().min(1, "Le type Pokemon est requis");

// ✅ Schémas pour les requêtes météo
export const weatherQuerySchema = z.object({
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522)
});

// ✅ Schéma pour simuler un combat avec météo
export const simulateBattleWithWeatherSchema = z.object({
  attacker: z.object({
    pokemon_id: z.number(),
    name_fr: z.string(),
    type: pokemonTypeSchema, // ✅ Validation flexible - sera validée avec la DB
    hp: z.number().min(1),
    attack: z.number().min(1),
    defense: z.number().min(1),
    speed: z.number().min(1)
  }),
  defender: z.object({
    pokemon_id: z.number(),
    name_fr: z.string(),
    type: pokemonTypeSchema, // ✅ Validation flexible - sera validée avec la DB
    hp: z.number().min(1),
    attack: z.number().min(1),
    defense: z.number().min(1),
    speed: z.number().min(1)
  }),
  ...coordinatesSchema.shape
});

// ✅ Types inférés
export type WeatherQuery = z.infer<typeof weatherQuerySchema>;
export type SimulateBattleWithWeatherRequest = z.infer<typeof simulateBattleWithWeatherSchema>; 