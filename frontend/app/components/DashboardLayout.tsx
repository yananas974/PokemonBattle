import React from 'react';
import TopNavigation from './TopNavigation';
import BottomNavigation from './BottomNavigation';
import type { User } from '@pokemon-battle/shared';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: User;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation supérieure */}
      <TopNavigation user={user} />
      
      {/* Contenu principal */}
      <main className="pb-20">
        {children}
      </main>
      
      {/* Navigation inférieure */}
      <BottomNavigation />
    </div>
  );
} 