import { Hono } from 'hono';
import authController from '../controllers/auth/auth.Controller';

const authRoutes = new Hono();

authRoutes.route('', authController);

export default authRoutes;  