import React from 'react';
import { Inbox, FilterX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'inbox' | 'filter';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'inbox',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 border border-slate-700/50">
        {icon === 'filter' ? (
          <FilterX className="w-6 h-6 text-indigo-400" />
        ) : (
          <Inbox className="w-6 h-6 text-slate-400" />
        )}
      </div>
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 rounded-lg hover:bg-indigo-900/90 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
