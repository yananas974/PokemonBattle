import React from 'react';
import { Link } from '@remix-run/react';

interface VintageButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const VintageButton: React.FC<VintageButtonProps> = React.memo(({
  children,
  onClick,
  variant = 'blue',
  size = 'md',
  href,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = 'pokemon-btn-vintage';
  
  const variantClasses = {
    blue: 'pokemon-btn-blue',
    red: 'pokemon-btn-red',
    yellow: 'pokemon-btn-yellow',
    green: 'pokemon-btn-green',
    gray: 'pokemon-btn-gray'
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-2',
    md: 'text-xs px-4 py-3',
    lg: 'text-sm px-6 py-4'
  };

  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
    ${className}
  `.trim();

  const handleClick = () => {
    if (disabled) {
      return;
    }
    onClick?.();
  };

  // Si href est fourni, utiliser Link de Remix
  if (href && !disabled) {
    return (
      <Link to={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  // Sinon, utiliser un bouton normal
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {children}
    </button>
  );
});

VintageButton.displayName = 'VintageButton';
