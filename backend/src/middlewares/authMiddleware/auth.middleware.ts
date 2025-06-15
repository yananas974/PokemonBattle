import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { getUserById } from '../../services/services.js';
import type { MiddlewareHandler } from 'hono';

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  console.log('🔐 === AUTH MIDDLEWARE ===');
  console.log('🌐 URL:', c.req.url);
  console.log('📋 Method:', c.req.method);
  
  // Vérifier JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET manquant');
    return c.json({ error: 'Server configuration error' }, 500);
  }

  // Récupérer le token depuis les cookies
  let token = getCookie(c, 'authToken');
  console.log('🍪 Token cookie:', token ? token.substring(0, 20) + '...' : 'AUCUN');

  // Récupérer le token depuis les headers Authorization
  const authHeader = c.req.header('authorization');
  console.log('📋 Header Auth:', authHeader ? authHeader.substring(0, 30) + '...' : 'AUCUN');

  // Debug tous les headers
  console.log('📋 Tous les headers:');
  for (const [key, value] of c.req.raw.headers.entries()) {
    console.log(`  ${key}: ${value}`);
  }

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token header:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  }

  if (!token) {
    console.log('❌ Aucun token trouvé');
    return c.json({ error: 'User not authenticated' }, 401);
  }

  try {
    console.log('🔍 Vérification token...');
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
    console.log('✅ Token valide, userId:', payload.sub);
    
    const user = await getUserById(Number(payload.sub));
    if (!user) {
      console.log('❌ Utilisateur non trouvé:', payload.sub);
      return c.json({ error: 'User not found' }, 404);
    }
    
    console.log('✅ Utilisateur authentifié:', user.email);
    c.set('user', user);
    await next();
  } catch (error) {
    console.error('❌ Erreur token:', error);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  console.log('✅ Auth middleware terminé, passage au handler suivant...');
  console.log('🔄 Retour du handler vers le middleware');
};