import { z } from "zod";

// ✅ Schémas de base pour l'authentification
export const emailSchema = z.string().email("Invalid email format");
export const usernameSchema = z.string().min(3, "Username must be at least 3 characters");
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
export const loginPasswordSchema = z.string().min(1, "Password is required");

// ✅ Schémas composés pour l'authentification
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema
});

// ✅ Types inférés
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>; 