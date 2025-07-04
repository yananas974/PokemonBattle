import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Équipes d\'un ami - Pokemon Battle' },
    { name: 'description', content: 'Consultez les équipes de vos amis' },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const friendId = params.friendId;

  return json({
    user,
    friendId,
    friendTeams: [], // TODO: Implémenter la récupération des équipes d'un ami
    friendName: `Ami ${friendId}`
  });
};

export default function FriendTeams() {
  const { friendId, friendTeams, friendName } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <span>👥</span>
          <span>Équipes de {friendName}</span>
        </h1>
        <p className="text-gray-600 mt-1">
          Consultez les équipes de votre ami
        </p>
      </div>
      
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl block mb-2">👥</span>
        <p>Section en développement</p>
        <Link 
          to="/dashboard/friends" 
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          Retour aux amis
        </Link>
      </div>
    </div>
  );
} 