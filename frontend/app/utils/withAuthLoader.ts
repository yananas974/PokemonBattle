import { getUserFromSession } from '~/sessions.server';
import { json, redirect, type LoaderFunctionArgs } from '@remix-run/node';

type LoaderCallback<T> = (user: any, request: Request) => Promise<T>;

export function withAuthLoader<T>(callback: LoaderCallback<T>) {
  return async ({ request }: LoaderFunctionArgs) => {
    const { user } = await getUserFromSession(request);

    if (!user) {
      // Redirection si pas connecté
      throw redirect('/login');
    }

    // On ne catch pas les erreurs ici pour laisser Remix gérer via ErrorBoundary
    const data = await callback(user, request);
    return json(data);
  };
}