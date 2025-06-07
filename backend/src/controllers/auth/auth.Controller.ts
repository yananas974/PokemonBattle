import { Hono } from "hono";
import { signupValidator } from '../../schemas/signup.schema';
import { createUser, getUserByEmail } from '../../services/userService';
import { hashPassword, generateToken, cookieOptions, comparePassword } from '../../utils/auth/auth.utils'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';


const authController = new Hono();

authController.post('/signup', signupValidator, async (c) => {
  const { email, password, username } = await c.req.json();
  
  try {
    const hashedPassword = await hashPassword(password);
    console.log('Attempting to create user:', { email, username });
    
    
    // Appel à la fonction métier qui insère en bdd
    const user = await createUser({ email, username, password_hash: hashedPassword });
    console.log('User created:', user);
    
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
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
 
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
 
    const token = await generateToken(String(user.id));
    setCookie(c, 'authToken', token, cookieOptions as CookieOptions);

    const { password_hash, ...userWithoutPassword } = user;

    return c.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

authController.post('/logout', async (c) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ message: 'Logged out successfully' });
});


export default authController;