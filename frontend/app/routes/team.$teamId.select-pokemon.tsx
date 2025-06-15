import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, Form, Link, useNavigation } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { pokemonService } from '~/services/pokemonService';
import { teamService } from '~/services/teamService';
import type { Pokemon } from '~/types/pokemon';

export const meta: MetaFunction = () => {
  return [
    { title: 'Sélection des Pokémon - Pokémon Battle' },
    { name: 'description', content: 'Sélectionnez les Pokémon pour votre équipe' },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    throw redirect('/login');
  }

  const teamId = params.teamId;
  if (!teamId || isNaN(Number(teamId))) {
    throw new Response('ID d\'équipe invalide', { status: 400 });
  }

  try {
    // ✅ PASSER LE TOKEN pour récupérer tous les Pokémon
    const pokemonData = await pokemonService.getAllPokemon(user.backendToken);
    
    // Récupérer les détails de l'équipe
    const teamData = await teamService.getMyTeams(user.backendToken);
    
    const team = teamData.teams.find(t => t.id === Number(teamId));
    
    if (!team) {
      throw new Response('Équipe non trouvée', { status: 404 });
    }

    return json({
      pokemon: pokemonData.pokemon,
      team,
      teamId: Number(teamId),
      user,
      teamPokemonCount: team.pokemon ? team.pokemon.length : 0,
      maxPokemonPerTeam: 6
    });
  } catch (error) {
    console.error('Erreur lors du chargement de la sélection:', error);
    throw new Response('Erreur lors du chargement', { status: 500 });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false });
  }

  const teamId = params.teamId;
  if (!teamId || isNaN(Number(teamId))) {
    return json({ error: 'ID d\'équipe invalide', success: false });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'addPokemon') {
    const pokemonId = parseInt(formData.get('pokemonId') as string);
    
    if (!pokemonId) {
      return json({ error: 'ID Pokémon requis', success: false });
    }

    try {
      // ✅ UTILISATION DE LA NOUVELLE ROUTE /api/pokemon/add
      console.log(`Ajout du Pokémon ${pokemonId} à l'équipe ${teamId}`);
      const result = await teamService.addPokemonToTeam(
        Number(teamId), 
        pokemonId, 
        user.backendToken
      );
      
      return json({ 
        success: true, 
        message: (result as any).message || 'Pokémon ajouté à l\'équipe avec succès',
        pokemon: (result as any).pokemon
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du Pokémon:', error);
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout du Pokémon',
        success: false 
      });
    }
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function SelectPokemon() {
  const { pokemon, team, teamId, teamPokemonCount, maxPokemonPerTeam } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const isTeamFull = teamPokemonCount >= maxPokemonPerTeam;
  const remainingSlots = maxPokemonPerTeam - teamPokemonCount;

  const teamPokemonIds = team.pokemon ? team.pokemon.map(p => p.pokemon_id) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Pokemon Battle
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Retour au Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* En-tête */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sélection des Pokémon
            </h1>
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-600">
                Équipe : <span className="font-semibold text-indigo-600">{team.teamName}</span>
              </p>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isTeamFull 
                    ? 'bg-red-100 text-red-800' 
                    : teamPokemonCount >= 4 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {teamPokemonCount}/{maxPokemonPerTeam} Pokémon
                </span>
                {isTeamFull && (
                  <span className="text-red-600 text-sm font-medium">
                    🚫 Équipe complète
                  </span>
                )}
                {!isTeamFull && (
                  <span className="text-green-600 text-sm font-medium">
                    ✅ {remainingSlots} place{remainingSlots > 1 ? 's' : ''} restante{remainingSlots > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages d'erreur/succès */}
          {actionData && 'error' in actionData && actionData.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          )}

          {actionData && 'success' in actionData && actionData.success && 'message' in actionData && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-sm text-green-700">{actionData.message}</p>
            </div>
          )}

          {isTeamFull && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-6">
              <div className="flex items-center">
                <span className="text-orange-600 text-lg mr-2">⚠️</span>
                <p className="text-sm text-orange-700">
                  <strong>Équipe complète !</strong> Vous avez atteint la limite de {maxPokemonPerTeam} Pokémon. 
                  Retirez un Pokémon de votre équipe pour en ajouter un nouveau.
                </p>
              </div>
            </div>
          )}

          {/* Grille des Pokémon */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pokémon Disponibles
            </h2>
            
            {pokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {pokemon.map((poke) => {
                  const isAlreadyInTeam = teamPokemonIds.includes(poke.id);
                  const canAddPokemon = !isTeamFull && !isAlreadyInTeam;
                  
                  return (
                    <div
                      key={poke.id}
                      className={`rounded-lg shadow-sm transition-all duration-200 p-4 border-2 ${
                        isAlreadyInTeam 
                          ? 'bg-green-50 border-green-200' 
                          : canAddPokemon
                            ? 'bg-gray-50 border-gray-200 hover:shadow-lg hover:border-indigo-300'
                            : 'bg-gray-100 border-gray-300 opacity-60'
                      }`}
                    >
                      <div className="aspect-square mb-3 relative">
                        <img
                          src={poke.sprite_url}
                          alt={poke.nameFr}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                        {isAlreadyInTeam && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                      <div className="text-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {poke.nameFr}
                        </h3>
                        <p className="text-xs text-gray-500">#{poke.id}</p>
                      </div>
                      
                      {isAlreadyInTeam ? (
                        <div className="w-full px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-md text-center">
                          Dans l'équipe
                        </div>
                      ) : canAddPokemon ? (
                        <Form method="post">
                          <input type="hidden" name="intent" value="addPokemon" />
                          <input type="hidden" name="pokemonId" value={poke.id} />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                          >
                            {isSubmitting ? 'Ajout...' : 'Ajouter'}
                          </button>
                        </Form>
                      ) : (
                        <div className="w-full px-3 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md text-center cursor-not-allowed">
                          {isTeamFull ? 'Équipe pleine' : 'Non disponible'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun Pokémon disponible pour le moment.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 