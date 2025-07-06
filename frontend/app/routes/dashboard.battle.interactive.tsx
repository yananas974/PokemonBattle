import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { interactiveBattleService } from '~/services/interactiveBattleService';
import { teamService } from '~/services/teamService';
import type { BattleState, BattleAction } from '~/types/battle';
import { VintageCard } from '~/components/VintageCard';
import { VintageTitle } from '~/components/VintageTitle';
import { VintageButton } from '~/components/VintageButton';
import { StatusIndicator } from '~/components/StatusIndicator';
import { StatCard } from '~/components/StatCard';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat Interactif - Pokemon Battle' },
    { name: 'description', content: 'Combattez en temps réel avec vos Pokémon !' },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
          user,
          battle: battleResponse.battle,
          error: null,
          mode: 'existing' as const
        });
      }
    }

    // Sinon, vérifier qu'on a les IDs des équipes pour créer un nouveau combat
    if (!playerTeamId || !enemyTeamId) {
      return json({
        user,
        battle: null,
        error: 'IDs des équipes manquants pour créer un nouveau combat',
        mode: 'error' as const
      });
    }

    // Récupérer les équipes pour vérification
    const teamsData = await teamService.getMyTeams(token);
    const playerTeam = teamsData.teams.find(t => t.id === parseInt(playerTeamId));
    const enemyTeam = teamsData.teams.find(t => t.id === parseInt(enemyTeamId));
    
    if (!playerTeam) {
      return json({
        user,
        battle: null,
        error: 'Équipe du joueur introuvable',
        mode: 'error' as const
      });
    }

    if (!enemyTeam) {
      return json({
        user,
        battle: null,
        error: 'Équipe ennemie introuvable',
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
        user,
        battle: initResponse.battle,
        error: null,
        mode: 'new' as const,
        playerTeam,
        enemyTeam
      });
    }

    return json({
      user,
      battle: null,
      error: initResponse.error || 'Erreur lors de l\'initialisation du combat',
      mode: 'error' as const
    });

  } catch (error) {
    console.error('Erreur loader combat interactif:', error);
    return json({
      user,
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
  const intent = formData.get('intent') as string;
  const token = user.backendToken;

  try {
    if (intent === 'forfeit') {
      // Abandon
      const response = await interactiveBattleService.forfeitBattle(battleId, token);
      return json(response);
    } else if (moveIndex) {
      // Attaque
      const response = await interactiveBattleService.executeAction({
        battleId,
        action: { type: 'attack', moveId: parseInt(moveIndex) }
      }, token);
      
      return json(response);
    }

    return json({
      success: false,
      error: 'Action non reconnue'
    });
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

  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(loaderData.battle);
  const [showMoveSelector, setShowMoveSelector] = useState(false);
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [hackAnswer, setHackAnswer] = useState('');

  // Mettre à jour l'état du combat après une action
  useEffect(() => {
    if (actionData?.success && 'battle' in actionData && actionData.battle) {
      console.log('🎮 Nouvelle bataille reçue:', actionData.battle);
      setCurrentBattle(actionData.battle);
      setShowMoveSelector(false);
      setSelectedMove(null);
    } else if (actionData?.error) {
      console.error('🎮 Erreur d\'action:', actionData.error);
    }
  }, [actionData]);

  // Gérer les actions du joueur
  const handleAction = async (action: BattleAction) => {
    if (!currentBattle) return;

    console.log('🎮 Action envoyée:', action);
    console.log('🎮 Battle actuelle:', currentBattle);

    const formData = new FormData();
    formData.append('battleId', currentBattle.battleId);
    
    if (action.type === 'attack' && action.moveId !== undefined) {
      console.log('🎮 MoveId envoyé:', action.moveId);
      formData.append('moveIndex', action.moveId.toString());
    } else if (action.type === 'flee') {
      formData.append('intent', 'forfeit');
    }

    submit(formData, { method: 'post' });
  };

  // Gérer l'abandon
  const handleForfeit = async () => {
    if (!currentBattle) return;
    if (!confirm('VOULEZ-VOUS VRAIMENT ABANDONNER LE COMBAT ?')) return;

    const formData = new FormData();
    formData.append('intent', 'forfeit');
    formData.append('battleId', currentBattle.battleId);

    submit(formData, { method: 'post' });
  };

  // Calculer le pourcentage de HP
  const getHpPercentage = (current: number, max: number): number => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Gérer le hack
  const handleHackSubmit = async (answer = hackAnswer) => {
    if (!currentBattle || !currentBattle.hackChallenge) return;

    const token = loaderData.user?.backendToken;

    try {
      const response = await fetch('/api/interactive-battle/solve-hack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          battleId: currentBattle.battleId,
          answer: answer.trim(),
          token
        })
      });

      const result = await response.json();
      
      if (result.battleState) {
        setCurrentBattle(result.battle);
      }
      
      // Afficher le message de résultat
      alert(result.message);
      setHackAnswer('');
      
    } catch (error) {
      console.error('Erreur hack:', error);
      alert('Erreur lors de la soumission du hack');
    }
  };

  // Affichage d'erreur
  if (loaderData.mode === 'error' || !currentBattle) {
    return (
      <div className="space-y-6">
        <VintageCard>
          <VintageTitle level={1}>
            ⚠️ ERREUR DE COMBAT
          </VintageTitle>
          <StatusIndicator
            type="error"
            title="Impossible de charger le combat"
            message={loaderData.error || 'Erreur inconnue'}
            icon="❌"
          />
          <div className="mt-6 text-center">
            <VintageButton href="/dashboard/battle" variant="blue">
              ← RETOUR AU HUB DE COMBAT
            </VintageButton>
          </div>
        </VintageCard>
      </div>
    );
  }

  const isLoading = navigation.state === 'submitting';
  const playerHpPercentage = getHpPercentage(
    currentBattle.playerPokemon?.currentHp || 0, 
    currentBattle.playerPokemon?.maxHp || 1
  );
  const enemyHpPercentage = getHpPercentage(
    currentBattle.enemyPokemon?.currentHp || 0, 
    currentBattle.enemyPokemon?.maxHp || 1
  );

  return (
    <div className="space-y-6">
      {/* Header de combat */}
      <VintageCard variant="highlighted">
        <div className="flex items-center justify-between">
          <VintageTitle level={1} animated>
            ⚔️ COMBAT INTERACTIF
          </VintageTitle>
          <div className="text-center">
            <div className="font-pokemon text-pokemon-yellow text-lg">
              TOUR {currentBattle.turnCount || 1}
            </div>
            <div className="font-pokemon text-xs text-pokemon-blue uppercase">
              {currentBattle.currentTurn === 'player' ? '🟢 VOTRE TOUR' : '🔴 TOUR ENNEMI'}
            </div>
          </div>
        </div>
      </VintageCard>

      {/* Effet météo */}
      {currentBattle.weather && currentBattle.weather.name && (
        <VintageCard padding="sm">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-2xl">🌦️</span>
            <div>
              <div className="font-pokemon text-pokemon-blue-dark text-sm">
                {currentBattle.weather.name.toUpperCase()}
              </div>
              <div className="font-pokemon text-xs text-pokemon-blue">
                {currentBattle.weather.description || 'Effet météorologique'}
              </div>
            </div>
          </div>
        </VintageCard>
      )}

      {/* Zone de combat */}
      <VintageCard className="relative overflow-hidden">
        {/* Arrière-plan de combat */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-green-300 to-green-400 opacity-50"></div>
        
        <div className="relative min-h-96 p-6">
          {/* Pokémon ennemi (en haut à droite) */}
          {currentBattle.enemyPokemon && (
            <div className="absolute top-4 right-8">
              <VintageCard padding="sm" variant="compact" className="mb-2">
                <div className="text-center">
                  <div className="font-pokemon text-pokemon-blue-dark text-sm uppercase">
                    {currentBattle.enemyPokemon.name_fr || 'POKÉMON ENNEMI'}
                  </div>
                  <div className="font-pokemon text-xs text-pokemon-blue">
                    NIVEAU {currentBattle.enemyPokemon.level || 1}
                  </div>
                  
                  {/* Barre de HP ennemie */}
                  <div className="mt-2">
                    <div className="w-32 h-2 bg-pokemon-blue rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          enemyHpPercentage > 50 ? 'bg-green-500' :
                          enemyHpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${enemyHpPercentage}%` }}
                      />
                    </div>
                    <div className="font-pokemon text-xs text-pokemon-blue mt-1">
                      HP: {Math.round(enemyHpPercentage)}%
                    </div>
                  </div>
                </div>
              </VintageCard>
              
              {/* Sprite ennemi (front) */}
              <div className="flex justify-center">
                <img 
                  src={currentBattle.enemyPokemon.sprite_url || '/placeholder-pokemon.png'} 
                  alt={currentBattle.enemyPokemon.name_fr || 'Pokémon ennemi'}
                  className={`w-24 h-24 pixelated ${
                    isLoading && currentBattle.currentTurn === 'enemy' ? 'animate-bounce' : ''
                  }`}
                />
              </div>
            </div>
          )}

          {/* Pokémon joueur (en bas à gauche) */}
          {currentBattle.playerPokemon && (
            <div className="absolute bottom-4 left-8">
              {/* Sprite joueur (back) - PLUS GROS */}
              <div className="flex justify-center mb-2">
                <img 
                  src={
                    currentBattle.playerPokemon.sprite_url
                      ? currentBattle.playerPokemon.sprite_url.replace('pokemon/', 'pokemon/back/')
                      : '/placeholder-pokemon.png'
                  } 
                  alt={currentBattle.playerPokemon.name_fr || 'Votre Pokémon'}
                  className="w-32 h-32 pixelated"
                />
              </div>
              
              <VintageCard padding="sm" variant="compact">
                <div className="text-center">
                  <div className="font-pokemon text-pokemon-blue-dark text-sm uppercase">
                    {currentBattle.playerPokemon.name_fr || 'VOTRE POKÉMON'}
                  </div>
                  <div className="font-pokemon text-xs text-pokemon-blue">
                    NIVEAU {currentBattle.playerPokemon.level || 1}
                  </div>
                  
                  {/* Barre de HP joueur */}
                  <div className="mt-2">
                    <div className="w-32 h-2 bg-pokemon-blue rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          playerHpPercentage > 50 ? 'bg-green-500' :
                          playerHpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${playerHpPercentage}%` }}
                      />
                    </div>
                    <div className="font-pokemon text-xs text-pokemon-blue mt-1">
                      HP: {currentBattle.playerPokemon.currentHp || 0}/{currentBattle.playerPokemon.maxHp || 0}
                    </div>
                  </div>
                </div>
              </VintageCard>
            </div>
          )}
        </div>
      </VintageCard>

      {/* Interface de combat */}
      {currentBattle.isFinished ? (
        /* Écran de fin de combat */
        <VintageCard variant="highlighted">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">
              {currentBattle.winner === 'player' ? '🎉' : 
               currentBattle.winner === 'enemy' ? '💀' : '🤝'}
            </div>
            
            <VintageTitle level={1} animated>
              {currentBattle.winner === 'player' ? 'VICTOIRE !' : 
               currentBattle.winner === 'enemy' ? 'DÉFAITE...' : 'MATCH NUL'}
            </VintageTitle>
            
            <p className="font-pokemon text-pokemon-blue text-sm mt-4 mb-6">
              {currentBattle.winner === 'player' ? 'FÉLICITATIONS ! VOUS AVEZ GAGNÉ CE COMBAT !' :
               currentBattle.winner === 'enemy' ? 'VOTRE POKÉMON A ÉTÉ VAINCU...' :
               'LE COMBAT S\'EST TERMINÉ PAR UN MATCH NUL.'}
            </p>
            
            <div className="space-x-4">
              <VintageButton href="/dashboard/battle" variant="blue">
                🏠 RETOUR AU HUB
              </VintageButton>
              <VintageButton href="/dashboard/teams" variant="green">
                👥 MES ÉQUIPES
              </VintageButton>
            </div>
          </div>
        </VintageCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Journal de combat */}
          <VintageCard>
            <VintageTitle level={2}>
              📜 JOURNAL DE COMBAT
            </VintageTitle>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(currentBattle.battleLog || []).slice(-8).map((entry, index) => (
                <div key={index} className="bg-pokemon-cream p-2 rounded border-l-4 border-pokemon-blue">
                  <p className="font-pokemon text-xs text-pokemon-blue-dark">
                    {typeof entry === 'string' ? entry : (entry as any).description || 'Action de combat'}
                  </p>
                </div>
              ))}
              
              {(!currentBattle.battleLog || currentBattle.battleLog.length === 0) && (
                <div className="text-center py-4 text-pokemon-blue opacity-60">
                  <span className="font-pokemon text-xs">LE COMBAT COMMENCE...</span>
                </div>
              )}
            </div>
          </VintageCard>

          {/* Actions du joueur */}
          <VintageCard>
            <VintageTitle level={2}>
              🎮 ACTIONS
            </VintageTitle>
            
            {currentBattle.currentTurn === 'player' && !isLoading ? (
              showMoveSelector ? (
                <div className="space-y-3">
                  <p className="font-pokemon text-pokemon-blue text-xs">
                    CHOISISSEZ UNE ATTAQUE :
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {(currentBattle.playerPokemon?.moves || []).map((move, index) => (
                      <VintageButton
                        key={move.id || index}
                        variant="yellow"
                        className="w-full text-left justify-start"
                        onClick={() => {
                          setSelectedMove(move);
                          handleAction({ type: 'attack', moveId: index, moveName: move.name });
                        }}
                        disabled={isLoading}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="uppercase">{move.name || 'ATTAQUE'}</span>
                          <span className="text-xs opacity-75">
                            {move.power ? `PWR: ${move.power}` : 'STATUT'}
                          </span>
                        </div>
                      </VintageButton>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <VintageButton
                      variant="gray"
                      onClick={() => setShowMoveSelector(false)}
                      disabled={isLoading}
                    >
                      ↩️ RETOUR
                    </VintageButton>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <VintageButton
                    variant="red"
                    className="w-full py-4"
                    onClick={() => setShowMoveSelector(true)}
                    disabled={isLoading}
                  >
                    <span className="text-xl">⚔️ ATTAQUE</span>
                  </VintageButton>
                  
                  <VintageButton
                    variant="gray"
                    className="w-full py-4"
                    onClick={handleForfeit}
                    disabled={isLoading}
                  >
                    <span className="text-xl">🏃‍♂️ FUIR</span>
                  </VintageButton>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="text-4xl">⚡</div>
                    <p className="font-pokemon text-pokemon-blue text-sm">
                      COMBAT EN COURS...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl opacity-50">⏳</div>
                    <p className="font-pokemon text-pokemon-blue text-sm">
                      EN ATTENTE DU TOUR ENNEMI...
                    </p>
                  </div>
                )}
              </div>
            )}
          </VintageCard>
        </div>
      )}

      {/* Statistiques de combat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon="⚔️"
          value={currentBattle.turnCount || 1}
          label="TOURS"
          variant="compact"
        />
        <StatCard
          icon="💚"
          value={`${Math.round(playerHpPercentage)}%`}
          label="HP JOUEUR"
          variant="compact"
        />
        <StatCard
          icon="❤️"
          value={`${Math.round(enemyHpPercentage)}%`}
          label="HP ENNEMI"
          variant="compact"
        />
        <StatCard
          icon="🎯"
          value={(currentBattle.playerPokemon?.moves || []).length}
          label="ATTAQUES"
          variant="compact"
        />
      </div>

      {/* Affichage des erreurs d'action */}
      {actionData?.error && (
        <VintageCard>
          <StatusIndicator
            type="error"
            title="Erreur d'action"
            message={actionData.error}
            icon="⚠️"
          />
        </VintageCard>
      )}

      {/* ✅ NOUVEAU : Interface de Hack Challenge */}
      {currentBattle.isHackActive && currentBattle.hackChallenge && (
        <VintageCard variant="highlighted" className="border-4 border-red-500">
          <VintageTitle level={2}>
            🚨 ALERTE SÉCURITÉ - DÉFI DE HACK !
          </VintageTitle>
          
          <div className="space-y-4">
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <p className="font-pokemon text-red-700 text-sm font-bold">
                🔒 VOTRE SYSTÈME A ÉTÉ COMPROMIS ! RÉSOLVEZ CE DÉFI IMMÉDIATEMENT :
              </p>
            </div>
            
            <div className="bg-pokemon-cream p-4 rounded border-2 border-pokemon-blue">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <span className="font-pokemon text-pokemon-blue-dark text-sm block">
                    DIFFICULTÉ
                  </span>
                  <span className="font-pokemon text-red-600 text-lg font-bold">
                    {currentBattle.hackChallenge.difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="text-center">
                  <span className="font-pokemon text-pokemon-blue-dark text-sm block">
                    TEMPS RESTANT
                  </span>
                  <span className="font-pokemon text-red-600 text-xl font-bold">
                    ⏰ {currentBattle.hackChallenge.time_limit}s
                  </span>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="font-pokemon text-pokemon-blue text-xs mb-2">
                  CODE CHIFFRÉ :
                </p>
                <div className="bg-black text-green-400 p-3 rounded font-mono text-lg text-center">
                  {currentBattle.hackChallenge.encrypted_code}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="font-pokemon text-pokemon-blue text-xs">
                  INDICE : {currentBattle.hackChallenge.explanation}
                </p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ENTREZ VOTRE RÉPONSE..."
                  className="w-full p-3 border-2 border-pokemon-blue rounded font-pokemon text-pokemon-blue-dark uppercase text-center"
                  value={hackAnswer}
                  onChange={(e) => setHackAnswer(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && hackAnswer.trim()) {
                      handleHackSubmit();
                    }
                  }}
                  disabled={isLoading}
                />
                
                <div className="flex space-x-2">
                  <VintageButton
                    variant="red"
                    className="flex-1"
                    onClick={handleHackSubmit}
                    disabled={!hackAnswer.trim() || isLoading}
                  >
                    🔓 DÉCRYPTER
                  </VintageButton>
                  
                  <VintageButton
                    variant="gray"
                    onClick={() => {
                      // Abandon du hack = pénalité
                      handleHackSubmit('ABANDON');
                    }}
                    disabled={isLoading}
                  >
                    💀 ABANDONNER
                  </VintageButton>
                </div>
              </div>
            </div>
          </div>
        </VintageCard>
      )}
    </div>
  );
} 