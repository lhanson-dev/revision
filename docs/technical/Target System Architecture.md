# Target System Architecture

Status: Approved target, learner cutover complete.

## Current state
Revision's governed learner product is the React application at `/app/`. Supabase Auth and structured learning evidence are live. The previous static learner runtime and legacy `subjects/` routes are retired from production.

Until a public marketing/editorial site is introduced, the repository root `/` contains only a lightweight redirect into `/app/`.

The React runtime now presents the governed learner hierarchy as distinct client-side screens: global Home / Subjects / Progress / REV, then Subject Home and contextual course/paper sections such as Overview / Learn / Practice / Exam Prep / Progress.

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
- Until that website exists, `/` may redirect to `/app/`; it must not contain a competing learner runtime.
- `/app/` is the permanent authenticated learner-product boundary.
- Learner routes/screens, including Home, Subjects, Subject Home, course/paper study, assessments, exams, progress, REV and account journeys, live beneath `/app/`.
- The current GitHub Pages implementation uses hash routes beneath `/app/` for reloadable client-side learner screens because Pages does not provide a general SPA deep-route rewrite. This is a hosting implementation choice and may change without moving the permanent `/app/` boundary.
- Marketing pages may link into `/app/`, but authenticated learner application state must not be coupled to public-page rendering.
- The public marketing rendering/hosting strategy may evolve independently to support SEO, static generation or server rendering without relocating the learner product.

## Learner application hierarchy

The React application should preserve the governed separation between global and contextual navigation:

```text
/app/
  Home
  Subjects
    Subject Home
      Course / specification
        Paper / component where applicable
          Overview
          Learn
          Practice
          Exam Prep
          Progress
  Progress
  REV
```

Academic structures vary by specification. The runtime must not hard-code every future subject into Business's numbered-paper model. Focused sections are experience sections applied where meaningful; topics/specification areas remain cross-cutting content/evidence entities.

## Production deployment
- GitHub Pages remains the current production host while Revision proves the product.
- `main` is the production source of truth, but Pages publishes the **built Vite artifact**, not raw TypeScript/source files from the repository tree.
- The production workflow installs dependencies, runs the production build, uploads `dist/` as the Pages artifact, then deploys that exact artifact to the `github-pages` environment.
- The workflow may add the lightweight root redirect to the artifact, but it must not republish the retired static learner runtime.
- Post-deploy smoke must confirm `/` points to `/app/`, `/app/` references a built `/revision/assets/*.js` asset and does not reference `/src/main.tsx`, and retired learner routes remain unavailable.
- The repository's Pages publishing source is GitHub Actions/custom workflow rather than legacy branch/Jekyll publishing.
- Deployment success is a release gate. A green PR build without a successful production artifact deployment is not sufficient.

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

## Migration principle
The learner runtime migration is complete. Future learner implementation work targets the canonical `/app/` React runtime. Compatibility, experimental or public routes must not be treated as alternative learner implementations.
