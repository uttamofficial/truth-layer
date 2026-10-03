import { sanityClient, projectId } from './client';
import { 
  KnowledgeDocument, 
  ContentConflict, 
  Review, 
  HealthOverview,
  Category,
  DocumentStatus,
  Severity,
  ConflictType,
  ConflictStatus,
  ReviewStatus,
  DocumentHealthState,
  AIIssue
} from '@/types';
import { SEED_DOCUMENTS, SEED_CONFLICTS, SEED_REVIEWS } from './seedData';

// Helper to check if Sanity credentials are provided
const isSanityConfigured = () => {
  return projectId && projectId !== 'demo' && projectId !== 'placeholder';
};

// Helper for extracting document ID safely from KnowledgeDocument or reference
const getDocId = (doc: any) => typeof doc === 'string' ? doc : doc?._id;

/**
 * Calculate dynamic health state for a single document
 */
export function calculateDocumentHealthState(
  doc: KnowledgeDocument,
  activeConflicts: ContentConflict[] = SEED_CONFLICTS,
  reviews: Review[] = SEED_REVIEWS
): DocumentHealthState {
  // Check if document is involved in an active conflict
  const isConflict = activeConflicts.some(c => {
    if (c.status === 'resolved' || c.status === 'rejected') return false;
    const docAId = getDocId(c.sourceDocumentA);
    const docBId = getDocId(c.sourceDocumentB);
    return docAId === doc._id || docBId === doc._id;
  });

  if (isConflict) return 'conflict';

  // Check if document is involved in a pending review workflow
  const isPendingReview = reviews.some(r => {
    if (r.status !== 'pending') return false;
    const conflictObj = typeof r.conflict === 'object' ? r.conflict : null;
    if (!conflictObj) return false;
    const docAId = getDocId(conflictObj.sourceDocumentA);
    const docBId = getDocId(conflictObj.sourceDocumentB);
    return docAId === doc._id || docBId === doc._id;
  });

  if (isPendingReview) return 'review required';

  // Check freshness (warning if draft or > 90 days since last update)
  const isDraft = doc.status === 'draft';
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const isOutdated = new Date().getTime() - new Date(doc.updatedAt).getTime() > ninetyDaysMs;

  if (isDraft || isOutdated) return 'warning';

  return 'healthy';
}

/**
 * Fetch Knowledge Health Overview Metrics (Deterministic Calculation)
 */
export async function getHealthOverview(): Promise<HealthOverview> {
  let allDocs = [...SEED_DOCUMENTS];
  let allConflicts = [...SEED_CONFLICTS];
  let allReviews = [...SEED_REVIEWS];

  if (isSanityConfigured()) {
    try {
      const query = `{
        "documents": *[_type == "knowledgeDocument"],
        "conflicts": *[_type == "contentConflict"]{..., sourceDocumentA->, sourceDocumentB->},
        "reviews": *[_type == "review"]{..., conflict->{..., sourceDocumentA->, sourceDocumentB->}}
      }`;
      const res = await sanityClient.fetch(query);
      if (res.documents && res.documents.length > 0) allDocs = res.documents;
      if (res.conflicts && res.conflicts.length > 0) allConflicts = res.conflicts;
      if (res.reviews && res.reviews.length > 0) allReviews = res.reviews;
    } catch (err) {
      console.warn('Sanity query failed, falling back to dataset:', err);
    }
  }

  const totalDocs = allDocs.length;
  const activeConflicts = allConflicts.filter(c => c.status === 'detected' || c.status === 'review');
  const pendingReviewsCount = allReviews.filter(r => r.status === 'pending').length;

  // Identify unique documents affected by active conflicts
  const conflictingDocIds = new Set<string>();
  activeConflicts.forEach(c => {
    const docA = getDocId(c.sourceDocumentA);
    const docB = getDocId(c.sourceDocumentB);
    if (docA) conflictingDocIds.add(docA);
    if (docB) conflictingDocIds.add(docB);
  });

  const conflictingDocsCount = conflictingDocIds.size;
  const healthyDocsCount = allDocs.filter(d => calculateDocumentHealthState(d, activeConflicts, allReviews) === 'healthy').length;

  // 1. Consistency Score (40% weight): Docs without unresolved conflicts
  const consistencyScore = totalDocs > 0 ? Math.round(((totalDocs - conflictingDocsCount) / totalDocs) * 100) : 100;

  // 2. Freshness Score (25% weight): Published docs updated in last 90 days
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const freshDocsCount = allDocs.filter(d => d.status === 'published' && (new Date().getTime() - new Date(d.updatedAt).getTime() <= ninetyDaysMs)).length;
  const freshnessScore = totalDocs > 0 ? Math.round((freshDocsCount / totalDocs) * 100) : 100;

  // 3. Review Backlog Score (20% weight): % of review items resolved vs pending
  const totalReviewsCount = allReviews.length;
  const resolvedReviewsCount = allReviews.filter(r => r.status === 'approved' || r.status === 'rejected').length;
  const reviewBacklogScore = totalReviewsCount > 0 ? Math.round((resolvedReviewsCount / totalReviewsCount) * 100) : 100;

  // 4. Source Coverage Score (15% weight): % of standard categories with active published content
  const CORE_CATEGORIES: Category[] = ['API', 'Authentication', 'FAQ', 'Tutorial', 'Product', 'Policy', 'Developer Guide', 'Release Notes'];
  const categoriesWithPublishedDoc = new Set(allDocs.filter(d => d.status === 'published').map(d => d.category));
  const sourceCoverageScore = Math.round((categoriesWithPublishedDoc.size / CORE_CATEGORIES.length) * 100);

  // Composite Weighted Score
  const healthScore = Math.round(
    consistencyScore * 0.40 +
    freshnessScore * 0.25 +
    reviewBacklogScore * 0.20 +
    sourceCoverageScore * 0.15
  );

  const categoryBreakdown: Record<string, number> = {};
  const statusBreakdown: Record<string, number> = {};

  allDocs.forEach(d => {
    categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + 1;
    statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1;
  });

  return {
    totalDocuments: totalDocs,
    healthyDocumentsCount: healthyDocsCount,
    conflictingDocumentsCount: conflictingDocsCount,
    openConflictsCount: activeConflicts.length,
    pendingReviewsCount,
    healthScore,
    consistencyScore,
    freshnessScore,
    reviewBacklogScore,
    sourceCoverageScore,
    categoryBreakdown,
    statusBreakdown,
  };
}

/**
 * Fetch Documents with Search, Filters, and Sorting
 */
export async function getDocuments(params?: {
  search?: string;
  category?: Category | 'ALL';
  status?: DocumentStatus | 'ALL';
  sortBy?: 'recently_updated' | 'title_asc' | 'health_risk';
}): Promise<KnowledgeDocument[]> {
  const { search, category, status, sortBy = 'recently_updated' } = params || {};

  let docs: KnowledgeDocument[] = [];
  let conflicts = SEED_CONFLICTS;
  let reviews = SEED_REVIEWS;

  if (isSanityConfigured()) {
    try {
      let filterStr = `_type == "knowledgeDocument"`;
      if (category && category !== 'ALL') {
        filterStr += ` && category == "${category}"`;
      }
      if (status && status !== 'ALL') {
        filterStr += ` && status == "${status}"`;
      }
      if (search && search.trim() !== '') {
        filterStr += ` && (title match "*${search}*" || body match "*${search}*")`;
      }

      const query = `{
        "docs": *[${filterStr}],
        "conflicts": *[_type == "contentConflict"]{..., sourceDocumentA->, sourceDocumentB->},
        "reviews": *[_type == "review"]{..., conflict->{..., sourceDocumentA->, sourceDocumentB->}}
      }`;
      const res = await sanityClient.fetch(query);
      if (res.docs) docs = res.docs;
      if (res.conflicts) conflicts = res.conflicts;
      if (res.reviews) reviews = res.reviews;
    } catch (err) {
      console.warn('Sanity document query failed, using fallback:', err);
    }
  }

  if (docs.length === 0) {
    let filtered = [...SEED_DOCUMENTS];

    if (category && category !== 'ALL') {
      filtered = filtered.filter(d => d.category === category);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(d => d.status === status);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.title.toLowerCase().includes(q) || 
        d.body.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    docs = filtered;
  }

  // Attach dynamic healthState to each document
  const enrichedDocs = docs.map(d => ({
    ...d,
    healthState: calculateDocumentHealthState(d, conflicts, reviews),
  }));

  // Apply Sorting
  if (sortBy === 'title_asc') {
    return enrichedDocs.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  if (sortBy === 'health_risk') {
    const riskOrder: Record<DocumentHealthState, number> = {
      conflict: 0,
      'review required': 1,
      warning: 2,
      healthy: 3,
    };
    return enrichedDocs.sort((a, b) => (riskOrder[a.healthState!] ?? 3) - (riskOrder[b.healthState!] ?? 3));
  }

  // Default: recently_updated
  return enrichedDocs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Fetch Single Document by ID or Slug
 */
export async function getDocumentById(idOrSlug: string): Promise<{
  document: KnowledgeDocument | null;
  conflicts: ContentConflict[];
  reviews: Review[];
}> {
  if (isSanityConfigured()) {
    try {
      const query = `{
        "document": *[_type == "knowledgeDocument" && (_id == $id || slug.current == $id)][0],
        "conflicts": *[_type == "contentConflict" && (sourceDocumentA._ref == $id || sourceDocumentB._ref == $id)]{
          ...,
          sourceDocumentA->,
          sourceDocumentB->
        },
        "reviews": *[_type == "review"]{
          ...,
          conflict->{
            ...,
            sourceDocumentA->,
            sourceDocumentB->
          }
        }
      }`;
      const res = await sanityClient.fetch(query, { id: idOrSlug });
      if (res.document) {
        const docObj = {
          ...res.document,
          healthState: calculateDocumentHealthState(res.document, res.conflicts || [], res.reviews || []),
        };
        return {
          document: docObj,
          conflicts: res.conflicts || [],
          reviews: (res.reviews || []).filter((r: any) => {
            const conflict = typeof r.conflict === 'object' ? r.conflict : null;
            if (!conflict) return false;
            const docA = getDocId(conflict.sourceDocumentA);
            const docB = getDocId(conflict.sourceDocumentB);
            return docA === res.document._id || docB === res.document._id;
          }),
        };
      }
    } catch (err) {
      console.warn('Sanity document lookup failed:', err);
    }
  }

  // Fallback memory lookup
  const doc = SEED_DOCUMENTS.find(d => d._id === idOrSlug || d.slug.current === idOrSlug) || null;
  if (!doc) {
    return { document: null, conflicts: [], reviews: [] };
  }

  const conflicts = SEED_CONFLICTS.filter(c => {
    const docAId = getDocId(c.sourceDocumentA);
    const docBId = getDocId(c.sourceDocumentB);
    return docAId === doc._id || docBId === doc._id;
  });

  const reviews = SEED_REVIEWS.filter(r => {
    const conflict = typeof r.conflict === 'object' ? r.conflict : null;
    if (!conflict) return false;
    const docAId = getDocId(conflict.sourceDocumentA);
    const docBId = getDocId(conflict.sourceDocumentB);
    return docAId === doc._id || docBId === doc._id;
  });

  const docObj = {
    ...doc,
    healthState: calculateDocumentHealthState(doc, SEED_CONFLICTS, SEED_REVIEWS),
  };

  return { document: docObj, conflicts, reviews };
}

/**
 * Fetch Conflicts List
 */
export async function getConflicts(params?: {
  severity?: Severity | 'ALL';
  type?: ConflictType | 'ALL';
  status?: ConflictStatus | 'ALL';
}): Promise<ContentConflict[]> {
  const { severity, type, status } = params || {};

  if (isSanityConfigured()) {
    try {
      let filterStr = `_type == "contentConflict"`;
      if (severity && severity !== 'ALL') filterStr += ` && severity == "${severity}"`;
      if (type && type !== 'ALL') filterStr += ` && conflictType == "${type}"`;
      if (status && status !== 'ALL') filterStr += ` && status == "${status}"`;

      const query = `*[${filterStr}] | order(createdAt desc){
        ...,
        sourceDocumentA->,
        sourceDocumentB->
      }`;
      const conflicts = await sanityClient.fetch(query);
      if (conflicts && conflicts.length > 0) return conflicts;
    } catch (err) {
      console.warn('Sanity conflicts query failed:', err);
    }
  }

  let filtered = [...SEED_CONFLICTS];
  if (severity && severity !== 'ALL') {
    filtered = filtered.filter(c => c.severity === severity);
  }
  if (type && type !== 'ALL') {
    filtered = filtered.filter(c => c.conflictType === type);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(c => c.status === status);
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Fetch Single Conflict by ID
 */
export async function getConflictById(id: string): Promise<ContentConflict | null> {
  if (isSanityConfigured()) {
    try {
      const query = `*[_type == "contentConflict" && _id == $id][0]{
        ...,
        sourceDocumentA->,
        sourceDocumentB->
      }`;
      const conflict = await sanityClient.fetch(query, { id });
      if (conflict) return conflict;
    } catch (err) {
      console.warn('Sanity conflict lookup failed:', err);
    }
  }

  return SEED_CONFLICTS.find(c => c._id === id) || null;
}

/**
 * Fetch Reviews List
 */
export async function getReviews(params?: {
  status?: ReviewStatus | 'ALL';
}): Promise<Review[]> {
  const { status } = params || {};

  if (isSanityConfigured()) {
    try {
      let filterStr = `_type == "review"`;
      if (status && status !== 'ALL') filterStr += ` && status == "${status}"`;

      const query = `*[${filterStr}] | order(createdAt desc){
        ...,
        conflict->{
          ...,
          sourceDocumentA->,
          sourceDocumentB->
        }
      }`;
      const reviews = await sanityClient.fetch(query);
      if (reviews && reviews.length > 0) return reviews;
    } catch (err) {
      console.warn('Sanity reviews query failed:', err);
    }
  }

  let filtered = [...SEED_REVIEWS];
  if (status && status !== 'ALL') {
    filtered = filtered.filter(r => r.status === status);
  }

  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Persist AI-detected conflicts to Sanity (or fallback dataset) with basic deduplication
 */
export async function saveDetectedConflicts(issues: AIIssue[]): Promise<number> {
  if (!issues || issues.length === 0) return 0;

  let savedCount = 0;

  for (const issue of issues) {
    const docAId = issue.sourceDocumentIds[0] || '';
    const docBId = issue.sourceDocumentIds[1] || docAId;

    if (!docAId) continue;

    const isSanity = isSanityConfigured();
    let existingConflict: ContentConflict | null = null;

    if (isSanity) {
      try {
        const query = `*[_type == "contentConflict" && ((sourceDocumentA._ref == $docA && sourceDocumentB._ref == $docB) || (sourceDocumentA._ref == $docB && sourceDocumentB._ref == $docA)) && (conflictType == $type || title == $title)][0]`;
        existingConflict = await sanityClient.fetch(query, {
          docA: docAId,
          docB: docBId,
          type: issue.type,
          title: issue.title,
        });
      } catch (err) {
        console.warn('Deduplication fetch failed:', err);
      }
    } else {
      existingConflict = SEED_CONFLICTS.find(c => {
        const a = getDocId(c.sourceDocumentA);
        const b = getDocId(c.sourceDocumentB);
        const matchDocs = (a === docAId && b === docBId) || (a === docBId && b === docAId);
        return matchDocs && (c.conflictType === issue.type || c.title === issue.title);
      }) || null;
    }

    if (existingConflict) {
      console.log(`ℹ️ Conflict already exists for "${issue.title}". Skipping duplicate creation.`);
      continue;
    }

    // Create new conflict record
    const conflictId = `conflict-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docAObj = SEED_DOCUMENTS.find(d => d._id === docAId) || { _id: docAId, title: 'Document A', slug: { current: 'doc-a' }, body: '', category: 'API', version: 'v1.0', status: 'published', updatedAt: new Date().toISOString() };
    const docBObj = SEED_DOCUMENTS.find(d => d._id === docBId) || { _id: docBId, title: 'Document B', slug: { current: 'doc-b' }, body: '', category: 'API', version: 'v1.0', status: 'published', updatedAt: new Date().toISOString() };

    const newConflict: any = {
      _id: conflictId,
      _type: 'contentConflict',
      title: issue.title,
      sourceDocumentA: docAObj,
      sourceDocumentB: docBObj,
      conflictType: issue.type,
      aiAnalysis: issue.explanation,
      severity: issue.severity,
      status: 'detected',
      createdAt: new Date().toISOString(),
    };

    if (isSanity && process.env.SANITY_API_WRITE_TOKEN) {
      try {
        await sanityClient.create({
          _id: conflictId,
          _type: 'contentConflict',
          title: issue.title,
          sourceDocumentA: { _type: 'reference', _ref: docAId },
          sourceDocumentB: { _type: 'reference', _ref: docBId },
          conflictType: issue.type,
          aiAnalysis: issue.explanation,
          severity: issue.severity,
          status: 'detected',
          createdAt: new Date().toISOString(),
        });
        savedCount++;
      } catch (err) {
        console.warn('Sanity conflict creation failed:', err);
        SEED_CONFLICTS.unshift(newConflict);
        savedCount++;
      }
    } else {
      SEED_CONFLICTS.unshift(newConflict);
      savedCount++;
    }
  }

  return savedCount;
}

/**
 * Perform server-side review status mutation and sync associated conflict state
 */
export async function updateReviewWorkflow(params: {
  reviewId: string;
  action: 'approve' | 'reject' | 'investigate';
  reviewer: string;
  comment: string;
}): Promise<{ review: Review; conflictStatus: ConflictStatus }> {
  const { reviewId, action, reviewer, comment } = params;

  let reviewStatus: ReviewStatus = 'pending';
  let conflictStatus: ConflictStatus = 'review';

  if (action === 'approve') {
    reviewStatus = 'approved';
    conflictStatus = 'resolved';
  } else if (action === 'reject') {
    reviewStatus = 'rejected';
    conflictStatus = 'rejected';
  } else if (action === 'investigate') {
    reviewStatus = 'needs-investigation';
    conflictStatus = 'review';
  }

  const resolvedAt = action !== 'investigate' ? new Date().toISOString() : undefined;
  const isSanity = isSanityConfigured();

  let targetReview: Review | null = null;
  let conflictId: string | null = null;

  if (isSanity) {
    try {
      const query = `*[_type == "review" && _id == $id][0]{ ..., conflict-> }`;
      targetReview = await sanityClient.fetch(query, { id: reviewId });
      if (targetReview) {
        conflictId = typeof targetReview.conflict === 'object' ? targetReview.conflict._id : (targetReview.conflict as any);
      }
    } catch (err) {
      console.warn('Sanity review lookup failed:', err);
    }
  }

  if (!targetReview) {
    targetReview = SEED_REVIEWS.find(r => r._id === reviewId) || null;
    if (targetReview) {
      conflictId = typeof targetReview.conflict === 'object' ? targetReview.conflict._id : (targetReview.conflict as any);
    }
  }

  if (!targetReview) {
    throw new Error(`Review record with ID "${reviewId}" not found.`);
  }

  // Execute Sanity Mutation if write token available
  if (isSanity && process.env.SANITY_API_WRITE_TOKEN) {
    try {
      await sanityClient
        .patch(reviewId)
        .set({
          status: reviewStatus,
          reviewer,
          comment,
          ...(resolvedAt ? { resolvedAt } : {}),
        })
        .commit();

      if (conflictId) {
        await sanityClient
          .patch(conflictId)
          .set({ status: conflictStatus })
          .commit();
      }
    } catch (err) {
      console.warn('Sanity mutation failed, falling back to memory state update:', err);
    }
  }

  // Update in-memory seed dataset for dev/fallback mode
  targetReview.status = reviewStatus;
  targetReview.reviewer = reviewer;
  targetReview.comment = comment;
  if (resolvedAt) targetReview.resolvedAt = resolvedAt;

  if (conflictId) {
    const conflictObj = SEED_CONFLICTS.find(c => c._id === conflictId);
    if (conflictObj) {
      conflictObj.status = conflictStatus;
    }
    if (typeof targetReview.conflict === 'object' && targetReview.conflict) {
      targetReview.conflict.status = conflictStatus;
    }
  }

  return { review: targetReview, conflictStatus };
}


