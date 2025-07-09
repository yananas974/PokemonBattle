import { Hono } from 'hono';
import { authHandlers, authValidators } from '../handlers/auth.handler.js';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';

const authRoutes = new Hono();

// ✅ Routes d'authentification
authRoutes.post('/signup', authValidators.signup, authHandlers.signup);
authRoutes.post('/login', authValidators.login, authHandlers.login);
authRoutes.post('/logout', authHandlers.logout);

// ✅ Routes protégées
authRoutes.get('/users', authMiddleware, authHandlers.getUsers);

// ✅ Validation d'email
authRoutes.post('/validate-email', authValidators.email, authHandlers.validateEmail);

export { authRoutes };