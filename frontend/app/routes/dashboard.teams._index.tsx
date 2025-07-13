import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { teamService } from '~/services/teamService';
import type { TeamWithPokemon } from '@pokemon-battle/shared';
import {
  VintageCard, 
  VintageButton,
  StatusIndicator,
} from '~/components';
import { withAuthLoader } from '~/utils/withAuthLoader';
import { pokemonService } from '~/services/pokemonService';
import { ModernButton } from '~/components/ui/ModernButton';

export const meta: MetaFunction = () => {
  return [
    { title: 'Mes Équipes - Pokédex National' },
    { name: 'description', content: 'Gérez vos équipes Pokémon et préparez vos combats stratégiques' },
  ];
};

interface LoaderData {
  user: any;
  teams: TeamWithPokemon[];
  message?: string;
  error?: string;
  status?: string;
}
export const loader = withAuthLoader<LoaderData>(async (user, request) => {
  const data = await teamService.getMyTeams(request);

  if (!data.success) {
    return {
      user,
      teams: [],
      status: 'error',
      message: 'Impossible de charger les équipes',
    };
  }

  return {
    user,
    teams: data.teams || [],
    status: 'success',
    message: 'Équipes chargées avec succès',
  };
});
export default function ModernTeamsIndex() {
  const data = useLoaderData<LoaderData>();
  const { teams, user, status, message } = data;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header principal */}
        <VintageCard variant="glass" className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 flex items-center space-x-3">
                <span>👥</span>
                <span>Mes Équipes</span>
                <span className="animate-pulse">⚡</span>
              </h1>
              <p className="text-xl text-white opacity-80">
                Gérez vos équipes Pokémon et préparez vos stratégies de combat
              </p>
              <div className="mt-4 text-white opacity-75">
                {teams.length} équipe{teams.length !== 1 ? 's' : ''} disponible{teams.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            {teams.length > 0 && (
             <div className="mt-6 lg:mt-0">
             <ModernButton 
               variant="pokemon" 
               href="/dashboard/teams/create"
               size="lg"
               className="inline-flex items-center space-x-2"
             >
               <span>➕</span>
               <span>Nouvelle Équipe</span>
             </ModernButton>
           </div>
            )}
          </div>
        </VintageCard>
        {/* Liste des équipes ou message vide */}
        {teams.length === 0 ? (
          <VintageCard variant="glass" className="text-center py-16">
            <div className="text-8xl mb-6 opacity-50">👥</div>
            <h3 className="text-4xl font-bold text-white mb-4">Aucune équipe créée</h3>
            <p className="text-xl text-white opacity-75 mb-8 max-w-md mx-auto">
              Créez votre première équipe pour commencer vos aventures Pokémon et affronter d'autres dresseurs
            </p>
            <VintageButton 
              variant="pokemon" 
              href="/dashboard/teams/create"
              size="xl"
              className="inline-flex items-center space-x-3"
            >
              <span>➕</span>
              <span>Créer ma première équipe</span>
            </VintageButton>
          </VintageCard>
        ) : (
          <VintageCard variant="glass">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
              <span>🏆</span>
              <span>Mes Équipes ({teams.length})</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team: TeamWithPokemon) => (
                <div key={team.id} className="group">
                  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-white border-opacity-20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-xl truncate">
                        {team.teamName}
                      </h3>
                      <StatusIndicator 
                        status={(team.pokemon?.length || 0) === 6 ? "success" : "warning"} 
                        label={`${team.pokemon?.length || 0}/6`}
                        showLabel
                      />
                    </div>
                    
                    {/* Pokémon de l'équipe */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {Array.from({ length: 6 }).map((_, index) => {
                        const pokemon = team.pokemon?.[index];
                        return (
                          <div 
                            key={index}
                            className="aspect-square bg-white bg-opacity-10 rounded-lg flex items-center justify-center"
                          >
                              {pokemon ? (
                               <img src={pokemon.sprite_url} {...pokemon.sprite_url && {className: "w-16 h-16 object-contain mx-auto mb-2", style: { imageRendering: 'pixelated' }}} />
                            ) : (
                              <span className="text-white opacity-30 text-2xl">?</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="flex space-x-2">
                      <ModernButton 
                        variant="water" 
                        href={`/dashboard/teams/${team.id}`}
                        size="sm"
                        fullWidth
                      >
                        👁️ Voir
                      </ModernButton>

                      <ModernButton 
                        variant="grass" 
                        href={`/dashboard/teams/${team.id}/select-pokemon`}
                        size="sm"
                        fullWidth
                      >
                        ✏️ Modifier
                      </ModernButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </VintageCard>
        )}
      </div>
    </div>
  );
} 