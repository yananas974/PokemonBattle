import type { LoaderFunctionArgs, ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import { getUserFromSession } from '~/sessions';
import { interactiveBattleService } from '~/services/interactiveBattleService';
import { teamService } from '~/services/teamService';
import type { BattleState, BattleAction } from '~/types/battle';
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { StatusIndicator } from '~/components/StatusIndicator';
import { StatCard } from '~/components/StatCard';
import { PokemonAudioPlayer } from '~/components/PokemonAudioPlayer';
import { HackChallengeModal } from '~/components/HackChallengeModal';
import { useGlobalAudio } from '~/hooks/useGlobalAudio';
import { cn } from '~/utils/cn';

export const meta: MetaFunction = () => {
  return [
    { title: 'Combat Interactif - Pokemon Battle Arena' },
    { name: 'description', content: 'Affrontez vos adversaires dans des combats épiques en temps réel !' },
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
    throw redirect('/login');
  }

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
    
    if (!playerTeam || !enemyTeam) {
      return json({
        user,
        battle: null,
        error: 'Équipe introuvable',
        mode: 'error' as const
      });
    }

    // Initialiser un nouveau combat
    const initResponse = await interactiveBattleService.initBattle({
      playerTeamId: parseInt(playerTeamId),
      enemyTeamId: parseInt(enemyTeamId)
    }, token);

    const battleData = initResponse.data?.battle || initResponse.battle;
    
    if (initResponse.success && battleData) {
      return json({
        user,
        battle: battleData,
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
      const response = await interactiveBattleService.forfeitBattle(battleId, token);
      return json(response);
    } else if (moveIndex) {
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
  const { playBattle } = useGlobalAudio();

  const [currentBattle, setCurrentBattle] = useState<BattleState | null>(loaderData.battle);
  const [showMoveSelector, setShowMoveSelector] = useState(false);
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [isHackModalVisible, setIsHackModalVisible] = useState(false);
  const [battleAnimations, setBattleAnimations] = useState({
    playerAttack: false,
    enemyAttack: false,
    playerHit: false,
    enemyHit: false
  });

  // Auto-start battle music when component mounts
  useEffect(() => {
    playBattle();
  }, [playBattle]);

  // Détecter quand un hack devient actif et afficher le modal
  useEffect(() => {
    if (currentBattle?.isHackActive && currentBattle.hackChallenge && !isHackModalVisible) {
      console.log('🚨 Hack détecté - Ouverture du modal');
      setIsHackModalVisible(true);
    }
  }, [currentBattle?.isHackActive, currentBattle?.hackChallenge, isHackModalVisible]);

  // Mettre à jour l'état du combat après une action
  useEffect(() => {
    const battleData = (actionData as any)?.data?.battle || (actionData as any)?.battle;
    
    if (actionData?.success && battleData) {
      setCurrentBattle(battleData);
      setShowMoveSelector(false);
      setSelectedMove(null);
      
      // Déclencher les animations de combat
      if (battleData.currentTurn !== currentBattle?.currentTurn) {
        setBattleAnimations(prev => ({
          ...prev,
          playerAttack: battleData.currentTurn === 'enemy',
          enemyAttack: battleData.currentTurn === 'player'
        }));
        
        setTimeout(() => {
          setBattleAnimations(prev => ({
            ...prev,
            playerAttack: false,
            enemyAttack: false
          }));
        }, 1000);
      }
    }
  }, [actionData, currentBattle]);

  // Gérer les actions du joueur
  const handleAction = async (action: BattleAction) => {
    if (!currentBattle) return;

    const formData = new FormData();
    formData.append('battleId', currentBattle.battleId);
    
    if (action.type === 'attack' && action.moveId !== undefined) {
      formData.append('moveIndex', action.moveId.toString());
    } else if (action.type === 'flee') {
      formData.append('intent', 'forfeit');
    }

    submit(formData, { method: 'post' });
  };

  // Gérer l'abandon
  const handleForfeit = async () => {
    if (!currentBattle) return;
    if (!confirm('Voulez-vous vraiment abandonner le combat ?')) return;

    const formData = new FormData();
    formData.append('intent', 'forfeit');
    formData.append('battleId', currentBattle.battleId);

    submit(formData, { method: 'post' });
  };

  // Calculer le pourcentage de HP
  const getHpPercentage = (current: number, max: number): number => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Obtenir la couleur de la barre de HP
  const getHpColor = (percentage: number): string => {
    if (percentage > 60) return 'from-green-400 to-green-600';
    if (percentage > 30) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  // Gérer le hack
  const handleHackSubmit = async (answer: string) => {
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
      console.log('🔄 Réponse hack reçue:', result);
      
      // Mettre à jour l'état du combat après le hack
      const updatedBattle = result.battle || result.battleState;
      if (updatedBattle) {
        console.log('🔄 Mise à jour avec nouvel état après hack:', updatedBattle);
        setCurrentBattle(updatedBattle);
        
        // ✅ Fermer le modal SEULEMENT si le hack est vraiment terminé
        if (result.success || result.message.includes('Temps écoulé')) {
          console.log('🎯 Hack terminé - Fermeture du modal');
          setIsHackModalVisible(false);
        } else {
          console.log('⚠️ Mauvaise réponse - Modal reste ouvert pour retry');
          // Modal reste ouvert pour permettre une nouvelle tentative
        }
      }
      
      if (result.success) {
        console.log('✅ Hack réussi:', result.message);
      } else {
        console.log('❌ Hack échoué:', result.message);
      }
      
      alert(result.message);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du hack:', error);
      alert('Erreur lors de la soumission du hack');
    }
  };

  // Affichage d'erreur
  if (loaderData.mode === 'error' || !currentBattle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4">
        {/* Éléments décoratifs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">💥</div>
          <div className="absolute top-32 right-20 text-4xl opacity-30 animate-bounce">⚠️</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-ping">🚨</div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <ModernCard className="text-center">
            <div className="space-y-6">
              <div className="text-8xl mb-6">💀</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                ERREUR DE COMBAT
              </h1>
              <StatusIndicator
                status="error"
                showLabel={true}
                label={loaderData.error || 'Une erreur est survenue'}
              />
              <ModernButton href="/dashboard/battle" variant="primary" size="lg">
                ← Retour au Hub de Combat
              </ModernButton>
            </div>
          </ModernCard>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <PokemonAudioPlayer />
      
      {/* Éléments décoratifs animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">⚔️</div>
        <div className="absolute top-32 right-20 text-4xl opacity-30 animate-bounce">⚡</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-ping">🔥</div>
        <div className="absolute bottom-32 right-32 text-3xl opacity-20 animate-spin">💫</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header de combat moderne */}
        <ModernCard className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">⚔️</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  COMBAT INTERACTIF
                </h1>
                <p className="text-sm text-gray-300 uppercase tracking-wide">
                  Arène de Combat Épique
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                TOUR {currentBattle.turnCount || 1}
              </div>
              <div className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                currentBattle.currentTurn === 'player' 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              )}>
                {currentBattle.currentTurn === 'player' ? '🟢 VOTRE TOUR' : '🔴 TOUR ENNEMI'}
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Effet météo moderne */}
        {currentBattle.weather && currentBattle.weather.name && (
          <ModernCard className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-4xl animate-pulse">🌦️</div>
              <div>
                <div className="text-lg font-bold text-blue-400 uppercase">
                  {currentBattle.weather.name}
                </div>
                <div className="text-sm text-gray-300">
                  {currentBattle.weather.description || 'Effet météorologique actif'}
                </div>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Zone de combat principale */}
        <ModernCard className="relative overflow-hidden min-h-[500px]">
          {/* Arrière-plan de combat dynamique */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-pink-900/30">
            <div className="absolute inset-0 opacity-20 bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          
          <div className="relative z-10 p-8">
            {/* Pokémon ennemi (position haute) */}
            {currentBattle.enemyPokemon && (
              <div className="absolute top-8 right-8">
                <div className="text-center space-y-4">
                  {/* Informations ennemies */}
                  <ModernCard className="p-4 bg-red-500/10 border-red-500/30">
                    <div className="text-center space-y-2">
                      <div className="text-lg font-bold text-red-400 uppercase">
                        {currentBattle.enemyPokemon.name_fr || 'Pokémon Ennemi'}
                      </div>
                      <div className="text-sm text-gray-300">
                        Niveau {currentBattle.enemyPokemon.level || 1}
                      </div>
                      
                      {/* Barre de HP ennemie moderne */}
                      <div className="space-y-1">
                        <div className="w-40 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-700 bg-gradient-to-r",
                              getHpColor(enemyHpPercentage)
                            )}
                            style={{ width: `${enemyHpPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          HP: {Math.round(enemyHpPercentage)}%
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                  
                  {/* Sprite ennemi avec animations */}
                  <div className="flex justify-center">
                    <img 
                      src={currentBattle.enemyPokemon.sprite_url || '/placeholder-pokemon.png'} 
                      alt={currentBattle.enemyPokemon.name_fr || 'Pokémon ennemi'}
                      className={cn(
                        "w-32 h-32 pixelated transition-all duration-300",
                        battleAnimations.enemyAttack && "animate-pulse scale-110",
                        battleAnimations.enemyHit && "animate-bounce",
                        isLoading && currentBattle.currentTurn === 'enemy' && "animate-bounce"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pokémon joueur (position basse) */}
            {currentBattle.playerPokemon && (
              <div className="absolute bottom-4 left-8">
                <div className="text-center space-y-3">
                  {/* Informations joueur AVANT le sprite */}
                  <ModernCard className="p-3 bg-green-500/10 border-green-500/30">
                    <div className="text-center space-y-2">
                      <div className="text-lg font-bold text-green-400 uppercase">
                        {currentBattle.playerPokemon.name_fr || 'Votre Pokémon'}
                      </div>
                      <div className="text-sm text-gray-300">
                        Niveau {currentBattle.playerPokemon.level || 1}
                      </div>
                      
                      {/* Barre de HP joueur moderne */}
                      <div className="space-y-1">
                        <div className="w-40 h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-700 bg-gradient-to-r",
                              getHpColor(playerHpPercentage)
                            )}
                            style={{ width: `${playerHpPercentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400">
                          HP: {currentBattle.playerPokemon.currentHp || 0}/{currentBattle.playerPokemon.maxHp || 0}
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                  
                  {/* Sprite joueur avec animations (sprite BACK) */}
                  <div className="flex justify-center">
                    <img 
                      src={
                        currentBattle.playerPokemon.sprite_url
                          ? currentBattle.playerPokemon.sprite_url.replace('/pokemon/', '/pokemon/back/')
                          : '/placeholder-pokemon.png'
                      } 
                      alt={currentBattle.playerPokemon.name_fr || 'Votre Pokémon'}
                      className={cn(
                        "w-32 h-32 pixelated transition-all duration-300",
                        battleAnimations.playerAttack && "animate-pulse scale-110",
                        battleAnimations.playerHit && "animate-bounce"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Effets visuels de combat */}
            {(battleAnimations.playerAttack || battleAnimations.enemyAttack) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-8xl animate-ping">💥</div>
              </div>
            )}
          </div>
        </ModernCard>

        {/* Interface de combat */}
        {currentBattle.isFinished ? (
          /* Écran de fin de combat moderne */
          <ModernCard className="text-center">
            <div className="space-y-8 py-12">
              <div className="text-9xl animate-bounce">
                {currentBattle.winner === 'player' ? '🏆' : 
                 currentBattle.winner === 'enemy' ? '💀' : '🤝'}
              </div>
              
              <div className="space-y-4">
                <h2 className={cn(
                  "text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  currentBattle.winner === 'player' ? "from-yellow-400 to-orange-400" :
                  currentBattle.winner === 'enemy' ? "from-red-400 to-pink-400" :
                  "from-blue-400 to-purple-400"
                )}>
                  {currentBattle.winner === 'player' ? 'VICTOIRE !' : 
                   currentBattle.winner === 'enemy' ? 'DÉFAITE' : 'MATCH NUL'}
                </h2>
                
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  {currentBattle.winner === 'player' ? 'Félicitations ! Vous avez remporté ce combat épique !' :
                   currentBattle.winner === 'enemy' ? 'Votre Pokémon a été vaincu... Mais ce n\'est qu\'un début !' :
                   'Un combat équilibré qui se termine par un match nul.'}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <ModernButton href="/dashboard/battle" variant="primary" size="lg">
                  🏠 Retour au Hub
                </ModernButton>
                <ModernButton href="/dashboard/teams" variant="secondary" size="lg">
                  👥 Mes Équipes
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Journal de combat moderne */}
            <ModernCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📜</div>
                  <h3 className="text-xl font-bold text-blue-400">Journal de Combat</h3>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                  {(currentBattle.battleLog || []).slice(-10).map((entry, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300">
                        {typeof entry === 'string' ? entry : (entry as any).description || 'Action de combat'}
                      </p>
                    </div>
                  ))}
                  
                  {(!currentBattle.battleLog || currentBattle.battleLog.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">⚔️</div>
                      <p className="text-sm">Le combat commence...</p>
                    </div>
                  )}
                </div>
              </div>
            </ModernCard>

            {/* Actions du joueur modernes */}
            <ModernCard>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎮</div>
                  <h3 className="text-xl font-bold text-purple-400">Actions de Combat</h3>
                </div>
                
                {currentBattle.currentTurn === 'player' && !isLoading ? (
                  showMoveSelector ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-300 font-medium">
                        Choisissez votre attaque :
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(currentBattle.playerPokemon?.moves || []).map((move, index) => (
                          <ModernButton
                            key={move.id || index}
                            variant="secondary"
                            className="h-auto p-4 text-left"
                            onClick={() => {
                              setSelectedMove(move);
                              handleAction({ type: 'attack', moveId: index, moveName: move.name });
                            }}
                            disabled={isLoading}
                          >
                            <div className="space-y-1">
                              <div className="font-bold text-sm uppercase">
                                {move.name || 'Attaque'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {move.power ? `Puissance: ${move.power}` : 'Attaque de statut'}
                              </div>
                            </div>
                          </ModernButton>
                        ))}
                      </div>
                      
                      <ModernButton
                        variant="secondary"
                        onClick={() => setShowMoveSelector(false)}
                        disabled={isLoading}
                      >
                        ↩️ Retour
                      </ModernButton>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ModernButton
                        variant="primary"
                        size="lg"
                        className="w-full h-16"
                        onClick={() => setShowMoveSelector(true)}
                        disabled={isLoading}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-2xl">⚔️</span>
                          <span className="text-xl font-bold">ATTAQUE</span>
                        </div>
                      </ModernButton>
                      
                      <ModernButton
                        variant="secondary"
                        size="lg"
                        className="w-full h-16"
                        onClick={handleForfeit}
                        disabled={isLoading}
                      >
                        <div className="flex items-center justify-center space-x-3">
                          <span className="text-2xl">🏃‍♂️</span>
                          <span className="text-xl font-bold">FUIR</span>
                        </div>
                      </ModernButton>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    {isLoading ? (
                      <div className="space-y-4">
                        <div className="text-6xl animate-spin">⚡</div>
                        <p className="text-lg text-blue-400 font-medium">
                          Combat en cours...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-6xl opacity-50 animate-pulse">⏳</div>
                        <p className="text-lg text-gray-400">
                          En attente du tour ennemi...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ModernCard>
          </div>
        )}

        {/* Statistiques de combat modernes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon="⚔️"
            value={currentBattle.turnCount || 1}
            label="Tours"
            variant="compact"
          />
          <StatCard
            icon="💚"
            value={`${Math.round(playerHpPercentage)}%`}
            label="HP Joueur"
            variant="compact"
          />
          <StatCard
            icon="❤️"
            value={`${Math.round(enemyHpPercentage)}%`}
            label="HP Ennemi"
            variant="compact"
          />
          <StatCard
            icon="🎯"
            value={(currentBattle.playerPokemon?.moves || []).length}
            label="Attaques"
            variant="compact"
          />
        </div>

        {/* Affichage des erreurs d'action */}
        {actionData?.error && (
          <ModernCard>
            <StatusIndicator
              status="error"
              showLabel={true}
              label={actionData?.error || 'Erreur d\'action'}
            />
          </ModernCard>
        )}

        {/* Interface de Hack Challenge moderne - CENTRÉ */}
        <HackChallengeModal
          currentBattle={currentBattle}
          isVisible={isHackModalVisible}
          onClose={() => setIsHackModalVisible(false)}
          onSubmit={handleHackSubmit}
        />
        
        {/* DEBUG - Afficher l'état du hack */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
            <div>isHackActive: {currentBattle.isHackActive ? 'true' : 'false'}</div>
            <div>hackChallenge: {currentBattle.hackChallenge ? 'present' : 'null'}</div>
          </div>
        )}
      </div>

      {/* Styles personnalisés via CSS global ou Tailwind */}
    </div>
  );
} 