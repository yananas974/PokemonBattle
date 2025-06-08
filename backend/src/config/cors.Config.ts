import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Important pour les cookies
}); 