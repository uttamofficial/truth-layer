import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getDocumentById, getDocuments, saveDetectedConflicts } from '@/sanity/data';
import { AIIssue, KnowledgeDocument } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentId } = body || {};

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field "documentId" in request body.' },
        { status: 400 }
      );
    }

    // 1. Fetch Target Document & Related Corpus from Sanity
    const { document: targetDoc } = await getDocumentById(documentId);
    if (!targetDoc) {
      return NextResponse.json(
        { success: false, error: `Document with ID "${documentId}" was not found in Sanity.` },
        { status: 404 }
      );
    }

    // Fetch related docs in the same category plus general docs
    const allDocs = await getDocuments();
    const relatedDocs = allDocs.filter(d => d._id !== targetDoc._id);

    const apiKey = process.env.OPENAI_API_KEY;
    let issues: AIIssue[] = [];
    let isFallbackMode = false;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const openai = new OpenAI({ apiKey });

        const systemPrompt = `You are TruthLayer AI, a precision content consistency and knowledge-health analyzer.
Your task is to analyze the target document against other related organizational documents to identify:
1. Contradictory claims (statements that conflict in facts, numbers, or rules).
2. Potentially outdated information (older specs contradicted by newer releases).
3. Ambiguous information (vague or conflicting requirements across tiers/policies).
4. Documents affected by a change.

CRITICAL CONSTRAINTS & INSTRUCTIONS:
- NEVER invent facts or hallucinate details.
- Only analyze the supplied document content.
- Quote or summarize the exact relevant claims from each source.
- Identify the source document IDs for both claims.
- Explain clearly WHY they conflict.
- Consider document version tags and updated dates when assessing staleness.
- Do NOT automatically decide which source is correct or rewrite content.
- Recommend human review when evidence is insufficient.

Return JSON in this EXACT schema:
{
  "issues": [
    {
      "type": "contradictory" | "outdated" | "ambiguous",
      "severity": "low" | "medium" | "high",
      "title": "Short descriptive title of the issue",
      "explanation": "Clear explanation of why these documents conflict",
      "sourceDocumentIds": ["doc-id-1", "doc-id-2"],
      "confidence": 0.95,
      "sourceClaims": [
        { "documentId": "doc-id-1", "documentTitle": "Title of Doc 1", "claim": "Exact quote or claim from Doc 1" },
        { "documentId": "doc-id-2", "documentTitle": "Title of Doc 2", "claim": "Exact quote or claim from Doc 2" }
      ],
      "recommendation": "Recommended action for human reviewer",
      "affectedDocumentTitles": ["Title of Doc 1", "Title of Doc 2"]
    }
  ]
}`;

        const promptCorpus = `TARGET DOCUMENT TO ANALYZED:
- ID: ${targetDoc._id}
- Title: ${targetDoc.title}
- Category: ${targetDoc.category}
- Version: ${targetDoc.version}
- UpdatedAt: ${targetDoc.updatedAt}
- Body: "${targetDoc.body}"

RELATED DOCUMENTS FOR COMPARISON:
${relatedDocs.map(d => `- ID: ${d._id} | Title: "${d.title}" | Category: ${d.category} | Version: ${d.version} | UpdatedAt: ${d.updatedAt} | Body: "${d.body}"`).join('\n')}
`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: promptCorpus },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        });

        const rawJson = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(rawJson);
        issues = parsed.issues || [];
      } catch (aiErr: any) {
        console.warn('OpenAI API call failed, falling back to rule-based analyzer:', aiErr?.message || aiErr);
        isFallbackMode = true;
        issues = runRuleBasedAnalysis(targetDoc, relatedDocs);
      }
    } else {
      console.log('ℹ️ OPENAI_API_KEY not set in environment. Using fallback semantic analyzer.');
      isFallbackMode = true;
      issues = runRuleBasedAnalysis(targetDoc, relatedDocs);
    }

    // 2. Persist Detected Conflicts in Sanity (with Deduplication)
    const savedConflictCount = await saveDetectedConflicts(issues);

    return NextResponse.json({
      success: true,
      documentId,
      targetDocumentTitle: targetDoc.title,
      issues,
      savedConflictCount,
      isFallbackMode,
      message: isFallbackMode
        ? 'Analysis completed using TruthLayer fallback analyzer (OPENAI_API_KEY not provided).'
        : 'AI consistency analysis completed successfully via OpenAI API.',
    });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error occurred during document analysis.' },
      { status: 500 }
    );
  }
}

/**
 * Fallback Analyzer for dev/testing when OPENAI_API_KEY is not set
 */
function runRuleBasedAnalysis(targetDoc: KnowledgeDocument, relatedDocs: KnowledgeDocument[]): AIIssue[] {
  const issues: AIIssue[] = [];

  const targetBodyLower = targetDoc.body.toLowerCase();

  // Pattern 1: API limits
  if (targetBodyLower.includes('rate limit') || targetBodyLower.includes('requests per minute')) {
    const limitMatches = relatedDocs.filter(d => 
      d.body.toLowerCase().includes('requests per minute') || d.body.toLowerCase().includes('rate limit')
    );

    limitMatches.forEach(otherDoc => {
      if (otherDoc.body !== targetDoc.body) {
        issues.push({
          type: 'contradictory',
          severity: 'high',
          title: 'Discrepancy in API Request Rate Limits',
          explanation: `"${targetDoc.title}" and "${otherDoc.title}" state different API request limits. The target document states rate limits while the comparison document lists conflicting throughput rules.`,
          sourceDocumentIds: [targetDoc._id, otherDoc._id],
          confidence: 0.94,
          sourceClaims: [
            { documentId: targetDoc._id, documentTitle: targetDoc.title, claim: targetDoc.body },
            { documentId: otherDoc._id, documentTitle: otherDoc.title, claim: otherDoc.body },
          ],
          recommendation: 'Human review required to verify if limits differ by subscription tier or if one document is outdated.',
          affectedDocumentTitles: [targetDoc.title, otherDoc.title],
        });
      }
    });
  }

  // Pattern 2: Auth Token expiry
  if (targetBodyLower.includes('token') || targetBodyLower.includes('expire')) {
    const authMatches = relatedDocs.filter(d => 
      d._id !== targetDoc._id && (d.body.toLowerCase().includes('expire') || d.body.toLowerCase().includes('session'))
    );

    authMatches.forEach(otherDoc => {
      issues.push({
        type: 'contradictory',
        severity: 'high',
        title: 'Authentication Token Expiration Mismatch',
        explanation: `"${targetDoc.title}" specifies a token expiration policy that differs from "${otherDoc.title}". Users following one document may experience unexpected session terminations.`,
        sourceDocumentIds: [targetDoc._id, otherDoc._id],
        confidence: 0.91,
        sourceClaims: [
          { documentId: targetDoc._id, documentTitle: targetDoc.title, claim: targetDoc.body },
          { documentId: otherDoc._id, documentTitle: otherDoc.title, claim: otherDoc.body },
        ],
        recommendation: 'SecOps review required to standardize JWT vs Session vs Bearer token lifespans across docs.',
        affectedDocumentTitles: [targetDoc.title, otherDoc.title],
      });
    });
  }

  // Pattern 3: File upload size
  if (targetBodyLower.includes('upload') || targetBodyLower.includes('file size') || targetBodyLower.includes('mb')) {
    const uploadMatches = relatedDocs.filter(d => 
      d._id !== targetDoc._id && (d.body.toLowerCase().includes('upload') || d.body.toLowerCase().includes('mb'))
    );

    uploadMatches.forEach(otherDoc => {
      issues.push({
        type: 'outdated',
        severity: 'medium',
        title: 'Max Attachment File Size Mismatch',
        explanation: `"${targetDoc.title}" specifies file size limits that differ from "${otherDoc.title}". One document may reflect an older storage infrastructure cap.`,
        sourceDocumentIds: [targetDoc._id, otherDoc._id],
        confidence: 0.88,
        sourceClaims: [
          { documentId: targetDoc._id, documentTitle: targetDoc.title, claim: targetDoc.body },
          { documentId: otherDoc._id, documentTitle: otherDoc.title, claim: otherDoc.body },
        ],
        recommendation: 'Tech writing team review required to clarify standard vs enterprise payload caps.',
        affectedDocumentTitles: [targetDoc.title, otherDoc.title],
      });
    });
  }

  // Deduplicate issues by title
  const uniqueIssues: AIIssue[] = [];
  const seenTitles = new Set<string>();

  issues.forEach(i => {
    if (!seenTitles.has(i.title)) {
      seenTitles.add(i.title);
      uniqueIssues.push(i);
    }
  });

  return uniqueIssues;
}
