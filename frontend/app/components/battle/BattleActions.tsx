import React from 'react';
import { cn } from '~/utils/cn';
import { getTypeColor } from '~/utils/pokemonTypes';
import type { PokemonMove } from '@pokemon-battle/shared';

interface BattleActionsProps {
  currentBattle: any;
  showMoveSelector: boolean;
  onShowMoveSelector: (show: boolean) => void;
  handleAction: (action: any) => void;
  handleForfeit: () => void;
  isLoading: boolean;
}

export const BattleActions = React.memo(({ 
  currentBattle, 
  showMoveSelector, 
  onShowMoveSelector, 
  handleAction, 
  handleForfeit, 
  isLoading 
}: BattleActionsProps) => {

  if (currentBattle.currentTurn !== 'player' || isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 text-center">
        <div className="text-4xl mb-4">🤖</div>
        <p className="text-gray-600 font-medium">
          {isLoading ? 'Combat en cours...' : 'L\'ennemi réfléchit à son attaque...'}
        </p>
        <div className="mt-4">
          <div className="animate-pulse bg-gray-300 h-2 rounded-full"></div>
        </div>
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
          onClick={() => onShowMoveSelector(false)}
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
          onClick={() => onShowMoveSelector(true)}
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
});

export default BattleActions;