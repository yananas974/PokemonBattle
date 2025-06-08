// backend/src/services/userService.ts
import { CreateUserData, User } from '../../models/interfaces/user.interface.js';
import { Create } from '../../db/crud/create.js';
import { Get } from '../../db/crud/get.js';
import { users } from '../../db/schema.js'
import { eq } from 'drizzle-orm';
import { Delete } from '../../db/crud/delete.js';
import { Update } from '../../db/crud/update.js';

export const createUser = async (createUserData: CreateUserData): Promise<CreateUserData> => {
  return Create<CreateUserData>(users, createUserData);
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  return Get(users, eq(users.email, email));
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  return Get(users, eq(users.id, id));
};

export const deleteUser = async (id: number): Promise<User | undefined> => {
  return Delete(users, eq(users.id, id));
};

export const updateUser = async (id: number, data: Partial<User>): Promise<User | undefined> => {
  return Update(users, eq(users.id, id), data);
};