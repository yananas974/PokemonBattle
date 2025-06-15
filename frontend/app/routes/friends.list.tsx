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
    if (!user.backendToken) {
      throw new Error('Token d\'authentification manquant');
    }

    console.log('Tentative de récupération des amis avec le token:', user.backendToken);
    
    // Récupérer la liste des amis
    const friendsData = await friendshipService.getFriends(user.backendToken);
    console.log('Données des amis reçues:', friendsData);
    
    return json({ 
      friends: friendsData.friends || [], 
      user,
      error: null 
    });
  } catch (error) {
    console.error('Erreur lors du chargement des amis:', error);
    return json({ 
      friends: [], 
      user, 
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des amis' 
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
  const friendshipId = parseInt(formData.get('friendshipId') as string);

  if (!friendshipId) {
    return json({ error: 'ID de l\'amitié requis', success: false });
  }

  try {
    if (intent === 'remove') {
      await friendshipService.removeFriend(friendshipId, user.backendToken);
      return json({ success: true, message: 'Ami supprimé avec succès' });
    } else if (intent === 'block') {
      await friendshipService.blockFriend(friendshipId, user.backendToken);
      return json({ success: true, message: 'Ami bloqué avec succès' });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Erreur lors du traitement de la demande',
      success: false 
    });
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function FriendsList() {
  const { friends, user, error } = useLoaderData<typeof loader>();
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
            <h1 className="text-3xl font-bold text-gray-900">Mes amis</h1>
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

          {/* Liste des amis */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Liste de mes amis</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {friends.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  {error ? 'Erreur lors du chargement des amis' : 'Vous n\'avez pas encore d\'amis'}
                </div>
              ) : (
                friends.map((friendship) => (
                  <div key={friendship.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {friendship.friend?.username}
                      </h3>
                      <p className="text-sm text-gray-500">{friendship.friend?.email}</p>
                      <p className="text-xs text-gray-400">
                        Amis depuis le {new Date(friendship.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="remove" />
                        <input type="hidden" name="friendshipId" value={friendship.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          onClick={(e) => {
                            if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {isSubmitting ? 'Traitement...' : 'Supprimer'}
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="block" />
                        <input type="hidden" name="friendshipId" value={friendship.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                          onClick={(e) => {
                            if (!confirm('Êtes-vous sûr de vouloir bloquer cet ami ?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {isSubmitting ? 'Traitement...' : 'Bloquer'}
                        </button>
                      </Form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mt-6 flex justify-center space-x-4">
            <Link
              to="/friends/search"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Ajouter des amis
            </Link>
            <Link
              to="/friends/requests"
              className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voir les demandes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 