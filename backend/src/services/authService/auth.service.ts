import 'dotenv/config';
import { db } from "../../config/drizzle.config";
import { jwt } from 'hono/jwt';
import { sql, eq } from 'drizzle-orm';
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
    
    console.log('User created:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in insertUser:', error);
    throw error;
  }
};

export const getUserById = async (id: number) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const result = await db.select().from(users);
    return result;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};

export const updateUser = async (id: number, data: { email?: string; username?: string; password_hash?: string }) => {
  try {
    const result = await db.update(users)
      .set({
        ...data,
        updated_at: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No user found with id ${id}`);
    }
    
    console.log('User updated:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const result = await db.delete(users)
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`No user found with id ${id}`);
    }
    
    console.log('User deleted:', result[0]);
    return result[0];
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET!,
  cookie: 'authToken'
});