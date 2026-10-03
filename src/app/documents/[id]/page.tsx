import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDocumentById, getHealthOverview } from '@/sanity/data';
import { AnalyzeDocumentButton } from '@/components/documents/AnalyzeDocumentButton';
import { 
  FileText, 
  ArrowLeft, 
  Clock, 
  Layers, 
  ShieldAlert, 
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [{ document: doc, conflicts, reviews }, overview] = await Promise.all([
    getDocumentById(id),
    getHealthOverview(),
  ]);

  if (!doc) {
    notFound();
  }

  const activeConflicts = conflicts.filter(c => c.status !== 'resolved' && c.status !== 'rejected');
  const pendingReviews = reviews.filter(r => r.status === 'pending');

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Back Link & Title Header */}
      <div className="space-y-4">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Documents Catalog</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 text-xs font-semibold uppercase border border-indigo-800/60">
                {doc.category}
              </span>
              <Badge variant={doc.healthState as any} />
              <Badge variant={doc.status as any} icon={false} />
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Ver: {doc.version}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              {doc.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                ID: {doc._id}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Last Updated: {new Date(doc.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive AI Document Analysis Engine Section */}
      <AnalyzeDocumentButton documentId={doc._id} documentTitle={doc.title} />

      {/* Potential Issues Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Potential Issues & Consistency Flags</span>
        </h2>

        {activeConflicts.length === 0 && pendingReviews.length === 0 ? (
          <div className="p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-emerald-300">No Active Conflicts Flagged</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                This document is consistent with other indexed Sanity records. No contradictions detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Conflicts Box */}
            {activeConflicts.map((c) => (
              <div key={c._id} className="p-5 rounded-xl border border-rose-900/80 bg-rose-950/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Contradictory Claim Detected: {c.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={c.severity as any} size="sm" />
                    <Badge variant={c.conflictType as any} size="sm" />
                    <Link
                      href={`/conflicts/${c._id}`}
                      className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white text-xs font-medium rounded-lg border border-rose-700 transition-colors inline-flex items-center gap-1"
                    >
                      Compare Statements <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-rose-200/90 leading-relaxed bg-slate-950/80 p-3 rounded border border-rose-900/60 font-sans">
                  {c.aiAnalysis}
                </p>
              </div>
            ))}

            {/* Pending Reviews Box */}
            {pendingReviews.map((r) => (
              <div key={r._id} className="p-4 rounded-xl border border-purple-900/80 bg-purple-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
                    <GitPullRequest className="w-4 h-4 text-purple-400" />
                    <span>Pending Review Workflow: {r.title}</span>
                  </div>
                  <Badge variant={r.status as any} size="sm" />
                </div>
                {r.comment && (
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded border border-slate-800">
                    "{r.comment}" — <span className="font-semibold text-purple-300">{r.reviewer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Document Body View Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Left Column: Formatted Body */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Document Body Content</span>
              </div>
            }
          >
            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans space-y-4">
              {doc.body}
            </div>
          </Card>
        </div>

        {/* Right Column: Sanity Metadata */}
        <div className="space-y-6">
          <Card title="Document Metadata" bodyClassName="p-4 space-y-4 text-xs">
            <div className="space-y-3 divide-y divide-slate-800">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-400">Health Indicator</span>
                <Badge variant={doc.healthState as any} size="sm" />
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Slug</span>
                <span className="font-mono text-indigo-300 font-medium">/{doc.slug?.current}</span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Category</span>
                <span className="font-semibold text-slate-200">{doc.category}</span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Status</span>
                <Badge variant={doc.status as any} size="sm" icon={false} />
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Version</span>
                <span className="font-mono text-slate-300">{doc.version}</span>
              </div>

              <div className="pt-3 flex justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-mono text-slate-300">{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
