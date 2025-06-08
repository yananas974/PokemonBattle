import { db } from '../../config/drizzle.config.js';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';

export const Update = async <T extends Record<string, any>>(
  table: PgTable,
  whereClause: SQL,
  newData: Partial<T>
): Promise<T> => {
  const result = await db.update(table).set(newData).where(whereClause).returning();
  if (!result || result.length === 0) {
    throw new Error('No record returned after update');
  }
  return result[0] as T;
};

export const UpdateMany = async <T extends Record<string, any>>(
  table: PgTable,
  whereClause: SQL,
  newData: Partial<T>
): Promise<T[]> => {
  const result = await db.update(table).set(newData).where(whereClause).returning();
  return result as T[];
};