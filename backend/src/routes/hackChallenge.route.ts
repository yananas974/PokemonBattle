import { Hono } from 'hono';
import { 
  triggerHackChallengeHandler, 
  submitHackAnswerHandler,
  getAllWordsHandler
} from '../handlers/hackChallenge.handler.js';
import { authMiddleware } from '../middlewares/authMiddleware/auth.middleware.js';

const hackChallengeRoutes = new Hono();


hackChallengeRoutes.post('/trigger',authMiddleware, triggerHackChallengeHandler);
hackChallengeRoutes.post('/submit', authMiddleware, submitHackAnswerHandler);
hackChallengeRoutes.get('/words', authMiddleware, getAllWordsHandler);

export { hackChallengeRoutes }; 