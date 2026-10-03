import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getConflicts, getHealthOverview } from '@/sanity/data';
import { Severity, ConflictType, ConflictStatus, KnowledgeDocument } from '@/types';
import { ShieldAlert, Filter, ArrowRight, ExternalLink, Bot, Calendar, Files } from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    severity?: string;
    type?: string;
    status?: string;
  }>;
}

export default async function ConflictsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const severity = (params.severity as Severity | 'ALL') || 'ALL';
  const type = (params.type as ConflictType | 'ALL') || 'ALL';
  const status = (params.status as ConflictStatus | 'ALL') || 'ALL';

  const [conflicts, overview] = await Promise.all([
    getConflicts({ severity, type, status }),
    getHealthOverview(),
  ]);

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Content Conflicts Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detected contradictions, outdated specifications, and ambiguous claims retrieved from Sanity.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Flagged:</span>
          <span className="ml-1 text-sm font-bold text-rose-400">{conflicts.length}</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <Card bodyClassName="p-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Severity</label>
            <select
              name="severity"
              defaultValue={severity}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Conflict Type</label>
            <select
              name="type"
              defaultValue={type}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Types</option>
              <option value="contradictory">Contradictory</option>
              <option value="outdated">Outdated</option>
              <option value="ambiguous">Ambiguous</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Conflicts List */}
      {conflicts.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No Conflicts Found"
          description="There are no content conflicts matching the selected filters."
        />
      ) : (
        <div className="space-y-6">
          {conflicts.map((c) => {
            const docA = (typeof c.sourceDocumentA === 'object' ? c.sourceDocumentA : null) as KnowledgeDocument | null;
            const docB = (typeof c.sourceDocumentB === 'object' ? c.sourceDocumentB : null) as KnowledgeDocument | null;

            return (
              <Card key={c._id} hoverable bodyClassName="p-6 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      <Link href={`/conflicts/${c._id}`} className="hover:text-indigo-300 transition-colors">
                        {c.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Created: {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={c.severity as any} />
                    <Badge variant={c.conflictType as any} />
                    <Badge variant={c.status as any} />
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                      <Bot className="w-4 h-4 text-indigo-400" />
                      <span>Summary</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">Sanity Conflict ID: {c._id}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {c.aiAnalysis}
                  </p>
                </div>

                {/* Documents Involved Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-300 flex items-center gap-1">
                      <Files className="w-3.5 h-3.5 text-slate-500" />
                      Documents Involved:
                    </span>
                    <span className="text-indigo-300 font-medium font-mono">{docA?.title || 'Document A'}</span>
                    <span className="text-slate-500">vs</span>
                    <span className="text-indigo-300 font-medium font-mono">{docB?.title || 'Document B'}</span>
                  </div>

                  <Link
                    href={`/conflicts/${c._id}`}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 shrink-0"
                  >
                    <span>Inspect Side-by-Side</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
