# Target System Architecture

Status: Approved target pending implementation.

## Current state
Revision is migrating from a static HTML/CSS/JavaScript learner prototype to the governed React learner application. Supabase Auth and structured learning evidence are live; the legacy learner routes remain temporarily available until production verification and cutover are complete.

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

## Production deployment
- GitHub Pages remains the current production host while Revision proves the product.
- `main` is the production source of truth, but Pages must publish the **built Vite artifact**, not raw TypeScript/source files from the repository tree.
- The production workflow runs `npm ci` and `npm run build`, uploads `dist/` as the Pages artifact, then deploys that exact artifact to the `github-pages` environment.
- During the migration window, the workflow copies the existing root `index.html` and legacy `subjects/` routes into the artifact unchanged so deployment correction does not itself perform learner cutover.
- A post-deploy smoke must confirm `/` responds, `/app/` responds, `/app/` references a built `/revision/assets/*.js` asset and does not reference `/src/main.tsx`.
- The repository's Pages publishing source must be configured for **GitHub Actions/custom workflow**, not legacy branch/Jekyll publishing, before this workflow becomes authoritative.
- Deployment success is a release gate. A green PR build without a successful production artifact deployment is not sufficient for cutover.

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

## Migration principle
Refactor the current site directly toward this architecture while keeping the product usable between governed PRs. Do not maintain a permanent parallel V1/V2 architecture.

During migration, the legacy learner site may remain at its current routes only until React parity and production verification are complete. The `/app/` boundary must be established before cutover so the final retirement of legacy runtime code does not require a later learner-URL migration.
