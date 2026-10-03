'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  LayoutDashboard, 
  Files, 
  ShieldAlert, 
  GitPullRequest, 
  Database,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  healthScore?: number;
  openConflicts?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ healthScore = 85, openConflicts = 4 }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      label: 'Documents',
      href: '/documents',
      icon: Files,
    },
    {
      label: 'Conflicts',
      href: '/conflicts',
      icon: ShieldAlert,
      badge: openConflicts > 0 ? String(openConflicts) : undefined,
      badgeColor: 'bg-rose-950 text-rose-400 border-rose-800/80',
    },
    {
      label: 'Reviews',
      href: '/reviews',
      icon: GitPullRequest,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-950/50 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-base tracking-tight">TruthLayer</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sanity Knowledge Health</p>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={clsx(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={clsx(
                    'px-2 py-0.5 text-[11px] font-semibold rounded-full border',
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Knowledge Health Summary Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Health Score
            </span>
            <span className="font-bold text-emerald-400">{healthScore}%</span>
          </div>
          
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${healthScore}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 text-slate-400">
              <Database className="w-3 h-3 text-slate-500" />
              Sanity Connected
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>
      </div>
    </aside>
  );
};
