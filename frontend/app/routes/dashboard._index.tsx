import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';
import { ModernDashboard } from '~/components/ModernDashboard';
import { ModernButton } from '~/components/ui/ModernButton';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';

export const meta: MetaFunction = () => {
  return [
    { title: 'Tableau de Bord Pokemon - Version Moderne' },
    { name: 'description', content: 'Tableau de bord moderne pour votre aventure Pokemon' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    // Récupérer les données en parallèle
    const [teamsData, pokemonData] = await Promise.all([
      teamService.getMyTeams(user.backendToken).catch(() => ({ teams: [] })),
      pokemonService.getAllPokemon(user.backendToken).catch(() => ({ success: false, pokemon: [] }))
    ]);

    // Simuler des données de combat (à remplacer par de vraies données plus tard)
    const mockBattles = [
      {
        id: '1',
        opponent: 'Dresseur Rouge',
        result: 'win' as const,
        date: '2024-01-15'
      },
      {
        id: '2',
        opponent: 'Champion Cynthia',
        result: 'loss' as const,
        date: '2024-01-14'
      },
      {
        id: '3',
        opponent: 'Rival Blue',
        result: 'win' as const,
        date: '2024-01-13'
      }
    ];

    const stats = {
      totalPokemon: pokemonData.pokemon?.length || 0,
      totalTeams: teamsData.teams?.length || 0,
      battlesWon: 15,
      battlesTotal: 23
    };

    return json({
      user,
      stats,
      recentBattles: mockBattles
    });
  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    
    // Fallback avec des données par défaut
    return json({
      user,
      stats: {
        totalPokemon: 0,
        totalTeams: 0,
        battlesWon: 0,
        battlesTotal: 0
      },
      recentBattles: []
    });
  }
};

export default function DashboardIndex() {
  const { user, stats, recentBattles } = useLoaderData<typeof loader>();
  const { playDashboard } = useGlobalAudio();
  const navigation = useNavigation();
  
  const isLoggingOut = navigation.state === 'submitting' && navigation.formAction === '/logout';

  useEffect(() => {
    // Auto-start dashboard music when component mounts
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="relative min-h-screen">
      {/* Header moderne avec profil utilisateur et logout */}
      <div className="absolute top-6 right-6 z-50">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-4 shadow-xl">
          <div className="flex items-center space-x-4">
            {/* Avatar et informations utilisateur */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm">{user.username}</p>
                <p className="text-white opacity-70 text-xs">{user.email}</p>
              </div>
            </div>

            {/* Bouton Profil */}
            <Link to="/dashboard/profile">
              <ModernButton
                variant="secondary"
                size="sm"
                className="text-white border-white border-opacity-30 hover:bg-purple-500 hover:border-purple-500 transition-all duration-200"
              >
                <span className="flex items-center">
                  <span className="mr-2">👤</span>
                  <span className="hidden sm:inline">Profil</span>
                </span>
              </ModernButton>
            </Link>

            {/* Bouton logout moderne */}
            <Form method="post" action="/logout">
              <ModernButton
                type="submit"
                variant="secondary"
                size="sm"
                disabled={isLoggingOut}
                loading={isLoggingOut}
                className="text-white border-white border-opacity-30 hover:bg-red-500 hover:border-red-500 transition-all duration-200"
              >
                {isLoggingOut ? (
                  <span className="flex items-center">
                    <span className="mr-2">⏳</span>
                    <span className="hidden sm:inline">Déconnexion...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="mr-2">🚪</span>
                    <span className="hidden sm:inline">Déconnexion</span>
                  </span>
                )}
              </ModernButton>
            </Form>
          </div>
        </div>
      </div>

      {/* Composant audio */}
      <PokemonAudioPlayer />
      
      {/* Dashboard principal */}
      <ModernDashboard 
        stats={stats}
        recentBattles={recentBattles}
        userName={user.username}
      />
    </div>
  );
} 