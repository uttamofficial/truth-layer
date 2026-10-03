import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getConflictById, getHealthOverview } from '@/sanity/data';
import { KnowledgeDocument } from '@/types';
import { 
  ShieldAlert, 
  ArrowLeft, 
  ExternalLink, 
  Calendar, 
  Bot, 
  GitPullRequest,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConflictDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [conflict, overview] = await Promise.all([
    getConflictById(id),
    getHealthOverview(),
  ]);

  if (!conflict) {
    notFound();
  }

  const docA = (typeof conflict.sourceDocumentA === 'object' ? conflict.sourceDocumentA : null) as KnowledgeDocument | null;
  const docB = (typeof conflict.sourceDocumentB === 'object' ? conflict.sourceDocumentB : null) as KnowledgeDocument | null;

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Back Button & Title Header */}
      <div className="space-y-4">
        <Link
          href="/conflicts"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Conflicts Catalog</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={conflict.severity as any} />
              <Badge variant={conflict.conflictType as any} />
              <Badge variant={conflict.status as any} />
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              {conflict.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Conflict ID: {conflict._id}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Created: {new Date(conflict.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reviews"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-950/50 transition-all"
            >
              <GitPullRequest className="w-4 h-4" />
              <span>Review Workflows</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-Side Document Statements Comparison */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>Side-by-Side Statement Comparison</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SOURCE A */}
          <Card
            headerClassName="bg-indigo-950/40 border-b border-indigo-900/40"
            title={
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">SOURCE A</span>
                {docA?._id && (
                  <Link
                    href={`/documents/${docA._id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                  >
                    Open Document <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            }
            bodyClassName="p-5 space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">{docA?.title || 'Source Document A'}</h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">{docA?.category}</span>
                <span>Ver: {docA?.version}</span>
                <span>Updated: {docA?.updatedAt ? new Date(docA.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document Claim / Excerpt</span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans font-normal border-l-4 border-l-indigo-500">
                "{docA?.body || 'Document content unavailable'}"
              </div>
            </div>
          </Card>

          {/* SOURCE B */}
          <Card
            headerClassName="bg-purple-950/40 border-b border-purple-900/40"
            title={
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">SOURCE B</span>
                {docB?._id && (
                  <Link
                    href={`/documents/${docB._id}`}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
                  >
                    Open Document <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            }
            bodyClassName="p-5 space-y-4"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-100">{docB?.title || 'Source Document B'}</h3>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">{docB?.category}</span>
                <span>Ver: {docB?.version}</span>
                <span>Updated: {docB?.updatedAt ? new Date(docB.updatedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Document Claim / Excerpt</span>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans font-normal border-l-4 border-l-purple-500">
                "{docB?.body || 'Document content unavailable'}"
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Analysis Placeholder Section */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <span>AI Analysis</span>
          </div>
        }
        subtitle="Automated reasoning & conflict explanation"
        bodyClassName="p-6 space-y-4"
      >
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Existing Analysis Note
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Stage 1 Foundation</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {conflict.aiAnalysis}
          </p>
        </div>

        {/* AI Generator Placeholder Banner */}
        <div className="p-6 rounded-xl border border-dashed border-indigo-800/60 bg-slate-950/60 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 mx-auto border border-indigo-800/60">
            <Bot className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200">AI Analysis Stage Placeholder</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            AI analysis will be generated in the next stage. Advanced LLM discrepancy reasoning and resolution recommendations will run here.
          </p>
        </div>
      </Card>
    </AppLayout>
  );
}
