import { Hono } from 'hono';
import { interactiveBattleHandlers, interactiveBattleValidators } from '../handlers/interactiveBattle.handler.js';

const interactiveBattleRoutes = new Hono();

// ✅ Routes de combat interactif avec la nouvelle structure
interactiveBattleRoutes.post('/init', interactiveBattleValidators.initBattle, interactiveBattleHandlers.initBattle);
interactiveBattleRoutes.post('/move', interactiveBattleValidators.playerMove, interactiveBattleHandlers.executePlayerMove);
interactiveBattleRoutes.get('/:battleId', interactiveBattleHandlers.getBattleState);
interactiveBattleRoutes.post('/:battleId/forfeit', interactiveBattleHandlers.forfeitBattle);
interactiveBattleRoutes.post('/solve-hack', interactiveBattleHandlers.solveHackChallenge);

export { interactiveBattleRoutes }; 