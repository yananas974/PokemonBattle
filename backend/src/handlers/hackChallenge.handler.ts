import { Context } from 'hono';
import { HackChallengeService } from '../services/hackService/hackChallengeService.js';
import { db } from '../config/drizzle.config.js';
import { hacks } from '../db/schema.js';
import { asyncHandler, authAsyncHandler } from '../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../models/errors.js';

// Stocker les défis actifs en mémoire (ou Redis en prod)
const activeChallenges = new Map<string, any>();

// ✅ Handlers refactorisés sans try/catch
export const triggerHackChallengeHandler = asyncHandler(async (c: Context) => {
  console.log('🚨 === HACK DÉCLENCHÉ ===');
  
  // Générer un défi aléatoire
  const challenge = await HackChallengeService.generateRandomChallenge();
  
  if (!challenge) {
    throw new NotFoundError('Impossible de générer un défi');
  }

  // Stocker le défi (pour vérification ultérieure)
  activeChallenges.set(challenge.id, {
    ...challenge,
    createdAt: Date.now(),
    userId: c.get('user')?.id
  });

  // Nettoyer les anciens défis (optionnel)
  setTimeout(() => {
    activeChallenges.delete(challenge.id);
  }, challenge.time_limit * 1000 + 10000); // +10s de grâce

  console.log(`🎯 Défi généré: ${challenge.algorithm} sur "${challenge.solution}"`);
  
  // Retourner le défi (sans la solution !)
  return c.json({
    success: true,
    challenge: {
      id: challenge.id,
      encrypted_code: challenge.encrypted_code,
      algorithm: challenge.algorithm,
      difficulty: challenge.difficulty,
      explanation: challenge.explanation,
      time_limit: challenge.time_limit,
      message: "🚨 Vous avez été hacké ! Résolvez ce défi pour continuer :"
    }
  });
});

export const submitHackAnswerHandler = asyncHandler(async (c: Context) => {
  const { challengeId, answer } = await c.req.json();
  
  if (!challengeId || !answer) {
    throw new ValidationError('ID du défi et réponse requis');
  }
  
  const challenge = activeChallenges.get(challengeId);
  if (!challenge) {
    throw new NotFoundError('Défi expiré ou invalide');
  }

  // Vérifier le temps limite
  const timeElapsed = (Date.now() - challenge.createdAt) / 1000;
  if (timeElapsed > challenge.time_limit) {
    activeChallenges.delete(challengeId);
    return c.json({ 
      success: false, 
      message: 'Temps écoulé ! Défi échoué.',
      correct_answer: challenge.solution
    });
  }

  // Vérifier la réponse
  const isCorrect = HackChallengeService.verifyAnswer(challenge, answer);
  
  if (isCorrect) {
    activeChallenges.delete(challengeId);
    return c.json({ 
      success: true, 
      message: '🎉 Bravo ! Hack résolu avec succès !',
      time_taken: Math.round(timeElapsed)
    });
  } else {
    return c.json({ 
      success: false, 
      message: '❌ Réponse incorrecte, essayez encore !',
      time_remaining: Math.max(0, challenge.time_limit - timeElapsed)
    });
  }
});

export const getAllWordsHandler = asyncHandler(async (c: Context) => {
  console.log('📋 === GET ALL WORDS HANDLER ===');
  
  const words = await db.select().from(hacks);
  
  console.log(`📊 Mots trouvés: ${words.length}`);
  words.forEach(word => {
    console.log(`  - ${word.base_word}`);
  });
  
  return c.json({
    success: true,
    words: words.map(w => w.base_word),
    total: words.length
  });
}); 