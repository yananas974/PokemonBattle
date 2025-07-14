import React from 'react';
import { Link } from '@remix-run/react';

export const ModernDashboard = ({ userName, stats }: { userName: string; stats: { totalPokemon: number; totalTeams: number } }) => {
  return (
    <div className="h-screen overflow-hidden pt-40">
      {/* Header avec salutation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">
              Bienvenue, {userName} !
            </h1>
            <p className="text-xl text-white opacity-80">
              Prêt pour de nouvelles aventures Pokémon ?
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
      <div className="max-w-7xl mx-auto">
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
                  <p className="text-white opacity-80">Gérez vos équipes Pokémon</p>
                </div>
              </div>
            </Link>

            {/* Pokédex */}
            <Link to="/dashboard/pokemon" className="group">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-8 shadow-xl transform group-hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:animate-bounce">📚</div>
                  <h3 className="text-2xl font-bold text-white mb-2">POKÉDEX</h3>
                  <p className="text-white opacity-80">Explorez tous les Pokémon</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
