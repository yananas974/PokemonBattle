import type { BattleResult, BattleResponse, TeamStats, BattlePokemon } from "../models/interfaces/battle.interface.js";
import { Pokemon } from "../models/interfaces/pokemon.interface.js";
import { PokemonType } from "../services/weatherEffectService/weatherEffectService.js";

// ✅ Mapper RESPONSE : Service → API
export const mapBattleResultToApi = (battleResult: BattleResult): BattleResponse => ({
  success: true,
  result: {
    winner: battleResult.winner,
    team1Stats: mapTeamStatsToApi(battleResult.team1Stats),
    team2Stats: mapTeamStatsToApi(battleResult.team2Stats),
    battleLog: battleResult.battleLog,
    weatherEffects: battleResult.weatherEffects,
    damage: battleResult.damage
  }
});

// ✅ Mapper pour stats d'équipe (nettoyage)
export const mapTeamStatsToApi = (stats: TeamStats): TeamStats => ({
  ...stats,
  // ✅ Arrondir les valeurs pour l'API
  totalHP: Math.round(stats.totalHP),
  totalAttack: Math.round(stats.totalAttack),
  totalDefense: Math.round(stats.totalDefense),
  totalSpeed: Math.round(stats.totalSpeed),
  weatherMultiplier: Math.round(stats.weatherMultiplier * 100) / 100, // 2 décimales
  effectiveHP: Math.round(stats.effectiveHP),
  effectiveAttack: Math.round(stats.effectiveAttack),
  effectiveDefense: Math.round(stats.effectiveDefense)
});

// ✅ Mapper ERROR : Error → API
export const mapBattleErrorToApi = (error: string): BattleResponse => ({
  success: false,
  error
}); 

export class PokemonMapper {
  static toBattlePokemon(pokemon: Pokemon): BattlePokemon {
    return {
      id: pokemon.id,
      name_fr: pokemon.name,
      type: pokemon.type as PokemonType,
      base_hp: pokemon.hp,
      base_attack: pokemon.attack,
      base_defense: pokemon.defense,
      base_speed: pokemon.speed,
    };
  }

  static toBattlePokemonArray(pokemons: Pokemon[]): BattlePokemon[] {
    return pokemons.map(pokemon => this.toBattlePokemon(pokemon));
  }
}