// backend/src/services/userService.ts
import { CreateUserData, User } from '../models/interfaces/user.interface';
import { insertOne } from '../db/insertOne.js';
import { getOne } from '../db/getOne.js';
import { users } from '../db/schema.js'
import { eq } from 'drizzle-orm';


export async function createUser(createUserData: CreateUserData): Promise<CreateUserData> {
  return insertOne<CreateUserData>(users, createUserData);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return getOne(users, eq(users.email, email));
}