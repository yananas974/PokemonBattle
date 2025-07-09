import { PokemonMove, TurnAction, ExtendedBattlePokemon } from '../types/battle';
import { BATTLE_CONSTANTS, DEFAULT_MOVE, POKEMON_STATUS } from '../constants/battles';

// ✅ HELPERS POUR LES COMBATS INTERACTIFS

/**
 * Génère un ID de combat unique
 */
export function generateBattleId(): string {
  return `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Prépare un Pokémon pour le combat avec toutes les stats nécessaires
 */
export function preparePokemonForBattle(
  pokemonData: any, 
  team: 'team1' | 'team2', 
  position: number
): ExtendedBattlePokemon {
  return {
    pokemon_id: pokemonData.pokemon_id,
    name_fr: pokemonData.name_fr,
    type: pokemonData.type,
    level: pokemonData.level || 50,
    maxHp: pokemonData.base_hp,
    currentHp: pokemonData.base_hp,
    attack: pokemonData.base_attack,
    defense: pokemonData.base_defense,
    speed: pokemonData.base_speed,
    sprite_url: pokemonData.sprite_url,
    status: 'normal',
    
    // ✅ Propriétés étendues pour les combats
    base_hp: pokemonData.base_hp,
    base_attack: pokemonData.base_attack,
    base_defense: pokemonData.base_defense,
    base_speed: pokemonData.base_speed,
    current_hp: pokemonData.base_hp,
    max_hp: pokemonData.base_hp,
    effective_attack: pokemonData.base_attack,
    effective_defense: pokemonData.base_defense,
    effective_speed: pokemonData.base_speed,
    is_ko: false,
    team,
    position,
    weatherMultiplier: 1.0,
    weatherStatus: POKEMON_STATUS.NONE,
    statusCondition: POKEMON_STATUS.NONE,
    statusTurns: 0
  };
}

/**
 * Crée une action de log pour le changement de Pokémon
 */
export function createPokemonSwitchAction(
  pokemon: ExtendedBattlePokemon, 
  turn: number
): TurnAction {
  return {
    turn,
    phase: 'move_execution',
    attacker: pokemon,
    defender: pokemon,
    move: { 
      name: 'Changement', 
      type: 'Normal', 
      power: 0, 
      accuracy: 100, 
      pp: 0, 
      category: 'status', 
      criticalHitRatio: 0, 
      description: 'Changement de Pokémon' 
    },
    damage: 0,
    isCritical: false,
    typeEffectiveness: 1,
    stab: false,
    weatherBonus: 1,
    accuracy: true,
    description: `${pokemon.name_fr} entre en combat !`,
    remainingHP: pokemon.current_hp,
    isKO: false
  };
}

/**
 * Crée une action de log pour les événements de hack
 */
export function createHackLogAction(
  pokemon: ExtendedBattlePokemon, 
  turn: number, 
  actionType: 'hack_triggered' | 'hack_bonus' | 'hack_penalty',
  description: string,
  damage: number = 0
): TurnAction {
  const moveNames = {
    hack_triggered: 'Hack Challenge',
    hack_bonus: 'Hack Bonus',
    hack_penalty: 'Hack Penalty'
  };

  return {
    turn,
    phase: 'move_execution',
    attacker: pokemon,
    defender: pokemon,
    move: { 
      name: moveNames[actionType], 
      type: 'Normal', 
      power: 0, 
      accuracy: 100, 
      pp: 0, 
      category: 'status', 
      criticalHitRatio: 0, 
      description: 'Événement de hack' 
    },
    damage,
    isCritical: false,
    typeEffectiveness: 1,
    stab: false,
    weatherBonus: 1,
    accuracy: true,
    description,
    remainingHP: pokemon.current_hp,
    isKO: pokemon.current_hp <= 0
  };
}

/**
 * Vérifie si une équipe a encore des Pokémon vivants
 */
export function hasAlivePokemon(teamPokemon: any[]): boolean {
  return teamPokemon.some(p => !p.is_ko);
}

/**
 * Trouve le prochain Pokémon vivant dans une équipe
 */
export function findNextAlivePokemon(teamPokemon: any[]): any | null {
  return teamPokemon.find(p => !p.is_ko) || null;
}

/**
 * Détermine le vainqueur d'un combat
 */
export function determineWinner(
  team1Pokemon: any[], 
  team2Pokemon: any[]
): 'team1' | 'team2' | 'draw' | null {
  const team1Alive = hasAlivePokemon(team1Pokemon);
  const team2Alive = hasAlivePokemon(team2Pokemon);
  
  if (!team1Alive && !team2Alive) {
    return 'draw';
  } else if (!team1Alive) {
    return 'team2';
  } else if (!team2Alive) {
    return 'team1';
  }
  
  return null; // Combat en cours
}

/**
 * Applique les dégâts à un Pokémon et met à jour son statut
 */
export function applyDamage(pokemon: ExtendedBattlePokemon, damage: number): void {
  pokemon.current_hp = Math.max(0, pokemon.current_hp - damage);
  if (pokemon.current_hp === 0) {
    pokemon.is_ko = true;
  }
}

/**
 * Applique un bonus d'attaque temporaire
 */
export function applyAttackBonus(pokemon: ExtendedBattlePokemon, multiplier: number = BATTLE_CONSTANTS.ATTACK_BONUS_MULTIPLIER): void {
  pokemon.effective_attack = Math.floor(pokemon.effective_attack * multiplier);
}

/**
 * Applique une pénalité de HP
 */
export function applyHPPenalty(pokemon: ExtendedBattlePokemon, penaltyMultiplier: number = BATTLE_CONSTANTS.HP_PENALTY_MULTIPLIER): number {
  const penalty = Math.floor(pokemon.current_hp * penaltyMultiplier);
  const newHP = Math.max(BATTLE_CONSTANTS.MIN_HP_AFTER_PENALTY, pokemon.current_hp - penalty);
  pokemon.current_hp = newHP;
  
  if (pokemon.current_hp <= 0) {
    pokemon.is_ko = true;
  }
  
  return penalty;
}

/**
 * Synchronise le statut KO entre le Pokémon actuel et l'équipe
 */
export function syncPokemonKOStatus(activePokemon: ExtendedBattlePokemon, teamPokemon: any[]): void {
  const pokemonInTeam = teamPokemon.find(p => p.pokemon_id === activePokemon.pokemon_id);
  if (pokemonInTeam && activePokemon.is_ko) {
    pokemonInTeam.is_ko = true;
  }
}

/**
 * Retourne l'attaque par défaut si aucune attaque n'est disponible
 */
export function getDefaultMove(): PokemonMove {
  return { ...DEFAULT_MOVE };
}

/**
 * Calcule si un hack doit être déclenché
 */
export function shouldTriggerHack(probability: number = BATTLE_CONSTANTS.HACK_PROBABILITY): boolean {
  return Math.random() < probability;
}

/**
 * Formate le temps restant pour un challenge
 */
export function formatTimeRemaining(timeElapsed: number, timeLimit: number): string {
  const remaining = Math.round(timeLimit - timeElapsed);
  return `${remaining}s`;
} 