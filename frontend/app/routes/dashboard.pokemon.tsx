import { Outlet } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { withAuthLoader } from '~/utils/withAuthLoader';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokédex - Pokemon Battle' },
    { name: 'description', content: 'Explorez la collection complète de Pokémon' },
  ];
};

// ✅ Loader pour les données partagées des routes Pokemon
export const loader = withAuthLoader(async (user, request, _params) => {
  // Ici on peut charger des données communes à toutes les routes Pokemon
  // comme les types, les statistiques globales, etc.
  return Response.json({ 
    user,
    context: 'pokemon' // Contexte pour les routes enfants
  });
});

export default function PokemonLayout() {
  return (
    <div className="pokemon-layout">
      {/* Header section commune à toutes les pages Pokemon */}
      <div className="pokemon-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">📱</div>
          <div>
            <h1 className="text-3xl font-bold">Pokédex</h1>
            <p className="text-blue-100">Découvrez tous les Pokémon disponibles</p>
          </div>
        </div>
      </div>

      {/* Navigation Pokemon */}
      <nav className="pokemon-nav bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          <a
            href="/dashboard/pokemon"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            🔍 Explorer
          </a>
          <a
            href="/dashboard/teams"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            👥 Mes Équipes
          </a>
        </div>
      </nav>

      {/* Contenu des routes enfants */}
      <div className="pokemon-content">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Erreur Pokédex
        </h1>
        <p className="text-gray-300 mb-6">
          Une erreur est survenue lors du chargement des données Pokémon.
        </p>
        <a
          href="/dashboard/pokemon"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Retourner au Pokédex
        </a>
      </div>
    </div>
  );
}