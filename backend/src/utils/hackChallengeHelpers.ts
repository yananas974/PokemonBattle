import { Context } from 'hono';
import { formatResponse, HACK_CHALLENGE_MESSAGES } from '@pokemon-battle/shared';

// ✅ TYPES
interface ActiveChallenge {
  id: string;
  createdAt: number;
  userId?: number;
  time_limit: number;
  solution: string;
  [key: string]: any;
}

// ✅ STOCKAGE DES CHALLENGES ACTIFS
export const activeChallenges = new Map<string, ActiveChallenge>();

// ✅ HELPERS
export const cleanupChallenge = (challengeId: string, timeLimit: number): void => {
  setTimeout(() => {
    activeChallenges.delete(challengeId);
    console.log(`🧹 Challenge ${challengeId} nettoyé après expiration`);
  }, timeLimit);
};

export const withChallengeAndCleanup = (
  challengeId: string, 
  c: Context, 
  callback: (challenge: ActiveChallenge, timeElapsed: number) => Response
): Response => {
  const challenge = activeChallenges.get(challengeId);
  
  if (!challenge) {
    return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.CHALLENGE_EXPIRED, {
      message: 'Challenge expiré ou introuvable'
    }));
  }
  
  const timeElapsed = Date.now() - challenge.createdAt;
  activeChallenges.delete(challengeId);
  
  return callback(challenge, timeElapsed);
};

export const createAnswerResponse = (
  c: Context, 
  isCorrect: boolean, 
  timeElapsed: number, 
  challenge: ActiveChallenge
): Response => {
  if (isCorrect) {
    const score = calculateScore(challenge, timeElapsed);
    return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.CHALLENGE_SOLVED, {
      message: '🎉 Bravo ! Défi résolu !',
      score,
      timeElapsed: Math.round(timeElapsed / 1000) + 's',
      bonus: score > 80 ? 'Excellent temps !' : 'Bien joué !'
    }));
  } else {
    return c.json(formatResponse(HACK_CHALLENGE_MESSAGES.INCORRECT_ANSWER, {
      message: '❌ Réponse incorrecte. Essayez encore !',
      hint: 'Vérifiez votre réponse et réessayez',
      correct_answer: challenge.solution
    }));
  }
};

// ✅ CALCUL DU SCORE
const calculateScore = (challenge: ActiveChallenge, timeElapsed: number): number => {
  const baseScore = 100;
  const timeLimit = challenge.time_limit;
  const timeBonus = Math.max(0, timeLimit - timeElapsed);
  const speedMultiplier = timeBonus / timeLimit;
  
  return Math.round(baseScore * (0.5 + 0.5 * speedMultiplier));
};

// ✅ UTILITAIRES SUPPLÉMENTAIRES
export const getChallengeStatus = (challengeId: string) => {
  const challenge = activeChallenges.get(challengeId);
  if (!challenge) return null;
  
  const timeElapsed = Date.now() - challenge.createdAt;
  const timeRemaining = Math.max(0, challenge.time_limit - timeElapsed);
  
  return {
    id: challengeId,
    timeElapsed,
    timeRemaining,
    isExpired: timeRemaining <= 0
  };
};

export const getActiveChallengesCount = (): number => {
  return activeChallenges.size;
};

export const cleanupExpiredChallenges = (): number => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [id, challenge] of activeChallenges.entries()) {
    if (now - challenge.createdAt > challenge.time_limit) {
      activeChallenges.delete(id);
      cleaned++;
    }
  }
  
  console.log(`🧹 ${cleaned} challenges expirés nettoyés`);
  return cleaned;
};
