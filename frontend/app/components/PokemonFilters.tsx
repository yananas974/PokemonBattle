import React from 'react';
import { Form, Link } from '@remix-run/react';
import { VintageButton } from './VintageButton';

interface PokemonFiltersProps {
  types: string[];
  generations: number[];
  currentFilters: {
    search: string;
    type: string;
    generation: string;
  };
  isLoading?: boolean;
}

export const PokemonFilters: React.FC<PokemonFiltersProps> = React.memo(({
  types,
  generations,
  currentFilters,
  isLoading = false
}) => {
  return (
    <Form method="get" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recherche */}
        <div>
          <label htmlFor="search" className="block font-pokemon text-xs text-pokemon-blue-dark mb-2 uppercase">
            RECHERCHER
          </label>
          <input
            type="text"
            id="search"
            name="search"
            defaultValue={currentFilters.search}
            placeholder="NOM OU ID..."
            className="w-full px-3 py-2 font-pokemon text-xs border-2 border-pokemon-blue-dark rounded bg-pokemon-cream focus:outline-none focus:border-pokemon-yellow uppercase placeholder-pokemon-blue"
          />
        </div>

        {/* Filtre Type */}
        <div>
          <label htmlFor="type" className="block font-pokemon text-xs text-pokemon-blue-dark mb-2 uppercase">
            TYPE
          </label>
          <select
            id="type"
            name="type"
            defaultValue={currentFilters.type}
            className="w-full px-3 py-2 font-pokemon text-xs border-2 border-pokemon-blue-dark rounded bg-pokemon-cream focus:outline-none focus:border-pokemon-yellow uppercase"
          >
            <option value="">TOUS TYPES</option>
            {types.map((type: string) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Génération */}
        <div>
          <label htmlFor="generation" className="block font-pokemon text-xs text-pokemon-blue-dark mb-2 uppercase">
            GENERATION
          </label>
          <select
            id="generation"
            name="generation"
            defaultValue={currentFilters.generation}
            className="w-full px-3 py-2 font-pokemon text-xs border-2 border-pokemon-blue-dark rounded bg-pokemon-cream focus:outline-none focus:border-pokemon-yellow uppercase"
          >
            <option value="">TOUTES GEN</option>
            {generations.map((gen: number) => (
              <option key={gen} value={gen.toString()}>
                GEN {gen}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-3">
        <VintageButton
          type="submit"
          variant="blue"
          disabled={isLoading}
        >
          {isLoading ? 'SCAN...' : 'FILTRER'}
        </VintageButton>
        <VintageButton
          href="/dashboard/pokemon"
          variant="gray"
        >
          RESET
        </VintageButton>
      </div>
    </Form>
  );
});

PokemonFilters.displayName = 'PokemonFilters';

