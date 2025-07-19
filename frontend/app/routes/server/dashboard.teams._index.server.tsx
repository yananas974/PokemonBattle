import { redirect } from '@remix-run/node';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';  // Nouveau service pour récupérer les Pokémon
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';
import { PokemonInTeam } from '@pokemon-battle/shared';

export const loader = withAuthLoader(async (user, request, params) => {
  try {
    console.log('🔍 Chargement des équipes pour l\'utilisateur:', user.id);
    console.log('🔍 User object:', user);
    
    // Charger les équipes de l'utilisateur
    const teamsResponse = await teamService.getMyTeams(request);
    console.log('📦 Réponse du service teams:', teamsResponse);

    if (!teamsResponse || !teamsResponse.success) {
      console.error('❌ Échec du chargement des équipes:', teamsResponse);
      return {
        user,
        teams: [],
        pokemons: [],
        status: 'error' as const,
        message: 'Impossible de charger les équipes'
      };
    }

    console.log('✅ Équipes chargées avec succès:', teamsResponse.teams?.length || 0, 'équipes');
    
    // Pour chaque équipe, on va récupérer les Pokémon associés
    const teamsWithPokemons = await Promise.all(teamsResponse.teams.map(async (team) => {
      const pokemons = await pokemonService.getPokemonById(team.id);  // Appel à un service pour récupérer les Pokémon par équipe
      return {
        ...team,
        pokemons,  // Ajouter les Pokémon à chaque équipe
      };
    }));

    return {
      user,
      teams: teamsWithPokemons,
      status: 'success' as const,
      message: 'Équipes et Pokémon chargés avec succès'
    };

  } catch (error) {
    console.error('💥 Erreur dans le loader des équipes et Pokémon:', error);
    return {
      user,
      teams: [],
      pokemons: [],
      status: 'error' as const,
      message: 'Erreur lors du chargement des équipes et Pokémon'
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
