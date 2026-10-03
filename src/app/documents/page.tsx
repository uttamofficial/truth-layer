import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDocuments, getHealthOverview } from '@/sanity/data';
import { Category, DocumentStatus } from '@/types';
import { Search, Filter, FileText, ArrowRight, ArrowUpDown, Calendar } from 'lucide-react';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    sortBy?: string;
  }>;
}

const CATEGORIES: (Category | 'ALL')[] = [
  'ALL',
  'API',
  'Authentication',
  'FAQ',
  'Tutorial',
  'Product',
  'Policy',
  'Developer Guide',
  'Release Notes',
];

const STATUSES: (DocumentStatus | 'ALL')[] = ['ALL', 'published', 'draft', 'archived'];

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || '';
  const category = (params.category as Category | 'ALL') || 'ALL';
  const status = (params.status as DocumentStatus | 'ALL') || 'ALL';
  const sortBy = (params.sortBy as 'recently_updated' | 'title_asc' | 'health_risk') || 'recently_updated';

  const [documents, overview] = await Promise.all([
    getDocuments({
      search: q,
      category,
      status,
      sortBy,
    }),
    getHealthOverview(),
  ]);

  return (
    <AppLayout healthScore={overview.healthScore} openConflicts={overview.openConflictsCount}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Knowledge Documents Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Search, filter, and inspect document health across your organization's Sanity data layer.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Showing</span>
          <span className="ml-1 text-sm font-bold text-indigo-400">{documents.length}</span>
          <span className="text-xs text-slate-500"> of {overview.totalDocuments} docs</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card bodyClassName="p-4 space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Title, content, or keyword..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
            <select
              name="category"
              defaultValue={category}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.filter(s => s !== 'ALL').map(s => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Sort By</label>
            <div className="flex gap-2">
              <select
                name="sortBy"
                defaultValue={sortBy}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="recently_updated">Recently Updated</option>
                <option value="health_risk">Health Risk Level</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shrink-0"
              >
                Filter
              </button>
            </div>
          </div>
        </form>

        {/* Quick Filter Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
          <span className="text-[11px] text-slate-500 self-center mr-1">Topic Filter:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            const href = `/documents?${new URLSearchParams({
              ...(q ? { q } : {}),
              ...(cat !== 'ALL' ? { category: cat } : {}),
              ...(status !== 'ALL' ? { status } : {}),
              ...(sortBy ? { sortBy } : {}),
            }).toString()}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
                  isSelected
                    ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Topics' : cat}
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Documents List View */}
      {documents.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No Documents Match Filter"
          description={`We couldn't find any Sanity documents matching your search term "${q || category}". Try resetting your filters.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card
              key={doc._id}
              hoverable
              className="flex flex-col justify-between"
              bodyClassName="p-5 flex flex-col justify-between h-full space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-semibold tracking-wide uppercase border border-slate-700/60">
                    {doc.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={doc.healthState as any} size="sm" />
                    <Badge variant={doc.status as any} size="sm" icon={false} />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-slate-100 line-clamp-2 leading-snug">
                  <Link href={`/documents/${doc._id}`} className="hover:text-indigo-300 transition-colors">
                    {doc.title}
                  </Link>
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {doc.body}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-mono">Ver: {doc.version}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <Link
                  href={`/documents/${doc._id}`}
                  className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 group"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
