import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';

export const loader = () => {
  return json({ 
    message: '✅ Les routes pathless fonctionnent!',
    timestamp: new Date().toISOString(),
    routeStructure: 'Route: _dashboard.debug.tsx → URL: /dashboard/debug'
  });
};

export default function DebugRoute() {
  return (
    <div className="pokemon-vintage-bg min-h-screen p-5">
      <div className="pokemon-card-vintage">
        <div className="p-6">
          <h1 className="font-pokemon text-lg text-gray-700 mb-4 uppercase">
            🔧 DEBUG NAVIGATION POKEMON
          </h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-pokemon text-sm text-gray-600 mb-2">LIENS DIRECTS :</h2>
              <div className="space-y-2">
                <Link 
                  to="/dashboard/pokemon" 
                  className="pokemon-btn-vintage pokemon-btn-blue block text-center"
                >
                  LISTE POKEMON
                </Link>
                <Link 
                  to="/dashboard/pokemon/1" 
                  className="pokemon-btn-vintage pokemon-btn-green block text-center"
                >
                  POKEMON #1 (BULBASAUR)
                </Link>
                <Link 
                  to="/dashboard/pokemon/4" 
                  className="pokemon-btn-vintage pokemon-btn-red block text-center"
                >
                  POKEMON #4 (CHARMANDER)
                </Link>
                <Link 
                  to="/dashboard/pokemon/7" 
                  className="pokemon-btn-vintage pokemon-btn-blue block text-center"
                >
                  POKEMON #7 (SQUIRTLE)
                </Link>
              </div>
            </div>
            
            <div className="border-t-2 border-gray-400 pt-4">
              <p className="font-pokemon text-xs text-gray-600">
                TESTEZ CES LIENS POUR VERIFIER LA NAVIGATION
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 