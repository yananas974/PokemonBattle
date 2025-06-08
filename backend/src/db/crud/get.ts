import { db } from '../../config/drizzle.config.js';
import type { SQL } from 'drizzle-orm';

export const Get = async <T>(table: any, whereClause: SQL): Promise<T | undefined> => {
  const result = await db.select().from(table).where(whereClause).limit(1);
  return result[0];
};

export const GetMany = async <T>(table: any, whereClause: SQL): Promise<T[]> => {
  const result = await db.select().from(table).where(whereClause);
  return result;
};