import type { Context } from "hono";
import { WeatherEffectService } from "../services/weatherEffectService/weatherEffectService.js";
import type { BattlePokemon } from "../models/interfaces/pokemon.interface.js";

export const simulateBattleHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    const { attackerId, defenderId, lat, lon } = await c.req.json();

    if (!attackerId || !defenderId) {
      return c.json({ error: 'attackerId et defenderId sont requis' }, 400);
    }

    // ✅ Utiliser les nouvelles méthodes du service
    const mockWeatherCondition = 'Clear'; // À remplacer par votre API météo
    const effects = WeatherEffectService.getWeatherEffectByCondition(mockWeatherCondition);
    const timeBonus = WeatherEffectService.calculateTimeBonus();

    // ✅ Utiliser l'interface
    const attacker: BattlePokemon = { 
      id: attackerId, 
      name_fr: 'Pokémon 1', 
      type: 'Feu',
      base_hp: 100, 
      base_attack: 80, 
      base_defense: 60, 
      base_speed: 70 
    };

    const defender: BattlePokemon = { 
      id: defenderId, 
      name_fr: 'Pokémon 2', 
      type: 'Eau',
      base_hp: 90, 
      base_attack: 70, 
      base_defense: 80, 
      base_speed: 60 
    };

    // ✅ Calculer les stats et simuler le combat
    const finalAttacker = WeatherEffectService.calculatePokemonStats(attacker, effects, timeBonus);
    const finalDefender = WeatherEffectService.calculatePokemonStats(defender, effects, timeBonus);
    const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(attacker.type, defender.type);

    const winner = finalAttacker.effective_attack > finalDefender.effective_defense ? 'attacker' : 'defender';

    return c.json({
      success: true,
      message: 'Combat simulé avec succès',
      battle: {
        winner,
        attackerStats: finalAttacker,
        defenderStats: finalDefender,
        typeEffectiveness,
        weatherEffects: effects
      }
    });

  } catch (error) {
    console.error('Erreur simulation combat:', error);
    return c.json({ 
      error: error instanceof Error ? error.message : 'Erreur lors de la simulation'
    }, 500);
  }
};