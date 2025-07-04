import React from 'react';

interface VintageTitleProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  animated?: boolean;
}

export const VintageTitle: React.FC<VintageTitleProps> = React.memo(({
  children,
  level = 2,
  className = '',
  animated = false
}) => {
  const baseClasses = 'font-pokemon text-pokemon-blue-dark uppercase tracking-wide';
  
  const sizeClasses = {
    1: 'text-2xl mb-6',
    2: 'text-lg mb-4', 
    3: 'text-base mb-3',
    4: 'text-sm mb-2'
  };

  const animationClass = animated ? 'animate-pokemon-blink' : '';
  
  const titleClasses = `${baseClasses} ${sizeClasses[level]} ${animationClass} ${className}`;

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={titleClasses}>
      {children}
    </Tag>
  );
});

VintageTitle.displayName = 'VintageTitle';

