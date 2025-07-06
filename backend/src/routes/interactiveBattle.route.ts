import { Hono } from 'hono';
import {
  initInteractiveBattleHandler,
  executePlayerMoveHandler,
  getBattleStateHandler,
  forfeitBattleHandler,
  solveHackChallengeHandler
} from '../handlers/interactiveBattle.handler.js';

const interactiveBattleRoutes = new Hono();

interactiveBattleRoutes.post('/init', initInteractiveBattleHandler);
interactiveBattleRoutes.post('/move', executePlayerMoveHandler);
interactiveBattleRoutes.get('/:battleId', getBattleStateHandler);
interactiveBattleRoutes.post('/:battleId/forfeit', forfeitBattleHandler);
interactiveBattleRoutes.post('/solve-hack', solveHackChallengeHandler);

export { interactiveBattleRoutes }; 