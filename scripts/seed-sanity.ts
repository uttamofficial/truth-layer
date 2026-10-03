import { createClient } from '@sanity/client';
import { SEED_DOCUMENTS, SEED_CONFLICTS, SEED_REVIEWS } from '../src/sanity/seedData';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const token = process.env.SANITY_API_WRITE_TOKEN;

async function seed() {
  console.log('🚀 Starting TruthLayer Sanity Dataset Seeding...');

  if (!projectId || !token) {
    console.log('\n⚠️  Sanity credentials not detected in environment.');
    console.log('To seed a live Sanity project, set:');
    console.log('  export NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"');
    console.log('  export SANITY_API_WRITE_TOKEN="your_editor_write_token"\n');
    console.log('ℹ️  TruthLayer will default to using the built-in seed dataset adapter for dev testing.\n');
    return;
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-03-01',
    token,
    useCdn: false,
  });

  try {
    console.log(`📡 Connected to Sanity Project: ${projectId} [${dataset}]`);

    // 1. Seed Knowledge Documents
    console.log(`📄 Seeding ${SEED_DOCUMENTS.length} Knowledge Documents...`);
    for (const doc of SEED_DOCUMENTS) {
      await client.createOrReplace({
        _id: doc._id,
        _type: 'knowledgeDocument',
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        version: doc.version,
        status: doc.status,
        updatedAt: doc.updatedAt,
        body: doc.body,
      });
    }

    // 2. Seed Content Conflicts
    console.log(`⚠️ Seeding ${SEED_CONFLICTS.length} Content Conflicts...`);
    for (const conflict of SEED_CONFLICTS) {
      const docAId = typeof conflict.sourceDocumentA === 'string' ? conflict.sourceDocumentA : (conflict.sourceDocumentA as any)._id;
      const docBId = typeof conflict.sourceDocumentB === 'string' ? conflict.sourceDocumentB : (conflict.sourceDocumentB as any)._id;

      await client.createOrReplace({
        _id: conflict._id,
        _type: 'contentConflict',
        title: conflict.title,
        sourceDocumentA: { _type: 'reference', _ref: docAId },
        sourceDocumentB: { _type: 'reference', _ref: docBId },
        conflictType: conflict.conflictType,
        aiAnalysis: conflict.aiAnalysis,
        severity: conflict.severity,
        status: conflict.status,
        createdAt: conflict.createdAt,
      });
    }

    // 3. Seed Reviews
    console.log(`🔍 Seeding ${SEED_REVIEWS.length} Review Workflows...`);
    for (const review of SEED_REVIEWS) {
      const conflictId = typeof review.conflict === 'string' ? review.conflict : (review.conflict as any)._id;

      await client.createOrReplace({
        _id: review._id,
        _type: 'review',
        title: review.title,
        conflict: { _type: 'reference', _ref: conflictId },
        status: review.status,
        reviewer: review.reviewer,
        comment: review.comment,
        createdAt: review.createdAt,
        resolvedAt: review.resolvedAt,
      });
    }

    console.log('✅ Sanity Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
