import { Hono } from "hono";
import { signupValidator } from '../../schemas/signup.schema';
import { connectToDatabase } from '../../config/dataBase.Config';
import { insertUser } from '../../services/authService/auth.service';
import { hashPassword, generateToken, cookieOptions } from '../../utils/auth.utils'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';



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

export default authController;