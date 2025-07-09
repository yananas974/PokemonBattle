import React, { useState } from 'react';
import { ModernPokemonCard } from './ModernPokemonCard';

interface Pokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite_url: string;
}

interface Team {
  id: number;
  teamName: string;
  pokemon: Pokemon[];
}

interface ModernTeamBuilderProps {
  teams: Team[];
  availablePokemon: Pokemon[];
  onTeamSelect?: (team: Team) => void;
  onPokemonAdd?: (teamId: number, pokemon: Pokemon) => void;
  selectedTeam?: Team | null;
}

export const ModernTeamBuilder: React.FC<ModernTeamBuilderProps> = ({
  teams,
  availablePokemon,
  onTeamSelect,
  onPokemonAdd,
  selectedTeam
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'pokemon'>('teams');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPokemon = availablePokemon.filter(pokemon =>
    pokemon.name_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pokemon.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      {/* Header avec navigation */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            🎯 GESTIONNAIRE D'ÉQUIPES POKEMON
          </h1>
          
          {/* Navigation tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              👥 MES ÉQUIPES
            </button>
            <button
              onClick={() => setActiveTab('pokemon')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'pokemon'
                  ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              📚 POKÉDEX
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'teams' ? (
          // Vue des équipes
          <div className="space-y-8">
            {teams.length > 0 ? (
              teams.map((team) => (
                <div key={team.id} className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                      <span className="mr-3">🛡️</span>
                      {team.teamName}
                    </h2>
                    <div className="flex items-center space-x-4">
                      <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {team.pokemon.length}/6 Pokémon
                      </span>
                      <button
                        onClick={() => onTeamSelect?.(team)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                      >
                        SÉLECTIONNER
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {team.pokemon.map((pokemon, index) => (
                      <ModernPokemonCard
                        key={`${team.id}-${pokemon.pokemon_id}-${index}`}
                        pokemon={pokemon}
                        variant="compact"
                        isSelected={selectedTeam?.id === team.id}
                      />
                    ))}
                    
                    {/* Slots vides */}
                    {Array.from({ length: 6 - team.pokemon.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="w-48 h-64 border-2 border-dashed border-white border-opacity-30 rounded-2xl flex items-center justify-center bg-white bg-opacity-5 hover:bg-opacity-10 transition-all duration-200 cursor-pointer"
                        onClick={() => setActiveTab('pokemon')}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">➕</div>
                          <div className="text-white text-sm opacity-70">Ajouter un Pokémon</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-white mb-4">Aucune équipe créée</h3>
                <p className="text-white opacity-70 mb-6">Créez votre première équipe pour commencer l'aventure !</p>
                <button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105">
                  ✨ CRÉER UNE ÉQUIPE
                </button>
              </div>
            )}
          </div>
        ) : (
          // Vue du Pokédex
          <div className="space-y-6">
            {/* Barre de recherche */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un Pokémon par nom ou type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white bg-opacity-20 backdrop-blur-sm text-white placeholder-white placeholder-opacity-70 border border-white border-opacity-30 rounded-xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-2xl">🔍</span>
                </div>
              </div>
            </div>

            {/* Grille de Pokémon */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">📚</span>
                Pokémon disponibles ({filteredPokemon.length})
              </h3>
              
              {filteredPokemon.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPokemon.map((pokemon) => (
                    <ModernPokemonCard
                      key={pokemon.pokemon_id}
                      pokemon={pokemon}
                      variant="team"
                      onClick={() => {
                        if (selectedTeam && selectedTeam.pokemon.length < 6) {
                          onPokemonAdd?.(selectedTeam.id, pokemon);
                        }
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-white opacity-70">Aucun Pokémon trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification de sélection d'équipe */}
      {selectedTeam && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold">Équipe sélectionnée</div>
              <div className="text-sm opacity-90">{selectedTeam.teamName}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 