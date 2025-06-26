import { WeatherEffectService, type WeatherEffectNew } from '../weatherEffectService/weatherEffectService.js';
import type { BattleResult, TeamStats } from '../../models/interfaces/battle.interface.js';
import type { Team } from '../../models/interfaces/team.interface.js';
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
      
      // ✅ Calculer les stats d'équipe directement
      const team1Stats = {
        totalHP: validatedTeam1.pokemon.reduce((sum, p) => sum + p.hp, 0),
        totalAttack: validatedTeam1.pokemon.reduce((sum, p) => sum + p.attack, 0),
        totalDefense: validatedTeam1.pokemon.reduce((sum, p) => sum + p.defense, 0),
        totalSpeed: validatedTeam1.pokemon.reduce((sum, p) => sum + p.speed, 0),
        weatherMultiplier: 1.0,
        effectiveHP: validatedTeam1.pokemon.reduce((sum, p) => sum + p.hp, 0),
        effectiveAttack: validatedTeam1.pokemon.reduce((sum, p) => sum + p.attack, 0),
        effectiveDefense: validatedTeam1.pokemon.reduce((sum, p) => sum + p.defense, 0),
        pokemonDetails: []
      };

      const team2Stats = {
        totalHP: validatedTeam2.pokemon.reduce((sum, p) => sum + p.hp, 0),
        totalAttack: validatedTeam2.pokemon.reduce((sum, p) => sum + p.attack, 0),
        totalDefense: validatedTeam2.pokemon.reduce((sum, p) => sum + p.defense, 0),
        totalSpeed: validatedTeam2.pokemon.reduce((sum, p) => sum + p.speed, 0),
        weatherMultiplier: 1.0,
        effectiveHP: validatedTeam2.pokemon.reduce((sum, p) => sum + p.hp, 0),
        effectiveAttack: validatedTeam2.pokemon.reduce((sum, p) => sum + p.attack, 0),
        effectiveDefense: validatedTeam2.pokemon.reduce((sum, p) => sum + p.defense, 0),
        pokemonDetails: []
      };
      
      battleLog.push('📊 RÉSUMÉ DES ÉQUIPES:');
      battleLog.push(`🔵 ${validatedTeam1.teamName}: ${team1Stats.effectiveAttack} ATK vs ${team1Stats.effectiveHP} HP`);
      battleLog.push(`🔴 ${validatedTeam2.teamName}: ${team2Stats.effectiveAttack} ATK vs ${team2Stats.effectiveHP} HP`);
      battleLog.push('');
      
      // ✅ Calculer les dégâts directement
      const team1Damage = Math.max(1, team1Stats.effectiveAttack - team2Stats.effectiveDefense);
      const team2Damage = Math.max(1, team2Stats.effectiveAttack - team1Stats.effectiveDefense);
      
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
      
      // ✅ AJOUTÉ: Return explicite du BattleResult
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
}