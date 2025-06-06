import { Hono } from "hono";
import { db } from "../../config/drizzle.config";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, cookieOptions } from '../../utils/auth.utils';
import { setCookie } from 'hono/cookie';
import type { CookieOptions } from 'hono/utils/cookie';
import { authRateLimiter } from '../../middlewares/authMiddleware/rateLimiter.middleware';
import { generateTokenPair } from '../../utils/token.utils';

const loginController = new Hono();

// Appliquer rate limiting
loginController.use('/login', authRateLimiter);

loginController.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  const result = await db.select().from(users).where(eq(users.email, email));
  
  if (!result.length) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const user = result[0];
  
  // Vérifier le mot de passe
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Générer access + refresh tokens
  const { accessToken, refreshToken } = await generateTokenPair(String(user.id));
  
  setCookie(c, 'authToken', accessToken, cookieOptions as CookieOptions);
  setCookie(c, 'refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30 // 30 jours pour refresh
  } as CookieOptions);
  
  return c.json({
    message: 'Login successful',
    user: { id: user.id, email: user.email, username: user.username }
  });
});

export default loginController;