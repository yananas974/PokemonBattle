import { useLoaderData, useActionData, useNavigation, useSubmit } from '@remix-run/react';
import { useState, useEffect } from 'react';
import type { MetaFunction } from '@remix-run/react';

// Import des fonctions serveur depuis le fichier .server.ts
export { loader, action } from './dashboard.battle.interactive.server';

// Client-side imports
import { ModernCard } from '~/components/ui/ModernCard';
import { ModernButton } from '~/components/ui/ModernButton';
import { StatusIndicator } from '~/components/StatusIndicator';
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

// Import des types shared
import type { 
  PokemonMove
} from '@pokemon-battle/shared';

// Composant pour la barre de HP moderne
const PokemonHealthBar = ({ 
  currentHp, 
  maxHp, 
  name, 
  level, 
  position = 'enemy' 
}: { 
  currentHp: number; 
  maxHp: number; 
  name: string; 
  level: number; 
  position?: 'player' | 'enemy' 
}) => {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  
  const getHpColor = (pct: number) => {
    if (pct > 50) return 'bg-green-500';
    if (pct > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn(
      "bg-white/90 backdrop-blur-sm rounded-lg p-3 min-w-[200px]",
      position === 'player' ? 'ml-auto' : 'mr-auto'
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-gray-800 text-sm">{name}</span>
        <span className="text-xs text-gray-600">Niv. {level}</span>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", getHpColor(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-600 mt-1 text-center">
        {currentHp} / {maxHp} HP
      </div>
    </div>
  );
};

// Terrain de combat
const BattleField = ({ 
  playerPokemon, 
  enemyPokemon, 
  battleAnimations 
}: {
  playerPokemon: any;
  enemyPokemon: any;
  battleAnimations: any;
}) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-300 via-green-200 to-green-400 rounded-lg overflow-hidden">
      {/* Arrière-plan de terrain */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-green-100 to-green-300" />
      
      {/* Ligne de terrain */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-600 to-green-400" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-green-800" />
      
      {/* Pokémon ennemi (arrière-plan, plus petit) */}
      {enemyPokemon && (
        <div className="absolute top-8 right-16">
          <div className="flex flex-col items-center space-y-2">
            <PokemonHealthBar 
              currentHp={enemyPokemon.currentHp || 0}
              maxHp={enemyPokemon.maxHp || 1}
              name={enemyPokemon.name_fr || 'Pokémon Ennemi'}
              level={enemyPokemon.level || 1}
              position="enemy"
            />
            <div className="relative">
              <img 
                src={enemyPokemon.sprite_url || '/placeholder-pokemon.png'} 
                alt={enemyPokemon.name_fr || 'Pokémon ennemi'}
                className={cn(
                  "w-24 h-24 object-contain drop-shadow-lg transition-all duration-300",
                  battleAnimations.enemyAttack && "animate-pulse scale-110",
                  battleAnimations.enemyHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Ombre du Pokémon ennemi */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Pokémon joueur (premier plan, plus grand) */}
      {playerPokemon && (
        <div className="absolute bottom-8 left-16">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <img 
                src={
                  playerPokemon.sprite_url
                    ? playerPokemon.sprite_url.replace('/pokemon/', '/pokemon/back/')
                    : '/placeholder-pokemon.png'
                } 
                alt={playerPokemon.name_fr || 'Votre Pokémon'}
                className={cn(
                  "w-32 h-32 object-contain drop-shadow-xl transition-all duration-300",
                  battleAnimations.playerAttack && "animate-pulse scale-110",
                  battleAnimations.playerHit && "animate-bounce"
                )}
                style={{ imageRendering: 'pixelated' }}
              />
              {/* Ombre du Pokémon joueur */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-black/30 rounded-full blur-sm" />
            </div>
            <PokemonHealthBar 
              currentHp={playerPokemon.currentHp || 0}
              maxHp={playerPokemon.maxHp || 1}
              name={playerPokemon.name_fr || 'Votre Pokémon'}
              level={playerPokemon.level || 1}
              position="player"
            />
          </div>
        </div>
      )}

      {/* Effets de combat */}
      {(battleAnimations.playerAttack || battleAnimations.enemyAttack) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-ping">💥</div>
        </div>
      )}
    </div>
  );
};

// Composant pour les actions de combat
const BattleActions = ({ 
  currentBattle, 
  showMoveSelector, 
  setShowMoveSelector, 
  handleAction, 
  handleForfeit, 
  isLoading 
}: {
  currentBattle: any;
  showMoveSelector: boolean;
  setShowMoveSelector: (show: boolean) => void;
  handleAction: (action: any) => void;
  handleForfeit: () => void;
  isLoading: boolean;
}) => {
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'normal': 'bg-gray-400',
      'fire': 'bg-red-500',
      'water': 'bg-blue-500',
      'electric': 'bg-yellow-400',
      'grass': 'bg-green-500',
      'ice': 'bg-cyan-300',
      'fighting': 'bg-red-700',
      'poison': 'bg-purple-500',
      'ground': 'bg-yellow-600',
      'flying': 'bg-indigo-400',
      'psychic': 'bg-pink-500',
      'bug': 'bg-green-400',
      'rock': 'bg-yellow-800',
      'ghost': 'bg-purple-700',
      'dragon': 'bg-indigo-700',
      'dark': 'bg-gray-800',
      'steel': 'bg-gray-500',
      'fairy': 'bg-pink-300'
    };
    return colors[type] || 'bg-gray-400';
  };

  if (currentBattle.currentTurn !== 'player' || isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600 font-medium">
          {isLoading ? 'Combat en cours...' : 'En attente du tour ennemi...'}
        </p>
      </div>
    );
  }

  if (showMoveSelector) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
        <div className="text-lg font-bold text-gray-800 mb-4">Choisissez une attaque :</div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(currentBattle.playerPokemon?.moves || []).map((move: PokemonMove, index: number) => (
            <button
              key={move.name || index}
              onClick={() => handleAction({ type: 'attack', moveId: index, moveName: move.name })}
              disabled={isLoading}
              className={cn(
                "p-3 rounded-lg text-white font-bold text-left transition-all duration-200",
                "hover:scale-105 active:scale-95 disabled:opacity-50",
                getTypeColor(move.type)
              )}
            >
              <div className="font-bold text-sm uppercase">{move.name}</div>
              <div className="text-xs opacity-90">
                {move.power ? `Puissance: ${move.power}` : 'Statut'}
              </div>
              <div className="text-xs opacity-75">PP: {move.pp}</div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowMoveSelector(false)}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          ← Retour
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowMoveSelector(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105"
        >
          ⚔️ ATTAQUE
        </button>
        <button
          onClick={handleForfeit}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all duration-200 hover:scale-105"
        >
          🏃‍♂️ FUIR
        </button>
      </div>
    </div>
  );
};

export default function InteractiveBattlePage() {
  console.log('🎮 COMBAT INTERACTIF CHARGÉ');
  
  const loaderData = useLoaderData<any>();
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { playBattle } = useGlobalAudio();

  const [currentBattle, setCurrentBattle] = useState<any>(loaderData.battle);
  const [showMoveSelector, setShowMoveSelector] = useState(false);
  const [isHackModalVisible, setIsHackModalVisible] = useState(false);
  const [battleAnimations, setBattleAnimations] = useState({
    playerAttack: false,
    enemyAttack: false,
    playerHit: false,
    enemyHit: false
  });

  useEffect(() => {
    playBattle();
  }, [playBattle]);

  useEffect(() => {
    if (currentBattle?.isHackActive && currentBattle.hackChallenge && !isHackModalVisible) {
      setIsHackModalVisible(true);
    }
  }, [currentBattle?.isHackActive, currentBattle?.hackChallenge, isHackModalVisible]);

  useEffect(() => {
    const battleData = actionData?.data?.battle || actionData?.battle;
    
    if (actionData?.success && battleData) {
      setCurrentBattle(battleData);
      setShowMoveSelector(false);
      
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

  const handleAction = async (action: any) => {
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

  const handleForfeit = async () => {
    if (!currentBattle) return;
    if (!confirm('Voulez-vous vraiment abandonner le combat ?')) return;

    const formData = new FormData();
    formData.append('intent', 'forfeit');
    formData.append('battleId', currentBattle.battleId);

    submit(formData, { method: 'post' });
  };

  const handleHackSubmit = async (answer: string) => {
    if (!currentBattle || !currentBattle.hackChallenge) return;

    try {
      console.log('🧩 Soumission du hack challenge:', { battleId: currentBattle.battleId, answer });
      
      const formData = new FormData();
      formData.append('intent', 'hack');
      formData.append('battleId', currentBattle.battleId);
      formData.append('answer', answer);

      submit(formData, { method: 'post' });
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission du hack:', error);
      alert('Erreur lors de la soumission du hack');
    }
  };

  console.log('🎮 État du combat:', currentBattle);
  
  if (!currentBattle || loaderData.forceErrorDisplay) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
        <ModernCard className="text-center max-w-md">
          <div className="space-y-6">
            <div className="text-8xl">💀</div>
            <h1 className="text-4xl font-bold text-red-400">ERREUR DE COMBAT</h1>
            <StatusIndicator
              status="error"
              showLabel={true}
              label={loaderData.error || 'Une erreur est survenue'}
            />
            
            <div className="text-left bg-black/50 p-4 rounded text-xs text-white max-h-64 overflow-y-auto">
              <p><strong>Mode:</strong> {loaderData.mode}</p>
              <p><strong>Error:</strong> {loaderData.error}</p>
              <p><strong>Battle data:</strong> {currentBattle ? 'Présent' : 'Absent'}</p>
              <p><strong>User:</strong> {loaderData.user?.username || 'Non défini'}</p>
              
              {loaderData.debugInfo && (
                <div className="mt-4 border-t border-gray-600 pt-2">
                  <p><strong>Debug Info:</strong></p>
                  <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(loaderData.debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <ModernButton href="/dashboard/battle" variant="primary" size="lg">
              ← Retour au Hub de Combat
            </ModernButton>
          </div>
        </ModernCard>
      </div>
    );
  }

  const isLoading = navigation.state === 'submitting';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-green-400 to-yellow-300 p-4">
      <PokemonAudioPlayer />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header de combat */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">⚔️</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">COMBAT POKÉMON</h1>
                <p className="text-gray-600">Tour {currentBattle.turnCount || 1}</p>
              </div>
            </div>
            
            <div className={cn(
              "px-4 py-2 rounded-full font-bold text-white",
              currentBattle.currentTurn === 'player' ? "bg-green-500" : "bg-red-500"
            )}>
              {currentBattle.currentTurn === 'player' ? '🟢 VOTRE TOUR' : '🔴 TOUR ENNEMI'}
            </div>
          </div>
        </div>

        {/* Terrain de combat */}
        <BattleField 
          playerPokemon={currentBattle.playerPokemon}
          enemyPokemon={currentBattle.enemyPokemon}
          battleAnimations={battleAnimations}
        />

        {/* Interface de combat */}
        {currentBattle.isFinished ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center">
            <div className="text-8xl mb-4">
              {currentBattle.winner === 'player' ? '🏆' : '💀'}
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              {currentBattle.winner === 'player' ? 'VICTOIRE !' : 'DÉFAITE'}
            </h2>
            <div className="flex justify-center space-x-4">
              <ModernButton href="/dashboard/battle" variant="primary" size="lg">
                🏠 Retour au Hub
              </ModernButton>
              <ModernButton href="/dashboard/teams" variant="secondary" size="lg">
                👥 Mes Équipes
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Journal de combat */}
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📜 Journal de Combat</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(currentBattle.battleLog || []).slice(-8).map((entry: any, index: number) => (
                  <div key={index} className="bg-gray-100 rounded p-2 text-sm text-gray-700">
                    {typeof entry === 'string' ? entry : entry.description || 'Action de combat'}
                  </div>
                ))}
                {(!currentBattle.battleLog || currentBattle.battleLog.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">⚔️</div>
                    <p>Le combat commence...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions de combat */}
            <BattleActions 
              currentBattle={currentBattle}
              showMoveSelector={showMoveSelector}
              setShowMoveSelector={setShowMoveSelector}
              handleAction={handleAction}
              handleForfeit={handleForfeit}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Erreurs */}
        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <StatusIndicator status="error" showLabel={true} label={actionData.error} />
          </div>
        )}

        {/* Modal de hack */}
        <HackChallengeModal
          currentBattle={currentBattle}
          isVisible={isHackModalVisible}
          onClose={() => setIsHackModalVisible(false)}
          onSubmit={handleHackSubmit}
        />
      </div>
    </div>
  );
} 