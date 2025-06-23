import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://frontend:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
  credentials: true, // Important pour les cookies
  exposeHeaders: ['Authorization', 'X-Auth-Token'],
}); 