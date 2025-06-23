import type { Context } from "hono";
import { TeamBattleService, TurnBasedBattleService, WeatherEffectService } from "../services/services.js";
import { mapBattleResultToApi, mapBattleErrorToApi } from '../mapper/battle.mapper.js';
import { Team } from "../models/interfaces/battle.interface.js";
import { z } from 'zod';

// ✅ Ajouter les schémas Zod manquants
const teamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  teamName: z.string().min(1, "Team name is required"),
  pokemon: z.array(z.object({
    pokemon_id: z.number().min(1, "Pokemon ID must be positive"),
    name_fr: z.string().min(1, "Pokemon name is required"),
    type: z.string().min(1, "Pokemon type is required"),
    hp: z.number().min(1, "HP must be positive"),
    attack: z.number().min(1, "Attack must be positive"),
    defense: z.number().min(1, "Defense must be positive"),
    speed: z.number().min(1, "Speed must be positive"),
    sprite_url: z.string().optional()
  })).min(1, "Team must have at least one Pokemon")
});

const teamBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522)
});

const turnBasedBattleSchema = z.object({
  team1: teamSchema,
  team2: teamSchema,
  lat: z.number().min(-90).max(90).optional().default(48.8566),
  lon: z.number().min(-180).max(180).optional().default(2.3522),
  mode: z.enum(['init', 'turn', 'full']).optional().default('full')
});

export const simulateTeamBattleHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { team1, team2, lat, lon } = teamBattleSchema.parse(body);
    
    if (!team1 || !team2) {
      return c.json({ error: 'Deux équipes sont requises' }, 400);
    }

    if (!team1.pokemon || team1.pokemon.length === 0) {
      return c.json({ error: 'L\'équipe 1 doit avoir au moins un Pokémon' }, 400);
    }
    
    if (!team2.pokemon || team2.pokemon.length === 0) {
      return c.json({ error: 'L\'équipe 2 doit avoir au moins un Pokémon' }, 400);
    }

    console.log(`⚔️ Combat simulé entre "${team1.teamName}" VS "${team2.teamName}"`);
    
    // ✅ Récupérer la VRAIE météo au lieu de 'ClearDay' en dur
    let weatherCondition = 'ClearDay'; // Défaut
    try {
      const { WeatherService } = await import('../services/weatherService/weatherService.js');
      const weatherService = new WeatherService();
      const weatherData = await weatherService.getWeatherByCoordinates(lat || 48.8566, lon || 2.3522);
      
      // ✅ Déterminer jour/nuit
      const currentHour = new Date().getHours();
      const isNight = currentHour < 6 || currentHour > 18;
      
      // ✅ Mapper la condition OpenWeatherMap vers nos conditions
      if (weatherData.description.toLowerCase().includes('clear') || weatherData.description.toLowerCase().includes('dégagé')) {
        weatherCondition = isNight ? 'ClearNight' : 'ClearDay';
      } else if (weatherData.description.toLowerCase().includes('rain') || weatherData.description.toLowerCase().includes('pluie')) {
        weatherCondition = 'Rain';
      } else if (weatherData.description.toLowerCase().includes('snow') || weatherData.description.toLowerCase().includes('neige')) {
        weatherCondition = 'Snow';
      } else if (weatherData.description.toLowerCase().includes('storm') || weatherData.description.toLowerCase().includes('orage')) {
        weatherCondition = 'Thunderstorm';
      }
      
      console.log(`🌤️ Condition météo détectée: ${weatherCondition} (${weatherData.description})`);
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer la météo, utilisation de ClearDay par défaut');
    }
    
    const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
    const timeBonus = WeatherEffectService.calculateTimeBonus();

    // ✅ Simuler le combat
    const battleResult = await TeamBattleService.simulateTeamBattle(
      team1 as Team,
      team2 as Team,
      weatherEffects,
      timeBonus
    );
    
    console.log(`🏆 Résultat: ${battleResult.winner}`);
    
    // ✅ Utiliser le mapper pour la réponse
    return c.json(mapBattleResultToApi(battleResult));
    
  } catch (error: any) {
    console.error('❌ Erreur simulation combat:', error);
    
    if (error instanceof z.ZodError) {
      return c.json(mapBattleErrorToApi('Validation failed'), 400);
    }
    
    // ✅ Utiliser le mapper pour les erreurs
    return c.json(mapBattleErrorToApi('Erreur lors de la simulation de combat'), 500);
  }
};

export const simulateTurnBasedBattleHandler = async (c: Context) => {
  try {
    const { team1, team2, lat, lon, mode = 'full' } = await c.req.json();
    
    if (!team1 || !team2) {
      return c.json({ error: 'Deux équipes sont requises' }, 400);
    }
    
    console.log(`🎮 Combat tour par tour: "${team1.teamName}" VS "${team2.teamName}"`);

    // ✅ Récupérer la VRAIE météo
    let weatherCondition = 'ClearDay';
    try {
      const { WeatherService } = await import('../services/weatherService/weatherService.js');
      const weatherService = new WeatherService();
      const weatherData = await weatherService.getWeatherByCoordinates(lat || 48.8566, lon || 2.3522);
      
      const currentHour = new Date().getHours();
      const isNight = currentHour < 6 || currentHour > 18;
      
      if (weatherData.description.toLowerCase().includes('clear') || weatherData.description.toLowerCase().includes('dégagé')) {
        weatherCondition = isNight ? 'ClearNight' : 'ClearDay';
      } else if (weatherData.description.toLowerCase().includes('rain') || weatherData.description.toLowerCase().includes('pluie')) {
        weatherCondition = 'Rain';
      } else if (weatherData.description.toLowerCase().includes('snow') || weatherData.description.toLowerCase().includes('neige')) {
        weatherCondition = 'Snow';
      } else if (weatherData.description.toLowerCase().includes('storm') || weatherData.description.toLowerCase().includes('orage')) {
        weatherCondition = 'Thunderstorm';
      }
      
      console.log(`🌤️ Condition météo combat: ${weatherCondition}`);
    } catch (error) {
      console.warn('⚠️ Météo par défaut utilisée');
    }
    
    const weatherEffects = WeatherEffectService.getWeatherEffectByCondition(weatherCondition);
    const timeBonus = WeatherEffectService.calculateTimeBonus();
    
    let result;
    
    if (mode === 'init') {
      // ✅ Juste initialiser le combat
      result = TurnBasedBattleService.initializeBattle(team1, team2, weatherEffects, timeBonus);
    } else if (mode === 'turn') {
      // ✅ Pour mode interactif futur - utiliser simulateFullBattle avec 1 tour max
      const battleState = await c.req.json();
      result = await TurnBasedBattleService.simulateFullBattle(
        battleState.team1, 
        battleState.team2, 
        weatherEffects, 
        timeBonus, 
        1 // ✅ Limiter à 1 tour seulement
      );
    } else {
      // ✅ Simuler le combat complet
      result = await TurnBasedBattleService.simulateFullBattle(team1, team2, weatherEffects, timeBonus);
    }
    
    console.log(`🏆 Résultat tour par tour: ${result.winner} en ${result.turn} tours`);

    // ✅ AJOUTER : Log détaillé des attaques
    if (result.battleLog && result.battleLog.length > 0) {
      console.log('\n📜 LOG DE COMBAT:');
      result.battleLog.forEach((action, index) => {
        console.log(`${index + 1}. ${action.description} (${action.damage} dégâts)`);
      });
    }

    return c.json({
      success: true,
      battleState: result,
      // ✅ AJOUTER : Inclure le log de combat dans la réponse
      combatLog: result.battleLog?.map(action => ({
        turn: action.turn,
        attacker: action.attacker.name_fr,
        move: action.move.name,
        moveType: action.move.type,
        damage: action.damage,
        description: action.description,
        isCritical: action.isCritical,
        typeEffectiveness: action.typeEffectiveness,
        stab: action.stab
      })) || []
    });

  } catch (error: any) {
    console.error('❌ Erreur combat tour par tour:', error);
    return c.json({ 
      success: false, 
      error: 'Erreur lors du combat tour par tour' 
    }, 500);
  }
};

// // Pour les combats en temps réel
// export const streamBattleHandler = async (c: Context) => {
//   c.header('Content-Type', 'text/event-stream');
//   c.header('Cache-Control', 'no-cache');
//   c.header('Connection', 'keep-alive');
  
//   return c.stream(async (stream) => {
//     await stream.write(new TextEncoder().encode('data: Combat commencé\n\n'));
//     await stream.write(new TextEncoder().encode('data: Tour 1 terminé\n\n'));
//   });
// };