import React from 'react';
import { cn } from '~/utils/cn';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'pokemon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  onClick?: () => void;
}

const variants = {
  default: 'bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20',
  glass: 'bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10',
  gradient: 'bg-gradient-to-br from-white from-opacity-10 to-white to-opacity-5 backdrop-blur-lg',
  pokemon: 'bg-gradient-to-br from-indigo-500 to-purple-600 bg-opacity-20 backdrop-blur-lg border border-white border-opacity-20'
};

const sizes = {
  sm: 'p-4 rounded-xl',
  md: 'p-6 rounded-2xl', 
  lg: 'p-8 rounded-3xl',
  xl: 'p-12 rounded-3xl'
};

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = false,
  onClick
}) => {
  return (
    <div
      className={cn(
        'shadow-xl transition-all duration-300',
        variants[variant],
        sizes[size],
        hover && 'hover:scale-105 hover:shadow-2xl cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 