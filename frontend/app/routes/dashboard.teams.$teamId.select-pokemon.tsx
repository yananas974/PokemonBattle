// Import des fonctions serveur depuis le fichier .server.ts
export { loader, action } from './server/dashboard.teams.$teamId.select-pokemon.server';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit, Link } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { VirtualizedGrid } from '~/components/VirtualizedGrid';
import { ModernPokemonCard } from '~/components/ModernPokemonCard';
import type { Pokemon } from '@pokemon-battle/shared';
import { useState, useEffect, useMemo } from 'react';
import { useTeamPokemon } from '~/hooks/useCollection';

// Types pour les données
interface LoaderData {
  user: any;
  pokemon: Pokemon[];
  team: any;
  teamId: number;
  teamPokemonCount: number;
  maxPokemonPerTeam: number;
  error?: string;
}

interface ActionData {
  error?: string;
  success?: boolean;
  message?: string;
  pokemon?: any;
}

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `Sélection Pokémon - Équipe ${params.teamId} - Pokemon Battle` },
    { name: 'description', content: 'Sélectionnez et gérez les Pokémon de votre équipe' },
  ];
};

export default function SelectPokemon() {
  const { pokemon, team, teamId, teamPokemonCount, maxPokemonPerTeam, error, user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const isLoading = navigation.state === 'submitting';

  const teamPokemon = useTeamPokemon(team?.pokemon || [], maxPokemonPerTeam);

  useEffect(() => {
    if (team?.pokemon) {
      teamPokemon.setItems(team.pokemon);
    }
  }, [team?.pokemon]);

  const teamPokemonIds = teamPokemon.items.map((p: any) => p.id || p.pokemon_id);

  const filteredPokemon = (pokemon || []).filter(p => {
    const matchesSearch = !searchFilter || p.name_fr?.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const availableTypes = [...new Set((pokemon || []).map(p => p.type))].sort();

  const handleAddPokemon = async (pokemonId: number) => {
    if (!teamPokemon.canAddMore()) {
      teamPokemon.setError(`Équipe complète (${maxPokemonPerTeam}/${maxPokemonPerTeam})`);
      return;
    }

    if (teamPokemon.hasItem(pokemonId)) {
      teamPokemon.setError('Ce Pokémon est déjà dans l\'équipe');
      return;
    }

    const pokemonToAdd = pokemon.find(p => p.id === pokemonId);
    if (!pokemonToAdd) {
      teamPokemon.setError('Pokémon introuvable');
      return;
    }

    const success = await teamPokemon.addItem(pokemonToAdd);
    if (success) {
      const formData = new FormData();
      formData.append('intent', 'addPokemon');
      formData.append('pokemonId', pokemonId.toString());
      submit(formData, { method: 'post' });
    }
  };

  const handleRemovePokemon = async (pokemonId: number) => {
    if (!teamPokemon.hasItem(pokemonId)) {
      teamPokemon.setError('Ce Pokémon n\'est pas dans l\'équipe');
      return;
    }

    const success = await teamPokemon.removeItem(pokemonId);
    if (success) {
      const formData = new FormData();
      formData.append('intent', 'removePokemon');
      formData.append('pokemonId', pokemonId.toString());
      submit(formData, { method: 'post' });
    }
  };

  // ... Tout le code HTML avant la <VirtualizedGrid> reste inchangé

  return (
    <div className="...">
      {/* ... contenu avant VirtualizedGrid ... */}

      <VirtualizedGrid
        items={filteredPokemon}
        itemHeight={320}
        containerHeight={500}
        itemsPerRow={4}
        renderItem={(poke: Pokemon) => {
          const isInTeam = teamPokemonIds.includes(poke.id);
          const canAdd = teamPokemon.count < maxPokemonPerTeam && !isInTeam;

          return (
            <div className="p-2">
              <ModernPokemonCard
                pokemon={poke}
                variant="team"
                isSelected={isInTeam}
                showStats={true}
                onClick={() => {
                  if (isInTeam) {
                    handleRemovePokemon(poke.id);
                  } else if (canAdd) {
                    handleAddPokemon(poke.id);
                  }
                }}
              />
              <div className="mt-2 space-y-2">
                {isInTeam ? (
                  <ModernButton
                    variant="secondary"
                    size="sm"
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={() => handleRemovePokemon(poke.id)}
                    disabled={isLoading || teamPokemon.isLoading}
                  >
                    <span className="mr-2">❌</span>
                    Retirer de l'équipe
                  </ModernButton>
                ) : (
                  <ModernButton
                    variant={canAdd ? "pokemon" : "secondary"}
                    size="sm"
                    className={`w-full ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => canAdd && handleAddPokemon(poke.id)}
                    disabled={!canAdd || isLoading || teamPokemon.isLoading}
                  >
                    {canAdd ? (
                      <>
                        <span className="mr-2">➕</span>
                        Ajouter à l'équipe
                      </>
                    ) : (
                      <>
                        <span className="mr-2">❌</span>
                        Équipe complète
                      </>
                    )}
                  </ModernButton>
                )}
                <Link to={`/dashboard/pokemon/${poke.id}`}>
                  <ModernButton variant="secondary" size="sm" className="w-full">
                    <span className="mr-2">📊</span>
                    Voir détails
                  </ModernButton>
                </Link>
              </div>
            </div>
          );
        }}
        gap={16}
      />

      {/* ... contenu après VirtualizedGrid ... */}
    </div>
  );
}
