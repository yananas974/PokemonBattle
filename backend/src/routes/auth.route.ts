import { Hono } from 'hono';
import { signupHandler, loginHandler, logoutHandler, getUsersHandler, signupValidator, loginValidator } from '../handlers/auth.handler.js';

const authRoutes = new Hono();

authRoutes.post('/signup', signupValidator, signupHandler);
authRoutes.post('/login', loginValidator, loginHandler);
authRoutes.post('/logout', logoutHandler);
authRoutes.get('/users', getUsersHandler);

export { authRoutes };