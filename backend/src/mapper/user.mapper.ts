import type { User, CreateUserData, UserResponse } from "../models/interfaces/interfaces.js";

// ✅ Mapper CREATE : API → DB
export const mapCreateUserToDb = (data: CreateUserData): Omit<User, 'id' | 'created_at' | 'updated_at'> => ({
  email: data.email,
  username: data.username,
  password_hash: data.password_hash
});

// ✅ Mapper READ : DB → API (sans password)
export const mapUserToApi = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  username: user.username
});

// ✅ Mapper READ Multiple : DB[] → API[]
export const mapUsersToApi = (users: User[]): UserResponse[] => 
  users.map(mapUserToApi);

// ✅ Mapper sécurisé (retire password_hash)
export const mapUserToSafe = (user: User): Omit<User, 'password_hash'> => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}; 