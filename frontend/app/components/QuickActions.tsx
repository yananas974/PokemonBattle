import React from 'react';
import { VintageButton } from './VintageButton';

export interface QuickAction {
  title: string;
  description: string;
  icon: string;
  href: string;
  variant: 'blue' | 'red' | 'yellow' | 'green' | 'gray';
  featured?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = React.memo(({
  actions,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      {actions.map((action) => (
        <VintageButton
          key={action.href}
          href={action.href}
          variant={action.variant}
          className={`${action.featured ? 'col-span-full animate-pokemon-blink' : ''} block`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{action.icon}</span>
            <div className="flex-1 text-left">
              <h3 className="font-pokemon text-xs mb-1">{action.title}</h3>
              <p className="text-xs opacity-90 font-pokemon">{action.description}</p>
            </div>
            <span className="text-lg opacity-70">→</span>
          </div>
        </VintageButton>
      ))}
    </div>
  );
});

QuickActions.displayName = 'QuickActions';
