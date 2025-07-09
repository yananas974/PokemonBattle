import { serviceWrapper } from '../../utils/asyncWrapper.js';
import type { BattleResult } from '@pokemon-battle/shared';
import { ValidationService } from '@pokemon-battle/shared';

export class TeamBattleService {

  static async simulateTeamBattle(team1: any, team2: any, weatherEffects: any = null, timeBonus: number = 0): Promise<BattleResult> {
    return serviceWrapper(async () => {
      console.log('🎮 Début simulation combat équipe vs équipe');
      
      // ✅ Validation centralisée
      const validatedTeam1 = ValidationService.validateTeamBattle({ 
        team1, 
        team2, 
        lat: 48.8566, 
        lon: 2.3522 
      });
      
      // Simulation simplifiée du combat
      const team1Stats = {
        totalHP: team1.pokemon.reduce((sum: number, p: any) => sum + p.hp, 0),
        pokemonCount: team1.pokemon.length,
        averageLevel: Math.round(team1.pokemon.reduce((sum: number, p: any) => sum + (p.level || 50), 0) / team1.pokemon.length)
      };

      const team2Stats = {
        totalHP: team2.pokemon.reduce((sum: number, p: any) => sum + p.hp, 0),
        pokemonCount: team2.pokemon.length,
        averageLevel: Math.round(team2.pokemon.reduce((sum: number, p: any) => sum + (p.level || 50), 0) / team2.pokemon.length)
      };

      // Déterminer le vainqueur basé sur les stats
      const team1Power = team1Stats.totalHP + team1Stats.averageLevel * 10;
      const team2Power = team2Stats.totalHP + team2Stats.averageLevel * 10;
      
      let winner: 'team1' | 'team2' | 'draw';
      if (Math.abs(team1Power - team2Power) < 50) {
        winner = 'draw';
      } else {
        winner = team1Power > team2Power ? 'team1' : 'team2';
      }

      // Logs de bataille simplifiés
      const battleLog = [
        `${team1.teamName} VS ${team2.teamName} - Combat démarré !`,
        `Équipe 1: ${team1Stats.pokemonCount} Pokémon (Niveau moyen: ${team1Stats.averageLevel})`,
        `Équipe 2: ${team2Stats.pokemonCount} Pokémon (Niveau moyen: ${team2Stats.averageLevel})`,
        winner === 'draw' ? '🤝 Match nul !' : `🏆 ${winner === 'team1' ? team1.teamName : team2.teamName} remporte le combat !`
      ];

      // Retour avec tous les champs requis pour BattleResult
      const remainingHP = 0;
      const pokemonCount = 0;
      const activePokemon = 0;
      const faintedPokemon = 0;
      const averageLevel = 0;
      const typeAdvantages: string[] = [];

      return {
        winner,
        team1Stats: { ...team1Stats, remainingHP, pokemonCount, activePokemon, faintedPokemon, averageLevel, typeAdvantages },
        team2Stats: { ...team2Stats, remainingHP, pokemonCount, activePokemon, faintedPokemon, averageLevel, typeAdvantages },
        battleLog: battleLog.map((message, index) => ({ id: index, battle_id: 0, action_type: 'attack', pokemon_id: 0, message, timestamp: new Date().toISOString() })),
        duration: Math.floor(Math.random() * 300) + 60,
        totalTurns: Math.max(1, Math.floor(battleLog.length / 2)),
        weatherEffects,
        timeBonus
      };
    });
  }
}