import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';
import { ModernDashboard } from '~/components/ModernDashboard';
import { QuickActionsNavbar } from '~/components';
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

  useEffect(() => {
    // Auto-start dashboard music when component mounts
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="relative min-h-screen">
      {/* Nouvelle navbar avec dropdowns */}
      <QuickActionsNavbar user={user} />

      
      {/* Dashboard principal avec marge pour la navbar */}
      <div>
        <ModernDashboard 
          stats={stats}
          recentBattles={recentBattles}
          userName={user.username}
        />
      </div>
    </div>
  );
} 