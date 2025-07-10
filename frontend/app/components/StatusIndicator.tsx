import React from 'react';
import { cn } from '~/utils/cn';

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading' | 'error' | 'success' | 'warning' | 'battle' | 'fainted' | 'poisoned' | 'burned' | 'frozen' | 'paralyzed' | 'sleeping';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  status,
  size = 'md',
  label,
  showLabel = false,
  animated = true,
  className = ''
}) => {
  const statusConfig = {
    // System statuses
    online: {
      color: 'bg-green-500',
      glow: 'shadow-green-500/50',
      icon: '🟢',
      defaultLabel: 'En ligne',
      animation: 'animate-pulse'
    },
    offline: {
      color: 'bg-gray-500',
      glow: 'shadow-gray-500/50',
      icon: '⚫',
      defaultLabel: 'Hors ligne',
      animation: ''
    },
    loading: {
      color: 'bg-blue-500',
      glow: 'shadow-blue-500/50',
      icon: '🔄',
      defaultLabel: 'Chargement...',
      animation: 'animate-spin'
    },
    error: {
      color: 'bg-red-500',
      glow: 'shadow-red-500/50',
      icon: '❌',
      defaultLabel: 'Erreur',
      animation: 'animate-bounce'
    },
    success: {
      color: 'bg-green-500',
      glow: 'shadow-green-500/50',
      icon: '✅',
      defaultLabel: 'Succès',
      animation: 'animate-pulse'
    },
    warning: {
      color: 'bg-yellow-500',
      glow: 'shadow-yellow-500/50',
      icon: '⚠️',
      defaultLabel: 'Attention',
      animation: 'animate-pulse'
    },
    
    // Pokemon battle statuses
    battle: {
      color: 'bg-red-600',
      glow: 'shadow-red-600/50',
      icon: '⚔️',
      defaultLabel: 'En combat',
      animation: 'animate-pulse'
    },
    fainted: {
      color: 'bg-gray-600',
      glow: 'shadow-gray-600/50',
      icon: '💀',
      defaultLabel: 'K.O.',
      animation: ''
    },
    poisoned: {
      color: 'bg-purple-600',
      glow: 'shadow-purple-600/50',
      icon: '☠️',
      defaultLabel: 'Empoisonné',
      animation: 'animate-pulse'
    },
    burned: {
      color: 'bg-orange-600',
      glow: 'shadow-orange-600/50',
      icon: '🔥',
      defaultLabel: 'Brûlé',
      animation: 'animate-pulse'
    },
    frozen: {
      color: 'bg-cyan-400',
      glow: 'shadow-cyan-400/50',
      icon: '❄️',
      defaultLabel: 'Gelé',
      animation: ''
    },
    paralyzed: {
      color: 'bg-yellow-500',
      glow: 'shadow-yellow-500/50',
      icon: '⚡',
      defaultLabel: 'Paralysé',
      animation: 'animate-pulse'
    },
    sleeping: {
      color: 'bg-indigo-500',
      glow: 'shadow-indigo-500/50',
      icon: '😴',
      defaultLabel: 'Endormi',
      animation: 'animate-pulse'
    }
  };

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const iconSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  if (showLabel) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="relative">
          <div
            className={cn(
              'rounded-full',
              config.color,
              sizeClasses[size],
              animated && config.animation,
              'shadow-lg',
              config.glow
            )}
          />
          {animated && (
            <div
              className={cn(
                'absolute inset-0 rounded-full',
                config.color,
                'opacity-20 animate-ping'
              )}
            />
          )}
        </div>
        <span className="text-sm font-medium text-white">
          {displayLabel}
        </span>
      </div>
    );
  }

  // Icon version for Pokemon statuses
  if (['battle', 'fainted', 'poisoned', 'burned', 'frozen', 'paralyzed', 'sleeping'].includes(status)) {
    return (
      <div 
        className={cn(
          'relative inline-flex items-center justify-center',
          iconSizeClasses[size],
          animated && config.animation,
          className
        )}
        title={displayLabel}
      >
        <span className="drop-shadow-lg">{config.icon}</span>
        {animated && (
          <div className="absolute inset-0 animate-ping opacity-30">
            {config.icon}
          </div>
        )}
      </div>
    );
  }

  // Dot indicator for system statuses
  return (
    <div className={cn('relative', className)} title={displayLabel}>
      <div
        className={cn(
          'rounded-full',
          config.color,
          sizeClasses[size],
          animated && config.animation,
          'shadow-lg',
          config.glow
        )}
      />
      {animated && (
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            config.color,
            'opacity-20 animate-ping'
          )}
        />
      )}
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

