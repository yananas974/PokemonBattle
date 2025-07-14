import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import type { User } from '@pokemon-battle/shared';

type LoaderCallback<T> = (
  user: User,
  request: Request,
  params: Record<string, string | undefined>
) => Promise<T>;

export function withAuthLoader<T>(callback: LoaderCallback<T>) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const { user } = await getUserFromSession(request);

    if (!user) {
      throw redirect('/login');
    }

    const data = await callback(user, request, params);

    // ✅ Ne pas envelopper dans Response.json
    return data;
  };
}