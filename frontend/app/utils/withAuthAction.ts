import { getUserFromSession } from '~/sessions.server';
import { json, type ActionFunctionArgs } from '@remix-run/node';

type ActionCallback = (user: any, request: Request, params: Record<string, string | undefined>) => Promise<Response>;

export function withAuthAction(callback: ActionCallback) {
  return async ({ request, params }: ActionFunctionArgs): Promise<Response> => {
    const { user } = await getUserFromSession(request);

    if (!user) {
      return json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    return callback(user, request, params);
  };
}
