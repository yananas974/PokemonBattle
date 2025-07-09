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
import { formatResponse, HACK_CHALLENGE_MESSAGES } from '@pokemon-battle/shared';
import { cleanupChallenge, withChallengeAndCleanup, createAnswerResponse, activeChallenges } from '../utils/hackChallengeHelpers.js';


export const hackChallengeValidators = {
  submitAnswer: zValidator('json', submitHackAnswerSchema),
  triggerChallenge: zValidator('json', triggerHackChallengeSchema)
};

export const hackChallengeHandlers = {
  triggerChallenge: asyncHandler(async (c) => {
    const challenge = await HackChallengeService.generateRandomChallenge();
    
    if (!challenge) {
      throw new NotFoundError('Impossible de générer un défi');
    }

    activeChallenges.set(challenge.id, {
      ...challenge,
      createdAt: Date.now(),
      userId: c.get('user')?.id
    });

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
      if (timeElapsed > challenge.time_limit) {
        return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.CHALLENGE_FAILED, {
          message: 'Temps écoulé ! Défi échoué.',
          correct_answer: challenge.solution
        }));
      }

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

const calculateScore = (challenge: any, timeElapsed: number): number => {
  const baseScore = 100;
  const timeBonus = Math.max(0, challenge.time_limit - timeElapsed);
  return Math.round(baseScore + (timeBonus / 1000));
};