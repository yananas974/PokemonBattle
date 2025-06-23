import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  color?: string;
  showNumbers?: boolean;
  animated?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  current,
  max,
  color,
  showNumbers = true,
  animated = true
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  // Déterminer automatiquement la couleur si non fournie
  const barColor = color || (
    percentage > 50 ? 'bg-green-500' :
    percentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
  );

  return (
    <div className="w-full">
      {/* Barre de HP */}
      <div className="bg-gray-700 rounded-full h-4 overflow-hidden border-2 border-gray-600">
        <div
          className={`h-full ${barColor} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {/* Effet de brillance */}
          <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
      
      {/* Affichage des nombres */}
      {showNumbers && (
        <div className="flex justify-between text-sm mt-1">
          <span className="text-white font-mono">
            HP: {Math.max(0, current)}/{max}
          </span>
          <span className={`font-mono ${percentage <= 25 ? 'text-red-400 animate-pulse' : 'text-gray-300'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}; 