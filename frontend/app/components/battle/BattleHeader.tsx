import { cn } from '~/utils/cn';

interface BattleHeaderProps {
  currentBattle: any;
}

export const BattleHeader = ({ currentBattle }: BattleHeaderProps) => {
  return (
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
  );
};