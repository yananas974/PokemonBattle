import { Hono } from 'hono';
import { weatherHandlers, weatherValidators } from '../handlers/weather.handler.js';

const weatherRoutes = new Hono();

// ✅ Routes météo avec la nouvelle structure
weatherRoutes.get('/effects', weatherValidators.weatherQuery, weatherHandlers.getWeatherEffects);
weatherRoutes.post('/simulate-battle', weatherValidators.simulateBattle, weatherHandlers.simulateBattle);

// ✅ Nouvelles routes utilitaires
weatherRoutes.get('/available-effects', weatherHandlers.getAvailableEffects);
weatherRoutes.get('/time-bonus', weatherHandlers.getCurrentTimeBonus);

export { weatherRoutes };