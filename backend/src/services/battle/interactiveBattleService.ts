
// ✅ IMPORTS REFACTORISÉS AVEC SHARED
import { 
  TurnBasedBattleState, 
  InteractiveBattleState, 
  PlayerMoveRequest,
  HackChallengeResponse,
  PokemonMove,
  TurnAction,
  HackChallenge,
  BATTLE_CONSTANTS,
  INTERACTIVE_BATTLE_MESSAGES,
  HACK_CHALLENGE_MESSAGES,
  BATTLE_PHASE_CONSTANTS,
  BATTLE_TEAMS,
  ACTION_SOURCES,
  POKEMON_STATUS,
  generateBattleId,
  preparePokemonForBattle,
  createPokemonSwitchAction,
  createHackLogAction,
  determineWinner,
  applyDamage,
  applyAttackBonus,
  applyHPPenalty,
  syncPokemonKOStatus,
  getDefaultMove,
  shouldTriggerHack,
  formatTimeRemaining
} from '@pokemon-battle/shared';

import { TurnBasedBattleService, type BattlePokemon } from './turnBasedBattleService.js';
import { PokemonMoveService } from '../pokemonMoveService/pokemonMoveService.js';
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { ValidationError, NotFoundError } from '../../models/errors.js';
import { HackChallengeService } from '../hackService/hackChallengeService.js';

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
      const battleId = generateBattleId();
      
      // ✅ Préparer les Pokémon avec les helpers du shared
      const playerPokemon = preparePokemonForBattle(team1.pokemon[0], BATTLE_TEAMS.TEAM1, 0);
      const enemyPokemon = preparePokemonForBattle(team2.pokemon[0], BATTLE_TEAMS.TEAM2, 0);
      
      // Récupérer les attaques du Pokémon joueur
      const availableMoves = await PokemonMoveService.getPokemonMoves(playerPokemon.pokemon_id);
      
      const interactiveState: InteractiveBattleState = {
        battleId,
        turn: 1,
        phase: BATTLE_PHASE_CONSTANTS.BATTLE,
        battlePhase: BATTLE_PHASE_CONSTANTS.MOVE_SELECTION,
        isPlayerTurn: true,
        waitingForPlayerMove: true,
        
        // Pokémon actuels préparés
        currentTeam1Pokemon: playerPokemon,
        currentTeam2Pokemon: enemyPokemon,
        
        // Équipes complètes
        team1Pokemon: team1.pokemon,
        team2Pokemon: team2.pokemon,
        
        availableMoves,
        battleLog: [],
        weatherEffects,
        weatherTurns: 0,
        timeBonus,
        winner: null,
        hackChallenge: null,
        isHackActive: false
      };
      
      // Stocker le combat avec auto-suppression
      this.activeBattles.set(battleId, interactiveState);
      setTimeout(() => {
        this.activeBattles.delete(battleId);
      }, BATTLE_CONSTANTS.BATTLE_TIMEOUT);
      
      console.log(INTERACTIVE_BATTLE_MESSAGES.INITIALIZED, battleId);
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
        throw new NotFoundError(INTERACTIVE_BATTLE_MESSAGES.EXPIRED);
      }
      
      if (!battleState.waitingForPlayerMove) {
        throw new ValidationError(INTERACTIVE_BATTLE_MESSAGES.NOT_YOUR_TURN);
      }
      
      if (request.moveIndex < 0 || request.moveIndex >= battleState.availableMoves.length) {
        throw new ValidationError('Index d\'attaque invalide');
      }
      
      const playerPokemon = battleState.currentTeam1Pokemon;
      const enemyPokemon = battleState.currentTeam2Pokemon;
      
      if (!playerPokemon || !enemyPokemon) {
        throw new ValidationError('Pokémon non disponible');
      }
      
      // Attaques
      const playerMove = battleState.availableMoves[request.moveIndex];
      const enemyMove = await this.selectEnemyMove(enemyPokemon);
      
      // Déterminer l'ordre (vitesse)
      const playerFirst = playerPokemon.effective_speed >= enemyPokemon.effective_speed;
      
      // ✅ Deep copy des objets Pokemon pour éviter les mutations non voulues
      const newState = { 
        ...battleState,
        currentTeam1Pokemon: battleState.currentTeam1Pokemon ? { ...battleState.currentTeam1Pokemon } : null,
        currentTeam2Pokemon: battleState.currentTeam2Pokemon ? { ...battleState.currentTeam2Pokemon } : null,
        battleLog: [...battleState.battleLog]
      };
      
      // ✅ Récupérer les références des nouveaux objets
      const newPlayerPokemon = newState.currentTeam1Pokemon!;
      const newEnemyPokemon = newState.currentTeam2Pokemon!;
      
      if (playerFirst) {
        await this.executeMove(newState, newPlayerPokemon, newEnemyPokemon, playerMove, ACTION_SOURCES.PLAYER);
        if (!newEnemyPokemon.is_ko) {
          await this.executeMove(newState, newEnemyPokemon, newPlayerPokemon, enemyMove, ACTION_SOURCES.ENEMY);
        }
      } else {
        await this.executeMove(newState, newEnemyPokemon, newPlayerPokemon, enemyMove, ACTION_SOURCES.ENEMY);
        if (!newPlayerPokemon.is_ko) {
          await this.executeMove(newState, newPlayerPokemon, newEnemyPokemon, playerMove, ACTION_SOURCES.PLAYER);
        }
      }
      
      // ✅ Utiliser le helper du shared pour déterminer le vainqueur
      newState.winner = determineWinner(newState.team1Pokemon, newState.team2Pokemon);
      
      // ✅ Gestion des hacks avec les constantes du shared
      // Les hacks ne se déclenchent QUE pour le joueur humain (team1), jamais pour l'IA (team2)
      // IMPORTANT : Une fois qu'un hack est résolu, plus aucun hack ne peut se déclencher dans ce combat
      const hasResolvedHack = (newState as any).lastHackTurn !== undefined;
      
      console.log(`🔍 Hack check: turn=${newState.turn}, isPlayerTurn=${newState.isPlayerTurn}, hasResolvedHack=${hasResolvedHack}`);
      
      // DÉSACTIVATION COMPLÈTE : Pas de nouveaux hacks si un a déjà été résolu
      if (hasResolvedHack) {
        console.log('🚫 HACKS DÉSACTIVÉS - Un hack a déjà été résolu dans ce combat');
      } else if (!newState.winner && !newState.isHackActive && newState.isPlayerTurn && shouldTriggerHack()) {
        console.log('🚨 Hack déclenché pour le JOUEUR !');
        await this.triggerHackChallenge(newState);
      } else {
        if (!newState.isPlayerTurn) {
          console.log('🤖 Tour de l\'IA - pas de hack possible');
        }
      }
      
      // Continuer le combat normalement si pas de hack actif
      if (!newState.winner && !newState.isHackActive) {
        newState.turn++;
        newState.isPlayerTurn = true; // ✅ Toujours revenir au joueur après un tour
        newState.waitingForPlayerMove = true;
        
        const currentPlayerPokemon = newState.currentTeam1Pokemon;
        if (currentPlayerPokemon) {
          newState.availableMoves = await PokemonMoveService.getPokemonMoves(currentPlayerPokemon.pokemon_id);
        }
      }
      
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
      battle.winner = BATTLE_TEAMS.TEAM2;
      battle.phase = BATTLE_PHASE_CONSTANTS.FINISHED;
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
    
    return getDefaultMove();
  }
  
  /**
   * Exécuter une attaque
   */
  private static async executeMove(
    battleState: InteractiveBattleState,
    attacker: BattlePokemon,
    defender: BattlePokemon,
    move: PokemonMove,
    source: string
  ): Promise<void> {
    
    const action = TurnBasedBattleService.executeMove(
      attacker, 
      defender, 
      move, 
      battleState.turn, 
      battleState.weatherEffects
    );
    
    battleState.battleLog.push(action as any);
    
    // ✅ Utiliser le helper du shared pour appliquer les dégâts
    applyDamage(defender as any, action.damage);
    
    if (defender.is_ko) {
      // ✅ Utiliser le helper du shared pour synchroniser le statut KO
      const teamPokemon = defender.team === BATTLE_TEAMS.TEAM1 ? battleState.team1Pokemon : battleState.team2Pokemon;
      syncPokemonKOStatus(defender as any, teamPokemon);
      
      await this.switchToNextPokemon(battleState, defender.team as 'team1' | 'team2');
    }
    
    const emoji = source === ACTION_SOURCES.PLAYER ? '🎮' : '🤖';
    console.log(`${emoji} ${attacker.name_fr} ${INTERACTIVE_BATTLE_MESSAGES.USES_MOVE} ${move.name} → ${action.damage} dégâts`);
  }
  
  /**
   * Changer de Pokémon actif
   */
  private static async switchToNextPokemon(
    battleState: InteractiveBattleState, 
    team: 'team1' | 'team2'
  ): Promise<void> {
    const teamPokemon = team === BATTLE_TEAMS.TEAM1 ? battleState.team1Pokemon : battleState.team2Pokemon;
    const nextPokemonData = teamPokemon.find(p => !p.is_ko);
    
    if (!nextPokemonData) {
      if (team === BATTLE_TEAMS.TEAM1) {
        battleState.currentTeam1Pokemon = null;
      } else {
        battleState.currentTeam2Pokemon = null;
      }
      return;
    }

    // ✅ Utiliser le helper du shared pour préparer le nouveau Pokémon
    const preparedPokemon = preparePokemonForBattle(
      nextPokemonData, 
      team, 
      teamPokemon.indexOf(nextPokemonData)
    );

    if (team === BATTLE_TEAMS.TEAM1) {
      battleState.currentTeam1Pokemon = preparedPokemon;
      battleState.availableMoves = await PokemonMoveService.getPokemonMoves(preparedPokemon.pokemon_id);
    } else {
      battleState.currentTeam2Pokemon = preparedPokemon;
    }

    // ✅ Utiliser le helper du shared pour créer l'action de log
    const switchAction = createPokemonSwitchAction(preparedPokemon, battleState.turn);
    battleState.battleLog.push(switchAction);

    console.log(`🔄 ${preparedPokemon.name_fr} ${INTERACTIVE_BATTLE_MESSAGES.POKEMON_SWITCHED} l'équipe ${team}`);
  }

  /**
   * Déclencher un défi de hack
   * ⚠️  IMPORTANT : Les hacks ne peuvent être déclenchés QUE pour le joueur humain (team1)
   */
  private static async triggerHackChallenge(battleState: InteractiveBattleState): Promise<void> {
    // ✅ Double vérification : hack uniquement pour le joueur
    if (!battleState.isPlayerTurn || !battleState.currentTeam1Pokemon) {
      console.log('🚫 Tentative de hack bloquée - pas le tour du joueur ou pas de Pokémon joueur');
      return;
    }
    
    try {
      const challenge = await HackChallengeService.generateRandomChallenge();
      if (challenge) {
        battleState.hackChallenge = challenge;
        battleState.isHackActive = true;
        battleState.hackStartTime = Date.now();
        battleState.waitingForPlayerMove = true;
        battleState.isPlayerTurn = true; // ✅ Force le tour joueur
        
        // ✅ Utiliser les helpers du shared pour créer l'action de log
        const hackAction = createHackLogAction(
          battleState.currentTeam1Pokemon!,
          battleState.turn,
          'hack_triggered',
          `${HACK_CHALLENGE_MESSAGES.TRIGGERED} ${challenge.explanation}`
        );
        battleState.battleLog.push(hackAction);
        
        console.log(`🚨 Hack déclenché pour le JOUEUR: ${challenge.algorithm} - Solution: ${challenge.solution}`);
      }
    } catch (error) {
      console.error('Erreur lors du déclenchement du hack:', error);
    }
  }

  /**
   * Résoudre un défi de hack
   */
  static async solveHackChallenge(
    battleId: string, 
    answer: string
  ): Promise<HackChallengeResponse> {
    
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
        await this.applyHackPenalty(battleState);
        // Sauvegarder l'état mis à jour après la pénalité
        this.activeBattles.set(battleId, battleState);
        return {
          success: false,
          message: HACK_CHALLENGE_MESSAGES.TIMEOUT,
          battleState
        };
      }
      
      // Vérifier la réponse
      const isCorrect = HackChallengeService.verifyAnswer(battleState.hackChallenge, answer);
      
      if (isCorrect) {
        await this.applyHackBonus(battleState);
        // Sauvegarder l'état mis à jour après le bonus
        this.activeBattles.set(battleId, battleState);
        return {
          success: true,
          message: HACK_CHALLENGE_MESSAGES.SUCCESS,
          battleState
        };
      } else {
        // Pour les mauvaises réponses, on garde le hack actif mais on informe l'utilisateur
        const timeRemaining = formatTimeRemaining(timeElapsed, battleState.hackChallenge.time_limit);
        return {
          success: false,
          message: `${HACK_CHALLENGE_MESSAGES.FAILURE} ${HACK_CHALLENGE_MESSAGES.TIME_REMAINING} ${timeRemaining}`,
          battleState
        };
      }
    });
  }

  /**
   * Appliquer bonus hack
   */
  private static async applyHackBonus(battleState: InteractiveBattleState): Promise<void> {
    if (battleState.currentTeam1Pokemon) {
      // ✅ Utiliser le helper du shared pour appliquer le bonus
      applyAttackBonus(battleState.currentTeam1Pokemon);
      
      const bonusAction = createHackLogAction(
        battleState.currentTeam1Pokemon,
        battleState.turn,
        'hack_bonus',
        `${HACK_CHALLENGE_MESSAGES.BONUS_APPLIED} ${battleState.currentTeam1Pokemon.name_fr} !`
      );
      battleState.battleLog.push(bonusAction);
    }
    
    this.resetHackState(battleState);
  }

  /**
   * Appliquer pénalité hack
   */
  private static async applyHackPenalty(battleState: InteractiveBattleState): Promise<void> {
    if (battleState.currentTeam1Pokemon) {
      // ✅ Utiliser le helper du shared pour appliquer la pénalité
      const penalty = applyHPPenalty(battleState.currentTeam1Pokemon);
      
      const penaltyAction = createHackLogAction(
        battleState.currentTeam1Pokemon,
        battleState.turn,
        'hack_penalty',
        `${HACK_CHALLENGE_MESSAGES.PENALTY_APPLIED} ${battleState.currentTeam1Pokemon.name_fr} (-${penalty} HP) !`,
        penalty
      );
      battleState.battleLog.push(penaltyAction);
      
      // Vérifier si KO par pénalité
      if (battleState.currentTeam1Pokemon.is_ko) {
        syncPokemonKOStatus(battleState.currentTeam1Pokemon, battleState.team1Pokemon);
        await this.switchToNextPokemon(battleState, BATTLE_TEAMS.TEAM1);
      }
    }
    
    this.resetHackState(battleState);
  }

  /**
   * Réinitialiser l'état du hack
   */
  private static resetHackState(battleState: InteractiveBattleState): void {
    battleState.isHackActive = false;
    battleState.hackChallenge = null;
    battleState.hackStartTime = undefined;
    battleState.waitingForPlayerMove = true;
    battleState.isPlayerTurn = true;
    
    // ✅ Marquer le tour où le hack a été résolu pour éviter les hacks consécutifs
    (battleState as any).lastHackTurn = battleState.turn;
  }
} 