import { cn } from '~/utils/cn';

interface PokemonHealthBarProps {
  currentHp: number;
  maxHp: number;
  name: string;
  position?: 'player' | 'enemy';
}

export const PokemonHealthBar = ({ 
  currentHp, 
  maxHp, 
  name, 
  position = 'enemy' 
}: PokemonHealthBarProps) => {
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