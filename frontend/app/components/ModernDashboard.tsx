import React from 'react';
import { Link } from '@remix-run/react';
import ClientOnly from '~/components/ClientOnly';

interface DashboardStats {
  totalPokemon: number;
  totalTeams: number;
  battlesWon: number;
  battlesTotal: number;
}

interface ModernDashboardProps {
  stats: DashboardStats;
  recentBattles?: Array<{
    id: string;
    opponent: string;
    result: 'win' | 'loss';
    date: string;
  }>;
  userName?: string;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  stats,
  recentBattles = [],
  userName = 'Dresseur'
}) => {
  const winRate = stats.battlesTotal > 0 ? (stats.battlesWon / stats.battlesTotal) * 100 : 0;

  return (
    <div className="min-h-screen p-6">
      {/* Header avec salutation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Bienvenue, {userName} ! 👋
            </h1>
            <p className="text-xl text-white opacity-80">
              Prêt pour de nouvelles aventures Pokemon ?
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Pokémon capturés */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white opacity-80 text-sm font-medium">Pokémon capturés</p>
                <p className="text-4xl font-bold text-white">{stats.totalPokemon}</p>
              </div>
              <div className="text-5xl opacity-80">🔮</div>
            </div>
          </div>

          {/* Équipes créées */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white opacity-80 text-sm font-medium">Équipes créées</p>
                <p className="text-4xl font-bold text-white">{stats.totalTeams}</p>
              </div>
              <div className="text-5xl opacity-80">🛡️</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            🎮 Actions principales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Combat */}
            <Link to="/dashboard/battle" className="group">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:animate-bounce">⚔️</div>
                  <h3 className="text-2xl font-bold text-white mb-2">COMBATTRE</h3>
                  <p className="text-white opacity-80">Affrontez d'autres dresseurs</p>
                </div>
              </div>
            </Link>

            {/* Équipes */}
            <Link to="/dashboard/teams" className="group">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:animate-bounce">👥</div>
                  <h3 className="text-2xl font-bold text-white mb-2">ÉQUIPES</h3>
                  <p className="text-white opacity-80">Gérez vos équipes Pokemon</p>
                </div>
              </div>
            </Link>

            {/* Pokédex */}
            <Link to="/dashboard/pokemon" className="group">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:animate-bounce">📚</div>
                  <h3 className="text-2xl font-bold text-white mb-2">POKÉDEX</h3>
                  <p className="text-white opacity-80">Explorez tous les Pokemon</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">⚡</span>
            Actions rapides
          </h3>
          
          <div className="space-y-4">
            <Link 
              to="/dashboard/battle/simulate" 
              className="block bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-xl p-4 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-white font-semibold">Combat simulé</p>
                  <p className="text-white opacity-80 text-sm">Simulation rapide</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/dashboard/teams/create" 
              className="block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl p-4 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✨</span>
                <div>
                  <p className="text-white font-semibold">Créer une équipe</p>
                  <p className="text-white opacity-80 text-sm">Nouvelle équipe</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/dashboard/friends" 
              className="block bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded-xl p-4 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <div>
                  <p className="text-white font-semibold">Amis</p>
                  <p className="text-white opacity-80 text-sm">Gérer vos amis</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Effets de particules flottantes */}
      <ClientOnly>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </ClientOnly>
    </div>
  );
}; 