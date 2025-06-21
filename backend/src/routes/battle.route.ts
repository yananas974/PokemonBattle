import { Hono } from 'hono';
import { simulateTeamBattleHandler, simulateTurnBasedBattleHandler } from '../handlers/battle.handler.js';

const battleRoutes = new Hono();

battleRoutes.post('/team-battle', simulateTeamBattleHandler);
battleRoutes.post('/turn-based', simulateTurnBasedBattleHandler);

export { battleRoutes }; 