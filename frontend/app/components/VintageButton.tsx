import React from 'react';
import { Link } from '@remix-run/react';
import { cn } from '~/utils/cn';

interface VintageButtonProps {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'green' | 'yellow' | 'gray' | 'pokemon' | 'fire' | 'water' | 'grass' | 'electric' | 'modern';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const VintageButton: React.FC<VintageButtonProps> = React.memo(({
  children,
  variant = 'blue',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false
}) => {
  const variantClasses = {
    // Legacy vintage styles
    blue: 'pokemon-button-vintage bg-pokemon-blue hover:bg-pokemon-blue-dark text-white',
    red: 'pokemon-button-vintage bg-pokemon-red hover:bg-red-600 text-white',
    green: 'pokemon-button-vintage bg-pokemon-green hover:bg-green-600 text-white',
    yellow: 'pokemon-button-vintage bg-pokemon-yellow hover:bg-yellow-500 text-pokemon-blue-dark',
    gray: 'pokemon-button-vintage bg-pokemon-gray hover:bg-gray-500 text-pokemon-blue-dark',
    
    // Modern Pokemon-themed variants
    pokemon: 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl',
    fire: 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl',
    water: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl',
    grass: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl',
    electric: 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-lg hover:shadow-xl',
    modern: 'bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 text-white shadow-lg hover:shadow-xl'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs rounded-lg',
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2 text-base rounded-xl',
    lg: 'px-6 py-3 text-lg rounded-xl',
    xl: 'px-8 py-4 text-xl rounded-2xl'
  };

  const baseClasses = cn(
    'font-semibold transition-all duration-200 transform inline-flex items-center justify-center',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95',
    className
  );

  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
    >
      {content}
    </button>
  );
});

VintageButton.displayName = 'VintageButton';
