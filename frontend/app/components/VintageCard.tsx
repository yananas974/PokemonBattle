import React from 'react';

interface VintageCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlighted' | 'compact';
}

export const VintageCard: React.FC<VintageCardProps> = React.memo(({ 
  children, 
  className = '', 
  padding = 'md',
  variant = 'default'
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: 'pokemon-card-vintage',
    highlighted: 'pokemon-card-vintage animate-pokemon-blink',
    compact: 'pokemon-card-vintage border-2'
  };

  return (
    <div className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
});

VintageCard.displayName = 'VintageCard';

