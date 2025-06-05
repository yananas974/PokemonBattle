import { drizzle } from 'drizzle-orm/node-postgres';
import { client } from './dataBase.Config';

export const db = drizzle(client);