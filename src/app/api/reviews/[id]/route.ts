import { NextRequest, NextResponse } from 'next/server';
import { updateReviewWorkflow } from '@/sanity/data';

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const { id: reviewId } = await params;
    const body = await req.json();
    const { action, reviewer, comment } = body || {};

    // 1. Validate inputs
    if (!action || !['approve', 'reject', 'investigate'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing action. Must be "approve", "reject", or "investigate".' },
        { status: 400 }
      );
    }

    if (action === 'reject' && (!comment || comment.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'A rejection reason is required when rejecting a review.' },
        { status: 400 }
      );
    }

    const reviewerName = reviewer && reviewer.trim() !== '' ? reviewer.trim() : 'Human Reviewer';

    // 2. Perform Server-Side Review & Conflict Mutation
    const { review, conflictStatus } = await updateReviewWorkflow({
      reviewId,
      action: action as 'approve' | 'reject' | 'investigate',
      reviewer: reviewerName,
      comment: comment || '',
    });

    return NextResponse.json({
      success: true,
      action,
      review,
      conflictStatus,
      message: action === 'approve'
        ? `Review approved successfully. Conflict marked as resolved.`
        : action === 'reject'
        ? `Review rejected successfully. Conflict marked as rejected.`
        : `Review marked for investigation.`,
    });
  } catch (error: any) {
    console.error('API /api/reviews/[id] error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error processing review mutation.' },
      { status: 500 }
    );
  }
}
