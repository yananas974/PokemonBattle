import React from 'react';
import { VintageCard } from './VintageCard';

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  animated?: boolean;
  variant?: 'default' | 'highlighted' | 'compact';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  icon,
  value,
  label,
  animated = false,
  variant = 'default',
  className = ''
}) => {
  const isCompact = variant === 'compact';
  
  return (
    <VintageCard 
      padding={isCompact ? 'sm' : 'md'} 
      variant={variant === 'compact' ? 'compact' : variant}
      className={`text-center ${isCompact ? 'inline-block min-w-24' : ''} ${className}`}
    >
      <div className={`${isCompact ? 'text-lg' : 'text-3xl'} mb-2 text-pokemon-yellow ${animated ? 'animate-pokemon-blink' : ''}`}>
        {icon}
      </div>
      <div className={`font-pokemon ${isCompact ? 'text-sm' : 'text-lg'} text-pokemon-blue-dark`}>
        {value}
      </div>
      <div className={`font-pokemon ${isCompact ? 'text-xs' : 'text-xs'} text-pokemon-blue uppercase`}>
        {label}
      </div>
    </VintageCard>
  );
});

StatCard.displayName = 'StatCard';
