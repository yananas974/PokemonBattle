import { Hono } from "hono";
import { signupValidator } from '../../schemas/signup.schema';
import { connectToDatabase } from '../../config/dataBase.Config';
import { insertUser } from '../../services/authService/auth.service';
import { hashPassword, generateToken, cookieOptions, comparePassword } from '../../utils/auth.utils'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { db } from '../../config/drizzle.config';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

const authController = new Hono();

authController.post('/signup', signupValidator, async (c) => {
  const { email, password, username } = await c.req.json();
  
  try {
    const hashedPassword = await hashPassword(password);
    console.log('Attempting to create user:', { email, username }); // Log pour debug
    
    const user = await insertUser(email, username, hashedPassword);
    console.log('User created:', user); // Log pour debug
    
    const token = await generateToken(String(user.id));
    setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
    
    return c.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error('Detailed error in signup:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return c.json({ 
          error: 'Email or username already exists',
          details: error.message 
        }, 400);
      }
      
      return c.json({ 
        error: 'Failed to create user',
        details: error.message 
      }, 500);
    }
    
    return c.json({ 
      error: 'Unknown error occurred',
      details: String(error)
    }, 500);
  }
});

authController.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  try {
    // Validation des champs requis
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Rechercher l'utilisateur par email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await comparePassword(password, user[0].password_hash);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Générer le token JWT
    const token = await generateToken(String(user[0].id));
    setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
    
    return c.json({
      message: 'Login successful',
      user: {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username
      }
    });
    
  } catch (error) {
    console.error('Error in login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default authController;