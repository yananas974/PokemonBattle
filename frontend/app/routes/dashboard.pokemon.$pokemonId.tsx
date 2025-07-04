import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';

// Interface temporaire pour PokemonDetail
interface PokemonDetail {
  id: number;
  name_fr: string;
  name_en?: string;
  type: string;
  types: string[];
  generation: number;
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  description: string;
  moves: string[];
  height: number;
  weight: number;
  sprite_url: string;
  back_sprite_url?: string;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.pokemon) {
    return [
      { title: 'Pokemon non trouvé - Pokemon Battle' },
    ];
  }
  
  return [
    { title: `${data.pokemon.name_fr} - Pokemon Battle` },
    { name: 'description', content: `Découvrez ${data.pokemon.name_fr}, un Pokemon de type ${data.pokemon.type}` },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  console.log('🔍 === POKEMON DETAIL LOADER START ===');
  console.log('📋 URL:', request.url);
  console.log('📋 Method:', request.method);
  console.log('🍪 Cookies:', request.headers.get('Cookie'));
  
  const { user } = await getUserFromSession(request);
  
  console.log('👤 User from session:', user ? `${user.username} (${user.email})` : 'NULL');
  
  if (!user) {
    console.log('❌ No user - redirecting to login');
    return redirect('/login');
  }

  const pokemonId = params.pokemonId;
  console.log('🔍 Pokemon ID:', pokemonId);
  
  if (!pokemonId || isNaN(Number(pokemonId))) {
    console.log('❌ Invalid Pokemon ID');
    throw new Response('Pokemon ID invalide', { status: 400 });
  }

  try {
    console.log(`🔍 Dashboard Pokemon ${pokemonId} - Appel direct backend`);
    console.log('🔑 Backend token:', user.token ? 'PRESENT' : 'MISSING');
    
    // Utiliser le nom du service Docker pour la communication inter-conteneurs
    const backendUrl = 'http://backend:3001';
      
    const response = await fetch(`${backendUrl}/api/pokemon/${pokemonId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📡 Backend response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`❌ Erreur backend Pokemon ${pokemonId}:`, response.status);
      if (response.status === 404) {
        throw new Response('Pokemon non trouvé', { status: 404 });
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Pokemon ${pokemonId} récupéré:`, data.pokemon?.name_fr);
    
    return json({
      pokemon: data.pokemon as PokemonDetail
    });
  } catch (error) {
    console.error('❌ Erreur Pokemon detail:', error);
    throw new Response('Pokemon non trouvé', { status: 404 });
  }
};

// Fonction pour obtenir les couleurs des types vintage
const getTypeColorVintage = (type: string) => {
  const colors: { [key: string]: string } = {
    normal: 'bg-gray-200 text-gray-800 border-gray-400',
    fire: 'bg-red-200 text-red-800 border-red-400',
    water: 'bg-blue-200 text-blue-800 border-blue-400',
    electric: 'bg-yellow-200 text-yellow-800 border-yellow-400',
    grass: 'bg-green-200 text-green-800 border-green-400',
    ice: 'bg-cyan-200 text-cyan-800 border-cyan-400',
    fighting: 'bg-red-300 text-red-900 border-red-500',
    poison: 'bg-purple-200 text-purple-800 border-purple-400',
    ground: 'bg-yellow-300 text-yellow-900 border-yellow-500',
    flying: 'bg-indigo-200 text-indigo-800 border-indigo-400',
    psychic: 'bg-pink-200 text-pink-800 border-pink-400',
    bug: 'bg-green-300 text-green-900 border-green-500',
    rock: 'bg-gray-300 text-gray-900 border-gray-500',
    ghost: 'bg-purple-300 text-purple-900 border-purple-500',
    dragon: 'bg-indigo-300 text-indigo-900 border-indigo-500',
    dark: 'bg-gray-400 text-gray-900 border-gray-600',
    steel: 'bg-gray-300 text-gray-800 border-gray-500',
    fairy: 'bg-pink-300 text-pink-900 border-pink-500',
  };
  return colors[type] || 'bg-gray-200 text-gray-800 border-gray-400';
};

export default function PokemonDetail() {
  const { pokemon } = useLoaderData<typeof loader>() as { pokemon: PokemonDetail; };

  const statNames: Record<string, string> = {
    hp: 'PV',
    attack: 'ATTAQUE',
    defense: 'DEFENSE',
    special_attack: 'ATT SPE',
    special_defense: 'DEF SPE',
    speed: 'VITESSE'
  };

  // Vérifications de sécurité pour les stats
  const safeStats = pokemon.stats || {};
  const statsValues = Object.values(safeStats).map(v => Number(v) || 0);
  const maxStat = statsValues.length > 0 ? Math.max(...statsValues) : 100;
  const totalStats = statsValues.reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="pokemon-vintage-bg h-screen p-2 overflow-hidden">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Navigation vintage - compacte */}
        <nav className="pokemon-card-vintage flex-shrink-0">
          <div className="p-2 flex items-center space-x-3">
            <Link 
              to="/dashboard/pokemon" 
              className="pokemon-btn-vintage pokemon-btn-blue text-xs"
            >
              ← RETOUR
            </Link>
            <span className="font-pokemon text-xs text-gray-600">→</span>
            <span className="font-pokemon text-xs text-gray-800 uppercase">
              {pokemon.name_fr}
            </span>
          </div>
        </nav>

        {/* Header principal vintage avec image et infos - compacte */}
        <div className="pokemon-card-vintage border-4 border-blue-600 flex-shrink-0 mt-2">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Image Pokemon avec cadre vintage - plus petite */}
              <div className="pokemon-screen-vintage w-24 h-24 flex items-center justify-center">
                <img 
                  src={pokemon.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                  alt={pokemon.name_fr}
                  className="w-20 h-20 object-contain pixelated"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                  }}
                />
              </div>
              
              {/* Infos principales vintage - compactes */}
              <div className="flex-1 text-center md:text-left text-white">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <h1 className="font-pokemon text-xl uppercase tracking-wider">
                    {pokemon.name_fr}
                  </h1>
                  <span className="pokemon-badge-vintage text-xs">
                    #{pokemon.id.toString().padStart(3, '0')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 justify-center md:justify-start mb-2">
                  {(pokemon.types || []).map((type: string) => (
                    <span 
                      key={type}
                      className={`px-2 py-1 font-pokemon text-xs rounded border-2 ${getTypeColorVintage(type)}`}
                    >
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>

                {pokemon.description && (
                  <div className="pokemon-text-box">
                    <p className="font-pokemon text-xs uppercase leading-tight">
                      {pokemon.description.substring(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Informations physiques vintage - compactes */}
          <div className="p-3 grid grid-cols-4 gap-2 bg-cream-100">
            <div className="pokemon-stat-vintage text-center">
              <div className="font-digital text-lg text-blue-600">{pokemon.height}M</div>
              <div className="font-pokemon text-xs text-gray-700">TAILLE</div>
            </div>
            <div className="pokemon-stat-vintage text-center">
              <div className="font-digital text-lg text-green-600">{pokemon.weight}KG</div>
              <div className="font-pokemon text-xs text-gray-700">POIDS</div>
            </div>
            <div className="pokemon-stat-vintage text-center">
              <div className="font-digital text-lg text-purple-600">G{pokemon.generation}</div>
              <div className="font-pokemon text-xs text-gray-700">GEN</div>
            </div>
            <div className="pokemon-stat-vintage text-center">
              <div className="font-digital text-lg text-red-600 animate-pokemon-blink">{(pokemon.abilities || []).length}</div>
              <div className="font-pokemon text-xs text-gray-700">TALENTS</div>
            </div>
          </div>
        </div>

        {/* Contenu principal - SANS SCROLL, ajusté automatiquement */}
        <div className="flex-1 mt-2 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 h-full">
            {/* Statistiques vintage - compactes */}
            <div className="pokemon-card-vintage h-full">
              <div className="p-3 h-full flex flex-col">
                <h2 className="font-pokemon text-sm text-gray-700 mb-2 uppercase flex items-center space-x-2">
                  <span>📊</span>
                  <span>STATS</span>
                </h2>
                
                <div className="space-y-2 flex-1">
                  {Object.entries(safeStats).map(([stat, value]) => (
                    <div key={stat}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-pokemon text-xs text-gray-700 uppercase">
                          {statNames[stat] || stat}
                        </span>
                        <span className="font-digital text-sm text-gray-900">{Number(value)}</span>
                      </div>
                      <div className="pokemon-progress-bar">
                        <div 
                          className="pokemon-progress-fill"
                          style={{ width: `${Math.min((Number(value) / maxStat) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-2 pt-2 border-t-2 border-gray-400">
                  <div className="pokemon-stat-vintage text-center">
                    <div className="font-digital text-lg text-blue-600">{totalStats}</div>
                    <div className="font-pokemon text-xs text-gray-700">TOTAL</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Talents et attaques vintage - compacts */}
            <div className="space-y-3 h-full flex flex-col">
              {/* Talents - compacts */}
              <div className="pokemon-card-vintage flex-1">
                <div className="p-3 h-full">
                  <h2 className="font-pokemon text-sm text-gray-700 mb-2 uppercase flex items-center space-x-2">
                    <span>✨</span>
                    <span>TALENTS</span>
                  </h2>
                  
                  <div className="space-y-1">
                    {(pokemon.abilities || []).slice(0, 3).map((ability: string, index: number) => (
                      <div key={index} className="pokemon-ability-vintage">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 border-2 border-blue-700" />
                          <span className="font-pokemon text-xs text-gray-800 uppercase">
                            {ability.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Attaques - compactes */}
              {pokemon.moves && pokemon.moves.length > 0 && (
                <div className="pokemon-card-vintage flex-1">
                  <div className="p-3 h-full">
                    <h2 className="font-pokemon text-sm text-gray-700 mb-2 uppercase flex items-center space-x-2">
                      <span>⚔️</span>
                      <span>ATTAQUES</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-1">
                      {pokemon.moves.slice(0, 4).map((move: string, index: number) => (
                        <div 
                          key={index}
                          className="pokemon-ability-vintage bg-gray-100 border border-gray-300 rounded p-1"
                        >
                          <span className="font-pokemon text-xs uppercase text-gray-800">
                            {move.replace('-', ' ').substring(0, 15)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {pokemon.moves.length > 4 && (
                      <div className="mt-1 text-center">
                        <span className="font-pokemon text-xs text-gray-600 uppercase">
                          +{pokemon.moves.length - 4} AUTRES
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions vintage - compactes */}
              <div className="pokemon-card-vintage flex-shrink-0">
                <div className="p-2">
                  <div className="flex gap-2 justify-center">
                    <Link
                      to="/dashboard/teams/create"
                      className="pokemon-btn-vintage pokemon-btn-green flex items-center justify-center space-x-1 text-xs"
                    >
                      <span>➕</span>
                      <span>EQUIPE</span>
                    </Link>
                    
                    <Link
                      to="/dashboard/pokemon"
                      className="pokemon-btn-vintage pokemon-btn-gray flex items-center justify-center space-x-1 text-xs"
                    >
                      <span>🔙</span>
                      <span>LISTE</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}