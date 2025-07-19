import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { friendshipService } from '~/services/friendshipService';
import type { SendFriendRequestRequest } from '@pokemon-battle/shared';


// Loader - Récupérer toutes les données d'amitié
export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const user = sessionData.user;

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

  return Response.json({
    user,
    friends,
    pendingRequests,
    sentRequests,
    availableUsers
  });
}

// Action - Gérer les actions d'amitié
export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const sessionData = await getUserFromSession(request);
  if (!sessionData.user) {
    return Response.json({ success: false, error: 'Non autorisé' }, { status: 401 });
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
    return Response.json({ success: false, error: 'Token manquant' }, { status: 401 });
  }

  switch (actionType) {
    case 'sendRequest':
      if (!friendId) {
        return Response.json({ success: false, error: 'ID ami manquant' }, { status: 400 });
      }
      const sendData: SendFriendRequestRequest = { friendId };
      await friendshipService.sendFriendRequest(sendData, token);
      return redirect('/dashboard/friends?tab=sent&success=request-sent');

    case 'acceptRequest':
      if (!friendshipId) {
        return Response.json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
      }
      await friendshipService.acceptFriendRequest(friendshipId, token);
      return redirect('/dashboard/friends?tab=friends&success=request-accepted');

    case 'blockFriend':
      if (!friendshipId) {
        return Response.json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
      }
      await friendshipService.blockFriend(friendshipId, token);
      return redirect('/dashboard/friends?success=user-blocked');

    case 'removeFriend':
      if (!friendshipId) {
        return Response.json({ success: false, error: 'ID amitié manquant' }, { status: 400 });
      }
      await friendshipService.removeFriend(friendshipId, token);
      return redirect('/dashboard/friends?success=friend-removed');

    default:
      return Response.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  }
}