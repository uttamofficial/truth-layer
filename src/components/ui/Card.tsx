import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className,
  headerClassName,
  bodyClassName,
  hoverable = false,
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-800 bg-slate-900/70 shadow-lg shadow-black/40 overflow-hidden',
        hoverable && 'transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/90 hover:-translate-y-0.5',
        className
      )}
    >
      {(title || subtitle || action) && (
        <div
          className={clsx(
            'flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/40',
            headerClassName
          )}
        >
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={clsx('p-6', bodyClassName)}>{children}</div>
    </div>
  );
};
