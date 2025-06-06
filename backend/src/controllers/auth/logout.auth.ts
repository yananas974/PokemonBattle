import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { cookieOptions } from "../../utils/auth.utils";
import type { CookieOptions } from 'hono/utils/cookie';
import bcrypt from 'bcrypt';

const logoutController = new Hono();

logoutController.post('/logout', async (c) => {
  setCookie(c, 'authToken', '', {...cookieOptions, maxAge: 0} as CookieOptions);
  return c.json({ message: 'Logged out successfully' });
});

export default logoutController;