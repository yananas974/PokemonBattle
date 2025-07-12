import React from 'react';
import { Link, useLocation } from '@remix-run/react';
import QuickActionsNavbar from './QuickActionsNavbar';
import type { User } from '@pokemon-battle/shared';

interface TopNavigationProps {
  user?: User;
}

export default function TopNavigation({ user }: TopNavigationProps) {
  const location = useLocation();

  // Déterminer le titre de la page
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Tableau de Bord';
    if (path.startsWith('/dashboard/pokemon')) return 'Pokémon';
    if (path.startsWith('/dashboard/teams')) return 'Équipes';
    if (path.startsWith('/dashboard/battle')) return 'Combat';
    if (path.startsWith('/dashboard/friends')) return 'Amis';
    if (path.startsWith('/dashboard/profile')) return 'Profil';
    if (path.startsWith('/dashboard/settings')) return 'Paramètres';
    
    return 'Pokémon Battle Arena';
  };

  // Déterminer l'icône de la page
  const getPageIcon = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return '🏠';
    if (path.startsWith('/dashboard/pokemon')) return '🔴';
    if (path.startsWith('/dashboard/teams')) return '👥';
    if (path.startsWith('/dashboard/battle')) return '⚔️';
    if (path.startsWith('/dashboard/friends')) return '🤝';
    if (path.startsWith('/dashboard/profile')) return '👤';
    if (path.startsWith('/dashboard/settings')) return '⚙️';
    
    return '🎮';
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et titre de la page */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ⚡
              </div>
              <span className="font-bold text-gray-900 text-lg hidden sm:block">
                Pokémon Battle Arena
              </span>
            </Link>
            
            {/* Séparateur et titre de la page actuelle */}
            <div className="hidden sm:flex items-center space-x-2 text-gray-500">
              <span>/</span>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getPageIcon()}</span>
                <span className="font-medium text-gray-900">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          {/* Navigation rapide sur mobile */}
          <div className="sm:hidden flex items-center space-x-2">
            <span className="text-2xl">{getPageIcon()}</span>
            <span className="font-medium text-gray-900 text-sm">{getPageTitle()}</span>
          </div>

          {/* Actions rapides */}
          <div className="flex items-center">
            <QuickActionsNavbar user={user} />
          </div>
        </div>
      </div>
    </header>
  );
} 