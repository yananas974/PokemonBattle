import React from 'react';
import type { PokemonMove } from '~/types/battle';
import { getTypeColor } from '~/utils/pokemonTypes';

interface MoveSelectorProps {
  moves: PokemonMove[];
  onSelectMove: (move: PokemonMove) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const MoveSelector: React.FC<MoveSelectorProps> = ({
  moves,
  onSelectMove,
  onCancel,
  disabled = false
}) => {
  // Assurer qu'on a exactement 4 moves (remplir avec des moves vides si nécessaire)
  const displayMoves = [...moves];
  while (displayMoves.length < 4) {
    displayMoves.push({
      id: -1,
      name: '---',
      type: 'normal',
      power: 0,
      accuracy: 0,
      pp: 0
    });
  }

  return (
    <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white">Choisissez une attaque</h3>
      </div>
      
      {/* Grille 2x2 des attaques */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {displayMoves.slice(0, 4).map((move, index) => (
          <button
            key={index}
            onClick={() => move.id !== -1 && onSelectMove(move)}
            disabled={disabled || move.id === -1}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200
              ${move.id === -1 
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
                : `${getTypeColor(move.type)} border-gray-400 text-white hover:border-white hover:scale-105 active:scale-95`
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="text-center">
              <div className="font-bold text-lg">{move.name}</div>
              {move.id !== -1 && (
                <>
                  <div className="text-sm opacity-75 capitalize">{move.type}</div>
                  <div className="text-xs mt-1">
                    <span className="mr-2">⚡{move.power}</span>
                    <span className="mr-2">🎯{move.accuracy}%</span>
                    <span>PP: {move.pp}</span>
                  </div>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Bouton Annuler */}
      <div className="text-center">
        <button
          onClick={onCancel}
          disabled={disabled}
          className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}; 