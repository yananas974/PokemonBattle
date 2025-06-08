import { Link } from '@remix-run/react';

export default function TestRedirect() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          🎉 Redirection réussie !
        </h1>
        <p className="text-green-700 mb-6">
          Si vous voyez cette page, la redirection fonctionne !
        </p>
        <div className="space-x-4">
          <Link 
            to="/dashboard" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Aller au Dashboard
          </Link>
          <Link 
            to="/debug" 
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Debug Auth
          </Link>
        </div>
      </div>
    </div>
  );
} 