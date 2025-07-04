import React from 'react';
import { VintageCard } from './VintageCard';

interface StatusIndicatorProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  icon?: string;
  animate?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  type,
  title,
  message,
  icon,
  animate = false
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          borderColor: 'border-pokemon-red',
          textColor: 'text-pokemon-red',
          messageColor: 'text-red-600',
          defaultIcon: '❌'
        };
      case 'warning':
        return {
          borderColor: 'border-pokemon-yellow',
          textColor: 'text-yellow-700',
          messageColor: 'text-yellow-600',
          defaultIcon: '⚠️'
        };
      case 'success':
        return {
          borderColor: 'border-pokemon-green',
          textColor: 'text-green-700',
          messageColor: 'text-green-600',
          defaultIcon: '✅'
        };
      case 'info':
        return {
          borderColor: 'border-pokemon-blue',
          textColor: 'text-pokemon-blue-dark',
          messageColor: 'text-pokemon-blue',
          defaultIcon: 'ℹ️'
        };
      default:
        return {
          borderColor: 'border-pokemon-gray',
          textColor: 'text-pokemon-blue-dark',
          messageColor: 'text-pokemon-blue',
          defaultIcon: 'ℹ️'
        };
    }
  };

  const config = getTypeConfig();
  const displayIcon = icon || config.defaultIcon;

  return (
    <VintageCard className={`border-4 ${config.borderColor}`}>
      <div className="p-4 text-center">
        <div className={`text-3xl mb-2 ${animate ? 'animate-pokemon-blink' : ''}`}>
          {displayIcon}
        </div>
        <h3 className={`font-pokemon text-sm ${config.textColor} uppercase mb-2`}>
          {title}
        </h3>
        <p className={`font-pokemon text-xs ${config.messageColor}`}>
          {message}
        </p>
      </div>
    </VintageCard>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

