import { Hono } from 'hono';
import { simulateTeamBattleHandler, simulateTurnBasedBattleHandler } from '../handlers/battle.handler.js';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';

const battleRoutes = new Hono();

battleRoutes.post('/team-battle', authMiddleware, simulateTeamBattleHandler);
battleRoutes.post('/turn-based', authMiddleware, simulateTurnBasedBattleHandler);

export { battleRoutes }; 