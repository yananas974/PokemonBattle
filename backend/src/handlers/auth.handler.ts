import { hashPassword, generateToken, cookieOptions, comparePassword } from '../utils/auth/auth.utils'; 
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { createUser, getUserByEmail, getAllUsers } from '../services/services.js';
import type { Context } from 'hono';


export const signupHandler = async (c: Context) => {
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
};

export const loginHandler = async (c: Context) => {
  console.log('🔐 === TENTATIVE DE CONNEXION ===');
  console.log('Headers reçus dans login:', Object.fromEntries(c.req.raw.headers));
  const { email, password } = await c.req.json();
  console.log('Email reçu:', email);
  console.log('Password reçu:', password ? '***' : 'undefined');

  try {
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour email:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }
 
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect pour:', email);
      return c.json({ error: 'Invalid email or password' }, 401);
    }
 
    const token = await generateToken(String(user.id));
    console.log('✅ Token généré:', token.substring(0, 20) + '...');
    
    setCookie(c, 'authToken', token, cookieOptions as CookieOptions);
    console.log('✅ Cookie défini avec options:', cookieOptions);

    const { password_hash, ...userWithoutPassword } = user;

    console.log('✅ Connexion réussie pour:', userWithoutPassword.email);
    return c.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('❌ Erreur dans login:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const logoutHandler = async (c: Context) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ message: 'Logged out successfully' });
}; 

export const getUsersHandler = async (c: Context) => {
  try {
    const users = await getAllUsers();
    
    // Retirer les mots de passe des résultats
    const usersWithoutPasswords = users.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return c.json({
      message: 'Users retrieved successfully',
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return c.json({ error: 'Failed to retrieve users' }, 500);
  }
};