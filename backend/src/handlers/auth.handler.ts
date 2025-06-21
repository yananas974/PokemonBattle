import { hashPassword, generateToken, cookieOptions, comparePassword } from '../utils/auth/auth.utils'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { createUser, getUserByEmail, getAllUsers } from '../services/services.js';
import type { Context } from 'hono';
import { mapCreateUserToDb, mapUserToApi, mapUsersToApi } from '../mapper/user.mapper.js';
import { User } from '../models/interfaces/interfaces.js';
import { emailSchema, passwordSchema, usernameSchema } from '../schemas/common.schemas.js'; 
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';


const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema
});

// ✅ Validators middleware
export const signupValidator = zValidator('json', signupSchema);
export const loginValidator = zValidator('json', loginSchema);

// ✅ Solution simple : handlers typés directement
export const signupHandler = async (c: Context) => {
  try {
    // ✅ Les données sont déjà validées par signupValidator
    const { email, password, username } = await c.req.json();
    
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
      message: 'User created successfully',
      user: mapUserToApi(user)
    });
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 500);
  }
};

export const loginHandler = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    
    const user = await getUserByEmail(email) as User;
    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const token = await generateToken(String(user.id));
    setCookie(c, 'authToken', token, cookieOptions as CookieOptions);

    return c.json({
      message: 'Login successful',
      user: mapUserToApi(user),
      token: token
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
};

export const logoutHandler = async (c: Context) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ message: 'Logged out successfully' });
}; 

export const getUsersHandler = async (c: Context) => {
  try {
    const users = await getAllUsers();
    
    // ✅ Utilisation du mapper au lieu de la répétition
    return c.json({
      message: 'Users retrieved successfully',
      users: mapUsersToApi(users) // ✅ Remplace la boucle manuelle
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return c.json({ error: 'Failed to retrieve users' }, 500);
  }
};