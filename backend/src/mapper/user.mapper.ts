import type { User, CreateUserData, UserResponse } from '@pokemon-battle/shared';

// ✅ Interface pour les données avec hash
interface CreateUserWithHashData extends Omit<CreateUserData, 'password'> {
  password_hash: string;
}

// ✅ Mapper CREATE : API → DB
export const mapCreateUserToDb = (data: CreateUserWithHashData): any => ({
  email: data.email,
  username: data.username,
  password_hash: data.password_hash
});

// ✅ Mapper READ : DB → API (sans password)
export const mapUserToApi = (user: any): UserResponse => ({
  id: user.id,
  email: user.email,
  username: user.username,
  created_at: user.created_at || new Date().toISOString(),
  updated_at: user.updated_at || new Date().toISOString()
});

// ✅ Mapper READ Multiple : DB[] → API[]
export const mapUsersToApi = (users: any[]): UserResponse[] => 
  users.map(mapUserToApi);

// ✅ Mapper sécurisé (retire password_hash)
export const mapUserToSafe = (user: any): Omit<User, 'password_hash'> => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
}; 