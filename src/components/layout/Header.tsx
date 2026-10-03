'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Database, Terminal, ShieldCheck, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();

  const getBreadcrumb = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/documents')) {
      if (pathname === '/documents') return 'Documents Catalog';
      return 'Document Details';
    }
    if (pathname === '/conflicts') return 'Content Conflicts';
    if (pathname === '/reviews') return 'Review Workflows';
    return 'TruthLayer';
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-slate-500 font-medium text-sm">TruthLayer</span>
        <span className="text-slate-700">/</span>
        <h1 className="text-slate-100 font-semibold text-sm tracking-tight">{getBreadcrumb()}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Sanity Integration Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sanity Backend</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </div>

        {/* Environment Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>local-dev</span>
        </div>
      </div>
    </header>
  );
};
