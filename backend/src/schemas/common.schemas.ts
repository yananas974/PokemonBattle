import { z } from "zod";

// ✅ Schémas de base réutilisables
export const idSchema = z.number().min(1, "ID must be positive");
export const userIdSchema = z.number().min(1, "User ID must be positive");
export const teamIdSchema = z.number().min(1, "Team ID must be positive");
export const pokemonIdSchema = z.number().min(1, "Pokemon ID must be positive");
export const friendIdSchema = z.number().min(1, "Friend ID must be positive");
export const friendshipIdSchema = z.number().min(1, "Friendship ID must be positive");

// ✅ Schémas composés
export const teamNameSchema = z.string().min(1, "Team name is required").max(100, "Team name too long");
export const emailSchema = z.string().email("Invalid email format");
export const usernameSchema = z.string().min(3, "Username too short").max(50, "Username too long");

// ✅ Schémas Auth
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
export const loginPasswordSchema = z.string().min(1, "Password is required");

// ✅ Schémas Pokemon (pour battles)
export const pokemonNameSchema = z.string().min(1, "Pokemon name is required");
export const pokemonTypeSchema = z.string().min(1, "Pokemon type is required");
export const statSchema = z.number().min(1, "Stat must be positive");
export const spriteUrlSchema = z.string().optional();

// ✅ Schémas Géolocalisation
export const latitudeSchema = z.number().min(-90).max(90).optional().default(48.8566);
export const longitudeSchema = z.number().min(-180).max(180).optional().default(2.3522);

// ✅ Schémas composés complexes
export const pokemonSchema = z.object({
  pokemon_id: pokemonIdSchema,
  name_fr: pokemonNameSchema,
  type: pokemonTypeSchema,
  hp: statSchema,
  attack: statSchema,
  defense: statSchema,
  speed: statSchema,
  sprite_url: spriteUrlSchema
});

export const teamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: teamNameSchema,
  pokemon: z.array(pokemonSchema).min(1, "Team must have at least one Pokemon")
});

// ✅ Schémas Auth composés
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema
});

// ✅ Schémas Battle composés
export const teamBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: latitudeSchema,
  lon: longitudeSchema
});

export const turnBasedBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: latitudeSchema,
  lon: longitudeSchema,
  mode: z.enum(['init', 'turn', 'full']).optional().default('full')
});

// ✅ Schémas Friendship composés
export const sendFriendRequestSchema = z.object({
  friendId: friendIdSchema
});

export const acceptFriendRequestSchema = z.object({
  friendshipId: friendshipIdSchema
});

export const blockFriendRequestSchema = z.object({
  friendshipId: friendshipIdSchema
});

export const getUserFriendsSchema = z.object({
  userId: userIdSchema
});

// ✅ Schémas Team composés
export const createTeamSchema = z.object({
  teamName: teamNameSchema
});

export const addPokemonToTeamSchema = z.object({
  teamId: teamIdSchema,
  pokemonId: pokemonIdSchema
}); 
 