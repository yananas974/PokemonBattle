// Import des fonctions serveur depuis le fichier .server.ts
export { loader, action } from './server/dashboard.teams.$teamId.select-pokemon.server';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit, Link } from '@remix-run/react';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import type { Pokemon } from '@pokemon-battle/shared';
import { useState } from 'react';
import { getPokemonSprite } from '~/services/pokemonSpriteService';

// Types pour les données
interface LoaderData {
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

// Les fonctions loader et action sont importées depuis le fichier .server.ts

export default function SelectPokemon() {
  const { pokemon, team, teamId, teamPokemonCount, maxPokemonPerTeam, error } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const isLoading = navigation.state === 'submitting';

  // Gestion d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-6">
        <div className="max-w-4xl mx-auto">
          <ModernCard variant="glass" className="bg-red-500/20 border border-red-400/30">
            <div className="p-8 text-center">
              <div className="text-8xl mb-6">⚠️</div>
              <h1 className="text-white font-bold text-3xl mb-4">Erreur de chargement</h1>
              <p className="text-red-200 mb-6">{error}</p>
              <Link to="/dashboard/teams">
                <ModernButton variant="secondary" size="lg">
                  ← Retour aux équipes
                </ModernButton>
              </Link>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }
  
  // Pokémon dans l'équipe (IDs)
  const teamPokemonIds = team?.pokemon?.map((p: any) => p.id || p.pokemon_id) || [];
  
  // Filtrage des Pokémon
  const filteredPokemon = (pokemon || []).filter(p => {
    const matchesSearch = !searchFilter || 
      p.name_fr?.toLowerCase().includes(searchFilter.toLowerCase())
    
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Types uniques pour le filtre
  const availableTypes = [...new Set(
    (pokemon || []).map(p => p.type)
  )].sort();

  const handleAddPokemon = (pokemonId: number) => {
    if (teamPokemonCount >= maxPokemonPerTeam) {
      return;
    }
    
    if (teamPokemonIds.includes(pokemonId)) {
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'addPokemon');
    formData.append('pokemonId', pokemonId.toString());
    
    submit(formData, { method: 'post' });
  };

  const handleRemovePokemon = (pokemonId: number) => {
    if (!teamPokemonIds.includes(pokemonId)) {
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'removePokemon');
    formData.append('pokemonId', pokemonId.toString());
    
    submit(formData, { method: 'post' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Navigation Header */}
          <ModernCard variant="glass" className="backdrop-blur-xl bg-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard/teams"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-white hover:scale-105"
                  >
                    <span className="text-lg">👥</span>
                    <span className="font-medium">← Retour aux Équipes</span>
                  </Link>
                  <span className="text-white/60">→</span>
                  <h1 className="text-white font-bold text-lg">
                    🔧 Modifier l'Équipe
                  </h1>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-bold text-xl">{team?.teamName || team?.name || 'Équipe inconnue'}</div>
                  <div className="text-white/70 text-sm">
                    {teamPokemonCount}/{maxPokemonPerTeam} Pokémon
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Success/Error Messages */}
          {actionData?.error && (
            <ModernCard variant="glass" className="border-l-4 border-red-400 bg-red-500/20">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">❌</span>
                  <div>
                    <h3 className="text-red-200 font-bold mb-2">Erreur</h3>
                    <p className="text-red-100">{actionData.error}</p>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {actionData?.success && actionData?.message && (
            <ModernCard variant="glass" className="border-l-4 border-green-400 bg-green-500/20">
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="text-green-200 font-bold mb-2">Succès</h3>
                    <p className="text-green-100">{actionData.message}</p>
                  </div>
                </div>
              </div>
            </ModernCard>
          )}

          {/* Team Slots Indicator */}
          <ModernCard variant="glass" className="bg-purple-500/20">
            <div className="p-6">
              <h2 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
                <span>👥</span>
                <span>Équipe Actuelle</span>
                <span className="text-sm font-normal">({teamPokemonCount}/6)</span>
              </h2>
              
              {/* Slots visualization */}
              <div className="flex space-x-2 mb-6">
                {Array.from({ length: maxPokemonPerTeam }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                      index < teamPokemonCount 
                        ? 'bg-green-500 border-green-400 text-white' 
                        : 'bg-white/10 border-white/30 text-white/50'
                    }`}
                  >
                    {index < teamPokemonCount ? '⚡' : '○'}
                  </div>
                ))}
              </div>

              {/* Team Pokemon */}
              {team?.pokemon && team.pokemon.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {team.pokemon.map((poke: Pokemon, index: number) => (
                    <ModernCard key={index} variant="glass" className="bg-white/5 hover:bg-white/10 transition-all duration-200">
                      <div className="p-4 text-center">
                      <img src={poke.sprite_url} {...poke.sprite_url && {className: "w-16 h-16 object-contain mx-auto mb-2", style: { imageRendering: 'pixelated' }}} />
                        <div className="text-white text-sm font-medium mb-3 truncate">
                          {poke.name_fr || poke.name_en}
                        </div>
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          onClick={() => handleRemovePokemon(poke.id || poke.id)}
                          disabled={isLoading}
                        >
                          <span className="mr-1">❌</span>
                          Retirer
                        </ModernButton>
                      </div>
                    </ModernCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4 opacity-50">👥</div>
                  <h3 className="text-white font-bold text-lg mb-2">Équipe Vide</h3>
                  <p className="text-white/70">
                    Ajoutez des Pokémon depuis la liste ci-dessous
                  </p>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Filters */}
          <ModernCard variant="glass" size="lg" className="shadow-2xl">
            <div className="p-6">
              <h2 className="text-white font-bold text-xl mb-6 flex items-center space-x-2">
                <span>🔍</span>
                <span>Filtres de Recherche</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">
                    Rechercher par nom
                  </label>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Pikachu, Dracaufeu..."
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">
                    Filtrer par type
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="all">Tous les types</option>
                    {availableTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ModernCard>

          {/* Pokemon List */}
          <ModernCard variant="glass" size="lg" className="shadow-2xl">
            <div className="p-6">
              <h2 className="text-white font-bold text-xl mb-6 flex items-center space-x-2">
                <span>📚</span>
                <span>Pokémon Disponibles</span>
                <span className="text-sm font-normal">({filteredPokemon.length})</span>
              </h2>
              
              {filteredPokemon.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPokemon.map((poke) => {
                    const isInTeam = teamPokemonIds.includes(poke.id);
                    const canAdd = teamPokemonCount < maxPokemonPerTeam && !isInTeam;
                    
                    return (
                      <ModernCard 
                        key={poke.id} 
                        variant="glass" 
                        className={`transition-all duration-200 ${
                          isInTeam ? 'bg-yellow-500/20 border-yellow-400/50' : 'bg-white/5 hover:bg-white/10 hover:scale-105'
                        }`}
                      >
                        <div className="p-4">
                          <div className="text-center mb-4">
                            <img src={poke.sprite_url} {...poke.sprite_url && {className: "w-20 h-20 object-contain mx-auto mb-3", style: { imageRendering: 'pixelated' }}} />
                            <h3 className="text-white font-medium text-lg mb-1">
                              {poke.name_fr}
                            </h3>
                            <p className="text-white/70 text-sm">
                              #{poke.id.toString().padStart(3, '0')}
                            </p>
                          </div>
                          
                          {/* Type Badge */}
                          <div className="flex justify-center mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/50 text-purple-200 text-sm font-medium">
                              {poke.type.charAt(0).toUpperCase() + poke.type.slice(1)}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="space-y-2">
                            {isInTeam ? (
                              <ModernButton
                                variant="secondary"
                                size="sm"
                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                onClick={() => handleRemovePokemon(poke.id)}
                                disabled={isLoading}
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
                                disabled={!canAdd || isLoading}
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
                              <ModernButton
                                variant="secondary"
                                size="sm"
                                className="w-full"
                              >
                                <span className="mr-2">📊</span>
                                Voir détails
                              </ModernButton>
                            </Link>
                          </div>
                        </div>
                      </ModernCard>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 opacity-50">🔍</div>
                  <h3 className="text-white font-bold text-lg mb-2">Aucun Pokémon trouvé</h3>
                  <p className="text-white/70">
                    Modifiez vos filtres pour voir plus de Pokémon
                  </p>
                </div>
              )}
            </div>
          </ModernCard>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard/teams">
              <ModernButton
                variant="pokemon"
                size="lg"
                className="w-full sm:w-auto"
              >
                <span className="mr-2">✅</span>
                Terminer la modification
              </ModernButton>
            </Link>
            
            {teamPokemonCount > 0 && (
              <Link to="/dashboard/battle">
                <ModernButton
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <span className="mr-2">⚔️</span>
                  Aller au combat
                </ModernButton>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 