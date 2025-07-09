/**
 * 🎯 GUIDE D'USAGE - SYSTÈME DE VALIDATION CENTRALISÉ
 * 
 * Ce fichier montre comment utiliser le nouveau système de validation
 * centralisé du package @pokemon-battle/shared
 */

import { 
  ValidationService,
  authValidators,
  pokemonValidators,
  teamValidators,
  friendshipValidators,
  battleValidators
} from '@pokemon-battle/shared';

// ✅ EXEMPLES D'USAGE - VALIDATION SERVICE (recommandé)

export class ValidationExamples {
  
  /**
   * 🔹 VALIDATION AUTH
   */
  static validateAuthExamples() {
    // Validation d'un utilisateur
    const userId = ValidationService.validateUserId(123);
    
    // Validation de données de login
    const loginData = ValidationService.validateLogin({
      email: "user@example.com",
      password: "password123"
    });
    
    // Validation de données d'inscription
    const registerData = ValidationService.validateRegister({
      email: "user@example.com", 
      password: "password123",
      username: "JohnDoe"
    });
  }
  
  /**
   * 🔹 VALIDATION POKEMON
   */
  static validatePokemonExamples() {
    // Validation d'un ID Pokemon
    const pokemonId = ValidationService.validatePokemonId(25);
    
    // Validation de stats complètes d'un Pokemon
    const pokemonStats = ValidationService.validatePokemonStats({
      pokemon_id: 25,
      name_fr: "Pikachu",
      type: "Électrik",
      hp: 100,
      attack: 55,
      defense: 40,
      speed: 90,
      sprite_url: "https://example.com/pikachu.png"
    });
  }
  
  /**
   * 🔹 VALIDATION TEAM
   */
  static validateTeamExamples() {
    // Validation d'un ID d'équipe
    const teamId = ValidationService.validateTeamId(1);
    
    // Validation de création d'équipe
    const createTeam = ValidationService.validateCreateTeam({
      teamName: "Mon Équipe Pokémon"
    });
    
    // Validation d'ajout de Pokemon à une équipe
    const addPokemon = ValidationService.validateAddPokemonToTeam({
      teamId: 1,
      pokemonId: 25,
      userId: 123
    });
  }
  
  /**
   * 🔹 VALIDATION FRIENDSHIP
   */
  static validateFriendshipExamples() {
    // Validation d'envoi de demande d'ami
    const friendRequest = ValidationService.validateSendFriendRequest({
      friendId: 456
    });
    
    // Validation d'action sur amitié
    const friendshipAction = ValidationService.validateFriendshipAction({
      friendshipId: 1,
      userId: 123
    });
    
    // Validation de recherche d'utilisateurs
    const searchUsers = ValidationService.validateSearchUsers({
      query: "john",
      currentUserId: 123
    });
  }
  
  /**
   * 🔹 VALIDATION BATTLE
   */
  static validateBattleExamples() {
    // Validation de mouvement de joueur
    const playerMove = ValidationService.validatePlayerMove({
      battleId: "battle_123",
      moveIndex: 0
    });
    
    // Validation d'initialisation de combat
    const initBattle = ValidationService.validateInitBattle({
      playerTeamId: 1,
      enemyTeamId: 2,
      lat: 48.8566,
      lon: 2.3522
    });
  }
}

// ✅ EXEMPLES D'USAGE - VALIDATEURS DIRECTS (usage avancé)

export class DirectValidatorExamples {
  
  /**
   * 🔹 USAGE DIRECT DES SCHÉMAS ZOD
   */
  static directValidationExamples() {
    // Validation directe avec authValidators
    const userId = authValidators.userId.parse(123);
    
    // Validation directe avec pokemonValidators  
    const pokemonStats = pokemonValidators.pokemonStats.parse({
      pokemon_id: 25,
      name_fr: "Pikachu",
      type: "Électrik",
      hp: 100,
      attack: 55,
      defense: 40,
      speed: 90
    });
    
    // Validation directe avec teamValidators
    const createTeam = teamValidators.createTeam.parse({
      teamName: "Mon Équipe"
    });
    
    // Validation directe avec friendshipValidators
    const friendRequest = friendshipValidators.sendFriendRequest.parse({
      friendId: 456
    });
    
    // Validation directe avec battleValidators
    const playerMove = battleValidators.playerMove.parse({
      battleId: "battle_123",
      moveIndex: 0
    });
  }
}

// ✅ MIGRATION GUIDE - Comment remplacer les anciennes validations

export class MigrationGuide {
  
  /**
   * 🔄 AVANT / APRÈS - Exemple de migration
   */
  static migrationExample() {
    
    // ❌ AVANT - Validation répétée
    /*
    const userIdSchema = z.number().min(1, "User ID must be positive");
    const teamIdSchema = z.number().min(1, "Team ID must be positive");
    
    const sendFriendRequestSchema = z.object({
      friendId: z.number().min(1, "Friend ID must be positive")
    });
    
    // Dans le service
    userIdSchema.parse(userId);
    teamIdSchema.parse(teamId);
    sendFriendRequestSchema.parse({ friendId });
    */
    
    // ✅ APRÈS - Validation centralisée
    const userId = 123;
    const teamId = 1;
    const friendId = 456;
    
    ValidationService.validateUserId(userId);
    ValidationService.validateTeamId(teamId);
    ValidationService.validateSendFriendRequest({ friendId });
  }
}

// ✅ BONNES PRATIQUES

export class BestPractices {
  
  /**
   * 📋 RECOMMANDATIONS D'USAGE
   */
  static recommendations() {
    
    // 1. ✅ Utilisez ValidationService pour la plupart des cas
    ValidationService.validateUserId(123);
    
    // 2. ✅ Validez tôt dans vos fonctions/méthodes
    // static async createTeam(data: unknown, userId: number) {
    //   const validatedData = ValidationService.validateCreateTeam(data);
    //   const validatedUserId = ValidationService.validateUserId(userId);
    //   // ... logique métier
    // }
    
    // 3. ✅ Groupez les validations liées
    // const validation = {
    //   user: ValidationService.validateUserId(userId),
    //   team: ValidationService.validateCreateTeam(teamData),
    //   pokemon: ValidationService.validatePokemonStats(pokemonData)
    // };
    
    // 4. ✅ Gérez les erreurs de validation de manière cohérente
    // try {
    //   ValidationService.validateUserId(userId);
    // } catch (error) {
    //   throw new ValidationError(`Invalid user: ${error.message}`);
    // }
  }
}

/**
 * 📊 AVANTAGES DU SYSTÈME CENTRALISÉ
 * 
 * ✅ DRY - Pas de duplication de code de validation
 * ✅ CONSISTENCY - Messages d'erreur cohérents  
 * ✅ MAINTAINABILITY - Un seul endroit à modifier
 * ✅ TYPE SAFETY - TypeScript full support
 * ✅ REUSABILITY - Utilisable frontend + backend
 * ✅ TESTING - Plus facile à tester
 */ 