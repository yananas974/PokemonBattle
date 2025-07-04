import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { useState, useEffect } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat - Pokemon Battle' },
    { name: 'description', content: 'Hub de combat Pokemon - Matchmaking et gestion des combats' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const teamsData = await teamService.getMyTeams(user.backendToken);
    const readyTeams = (teamsData.teams || []).filter((team: any) => 
      team.pokemon && team.pokemon.length >= 3
    );

    return json({
      user,
      teams: readyTeams,
      stats: {
        totalBattles: 0,
        winRate: 0,
        activeBattles: 0,
        rank: 'Débutant'
      }
    });
  } catch (error) {
    return json({
      user,
      teams: [],
      stats: { totalBattles: 0, winRate: 0, activeBattles: 0, rank: 'Débutant' }
    });
  }
};

export default function BattleHub() {
  const { user, teams, stats } = useLoaderData<typeof loader>();
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [matchmaking, setMatchmaking] = useState(false);

  const battleModes = [
    {
      id: 'ranked',
      title: 'Combat Classé',
      description: 'Combattez pour monter dans le classement',
      icon: '🏆',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      id: 'casual',
      title: 'Combat Amical',
      description: 'Combat décontracté sans impact sur le rang',
      icon: '⚔️',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'ai',
      title: 'Entraînement IA',
      description: 'Pratiquez contre une intelligence artificielle',
      icon: '🤖',
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header de combat */}
      <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <span>⚔️</span>
              <span>Hub de Combat</span>
            </h1>
            <p className="text-red-100 mt-1">
              Choisissez votre mode de combat et votre équipe
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.rank}</div>
            <div className="text-sm text-red-200">Rang actuel</div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalBattles}</div>
          <div className="text-sm text-gray-600">Combats Total</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.winRate}%</div>
          <div className="text-sm text-gray-600">Taux de Victoire</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.activeBattles}</div>
          <div className="text-sm text-gray-600">Combats Actifs</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{teams.length}</div>
          <div className="text-sm text-gray-600">Équipes Prêtes</div>
        </div>
      </div>

      {/* Sélection d'équipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Choisir une Équipe
        </h2>
        
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team: any) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`
                  cursor-pointer p-4 rounded-lg border-2 transition-all duration-200
                  ${selectedTeam?.id === team.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                  <span className="text-sm text-green-600">
                    {team.pokemon?.length || 0}/6
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {team.pokemon?.length || 0} Pokémon disponibles
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl block mb-2">👥</span>
            <p>Aucune équipe prête au combat</p>
            <Link 
              to="/dashboard/teams/create" 
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              Créer une équipe
            </Link>
          </div>
        )}
      </div>

      {/* Modes de combat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Modes de Combat
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {battleModes.map((mode) => (
            <div
              key={mode.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className={`w-16 h-16 ${mode.color} rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-3`}>
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{mode.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{mode.description}</p>
                <button
                  disabled={!selectedTeam}
                  className={`
                    w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${selectedTeam
                      ? `${mode.color} text-white`
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedTeam ? 'Commencer' : 'Sélectionnez une équipe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 