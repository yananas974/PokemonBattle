import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLocation } from '@remix-run/react';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Simply return a 404 for all unmatched routes
  return json(null, { status: 404 });
};

export default function NotFound() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page non trouvée
          </h1>
          <p className="text-gray-600">
            La page <code className="bg-gray-100 px-2 py-1 rounded text-sm">{location.pathname}</code> n'existe pas.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors space-x-2"
          >
            <span>🏠</span>
            <span>Retour à l'accueil</span>
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Ou essayez :</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Link to="/login" className="text-indigo-600 hover:underline">Connexion</Link>
              <span>•</span>
              <Link to="/register" className="text-indigo-600 hover:underline">Inscription</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 