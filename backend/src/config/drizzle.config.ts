import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pokemon_battle',
  password: process.env.DB_PASSWORD || 'your_password',
  port: Number(process.env.DB_PORT) || 5432,
});

export const db = drizzle(pool);