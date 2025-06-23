import { Hono } from 'hono';
import {
  initInteractiveBattleHandler,
  executePlayerMoveHandler,
  getBattleStateHandler,
  forfeitBattleHandler
} from '../handlers/interactiveBattle.handler.js';

const interactiveBattleRoutes = new Hono();

// ✅ Supprimer le middleware global - l'authentification se fait dans chaque handler
// interactiveBattleRoutes.use('*', authMiddleware);

// Initialiser un combat interactif (authentification dans le handler)
interactiveBattleRoutes.post('/init', initInteractiveBattleHandler);

// Les autres routes peuvent garder le middleware si nécessaire
interactiveBattleRoutes.post('/move', executePlayerMoveHandler);
interactiveBattleRoutes.get('/:battleId', getBattleStateHandler);
interactiveBattleRoutes.post('/:battleId/forfeit', forfeitBattleHandler);

export { interactiveBattleRoutes }; 