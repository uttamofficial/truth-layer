'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewStatus } from '@/types';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Check, X } from 'lucide-react';

interface ReviewActionsProps {
  reviewId: string;
  reviewTitle: string;
  initialStatus: ReviewStatus;
  initialReviewer?: string;
}

export const ReviewActions: React.FC<ReviewActionsProps> = ({
  reviewId,
  reviewTitle,
  initialStatus,
  initialReviewer = 'Human Reviewer',
}) => {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | 'investigate' | null>(null);
  const [reviewer, setReviewer] = useState(initialReviewer || 'Human Reviewer');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ReviewStatus>(initialStatus);

  // Do not expose actions for already approved or rejected reviews
  if (currentStatus === 'approved' || currentStatus === 'rejected') {
    return null;
  }

  const handleSubmit = async (action: 'approve' | 'reject' | 'investigate') => {
    if (action === 'reject' && (!comment || comment.trim() === '')) {
      setError('A rejection reason is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewer,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update review status.');
      }

      setSuccessMsg(data.message || 'Review updated successfully!');
      setCurrentStatus(data.review?.status || (action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'needs-investigation'));
      setActiveModal(null);
      setComment('');

      // Refresh server components & dashboard metrics
      router.refresh();
    } catch (err: any) {
      console.error('Review mutation error:', err);
      setError(err?.message || 'Failed to update review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={() => { setError(null); setActiveModal('approve'); }}
          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Approve Resolution</span>
        </button>

        <button
          onClick={() => { setError(null); setActiveModal('reject'); }}
          className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Reject</span>
        </button>

        <button
          onClick={() => { setError(null); setActiveModal('investigate'); }}
          className="px-3 py-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800/80 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Needs Investigation</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {activeModal === 'approve' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {activeModal === 'reject' && <XCircle className="w-5 h-5 text-rose-400" />}
                {activeModal === 'investigate' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                <span>
                  {activeModal === 'approve' && 'Approve Resolution'}
                  {activeModal === 'reject' && 'Reject Resolution'}
                  {activeModal === 'investigate' && 'Flag for Investigation'}
                </span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner inside Modal */}
            {error && (
              <div className="p-3 rounded bg-rose-950/80 border border-rose-800 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Target: <span className="font-semibold text-white">{reviewTitle}</span>
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reviewer Name</label>
                <input
                  type="text"
                  value={reviewer}
                  onChange={(e) => setReviewer(e.target.value)}
                  placeholder="e.g. Alex Rivera (Security Lead)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  {activeModal === 'reject' ? 'Rejection Reason (Required)' : 'Comments / Recommendations'}
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    activeModal === 'approve'
                      ? 'Approved resolution after verifying tier rates...'
                      : activeModal === 'reject'
                      ? 'Rejection reason: standard plans cannot support 500 req/min...'
                      : 'Needs investigation into legacy bearer tokens...'
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSubmit(activeModal)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors flex items-center gap-1.5 ${
                  activeModal === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : activeModal === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>
                    {activeModal === 'approve' && 'Confirm Approval'}
                    {activeModal === 'reject' && 'Confirm Rejection'}
                    {activeModal === 'investigate' && 'Confirm Investigation'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
