import React from 'react';
import { clsx } from 'clsx';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FileText, 
  ShieldAlert, 
  GitPullRequest,
  HelpCircle
} from 'lucide-react';

export type BadgeVariant = 
  | 'healthy' 
  | 'warning' 
  | 'conflict' 
  | 'review' 
  | 'draft' 
  | 'published' 
  | 'archived'
  | 'low'
  | 'medium'
  | 'high'
  | 'contradictory'
  | 'outdated'
  | 'ambiguous'
  | 'detected'
  | 'resolved'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'needs-investigation';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  variant, 
  label, 
  size = 'md', 
  icon = true,
  className 
}) => {
  const getBadgeStyle = () => {
    switch (variant) {
      // Health / Statuses
      case 'healthy':
      case 'published':
      case 'approved':
      case 'resolved':
        return {
          bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-emerald-950/20',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          defaultLabel: label || (variant === 'healthy' ? 'Healthy' : variant === 'published' ? 'Published' : 'Approved'),
        };

      case 'warning':
      case 'medium':
      case 'outdated':
      case 'review':
      case 'pending':
        return {
          bg: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-amber-950/20',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          defaultLabel: label || (variant === 'warning' ? 'Warning' : variant === 'outdated' ? 'Outdated' : 'Pending Review'),
        };

      case 'conflict':
      case 'high':
      case 'contradictory':
      case 'rejected':
        return {
          bg: 'bg-rose-950/60 text-rose-400 border-rose-800/60 shadow-rose-950/20',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          defaultLabel: label || (variant === 'conflict' ? 'Conflict' : variant === 'high' ? 'High Severity' : 'Contradictory'),
        };

      case 'low':
      case 'draft':
      case 'ambiguous':
        return {
          bg: 'bg-sky-950/60 text-sky-400 border-sky-800/60 shadow-sky-950/20',
          icon: <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
          defaultLabel: label || (variant === 'draft' ? 'Draft' : variant === 'low' ? 'Low Severity' : 'Ambiguous'),
        };

      case 'archived':
        return {
          bg: 'bg-slate-800/60 text-slate-400 border-slate-700/60',
          icon: <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
          defaultLabel: label || 'Archived',
        };

      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
          defaultLabel: label || String(variant),
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium border rounded-md transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        style.bg,
        className
      )}
    >
      {icon && style.icon}
      <span>{style.defaultLabel}</span>
    </span>
  );
};
