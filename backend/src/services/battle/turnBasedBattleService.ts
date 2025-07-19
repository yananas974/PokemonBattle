import { WeatherEffectService, type WeatherEffectNew } from '../weatherEffectService/weatherEffectService.js';
import { PokemonMoveService } from '../pokemonMoveService/pokemonMoveService.js';

export interface BattlePokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  level: number;
  base_hp: number;
  base_attack: number;
  base_defense: number;
  base_speed: number;
  sprite_url: string;
  // Stats de combat
  current_hp: number;
  max_hp: number;
  effective_attack: number;
  effective_defense: number;
  effective_speed: number;
  is_ko: boolean;
  team: 'team1' | 'team2';
  position: number;
  // Météo
  weatherMultiplier: number;
  weatherStatus: string;
  // Statuts de combat
  statusCondition: 'none' | 'burn' | 'freeze' | 'paralysis' | 'poison' | 'sleep';
  statusTurns: number;
}

export interface PokemonMove {
  name: string;
  type: string;
  power: number;
  accuracy: number;
  pp: number;
  category: 'physical' | 'special' | 'status';
  criticalHitRatio: number;
  description: string;
}

export interface TurnAction {
  turn: number;
  phase: 'move_selection' | 'move_execution' | 'status_effects' | 'weather_effects';
  attacker: BattlePokemon;
  defender: BattlePokemon;
  move: PokemonMove;
  damage: number;
  isCritical: boolean;
  typeEffectiveness: number;
  stab: boolean; // Same Type Attack Bonus
  weatherBonus: number;
  accuracy: boolean;
  description: string;
  remainingHP: number;
  isKO: boolean;
}

export interface TurnBasedBattleState {
  turn: number;
  phase: 'setup' | 'battle' | 'finished';
  battlePhase: 'move_selection' | 'move_execution' | 'status_damage' | 'weather_damage' | 'end_turn';
  team1Pokemon: BattlePokemon[];
  team2Pokemon: BattlePokemon[];
  currentTeam1Pokemon: BattlePokemon | null;
  currentTeam2Pokemon: BattlePokemon | null;
  battleLog: TurnAction[];
  winner: 'team1' | 'team2' | 'draw' | null;
  weatherEffects: WeatherEffectNew | null;
  weatherTurns: number;
  timeBonus: number;
}

export class TurnBasedBattleService {
  
  /**
   * Initialiser un combat Pokémon authentique
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
    
    return {
      turn: 1,
      phase: 'battle',
      battlePhase: 'move_selection',
      team1Pokemon,
      team2Pokemon,
      currentTeam1Pokemon: team1Pokemon.find(p => !p.is_ko) || null,
      currentTeam2Pokemon: team2Pokemon.find(p => !p.is_ko) || null,
      battleLog: [],
      winner: null,
      weatherEffects,
      weatherTurns: weatherEffects ? 5 : 0, // ✅ La météo dure 5 tours comme dans Pokémon
      timeBonus
    };
  }

  /**
   * Simuler un combat complet avec logique Pokémon authentique
   */
  static async simulateFullBattle(
    team1: any,
    team2: any,
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number = 1.0,
    maxTurns: number = 100
  ): Promise<TurnBasedBattleState> {
    
    let battleState = this.initializeBattle(team1, team2, weatherEffects, timeBonus);
    
    while (battleState.phase === 'battle' && battleState.turn <= maxTurns && !battleState.winner) {
      battleState = await this.executePokemonTurn(battleState);
    }
    
    if (battleState.turn > maxTurns && !battleState.winner) {
      battleState.winner = 'draw';
      battleState.phase = 'finished';
    }
    
    return battleState;
  }

  /**
   * Exécuter un tour complet de combat Pokémon
   */
  private static async executePokemonTurn(battleState: TurnBasedBattleState): Promise<TurnBasedBattleState> {
    if (battleState.phase !== 'battle' || battleState.winner) {
      return battleState;
    }

    const newState = { ...battleState };
    
    // ✅ PHASE 1: Sélection des attaques (automatique)
    const team1Active = newState.currentTeam1Pokemon;
    const team2Active = newState.currentTeam2Pokemon;
    
    if (!team1Active || !team2Active) {
      return this.checkWinner(newState);
    }

    // ✅ PHASE 2: Déterminer l'ordre de priorité (Vitesse)
    const firstAttacker = team1Active.effective_speed >= team2Active.effective_speed ? team1Active : team2Active;
    const secondAttacker = firstAttacker === team1Active ? team2Active : team1Active;

    // ✅ PHASE 3: Exécution des attaques
    // Premier attaquant
    if (!firstAttacker.is_ko) {
      const move1 = await this.selectMove(firstAttacker);
      const target1 = firstAttacker === team1Active ? team2Active : team1Active;
      
      if (!target1.is_ko) {
        const action1 = this.executeMove(firstAttacker, target1, move1, newState.turn, newState.weatherEffects);
        newState.battleLog.push(action1);
        
        // Appliquer les dégâts
        target1.current_hp = Math.max(0, target1.current_hp - action1.damage);
        if (target1.current_hp === 0) {
          target1.is_ko = true;
          action1.isKO = true;
          // ✅ Changer de Pokémon actif
          this.switchToNextPokemon(newState, target1.team);
        }
      }
    }

    // Deuxième attaquant (si encore vivant)
    if (!secondAttacker.is_ko) {
      const move2 = await this.selectMove(secondAttacker);
      const target2 = secondAttacker === team1Active ? team2Active : team1Active;
      
      if (!target2.is_ko) {
        const action2 = this.executeMove(secondAttacker, target2, move2, newState.turn, newState.weatherEffects);
        newState.battleLog.push(action2);
        
        // Appliquer les dégâts
        target2.current_hp = Math.max(0, target2.current_hp - action2.damage);
        if (target2.current_hp === 0) {
          target2.is_ko = true;
          action2.isKO = true;
          // ✅ Changer de Pokémon actif
          this.switchToNextPokemon(newState, target2.team);
        }
      }
    }

    // ✅ PHASE 4: Effets de statut (poison, brûlure, etc.)
    this.applyStatusEffects(newState);

    // ✅ PHASE 5: Effets météorologiques
    this.applyWeatherEffects(newState);

    // ✅ PHASE 6: Fin de tour
    newState.turn++;
    newState.weatherTurns = Math.max(0, newState.weatherTurns - 1);
    
    // La météo se dissipe après 5 tours
    if (newState.weatherTurns === 0) {
      newState.weatherEffects = null;
    }

    return this.checkWinner(newState);
  }

  /**
   * Préparer les Pokémon avec stats Pokémon authentiques
   */
  private static preparePokemonForBattle(
    pokemon: any[],
    team: 'team1' | 'team2',
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number
  ): BattlePokemon[] {
    
    return pokemon.map((p, index) => {
      // ✅ Niveau par défaut
      const level = p.level || 50;
      
      // ✅ Calcul des stats selon la formule Pokémon Gen 1
      // HP = ((Base + IV) * 2 + sqrt(EV)/4) * Level/100 + Level + 10
      // Autres stats = ((Base + IV) * 2 + sqrt(EV)/4) * Level/100 + 5
      
      const iv = 15; // IV maximum en Gen 1 (0-15)
      const ev = 65535; // EV maximum en Gen 1
      
      const hp = Math.floor(((p.base_hp + iv) * 2 + Math.sqrt(ev) / 4) * level / 100 + level + 10);
      const attack = Math.floor(((p.base_attack + iv) * 2 + Math.sqrt(ev) / 4) * level / 100 + 5);
      const defense = Math.floor(((p.base_defense + iv) * 2 + Math.sqrt(ev) / 4) * level / 100 + 5);
      const speed = Math.floor(((p.base_speed + iv) * 2 + Math.sqrt(ev) / 4) * level / 100 + 5);

      // ✅ Effet météo
      const weatherMultiplier = weatherEffects?.getMultiplierFor 
        ? weatherEffects.getMultiplierFor(p.type)
        : 1.0;
      
      const finalMultiplier = weatherMultiplier * timeBonus;
      
      // ✅ Appliquer les bonus météo
      const effective_attack = Math.round(attack * finalMultiplier);
      const effective_defense = Math.round(defense * finalMultiplier);
      const effective_speed = Math.round(speed * finalMultiplier);
      
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
        level,
        base_hp: p.base_hp,
        base_attack: p.base_attack,
        base_defense: p.base_defense,
        base_speed: p.base_speed,
        sprite_url: p.sprite_url,
        current_hp: hp,
        max_hp: hp,
        effective_attack,
        effective_defense,
        effective_speed,
        is_ko: false,
        team,
        position: index,
        weatherMultiplier,
        weatherStatus,
        statusCondition: 'none',
        statusTurns: 0
      };
    });
  }

  /**
   * Sélectionner une attaque aléatoire pour un Pokémon depuis la BDD
   */
  private static async selectMove(pokemon: BattlePokemon): Promise<PokemonMove> {
    try {
      const moves = await PokemonMoveService.getPokemonMoves(pokemon.pokemon_id);
      
      if (moves.length > 0) {
        const randomIndex = Math.floor(Math.random() * moves.length);
        const selectedMove = moves[randomIndex];
        
        // ✅ Log plus visible
        console.log(`🎲 ${pokemon.name_fr} choisit ${selectedMove.name} (${selectedMove.type}, ${selectedMove.power} power)`);
        
        return selectedMove;
      }
      
      // ✅ Attaque de secours si aucune trouvée en BDD
      console.log(`⚠️ Aucune attaque trouvée pour ${pokemon.name_fr}, utilisation de Charge`);
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
      
    } catch (error) {
      console.error(`❌ Erreur lors de la sélection d'attaque pour ${pokemon.name_fr}:`, error);
      
      // ✅ Attaque de secours en cas d'erreur
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
  }

  /**
   * Exécuter une attaque avec la formule de dégâts Pokémon Gen 1
   */
  public static executeMove(
    attacker: BattlePokemon, 
    defender: BattlePokemon, 
    move: PokemonMove, 
    turn: number,
    weatherEffects: WeatherEffectNew | null
  ): TurnAction {
    
    // ✅ Test de précision
    const accuracy = Math.random() * 100 <= move.accuracy;
    
    if (!accuracy) {
      return {
        turn,
        phase: 'move_execution',
        attacker,
        defender,
        move,
        damage: 0,
        isCritical: false,
        typeEffectiveness: 1,
        stab: false,
        weatherBonus: 1,
        accuracy: false,
        description: `${attacker.name_fr} utilise ${move.name} mais rate son attaque !`,
        remainingHP: defender.current_hp,
        isKO: false
      };
    }

    // ✅ Calcul de dégâts selon la formule Pokémon Gen 1
    // Damage = ((2 * Level + 10) / 250) * (Attack / Defense) * Base + 2) * Modifiers
    
    const level = attacker.level;
    const attackStat = move.category === 'physical' ? attacker.effective_attack : attacker.effective_attack; // Pas de Special en Gen 1
    const defenseStat = move.category === 'physical' ? defender.effective_defense : defender.effective_defense;
    
    // ✅ Calcul de base
    const baseDamage = Math.floor(
      ((2 * level + 10) / 250) * (attackStat / defenseStat) * move.power + 2
    );
    
    // ✅ STAB (Same Type Attack Bonus) - 50% de bonus si même type
    const stab = attacker.type === move.type;
    const stabMultiplier = stab ? 1.5 : 1.0;
    
    // ✅ Efficacité des types
    const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(
      move.type as any, 
      defender.type as any
    );
    
    // ✅ Coup critique (basé sur la vitesse en Gen 1)
    const criticalChance = Math.min(255, attacker.effective_speed) / 512;
    const isCritical = Math.random() < criticalChance;
    const criticalMultiplier = isCritical ? 2.0 : 1.0;
    
    // ✅ Bonus météo - utiliser le même système que preparePokemonForBattle
    let weatherBonus = 1.0;
    if (weatherEffects && weatherEffects.getMultiplierFor) {
      // Calculer le bonus météo pour le type de l'attaque
      weatherBonus = weatherEffects.getMultiplierFor(move.type as any);
      console.log(`🌤️ Calcul weatherBonus: Type ${move.type} avec ${weatherEffects.condition} = ${weatherBonus}`);
    }
    
    // ✅ Variation aléatoire (85-100% en Gen 1)
    const randomFactor = (Math.floor(Math.random() * 16) + 85) / 100;
    
    // ✅ Dégâts finaux
    const finalDamage = Math.max(1, Math.floor(
      baseDamage * stabMultiplier * typeEffectiveness * criticalMultiplier * weatherBonus * randomFactor
    ));
    
    // ✅ Description détaillée
    let description = `${attacker.name_fr} utilise ${move.name}`;

    // ✅ Ajouter le type de l'attaque pour plus de clarté
    if (move.type !== attacker.type) {
      description += ` (${move.type})`;
    }

    description += ' !';

    if (isCritical) description += ' Coup critique !';
    if (typeEffectiveness > 1) description += ' C\'est super efficace !';
    if (typeEffectiveness < 1) description += ' Ce n\'est pas très efficace...';
    if (stab) description += ' (STAB)';
    if (weatherBonus !== 1.0) {
      description += weatherBonus > 1.0 ? ' (Renforcé par la météo)' : ' (Affaibli par la météo)';
    }
    
    return {
      turn,
      phase: 'move_execution',
      attacker,
      defender,
      move,
      damage: finalDamage,
      isCritical,
      typeEffectiveness,
      stab,
      weatherBonus,
      accuracy: true,
      description,
      remainingHP: Math.max(0, defender.current_hp - finalDamage),
      isKO: (defender.current_hp - finalDamage) <= 0
    };
  }

  /**
   * Changer de Pokémon actif quand un Pokémon est KO
   */
  public static switchToNextPokemon(battleState: TurnBasedBattleState, team: 'team1' | 'team2'): void {
    const teamPokemon = team === 'team1' ? battleState.team1Pokemon : battleState.team2Pokemon;
    const nextPokemon = teamPokemon.find(p => !p.is_ko);
    
    if (team === 'team1') {
      battleState.currentTeam1Pokemon = nextPokemon || null;
    } else {
      battleState.currentTeam2Pokemon = nextPokemon || null;
    }
  }

  /**
   * Appliquer les effets de statut (poison, brûlure, etc.)
   */
  private static applyStatusEffects(battleState: TurnBasedBattleState): void {
    // ✅ Implémentation future pour les statuts
    // Pour l'instant, on garde simple
  }

  /**
   * Appliquer les effets météorologiques en fin de tour
   */
  private static applyWeatherEffects(battleState: TurnBasedBattleState): void {
    if (!battleState.weatherEffects) return;
    
    // ✅ Dégâts météo (tempête de sable, grêle)
    if (battleState.weatherEffects.condition.includes('Tempête')) {
      [battleState.currentTeam1Pokemon, battleState.currentTeam2Pokemon].forEach(pokemon => {
        if (pokemon && !pokemon.is_ko && pokemon.type !== 'Sol' && pokemon.type !== 'Roche') {
          const sandDamage = Math.floor(pokemon.max_hp / 16); // 1/16 des HP max
          pokemon.current_hp = Math.max(0, pokemon.current_hp - sandDamage);
          if (pokemon.current_hp === 0) {
            pokemon.is_ko = true;
          }
          
          battleState.battleLog.push({
            turn: battleState.turn,
            phase: 'weather_effects',
            attacker: pokemon,
            defender: pokemon,
            move: { name: 'Tempête de Sable', type: 'Sol', power: 0, accuracy: 100, pp: 0, category: 'status', criticalHitRatio: 0, description: 'Dégâts de tempête' },
            damage: sandDamage,
            isCritical: false,
            typeEffectiveness: 1,
            stab: false,
            weatherBonus: 1,
            accuracy: true,
            description: `${pokemon.name_fr} est blessé par la tempête de sable !`,
            remainingHP: pokemon.current_hp,
            isKO: pokemon.current_hp === 0
          });
        }
      });
    }
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