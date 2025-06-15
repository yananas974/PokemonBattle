import { Hono } from 'hono';
import { signupHandler, loginHandler, logoutHandler, getUsersHandler } from '../handlers/auth.handler.js';

const authRoutes = new Hono();

authRoutes.post('/signup', signupHandler);
authRoutes.post('/login', loginHandler);
authRoutes.post('/logout', logoutHandler);
authRoutes.get('/users', getUsersHandler);

export default authRoutes;  