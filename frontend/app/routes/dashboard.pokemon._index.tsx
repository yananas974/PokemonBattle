import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigation, Link } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { pokemonService } from '~/services/pokemonService';
import { Pokemon, PokemonResponse } from '@pokemon-battle/shared';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import ClientOnly from '~/components/ClientOnly';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokédex National - Explorer les Pokémon' },
    { name: 'description', content: 'Découvrez tous les Pokémon dans le Pokédex National moderne' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    const data: PokemonResponse = await pokemonService.getAllPokemon(request);
    
    // Extraire les types uniques pour les filtres
    const types = [...new Set(
      data.pokemon?.map((p: Pokemon) => p.type) || []
    )].sort();
    
    const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Récupérer les paramètres de recherche
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const typeFilter = url.searchParams.get('type') || '';

    // Appliquer les filtres
    let filteredPokemon = data.pokemon || [];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPokemon = filteredPokemon.filter((p: Pokemon) => 
        p.name_fr?.toLowerCase().includes(searchLower) ||
        p.id?.toString().includes(search)
      );
    }
    
    if (typeFilter) {
      filteredPokemon = filteredPokemon.filter((p: Pokemon) =>
        p.type === typeFilter
      );
    }

    return json({
      user,
      pokemon: filteredPokemon,
      totalCount: filteredPokemon.length,
      totalPokemon: data.pokemon?.length || 0,
      types: types,
      generations: generations,
      currentFilters: { search, type: typeFilter },
      success: data.success
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des Pokemon:', error);
    
    return json({
      user,
      pokemon: [] as Pokemon[],
      totalCount: 0,
      totalPokemon: 0,
      types: [] as string[],
      generations: [] as number[],
      currentFilters: { search: '', type: '' },
      error: 'Impossible de charger les Pokémon' as string,
      success: false
    });
  }
};

// Composant pour les particules d'arrière-plan
const PokemonParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
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

// Composant pour les cartes Pokémon modernes
const ModernPokemonCard = ({ pokemon }: { pokemon: Pokemon }) => {
  const typeColors: { [key: string]: string } = {
    'Normal': 'from-gray-400 to-gray-600',
    'Fire': 'from-red-400 to-orange-600',
    'Water': 'from-blue-400 to-blue-600',
    'Electric': 'from-yellow-400 to-yellow-600',
    'Grass': 'from-green-400 to-green-600',
    'Ice': 'from-cyan-300 to-blue-400',
    'Fighting': 'from-red-600 to-red-800',
    'Poison': 'from-purple-400 to-purple-600',
    'Ground': 'from-yellow-600 to-brown-600',
    'Flying': 'from-indigo-300 to-blue-400',
    'Psychic': 'from-pink-400 to-purple-500',
    'Bug': 'from-green-500 to-yellow-500',
    'Rock': 'from-yellow-700 to-gray-600',
    'Ghost': 'from-purple-600 to-indigo-800',
    'Dragon': 'from-indigo-500 to-purple-700',
    'Dark': 'from-gray-700 to-black',
    'Steel': 'from-gray-400 to-gray-600',
    'Fairy': 'from-pink-300 to-pink-500'
  };

  const bgGradient = typeColors[pokemon.type] || 'from-gray-400 to-gray-600';

  return (
    <Link 
      to={`/dashboard/pokemon/${pokemon.id}`}
      className="group block transform transition-all duration-300 hover:scale-105 hover:z-10"
    >
      <div className={`relative bg-gradient-to-br ${bgGradient} rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
        {/* Numéro Pokédex */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-30 text-white text-xs font-bold px-2 py-1 rounded-full">
          #{pokemon.id.toString().padStart(3, '0')}
        </div>

        {/* Image Pokémon */}
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full blur-xl"></div>
            <img 
              src={pokemon.sprite_url || '/placeholder-pokemon.png'} 
              alt={pokemon.name_fr}
              className="relative w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        </div>

        {/* Nom */}
        <h3 className="text-white font-bold text-center text-sm mb-2 drop-shadow-md">
          {pokemon.name_fr}
        </h3>

        {/* Type */}
        <div className="flex justify-center">
          <span className="bg-white bg-opacity-20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
            {pokemon.type}
          </span>
        </div>

        {/* Stats rapides */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white">
          <div className="bg-white bg-opacity-10 rounded px-2 py-1 text-center">
            <div className="font-semibold">{pokemon.base_hp}</div>
            <div className="opacity-75">HP</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded px-2 py-1 text-center">
            <div className="font-semibold">{pokemon.base_attack}</div>
            <div className="opacity-75">ATK</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Composant pour les filtres modernes
const ModernFilters = ({ types, currentFilters }: { types: string[], currentFilters: any }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">🔍 Rechercher des Pokémon</h2>
      
      <form method="GET" className="space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            name="search"
            defaultValue={currentFilters.search}
            placeholder="Rechercher par nom ou numéro..."
            className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-3 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-50">
            🔍
          </div>
        </div>

        {/* Filtre par type */}
        <div className="flex flex-wrap gap-2">
          <select 
            name="type"
            defaultValue={currentFilters.type}
            className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            {types.map(type => (
              <option key={type} value={type} className="text-black">{type}</option>
            ))}
          </select>
          
          <button 
            type="submit"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Filtrer
          </button>
          
          {(currentFilters.search || currentFilters.type) && (
            <Link 
              to="/dashboard/pokemon"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl transition-all duration-200"
            >
              Réinitialiser
            </Link>
          )}
        </div>
      </form>
    </div>
  );
};

export default function ModernPokemonIndex() {
  const data = useLoaderData<typeof loader>();
  const { 
    pokemon, 
    totalCount, 
    totalPokemon,
    types, 
    currentFilters, 
    success
  } = data;
  
  const error = 'error' in data ? data.error as string : undefined;
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const { playDashboard } = useGlobalAudio();

  // Auto-start dashboard music
  useEffect(() => {
    playDashboard();
  }, [playDashboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      <PokemonAudioPlayer />
      
      {/* Particules d'arrière-plan */}
      <ClientOnly>
        <PokemonParticles />
      </ClientOnly>

      {/* Header moderne */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 text-center py-12">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
            📱 POKÉDEX NATIONAL
          </h1>
          <p className="text-xl text-white opacity-90 drop-shadow-lg">
            Découvrez tous les Pokémon de l'univers
          </p>
          <div className="mt-4 text-white opacity-75">
            {isLoading ? (
              <span className="animate-pulse">⏳ Chargement...</span>
            ) : (
              <span>{totalCount} Pokémon affichés sur {totalPokemon} total</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Navigation de retour */}
        <div className="mb-6">
          <Link 
            to="/dashboard"
            className="inline-flex items-center space-x-2 bg-white bg-opacity-10 backdrop-blur-lg text-white px-4 py-2 rounded-xl hover:bg-opacity-20 transition-all duration-200"
          >
            <span>🏠</span>
            <span>Retour au Dashboard</span>
          </Link>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-2xl p-6 mb-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Erreur de connexion</h2>
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded-2xl p-4 mb-8 text-center">
            <span className="text-green-300">✅ Base de données Pokémon connectée</span>
          </div>
        )}

        {/* Filtres */}
        <ModernFilters types={types} currentFilters={currentFilters} />

        {/* Grille des Pokémon */}
        {(pokemon || []).length === 0 ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Aucun Pokémon trouvé</h2>
            <p className="text-white opacity-75 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Link 
              to="/dashboard/pokemon"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Voir tous les Pokémon
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {(pokemon || []).map((poke: Pokemon) => (
                <ModernPokemonCard key={poke.id} pokemon={poke} />
              ))}
            </div>

            {/* Statistiques */}
            {totalCount > 0 && (
              <div className="mt-12 bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 text-center">
                <p className="text-white text-lg">
                  <span className="font-bold text-yellow-400">{totalCount}</span> Pokémon affichés
                  {currentFilters.search || currentFilters.type ? (
                    <span className="opacity-75"> (filtrés sur {totalPokemon} total)</span>
                  ) : ''}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 