import React, { useEffect, useRef } from 'react';

interface BattleLogProps {
  log: string[];
  maxEntries?: number;
  autoScroll?: boolean;
}

export const BattleLog: React.FC<BattleLogProps> = ({
  log,
  maxEntries = 8,
  autoScroll = true
}) => {
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log, autoScroll]);

  // Limiter le nombre d'entrées affichées
  const displayLog = log.slice(-maxEntries);

  // Formater les messages avec des couleurs et icônes
  const formatLogEntry = (entry: string, index: number): JSX.Element => {
    let className = 'p-2 rounded border-l-4';
    let icon = '📝';

    // Déterminer le style basé sur le contenu
    if (entry.includes('utilise') || entry.includes('attaque')) {
      className += ' border-red-500 bg-red-900 bg-opacity-30';
      icon = '⚔️';
    } else if (entry.includes('critique') || entry.includes('super efficace')) {
      className += ' border-yellow-500 bg-yellow-900 bg-opacity-30';
      icon = '💥';
    } else if (entry.includes('manque') || entry.includes('échoue')) {
      className += ' border-gray-500 bg-gray-900 bg-opacity-30';
      icon = '💨';
    } else if (entry.includes('KO') || entry.includes('vaincu')) {
      className += ' border-purple-500 bg-purple-900 bg-opacity-30';
      icon = '💀';
    } else if (entry.includes('météo') || entry.includes('pluie') || entry.includes('soleil')) {
      className += ' border-blue-500 bg-blue-900 bg-opacity-30';
      icon = '🌦️';
    } else {
      className += ' border-gray-400 bg-gray-800 bg-opacity-30';
    }

    return (
      <div key={index} className={`${className} mb-2 animate-fade-in`}>
        <span className="mr-2">{icon}</span>
        <span className="text-white">{entry}</span>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border-4 border-gray-600 rounded-lg p-4 h-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">Journal de Combat</h3>
        <div className="text-sm text-gray-400">
          {log.length} {log.length === 1 ? 'entrée' : 'entrées'}
        </div>
      </div>
      
      <div
        ref={logRef}
        className="h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      >
        {displayLog.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">⚔️</div>
            <div>Le combat va commencer...</div>
          </div>
        ) : (
          <div className="space-y-1">
            {displayLog.map((entry, index) => formatLogEntry(entry, index))}
          </div>
        )}
      </div>
    </div>
  );
}; 