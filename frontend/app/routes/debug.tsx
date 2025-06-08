import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { teamService } from '~/services/teamService';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('=== DEBUG AUTH PAGE ===');
  
  try {
    const teamsData = await teamService.getMyTeams();
    return json({ 
      success: true,
      authenticated: true,
      teams: teamsData.teams,
      message: 'Utilisateur authentifié avec succès',
      cookieInfo: 'Cookies trouvés et valides'
    });
  } catch (error) {
    console.log('Erreur d\'authentification:', error);
    return json({ 
      success: false,
      authenticated: false,
      teams: [],
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      cookieInfo: 'Pas de cookies ou cookies invalides'
    });
  }
};

export default function Debug() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug Authentification</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">État de l'authentification</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Statut:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                data.authenticated 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {data.authenticated ? 'Authentifié ✅' : 'Non authentifié ❌'}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Message:</span>
              <p className="text-gray-700 mt-1">{data.message}</p>
            </div>
            
            <div>
              <span className="font-medium">Cookies:</span>
              <p className="text-gray-700 mt-1">{data.cookieInfo}</p>
            </div>
            
            <div>
              <span className="font-medium">Nombre d'équipes:</span>
              <p className="text-gray-700 mt-1">{data.teams.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions de test</h2>
          
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              🔑 Aller à la page de connexion
            </Link>
            
            <Link 
              to="/dashboard" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
            >
              📊 Aller au dashboard
            </Link>
            
            <button 
              onClick={() => {
                console.log('Cookies:', document.cookie);
                alert('Cookies: ' + (document.cookie || 'Aucun cookie trouvé'));
              }}
              className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              🍪 Voir les cookies
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Détails de la réponse</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{JSON.stringify(data, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
} 