'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  healthScore?: number;
  openConflicts?: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  healthScore = 85,
  openConflicts = 4 
}) => {
  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Sidebar healthScore={healthScore} openConflicts={openConflicts} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
};
