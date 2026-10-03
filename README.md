# TruthLayer — AI-Powered Knowledge Health for Sanity

*This is a submission for the [Sanity Challenge, Path Two: Vibe-Code Something Strange](https://dev.to/challenges/sanity-2026-09-16)*

## What I Built

I built **TruthLayer**, an AI-powered knowledge health system that helps organizations detect contradictions and potentially outdated information across their documentation suite.

The core problem TruthLayer solves:

Organizations maintain extensive documentation across multiple domains:
* API documentation
* FAQs
* Tutorials
* Developer guides
* Security policies
* Product specifications
* Release notes

As this content evolves over time, different documents naturally drift and start making contradictory claims.

For example:

> **API Documentation**: "API requests are limited to 500 requests per minute."  
> **FAQ**: "API requests are limited to 100 requests per minute."  
> **Tutorial**: "The REST API currently has no request limit."

TruthLayer automatically detects these inconsistencies, explains the conflict using AI, and routes them into a human review workflow.

### How it works

```text
Sanity Content
      ↓
TruthLayer Custom App
      ↓
AI Analysis (POST /api/analyze)
      ↓
Conflict Detection
      ↓
Structured Conflict in Sanity
      ↓
Human Review Workflow
      ↓
Approve / Reject / Investigate
      ↓
Resolved / Rejected
```

The critical differentiator: **The AI does not automatically rewrite content or decide what is correct**.

Instead, the AI acts as an analytical detective that gathers source evidence, extracts conflicting claims, and calculates confidence scores. A human reviewer remains the final decision maker.

### What the App Includes

* **Knowledge Health Dashboard**: Deterministic health percentage (Consistency 40%, Freshness 25%, Review Backlog 20%, Source Coverage 15%).
* **Sanity-Backed Content Layer**: Structured `knowledgeDocument`, `contentConflict`, and `review` models.
* **Document Catalog**: Real-time search, category filters, status filters, and sorting by health risk.
* **AI-Powered Content Analysis**: Server-side OpenAI API integration (`POST /api/analyze`) with strict structured JSON output.
* **Contradiction Detection**: Extracts source claims, confidence scores, and affected documents.
* **Side-by-Side Source Comparison**: Visual comparison view on `/conflicts/[id]` showing Source A vs Source B claims.
* **Human Review Workflow**: Interactive `[ Approve Resolution ]`, `[ Reject ]`, and `[ Needs Investigation ]` modals with validation.
* **Custom UI Beyond Studio**: A serious developer tool built with Next.js App Router, TypeScript, and Tailwind CSS.

---

## Why Sanity?

Sanity isn't just used as a generic database for TruthLayer.

It serves as the structured content and workflow state layer.

The schema relationships:

```text
knowledgeDocument
       ↓ (referenced by)
contentConflict
       ↓ (referenced by)
review
```

Documents are explicitly connected to conflicts, and conflicts are explicitly connected to human review workflows.

This makes the relationship between the original content, the detected inconsistency, and the human decision explicit structured data in Sanity rather than transient state.

---

## A Simple Example

Suppose three documents in your Sanity backend contain:

```text
API Documentation
"API requests are limited to 500 requests per minute."

FAQ
"API requests are limited to 100 requests per minute."

Legacy Endpoint Specs
"The REST API currently has no request limit."
```

When you click **[ Analyze Document ]**, TruthLayer evaluates the target document against related records:

```text
⚠ Contradictory Claim Detected

Discrepancy in API Request Rate Limits

Source A (Standard API Rate Limits & Quotas):
"API requests are limited to 100 requests per minute..."

Source B (Production API Performance Guide):
"API requests are limited to 500 requests per minute..."

AI Analysis:
"Document A specifies a limit of 100 req/min for standard keys,
whereas Document B claims 500 req/min for production environments.
Developers integrating the API will face unpredictable throttling."

Recommendation:
"Human review required to verify if limits differ by tier or if one doc is outdated."
```

A reviewer on `/reviews` can then interactively take action:

```text
[ Approve Resolution ]    [ Reject ]    [ Needs Investigation ]
```

Approving the resolution updates the review state to `approved` and automatically marks the conflict as `resolved` in Sanity, updating the Knowledge Health dashboard in real time.

---

## Code

GitHub repository:

**[https://github.com/uttamofficial/truth-layer](https://github.com/uttamofficial/truth-layer)**

The repository contains the Next.js application, Sanity schemas, AI analysis API, review workflow, and setup instructions.

---

## Tech Stack

* **Framework**: Next.js 16 (App Router with Turbopack)
* **Language**: TypeScript
* **Styling**: Tailwind CSS v4
* **Content & Workflow Layer**: Sanity CMS (`@sanity/client`, `next-sanity`, `sanity`)
* **AI Analysis Engine**: OpenAI API (`gpt-4o-mini` with structured JSON output)
* **Iconography**: Lucide React

---

## Setup & Local Development

### 1. Clone the repository & install dependencies

```bash
git clone https://github.com/uttamofficial/truth-layer.git
cd truth-layer
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Sanity CMS Backend Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID="demo"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-03-01"
SANITY_API_READ_TOKEN="your_sanity_read_token"
SANITY_API_WRITE_TOKEN="your_sanity_write_token"

# OpenAI API Key (Server-side only)
OPENAI_API_KEY="your_openai_api_key"
```

*Note: If `OPENAI_API_KEY` or Sanity credentials are omitted, TruthLayer automatically operates in demo fallback mode loaded with 18 realistic sample records, conflicts, and reviews.*

### 3. Seed Sanity Dataset (Optional)

```bash
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
```

---

## My Build Process

I built TruthLayer using **Google Antigravity** as the AI-native development environment.

Instead of trying to generate the application in one giant prompt, I broke the build into focused, verifiable phases.

### Phase 1 — Foundation
* Initialized Next.js App Router application with TypeScript and Tailwind CSS.
* Created Sanity schemas (`knowledgeDocument`, `contentConflict`, `review`).
* Created realistic seed dataset with intentional inconsistencies (API rate limits, token expiry, upload limits, password policy).

### Phase 2 — Knowledge Health Dashboard
* Built deterministic Knowledge Health calculation engine.
* Created Metric Cards (Total Docs, Conflicts, Needs Review, Healthy Docs) and Health Breakdown progress indicators.
* Built Documents Catalog with search, status filtering, category filters, and sorting.

### Phase 3 — AI Analysis Engine
* Built server-side API route: `POST /api/analyze`.
* Integrated OpenAI API with strict JSON schema response instructions.
* Added `AnalyzeDocumentButton` component on `/documents/[id]`.
* Implemented deduplication logic in Sanity data layer to prevent duplicate conflict creation.

### Phase 4 — Human Review Workflow
* Created server-side review mutation API: `POST /api/reviews/[id]`.
* Supported `approve`, `reject` (with required reason), and `investigate` actions.
* Created interactive `ReviewActions` component with confirmation modals.
* Configured dynamic dashboard revalidation upon review resolution.

### Final Verification Results
* **TypeScript & ESLint**: 0 errors.
* **Next.js Production Build**: Compiled successfully in 1621ms via Turbopack.
* **Security Audit**: 0 secrets exposed; OpenAI API key and Sanity write tokens handled strictly server-side.
* **Route Tests**: All 6 main application routes return HTTP status **200 OK**.

---

## What's Next

* **Scheduled Knowledge Scans**: Automatic cron jobs that scan Sanity documents periodically for emerging staleness.
* **Document Dependency Graphs**: Visual graph showing cascading impacts across linked document trees.
* **Version-Aware Auditing**: Auto-archiving outdated specs when major semver releases are published.
* **External Source Sync**: Synchronizing external GitHub markdown repositories directly into Sanity `knowledgeDocument` records.
