import React from 'react';
import { ModernPokemonCard } from './ModernPokemonCard';

interface BattlePokemon {
  pokemon_id: number;
  name_fr: string;
  type: string;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  sprite_url: string;
  sprite_back_url?: string;
}

interface BattleInterfaceProps {
  playerPokemon: BattlePokemon;
  enemyPokemon: BattlePokemon;
  battleLog: Array<{
    turn: number;
    attacker: string;
    move: string;
    moveType: string;
    damage: number;
    description: string;
    isCritical: boolean;
  }>;
  onAction?: (action: string) => void;
  isPlayerTurn?: boolean;
  weatherEffect?: {
    name: string;
    description: string;
  };
}

export const ModernBattleInterface: React.FC<BattleInterfaceProps> = ({
  playerPokemon,
  enemyPokemon,
  battleLog,
  onAction,
  isPlayerTurn = true,
  weatherEffect
}) => {
  const playerHpPercent = (playerPokemon.currentHp / playerPokemon.maxHp) * 100;
  const enemyHpPercent = (enemyPokemon.currentHp / enemyPokemon.maxHp) * 100;

  const getHpBarColor = (percentage: number) => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-green-300 overflow-hidden">
      {/* Background avec motifs */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white rounded-full opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Effet météo */}
      {weatherEffect && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">☁️</span>
              <div>
                <div className="font-bold text-gray-800">{weatherEffect.name}</div>
                <div className="text-xs text-gray-600">{weatherEffect.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terrain de bataille */}
      <div className="relative h-screen flex flex-col">
        {/* Zone Pokemon ennemi */}
        <div className="flex-1 flex items-start justify-end pt-12 pr-12">
          <div className="relative">
            {/* Info bar ennemi */}
            <div className="absolute -top-16 -left-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg min-w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{enemyPokemon.name_fr}</span>
                <span className="text-sm text-gray-600">Nv.{enemyPokemon.level}</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ${getHpBarColor(enemyHpPercent)}`}
                  style={{ width: `${enemyHpPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>HP</span>
                <span>{enemyPokemon.currentHp}/{enemyPokemon.maxHp}</span>
              </div>
            </div>

            {/* Sprite ennemi */}
            <div className="relative transform scale-150">
              <div className="absolute inset-0 bg-black opacity-30 rounded-full blur-lg transform translate-y-8"></div>
              <img 
                src={enemyPokemon.sprite_url} 
                alt={enemyPokemon.name_fr}
                className="relative z-10 w-32 h-32 object-contain animate-bounce"
                style={{ 
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                  animationDuration: '2s',
                  animationIterationCount: 'infinite'
                }}
              />
            </div>
          </div>
        </div>

        {/* Zone Pokemon joueur */}
        <div className="flex-1 flex items-end justify-start pb-20 pl-12">
          <div className="relative">
            {/* Info bar joueur */}
            <div className="absolute -top-20 -right-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg min-w-64">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{playerPokemon.name_fr}</span>
                <span className="text-sm text-gray-600">Nv.{playerPokemon.level}</span>
              </div>
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ${getHpBarColor(playerHpPercent)}`}
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>HP</span>
                <span>{playerPokemon.currentHp}/{playerPokemon.maxHp}</span>
              </div>
            </div>

            {/* Sprite joueur */}
            <div className="relative transform scale-150">
              <div className="absolute inset-0 bg-black opacity-30 rounded-full blur-lg transform translate-y-8"></div>
              <img 
                src={playerPokemon.sprite_back_url || playerPokemon.sprite_url} 
                alt={playerPokemon.name_fr}
                className="relative z-10 w-32 h-32 object-contain"
                style={{ 
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interface de contrôle */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-800 to-transparent p-6">
        <div className="max-w-4xl mx-auto">
          {/* Journal de combat */}
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-4 mb-4 max-h-40 overflow-y-auto">
            <div className="space-y-2">
              {battleLog.slice(-3).map((log, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold text-blue-600">{log.attacker}</span>
                  <span className="text-gray-700"> utilise </span>
                  <span className="font-semibold text-purple-600">{log.move}</span>
                  {log.isCritical && <span className="text-red-500 font-bold"> - CRITIQUE!</span>}
                  <div className="text-xs text-gray-600">{log.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions de combat */}
          {isPlayerTurn && (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onAction?.('attack')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">⚔️</span>
                  <span>ATTAQUER</span>
                </div>
              </button>
              
              <button 
                onClick={() => onAction?.('flee')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">🏃</span>
                  <span>FUIR</span>
                </div>
              </button>
            </div>
          )}

          {/* Tour de l'ennemi */}
          {!isPlayerTurn && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg inline-block">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Tour de l'adversaire...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Effets de particules */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>


    </div>
  );
}; 