import React, { useState, useEffect, useCallback } from 'react';
import type { BattleState, BattleAction } from '~/types/battle';
import { PokemonSprite } from './PokemonSprite';
import { HealthBar } from './HealthBar';
import { MoveSelector } from './MoveSelector';
import { BattleLog } from './BattleLog';
import { WeatherEffect } from './WeatherEffect';

interface InteractiveBattleProps {
  initialBattle: BattleState;
  onAction: (action: BattleAction) => Promise<void>;
  onForfeit: () => Promise<void>;
  isLoading?: boolean;
}

export const InteractiveBattle: React.FC<InteractiveBattleProps> = ({
  initialBattle,
  onAction,
  onForfeit,
  isLoading = false
}) => {
  const [battle, setBattle] = useState<BattleState>(initialBattle);
  const [showMoveSelector, setShowMoveSelector] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mettre à jour l'état du combat quand les props changent
  useEffect(() => {
    setBattle(initialBattle);
  }, [initialBattle]);

  // Gérer les actions du joueur
  const handlePlayerAction = useCallback(async (action: BattleAction) => {
    if (isLoading || battle.isFinished || battle.currentTurn !== 'player') {
      return;
    }

    setIsAnimating(true);
    setShowMoveSelector(false);
    
    try {
      await onAction(action);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setIsAnimating(false);
    }
  }, [battle, isLoading, onAction]);

  // Calculer le pourcentage de HP
  const getHpPercentage = (current: number, max: number): number => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Déterminer la couleur de la barre de HP
  const getHpColor = (percentage: number): string => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 text-white rounded-lg overflow-hidden shadow-2xl">
      {/* Effet météo */}
      {battle.weather && (
        <WeatherEffect weather={battle.weather} />
      )}

      {/* Zone de combat principal */}
      <div className="relative h-96 bg-gradient-to-b from-blue-400 to-green-400 overflow-hidden">
        {/* Pokémon ennemi */}
        <div className="absolute top-4 right-8">
          <div className="text-center mb-2">
            <div className="bg-white text-black px-3 py-1 rounded-lg inline-block mb-2">
              <div className="font-bold">{battle.enemyPokemon.name_fr}</div>
              <div className="text-sm">Niv. {battle.enemyPokemon.level}</div>
            </div>
            <HealthBar
              current={battle.enemyPokemon.currentHp}
              max={battle.enemyPokemon.maxHp}
              color={getHpColor(getHpPercentage(battle.enemyPokemon.currentHp, battle.enemyPokemon.maxHp))}
              showNumbers={false}
            />
          </div>
          <PokemonSprite
            spriteUrl={battle.enemyPokemon.sprite_url}
            name={battle.enemyPokemon.name_fr}
            isPlayer={false}
            isAnimating={isAnimating && battle.currentTurn === 'enemy'}
            status={battle.enemyPokemon.status}
          />
        </div>

        {/* Pokémon joueur */}
        <div className="absolute bottom-4 left-8">
          <PokemonSprite
            spriteUrl={battle.playerPokemon.sprite_back_url || battle.playerPokemon.sprite_url}
            name={battle.playerPokemon.name_fr}
            isPlayer={true}
            isAnimating={isAnimating && battle.currentTurn === 'player'}
            status={battle.playerPokemon.status}
          />
          <div className="text-center mt-2">
            <div className="bg-white text-black px-3 py-1 rounded-lg inline-block mb-2">
              <div className="font-bold">{battle.playerPokemon.name_fr}</div>
              <div className="text-sm">Niv. {battle.playerPokemon.level}</div>
            </div>
            <HealthBar
              current={battle.playerPokemon.currentHp}
              max={battle.playerPokemon.maxHp}
              color={getHpColor(getHpPercentage(battle.playerPokemon.currentHp, battle.playerPokemon.maxHp))}
              showNumbers={true}
            />
          </div>
        </div>

        {/* Indicateur de tour */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 px-3 py-1 rounded">
          <div className="text-sm">
            Tour {battle.turnCount} - 
            <span className={battle.currentTurn === 'player' ? 'text-green-400' : 'text-red-400'}>
              {battle.currentTurn === 'player' ? ' Votre tour' : ' Tour ennemi'}
            </span>
          </div>
        </div>
      </div>

      {/* Interface de combat */}
      <div className="bg-gray-800 p-4">
        {battle.isFinished ? (
          /* Écran de fin de combat */
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold mb-4">
              {battle.winner === 'player' ? '🎉 Victoire !' : 
               battle.winner === 'enemy' ? '💀 Défaite...' : '🤝 Match nul'}
            </h2>
            <p className="text-lg mb-6">
              {battle.winner === 'player' ? 'Félicitations ! Vous avez gagné ce combat !' :
               battle.winner === 'enemy' ? 'Votre Pokémon a été vaincu...' :
               'Le combat s\'est terminé par un match nul.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Retour au Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Journal de combat */}
            <div className="order-2 lg:order-1">
              <BattleLog 
                log={battle.battleLog} 
                maxEntries={6}
              />
            </div>

            {/* Actions du joueur */}
            <div className="order-1 lg:order-2">
              {battle.currentTurn === 'player' && !isLoading ? (
                showMoveSelector ? (
                  <MoveSelector
                    moves={battle.playerPokemon.moves}
                    onSelectMove={(move) => handlePlayerAction({ type: 'attack', moveId: move.id, moveName: move.name })}
                    onCancel={() => setShowMoveSelector(false)}
                    disabled={isLoading}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowMoveSelector(true)}
                      className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded-lg font-bold text-xl transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      ⚔️ ATTAQUE
                    </button>
                    <button
                      onClick={onForfeit}
                      className="bg-gray-600 hover:bg-gray-700 px-6 py-4 rounded-lg font-bold text-xl transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      🏃‍♂️ FUIR
                    </button>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      <span>Combat en cours...</span>
                    </div>
                  ) : (
                    <div className="text-lg text-gray-400">
                      En attente du tour ennemi...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 