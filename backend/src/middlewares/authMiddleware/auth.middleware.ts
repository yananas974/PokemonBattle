import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { getUserById } from '../../services/services.js';
import type { MiddlewareHandler } from 'hono';
import { UnauthorizedError, NotFoundError } from '../../models/errors.js';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  console.log('🔐 === AUTH MIDDLEWARE ===');
  console.log('🌐 URL:', c.req.url);
  console.log('📋 Method:', c.req.method);
  
  // Vérifier JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET manquant');
    throw new Error('Server configuration error');
  }

  // Récupérer le token depuis les cookies
  let token = getCookie(c, 'authToken');
  console.log('🍪 Token cookie:', token ? token.substring(0, 20) + '...' : 'AUCUN');

  // Récupérer le token depuis les headers Authorization
  const authHeader = c.req.header('authorization');
  console.log('📋 Header Auth:', authHeader ? authHeader.substring(0, 30) + '...' : 'AUCUN');

  // ✅ Essayer le header alternatif
  const altTokenHeader = c.req.header('x-auth-token');
  console.log('📋 Header Alt Token:', altTokenHeader ? altTokenHeader.substring(0, 20) + '...' : 'AUCUN');

  // Debug tous les headers
  console.log('📋 Tous les headers:');
  for (const [key, value] of c.req.raw.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token header:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  }

  // ✅ Essayer le header alternatif
  if (!token && altTokenHeader) {
    token = altTokenHeader;
    console.log('🔑 Token alt header:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  }

  if (!token) {
    console.log('❌ Aucun token trouvé');
    throw new UnauthorizedError('User not authenticated');
  }

  // ✅ NOUVEAU : Validation du format JWT avant décodage
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    console.log('❌ Token mal formé:', token ? token.substring(0, 20) + '...' : 'null');
    throw new UnauthorizedError('Invalid token format');
  }

  // ✅ CORRIGÉ : Plus de try/catch, les erreurs remontent naturellement
  console.log('🔍 Vérification token...');
  const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
  console.log('✅ Token valide, userId:', payload.sub);
  
  const user = await getUserById(Number(payload.sub));
  if (!user) {
    console.log('❌ Utilisateur non trouvé:', payload.sub);
    throw new NotFoundError('User not found');
  }
  
  console.log('✅ Utilisateur authentifié:', user.email);
  c.set('user', user);
  await next();

  console.log('✅ Auth middleware terminé');
};