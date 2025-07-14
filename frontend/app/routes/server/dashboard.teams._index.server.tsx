import { redirect } from '@remix-run/node';
import { teamService } from '~/services/teamService';
import type { LoaderTeamData } from '@pokemon-battle/shared';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';

export const loader = withAuthLoader(async (user, request, params) => {   
  try {
    console.log('🔍 Chargement des équipes pour l\'utilisateur:', user.id);
    console.log('🔍 User object:', user);
    
    const teamsResponse = await teamService.getMyTeams(request);
    console.log('📦 Réponse du service teams:', teamsResponse);

    if (!teamsResponse || !teamsResponse.success) {
      console.error('❌ Échec du chargement des équipes:', teamsResponse);
      
      return {
        user,
        teams: [],
        status: 'error' as const,
        message: 'Impossible de charger les équipes'
      };
    }

    console.log('✅ Équipes chargées avec succès:', teamsResponse.teams?.length || 0, 'équipes');
    
    return {
      user,
      teams: teamsResponse.teams || [],
      status: 'success' as const,
      message: 'Équipes chargées avec succès'
    };

  } catch (error) {
    console.error('💥 Erreur dans le loader des équipes:', error);

    return {
      user,
      teams: [],
      status: 'error' as const,
      message: 'Erreur lors du chargement des équipes'
    };
  }
});

export const action = withAuthAction(async (user, request, params) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const teamId = formData.get('teamId') as string;
  
  if (intent === 'deleteTeam' && teamId) {
    try {
      const result = await teamService.deleteTeam(parseInt(teamId), request);
      
      if (result.success) {
        return redirect('/dashboard/teams?success=team-deleted');
      } else {
        return redirect(`/dashboard/teams?error=${encodeURIComponent(result.error || 'Erreur lors de la suppression')}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'équipe:', error);
      return redirect('/dashboard/teams?error=delete-failed');
    }
  }
  
  return Response.json({ 
    success: false, 
    error: 'Action non reconnue' 
  }, { status: 400 });
});