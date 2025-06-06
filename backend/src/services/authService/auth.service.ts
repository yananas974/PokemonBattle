import 'dotenv/config';
import { db } from "../../config/drizzle.config";
import { jwt } from 'hono/jwt';
import { sql } from 'drizzle-orm';
import { users } from "../../db/schema";

export const insertUser = async (email: string, username: string, password: string) => {
  try {
    const result = await db.insert(users).values({
      email,
      username, 
      password_hash: password
    }).returning();
    
    if (!result[0]) {
      throw new Error('No user returned after insert');
    }
    
    return result[0];
  } catch (error) {
    console.error('Error in insertUser:', error);
    throw error;
  }
};

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET!,
  cookie: 'authToken'
});