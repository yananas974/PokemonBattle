import type { BattleResult, BattleResponse, TeamStats, BattlePokemon, Pokemon } from '@pokemon-battle/shared';
import { PokemonType } from "../services/weatherEffectService/weatherEffectService.js";

// ✅ Mapper RESPONSE : Service → API
export const mapBattleResultToApi = (battleResult: BattleResult): BattleResponse => ({
  success: true,
  battle: battleResult,
  message: 'Combat simulé avec succès',
  weatherEffects: battleResult.weatherEffects,
  timeBonus: battleResult.timeBonus
});

// ✅ Mapper pour stats d'équipe (nettoyage)
export const mapTeamStatsToApi = (stats: TeamStats): TeamStats => ({
  totalHP: Math.round(stats.totalHP),
  remainingHP: Math.round(stats.remainingHP),
  pokemonCount: stats.pokemonCount,
  activePokemon: stats.activePokemon,
  faintedPokemon: stats.faintedPokemon,
  averageLevel: Math.round(stats.averageLevel * 100) / 100, // 2 décimales
  typeAdvantages: stats.typeAdvantages
});

// ✅ Mapper ERROR : Error → API
export const mapBattleErrorToApi = (error: string): BattleResponse => ({
  success: false,
  error,
  message: 'Erreur lors du combat'
}); 

export class PokemonMapper {
  static toBattlePokemon(pokemon: Pokemon): BattlePokemon {
    return {
      pokemon_id: pokemon.id,
      name_fr: pokemon.name_fr,
      type: pokemon.type,
      level: 50, // Niveau par défaut
      maxHp: pokemon.base_hp,
      currentHp: pokemon.base_hp,
      attack: pokemon.base_attack,
      defense: pokemon.base_defense,
      speed: pokemon.base_speed,
      sprite_url: pokemon.sprite_url,
      sprite_back_url: pokemon.back_sprite_url,
      status: 'normal'
    };
  }

  static toBattlePokemonArray(pokemons: Pokemon[]): BattlePokemon[] {
    return pokemons.map(pokemon => this.toBattlePokemon(pokemon));
  }
}