import type { LoaderFunctionArgs } from '@remix-run/node';
import { friendshipService } from '~/services/friendshipService';
import type { 
  User,
  TeamWithPokemon,
  LoaderFriendTeamsData
} from '@pokemon-battle/shared';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const friendId = params.friendId;
  const friendIdNumber = friendId ? parseInt(friendId, 10) : null;

  if (!friendIdNumber || isNaN(friendIdNumber)) {
    throw new Response('Invalid friend ID', { status: 400 });
  }

  try {
    
    // Récupérer les informations de l'ami
    const friendsResponse = await friendshipService.getFriends(request);
    
    const friendData = friendsResponse?.data?.friends?.find(f => 
      f.friend?.id === friendIdNumber
    );

    if (!friendData) {
      return Response.json({
        user,
        friend: { 
          id: friendIdNumber, 
          username: 'Utilisateur inconnu', 
          email: '', 
          created_at: '', 
          updated_at: '' 
        },
        friendTeams: [],
        canViewTeams: false,
        error: 'Ami non trouvé ou non autorisé'
      });
    }

    const friend = friendData.friend!;

    // Récupérer les équipes de l'ami
    const teamsResponse = await friendshipService.getFriendTeams(friendIdNumber, request);
    
    const teams = teamsResponse?.data || [];

    return Response.json({
      user,
      friend,
      friendTeams: teams as TeamWithPokemon[],
      canViewTeams: true
    });
  } catch (error) {
    return Response.json({
      user,
      friend: { 
        id: friendIdNumber, 
        username: 'Utilisateur inconnu', 
        email: '', 
        created_at: '', 
        updated_at: '' 
      },
      friendTeams: [],
      canViewTeams: false,
      error: error instanceof Error ? error.message : 'Impossible de charger les équipes de cet ami'
    });
  }
}; 