'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AIIssue, AnalyzeResponse } from '@/types';
import { 
  Bot, 
  Sparkles, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Files, 
  UserCheck, 
  ExternalLink,
  Info,
  RefreshCw
} from 'lucide-react';

interface AnalyzeDocumentButtonProps {
  documentId: string;
  documentTitle: string;
}

export const AnalyzeDocumentButton: React.FC<AnalyzeDocumentButtonProps> = ({
  documentId,
  documentTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      const data: AnalyzeResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze document.');
      }

      setResults(data);
      setAnalyzed(true);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'An error occurred while connecting to the AI analysis engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trigger Button & Status Banner */}
      <div className="p-5 rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">AI Content Consistency Analysis</h3>
          </div>
          <p className="text-xs text-slate-400">
            Scan "{documentTitle}" against related Sanity documentation for contradictions, staleness, and ambiguous claims.
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg text-xs font-semibold shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 ${
            loading
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 cursor-not-allowed animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50 hover:scale-[1.02]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{analyzed ? 'Re-Analyze Document' : 'Analyze Document'}</span>
            </>
          )}
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-800 bg-rose-950/50 text-rose-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleAnalyze}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded text-[11px] font-medium transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analysis Results Display */}
      {results && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Analysis Results</span>
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
                {results.issues.length} {results.issues.length === 1 ? 'Issue Detected' : 'Issues Detected'}
              </span>
            </div>

            {results.isFallbackMode && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Fallback Analysis Mode (No OpenAI Key)
              </span>
            )}
          </div>

          {/* Zero Issues State */}
          {results.issues.length === 0 ? (
            <div className="p-6 rounded-xl border border-emerald-800/60 bg-emerald-950/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-semibold text-emerald-300">No Inconsistencies Detected</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The AI analysis engine verified this document against related Sanity records and found no active contradictions or outdated specifications.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.issues.map((issue, idx) => (
                <Card key={idx} bodyClassName="p-6 space-y-5">
                  {/* Issue Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant={issue.severity as any} />
                        <Badge variant={issue.type as any} />
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          {Math.round((issue.confidence || 0.9) * 100)}% Confidence
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white">{issue.title}</h4>
                    </div>
                  </div>

                  {/* AI Explanation Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block">
                      AI Explanation
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      "{issue.explanation}"
                    </p>
                  </div>

                  {/* Quoted Relevant Claims Side-by-Side */}
                  {issue.sourceClaims && issue.sourceClaims.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Relevant Source Claims
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {issue.sourceClaims.map((claim, cIdx) => (
                          <div key={cIdx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {claim.documentTitle || `Doc ID: ${claim.documentId}`}
                              </span>
                              <Link
                                href={`/documents/${claim.documentId}`}
                                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-0.5"
                              >
                                View <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                            <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                              "{claim.claim}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Affected Documents Section */}
                  {issue.affectedDocumentTitles && issue.affectedDocumentTitles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Affected Documents
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {issue.affectedDocumentTitles.map((title, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
                          >
                            <Files className="w-3.5 h-3.5 text-indigo-400" />
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Action Box */}
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        Recommended Action
                      </span>
                      <p className="text-xs text-slate-200 font-medium">
                        {issue.recommendation || 'Human review required to verify statements.'}
                      </p>
                    </div>

                    <Link
                      href="/conflicts"
                      className="px-3.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-200 text-xs font-semibold rounded-lg border border-amber-800/80 transition-colors shrink-0 inline-flex items-center justify-center gap-1"
                    >
                      <span>Manage Conflict Queue</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
