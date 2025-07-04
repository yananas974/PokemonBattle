import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigation, Link } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { pokemonService } from '~/services/pokemonService';
import type { Pokemon, PokemonResponse } from '~/types/pokemon';
import { 
  VintageCard, 
  VintageTitle, 
  VintageButton,
  StatusIndicator,
  PokemonFilters,
  PokemonCard
} from '~/components';

export const meta: MetaFunction = () => {
  return [
    { title: 'Explorer les Pokémon - Pokemon Battle' },
    { name: 'description', content: 'Découvrez et explorez tous les Pokémon disponibles pour vos équipes' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log('🔥 POKEMON LOADER - Récupération via API');
  
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    console.log('❌ No user, redirecting to login');
    throw new Response('Unauthorized', { status: 401 });
  }

  console.log('✅ User found:', user.username);

  try {
    // ✅ Utiliser le pokemonService qui gère correctement les tokens
    const data: PokemonResponse = await pokemonService.getAllPokemon(request);
    console.log('✅ Pokemon API Response:', {
      success: data.success,
      count: data.pokemon?.length || 0
    });

    // Extraire les types et générations uniques pour les filtres
    const types = [...new Set(
      data.pokemon?.map((p: Pokemon) => p.type) || []
    )].sort();
    
    const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9]; // Générations fixes pour l'instant

    // Récupérer les paramètres de recherche et filtres de l'URL
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const typeFilter = url.searchParams.get('type') || '';
    const generationFilter = url.searchParams.get('generation') || '';

    // Appliquer les filtres
    let filteredPokemon = data.pokemon || [];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPokemon = filteredPokemon.filter((p: Pokemon) => 
        p.nameFr?.toLowerCase().includes(searchLower) ||
        p.id?.toString().includes(search)
      );
    }
    
    if (typeFilter) {
      filteredPokemon = filteredPokemon.filter((p: Pokemon) =>
        p.type === typeFilter
      );
    }
    
    if (generationFilter) {
      // Pour l'instant, on ignore le filtre génération car pas encore dans le type Pokemon
      filteredPokemon = filteredPokemon;
    }

    return json({
      user,
      pokemon: filteredPokemon,
      totalCount: filteredPokemon.length,
      totalPokemon: data.pokemon?.length || 0,
      types: types,
      generations: generations,
      currentFilters: { search, type: typeFilter, generation: generationFilter },
      success: data.success
    });
  } catch (error) {
    console.error('❌ Erreur lors du chargement des Pokemon:', error);
    
    // En cas d'erreur, retourner des données vides avec le message d'erreur
    return json({
      user,
      pokemon: [] as Pokemon[],
      totalCount: 0,
      totalPokemon: 0,
      types: [] as string[],
      generations: [] as number[],
      currentFilters: { search: '', type: '', generation: '' },
      error: 'Impossible de charger les Pokémon' as string,
      success: false
    });
  }
};

export default function PokemonIndex() {
  const data = useLoaderData<typeof loader>();
  const { 
    pokemon, 
    totalCount, 
    totalPokemon,
    types, 
    generations, 
    currentFilters, 
    success
  } = data;
  
  const fallback = false; // Supprimé car fallback n'existe plus dans PokemonResponse
  const error = 'error' in data ? data.error as string : undefined;
  
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="pokemon-vintage-bg min-h-screen p-5">
      <div className="space-y-6">
        {/* Status indicators vintage */}
        {error && (
          <StatusIndicator
            type="error"
            title="ERREUR SYSTEME"
            message={error}
          />
        )}
        
        {fallback && (
          <StatusIndicator
            type="warning"
            title="MODE SECOURS"
            message="DONNEES DE TEST ACTIVES"
            animate
          />
        )}

        {success && !fallback && (
          <StatusIndicator
            type="success"
            title="CONNEXION OK"
            message="BASE DE DONNEES ACTIVE"
          />
        )}

        {/* Header vintage avec recherche et filtres */}
        <VintageCard>
          <div className="p-6">
            {/* Navigation de retour */}
            <nav className="mb-4">
              <VintageButton
                href="/dashboard"
                variant="blue"
                size="sm"
              >
                🏠 ← RETOUR DASHBOARD
              </VintageButton>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <VintageTitle level={1} className="mb-3 flex items-center space-x-2">
                  <span>🔍</span>
                  <span>EXPLORER POKEMON</span>
                  <span className="animate-pokemon-blink">⚡</span>
                </VintageTitle>
                <p className="font-pokemon text-xs text-pokemon-blue uppercase">
                  {totalCount} AFFICHES / {totalPokemon} TOTAL
                  {isLoading && <span className="ml-2 animate-pokemon-blink">⏳ SCAN...</span>}
                </p>
              </div>
            </div>

            {/* Formulaire de recherche vintage */}
            <PokemonFilters
              types={types}
              generations={generations}
              currentFilters={currentFilters}
              isLoading={isLoading}
            />
          </div>
        </VintageCard>

        {/* Grille Pokemon vintage */}
        {(pokemon || []).length === 0 ? (
          <VintageCard>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <VintageTitle level={3} className="mb-2">
                AUCUN POKEMON TROUVE
              </VintageTitle>
              <p className="font-pokemon text-xs text-pokemon-blue mb-4 uppercase">
                MODIFIER LES CRITERES DE RECHERCHE
              </p>
              <VintageButton
                href="/dashboard/pokemon"
                variant="blue"
              >
                VOIR TOUS
              </VintageButton>
            </div>
          </VintageCard>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(pokemon || []).map((poke: Pokemon) => (
              <PokemonCard
                key={poke.id}
                id={poke.id}
                name_fr={poke.nameFr}
                type={poke.type}
                sprite_url={poke.sprite_url}
                base_hp={poke.base_hp}
                base_attack={poke.base_attack}
              />
            ))}
          </div>
        )}

        {/* Info pagination vintage */}
        {totalCount > 0 && (
          <VintageCard>
            <div className="p-4 text-center">
              <p className="font-pokemon text-xs text-pokemon-blue uppercase">
                AFFICHAGE: {totalCount} POKEMON
                {currentFilters.search || currentFilters.type || currentFilters.generation ? 
                  ` (FILTRES SUR ${totalPokemon})` : ''
                }
              </p>
            </div>
          </VintageCard>
        )}
      </div>
    </div>
  );
} 