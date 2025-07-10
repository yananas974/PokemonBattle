import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import type { PokemonDetail } from '@pokemon-battle/shared';
import { 
  PokemonAudioPlayer, 
  VintageCard, 
  VintageButton, 
  StatusIndicator 
} from '~/components';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import ClientOnly from '~/components/ClientOnly';
import { cn } from '~/utils/cn';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.pokemon) {
    return [
      { title: 'Pokemon non trouvé - Pokemon Battle' },
    ];
  }
  
  return [
    { title: `${data.pokemon.name_fr} - Pokédex National` },
    { name: 'description', content: `Découvrez ${data.pokemon.name_fr}, un Pokemon de type ${data.pokemon.type}` },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log('🔍 === POKEMON DETAIL LOADER START ===');
  console.log('📋 URL:', request.url);
  console.log('📋 Params:', params);
  
  const { user } = await getUserFromSession(request);
  console.log('👤 User from session:', user ? `${user.username} (${user.email})` : 'NULL');
  
  if (!user) {
    console.log('❌ No user - redirecting to login');
    return redirect('/login');
  }

  const pokemonId = params.pokemonId;
  console.log('🔍 Pokemon ID from params:', pokemonId);
  
  if (!pokemonId || isNaN(Number(pokemonId))) {
    console.log('❌ Invalid Pokemon ID:', pokemonId);
    throw new Response('Pokemon ID invalide', { status: 400 });
  }

  try {
    console.log(`🔍 Fetching Pokemon ${pokemonId}...`);
    
    const { apiCallWithRequest } = await import('~/utils/api');
    const apiUrl = `/api/pokemon/${pokemonId}`;
    console.log('📡 API URL:', apiUrl);
    
    const response = await apiCallWithRequest(apiUrl, request);
    console.log(`📡 API response status: ${response.status}`);
    console.log(`📡 API response ok: ${response.ok}`);

    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, await response.text());
      if (response.status === 404) {
        throw new Response('Pokemon non trouvé', { status: 404 });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Response data:`, data);
    console.log(`✅ Pokemon object:`, data.data?.pokemon);
    
    // Fix: The API returns data in data.data.pokemon structure
    const pokemon = data.data?.pokemon || data.pokemon;
    
    if (!pokemon) {
      console.error('❌ No pokemon in response data');
      console.error('❌ Expected structure: data.data.pokemon or data.pokemon');
      throw new Response('Pokemon non trouvé dans la réponse', { status: 404 });
    }
    
    console.log(`✅ Pokemon ${pokemonId} loaded successfully:`, pokemon.name_fr);
    
    return json({
      pokemon: pokemon as PokemonDetail
    });
  } catch (error) {
    console.error('❌ Erreur Pokemon detail:', error);
    
    // Return a fallback response instead of throwing to help debug
    return json({
      pokemon: null,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Pokemon type colors with modern gradients
const getTypeGradient = (type: string) => {
  const gradients: { [key: string]: string } = {
    'Normal': 'from-gray-400 to-gray-600',
    'Fire': 'from-red-500 to-orange-600',
    'Water': 'from-blue-500 to-cyan-600',
    'Electric': 'from-yellow-400 to-yellow-600',
    'Grass': 'from-green-500 to-emerald-600',
    'Ice': 'from-cyan-300 to-blue-400',
    'Fighting': 'from-red-600 to-red-800',
    'Poison': 'from-purple-500 to-purple-700',
    'Ground': 'from-yellow-600 to-amber-700',
    'Flying': 'from-indigo-400 to-blue-500',
    'Psychic': 'from-pink-500 to-purple-600',
    'Bug': 'from-green-600 to-lime-600',
    'Rock': 'from-yellow-700 to-stone-600',
    'Ghost': 'from-purple-600 to-indigo-800',
    'Dragon': 'from-indigo-600 to-purple-700',
    'Dark': 'from-gray-700 to-gray-900',
    'Steel': 'from-gray-500 to-slate-600',
    'Fairy': 'from-pink-400 to-rose-500'
  };
  return gradients[type] || 'from-gray-400 to-gray-600';
};

// Type emoji mapping
const getTypeEmoji = (type: string) => {
  const emojis: { [key: string]: string } = {
    'Fire': '🔥',
    'Water': '💧',
    'Electric': '⚡',
    'Grass': '🌿',
    'Ice': '❄️',
    'Fighting': '👊',
    'Poison': '☠️',
    'Ground': '🌍',
    'Flying': '🦅',
    'Psychic': '🔮',
    'Bug': '🐛',
    'Rock': '🪨',
    'Ghost': '👻',
    'Dragon': '🐲',
    'Dark': '🌙',
    'Steel': '⚙️',
    'Fairy': '✨',
    'Normal': '⭐'
  };
  return emojis[type] || '⭐';
};

// Composant pour les particules d'arrière-plan
const PokemonParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        >
          {['⚡', '🔥', '💧', '🌿', '❄️', '✨'][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );
};

// Composant pour les barres de stats modernes
const ModernStatBar = ({ label, value, maxValue, emoji }: { 
  label: string; 
  value: number; 
  maxValue: number; 
  emoji: string; 
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-white font-semibold text-sm">{label}</span>
        </div>
        <span className="text-white font-bold text-lg">{value}</span>
      </div>
      
      <div className="relative h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-white to-yellow-300 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
      </div>
      
      <div className="text-right mt-1">
        <span className="text-white text-xs opacity-75">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default function ModernPokemonDetail() {
  const loaderData = useLoaderData<typeof loader>();
  const { pokemon, error } = loaderData as { pokemon: PokemonDetail | null; error?: string; };
  const { playDashboard } = useGlobalAudio();
  
  // Auto-start dashboard music
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  // Safety check: if pokemon is not loaded yet, show loading/error state
  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md">
          {error ? (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-white mb-2">Erreur de chargement</h2>
              <p className="text-white opacity-75 mb-4">{error}</p>
              <VintageButton 
                variant="modern" 
                href="/dashboard/pokemon"
                className="justify-center"
              >
                Retour au Pokédex
              </VintageButton>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-2">Chargement...</h2>
              <p className="text-white opacity-75">Récupération des données Pokémon</p>
              <div className="mt-4 text-sm text-white opacity-50">
                Vérifiez la console pour plus d'informations
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const typeGradient = getTypeGradient(pokemon.type || 'Normal');
  const typeEmoji = getTypeEmoji(pokemon.type || 'Normal');

  const statNames: Record<string, { label: string; emoji: string }> = {
    base_hp: { label: 'Points de Vie', emoji: '❤️' },
    base_attack: { label: 'Attaque', emoji: '⚔️' },
    base_defense: { label: 'Défense', emoji: '🛡️' },
    base_speed: { label: 'Vitesse', emoji: '💨' }
  };

  const safeStats = {
    base_hp: pokemon.base_hp || 0,
    base_attack: pokemon.base_attack || 0,
    base_defense: pokemon.base_defense || 0,
    base_speed: pokemon.base_speed || 0
  };
  
  const statsValues = Object.values(safeStats).map(v => Number(v) || 0);
  const maxStat = statsValues.length > 0 ? Math.max(...statsValues) : 100;
  const totalStats = statsValues.reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      <PokemonAudioPlayer variant="compact" />
      
      {/* Particules d'arrière-plan */}
      <ClientOnly>
        <PokemonParticles />
      </ClientOnly>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation moderne */}
        <div className="mb-6">
          <VintageButton 
            variant="modern" 
            href="/dashboard/pokemon"
            className="inline-flex items-center space-x-2"
          >
            <span>🏠</span>
            <span>Retour au Pokédex</span>
          </VintageButton>
        </div>

        {/* Header principal avec image et infos */}
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
                    src={pokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                    alt={pokemon.name_fr || 'Pokémon'}
                    className="w-48 h-48 object-contain drop-shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                    }}
                  />
                </div>
              </div>
              
              {/* Infos principales */}
              <div className="flex-1 text-center lg:text-left text-white">
                <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                  <span className="text-6xl">{typeEmoji}</span>
                  <div>
                    <h1 className="text-5xl font-bold drop-shadow-2xl mb-2">
                      {pokemon.name_fr || 'Pokémon Inconnu'}
                    </h1>
                    <div className="flex items-center space-x-3">
                      <span className="bg-white bg-opacity-20 text-white text-lg font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                        #{(pokemon.id || 0).toString().padStart(3, '0')}
                      </span>
                      <span className="bg-white bg-opacity-20 text-white text-lg font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                        {pokemon.type || 'Normal'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informations physiques */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{pokemon.height || 0}M</div>
                    <div className="text-sm opacity-75">Taille</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{pokemon.weight || 0}KG</div>
                    <div className="text-sm opacity-75">Poids</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold mb-1">{totalStats}</div>
                    <div className="text-sm opacity-75">Total Stats</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </VintageCard>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Statistiques - 2/3 de l'espace */}
          <div className="xl:col-span-2">
            <VintageCard variant="glass">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
                <span>📊</span>
                <span>Statistiques de Combat</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(safeStats).map(([stat, value]) => (
                  <ModernStatBar
                    key={stat}
                    label={statNames[stat]?.label || stat}
                    value={Number(value)}
                    maxValue={maxStat}
                    emoji={statNames[stat]?.emoji || '📈'}
                  />
                ))}
              </div>

              {/* Résumé des stats */}
              <div className="mt-8 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{Math.max(...statsValues)}</div>
                    <div className="text-white text-sm opacity-75">Stat Max</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{Math.min(...statsValues)}</div>
                    <div className="text-white text-sm opacity-75">Stat Min</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{Math.round(totalStats / 4)}</div>
                    <div className="text-white text-sm opacity-75">Moyenne</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{totalStats}</div>
                    <div className="text-white text-sm opacity-75">Total</div>
                  </div>
                </div>
              </div>
            </VintageCard>
          </div>

          {/* Actions et infos supplémentaires - 1/3 de l'espace */}
          <div className="space-y-6">
            {/* Informations détaillées */}
            <VintageCard variant="glass">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>ℹ️</span>
                <span>Informations</span>
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white opacity-75">Type</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{typeEmoji}</span>
                      <span className="text-white font-semibold">{pokemon.type || 'Normal'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white opacity-75">Numéro National</span>
                    <span className="text-white font-semibold">#{(pokemon.id || 0).toString().padStart(3, '0')}</span>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white opacity-75">Dimensions</span>
                    <span className="text-white font-semibold">{pokemon.height || 0}M × {pokemon.weight || 0}KG</span>
                  </div>
                </div>
              </div>
            </VintageCard>

            {/* Status et évaluation */}
            <VintageCard variant="glass">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>⭐</span>
                <span>Évaluation</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white">Force de combat</span>
                  <StatusIndicator 
                    status={totalStats > 500 ? "success" : totalStats > 300 ? "warning" : "error"} 
                    showLabel 
                    label={totalStats > 500 ? "Excellent" : totalStats > 300 ? "Bon" : "Faible"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Rareté</span>
                  <StatusIndicator 
                    status={(pokemon.id || 0) <= 151 ? "success" : "online"} 
                    showLabel 
                    label={(pokemon.id || 0) <= 151 ? "Légendaire" : "Standard"}
                  />
                </div>
              </div>
            </VintageCard>

            {/* Actions */}
            <VintageCard variant="glass">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                <span>🎮</span>
                <span>Actions</span>
              </h3>
              
              <div className="space-y-3">
                <VintageButton 
                  variant="pokemon" 
                  href="/dashboard/teams/create"
                  fullWidth
                  className="justify-center"
                >
                  <span className="mr-2">➕</span>
                  Ajouter à une équipe
                </VintageButton>
                
                <VintageButton 
                  variant="water" 
                  href="/dashboard/battle"
                  fullWidth
                  className="justify-center"
                >
                  <span className="mr-2">⚔️</span>
                  Aller au combat
                </VintageButton>
                
                <VintageButton 
                  variant="modern" 
                  href="/dashboard/pokemon"
                  fullWidth
                  className="justify-center"
                >
                  <span className="mr-2">📚</span>
                  Retour au Pokédex
                </VintageButton>
              </div>
            </VintageCard>
          </div>
        </div>
      </div>
    </div>
  );
}