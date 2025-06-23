import { Hono } from 'hono';
import { authRoutes } from './auth.route.js';
import { pokemonRoutes } from './pokemon.route.js';
import { friendshipRoutes } from './friendship.route.js';
import { teamRoutes } from './team.route.js';
import { weatherRoutes } from './weather.route.js';
import { battleRoutes } from './battle.route.js';
import { hackChallengeRoutes } from './hackChallenge.route.js';

const routes = new Hono();

routes.route('/auth', authRoutes);
routes.route('/pokemon', pokemonRoutes);
routes.route('/friends', friendshipRoutes);
routes.route('/teams', teamRoutes);
routes.route('/weather', weatherRoutes);
routes.route('/battle', battleRoutes);
routes.route('/hack-challenge', hackChallengeRoutes);

export default routes;




