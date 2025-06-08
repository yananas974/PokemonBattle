import { createCookieSessionStorage } from '@remix-run/node';

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__pokemon_session',
    secrets: ['pokemon-secret-key-for-dev'], // En production, utiliser process.env.SESSION_SECRET
    secure: false, // true en production avec HTTPS
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  },
});

export { getSession, commitSession, destroySession };

// Fonctions utilitaires pour l'authentification
export async function getUserSession(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return session;
}

export async function getUserFromSession(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  const user = session.get('user');
  return { userId, user };
}

export async function createUserSession(userId: string, user: any, redirectTo: string) {
  const session = await getSession();
  session.set('userId', userId);
  session.set('user', user);
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': await destroySession(session),
    },
  });
} 