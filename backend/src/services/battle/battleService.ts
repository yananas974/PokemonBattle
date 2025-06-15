import { WeatherEffectService } from "../weatherEffectService/weatherEffectService.js";
import { WeatherEffectNew } from "../weatherEffectService/weatherEffectService.js";

export class BattleService {

  // ✅ GARDER - Logique de combat pure
  static simulateBattle(
    attacker: any, 
    defender: any, 
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number
  ): {
    winner: 'attacker' | 'defender';
    damage: number;
    effectiveness: number;
    weatherBonus: number;
    battleLog: string[];
  } {
    const log: string[] = [];
    
    // ✅ Utiliser WeatherEffectService
    const finalAttacker = WeatherEffectService.calculatePokemonStats(attacker, weatherEffects, timeBonus);
    const finalDefender = WeatherEffectService.calculatePokemonStats(defender, weatherEffects, timeBonus);
    const typeEffectiveness = WeatherEffectService.calculateTypeEffectiveness(attacker.type, defender.type);
    
    log.push(`🌤️ Conditions météo: ${weatherEffects?.description || 'Temps normal'}`);
    log.push(`⚔️ ${attacker.name_fr} (${finalAttacker.weatherStatus}) VS ${defender.name_fr} (${finalDefender.weatherStatus})`);
    
    // Calculer l'efficacité des types
    let effectivenessText = '';
    if (typeEffectiveness === 2.0) effectivenessText = 'C\'est super efficace !';
    else if (typeEffectiveness === 0.5) effectivenessText = 'Ce n\'est pas très efficace...';
    else if (typeEffectiveness === 0) effectivenessText = 'Ça n\'a aucun effet !';
    else effectivenessText = 'Efficacité normale';
    
    log.push(`🎯 ${attacker.type} contre ${defender.type}: ${effectivenessText}`);
    
    // Calculer les dégâts
    const baseDamage = Math.max(1, finalAttacker.effective_attack - finalDefender.effective_defense);
    const finalDamage = Math.round(baseDamage * typeEffectiveness);
    
    log.push(`💥 Dégâts calculés: ${finalDamage} (base: ${baseDamage} × ${typeEffectiveness})`);
    
    // Déterminer le vainqueur (simplifié)
    const attackerScore = finalAttacker.effective_attack + finalAttacker.effective_speed + finalAttacker.effective_hp;
    const defenderScore = finalDefender.effective_defense + finalDefender.effective_speed + finalDefender.effective_hp;
    
    const winner = attackerScore > defenderScore ? 'attacker' : 'defender';
    log.push(`🏆 Vainqueur: ${winner === 'attacker' ? attacker.name_fr : defender.name_fr}`);
    
    return {
      winner,
      damage: finalDamage,
      effectiveness: typeEffectiveness,
      weatherBonus: finalAttacker.totalMultiplier,
      battleLog: log
    };
  }

  // ✅ Autres méthodes de combat...
}