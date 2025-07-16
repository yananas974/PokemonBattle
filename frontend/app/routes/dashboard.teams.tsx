import { Outlet } from '@remix-run/react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { teamService } from '~/services/teamService';

export const meta: MetaFunction = () => {
  return [
    { title: 'Gestion des Équipes - Pokemon Battle' },
    { name: 'description', content: 'Créez et gérez vos équipes de Pokémon' },
  ];
};

// ✅ Loader pour les données partagées des routes Teams
export const loader = withAuthLoader(async (user, request, _params) => {
  // Charger les statistiques des équipes pour toutes les routes
  const teamsData = await teamService.getMyTeams(request);
  
  return Response.json({ 
    user,
    context: 'teams',
    teamCount: teamsData.teams?.length || 0,
    maxTeams: 10 // Exemple de limite
  });
});

export default function TeamsLayout() {
  return (
    <div className="teams-layout">
      {/* Header section commune à toutes les pages Teams */}
      <div className="teams-header bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">👥</div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Équipes</h1>
              <p className="text-green-100">Créez et organisez vos équipes de Pokémon</p>
            </div>
          </div>
          
          <div className="teams-quick-actions">
            <a
              href="/dashboard/teams/create"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Nouvelle Équipe</span>
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Teams */}
      <nav className="teams-nav bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
        <div className="flex space-x-4">
          <a
            href="/dashboard/teams"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
          >
            📋 Mes Équipes
          </a>
          <a
            href="/dashboard/teams/create"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            ➕ Créer
          </a>
          <a
            href="/dashboard/battle"
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
          >
            ⚔️ Combattre
          </a>
        </div>
      </nav>

      {/* Contenu des routes enfants */}
      <div className="teams-content">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Erreur Équipes
        </h1>
        <p className="text-gray-300 mb-6">
          Une erreur est survenue lors du chargement des équipes.
        </p>
        <a
          href="/dashboard/teams"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Retourner aux Équipes
        </a>
      </div>
    </div>
  );
}