import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Paramètres - Pokemon Battle' },
    { name: 'description', content: 'Configurez vos paramètres' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return json({ user });
};

export default function Settings() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <span>⚙️</span>
          <span>Paramètres</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Configurez votre expérience de jeu
        </p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl block mb-2">⚙️</span>
        <p>Section paramètres en développement</p>
      </div>
    </div>
  );
} 