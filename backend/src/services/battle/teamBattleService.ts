import { WeatherEffectService, type WeatherEffectNew } from '../weatherEffectService/weatherEffectService.js';
import type { BattleResult, Team, TeamStats } from '../../models/interfaces/battle.interface.js';
import type { PokemonType } from '../../models/interfaces/pokemon.interface.js';
import { z } from 'zod';
import { serviceWrapper } from '../../utils/asyncWrapper.js';
import { ValidationError } from '../../models/errors.js';

// ✅ Schémas Zod pour validation interne du service
const pokemonSchema = z.object({
  pokemon_id: z.number().min(1),
  name_fr: z.string().min(1),
  type: z.string().min(1),
  hp: z.number().min(1),
  attack: z.number().min(1),
  defense: z.number().min(1),
  speed: z.number().min(1),
  sprite_url: z.string().default('')
});

const teamSchema = z.object({
  id: z.string().min(1),
  teamName: z.string().min(1),
  pokemon: z.array(pokemonSchema).min(1),
  owner: z.string().optional()
});

export class TeamBattleService {
 
  static async simulateTeamBattle(
    team1: Team,
    team2: Team,
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number = 1.0
  ): Promise<BattleResult> {
    
    return serviceWrapper(async () => {
      // ✅ Validation Zod des équipes
      const validatedTeam1 = teamSchema.parse(team1);
      const validatedTeam2 = teamSchema.parse(team2);
      
      // ✅ Validation des paramètres
      if (timeBonus <= 0) {
        throw new ValidationError('Time bonus must be positive');
      }
      
      const battleLog: string[] = [];
      
      battleLog.push(`⚔️ Combat entre "${validatedTeam1.teamName}" VS "${validatedTeam2.teamName}"`);
      battleLog.push(`🌤️ Conditions météo: ${weatherEffects?.description || 'Temps normal'}`);
      battleLog.push('');
      
      // ✅ Calculer les stats d'équipe
      const team1Stats = this.calculateTeamStats(validatedTeam1, weatherEffects, timeBonus, battleLog);
      const team2Stats = this.calculateTeamStats(validatedTeam2, weatherEffects, timeBonus, battleLog);
      
      battleLog.push('📊 RÉSUMÉ DES ÉQUIPES:');
      battleLog.push(`🔵 ${validatedTeam1.teamName}: ${team1Stats.effectiveAttack} ATK vs ${team1Stats.effectiveHP} HP`);
      battleLog.push(`🔴 ${validatedTeam2.teamName}: ${team2Stats.effectiveAttack} ATK vs ${team2Stats.effectiveHP} HP`);
      battleLog.push('');
      
      // ✅ Calculer les dégâts infligés
      const team1Damage = this.calculateTeamDamage(team1Stats, team2Stats, battleLog, validatedTeam1.teamName);
      const team2Damage = this.calculateTeamDamage(team2Stats, team1Stats, battleLog, validatedTeam2.teamName);
      
      // ✅ Calculer les HP restants
      const team1RemainingHP = Math.max(0, team1Stats.effectiveHP - team2Damage);
      const team2RemainingHP = Math.max(0, team2Stats.effectiveHP - team1Damage);
      
      battleLog.push('💥 RÉSULTAT DU COMBAT:');
      battleLog.push(`🔵 ${validatedTeam1.teamName}: ${team1RemainingHP}/${team1Stats.effectiveHP} HP restants`);
      battleLog.push(`🔴 ${validatedTeam2.teamName}: ${team2RemainingHP}/${team2Stats.effectiveHP} HP restants`);
      
      // ✅ Déterminer le vainqueur
      let winner: 'team1' | 'team2' | 'draw';
      if (team1RemainingHP > team2RemainingHP) {
        winner = 'team1';
        battleLog.push(`🏆 VICTOIRE DE "${validatedTeam1.teamName}" !`);
      } else if (team2RemainingHP > team1RemainingHP) {
        winner = 'team2';
        battleLog.push(`🏆 VICTOIRE DE "${validatedTeam2.teamName}" !`);
      } else {
        winner = 'draw';
        battleLog.push(`🤝 MATCH NUL !`);
      }
      
      return {
        winner,
        team1Stats,
        team2Stats,
        battleLog,
        weatherEffects,
        damage: {
          team1Damage,
          team2Damage
        }
      };
    });
  }
  
  /**
   * Calculer les stats totales d'une équipe avec effets météo
   */
  private static calculateTeamStats(
    team: Team,
    weatherEffects: WeatherEffectNew | null,
    timeBonus: number,
    battleLog: string[]
  ): TeamStats {
    let totalHP = 0;
    let totalAttack = 0;
    let totalDefense = 0;
    let totalSpeed = 0;
    let weatherMultiplier = 0;
    const pokemonDetails = [];
    
    battleLog.push(`🔍 Analyse de l'équipe "${team.teamName}":`);
    
    for (const pokemon of team.pokemon) {
      // ✅ Debug des stats de base
      console.log(`🐛 ${pokemon.name_fr} stats:`, {
        hp: pokemon.hp,
        attack: pokemon.attack,
        defense: pokemon.defense,
        speed: pokemon.speed
      });
      
      // ✅ Calculer l'effet météo sur ce Pokémon
      const pokemonMultiplier = weatherEffects?.getMultiplierFor 
        ? weatherEffects.getMultiplierFor(pokemon.type as PokemonType)
        : 1.0;
      
      const finalMultiplier = pokemonMultiplier * timeBonus;
      weatherMultiplier += pokemonMultiplier;
      
      // ✅ Appliquer les multiplicateurs avec les bons noms de propriétés
      const effectiveHP = Math.round((pokemon.hp || 0) * finalMultiplier);
      const effectiveAttack = Math.round((pokemon.attack || 0) * finalMultiplier);
      const effectiveDefense = Math.round((pokemon.defense || 0) * finalMultiplier);
      const effectiveSpeed = Math.round((pokemon.speed || 0) * finalMultiplier);
      
      totalHP += effectiveHP;
      totalAttack += effectiveAttack;
      totalDefense += effectiveDefense;
      totalSpeed += effectiveSpeed;
      
      // ✅ Status météo
      let weatherStatus = 'Non affecté';
      if (pokemonMultiplier > 1.05) {
        weatherStatus = `Renforcé (+${Math.round((pokemonMultiplier - 1) * 100)}%)`;
      } else if (pokemonMultiplier < 0.95) {
        weatherStatus = `Affaibli (-${Math.round((1 - pokemonMultiplier) * 100)}%)`;
      }
      
      pokemonDetails.push({
        name: pokemon.name_fr,
        type: pokemon.type,
        weatherStatus,
        multiplier: pokemonMultiplier
      });
      
      battleLog.push(`  • ${pokemon.name_fr} (${pokemon.type}): ${weatherStatus}`);
    }
    
    const avgMultiplier = weatherMultiplier / team.pokemon.length;
    battleLog.push(`  📈 Stats totales: ${totalAttack} ATK, ${totalDefense} DEF, ${totalHP} HP`);
    battleLog.push('');
    
    return {
      totalHP: totalHP / timeBonus, // Stats de base
      totalAttack: totalAttack / timeBonus,
      totalDefense: totalDefense / timeBonus,
      totalSpeed: totalSpeed / timeBonus,
      weatherMultiplier: avgMultiplier,
      effectiveHP: totalHP, // Stats avec météo
      effectiveAttack: totalAttack,
      effectiveDefense: totalDefense,
      pokemonDetails
    };
  }
  
  /**
   * Calculer les dégâts qu'une équipe inflige à l'autre
   */
  private static calculateTeamDamage(
    attackingTeam: TeamStats,
    defendingTeam: TeamStats,
    battleLog: string[],
    teamName: string
  ): number {
    // ✅ Formule de dégâts simplifiée
    const baseDamage = Math.max(1, attackingTeam.effectiveAttack - defendingTeam.effectiveDefense);
    
    // ✅ Bonus de vitesse (équipe plus rapide fait +10% de dégâts)
    const speedBonus = attackingTeam.totalSpeed > defendingTeam.totalSpeed ? 1.1 : 1.0;
    
    // ✅ Bonus météo moyen de l'équipe
    const weatherBonus = attackingTeam.weatherMultiplier;
    
    const finalDamage = Math.round(baseDamage * speedBonus * weatherBonus);
    
    battleLog.push(`⚡ ${teamName} inflige ${finalDamage} dégâts (base: ${baseDamage}, vitesse: x${speedBonus}, météo: x${weatherBonus.toFixed(2)})`);
    
    return finalDamage;
  }
} 