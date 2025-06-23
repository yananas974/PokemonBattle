import React from 'react';

interface PokemonSpriteProps {
  spriteUrl: string;
  name: string;
  isPlayer: boolean;
  isAnimating?: boolean;
  status?: 'normal' | 'poisoned' | 'paralyzed' | 'sleeping' | 'frozen' | 'burned';
  size?: 'small' | 'medium' | 'large';
}

export const PokemonSprite: React.FC<PokemonSpriteProps> = ({
  spriteUrl,
  name,
  isPlayer,
  isAnimating = false,
  status = 'normal',
  size = 'large'
}) => {
  // Tailles des sprites
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  // Classes d'animation
  const getAnimationClasses = (): string => {
    const baseClasses = `${sizeClasses[size]} transition-all duration-300`;
    
    if (isAnimating) {
      return `${baseClasses} animate-pulse transform scale-110`;
    }
    
    if (status === 'poisoned') {
      return `${baseClasses} filter hue-rotate-90`;
    }
    
    if (status === 'paralyzed') {
      return `${baseClasses} filter brightness-75`;
    }
    
    if (status === 'sleeping') {
      return `${baseClasses} filter grayscale opacity-75`;
    }
    
    if (status === 'frozen') {
      return `${baseClasses} filter brightness-125 hue-rotate-180`;
    }
    
    if (status === 'burned') {
      return `${baseClasses} filter hue-rotate-15 brightness-110`;
    }
    
    return baseClasses;
  };

  // Indicateur de statut
  const getStatusIndicator = () => {
    const statusConfig = {
      poisoned: { emoji: '🟣', label: 'Empoisonné' },
      paralyzed: { emoji: '⚡', label: 'Paralysé' },
      sleeping: { emoji: '😴', label: 'Endormi' },
      frozen: { emoji: '🧊', label: 'Gelé' },
      burned: { emoji: '🔥', label: 'Brûlé' }
    };

    if (status === 'normal') return null;

    const config = statusConfig[status];
    return (
      <div className="absolute -top-2 -right-2 bg-black bg-opacity-75 rounded-full w-6 h-6 flex items-center justify-center text-xs">
        {config.emoji}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <img
        src={spriteUrl}
        alt={`${name} sprite`}
        className={getAnimationClasses()}
        style={{
          imageRendering: 'pixelated', // Pour conserver l'aspect rétro
          filter: isPlayer ? 'none' : 'none' // Possibilité d'ajouter des filtres différents
        }}
        onError={(e) => {
          // Image de fallback en cas d'erreur
          const target = e.target as HTMLImageElement;
          target.src = '/pokemon-placeholder.png';
        }}
      />
      
      {/* Indicateur de statut */}
      {getStatusIndicator()}
      
      {/* Effet de KO */}
      {status === 'normal' && isAnimating && (
        <div className="absolute inset-0 bg-red-500 opacity-30 animate-ping rounded-full"></div>
      )}
    </div>
  );
}; 