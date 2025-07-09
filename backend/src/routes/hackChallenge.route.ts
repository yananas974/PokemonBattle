import { Hono } from 'hono';
import { hackChallengeHandlers, hackChallengeValidators } from '../handlers/hackChallenge.handler.js';

const hackChallengeRoutes = new Hono();

hackChallengeRoutes.post('/trigger', hackChallengeHandlers.triggerChallenge);
hackChallengeRoutes.post('/submit', hackChallengeHandlers.submitAnswer);
hackChallengeRoutes.get('/words', hackChallengeHandlers.getAllWords);

export { hackChallengeRoutes }; 