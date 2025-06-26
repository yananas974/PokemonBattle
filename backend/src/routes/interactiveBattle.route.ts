import { Hono } from 'hono';
import {
  initInteractiveBattleHandler,
  executePlayerMoveHandler,
  getBattleStateHandler,
  forfeitBattleHandler
} from '../handlers/interactiveBattle.handler.js';

const interactiveBattleRoutes = new Hono();

interactiveBattleRoutes.post('/init', initInteractiveBattleHandler);
interactiveBattleRoutes.post('/move', executePlayerMoveHandler);
interactiveBattleRoutes.get('/:battleId', getBattleStateHandler);
interactiveBattleRoutes.post('/:battleId/forfeit', forfeitBattleHandler);

export { interactiveBattleRoutes }; 