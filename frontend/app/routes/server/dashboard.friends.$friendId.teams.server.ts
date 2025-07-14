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
    console.log('🔄 Chargement des équipes pour l\'ami ID:', friendIdNumber);
    
    // Récupérer les informations de l'ami
    const friendsResponse = await friendshipService.getFriends(request);
    console.log('✅ Friends response:', friendsResponse);
    
    const friendData = friendsResponse?.data?.friends?.find(f => 
      f.friend?.id === friendIdNumber
    );

    if (!friendData) {
      console.error('❌ Ami non trouvé dans la liste:', friendIdNumber);
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
    console.log('✅ Ami trouvé:', friend);

    // Récupérer les équipes de l'ami
    const teamsResponse = await friendshipService.getFriendTeams(friendIdNumber, request);
    console.log('🔍 Teams response structure:', JSON.stringify(teamsResponse, null, 2));
    
    const teams = teamsResponse?.data || [];
    console.log('✅ Teams extracted:', teams);

    return Response.json({
      user,
      friend,
      friendTeams: teams as TeamWithPokemon[],
      canViewTeams: true
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des équipes:', error);
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