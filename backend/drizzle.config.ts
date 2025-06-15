import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'pokemon_battle',
    user: process.env.DB_USER || 'pokemon_user',
    password: process.env.DB_PASSWORD || 'lOgan',
    ssl: false,
  }
}); 