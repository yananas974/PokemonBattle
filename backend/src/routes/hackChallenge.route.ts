import { Hono } from 'hono';
import { 
  triggerHackChallengeHandler, 
  submitHackAnswerHandler,
  getAllWordsHandler
} from '../handlers/hackChallenge.handler.js';

const hackChallengeRoutes = new Hono();

// Déclencher un hack aléatoire
hackChallengeRoutes.post('/trigger', triggerHackChallengeHandler);

// Soumettre une réponse
hackChallengeRoutes.post('/submit', submitHackAnswerHandler);

// Récupérer tous les mots disponibles
hackChallengeRoutes.get('/words', getAllWordsHandler);

export { hackChallengeRoutes }; 