import React from 'react';
import { cn } from '~/utils/cn';

interface VintageCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'highlighted' | 'compact' | 'modern' | 'glass';
  hover?: boolean;
  onClick?: () => void;
}

export const VintageCard: React.FC<VintageCardProps> = React.memo(({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default',
  hover = false,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const variantClasses = {
    // Legacy vintage styles for backward compatibility
    default: 'pokemon-card-vintage',
    highlighted: 'pokemon-card-vintage animate-pokemon-blink',
    compact: 'pokemon-card-vintage border-2',
    
    // Modern glassmorphism styles
    modern: 'bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl shadow-xl',
    glass: 'bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-3xl shadow-2xl'
  };

  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-2xl cursor-pointer transition-all duration-300' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        clickClasses,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

VintageCard.displayName = 'VintageCard';

