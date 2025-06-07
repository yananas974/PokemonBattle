import { db } from '../config/drizzle.config.js';
import { users } from './schema.js';
import type { SQL } from 'drizzle-orm';

export async function getOne<T>(table: any, whereClause: SQL): Promise<T | undefined> {
  const result = await db.select().from(table).where(whereClause).limit(1);
  return result[0];
}