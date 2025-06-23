import { db } from '../../config/drizzle.config.js';
import { hacks } from '../../db/schema.js';
import { sql } from 'drizzle-orm';
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { NotFoundError } from '../../models/errors.js';

export interface HackChallenge {
  id: string;
  encrypted_code: string;
  solution: string;
  algorithm: string;
  difficulty: string;
  explanation: string;
  time_limit: number; // secondes
}

export class HackChallengeService {
  
  /**
   * 🎲 Générer un défi aléatoire complet
   */
  static async generateRandomChallenge(): Promise<HackChallenge | null> {
    return serviceWrapper(async () => {
      // 1. Récupérer un mot aléatoire en BDD
      const randomWord = await this.getRandomWord();
      if (!randomWord) {
        throw new NotFoundError('Aucun mot disponible pour le défi');
      }

      // 2. Choisir une difficulté aléatoire
      const difficulty = this.getRandomDifficulty();
      
      // 3. Choisir l'algorithme selon la difficulté
      const algorithm = this.getAlgorithmByDifficulty(difficulty);
      
      // 4. Appliquer l'algorithme au mot
      const encryptedCode = this.applyAlgorithm(randomWord.base_word, algorithm);
      
      // 5. Définir le temps limite selon la difficulté
      const timeLimit = this.getTimeLimitByDifficulty(difficulty);

      return {
        id: `hack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        encrypted_code: encryptedCode,
        solution: randomWord.base_word,
        algorithm,
        difficulty,
        explanation: this.getExplanation(algorithm),
        time_limit: timeLimit
      };
    });
  }

  /**
   * 🎯 Récupérer un mot aléatoire de la BDD
   */
  private static async getRandomWord() {
    return serviceWrapper(async () => {
      const words = await db
        .select()
        .from(hacks)
        .orderBy(sql`RANDOM()`)
        .limit(1);
      
      return words.length > 0 ? words[0] : null;
    });
  }

  /**
   * 🎲 Choisir une difficulté aléatoire
   */
  private static getRandomDifficulty(): string {
    const difficulties = ['facile', 'moyenne', 'difficile', 'très difficile'];
    const weights = [40, 30, 20, 10]; // Pourcentages
    
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (let i = 0; i < difficulties.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return difficulties[i];
      }
    }
    
    return 'facile'; // fallback
  }

  /**
   * 🔧 Choisir l'algorithme selon la difficulté
   */
  private static getAlgorithmByDifficulty(difficulty: string): string {
    const algorithmsByDifficulty = {
      'facile': ['reverse', 'upper'],
      'moyenne': ['caesar', 'hex'],
      'difficile': ['alphanum', 'symbol'],
      'très difficile': ['base64', 'combined']
    };
    
    const algorithms = algorithmsByDifficulty[difficulty as keyof typeof algorithmsByDifficulty] || ['reverse'];
    return algorithms[Math.floor(Math.random() * algorithms.length)];
  }

  /**
   * 🔐 Appliquer l'algorithme au mot
   */
  private static applyAlgorithm(word: string, algorithm: string): string {
    switch (algorithm) {
      case 'reverse':
        return word.split('').reverse().join('');
      
      case 'upper':
        return word.toLowerCase();
      
      case 'caesar':
        return this.caesarCipher(word, 4);
      
      case 'hex':
        return this.toHex(word);
      
      case 'alphanum':
        return this.alphaNumMix(word);
      
      case 'symbol':
        return this.symbolMix(word);
      
      case 'base64':
        return this.toBase64(word);
      
      case 'combined':
        return this.toBase64(this.caesarCipher(word, 3));
      
      default:
        return word;
    }
  }

  /**
   * ⏱️ Temps limite selon difficulté
   */
  private static getTimeLimitByDifficulty(difficulty: string): number {
    const timeLimits = {
      'facile': 30,         // 30 secondes
      'moyenne': 45,        // 45 secondes
      'difficile': 60,      // 1 minute
      'très difficile': 90  // 1.5 minute
    };
    
    return timeLimits[difficulty as keyof typeof timeLimits] || 30;
  }

  /**
   * 📝 Explication de l'algorithme
   */
  private static getExplanation(algorithm: string): string {
    const explanations = {
      'reverse': 'Le mot est écrit à l\'envers',
      'upper': 'Le mot est en minuscules, répondez en MAJUSCULES',
      'caesar': 'Chiffre de César avec décalage de 4',
      'hex': 'Code hexadécimal - chaque lettre convertie en base 16',
      'alphanum': 'Mélange alphanumérique - extraire les lettres',
      'symbol': 'Ignorer les symboles et chiffres',
      'base64': 'Décodage Base64',
      'combined': 'César + Base64 (double chiffrement)'
    };
    
    return explanations[algorithm as keyof typeof explanations] || 'Déchiffrez le code';
  }

  // 🔐 Méthodes de chiffrement (reprises de votre HackService)
  private static caesarCipher(text: string, shift: number = 4): string {
    return text
      .split('')
      .map(char => {
        if (char >= 'A' && char <= 'Z') {
          return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
        }
        return char;
      })
      .join('');
  }

  private static toHex(text: string): string {
    return text
      .split('')
      .map(char => char.charCodeAt(0).toString(16).toUpperCase())
      .join('');
  }

  private static alphaNumMix(text: string): string {
    return text
      .split('')
      .map((char, index) => `${char.toLowerCase()}${index + 1}`)
      .join('');
  }

  private static toBase64(text: string): string {
    return Buffer.from(text, 'utf-8').toString('base64');
  }

  private static symbolMix(text: string): string {
    const symbols = ['@', '#', '$', '%', '&', '*'];
    return text
      .split('')
      .map((char, index) => `${char}${symbols[index % symbols.length]}${Math.floor(Math.random() * 10)}`)
      .join('');
  }

  /**
   * ✅ Vérifier la réponse du joueur
   */
  static verifyAnswer(challenge: HackChallenge, playerAnswer: string): boolean {
    return playerAnswer.toUpperCase().trim() === challenge.solution.toUpperCase();
  }
} 