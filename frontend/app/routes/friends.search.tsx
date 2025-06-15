import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, Form, Link, useNavigation } from '@remix-run/react';
import { friendshipService } from '~/services/friendshipService';
import { getUserFromSession } from '~/sessions';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    throw redirect('/login');
  }

  try {
    // Récupérer les utilisateurs disponibles
    if (!user.backendToken) {
      throw new Error('Token d\'authentification manquant');
    }

    const usersData = await friendshipService.searchUsers('', user.backendToken);
    console.log('Utilisateurs récupérés:', usersData); // Pour le débogage
    
    return json({ 
      users: usersData.users || [], 
      user,
      error: null 
    });
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
    return json({ 
      users: [], 
      user, 
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs' 
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'sendFriendRequest') {
    const friendId = parseInt(formData.get('friendId') as string);
    
    if (!friendId) {
      return json({ error: 'ID de l\'ami requis', success: false });
    }

    try {
      if (user.backendToken) {
        await friendshipService.sendFriendRequest({ friendId }, user.backendToken);
      } else {
        await friendshipService.sendFriendRequest({ friendId });
      }
      return json({ success: true, message: 'Demande d\'ami envoyée avec succès' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'envoi de la demande',
        success: false 
      });
    }
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function FriendsSearch() {
  const { users, user, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
              ← Retour au dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Chercher des amis</h1>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {actionData?.error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {actionData.error}
            </div>
          )}
          
          {actionData?.success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {actionData.message}
            </div>
          )}

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Utilisateurs disponibles</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  {error ? 'Erreur lors du chargement des utilisateurs' : 'Aucun utilisateur trouvé'}
                </div>
              ) : (
                users
                  .filter(u => u.id !== user.id) // Exclure l'utilisateur actuel
                  .map((targetUser) => (
                    <div key={targetUser.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{targetUser.username}</h3>
                        <p className="text-sm text-gray-500">{targetUser.email}</p>
                      </div>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="sendFriendRequest" />
                        <input type="hidden" name="friendId" value={targetUser.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          {isSubmitting ? 'Envoi...' : 'Inviter'}
                        </button>
                      </Form>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 