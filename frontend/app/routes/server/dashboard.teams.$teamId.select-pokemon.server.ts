import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { getUserFromSession } from '~/sessions.server';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';

export const loader = async ({ request, params }: LoaderFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const teamId = params.teamId;
  if (!teamId) {
    throw new Response('Team ID manquant', { status: 400 });
  }

  try {
    // Récupérer l'équipe et les Pokémon disponibles
    const [teamsResponse, pokemonResponse] = await Promise.all([
      teamService.getMyTeams(user.backendToken),
      pokemonService.getAllPokemon(user.backendToken)
    ]);

    const teams = teamsResponse.teams || [];
    const currentTeam = teams.find((team: any) => team.id === parseInt(teamId));
    
    if (!currentTeam) {
      throw new Response('Équipe non trouvée', { status: 404 });
    }

    const allPokemon = pokemonResponse.pokemon || [];
    
    // Filtrer les Pokémon déjà dans l'équipe
    const teamPokemonIds = new Set(currentTeam.pokemon?.map((p: any) => p.pokemon_reference_id) || []);
    const availablePokemon = allPokemon.filter((pokemon: any) => !teamPokemonIds.has(pokemon.id));

    return json({
      user,
      team: currentTeam,
      pokemon: availablePokemon,
      teamPokemon: currentTeam.pokemon || [],
      teamId: parseInt(teamId),
      teamPokemonCount: currentTeam.pokemon?.length || 0,
      maxPokemonPerTeam: 6
    });
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    return json({
      user,
      team: null,
      pokemon: [],
      teamPokemon: [],
      teamId: parseInt(teamId) || 0,
      teamPokemonCount: 0,
      maxPokemonPerTeam: 6,
      error: error instanceof Error ? error.message : 'Erreur lors du chargement'
    });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return json({ success: false, error: 'Non autorisé' }, { status: 401 });
  }

  const teamId = params.teamId;
  if (!teamId) {
    return json({ success: false, error: 'Team ID manquant' }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const pokemonId = formData.get('pokemonId') as string;

  try {
    switch (intent) {
      case 'add':
        if (!pokemonId) {
          return json({ success: false, error: 'ID Pokémon manquant' }, { status: 400 });
        }
        
        await teamService.addPokemonToTeam(
          parseInt(teamId),
          parseInt(pokemonId),
          user.backendToken
        );
        
        return redirect(`/dashboard/teams/${teamId}/select-pokemon?success=pokemon-added`);

      case 'remove':
        if (!pokemonId) {
          return json({ success: false, error: 'ID Pokémon manquant' }, { status: 400 });
        }
        
        await teamService.removePokemonFromTeam(
          parseInt(teamId),
          parseInt(pokemonId),
          user.backendToken
        );
        
        return redirect(`/dashboard/teams/${teamId}/select-pokemon?success=pokemon-removed`);

      default:
        return json({ success: false, error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error: any) {
    return json({
      success: false,
      error: error.message || 'Erreur lors de l\'action'
    }, { status: 500 });
  }
}; 