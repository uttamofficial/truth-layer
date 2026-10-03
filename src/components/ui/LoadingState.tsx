import React from 'react';

export const MetricSkeleton = () => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 animate-pulse">
    <div className="h-4 w-28 bg-slate-800 rounded mb-3"></div>
    <div className="h-8 w-20 bg-slate-800 rounded mb-2"></div>
    <div className="h-3 w-36 bg-slate-800/60 rounded"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full space-y-3 animate-pulse">
    <div className="h-10 bg-slate-900/80 rounded-lg w-full border border-slate-800"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 bg-slate-900/40 rounded-lg w-full border border-slate-800/60 flex items-center px-4 justify-between">
        <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
        <div className="h-4 w-1/6 bg-slate-800/70 rounded"></div>
        <div className="h-4 w-1/8 bg-slate-800/70 rounded"></div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-5 w-1/2 bg-slate-800 rounded"></div>
      <div className="h-5 w-16 bg-slate-800/60 rounded"></div>
    </div>
    <div className="h-12 w-full bg-slate-800/40 rounded"></div>
    <div className="flex gap-2">
      <div className="h-4 w-20 bg-slate-800/50 rounded"></div>
      <div className="h-4 w-24 bg-slate-800/50 rounded"></div>
    </div>
  </div>
);
