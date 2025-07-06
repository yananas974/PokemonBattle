import { TurnBasedBattleService, type TurnBasedBattleState, type BattlePokemon, type PokemonMove } from './turnBasedBattleService.js';
import { PokemonMoveService } from '../pokemonMoveService/pokemonMoveService.js';
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../../models/errors.js';
import { HackChallengeService, type HackChallenge } from '../hackService/hackChallengeService.js';

export interface InteractiveBattleState extends TurnBasedBattleState {
  isPlayerTurn: boolean;
  waitingForPlayerMove: boolean;
  availableMoves: PokemonMove[];
  battleId: string;
  weatherTurns: number;
  timeBonus: number;
  hackChallenge?: HackChallenge | null;
  isHackActive: boolean;
  hackStartTime?: number;
}

export interface PlayerMoveRequest {
  battleId: string;
  moveIndex: number; // Index de l'attaque choisie (0-3)
  userId: number;
}

export class InteractiveBattleService {
  
  // Stockage temporaire des combats actifs (Redis en production)
  private static activeBattles = new Map<string, InteractiveBattleState>();
  
  /**
   * Initialiser un combat interactif
   */
  static async initializeInteractiveBattle(
    team1: any,
    team2: any,
    weatherEffects: any,
    timeBonus: number,
    playerId: number
  ): Promise<InteractiveBattleState> {
    
    return serviceWrapper(async () => {
      // ✅ NE PAS utiliser TurnBasedBattleService.initializeBattle() 
      // car il lance automatiquement le combat
      
      const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // ✅ Créer manuellement l'état initial SANS lancer le combat
      const playerPokemon = team1.pokemon[0]; // Premier Pokémon du joueur
      const enemyPokemon = team2.pokemon[0];   // Premier Pokémon ennemi
      
      // Récupérer les attaques du Pokémon joueur
      const availableMoves = await PokemonMoveService.getPokemonMoves(playerPokemon.pokemon_id);
      
      const interactiveState: InteractiveBattleState = {
        battleId,
        turn: 1,
        phase: 'battle', // ✅ Use 'battle' for main phase
        battlePhase: 'move_selection', // ✅ Use battlePhase for detailed state
        isPlayerTurn: true,
        waitingForPlayerMove: true, // ✅ En attente du joueur
        
        // Pokémon actuels
        currentTeam1Pokemon: {
          ...playerPokemon,
          current_hp: playerPokemon.base_hp,
          max_hp: playerPokemon.base_hp,
          effective_attack: playerPokemon.base_attack,
          effective_defense: playerPokemon.base_defense,
          effective_speed: playerPokemon.base_speed,
          weatherMultiplier: 1.0,
          weatherStatus: 'none',
          statusCondition: 'none',
          statusTurns: 0,
          is_ko: false,
          team: 'team1',
          position: 0
        },
        currentTeam2Pokemon: {
          ...enemyPokemon,
          current_hp: enemyPokemon.base_hp,
          max_hp: enemyPokemon.base_hp,
          effective_attack: enemyPokemon.base_attack,
          effective_defense: enemyPokemon.base_defense,
          effective_speed: enemyPokemon.base_speed,
          weatherMultiplier: 1.0,
          weatherStatus: 'none',
          statusCondition: 'none',
          statusTurns: 0,
          is_ko: false,
          team: 'team2',
          position: 0
        },
        
        // Équipes complètes
        team1Pokemon: team1.pokemon,
        team2Pokemon: team2.pokemon,
        
        availableMoves,
        battleLog: [], // ✅ Log vide au début
        weatherEffects,
        weatherTurns: 0,
        timeBonus,
        winner: null,
        hackChallenge: null,
        isHackActive: false
      };
      
      // Stocker le combat
      this.activeBattles.set(battleId, interactiveState);
      
      // Auto-suppression après 10 minutes
      setTimeout(() => {
        this.activeBattles.delete(battleId);
      }, 10 * 60 * 1000);
      
      console.log(`🎮 Combat interactif initialisé: ${battleId} - En attente du joueur`);
      return interactiveState;
    });
  }
  
  /**
   * Exécuter le mouvement du joueur
   */
  static async executePlayerMove(request: PlayerMoveRequest): Promise<InteractiveBattleState> {
    
    return serviceWrapper(async () => {
      const battleState = this.activeBattles.get(request.battleId);
      if (!battleState) {
        throw new NotFoundError('Combat non trouvé ou expiré');
      }
      
      if (!battleState.waitingForPlayerMove) {
        throw new ValidationError('Ce n\'est pas votre tour');
      }
      
      if (request.moveIndex < 0 || request.moveIndex >= battleState.availableMoves.length) {
        throw new ValidationError('Index d\'attaque invalide');
      }
      
      const playerPokemon = battleState.currentTeam1Pokemon;
      const enemyPokemon = battleState.currentTeam2Pokemon;
      
      if (!playerPokemon || !enemyPokemon) {
        throw new ValidationError('Pokémon non disponible');
      }
      
      // Attaque choisie par le joueur
      const playerMove = battleState.availableMoves[request.moveIndex];
      
      // Attaque de l'IA (réutiliser la logique existante)
      const enemyMove = await this.selectEnemyMove(enemyPokemon);
      
      // Déterminer l'ordre (vitesse)
      const playerFirst = playerPokemon.effective_speed >= enemyPokemon.effective_speed;
      
      const newState = { ...battleState };
      
      if (playerFirst) {
        // Joueur attaque en premier
        await this.executeMove(newState, playerPokemon, enemyPokemon, playerMove, 'player');
        
        // Ennemi attaque (si encore vivant)
        if (!enemyPokemon.is_ko) {
          await this.executeMove(newState, enemyPokemon, playerPokemon, enemyMove, 'enemy');
        }
      } else {
        // Ennemi attaque en premier
        await this.executeMove(newState, enemyPokemon, playerPokemon, enemyMove, 'enemy');
        
        // Joueur attaque (si encore vivant)
        if (!playerPokemon.is_ko) {
          await this.executeMove(newState, playerPokemon, enemyPokemon, playerMove, 'player');
        }
      }
      
      // Vérifier le vainqueur
      this.checkWinner(newState);
      
      // ✅ CORRECTION : Vérifier si un hack doit être déclenché SEULEMENT pendant le tour du joueur
      if (!newState.winner && !newState.isHackActive && newState.isPlayerTurn && this.shouldTriggerHack()) {
        await this.triggerHackChallenge(newState);
      } else if (!newState.winner && !newState.isHackActive) {
        // Préparer le prochain tour normalement
        newState.turn++;
        newState.isPlayerTurn = true; // ✅ NOUVEAU : S'assurer que c'est le tour du joueur
        newState.waitingForPlayerMove = true;
        
        // Mettre à jour les attaques disponibles si le Pokémon a changé
        const currentPlayerPokemon = newState.currentTeam1Pokemon;
        if (currentPlayerPokemon) {
          newState.availableMoves = await PokemonMoveService.getPokemonMoves(currentPlayerPokemon.pokemon_id);
        }
      }
      
      // Sauvegarder l'état
      this.activeBattles.set(request.battleId, newState);
      
      return newState;
    });
  }
  
  /**
   * Obtenir l'état d'un combat
   */
  static getBattleState(battleId: string): InteractiveBattleState | null {
    return this.activeBattles.get(battleId) || null;
  }
  
  /**
   * Abandonner un combat
   */
  static forfeitBattle(battleId: string, userId: number): boolean {
    const battle = this.activeBattles.get(battleId);
    if (battle) {
      battle.winner = 'team2'; // L'ennemi gagne
      battle.phase = 'finished';
      battle.waitingForPlayerMove = false;
      this.activeBattles.set(battleId, battle);
      return true;
    }
    return false;
  }
  
  /**
   * Sélectionner une attaque pour l'ennemi (IA simple)
   */
  private static async selectEnemyMove(pokemon: BattlePokemon): Promise<PokemonMove> {
    const moves = await PokemonMoveService.getPokemonMoves(pokemon.pokemon_id);
    
    if (moves.length > 0) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      return moves[randomIndex];
    }
    
    // Attaque par défaut
    return {
      name: 'Charge',
      type: 'Normal',
      power: 40,
      accuracy: 100,
      pp: 35,
      category: 'physical',
      criticalHitRatio: 6.25,
      description: 'Attaque de base'
    };
  }
  
  /**
   * Exécuter une attaque
   */
  private static async executeMove(
    battleState: InteractiveBattleState,
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: PokemonMove,
    source: 'player' | 'enemy'
  ): Promise<void> {
    
    // ✅ Utiliser la méthode publique maintenant
    const action = TurnBasedBattleService.executeMove(
      attacker, 
      defender, 
      move, 
      battleState.turn, 
      battleState.weatherEffects
    );
    
    battleState.battleLog.push(action); // ✅ Pousser l'objet TurnAction complet
    
    // ✅ Appliquer les dégâts
    defender.current_hp = Math.max(0, defender.current_hp - action.damage);
    if (defender.current_hp === 0) {
      defender.is_ko = true;
      
      // ✅ SYNC : Marquer aussi le Pokémon dans le tableau de l'équipe
      const teamPokemon = defender.team === 'team1' ? battleState.team1Pokemon : battleState.team2Pokemon;
      const pokemonInTeam = teamPokemon.find(p => p.pokemon_id === defender.pokemon_id);
      if (pokemonInTeam) {
        pokemonInTeam.is_ko = true;
      }
      
      // ✅ Changer de Pokémon actif
      await this.switchToNextPokemon(battleState, defender.team);
    }
    
    console.log(`${source === 'player' ? '🎮' : '🤖'} ${attacker.name_fr} utilise ${move.name} → ${action.damage} dégâts`);
  }
  
  /**
   * Vérifier le vainqueur
   */
  private static checkWinner(battleState: InteractiveBattleState): void {
    const team1Alive = battleState.team1Pokemon.some(p => !p.is_ko);
    const team2Alive = battleState.team2Pokemon.some(p => !p.is_ko);
    
    if (!team1Alive && !team2Alive) {
      battleState.winner = 'draw';
    } else if (!team1Alive) {
      battleState.winner = 'team2';
    } else if (!team2Alive) {
      battleState.winner = 'team1';
    }
  }
  
  /**
   * Changer de Pokémon actif correctement préparé pour le combat
   */
  private static async switchToNextPokemon(
    battleState: InteractiveBattleState, 
    team: 'team1' | 'team2'
  ): Promise<void> {
    const teamPokemon = team === 'team1' ? battleState.team1Pokemon : battleState.team2Pokemon;
    const nextPokemonData = teamPokemon.find(p => !p.is_ko);
    
    if (!nextPokemonData) {
      // Plus de Pokémon disponibles
      if (team === 'team1') {
        battleState.currentTeam1Pokemon = null;
      } else {
        battleState.currentTeam2Pokemon = null;
      }
      return;
    }

    // ✅ Préparer correctement le nouveau Pokémon pour le combat
    const preparedPokemon: BattlePokemon = {
      pokemon_id: nextPokemonData.pokemon_id,
      name_fr: nextPokemonData.name_fr,
      type: nextPokemonData.type,
      level: nextPokemonData.level,
      base_hp: nextPokemonData.base_hp,
      base_attack: nextPokemonData.base_attack,
      base_defense: nextPokemonData.base_defense,
      base_speed: nextPokemonData.base_speed,
      sprite_url: nextPokemonData.sprite_url,
      
      // Stats de combat
      current_hp: nextPokemonData.base_hp,
      max_hp: nextPokemonData.base_hp,
      effective_attack: nextPokemonData.base_attack,
      effective_defense: nextPokemonData.base_defense,
      effective_speed: nextPokemonData.base_speed,
      is_ko: false,
      team,
      position: teamPokemon.indexOf(nextPokemonData),
      
      // Propriétés météo et statuts
      weatherMultiplier: 1.0,
      weatherStatus: 'none',
      statusCondition: 'none',
      statusTurns: 0
    };

    // ✅ Assigner le nouveau Pokémon
    if (team === 'team1') {
      battleState.currentTeam1Pokemon = preparedPokemon;
      // Mettre à jour les attaques disponibles
      battleState.availableMoves = await PokemonMoveService.getPokemonMoves(preparedPokemon.pokemon_id);
    } else {
      battleState.currentTeam2Pokemon = preparedPokemon;
    }

    // ✅ Ajouter un message au log
    battleState.battleLog.push({
      turn: battleState.turn,
      phase: 'move_execution',
      attacker: preparedPokemon,
      defender: preparedPokemon,
      move: { name: 'Changement', type: 'Normal', power: 0, accuracy: 100, pp: 0, category: 'status', criticalHitRatio: 0, description: 'Changement de Pokémon' },
      damage: 0,
      isCritical: false,
      typeEffectiveness: 1,
      stab: false,
      weatherBonus: 1,
      accuracy: true,
      description: `${preparedPokemon.name_fr} entre en combat !`,
      remainingHP: preparedPokemon.current_hp,
      isKO: false
    });

    console.log(`🔄 ${preparedPokemon.name_fr} entre en combat pour l'équipe ${team}`);
  }

  /**
   * 🎲 Vérifier si un hack doit être déclenché (probabilité)
   */
  private static shouldTriggerHack(): boolean {
    const hackProbability = 0.15; // 15% de chance par tour
    return Math.random() < hackProbability;
  }

  /**
   * 🚨 Déclencher un défi de hack
   */
  private static async triggerHackChallenge(battleState: InteractiveBattleState): Promise<void> {
    try {
      const challenge = await HackChallengeService.generateRandomChallenge();
      if (challenge) {
        battleState.hackChallenge = challenge;
        battleState.isHackActive = true;
        battleState.hackStartTime = Date.now();
        // ✅ CORRECTION : Garder waitingForPlayerMove = true pour que l'interface fonctionne
        battleState.waitingForPlayerMove = true;
        // ✅ NOUVEAU : S'assurer que c'est le tour du joueur
        battleState.isPlayerTurn = true;
        
        battleState.battleLog.push({
          turn: battleState.turn,
          phase: 'move_execution',
          attacker: battleState.currentTeam1Pokemon!,
          defender: battleState.currentTeam1Pokemon!,
          move: { name: 'Hack', type: 'Normal', power: 0, accuracy: 100, pp: 0, category: 'status', criticalHitRatio: 0, description: 'Défi de hack' },
          damage: 0,
          isCritical: false,
          typeEffectiveness: 1,
          stab: false,
          weatherBonus: 1,
          accuracy: true,
          description: `🚨 ALERTE HACK ! ${challenge.explanation}`,
          remainingHP: battleState.currentTeam1Pokemon!.current_hp,
          isKO: false
        });
        
        console.log(`🚨 Hack déclenché pendant le tour du joueur: ${challenge.algorithm} - Solution: ${challenge.solution}`);
      }
    } catch (error) {
      console.error('Erreur lors du déclenchement du hack:', error);
    }
  }

  /**
   * 🎯 Résoudre un défi de hack
   */
  static async solveHackChallenge(
    battleId: string, 
    answer: string
  ): Promise<{ success: boolean; message: string; battleState?: InteractiveBattleState }> {
    
    return serviceWrapper(async () => {
      const battleState = this.activeBattles.get(battleId);
      if (!battleState) {
        throw new NotFoundError('Combat non trouvé');
      }
      
      if (!battleState.isHackActive || !battleState.hackChallenge) {
        throw new ValidationError('Aucun défi de hack actif');
      }
      
      // Vérifier le temps limite
      const timeElapsed = (Date.now() - (battleState.hackStartTime || 0)) / 1000;
      if (timeElapsed > battleState.hackChallenge.time_limit) {
        // Temps écoulé - penalité
        await this.applyHackPenalty(battleState);
        return {
          success: false,
          message: `⏰ Temps écoulé ! Votre Pokémon perd 20% de ses HP.`,
          battleState
        };
      }
      
      // Vérifier la réponse
      const isCorrect = HackChallengeService.verifyAnswer(battleState.hackChallenge, answer);
      
      if (isCorrect) {
        // Succès - bonus
        await this.applyHackBonus(battleState);
        return {
          success: true,
          message: `🎉 Hack résolu ! Votre Pokémon gagne +15% d'attaque pour ce combat !`,
          battleState
        };
      } else {
        return {
          success: false,
          message: `❌ Réponse incorrecte ! Temps restant: ${Math.round(battleState.hackChallenge.time_limit - timeElapsed)}s`
        };
      }
    });
  }

  /**
   * 🎁 Appliquer bonus hack (réponse correcte)
   */
  private static async applyHackBonus(battleState: InteractiveBattleState): Promise<void> {
    if (battleState.currentTeam1Pokemon) {
      // +15% d'attaque temporaire
      battleState.currentTeam1Pokemon.effective_attack = Math.floor(
        battleState.currentTeam1Pokemon.effective_attack * 1.15
      );
      
      battleState.battleLog.push({
        turn: battleState.turn,
        phase: 'move_execution',
        attacker: battleState.currentTeam1Pokemon,
        defender: battleState.currentTeam1Pokemon,
        move: { name: 'Hack Bonus', type: 'Normal', power: 0, accuracy: 100, pp: 0, category: 'status', criticalHitRatio: 0, description: 'Bonus de hack' },
        damage: 0,
        isCritical: false,
        typeEffectiveness: 1,
        stab: false,
        weatherBonus: 1,
        accuracy: true,
        description: `✨ ${battleState.currentTeam1Pokemon.name_fr} gagne un bonus d'attaque grâce au hack !`,
        remainingHP: battleState.currentTeam1Pokemon.current_hp,
        isKO: false
      });
    }
    
    // ✅ CORRECTION : Réactiver le combat en mode joueur
    battleState.isHackActive = false;
    battleState.hackChallenge = null;
    battleState.hackStartTime = undefined;
    battleState.waitingForPlayerMove = true;
    battleState.isPlayerTurn = true; // ✅ NOUVEAU : S'assurer que c'est le tour du joueur
  }

  /**
   * 💀 Appliquer pénalité hack (échec/temps écoulé)
   */
  private static async applyHackPenalty(battleState: InteractiveBattleState): Promise<void> {
    if (battleState.currentTeam1Pokemon) {
      // -20% des HP actuels
      const penalty = Math.floor(battleState.currentTeam1Pokemon.current_hp * 0.2);
      battleState.currentTeam1Pokemon.current_hp = Math.max(1, battleState.currentTeam1Pokemon.current_hp - penalty);
      
      battleState.battleLog.push({
        turn: battleState.turn,
        phase: 'move_execution',
        attacker: battleState.currentTeam1Pokemon,
        defender: battleState.currentTeam1Pokemon,
        move: { name: 'Hack Penalty', type: 'Normal', power: 0, accuracy: 100, pp: 0, category: 'status', criticalHitRatio: 0, description: 'Pénalité de hack' },
        damage: penalty,
        isCritical: false,
        typeEffectiveness: 1,
        stab: false,
        weatherBonus: 1,
        accuracy: true,
        description: `💀 ${battleState.currentTeam1Pokemon.name_fr} subit une pénalité de hack (-${penalty} HP) !`,
        remainingHP: battleState.currentTeam1Pokemon.current_hp,
        isKO: battleState.currentTeam1Pokemon.current_hp <= 0
      });
      
      // Vérifier si KO par pénalité
      if (battleState.currentTeam1Pokemon.current_hp <= 0) {
        battleState.currentTeam1Pokemon.is_ko = true;
        const teamPokemon = battleState.team1Pokemon;
        const pokemonInTeam = teamPokemon.find(p => p.pokemon_id === battleState.currentTeam1Pokemon!.pokemon_id);
        if (pokemonInTeam) {
          pokemonInTeam.is_ko = true;
        }
        await this.switchToNextPokemon(battleState, 'team1');
      }
    }
    
    // ✅ CORRECTION : Réactiver le combat en mode joueur
    battleState.isHackActive = false;
    battleState.hackChallenge = null;
    battleState.hackStartTime = undefined;
    battleState.waitingForPlayerMove = true;
    battleState.isPlayerTurn = true; // ✅ NOUVEAU : S'assurer que c'est le tour du joueur
  }
} 