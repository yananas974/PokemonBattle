import { hashPassword, generateToken, cookieOptions, comparePassword } from '../utils/auth/auth.utils.js'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { createUser, getUserByEmail, getAllUsers } from '../services/services.js';
import type { Context } from 'hono';
import { mapCreateUserToDb, mapUserToApi, mapUsersToApi } from '../mapper/user.mapper.js';
import { 
  loginSchema, 
  signupSchema
} from '../schemas/index.js';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../models/errors.js';
import { formatResponse, AUTH_MESSAGES, validateEmail, User } from '@pokemon-battle/shared';

// ✅ TYPES
interface AuthHandler {
  [key: string]: (c: Context) => Promise<Response>;
}

interface UserDB extends User {
  password_hash: string;
}

// ✅ HELPERS
const setAuthCookie = (c: Context, token: string) => {
  setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
};

const clearAuthCookie = (c: Context) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
};

const validateUserCredentials = async (email: string, password: string): Promise<User> => {
  const user = await getUserByEmail(email) as UserDB;
  if (!user) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  return user;
};

const createUserAccount = async (email: string, username: string, password: string): Promise<User> => {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('Un utilisateur avec cet email existe déjà');
  }
  
  const hashedPassword = await hashPassword(password);
  console.log('Attempting to create user:', { email, username });
  
  const user = await createUser(mapCreateUserToDb({ 
    email, 
    username, 
    password_hash: hashedPassword 
  })) as User;
  
  return user;
};

// ✅ VALIDATORS GROUPÉS
export const authValidators = {
  signup: zValidator('json', signupSchema),
  login: zValidator('json', loginSchema),
  email: zValidator('json', z.object({
    email: z.string().email('Invalid email format')
  }))
};

// ✅ HANDLERS GROUPÉS
export const authHandlers: AuthHandler = {
  signup: asyncHandler(async (c: Context) => {
    const { email, password, username } = await c.req.json();
    
    const user = await createUserAccount(email, username, password);
    const token = await generateToken(String(user.id));
    setAuthCookie(c, token);
    
    return c.json(formatResponse(AUTH_MESSAGES.REGISTER_SUCCESS, {
      user: mapUserToApi(user),
      token
    }));
  }),

  login: asyncHandler(async (c: Context) => {
    const { email, password } = await c.req.json();
    
    const user = await validateUserCredentials(email, password);
    const token = await generateToken(String(user.id));
    setAuthCookie(c, token);

    return c.json(formatResponse(AUTH_MESSAGES.LOGIN_SUCCESS, {
      user: mapUserToApi(user),
      token
    }));
  }),

  logout: asyncHandler(async (c: Context) => {
    clearAuthCookie(c);
    return c.json(formatResponse(AUTH_MESSAGES.LOGOUT_SUCCESS));
  }),

  getUsers: asyncHandler(async (c: Context) => {
    const users = await getAllUsers();
    
    return c.json(formatResponse('Users retrieved successfully', {
      users: mapUsersToApi(users),
      totalCount: users.length
    }));
  }),

  validateEmail: asyncHandler(async (c: Context) => {
    const { email } = await c.req.json();
    
    // Vérifier le format
    if (!validateEmail(email)) {
      throw new ValidationError('Format d\'email invalide');
    }
    
    // Vérifier la disponibilité
    const existingUser = await getUserByEmail(email);
    const isAvailable = !existingUser;
    
    return c.json(formatResponse('Email validation completed', {
      email,
      isValid: true,
      isAvailable,
      message: isAvailable ? 'Email disponible' : 'Email déjà utilisé'
    }));
  })
};