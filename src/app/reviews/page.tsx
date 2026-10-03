import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getReviews, getHealthOverview } from '@/sanity/data';
import { ReviewStatus } from '@/types';
import { ReviewActions } from '@/components/reviews/ReviewActions';
import { GitPullRequest, UserCheck, MessageSquare, ShieldAlert } from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = (params.status as ReviewStatus | 'ALL') || 'ALL';

  const [reviews, overview] = await Promise.all([
    getReviews({ status }),
    getHealthOverview(),
  ]);

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-purple-400" />
            Human Review Workflows
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Interactive review queue for approving, rejecting, or investigating detected documentation conflicts.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Reviews:</span>
          <span className="ml-1 text-sm font-bold text-purple-400">{reviews.length}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-500 font-medium mr-2">Status Filter:</span>
        {(['ALL', 'pending', 'approved', 'rejected', 'needs-investigation'] as const).map((st) => {
          const isSelected = status === st;
          const href = `/reviews${st !== 'ALL' ? `?status=${st}` : ''}`;

          return (
            <Link
              key={st}
              href={href}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isSelected
                  ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Reviews' : st.replaceAll('-', ' ').toUpperCase()}
            </Link>
          );
        })}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No Reviews Found"
          description="There are no review records matching the specified status filter."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const conflict = typeof r.conflict === 'object' ? r.conflict : null;

            return (
              <Card key={r._id} bodyClassName="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-100">{r.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                        {r.reviewer}
                      </span>
                      <span>•</span>
                      <span>Submitted: {new Date(r.createdAt).toLocaleDateString()}</span>
                      {r.resolvedAt && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Resolved: {new Date(r.resolvedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Badge variant={r.status as any} />
                </div>

                {/* Comment / Recommendation */}
                {r.comment && (
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Reviewer Notes</span>
                    </div>
                    <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                      "{r.comment}"
                    </p>
                  </div>
                )}

                {/* Linked Conflict reference */}
                {conflict && (
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-slate-400">Target Conflict:</span>
                      <span className="font-semibold text-slate-200">{conflict.title}</span>
                    </div>
                    <Link
                      href={`/conflicts/${conflict._id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-xs"
                    >
                      View Conflict &rarr;
                    </Link>
                  </div>
                )}

                {/* Interactive Action Controls for Human Reviewer */}
                <ReviewActions
                  reviewId={r._id}
                  reviewTitle={r.title}
                  initialStatus={r.status}
                  initialReviewer={r.reviewer}
                />
              </Card>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
