import { Hono } from 'hono';
import { getWeatherEffectsHandler, simulateBattleHandler } from '../handlers/weather.handler.js';

const weatherRoutes = new Hono();
weatherRoutes.get('/effects', getWeatherEffectsHandler);
weatherRoutes.post('/simulate-battle', simulateBattleHandler);

export default weatherRoutes; 