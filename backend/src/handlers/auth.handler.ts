import { hashPassword, generateToken, cookieOptions, comparePassword } from '../utils/auth/auth.utils.js'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { createUser, getUserByEmail, getAllUsers } from '../services/services.js';
import type { Context } from 'hono';
import { mapCreateUserToDb, mapUserToApi, mapUsersToApi } from '../mapper/user.mapper.js';
import { User } from '../models/interfaces/interfaces.js';
import { 
  loginSchema, 
  signupSchema
} from '../schemas/index.js';
import { zValidator } from '@hono/zod-validator';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../models/errors.js';

// ✅ Validators middleware
export const signupValidator = zValidator('json', signupSchema);
export const loginValidator = zValidator('json', loginSchema);

// ✅ Handlers refactorisés sans try/catch
export const signupHandler = asyncHandler(async (c: Context) => {
  const { email, password, username } = await c.req.json();
  
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
  
  const token = await generateToken(String(user.id));
  setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
  
  return c.json({
    success: true,
    message: 'User created successfully',
    user: mapUserToApi(user)
  });
});

export const loginHandler = asyncHandler(async (c: Context) => {
  const { email, password } = await c.req.json();
  
  const user = await getUserByEmail(email) as User;
  if (!user) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  const isValidPassword = await comparePassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Email ou mot de passe invalide');
  }

  const token = await generateToken(String(user.id));
  setCookie(c, 'authToken', token, cookieOptions as CookieOptions);

  return c.json({
    success: true,
    message: 'Login successful',
    user: mapUserToApi(user),
    token: token
  });
});

export const logoutHandler = asyncHandler(async (c: Context) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
}); 

export const getUsersHandler = asyncHandler(async (c: Context) => {
  const users = await getAllUsers();
  
  return c.json({
    success: true,
    message: 'Users retrieved successfully',
    users: mapUsersToApi(users)
  });
});

// ✅ Note: Handlers de bataille supprimés - ils appartiennent au battle.handler.ts