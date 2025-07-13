import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { friendshipService } from '~/services/friendshipService';
import type { SendFriendRequestRequest } from '@pokemon-battle/shared';

// Types pour les données
interface User {
  id: number;
  username: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
  updatedAt: string;
  friend?: User;
}

interface LoaderData {
  user: User;
  friends: Friendship[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  availableUsers: User[];
  error?: string;
}

interface ActionData {
  success: boolean;
  message?: string;
  error?: string;
}

// Loader - Récupérer toutes les données d'amitié
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const user = sessionData.user;

  try {
    // Récupérer le token pour les appels API
    const token = user.token || user.backendToken;
    if (!token) {
      throw new Error('Token manquant');
    }
    
    // Récupération des données d'amitié
    const friendsResponse = await friendshipService.getFriends(request);
    const pendingResponse = await friendshipService.getPendingRequests(request);
    const sentResponse = await friendshipService.getSentRequests(request);
    const usersResponse = await friendshipService.searchUsers('', request);

    // Extraction sécurisée des données avec fallback
    const friends = friendsResponse?.data?.friends || [];
    const pendingRequests = pendingResponse?.data?.friends || [];
    const sentRequests = sentResponse?.data?.friends || [];
    const availableUsers = usersResponse?.data?.users || [];

    return json<LoaderData>({
      user,
      friends,
      pendingRequests,
      sentRequests,
      availableUsers
    });
  } catch (error) {
    return json<LoaderData>({
      user,
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      availableUsers: [],
      error: error instanceof Error ? error.message : 'Erreur lors du chargement des données'
    });
  }
}

// Action - Gérer les actions d'amitié
export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    return json<ActionData>({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const user = sessionData.user;
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;
  
  // Conversion sécurisée des IDs
  const friendshipIdStr = formData.get('friendshipId') as string;
  const friendIdStr = formData.get('friendId') as string;
  
  const friendshipId = friendshipIdStr ? parseInt(friendshipIdStr) : undefined;
  const friendId = friendIdStr ? parseInt(friendIdStr) : undefined;

  // Récupérer le token pour les appels API
  const token = user.token || user.backendToken;
  if (!token) {
    return json<ActionData>({ success: false, error: 'Token manquant' }, { status: 401 });
  }

  try {
    switch (actionType) {
      case 'sendRequest':
        if (!friendId) {
          return json<ActionData>({ success: false, error: 'ID ami manquant' }, { status: 400 });
        }
        const sendData: SendFriendRequestRequest = { friendId };
        await friendshipService.sendFriendRequest(sendData, token);
        return redirect('/dashboard/friends?tab=sent&success=request-sent');

      case 'acceptRequest':
        if (!friendshipId) {
          return json<ActionData>({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.acceptFriendRequest(friendshipId, token);
        return redirect('/dashboard/friends?tab=friends&success=request-accepted');

      case 'blockFriend':
        if (!friendshipId) {
          return json<ActionData>({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.blockFriend(friendshipId, token);
        return redirect('/dashboard/friends?success=user-blocked');

      case 'removeFriend':
        if (!friendshipId) {
          return json<ActionData>({ success: false, error: 'ID amitié manquant' }, { status: 400 });
        }
        await friendshipService.removeFriend(friendshipId, token);
        return redirect('/dashboard/friends?success=friend-removed');

      default:
        return json<ActionData>({ success: false, error: 'Action inconnue' }, { status: 400 });
    }
  } catch (error: any) {
    return json<ActionData>({ 
      success: false, 
      error: error.message || 'Erreur lors de l\'action' 
    }, { status: 500 });
  }
} 