export type DocumentStatus = 'draft' | 'published' | 'archived';

export type Category = 
  | 'API'
  | 'Authentication'
  | 'FAQ'
  | 'Tutorial'
  | 'Product'
  | 'Policy'
  | 'Developer Guide'
  | 'Release Notes';

export type ConflictType = 'contradictory' | 'outdated' | 'ambiguous';
export type Severity = 'low' | 'medium' | 'high';
export type ConflictStatus = 'detected' | 'review' | 'resolved' | 'rejected';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'needs-investigation';
export type DocumentHealthState = 'healthy' | 'conflict' | 'warning' | 'review required';

export interface KnowledgeDocument {
  _id: string;
  _type: 'knowledgeDocument';
  title: string;
  slug: { current: string };
  body: string;
  category: Category;
  version: string;
  status: DocumentStatus;
  updatedAt: string;
  healthState?: DocumentHealthState;
  _createdAt?: string;
  _updatedAt?: string;
}

export interface ContentConflict {
  _id: string;
  _type: 'contentConflict';
  title: string;
  sourceDocumentA: KnowledgeDocument;
  sourceDocumentB: KnowledgeDocument;
  conflictType: ConflictType;
  aiAnalysis: string;
  severity: Severity;
  status: ConflictStatus;
  createdAt: string;
  _createdAt?: string;
}

export interface Review {
  _id: string;
  _type: 'review';
  title: string;
  conflict: ContentConflict;
  status: ReviewStatus;
  reviewer: string;
  comment: string;
  createdAt: string;
  resolvedAt?: string;
  _createdAt?: string;
}

export interface HealthOverview {
  totalDocuments: number;
  healthyDocumentsCount: number;
  conflictingDocumentsCount: number;
  openConflictsCount: number;
  pendingReviewsCount: number;
  healthScore: number;
  consistencyScore: number;
  freshnessScore: number;
  reviewBacklogScore: number;
  sourceCoverageScore: number;
  categoryBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}

export interface SourceClaim {
  documentId: string;
  documentTitle?: string;
  claim: string;
}

export interface AIIssue {
  type: ConflictType;
  severity: Severity;
  title: string;
  explanation: string;
  sourceDocumentIds: string[];
  confidence: number;
  sourceClaims?: SourceClaim[];
  recommendation: string;
  affectedDocumentTitles?: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  documentId?: string;
  issues: AIIssue[];
  savedConflictCount: number;
  isFallbackMode?: boolean;
  message?: string;
  error?: string;
}
