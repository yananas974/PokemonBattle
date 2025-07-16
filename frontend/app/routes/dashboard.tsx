import { Outlet } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { withAuthLoader } from '~/utils/withAuthLoader';

// ✅ Loader pour s'assurer que l'utilisateur est authentifié pour tout le dashboard
export const loader = withAuthLoader(async (user, request, _params) => {
  return Response.json({ user });
});

export default function DashboardLayout() {
  return (
    <div className="dashboard-container">
      {/* Le contenu principal sera rendu par les routes enfants */}
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Erreur Dashboard
        </h1>
        <p className="text-gray-300 mb-6">
          Une erreur est survenue dans le tableau de bord.
        </p>
        <a
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Retourner au Dashboard
        </a>
      </div>
    </div>
  );
}