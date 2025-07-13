import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { interactiveBattleService } from '~/services/interactiveBattleService';
import { teamService } from '~/services/teamService';
import { InteractiveBattle } from '~/components/InteractiveBattle';
import type { BattleState, BattleAction } from '~/types/battle';
import { useAudioContext } from '~/contexts/AudioContext';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { getUserFromSession } from '~/sessions.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat Interactif - Pokemon Battle' },
    { name: 'description', content: 'Combattez en temps réel avec vos Pokémon !' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { getUserFromSession } = await import('~/sessions.server');
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    throw redirect('/login');
  }

  const url = new URL(request.url);
  const battleId = url.searchParams.get('battleId');
  const playerTeamId = url.searchParams.get('playerTeamId');
  const enemyTeamId = url.searchParams.get('enemyTeamId');

  const token = typeof user === 'object' && user !== null ? user.backendToken : null;
  
  if (!token) {
    console.error('❌ Token manquant dans la session');
    throw redirect('/login');
  }

  console.log('🔑 Token récupéré pour combat:', token.substring(0, 20) + '...');

  try {
    // Si on a un battleId, récupérer l'état du combat existant
    if (battleId) {
      const battleResponse = await interactiveBattleService.getBattleState(battleId, token);
      
      if (battleResponse.success && battleResponse.battle) {
        return json({
          battle: battleResponse.battle,
          error: null,
          mode: 'existing' as const
        });
      }
    }

    // Sinon, vérifier qu'on a les IDs des équipes pour créer un nouveau combat
    if (!playerTeamId || !enemyTeamId) {
      return json({
        battle: null,
        error: 'IDs des équipes manquants pour créer un nouveau combat',
        mode: 'error' as const
      });
    }

    // Récupérer les équipes pour vérification
    const teamsData = await teamService.getMyTeams(token);
    const playerTeam = teamsData.teams.find(t => t.id === parseInt(playerTeamId));
    
    if (!playerTeam) {
      return json({
        battle: null,
        error: 'Équipe du joueur introuvable',
        mode: 'error' as const
      });
    }

    // Initialiser un nouveau combat
    const initResponse = await interactiveBattleService.initBattle({
      playerTeamId: parseInt(playerTeamId),
      enemyTeamId: parseInt(enemyTeamId)
    }, token);

    if (initResponse.success && initResponse.battle) {
      return json({
        battle: initResponse.battle,
        error: null,
        mode: 'new' as const
      });
    }

    return json({
      battle: null,
      error: initResponse.error || 'Erreur lors de l\'initialisation du combat',
      mode: 'error' as const
    });

  } catch (error) {
    console.error('Erreur loader combat interactif:', error);
    return json({
      battle: null,
      error: error instanceof Error ? error.message : 'Erreur de chargement',
      mode: 'error' as const
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { userId, user } = await getUserFromSession(request);
  
  if (!userId || !user) {
    return json({ error: 'Utilisateur non authentifié', success: false });
  }

  const formData = await request.formData();
  const battleId = formData.get('battleId') as string;
  const moveIndex = formData.get('moveIndex') as string;
  const token = user.backendToken;

  try {
    if (moveIndex) {
      // Attaque
      const response = await interactiveBattleService.executeAction({
        battleId,
        action: { type: 'attack', moveId: parseInt(moveIndex) }
      }, token);
      
      return json(response);
    } else {
      // Abandon
      const response = await interactiveBattleService.forfeitBattle(battleId, token);
      return json(response);
    }
  } catch (error) {
    console.error('Erreur action combat:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de l\'action'
    });
  }
};

export default function InteractiveBattlePage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { playTrack } = useAudioContext();
  const { playBattle } = useGlobalAudio();

  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(loaderData.battle);

  // Mettre à jour l'état du combat après une action
  useEffect(() => {
    if (actionData?.success && 'battle' in actionData && actionData.battle) {
      setCurrentBattle(actionData.battle);
    }
  }, [actionData]);

  // Gérer les actions du joueur
  const handleAction = async (action: BattleAction) => {
    if (!currentBattle) return;

    const formData = new FormData();
    formData.append('battleId', currentBattle.battleId);
    
    if (action.type === 'attack' && action.moveId !== undefined) {
      formData.append('moveIndex', action.moveId.toString());
    } else {
      formData.append('intent', 'forfeit');
    }

    submit(formData, { method: 'post' });
  };

  // Gérer l'abandon
  const handleForfeit = async () => {
    if (!currentBattle) return;

    const formData = new FormData();
    formData.append('intent', 'forfeit');
    formData.append('battleId', currentBattle.battleId);

    submit(formData, { method: 'post' });
  };

  // S'assurer que la musique de combat joue
  useEffect(() => {
    console.log('🎵 Page de combat - s\'assurer que la musique de combat joue');
    playBattle();
  }, [playBattle]);

  // Affichage d'erreur
  if (loaderData.mode === 'error' || !currentBattle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Erreur</h1>
          <p className="text-red-200 mb-6">
            {loaderData.error || 'Impossible de charger le combat'}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold text-white transition-colors"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <InteractiveBattle
          initialBattle={currentBattle}
          onAction={handleAction}
          onForfeit={handleForfeit}
          isLoading={navigation.state === 'submitting'}
        />
        
        {/* Affichage des erreurs d'action */}
        {actionData?.error && (
          <div className="mt-4 bg-red-900 border border-red-700 rounded-lg p-4 text-center">
            <p className="text-red-200">{actionData.error}</p>
          </div>
        )}
      </div>
      
      {/* ✅ Musique de combat */}
      <PokemonAudioPlayer />
    </div>
  );
} 