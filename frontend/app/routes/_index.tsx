import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { pokemonService } from '~/services/pokemonService';
import type { Pokemon } from '~/types/pokemon';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokemon Battle - Accueil' },
    { name: 'description', content: 'Découvrez les Pokémon disponibles pour créer votre équipe !' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const pokemonData = await pokemonService.getAllPokemon();
    return json({ pokemon: pokemonData.pokemon, error: null });
  } catch (error) {
    console.error('Erreur lors du chargement des Pokémon:', error);
    return json({ 
      pokemon: [], 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    });
  }
};

export default function Index() {
  const { pokemon, error } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Pokemon Battle</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Connexion
              </Link>
              <Link
                to="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Découvrez les Pokémon
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Explorez notre collection de Pokémon et créez votre équipe parfaite !
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur de chargement
                  </h3>
                  <p className="mt-2 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pokemon.map((poke) => (
                <div
                  key={poke.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4"
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
          )}

          {pokemon.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun Pokémon trouvé</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
