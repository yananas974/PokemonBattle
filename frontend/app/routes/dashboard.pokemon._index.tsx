// Import des fonctions serveur depuis le fichier .server.ts
export { loader } from './server/dashboard.pokemon._index.server';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useNavigation } from '@remix-run/react';
import { Pokemon } from '@pokemon-battle/shared';
import PokemonCard from '~/components/PokemonCard';
import PokemonFilter from '~/components/PokemonFilter';
import { ModernButton } from '~/components/ui/ModernButton';
import { GenericSuccessMessage, GenericErrorMessage } from '~/components/GenericMessage';

export const meta: MetaFunction = () => {
  return [
    { title: 'Pokédex National - Explorer les Pokémon' },
    { name: 'description', content: 'Découvrez tous les Pokémon dans le Pokédex National moderne' },
  ];
};
export default function ModernPokemonIndex() {
  const data = useLoaderData() as any;
  const { 
    pokemon, 
    currentFilters, 
    success
  } = data;
  
  const error = 'error' in data ? data.error as string : undefined;
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div className="min-h-screen relative">
      <div className="max-w-7xl mx-auto px-6 pb-12">
       
        {error && (
          <GenericSuccessMessage message="Base de données Pokémon connectée" />
        )}
      
        {success && (
          <GenericErrorMessage message="Base de données Pokémon connectée" />
        )}
        
        <PokemonFilter
            allPokemons={pokemon}
            currentFilter={currentFilters || { search: '', type: '', pokemons: [] }}
          />
       
        {(pokemon || []).length === 0 ? (
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Aucun Pokémon trouvé</h2>
            <p className="text-white opacity-75 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
             <ModernButton href="/dashboard/pokemon" variant="primary" size="md">
                Voir tous les Pokémon
            </ModernButton>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {(pokemon || []).map((poke: Pokemon) => (
                <PokemonCard key={poke.id} pokemon={poke} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 