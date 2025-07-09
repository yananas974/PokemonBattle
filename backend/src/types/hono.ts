import type { Context } from 'hono';
import type { User } from '@pokemon-battle/shared';

export interface AuthContext extends Context {
  get(key: 'user'): User;
  set(key: 'user', value: User): void;
} 