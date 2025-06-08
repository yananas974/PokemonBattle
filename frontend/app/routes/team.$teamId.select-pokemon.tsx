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
    // Récupérer tous les Pokémon disponibles
    const pokemonData = await pokemonService.getAllPokemon();
    
    // Récupérer les détails de l'équipe
    let teamData;
    if (user.backendToken) {
      teamData = await teamService.getMyTeamsWithToken(user.backendToken);
    } else {
      teamData = await teamService.getMyTeams();
    }
    
    const team = teamData.teams.find(t => t.id === Number(teamId));
    
    if (!team) {
      throw new Response('Équipe non trouvée', { status: 404 });
    }

    return json({
      pokemon: pokemonData.pokemon,
      team,
      teamId: Number(teamId),
      user
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
      // TODO: Ajouter la logique pour ajouter un Pokémon à l'équipe
      // Utiliser pokemonTeamService ici
      console.log(`Ajout du Pokémon ${pokemonId} à l'équipe ${teamId}`);
      
      return json({ 
        success: true, 
        message: 'Pokémon ajouté à l\'équipe avec succès' 
      });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout',
        success: false 
      });
    }
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function SelectPokemon() {
  const { pokemon, team, teamId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

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
            <p className="text-lg text-gray-600">
              Équipe : <span className="font-semibold text-indigo-600">{team.teamName}</span>
            </p>
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

          {/* Grille des Pokémon */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pokémon Disponibles
            </h2>
            
            {pokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {pokemon.map((poke) => (
                  <div
                    key={poke.id}
                    className="bg-gray-50 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200"
                  >
                    <div className="aspect-square mb-3">
                      <img
                        src={poke.sprite_url}
                        alt={poke.nameFr}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {poke.nameFr}
                      </h3>
                      <p className="text-xs text-gray-500">#{poke.id}</p>
                    </div>
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
                  </div>
                ))}
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