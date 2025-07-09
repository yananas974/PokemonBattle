import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { getUserFromSession } from '~/sessions';
import { teamService } from '~/services/teamService';
import { pokemonService } from '~/services/pokemonService';
import { ModernTeamBuilder } from '~/components/ModernTeamBuilder';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Gestionnaire d\'Équipes Pokemon - Version Moderne' },
    { name: 'description', content: 'Interface moderne pour gérer vos équipes Pokemon' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  try {
    // Récupérer les données en parallèle
    const [teamsData, pokemonData] = await Promise.all([
      teamService.getMyTeams(user.backendToken).catch(() => ({ teams: [] })),
      pokemonService.getAllPokemon(user.backendToken).catch(() => ({ success: false, pokemon: [] }))
    ]);

    return json({
      user,
      teams: teamsData.teams || [],
      availablePokemon: pokemonData.pokemon || []
    });
  } catch (error) {
    console.error('Erreur lors du chargement des équipes:', error);
    
    return json({
      user,
      teams: [],
      availablePokemon: []
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { user } = await getUserFromSession(request);
  
  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent');

  try {
    switch (intent) {
      case 'createTeam': {
        const teamName = formData.get('teamName') as string;
        if (!teamName) {
          return json({ error: 'Nom d\'équipe requis' }, { status: 400 });
        }
        
        await teamService.createTeam({ teamName }, user.backendToken);
        return json({ success: true });
      }

      case 'addPokemon': {
        const teamId = parseInt(formData.get('teamId') as string);
        const pokemonId = parseInt(formData.get('pokemonId') as string);
        
        if (!teamId || !pokemonId) {
          return json({ error: 'Team ID et Pokemon ID requis' }, { status: 400 });
        }

        // Logique pour ajouter un Pokemon à l'équipe
        // (à implémenter selon votre API backend)
        return json({ success: true });
      }

      default:
        return json({ error: 'Action invalide' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur dans l\'action:', error);
    return json({ error: 'Erreur serveur' }, { status: 500 });
  }
};

type ActionResponse = {
  success?: boolean;
  error?: string;
};

export default function ModernTeamsPage() {
  const { user, teams, availablePokemon } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionResponse>();
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  const handleTeamSelect = (team: any) => {
    setSelectedTeam(team);
  };

  const handlePokemonAdd = (teamId: number, pokemon: any) => {
    const formData = new FormData();
    formData.append('intent', 'addPokemon');
    formData.append('teamId', teamId.toString());
    formData.append('pokemonId', pokemon.pokemon_id.toString());
    
    fetcher.submit(formData, { method: 'POST' });
  };

  // Transformer les données pour correspondre au format attendu par le composant
  const transformedTeams = teams.map((team: any) => ({
    id: team.id,
    teamName: team.teamName || team.name,
    pokemon: team.pokemon || []
  }));

  const transformedPokemon = availablePokemon.map((pokemon: any) => ({
    pokemon_id: pokemon.id,
    name_fr: pokemon.nameFr,
    type: pokemon.type,
    level: 50, // Niveau par défaut
    hp: pokemon.base_hp,
    attack: pokemon.base_attack,
    defense: pokemon.base_defense,
    speed: pokemon.base_speed,
    sprite_url: pokemon.sprite_url
  }));

  return (
    <div className="min-h-screen">
      <ModernTeamBuilder
        teams={transformedTeams}
        availablePokemon={transformedPokemon}
        onTeamSelect={handleTeamSelect}
        onPokemonAdd={handlePokemonAdd}
        selectedTeam={selectedTeam}
      />
      
      {/* Notification de succès */}
      {fetcher.data?.success && (
        <div className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span>Action réussie !</span>
          </div>
        </div>
      )}
      
      {/* Notification d'erreur */}
      {fetcher.data?.error && (
        <div className="fixed bottom-6 left-6 bg-red-500 text-white p-4 rounded-xl shadow-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-xl">❌</span>
            <span>{fetcher.data.error}</span>
          </div>
        </div>
      )}
    </div>
  );
} 