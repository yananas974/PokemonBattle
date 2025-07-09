// backend/src/utils/hackChallengeHelpers.ts
import { Context } from 'hono';
import { NotFoundError } from '../models/errors.js';
import { HACK_CHALLENGE_MESSAGES } from '../constants/message.js';
import { ChallengeData } from '../models/interfaces/hack.interface.js';
import { formatResponse } from './responseFormatter.js';
import { HackChallengeResponse } from '../schemas/hackChallenge.schemas.js';


// Store des challenges actifs
// export const activeChallenges = new Map<string, ChallengeData>();

export const activeChallenges = new Map<string, ChallengeData>();

// Helpers
export const cleanupChallenge = (challengeId: string, timeLimit?: number) => {
  activeChallenges.delete(challengeId);
  if (timeLimit) {
    setTimeout(() => activeChallenges.delete(challengeId), timeLimit * 1000 + 10000);
  }
};

export const withChallengeAndCleanup = async (
  challengeId: string,
  c: Context,
  handler: (challenge: ChallengeData, timeElapsed: number) => any
) => {
  const challenge = activeChallenges.get(challengeId);
  if (!challenge) {
    throw new NotFoundError(HACK_CHALLENGE_MESSAGES.CHALLENGE_EXPIRED);
  }

  const timeElapsed = (Date.now() - (challenge.createdAt || 0)) / 1000;
  const result = handler(challenge, timeElapsed);
  
  // Nettoyage automatique après traitement
  cleanupChallenge(challengeId);
  
  return result;
};

export const createAnswerResponse = (
  c: Context,
  isCorrect: boolean,
  timeElapsed: number,
  challenge: any
) => {
  const messageData = isCorrect 
    ? {
        message: '🎉 Bravo ! Hack résolu avec succès !',
        time_taken: Math.round(timeElapsed)
      }
    : {
        message: '❌ Réponse incorrecte, essayez encore !',
        time_remaining: Math.max(0, challenge.time_limit - timeElapsed)
      };

  const messageType = isCorrect 
    ? HACK_CHALLENGE_MESSAGES.CHALLENGE_SOLVED 
    : HACK_CHALLENGE_MESSAGES.INCORRECT_ANSWER;

  return c.json(formatResponse(messageType, messageData));
};

