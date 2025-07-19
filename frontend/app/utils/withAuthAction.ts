import { getUserFromSession } from '~/sessions.server';
import { type ActionFunctionArgs } from '@remix-run/node';
import type { UserWithToken } from '@pokemon-battle/shared';

type ActionCallback = (user: UserWithToken, request: Request, params: Record<string, string | undefined>) => Promise<Response>;

export function withAuthAction(callback: ActionCallback) {
  return async ({ request, params }: ActionFunctionArgs): Promise<Response> => {
    const sessionData = await getUserFromSession(request);

    if (!sessionData.user) {
      return Response.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    // ✅ Passer l'objet user complet avec backendToken
    return callback(sessionData.user, request, params);
  };
}
