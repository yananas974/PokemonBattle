import { Hono } from 'hono';
import { interactiveBattleHandlers, interactiveBattleValidators } from '../handlers/interactiveBattle.handler.js';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';

const interactiveBattleRoutes = new Hono();

// ✅ Route de test pour vérifier l'API
interactiveBattleRoutes.get('/test', async (c) => {
  return c.json({
    success: true,
    message: 'Interactive Battle API is working',
    timestamp: new Date().toISOString(),
    routes: [
      'POST /init - Initialize battle',
      'POST /move - Execute player move',
      'GET /:battleId - Get battle state',
      'GET /state/:battleId - Get battle state (alternative)',
      'POST /:battleId/forfeit - Forfeit battle',
      'POST /solve-hack - Solve hack challenge'
    ]
  });
});

// ✅ Routes de combat interactif avec authentification
interactiveBattleRoutes.post('/init', authMiddleware, interactiveBattleValidators.initBattle, interactiveBattleHandlers.initBattle);
interactiveBattleRoutes.post('/move', authMiddleware, interactiveBattleValidators.playerMove, interactiveBattleHandlers.executePlayerMove);
interactiveBattleRoutes.get('/:battleId', authMiddleware, interactiveBattleHandlers.getBattleState);
interactiveBattleRoutes.get('/state/:battleId', authMiddleware, interactiveBattleHandlers.getBattleStateByPath);
interactiveBattleRoutes.post('/:battleId/forfeit', authMiddleware, interactiveBattleHandlers.forfeitBattle);
interactiveBattleRoutes.post('/solve-hack', authMiddleware, interactiveBattleHandlers.solveHackChallenge);

export { interactiveBattleRoutes }; 