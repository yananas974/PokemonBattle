import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { ModernDashboard } from '~/components/ModernDashboard';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';


export const meta: MetaFunction = () => {
  return [
    { title: 'Tableau de Bord Pokemon - Version Moderne' },
    { name: 'description', content: 'Tableau de bord moderne pour votre aventure Pokemon' },
  ];
};
export const loader = withAuthLoader(async (user, _request) => {
  const [teamsData, pokemonData] = await Promise.all([
    teamService.getMyTeams(user.backendToken),
    pokemonService.getAllPokemon(user.backendToken),
  ]);

  const stats = {
    totalPokemon: pokemonData.pokemon?.length || 0,
    totalTeams: teamsData.teams?.length || 0,
  };

  return {
    user,
    stats,
  };
});
export default function DashboardIndex() {
  const { user, stats } = useLoaderData<typeof loader>();
  const { playDashboard } = useGlobalAudio();

  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="relative">
      <div className="px-4 py-4">
        <ModernDashboard 
          stats={stats}
          userName={user.username}
        />
      </div>
    </div>
  );
} 