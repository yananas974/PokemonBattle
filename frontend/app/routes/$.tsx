import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLocation } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Simply return a 404 for all unmatched routes
  return json(null, { status: 404 });
};

export default function NotFound() {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      
      <div className="relative z-10 max-w-2xl w-full">
        <ModernCard variant="glass" size="xl" className="text-center shadow-2xl">
          {/* Error illustration */}
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">🔍</div>
            <div className="flex justify-center space-x-2 text-6xl opacity-60">
              <span className="animate-pulse delay-100">⭐</span>
              <span className="animate-pulse delay-200">⚡</span>
              <span className="animate-pulse delay-300">🎮</span>
            </div>
          </div>
          
          {/* Error message */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Route Inconnue !
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Cette page n'existe pas dans notre Pokédex
            </p>
            <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-gray-400 text-sm mb-2">Route demandée :</p>
              <code className="text-yellow-300 font-mono text-lg break-all">
                {location.pathname}
              </code>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModernButton
                href="/"
                variant="pokemon"
                size="lg"
                className="w-full"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-xl">🏠</span>
                  Retour Accueil
                </span>
              </ModernButton>
              
              <ModernButton
                href="/dashboard"
                variant="primary"
                size="lg"
                className="w-full"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2 text-xl">🎮</span>
                  Dashboard
                </span>
              </ModernButton>
            </div>
            
            {/* Quick access links */}
            <div className="pt-6 border-t border-white border-opacity-20">
              <p className="text-gray-400 text-sm mb-4">Ou explorez :</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ModernButton
                  href="/login"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔐</span>
                    <span>Connexion</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/register"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">⭐</span>
                    <span>Inscription</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/dashboard/pokemon"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">🔴</span>
                    <span>Pokémon</span>
                  </span>
                </ModernButton>
                
                <ModernButton
                  href="/dashboard/teams"
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                >
                  <span className="flex flex-col items-center">
                    <span className="text-lg mb-1">👥</span>
                    <span>Équipes</span>
                  </span>
                </ModernButton>
              </div>
            </div>
          </div>
          
          {/* Footer message */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-20">
            <p className="text-gray-500 text-sm">
              🌟 Continuez votre aventure Pokemon ailleurs !
            </p>
          </div>
        </ModernCard>
        
        {/* Floating elements for decoration */}
        <div className="absolute -top-4 -left-4 text-4xl opacity-30 animate-pulse">⚡</div>
        <div className="absolute -top-4 -right-4 text-4xl opacity-30 animate-pulse delay-1000">🔮</div>
        <div className="absolute -bottom-4 -left-4 text-4xl opacity-30 animate-pulse delay-500">🎯</div>
        <div className="absolute -bottom-4 -right-4 text-4xl opacity-30 animate-pulse delay-1500">🏆</div>
      </div>
    </div>
  );
} 