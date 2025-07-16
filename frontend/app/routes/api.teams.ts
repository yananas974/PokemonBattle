import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { teamService } from '~/services/teamService';

// ✅ Resource route pour les données Teams côté client
export const loader = withAuthLoader(async (user, request, _params) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Gestion des différents types de requêtes
  const action = searchParams.get('action');
  const teamId = searchParams.get('id');
  const includeStats = searchParams.get('includeStats') === 'true';
  
  try {
    switch (action) {
      case 'detail':
        // Détails d'une équipe spécifique
        if (!teamId) {
          return Response.json({ error: 'Team ID required' }, { status: 400 });
        }
        const teamDetail = await teamService.getTeamById(parseInt(teamId), request);
        return Response.json(teamDetail);
      
      case 'stats':
        // Statistiques des équipes
        const teamsData = await teamService.getMyTeams(request);
        const stats = {
          totalTeams: teamsData.teams?.length || 0,
          totalPokemon: teamsData.teams?.reduce((acc, team) => acc + (team.pokemon?.length || 0), 0) || 0,
          averageLevel: 0, // Calculer si nécessaire
          favoriteTeam: teamsData.teams?.[0] || null
        };
        return Response.json({ stats });
      
      case 'list':
      default:
        // Liste des équipes
        const teams = await teamService.getMyTeams(request);
        return Response.json({
          ...teams,
          includeStats
        });
    }
  } catch (error) {
    console.error('API Teams error:', error);
    return Response.json(
      { error: 'Failed to fetch teams data' },
      { status: 500 }
    );
  }
});

// ✅ Actions pour les opérations sur les équipes
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  // Import dynamique pour éviter l'import côté client
  const { getUserFromSession } = await import('~/sessions.server');
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    switch (intent) {
      case 'create':
        // Créer une nouvelle équipe
        const teamName = formData.get('name') as string;
        const description = formData.get('description') as string;
        
        if (!teamName) {
          return Response.json({ error: 'Team name required' }, { status: 400 });
        }
        
        const newTeam = await teamService.createTeam({
          name: teamName,
          description: description || '',
          pokemon: []
        }, request);
        
        return Response.json({ 
          success: true, 
          message: 'Team created successfully',
          team: newTeam 
        });
      
      case 'update':
        // Mettre à jour une équipe
        const teamId = formData.get('teamId') as string;
        const updateName = formData.get('name') as string;
        const updateDescription = formData.get('description') as string;
        
        if (!teamId) {
          return Response.json({ error: 'Team ID required' }, { status: 400 });
        }
        
        const updatedTeam = await teamService.updateTeam(parseInt(teamId), {
          name: updateName,
          description: updateDescription
        }, request);
        
        return Response.json({ 
          success: true, 
          message: 'Team updated successfully',
          team: updatedTeam 
        });
      
      case 'delete':
        // Supprimer une équipe
        const deleteTeamId = formData.get('teamId') as string;
        
        if (!deleteTeamId) {
          return Response.json({ error: 'Team ID required' }, { status: 400 });
        }
        
        await teamService.deleteTeam(parseInt(deleteTeamId), request);
        
        return Response.json({ 
          success: true, 
          message: 'Team deleted successfully' 
        });
      
      case 'add-pokemon':
        // Ajouter un Pokémon à une équipe
        const addTeamId = formData.get('teamId') as string;
        const pokemonId = formData.get('pokemonId') as string;
        
        if (!addTeamId || !pokemonId) {
          return Response.json({ error: 'Team ID and Pokemon ID required' }, { status: 400 });
        }
        
        return Response.json({ 
          success: true, 
          message: 'Pokemon added to team',
          teamId: addTeamId,
          pokemonId 
        });
      
      case 'remove-pokemon':
        // Retirer un Pokémon d'une équipe
        const removeTeamId = formData.get('teamId') as string;
        const removePokemonId = formData.get('pokemonId') as string;
        
        if (!removeTeamId || !removePokemonId) {
          return Response.json({ error: 'Team ID and Pokemon ID required' }, { status: 400 });
        }
        
        return Response.json({ 
          success: true, 
          message: 'Pokemon removed from team',
          teamId: removeTeamId,
          pokemonId: removePokemonId 
        });
      
      default:
        return Response.json({ error: 'Invalid intent' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Teams action error:', error);
    return Response.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
};