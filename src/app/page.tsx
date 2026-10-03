import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getHealthOverview, getDocuments, getConflicts, getReviews } from '@/sanity/data';
import { 
  Files, 
  ShieldAlert, 
  GitPullRequest, 
  Activity, 
  ArrowRight, 
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Clock,
  Layers,
  Check
} from 'lucide-react';

export const revalidate = 0; // Fresh server rendering

export default async function DashboardPage() {
  const [overview, documents, conflicts, reviews] = await Promise.all([
    getHealthOverview(),
    getDocuments({ sortBy: 'recently_updated' }),
    getConflicts(),
    getReviews(),
  ]);

  const recentDocuments = documents.slice(0, 5);
  const recentConflicts = conflicts.slice(0, 4);
  const recentReviews = reviews.slice(0, 4);

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Knowledge Health Dashboard</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              Live Sanity Data
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Real-time consistency, staleness, and conflict monitoring across your organization's Sanity documentation suite.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-950/50 transition-all"
          >
            <Files className="w-4 h-4" />
            <span>Explore Documents</span>
          </Link>
        </div>
      </div>

      {/* Top Knowledge Health Banner & Formula Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Overall Score Hero Widget */}
        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              TruthLayer Knowledge Health
            </span>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
              Deterministic Score
            </span>
          </div>

          <div className="my-5 flex items-baseline gap-3">
            <span className="text-5xl font-black text-white tracking-tight">{overview.healthScore}%</span>
            <div>
              <span className="text-sm font-semibold text-emerald-400 block">
                {overview.healthScore >= 80 ? 'Healthy System' : overview.healthScore >= 60 ? 'Needs Attention' : 'High Risk'}
              </span>
              <span className="text-xs text-slate-400">Calculated from live Sanity records</span>
            </div>
          </div>

          <p className="text-xs text-slate-300/80 leading-relaxed pt-2 border-t border-indigo-900/40">
            A weighted indicator of dataset consistency (40%), freshness (25%), review resolution (20%), and source coverage (15%).
          </p>
        </div>

        {/* Explainable Metric Cards Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total Documents */}
          <Card bodyClassName="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Docs</span>
              <Files className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-3">
              <span className="text-3xl font-extrabold text-white">{overview.totalDocuments}</span>
            </div>
            <span className="text-[11px] text-slate-500">Sanity content items</span>
          </Card>

          {/* Conflicts */}
          <Card bodyClassName="p-5 flex flex-col justify-between h-full border-rose-900/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Conflicts</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="my-3">
              <span className="text-3xl font-extrabold text-rose-400">{overview.openConflictsCount}</span>
            </div>
            <span className="text-[11px] text-slate-500">Active contradictions</span>
          </Card>

          {/* Needs Review */}
          <Card bodyClassName="p-5 flex flex-col justify-between h-full border-purple-900/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Needs Review</span>
              <GitPullRequest className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-3">
              <span className="text-3xl font-extrabold text-purple-300">{overview.pendingReviewsCount}</span>
            </div>
            <span className="text-[11px] text-slate-500">Pending reviewer signoff</span>
          </Card>

          {/* Healthy Documents */}
          <Card bodyClassName="p-5 flex flex-col justify-between h-full border-emerald-900/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Healthy Docs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3">
              <span className="text-3xl font-extrabold text-emerald-400">{overview.healthyDocumentsCount}</span>
            </div>
            <span className="text-[11px] text-slate-500">Verified & updated</span>
          </Card>
        </div>
      </div>

      {/* Health Breakdown Section */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Health Breakdown Metrics</span>
          </div>
        }
        subtitle="Transparent, explainable components comprising the overall Knowledge Health score"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Consistency */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Consistency</span>
              <span className="font-bold text-indigo-400">{overview.consistencyScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overview.consistencyScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Docs free of active contradiction flags ({overview.totalDocuments - overview.conflictingDocumentsCount}/{overview.totalDocuments}).
            </p>
          </div>

          {/* Freshness */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Freshness</span>
              <span className="font-bold text-emerald-400">{overview.freshnessScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overview.freshnessScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Published docs updated within the last 90 days.
            </p>
          </div>

          {/* Review Backlog */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Review Backlog</span>
              <span className="font-bold text-purple-400">{overview.reviewBacklogScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overview.reviewBacklogScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Review workflows processed vs pending in queue ({overview.pendingReviewsCount} pending).
            </p>
          </div>

          {/* Source Coverage */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Source Coverage</span>
              <span className="font-bold text-amber-400">{overview.sourceCoverageScore}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${overview.sourceCoverageScore}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Core documentation categories with active published content.
            </p>
          </div>
        </div>
      </Card>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Documents Table */}
        <div className="lg:col-span-2 space-y-8">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Files className="w-4 h-4 text-indigo-400" />
                <span>Recent Knowledge Documents</span>
              </div>
            }
            subtitle="Sorted by recently updated in Sanity"
            action={
              <Link
                href="/documents"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                View all ({documents.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                    <th className="py-3 px-4">Title & Slug</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Health State</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentDocuments.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-3 px-4">
                        <Link href={`/documents/${doc._id}`} className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {doc.title}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-500 line-clamp-1">
                          /{doc.slug?.current || doc._id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={doc.healthState as any} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={doc.status as any} size="sm" icon={false} />
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Conflicts Card List */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Detected Content Conflicts</span>
              </div>
            }
            subtitle="Flagged inconsistencies requiring resolution"
            action={
              <Link
                href="/conflicts"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                All Conflicts ({conflicts.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-4 space-y-4"
          >
            {recentConflicts.map((conflict) => {
              const docA = typeof conflict.sourceDocumentA === 'object' ? conflict.sourceDocumentA : null;
              const docB = typeof conflict.sourceDocumentB === 'object' ? conflict.sourceDocumentB : null;

              return (
                <div
                  key={conflict._id}
                  className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/conflicts/${conflict._id}`} className="text-sm font-semibold text-slate-200 hover:text-indigo-300 transition-colors">
                      {conflict.title}
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={conflict.severity as any} size="sm" />
                      <Badge variant={conflict.conflictType as any} size="sm" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
                    {conflict.aiAnalysis}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Affects:</span>
                      <span className="text-indigo-400 font-mono font-medium">{docA?.title || 'Doc A'}</span>
                      <span>vs</span>
                      <span className="text-indigo-400 font-mono font-medium">{docB?.title || 'Doc B'}</span>
                    </div>
                    <Link href={`/conflicts/${conflict._id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Right Column: Recent Reviews & System Info */}
        <div className="space-y-8">
          <Card
            title={
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-purple-400" />
                <span>Review Workflows</span>
              </div>
            }
            subtitle="Human review approvals & feedback"
            action={
              <Link
                href="/reviews"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
            bodyClassName="p-4 space-y-4"
          >
            {recentReviews.map((rev) => (
              <div
                key={rev._id}
                className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{rev.title}</span>
                  <Badge variant={rev.status as any} size="sm" />
                </div>

                {rev.comment && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded">
                    "{rev.comment}"
                  </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{rev.reviewer}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* Integration Status Widget */}
          <Card
            title="Sanity Integration Status"
            subtitle="Backend dataset details"
            bodyClassName="space-y-3"
          >
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Dataset</span>
                <span className="font-mono text-indigo-300">production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schemas</span>
                <span className="font-mono text-slate-200">knowledgeDocument, contentConflict, review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GROQ Query Engine</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
