import { Context } from 'hono';
import { HackChallengeService } from '../services/hackService/hackChallengeService.js';
import { db } from '../config/drizzle.config.js';
import { hacks } from '../db/schema.js';
import { asyncHandler } from '../utils/asyncWrapper.js';
import { NotFoundError } from '../models/errors.js';
import { 
  submitHackAnswerSchema,
  triggerHackChallengeSchema,
  HackChallengeResponse
} from '../schemas/index.js';
import { zValidator } from '@hono/zod-validator';
import { formatResponse } from '../utils/responseFormatter.js';
import { HACK_CHALLENGE_MESSAGES } from '../constants/message.js';
import { HackChallengeHandler } from '../models/type/hackChallenge.js';
import { cleanupChallenge, withChallengeAndCleanup, createAnswerResponse, activeChallenges } from '../utils/hackChallengeHelpers.js';

// Validators groupés
export const hackChallengeValidators = {
  submitAnswer: zValidator('json', submitHackAnswerSchema),
  triggerChallenge: zValidator('json', triggerHackChallengeSchema)
};

// Handlers regroupés
export const hackChallengeHandlers: HackChallengeHandler = {
  triggerChallenge: asyncHandler(async (c) => {
    const challenge = await HackChallengeService.generateRandomChallenge();
    
    if (!challenge) {
      throw new NotFoundError('Impossible de générer un défi');
    }

    // Stocker le défi
    activeChallenges.set(challenge.id, {
      ...challenge,
      createdAt: Date.now(),
      userId: c.get('user')?.id
    });

    // Programmer le nettoyage
    cleanupChallenge(challenge.id, challenge.time_limit);
    
    return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.CHALLENGE_GENERATED, {
      challenge: {
        ...challenge,
        message: "🚨 Vous avez été hacké ! Résolvez ce défi pour continuer :"
      } as HackChallengeResponse
    }));
  }),

  submitAnswer: asyncHandler(async (c) => {
    const { challengeId, answer } = submitHackAnswerSchema.parse(await c.req.json());
    
    return withChallengeAndCleanup(challengeId, c, (challenge, timeElapsed) => {
      // Vérifier le temps limite
      if (timeElapsed > challenge.time_limit) {
        return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.CHALLENGE_FAILED, {
          message: 'Temps écoulé ! Défi échoué.',
          correct_answer: challenge.solution
        }));
      }

      // Vérifier la réponse
      const isCorrect = HackChallengeService.verifyAnswer(challenge as any, answer);
      return createAnswerResponse(
        c, 
        isCorrect, 
        timeElapsed, 
        challenge
      );
    });
  }),

  getAllWords: asyncHandler(async (c) => {
    const words = await db.select().from(hacks);
    return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.WORDS_RETRIEVED, {
      words: words.map(w => w.base_word),
      total: words.length
    }));
  })
}; 