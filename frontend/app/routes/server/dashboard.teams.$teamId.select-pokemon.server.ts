import { redirect } from '@remix-run/node';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { withAuthAction } from '~/utils/withAuthAction';
import type { TeamWithPokemon } from '@pokemon-battle/shared';

export const loader = withAuthLoader(async (user, request, params) => {
  const teamId = params.teamId;

  if (!teamId) {
    throw new Response('Team ID manquant', { status: 400 });
  }
  
  try {
    
    const [teamsResponse, pokemonResponse] = await Promise.all([
      teamService.getMyTeams(request),
      pokemonService.getAllPokemon(request)
    ]);
    
    const teams = teamsResponse.teams || [];
    const currentTeam = teams.find((team: TeamWithPokemon) => team.id === parseInt(teamId));
    
    if (!currentTeam) {
      throw new Response('Équipe non trouvée', { status: 404 });
    }
    
    const allPokemon = pokemonResponse.pokemon || [];
    
    // Obtenir les IDs des Pokémon déjà dans l'équipe
    const teamPokemonIds = new Set(
      currentTeam.pokemon?.map((p: any) => p.pokemon_reference_id || p.id) || []
    );
    
    // Filtrer les Pokémon disponibles (ceux qui ne sont pas dans l'équipe)
    const availablePokemon = allPokemon.filter((pokemon: any) => 
      !teamPokemonIds.has(pokemon.id)
    );
    
    // ✅ Retourner directement les données (pas Response.json)
    return {
      user,  // ✅ L'utilisateur sera maintenant disponible dans le composant
      team: currentTeam,
      pokemon: allPokemon,
      availablePokemon,
      teamPokemon: currentTeam.pokemon || [],
      teamId: parseInt(teamId),
      teamPokemonCount: currentTeam.pokemon?.length || 0,
      maxPokemonPerTeam: 6
    };

  } catch (error) {
    throw new Response('Erreur lors du chargement', { status: 500 });
  }
});

export const action = withAuthAction(async (user, request, params) => {
  const teamId = params.teamId;
  
  if (!teamId) {
    return Response.json({ error: 'Team ID manquant' }, { status: 400 });
  }
  
  try {
    const formData = await request.formData();
    const intent = formData.get('intent') as string;
    const pokemonId = formData.get('pokemonId') as string;
    
    
    switch (intent) {
      case 'addPokemon':
        if (!pokemonId) {
          return Response.json({ error: 'ID Pokémon manquant' }, { status: 400 });
        }
        
        
        const addResult = await teamService.addPokemonToTeam(
          parseInt(teamId),
          parseInt(pokemonId),
          request  // ✅ Passer request au lieu de user.backendToken
        );
        
        if (!addResult.success) {
          return Response.json({ 
            error: addResult.error || 'Erreur lors de l\'ajout' 
          }, { status: 400 });
        }
        
        return Response.json({ 
          success: true, 
          message: 'Pokémon ajouté avec succès !' 
        });
        
      case 'removePokemon':
        if (!pokemonId) {
          return Response.json({ error: 'ID Pokémon manquant' }, { status: 400 });
        }
        
        
        const removeResult = await teamService.removePokemonFromTeam(
          parseInt(teamId),
          parseInt(pokemonId),
          request  // ✅ Passer request au lieu de user.backendToken
        );
        
        if (!removeResult.success) {
          return Response.json({ 
            error: removeResult.error || 'Erreur lors de la suppression' 
          }, { status: 400 });
        }
        
        return Response.json({ 
          success: true, 
          message: 'Pokémon retiré avec succès !' 
        });
        
      default:
        return Response.json({ error: 'Action non reconnue' }, { status: 400 });
    }
    
  } catch (error) {
    return Response.json({ 
      error: 'Une erreur est survenue lors de l\'opération' 
    }, { status: 500 });
  }
});