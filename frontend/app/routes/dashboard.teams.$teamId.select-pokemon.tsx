import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { pokemonService, teamService } from '~/services/pokemonService';
import { teamService as backendTeamService } from '~/services/teamService';
import { 
  VintageCard, 
  VintageTitle, 
  VintageButton,
  StatusIndicator
} from '~/components';
import type { Pokemon } from '~/types/pokemon';
import { useState } from 'react';

// Types pour les données
interface LoaderData {
  pokemon: Pokemon[];
  team: any;
  teamId: number;
  teamPokemonCount: number;
  maxPokemonPerTeam: number;
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

export const loader = async ({ request, params }: LoaderFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw redirect('/login');
  }
  
  const teamId = params.teamId;
  if (!teamId || isNaN(Number(teamId))) {
    throw new Response('ID d\'équipe invalide', { status: 400 });
  }

  try {
    // Appeler directement notre Resource Route en interne
    console.log('🔄 Loader: Appel direct Resource Route Pokemon...');
    const pokemonUrl = new URL('/api/pokemon', request.url);
    const pokemonRequest = new Request(pokemonUrl, {
      headers: request.headers,
      method: 'GET',
    });
    
    // Importer et appeler directement le loader de notre Resource Route
    const { loader: pokemonLoader } = await import('./api/pokemonAPI/api.pokemon');
    const pokemonResponse = await pokemonLoader({ request: pokemonRequest, params: {}, context: {} });
    
    // Vérifier que la réponse est bien une Response
    if (!(pokemonResponse instanceof Response)) {
      throw new Error('Réponse invalide de la Resource Route Pokemon');
    }
    
    const pokemonData = await pokemonResponse.json();
    
    console.log('✅ Loader: Pokemon récupérés:', pokemonData.pokemon?.length);
    
    // Appeler directement notre Resource Route teams en interne
    console.log('🔄 Loader: Appel direct Resource Route Teams...');
    const teamsUrl = new URL('/api/teams', request.url);
    const teamsRequest = new Request(teamsUrl, {
      headers: request.headers,
      method: 'GET',
    });
    
    // Importer et appeler directement le loader de la Resource Route teams
    const { loader: teamsLoader } = await import('./api/teamAPI/api.teams');
    const teamsResponse = await teamsLoader({ request: teamsRequest, params: {}, context: {} });
    
    // Vérifier que la réponse est bien une Response
    if (!(teamsResponse instanceof Response)) {
      throw new Error('Réponse invalide de la Resource Route Teams');
    }
    
    const teamData = await teamsResponse.json();
    console.log('✅ Loader: Teams récupérées:', teamData.teams?.length);
    
    const team = teamData.teams.find((t: any) => t.id === Number(teamId));
    
    if (!team) {
      throw new Response('Équipe non trouvée', { status: 404 });
    }

    return json<LoaderData>({
      pokemon: pokemonData.pokemon,
      team,
      teamId: Number(teamId),
      teamPokemonCount: team.pokemon ? team.pokemon.length : 0,
      maxPokemonPerTeam: 6
    });
  } catch (error) {
    console.error('Erreur lors du chargement de la sélection:', error);
    throw new Response('Erreur lors du chargement', { status: 500 });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs): Promise<Response> => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    return json<ActionData>({ error: 'Utilisateur non authentifié', success: false });
  }

  const teamId = params.teamId;
  if (!teamId || isNaN(Number(teamId))) {
    return json<ActionData>({ error: 'ID d\'équipe invalide', success: false });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'addPokemon') {
    const pokemonId = parseInt(formData.get('pokemonId') as string);
    
    if (!pokemonId) {
      return json<ActionData>({ error: 'ID Pokémon requis', success: false });
    }

    try {
      const result = await backendTeamService.addPokemonToTeam(
        Number(teamId), 
        pokemonId, 
        user.backendToken || user.token
      );
      
      return json<ActionData>({ 
        success: true, 
        message: 'POKEMON AJOUTE A L\'EQUIPE AVEC SUCCES !',
        pokemon: (result as any).pokemon
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du Pokémon:', error);
      return json<ActionData>({ 
        error: error instanceof Error ? error.message : 'ERREUR LORS DE L\'AJOUT DU POKEMON',
        success: false 
      });
    }
  }

  if (intent === 'removePokemon') {
    const pokemonId = parseInt(formData.get('pokemonId') as string);
    
    if (!pokemonId) {
      return json<ActionData>({ error: 'ID Pokémon requis', success: false });
    }

    try {
      await backendTeamService.removePokemonFromTeam(
        Number(teamId), 
        pokemonId, 
        user.backendToken || user.token
      );
      
      return json<ActionData>({ 
        success: true, 
        message: 'POKEMON RETIRE DE L\'EQUIPE AVEC SUCCES !',
      });
    } catch (error) {
      console.error('Erreur lors du retrait du Pokémon:', error);
      return json<ActionData>({ 
        error: error instanceof Error ? error.message : 'ERREUR LORS DU RETRAIT DU POKEMON',
        success: false 
      });
    }
  }

  return json<ActionData>({ error: 'Action non reconnue', success: false });
};

export default function SelectPokemon() {
  const { pokemon, team, teamId, teamPokemonCount, maxPokemonPerTeam } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const submit = useSubmit();
  
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const isLoading = navigation.state === 'submitting';
  
  // Pokémon dans l'équipe (IDs)
  const teamPokemonIds = team.pokemon?.map((p: any) => p.id || p.pokemon_id) || [];
  
  // Filtrage des Pokémon
  const filteredPokemon = pokemon.filter(p => {
    const matchesSearch = !searchFilter || 
      p.name_fr?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.name_en?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Types uniques pour le filtre
  const availableTypes = [...new Set(
    pokemon.map(p => p.type)
  )].sort();

  const handleAddPokemon = (pokemonId: number) => {
    if (teamPokemonCount >= maxPokemonPerTeam) {
      alert('EQUIPE COMPLETE ! MAXIMUM 6 POKEMON PAR EQUIPE.');
      return;
    }
    
    if (teamPokemonIds.includes(pokemonId)) {
      alert('CE POKEMON EST DEJA DANS L\'EQUIPE !');
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'addPokemon');
    formData.append('pokemonId', pokemonId.toString());
    
    submit(formData, { method: 'post' });
  };

  const handleRemovePokemon = (pokemonId: number) => {
    if (!teamPokemonIds.includes(pokemonId)) {
      alert('CE POKEMON N\'EST PAS DANS L\'EQUIPE !');
      return;
    }

    const formData = new FormData();
    formData.append('intent', 'removePokemon');
    formData.append('pokemonId', pokemonId.toString());
    
    submit(formData, { method: 'post' });
  };

  return (
    <div className="min-h-screen pokemon-vintage-bg">
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Navigation de retour */}
        <VintageCard padding="sm">
          <VintageButton 
            href="/dashboard/teams" 
            variant="blue" 
            size="sm"
            className="inline-flex items-center space-x-2"
          >
            <span>👥</span>
            <span>← RETOUR EQUIPES</span>
          </VintageButton>
        </VintageCard>

        {/* Header avec info équipe */}
        <VintageCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <VintageTitle level={1} className="mb-2 flex items-center space-x-2">
                <span>🔧</span>
                <span>MODIFIER EQUIPE</span>
                <span className="animate-pokemon-blink">⚡</span>
              </VintageTitle>
              <VintageTitle level={2} className="text-pokemon-blue">
                {team.name}
              </VintageTitle>
              <p className="font-pokemon text-xs text-pokemon-blue-dark uppercase mt-2">
                {teamPokemonCount}/{maxPokemonPerTeam} POKEMON DANS L'EQUIPE
              </p>
            </div>
            
            {/* Indicateur de slots */}
            <div className="mt-4 md:mt-0">
              <div className="bg-pokemon-blue border-2 border-pokemon-blue-dark rounded p-4">
                <div className="font-pokemon text-xs text-pokemon-cream uppercase mb-2">
                  SLOTS DISPONIBLES
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: maxPokemonPerTeam }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 border-2 border-pokemon-blue-dark rounded ${
                        index < teamPokemonCount 
                          ? 'bg-pokemon-green' 
                          : 'bg-pokemon-gray'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </VintageCard>

        {/* Messages de statut */}
        {actionData?.error && (
          <StatusIndicator
            type="error"
            title="ERREUR OPERATION"
            message={actionData.error}
          />
        )}

        {actionData?.success && actionData?.message && (
          <StatusIndicator
            type="success"
            title="OPERATION REUSSIE"
            message={actionData.message}
          />
        )}

        {/* Équipe actuelle */}
        <VintageCard>
          <VintageTitle level={2} className="mb-4 flex items-center space-x-2">
            <span>👥</span>
            <span>EQUIPE ACTUELLE</span>
          </VintageTitle>
          
          {team.pokemon && team.pokemon.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {team.pokemon.map((poke: any, index: number) => (
                <div
                  key={index}
                  className="pokemon-card-vintage group hover:scale-105 transition-all duration-200"
                >
                  <div className="text-center p-3">
                    <img
                      src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id || poke.pokemon_id}.png`}
                      alt={poke.name_fr || poke.name_en}
                      className="w-16 h-16 object-contain mx-auto mb-2"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="font-pokemon text-xs text-pokemon-blue-dark uppercase mb-2 truncate">
                      {poke.name_fr || poke.name_en}
                    </div>
                    <VintageButton
                      variant="red"
                      size="sm"
                      className="w-full"
                      onClick={() => handleRemovePokemon(poke.id || poke.pokemon_id)}
                      disabled={isLoading}
                    >
                      ❌ RETIRER
                    </VintageButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50 animate-pokemon-blink">👥</div>
              <VintageTitle level={3} className="mb-2">
                EQUIPE VIDE
              </VintageTitle>
              <p className="font-pokemon text-xs text-pokemon-blue uppercase">
                AJOUTEZ DES POKEMON DEPUIS LA LISTE CI-DESSOUS
              </p>
            </div>
          )}
        </VintageCard>

        {/* Filtres */}
        <VintageCard>
          <VintageTitle level={2} className="mb-4 flex items-center space-x-2">
            <span>🔍</span>
            <span>FILTRES POKEMON</span>
          </VintageTitle>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recherche par nom */}
            <div>
              <label className="font-pokemon text-xs text-pokemon-blue-dark uppercase block mb-2">
                RECHERCHER PAR NOM
              </label>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="PIKACHU, DRACAUFEU..."
                className="w-full bg-pokemon-cream border-2 border-pokemon-blue-dark rounded p-2 font-pokemon text-sm text-pokemon-blue-dark placeholder-pokemon-blue focus:border-pokemon-blue focus:outline-none"
              />
            </div>
            
            {/* Filtre par type */}
            <div>
              <label className="font-pokemon text-xs text-pokemon-blue-dark uppercase block mb-2">
                FILTRER PAR TYPE
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full bg-pokemon-cream border-2 border-pokemon-blue-dark rounded p-2 font-pokemon text-sm text-pokemon-blue-dark focus:border-pokemon-blue focus:outline-none"
              >
                <option value="all">TOUS LES TYPES</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </VintageCard>

        {/* Liste des Pokémon disponibles */}
        <VintageCard>
          <VintageTitle level={2} className="mb-4 flex items-center space-x-2">
            <span>📚</span>
            <span>POKEMON DISPONIBLES</span>
            <span className="text-sm font-digital">({filteredPokemon.length})</span>
          </VintageTitle>
          
          {filteredPokemon.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPokemon.map((poke) => {
                const isInTeam = teamPokemonIds.includes(poke.id);
                const canAdd = teamPokemonCount < maxPokemonPerTeam && !isInTeam;
                
                return (
                  <div
                    key={poke.id}
                    className={`pokemon-card-vintage group transition-all duration-200 ${
                      isInTeam ? 'opacity-50' : 'hover:scale-105'
                    }`}
                  >
                    <div className="p-4">
                      <div className="text-center mb-3">
                        <img
                          src={poke.sprite_url || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`}
                          alt={poke.name_fr || poke.name_en}
                          className="w-16 h-16 object-contain mx-auto mb-2"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="font-pokemon text-sm text-pokemon-blue-dark uppercase mb-1">
                          {poke.name_fr || poke.name_en}
                        </div>
                        <div className="font-pokemon text-xs text-pokemon-blue">
                          #{poke.id.toString().padStart(3, '0')}
                        </div>
                      </div>
                      
                      {/* Type */}
                      <div className="flex justify-center mb-3">
                        <span
                          className="bg-pokemon-blue text-pokemon-cream px-2 py-1 rounded border border-pokemon-blue-dark font-pokemon text-xs uppercase"
                        >
                          {poke.type}
                        </span>
                      </div>
                      
                      {/* Boutons d'action */}
                      <div className="space-y-2">
                        {isInTeam ? (
                          <VintageButton
                            variant="red"
                            size="sm"
                            className="w-full"
                            onClick={() => handleRemovePokemon(poke.id)}
                            disabled={isLoading}
                          >
                            ❌ RETIRER
                          </VintageButton>
                        ) : (
                          <VintageButton
                            variant={canAdd ? "green" : "gray"}
                            size="sm"
                            className="w-full"
                            onClick={() => canAdd && handleAddPokemon(poke.id)}
                            disabled={!canAdd || isLoading}
                          >
                            {canAdd ? "➕ AJOUTER" : "❌ EQUIPE PLEINE"}
                          </VintageButton>
                        )}
                        
                        <VintageButton
                          href={`/dashboard/pokemon/${poke.id}`}
                          variant="blue"
                          size="sm"
                          className="w-full"
                        >
                          📊 DETAILS
                        </VintageButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <VintageTitle level={3} className="mb-2">
                AUCUN POKEMON TROUVE
              </VintageTitle>
              <p className="font-pokemon text-xs text-pokemon-blue uppercase">
                MODIFIEZ VOS FILTRES POUR VOIR PLUS DE POKEMON
              </p>
            </div>
          )}
        </VintageCard>

        {/* Actions finales */}
        <VintageCard>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <VintageButton
              href="/dashboard/teams"
              variant="blue"
              size="lg"
              className="flex-1 md:flex-none"
            >
              ✅ TERMINER MODIFICATION
            </VintageButton>
            
            {teamPokemonCount > 0 && (
              <VintageButton
                href="/dashboard/battle"
                variant="green"
                size="lg"
                className="flex-1 md:flex-none"
              >
                ⚔️ ALLER AU COMBAT
              </VintageButton>
            )}
          </div>
        </VintageCard>

      </div>
    </div>
  );
} 