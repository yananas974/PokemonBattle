import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mon Profil - Pokemon Battle' },
    { name: 'description', content: 'Gérez votre profil utilisateur' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <span>👤</span>
          <span>Mon Profil</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue {user.username} !
        </p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl block mb-2">👤</span>
        <p>Section profil en développement</p>
      </div>
    </div>
  );
} 