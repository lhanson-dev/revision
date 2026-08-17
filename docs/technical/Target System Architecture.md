# Target System Architecture

Status: Approved target pending implementation.

## Current state
Revision currently operates as a static HTML/CSS/JavaScript application with paper-specific application/content files, Supabase Auth/progress sync and browser local state.

## Target state

```text
Public browser
   |
SEO marketing/content web at /
   |
Authenticated learner product at /app/
   |
React application
   |-- app: routes/screens/components
   |-- engine: learning/recall/assessment/progress/recommendations/exam
   |-- services: auth/progress/platform integrations
   |
versioned content packs (TypeScript + Zod validation)
   |
Supabase Auth + canonical progress data
```

## Permanent route boundary
- `/` and public content routes are reserved for the future crawlable marketing and editorial website.
- `/app/` is the permanent authenticated learner-product boundary.
- Learner routes, including My Revision, catalogue, subject/paper study, assessments, exams, progress and account journeys, live beneath `/app/`.
- Marketing pages may link into `/app/`, but authenticated learner application state must not be coupled to public-page rendering.
- The public marketing rendering/hosting strategy may evolve independently to support SEO, static generation or server rendering without relocating the learner product.

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

## Migration principle
Refactor the current site directly toward this architecture while keeping the product usable between governed PRs. Do not maintain a permanent parallel V1/V2 architecture.

During migration, the legacy learner site may remain at its current routes only until React parity and production verification are complete. The `/app/` boundary must be established before cutover so the final retirement of legacy runtime code does not require a later learner-URL migration.
