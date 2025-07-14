import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import type { Pokemon, PokemonDetail } from '@pokemon-battle/shared';

import { 
  VintageCard, 
  VintageButton,
  PokemonSprite, 
} from '~/components';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { usePokemonDetail } from '~/hooks/usePokemonDetail';
import { cn } from '~/utils/cn';
import { getTypeGradient, getTypeEmoji } from '~/utils/pokemonTypes';

export { loader } from './server/dashboard.pokemon.$pokemonId.server';


export const meta: MetaFunction = ({ data }) => {
  const loaderData = data as any;
  if (!loaderData?.pokemon) {
    return [
      { title: 'Pokemon non trouvé - Pokemon Battle' },
    ];
  }
  
  return [
    { title: `${loaderData.pokemon.name_fr} - Pokédex National` },
    { name: 'description', content: `Découvrez ${loaderData.pokemon.name_fr}, un Pokemon de type ${loaderData.pokemon.type}` },
  ];
};

// Composant pour la barre de statistiques moderne  
const ModernStatBar = ({ 
  label, 
  value, 
  maxValue, 
  emoji,
  getStatColor,
  getStatPercentage 
}: { 
  label: string; 
  value: number; 
  maxValue: number; 
  emoji: string;
  getStatColor: (value: number, maxValue: number) => string;
  getStatPercentage: (value: number, maxValue: number) => number;
}) => {
  const percentage = getStatPercentage(value, maxValue);
  const colorClass = getStatColor(value, maxValue);
  
  return (
    <ModernCard variant="glass" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-white font-semibold text-sm">{label}</span>
        </div>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      
      <div className="relative h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div 
          className={cn("absolute top-0 left-0 h-full bg-gradient-to-r transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
      </div>
      
      <div className="text-right mt-1">
        <span className="text-white text-xs opacity-75">{percentage.toFixed(1)}%</span>
      </div>
    </ModernCard>
  );
};

// Composant pour l'en-tête du Pokémon
const PokemonHeader = ({ 
  pokemonInfo, 
  stats, 
  typeGradient, 
  typeEmoji 
}: {
  pokemonInfo: any;
  stats: any;
  typeGradient: string;
  typeEmoji: string;
}) => {
  if (!pokemonInfo) return null;

  return (
    <VintageCard variant="glass" className="mb-8 overflow-hidden">
      <div className={cn('bg-gradient-to-br', typeGradient, 'p-8 -m-8 mb-6')}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          {/* Image Pokemon avec effets modernes */}
          <div className="relative">
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-2xl scale-150"></div>
            <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 border border-white border-opacity-30">
              <img 
                src={pokemonInfo.sprite_url}
                alt={pokemonInfo.name}
                className="w-50 h-50 object-contain mx-auto mb-3"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
          
          {/* Infos principales */}
          <div className="flex-1 text-center lg:text-left text-white">
            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
              <span className="text-6xl">{typeEmoji}</span>
              <div>
                <h1 className="text-5xl font-bold drop-shadow-2xl mb-2">
                  {pokemonInfo.name}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className="bg-white bg-opacity-20 text-white text-lg font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                    #{pokemonInfo.formattedId}
                  </span>
                  <span className="bg-white bg-opacity-20 text-white text-lg font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                    {pokemonInfo.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations physiques */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold mb-1">{pokemonInfo.height}M</div>
                <div className="text-sm opacity-75">Taille</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold mb-1">{pokemonInfo.weight}KG</div>
                <div className="text-sm opacity-75">Poids</div>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-3xl font-bold mb-1">{stats?.totalStats || 0}</div>
                <div className="text-sm opacity-75">Total Stats</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VintageCard>
  );
};

// Composant pour les statistiques
const PokemonStats = ({ 
  stats, 
  statNames, 
  getStatColor, 
  getStatPercentage,
  showStats,
  toggleStats,
  statsExpanded,
  toggleStatsExpanded
}: {
  stats: any;
  statNames: any;
  getStatColor: (value: number, maxValue: number) => string;
  getStatPercentage: (value: number, maxValue: number) => number;
  showStats: boolean;
  toggleStats: (show: boolean) => void;
  statsExpanded: boolean;
  toggleStatsExpanded: (expanded: boolean) => void;
}) => {
  if (!stats) return null;

  return (
    <VintageCard variant="glass">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
          <span>📊</span>
          <span>Statistiques de Combat</span>
        </h2>
        <div className="flex space-x-2">
          <ModernButton
            onClick={() => toggleStats(!showStats)}
            variant={showStats ? "primary" : "secondary"}
            size="sm"
          >
            {showStats ? "Masquer" : "Afficher"}
          </ModernButton>
          {showStats && (
            <ModernButton
              onClick={() => toggleStatsExpanded(!statsExpanded)}
              variant="secondary"
              size="sm"
            >
              {statsExpanded ? "Réduire" : "Étendre"}
            </ModernButton>
          )}
        </div>
      </div>

      {showStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(stats.safeStats).map(([stat, value]) => (
              <ModernStatBar
                key={stat}
                label={statNames[stat]?.label || stat}
                value={Number(value)}
                maxValue={stats.maxStat}
                emoji={statNames[stat]?.emoji || '📈'}
                getStatColor={getStatColor}
                getStatPercentage={getStatPercentage}
              />
            ))}
          </div>

          {/* Résumé des stats */}
          <div className="mt-8">
            <ModernCard variant="glass" className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{stats.maxStat}</div>
                  <div className="text-white text-sm opacity-75">Stat Max</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{stats.minStat}</div>
                  <div className="text-white text-sm opacity-75">Stat Min</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.averageStat}</div>
                  <div className="text-white text-sm opacity-75">Moyenne</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{stats.totalStats}</div>
                  <div className="text-white text-sm opacity-75">Total</div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Statistiques étendues */}
          {statsExpanded && (
            <div className="mt-6">
              <ModernCard variant="glass" className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Analyse Détaillée</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Stat dominante:</span>
                      <span className="text-green-400 font-semibold">
                        {Object.entries(stats.safeStats).find(([, value]) => value === stats.maxStat)?.[0]?.replace('base_', '').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Stat faible:</span>
                      <span className="text-red-400 font-semibold">
                        {Object.entries(stats.safeStats).find(([, value]) => value === stats.minStat)?.[0]?.replace('base_', '').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Écart stats:</span>
                      <span className="text-white font-semibold">{stats.maxStat - stats.minStat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Équilibre:</span>
                      <span className="text-white font-semibold">
                        {stats.maxStat - stats.minStat < 30 ? 'Équilibré' : 'Spécialisé'}
                      </span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </div>
          )}
        </>
      )}
    </VintageCard>
  );
};

// Composant pour les informations détaillées
const PokemonInfo = ({ 
  pokemonInfo, 
  typeEmoji 
}: {
  pokemonInfo: any;
  typeEmoji: string;
}) => {
  if (!pokemonInfo) return null;

  return (
    <VintageCard variant="glass">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
        <span>ℹ️</span>
        <span>Informations</span>
      </h3>
      
      <div className="space-y-4">
        <ModernCard variant="glass" className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-white opacity-75">Type</span>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{typeEmoji}</span>
              <span className="text-white font-semibold">{pokemonInfo.type}</span>
            </div>
          </div>
        </ModernCard>
        
        <ModernCard variant="glass" className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-white opacity-75">Numéro National</span>
            <span className="text-white font-semibold">#{pokemonInfo.formattedId}</span>
          </div>
        </ModernCard>
        
        <ModernCard variant="glass" className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-white opacity-75">Dimensions</span>
            <span className="text-white font-semibold">{pokemonInfo.height}M × {pokemonInfo.weight}KG</span>
          </div>
        </ModernCard>
      </div>

     
    </VintageCard>
  );
};

// Composant pour les états de chargement/erreur
const LoadingErrorState = ({ 
  error, 
  isLoading 
}: { 
  error: string | null; 
  isLoading: boolean;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <ModernCard variant="glass" className="text-center max-w-md p-8">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Erreur de chargement</h2>
            <p className="text-white opacity-75 mb-4">{error}</p>
            <ModernButton 
              href="/dashboard/pokemon"
              variant="primary"
              size="md"
            >
              Retour au Pokédex
            </ModernButton>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <h2 className="text-2xl font-bold text-white mb-2">Chargement...</h2>
            <p className="text-white opacity-75">Récupération des données Pokémon</p>
            <div className="mt-4 text-sm text-white opacity-50">
              Vérifiez la console pour plus d'informations
            </div>
          </>
        )}
      </ModernCard>
    </div>
  );
};

export default function ModernPokemonDetail() {
  const loaderData = useLoaderData() as any;
  const { pokemon: initialPokemon, error: initialError } = loaderData as { pokemon: Pokemon | null; error?: string; };
  const { playDashboard } = useGlobalAudio();
  
  // Utilisation du hook usePokemonDetail
  const pokemonDetail = usePokemonDetail({
    initialPokemon,
    initialError,
    onPokemonLoad: (pokemon) => {
      console.log('🎮 Pokémon chargé:', pokemon);
    },
    onError: (error) => {
      console.error('❌ Erreur Pokémon:', error);
    }
  });

  // Auto-start dashboard music
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  // Synchroniser les données du loader avec le hook
  useEffect(() => {
    if (initialPokemon) {
      pokemonDetail.setPokemon(initialPokemon);
    }
  }, [initialPokemon]);

  useEffect(() => {
    if (initialError) {
      pokemonDetail.setError(initialError);
    }
  }, [initialError]);

  // Afficher l'état de chargement ou d'erreur
  if (!pokemonDetail.hasPokemon() || pokemonDetail.hasError()) {
    return (
      <LoadingErrorState 
        error={pokemonDetail.error} 
        isLoading={pokemonDetail.isLoading} 
      />
    );
  }

  const typeGradient = getTypeGradient(pokemonDetail.pokemonInfo?.type || 'Normal');
  const typeEmoji = getTypeEmoji(pokemonDetail.pokemonInfo?.type || 'Normal');

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header principal avec image et infos */}
        <PokemonHeader
          pokemonInfo={pokemonDetail.pokemonInfo}
          stats={pokemonDetail.stats}
          typeGradient={typeGradient}
          typeEmoji={typeEmoji}
        />

        {/* Contenu principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Statistiques - 2/3 de l'espace */}
          <div className="xl:col-span-2">
            <PokemonStats
              stats={pokemonDetail.stats}
              statNames={pokemonDetail.statNames}
              getStatColor={pokemonDetail.getStatColor}
              getStatPercentage={pokemonDetail.getStatPercentage}
              showStats={pokemonDetail.showStats}
              toggleStats={pokemonDetail.toggleStats}
              statsExpanded={pokemonDetail.statsExpanded}
              toggleStatsExpanded={pokemonDetail.toggleStatsExpanded}
            />
          </div>

          {/* Actions et infos supplémentaires - 1/3 de l'espace */}
          <div className="space-y-6">
            <PokemonInfo
              pokemonInfo={pokemonDetail.pokemonInfo}
              typeEmoji={typeEmoji}
            />
          </div>
        </div>
      </div>
    </div>
  );
}