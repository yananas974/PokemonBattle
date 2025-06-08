import { db } from '../../config/drizzle.config.js';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';

export const Delete = async <T>(
  table: PgTable,
  whereClause: SQL
): Promise<T> => {
  const result = await db.delete(table).where(whereClause).returning();
  if (!result || result.length === 0) {
    throw new Error('No record returned after delete');
  }
  return result[0] as T;
};

export const DeleteMany = async <T>(
  table: PgTable,
  whereClause: SQL
): Promise<T[]> => {
  const result = await db.delete(table).where(whereClause).returning();
  return result as T[];
};