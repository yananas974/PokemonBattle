import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, Form, Link, useNavigation } from '@remix-run/react';
import { teamService } from '~/services/teamService';
import { authService } from '~/services/authService';
import { pokemonService } from '~/services/pokemonService';
import { getUserFromSession, logout } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    { title: 'Dashboard - Pokemon Battle' },
    { name: 'description', content: 'Gérez vos équipes Pokemon' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('=== DASHBOARD LOADER (AVEC SESSIONS) ===');
  
  // Vérifier l'authentification via session Remix
  const { userId, user } = await getUserFromSession(request);
  console.log('Session utilisateur:', { userId, user: user?.email });
  
  if (!userId || !user) {
    console.log('Utilisateur non authentifié, redirection vers login');
    throw redirect('/login');
  }
  
  try {
    // Récupérer les Pokémon
    const pokemonData = await pokemonService.getAllPokemon();
    
    // Récupérer les équipes avec le token backend
    try {
      let teamsData;
      
      if (user.backendToken) {
        console.log('Utilisation du token backend pour récupérer les équipes');
        teamsData = await teamService.getMyTeamsWithToken(user.backendToken);
      } else {
        console.log('Pas de token backend, tentative avec méthode classique');
        teamsData = await teamService.getMyTeams();
      }
      
      return json({ 
        teams: teamsData.teams, 
        pokemon: pokemonData.pokemon,
        error: null,
        user 
      });
    } catch (authError) {
      console.log('Erreur lors de la récupération des équipes:', authError);
      return json({ 
        teams: [], 
        pokemon: pokemonData.pokemon,
        error: 'Problème avec la récupération des équipes. Les autres fonctionnalités restent disponibles.',
        user 
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    return json({ 
      teams: [], 
      pokemon: [],
      error: error instanceof Error ? error.message : 'Erreur de chargement',
      user 
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Récupérer l'utilisateur depuis la session pour avoir le token
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false });
  }

  if (intent === 'createTeam') {
    const teamName = formData.get('teamName') as string;
    
    if (!teamName) {
      return json({ error: 'Le nom de l\'équipe est requis', success: false });
    }

    try {
      if (user.backendToken) {
        await teamService.createTeamWithToken({ teamName }, user.backendToken);
      } else {
        await teamService.createTeam({ teamName });
      }
      return json({ success: true, message: 'Équipe créée avec succès' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la création',
        success: false 
      });
    }
  }

  if (intent === 'deleteTeam') {
    const teamId = parseInt(formData.get('teamId') as string);
    
    if (!teamId) {
      return json({ error: 'ID de l\'équipe requis', success: false });
    }

    try {
      if (user.backendToken) {
        await teamService.deleteTeamWithToken(teamId, user.backendToken);
      } else {
        await teamService.deleteTeam(teamId);
      }
      return json({ success: true, message: 'Équipe supprimée avec succès' });
    } catch (error) {
      return json({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        success: false 
      });
    }
  }

  if (intent === 'logout') {
    console.log('Déconnexion demandée');
    return logout(request);
  }

  return json({ error: 'Action non reconnue', success: false });
};

export default function Dashboard() {
  const { teams, pokemon, error } = useLoaderData<typeof loader>();
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
              <span className="text-gray-700">Dashboard</span>
              <Form method="post" className="inline">
                <input type="hidden" name="intent" value="logout" />
                <button
                  type="submit"
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Déconnexion
                </button>
              </Form>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Messages d'erreur/succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-sm text-red-700">{actionData.error}</p>
            </div>
          )}

          {actionData?.success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <p className="text-sm text-green-700">{actionData.message}</p>
            </div>
          )}

          {/* Section Équipes */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Équipes</h2>
            
            {/* Formulaire de création d'équipe */}
            <Form method="post" className="mb-6">
              <input type="hidden" name="intent" value="createTeam" />
              <div className="flex gap-4">
                <input
                  type="text"
                  name="teamName"
                  placeholder="Nom de l'équipe"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Création...' : 'Créer une équipe'}
                </button>
              </div>
            </Form>

            {/* Liste des équipes */}
            {teams.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {team.teamName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Créée le {new Date(team.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex gap-2 justify-between items-center">
                      <Link
                        to={`/team/${team.id}/select-pokemon`}
                        className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        Sélection des pokémons
                      </Link>
                      <Form method="post" className="inline">
                        <input type="hidden" name="intent" value="deleteTeam" />
                        <input type="hidden" name="teamId" value={team.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                          onClick={(e) => {
                            if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </Form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Vous n'avez pas encore d'équipe. Créez-en une pour commencer !
              </p>
            )}
          </div>

          {/* Section Pokémon disponibles */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pokémon Disponibles</h2>
            
            {pokemon.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pokemon.slice(0, 12).map((poke) => (
                  <div
                    key={poke.id}
                    className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
                  >
                    <div className="aspect-square mb-2">
                      <img
                        src={poke.sprite_url}
                        alt={poke.nameFr}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {poke.nameFr}
                      </h3>
                      <p className="text-xs text-gray-500">#{poke.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Aucun Pokémon disponible pour le moment.
              </p>
            )}
            
            {pokemon.length > 12 && (
              <div className="text-center mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Voir tous les Pokémon
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 