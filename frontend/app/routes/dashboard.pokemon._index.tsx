// Import des fonctions serveur depuis le fichier .server.ts
export { loader } from './server/dashboard.pokemon._index.server';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { Pokemon } from '@pokemon-battle/shared';
import PokemonCard from '~/components/PokemonCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { ModernCard } from '~/components/ui/ModernCard';
import { GenericSuccessMessage, GenericErrorMessage } from '~/components/GenericMessage';
import { usePokemonList } from '~/hooks/usePokemonList';


// Composant pour afficher la grille des Pokémon
const PokemonGrid = ({ 
  pokemon, 
  isLoading 
}: { 
  pokemon: Pokemon[]; 
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <ModernCard key={index} variant="glass" className="animate-pulse">
            <div className="p-4 space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-lg mx-auto" />
              <div className="h-4 bg-white/20 rounded" />
              <div className="h-3 bg-white/20 rounded w-2/3 mx-auto" />
            </div>
          </ModernCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {pokemon.map((poke: Pokemon) => (
        <PokemonCard key={poke.id} pokemon={poke} />
      ))}
    </div>
  );
};

// Composant pour l'état vide
const EmptyState = ({ 
  hasFilters, 
  onResetFilters 
}: { 
  hasFilters: boolean; 
  onResetFilters: () => void;
}) => {
  return (
    <ModernCard variant="glass" className="text-center py-12">
      <div className="space-y-6">
        <div className="text-8xl mb-6">
          {hasFilters ? '🔍' : '❌'}
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          {hasFilters ? 'Aucun Pokémon trouvé' : 'Aucun Pokémon disponible'}
        </h2>
        <p className="text-white opacity-75 mb-6">
          {hasFilters 
            ? 'Essayez de modifier vos critères de recherche' 
            : 'La base de données Pokémon semble vide'
          }
        </p>
        <div className="flex justify-center space-x-4">
          {hasFilters && (
            <ModernButton 
              onClick={onResetFilters}
              variant="secondary" 
              size="md"
            >
              🔄 Réinitialiser les filtres
            </ModernButton>
          )}
          <ModernButton 
            href="/dashboard/pokemon" 
            variant="primary" 
            size="md"
          >
            🔍 Voir tous les Pokémon
          </ModernButton>
        </div>
      </div>
    </ModernCard>
  );
};

// Composant pour les filtres modernes
const ModernPokemonFilter = ({
  searchFilter,
  typeFilter,
  availableTypes,
  onSearchChange,
  onTypeChange,
  onReset,
  isLoading
}: {
  searchFilter: string;
  typeFilter: string;
  availableTypes: string[];
  onSearchChange: (search: string) => void;
  onTypeChange: (type: string) => void;
  onReset: () => void;
  isLoading: boolean;
}) => {
  return (
    <ModernCard variant="glass" className="mb-6">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>🔍</span>
          <span>Rechercher des Pokémon</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recherche par nom */}
          <div>
            <label className="block text-white font-medium mb-2">
              Rechercher par nom
            </label>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pikachu, Dracaufeu..."
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            />
          </div>

          {/* Filtre par type */}
          <div>
            <label className="block text-white font-medium mb-2">
              Filtrer par type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
            >
              <option value="">Tous les types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        {(searchFilter || typeFilter) && (
          <div className="mt-6 flex justify-center">
            <ModernButton
              onClick={onReset}
              variant="secondary"
              size="md"
              disabled={isLoading}
            >
              🔄 Réinitialiser les filtres
            </ModernButton>
          </div>
        )}
      </div>
    </ModernCard>
  );
};

export default function ModernPokemonIndex() {
  const data = useLoaderData() as any;
  const { 
    pokemon: initialPokemon, 
    currentFilters, 
    success
  } = data;
  
  const error = 'error' in data ? data.error as string : undefined;
  const navigation = useNavigation();
  const isNavigationLoading = navigation.state === 'loading';

  // Utilisation du hook usePokemonList
  const pokemonList = usePokemonList({
    initialPokemon: initialPokemon || [],
    initialSearchFilter: currentFilters?.search || '',
    initialTypeFilter: currentFilters?.type || '',
    onError: (error) => {
      console.error('❌ Erreur Pokémon:', error);
    }
  });

  // Synchroniser les données du loader avec le hook
  useEffect(() => {
    if (initialPokemon) {
      pokemonList.setPokemon(initialPokemon);
    }
  }, [initialPokemon]);

  // Synchroniser les filtres du loader avec le hook
  useEffect(() => {
    if (currentFilters) {
      if (currentFilters.search !== pokemonList.searchFilter) {
        pokemonList.setSearchFilter(currentFilters.search || '');
      }
      if (currentFilters.type !== pokemonList.typeFilter) {
        pokemonList.setTypeFilter(currentFilters.type || '');
      }
    }
  }, [currentFilters, pokemonList.searchFilter, pokemonList.typeFilter]);

  // Gérer l'état de chargement
  useEffect(() => {
    pokemonList.setLoading(isNavigationLoading);
  }, [isNavigationLoading]);

  // Gérer les erreurs
  useEffect(() => {
    if (error) {
      pokemonList.setError(error);
    }
  }, [error]);

  const filteredPokemon = pokemonList.getFilteredPokemon();
  const hasFilters = pokemonList.hasFilters();
  const isLoading = pokemonList.isLoading || isNavigationLoading;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-6 pb-12">
       
        {/* Messages de statut */}
        {error && (
          <GenericErrorMessage message={error} />
        )}
      
        {success && (
          <GenericSuccessMessage message="Base de données Pokémon connectée" />
        )}

        {/* Erreur du hook */}
        {pokemonList.error && (
          <ModernCard variant="glass" className="bg-red-500/20 border-red-400/30 mb-6">
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="text-red-200 font-bold mb-2">Erreur</h3>
                  <p className="text-red-100">{pokemonList.error}</p>
                </div>
              </div>
            </div>
          </ModernCard>
        )}
        
        {/* Filtres */}
        <ModernPokemonFilter
          searchFilter={pokemonList.searchFilter}
          typeFilter={pokemonList.typeFilter}
          availableTypes={pokemonList.availableTypes}
          onSearchChange={pokemonList.setSearchFilter}
          onTypeChange={pokemonList.setTypeFilter}
          onReset={pokemonList.resetFilters}
          isLoading={isLoading}
        />
       
        {/* Contenu principal */}
        {filteredPokemon.length === 0 ? (
          <EmptyState 
            hasFilters={hasFilters}
            onResetFilters={pokemonList.resetFilters}
          />
        ) : (
          <PokemonGrid 
            pokemon={filteredPokemon}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
} 