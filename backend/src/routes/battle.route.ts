import { Hono } from 'hono';
import { battleHandlers, battleValidators } from '../handlers/battle.handler.js';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';

const battleRoutes = new Hono();

// ✅ Routes de combat avec la nouvelle structure (toutes protégées)
battleRoutes.post('/team-battle', authMiddleware, battleValidators.teamBattle, battleHandlers.simulateTeamBattle);
battleRoutes.post('/turn-based', authMiddleware, battleValidators.turnBasedBattle, battleHandlers.simulateTurnBasedBattle);

// ✅ Nouvelles routes de gestion des combats
battleRoutes.get('/status/:battleId', authMiddleware, battleHandlers.getBattleStatus);
battleRoutes.post('/forfeit/:battleId', authMiddleware, battleHandlers.forfeitBattle);
battleRoutes.get('/history', authMiddleware, battleHandlers.getBattleHistory);

export { battleRoutes }; 