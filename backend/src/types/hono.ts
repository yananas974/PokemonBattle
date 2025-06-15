import type { Context } from 'hono';
import type { User } from '../models/interfaces/user.interface.js';

export interface AuthContext extends Context {
  get(key: 'user'): User;
  set(key: 'user', value: User): void;
} 