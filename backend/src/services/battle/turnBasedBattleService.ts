import { WeatherEffectService, type WeatherEffectNew } from '../weatherEffectService/weatherEffectService.js';

export interface BattlePokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  sprite_url: string;
  // Stats de combat
  current_hp: number;
  effective_attack: number;
  effective_defense: number;
  effective_speed: number;
  is_ko: boolean;
  team: 'team1' | 'team2';
  position: number; // Position dans l'équipe (0-5)
  weatherMultiplier: number;
  weatherStatus: string;
}

export interface TurnAction {
  turn: number;
  attacker: BattlePokemon;
  defender: BattlePokemon;
  damage: number;
  isCritical: boolean;
  effectiveness: number;
  description: string;
  remainingHP: number;
  isKO: boolean;
}

export interface TurnBasedBattleState {
  turn: number;
  phase: 'setup' | 'battle' | 'finished';
  team1Pokemon: BattlePokemon[];
  team2Pokemon: BattlePokemon[];
  currentTeam1Pokemon: BattlePokemon | null;
  currentTeam2Pokemon: BattlePokemon | null;
  turnOrder: BattlePokemon[];
  battleLog: TurnAction[];
  winner: 'team1' | 'team2' | 'draw' | null;
  weatherEffects: WeatherEffectNew | null;
  timeBonus: number;
}

export class TurnBasedBattleService {
  
  /**
   * Initialiser un combat tour par tour
   */
  static initializeBattle(
    team1: any,
    team2: any,
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number = 1.0
  ): TurnBasedBattleState {
    
    // ✅ Préparer les Pokémon pour le combat
    const team1Pokemon = this.preparePokemonForBattle(team1.pokemon, 'team1', weatherEffects, timeBonus);
    const team2Pokemon = this.preparePokemonForBattle(team2.pokemon, 'team2', weatherEffects, timeBonus);
    
    // ✅ Déterminer l'ordre des tours basé sur la vitesse
    const allPokemon = [...team1Pokemon, ...team2Pokemon];
    const turnOrder = allPokemon
      .filter(p => !p.is_ko)
      .sort((a, b) => b.effective_speed - a.effective_speed);
    
    return {
      turn: 1,
      phase: 'battle',
      team1Pokemon,
      team2Pokemon,
      currentTeam1Pokemon: team1Pokemon.find(p => !p.is_ko) || null,
      currentTeam2Pokemon: team2Pokemon.find(p => !p.is_ko) || null,
      turnOrder,
      battleLog: [],
      winner: null,
      weatherEffects,
      timeBonus
    };
  }
  
  /**
   * Exécuter un tour de combat automatique
   */
  static executeTurn(battleState: TurnBasedBattleState): TurnBasedBattleState {
    if (battleState.phase !== 'battle' || battleState.winner) {
      return battleState;
    }
    
    const newState = { ...battleState };
    
    // ✅ Déterminer qui attaque ce tour
    const activePokemon = newState.turnOrder.filter(p => !p.is_ko);
    if (activePokemon.length < 2) {
      return this.checkWinner(newState);
    }
    
    const attackerIndex = (newState.turn - 1) % activePokemon.length;
    const attacker = activePokemon[attackerIndex];
    
    // ✅ Trouver la cible (Pokémon adverse le plus rapide encore vivant)
    const opposingTeam = attacker.team === 'team1' ? 'team2' : 'team1';
    const possibleTargets = activePokemon.filter(p => p.team === opposingTeam && !p.is_ko);
    
    if (possibleTargets.length === 0) {
      return this.checkWinner(newState);
    }
    
    const defender = possibleTargets[0]; // Attaque le plus rapide adverse
    
    // ✅ Calculer l'attaque
    const turnAction = this.calculateAttack(attacker, defender, newState.turn);
    
    // ✅ Appliquer les dégâts
    defender.current_hp = Math.max(0, defender.current_hp - turnAction.damage);
    if (defender.current_hp === 0) {
      defender.is_ko = true;
      turnAction.isKO = true;
    }
    
    // ✅ Mettre à jour l'état
    newState.battleLog.push(turnAction);
    newState.turn++;
    
    // ✅ Mettre à jour les Pokémon actifs
    newState.currentTeam1Pokemon = newState.team1Pokemon.find(p => !p.is_ko) || null;
    newState.currentTeam2Pokemon = newState.team2Pokemon.find(p => !p.is_ko) || null;
    
    // ✅ Recalculer l'ordre des tours
    newState.turnOrder = newState.turnOrder.filter(p => !p.is_ko);
    
    return this.checkWinner(newState);
  }
  
  /**
   * Simuler un combat complet jusqu'à la fin
   */
  static simulateFullBattle(
    team1: any,
    team2: any,
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number = 1.0,
    maxTurns: number = 50
  ): TurnBasedBattleState {
    
    let battleState = this.initializeBattle(team1, team2, weatherEffects, timeBonus);
    
    while (battleState.phase === 'battle' && battleState.turn <= maxTurns && !battleState.winner) {
      battleState = this.executeTurn(battleState);
    }
    
    if (battleState.turn > maxTurns && !battleState.winner) {
      battleState.winner = 'draw';
      battleState.phase = 'finished';
    }
    
    return battleState;
  }
  
  /**
   * Préparer les Pokémon pour le combat avec les effets météo
   */
  private static preparePokemonForBattle(
    pokemon: any[],
    team: 'team1' | 'team2',
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number
  ): BattlePokemon[] {
    
    return pokemon.map((p, index) => {
      // ✅ Calculer l'effet météo
      const weatherMultiplier = weatherEffects?.getMultiplierFor 
        ? weatherEffects.getMultiplierFor(p.type)
        : 1.0;
      
      const finalMultiplier = weatherMultiplier * timeBonus;
      
      // ✅ Stats de combat
      const effective_hp = Math.round(p.base_hp * finalMultiplier);
      const effective_attack = Math.round(p.base_attack * finalMultiplier);
      const effective_defense = Math.round(p.base_defense * finalMultiplier);
      const effective_speed = Math.round(p.base_speed * finalMultiplier);
      
      // ✅ Status météo
      let weatherStatus = 'Normal';
      if (weatherMultiplier > 1.05) {
        weatherStatus = `Renforcé (+${Math.round((weatherMultiplier - 1) * 100)}%)`;
      } else if (weatherMultiplier < 0.95) {
        weatherStatus = `Affaibli (-${Math.round((1 - weatherMultiplier) * 100)}%)`;
      }
      
      return {
        pokemon_id: p.pokemon_id,
        name_fr: p.name_fr,
        type: p.type,
        base_hp: p.base_hp,
        base_attack: p.base_attack,
        base_defense: p.base_defense,
        base_speed: p.base_speed,
        sprite_url: p.sprite_url,
        current_hp: effective_hp,
        effective_attack,
        effective_defense,
        effective_speed,
        is_ko: false,
        team,
        position: index,
        weatherMultiplier,
        weatherStatus
      };
    });
  }
  
  /**
   * Calculer une attaque entre deux Pokémon
   */
  private static calculateAttack(attacker: BattlePokemon, defender: BattlePokemon, turn: number): TurnAction {
    // ✅ Efficacité des types
    const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(
      attacker.type as any, 
      defender.type as any
    );
    
    // ✅ Calcul des dégâts de base
    const baseDamage = Math.max(1, attacker.effective_attack - defender.effective_defense);
    
    // ✅ Coup critique (5% de chance)
    const isCritical = Math.random() < 0.05;
    const criticalMultiplier = isCritical ? 1.5 : 1.0;
    
    // ✅ Variation aléatoire (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    
    // ✅ Dégâts finaux
    const finalDamage = Math.round(
      baseDamage * typeEffectiveness * criticalMultiplier * randomFactor
    );
    
    // ✅ Description de l'attaque
    let description = `${attacker.name_fr} attaque ${defender.name_fr}`;
    if (isCritical) description += ' (CRITIQUE!)';
    if (typeEffectiveness > 1) description += ' (Super efficace!)';
    if (typeEffectiveness < 1) description += ' (Peu efficace...)';
    
    return {
      turn,
      attacker,
      defender,
      damage: finalDamage,
      isCritical,
      effectiveness: typeEffectiveness,
      description,
      remainingHP: Math.max(0, defender.current_hp - finalDamage),
      isKO: (defender.current_hp - finalDamage) <= 0
    };
  }
  
  /**
   * Vérifier s'il y a un vainqueur
   */
  private static checkWinner(battleState: TurnBasedBattleState): TurnBasedBattleState {
    const team1Alive = battleState.team1Pokemon.some(p => !p.is_ko);
    const team2Alive = battleState.team2Pokemon.some(p => !p.is_ko);
    
    if (!team1Alive && !team2Alive) {
      battleState.winner = 'draw';
      battleState.phase = 'finished';
    } else if (!team1Alive) {
      battleState.winner = 'team2';
      battleState.phase = 'finished';
    } else if (!team2Alive) {
      battleState.winner = 'team1';
      battleState.phase = 'finished';
    }
    
    return battleState;
  }
} 