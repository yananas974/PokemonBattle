import { db } from '../../config/drizzle.config.js';
import type { PgTable } from 'drizzle-orm/pg-core';

export const Create = async <T extends Record<string, any>>(
  table: PgTable,
  data: any
): Promise<T> => {
  try {
    const result = await db.insert(table).values(data).returning();

    if (!result || result.length === 0) {
      throw new Error('No record returned after insert');
    }

    return result[0] as T;
  } catch (error) {
    console.error('Error in insertOne:', error);
    throw error;
  }
};

export const CreateMany = async <T extends Record<string, any>>(
  table: PgTable,
  data: any[]
): Promise<T[]> => {
  const result = await db.insert(table).values(data).returning();
  return result as T[];
};

