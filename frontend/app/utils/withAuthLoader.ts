import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import type { UserWithToken } from '@pokemon-battle/shared';

type LoaderCallback<T> = (
  user: UserWithToken,
  request: Request,
  params: Record<string, string | undefined>
) => Promise<T>;

export function withAuthLoader<T>(callback: LoaderCallback<T>) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const sessionData = await getUserFromSession(request);

    if (!sessionData.user) {
      throw redirect('/login');
    }

    // ✅ Passer l'objet user complet avec backendToken
    const data = await callback(sessionData.user, request, params);

    // ✅ Ne pas envelopper dans Response.json
    return data;
  };
}