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

    // Récupérer les demandes d'amis reçues
    const requestsData = await friendshipService.getPendingRequests(user.backendToken);
    
    return json({ 
      requests: requestsData.requests || [], 
      user,
      error: null 
    });
  } catch (error) {
    console.error('Erreur lors du chargement des demandes:', error);
    return json({ 
      requests: [], 
      user, 
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des demandes' 
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
    return json({ error: 'ID de la demande requis', success: false });
  }

  try {
    if (intent === 'accept') {
      await friendshipService.acceptFriendRequest(friendshipId, user.backendToken);
      return json({ success: true, message: 'Demande d\'ami acceptée avec succès' });
    } else if (intent === 'block') {
      await friendshipService.blockFriend(friendshipId, user.backendToken);
      return json({ success: true, message: 'Demande d\'ami refusée avec succès' });
    }
  } catch (error) {
    return json({ 
      error: error instanceof Error ? error.message : 'Erreur lors du traitement de la demande',
      success: false 
    });
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function FriendRequests() {
  const { requests, user, error } = useLoaderData<typeof loader>();
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
            <h1 className="text-3xl font-bold text-gray-900">Demandes d'amis reçues</h1>
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

          {/* Liste des demandes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Demandes en attente</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  {error ? 'Erreur lors du chargement des demandes' : 'Aucune demande en attente'}
                </div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{request.friend?.username}</h3>
                      <p className="text-sm text-gray-500">{request.friend?.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="accept" />
                        <input type="hidden" name="friendshipId" value={request.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          {isSubmitting ? 'Traitement...' : 'Accepter'}
                        </button>
                      </Form>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="block" />
                        <input type="hidden" name="friendshipId" value={request.id} />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          {isSubmitting ? 'Traitement...' : 'Refuser'}
                        </button>
                      </Form>
                    </div>
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