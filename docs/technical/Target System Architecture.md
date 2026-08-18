# Target System Architecture

Status: Approved target, learner cutover complete.

## Current state
Revision's governed learner product is the React application at `/app/`. Supabase Auth and structured learning evidence are live. The previous static learner runtime and legacy `subjects/` routes are retired from production.

Until a public marketing/editorial site is introduced, the repository root `/` contains only a lightweight redirect into `/app/`.

The React runtime presents the governed learner hierarchy as distinct client-side screens: global Home / Subjects / Progress / REV, then Subject Home and contextual course/paper sections such as Overview / Learn / Practice / Exam Prep / Progress.

The learner shell is catalogue driven. Published content packs are discovered at build time and provide the subject, qualification, paper/component and capability metadata used to construct those screens. Shared React navigation no longer enumerates Business or Paper 2 as application-level route constants.

## Target state

```text
Public browser
   |
SEO marketing/content web at /
   |
Authenticated learner product at /app/
   |
React catalogue-driven application shell
   |-- app: generic routes/screens/components
   |-- engine: learning/recall/assessment/progress/recommendations/exam
   |-- services: auth/progress/platform integrations
   |
automatically discovered, versioned content packs (TypeScript + Zod validation)
   |
Supabase Auth + canonical progress data
```

## Permanent route boundary
- `/` and public content routes are reserved for the future crawlable marketing and editorial website.
- Until that website exists, `/` may redirect to `/app/`; it must not contain a competing learner runtime.
- `/app/` is the permanent authenticated learner-product boundary.
- Learner routes/screens, including Home, Subjects, Subject Home, course/paper study, assessments, exams, progress, REV and account journeys, live beneath `/app/`.
- The current GitHub Pages implementation uses hash routes beneath `/app/` for reloadable client-side learner screens because Pages does not provide a general SPA deep-route rewrite. Routes use catalogue identities, for example `#/subjects/:subjectId/modules/:moduleId/:section`.
- Hash routing is a hosting implementation choice and may change without moving the permanent `/app/` boundary.
- Marketing pages may link into `/app/`, but authenticated learner application state must not be coupled to public-page rendering.
- The public marketing rendering/hosting strategy may evolve independently to support SEO, static generation or server rendering without relocating the learner product.

## Learner application hierarchy

The React application preserves the governed separation between global and contextual navigation:

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

## Content catalogue architecture

### Discovery

`src/engine/content/content-registry.ts` discovers `content/**/index.ts` entry points with Vite `import.meta.glob` during the build. Each entry point must default-export a validated `ContentPack`.

The registry validates the registration surface structurally by requiring a default pack export and rejecting duplicate manifest IDs. Content correctness remains governed by the Zod content schema and content-pack tests.

### Publication state

Only content packs with `manifest.status === 'available'` enter the current learner catalogue. `preview` and `planned` packs remain registered content but are not addressable through the learner shell.

### Generic learner projection

`src/app/catalogue-model.ts` projects available adapters into:

- subjects;
- courses/specifications;
- papers/components;
- supported focused sections;
- per-module evidence/readiness state; and
- deterministic cross-module priority.

The generic route model in `src/app/navigation.ts` uses subject and module identities rather than one route union per subject/paper. Adding an ordinary content pack therefore does not require adding a new React route constant.

### Evidence scope

The current learner shell loads structured learning evidence for every available content module. Module readiness remains calculated independently using the shared readiness engine. Home/REV and global Progress can then compare or aggregate those module states without merging subject scoring models into one misleading score.

### Current pilot enrolment boundary

There is not yet a persisted learner-to-course enrolment table/service. During the current pilot, all `available` packs are treated as the authenticated learner's catalogue.

Future per-user enrolment must be implemented as a filtering layer between the published catalogue and learner projection. It must not require subject knowledge in the shared engine or a return to hard-coded React routes.

## Production deployment
- GitHub Pages remains the current production host while Revision proves the product.
- `main` is the production source of truth, but Pages publishes the **built Vite artifact**, not raw TypeScript/source files from the repository tree.
- The production workflow installs dependencies, runs the production build, uploads `dist/` as the Pages artifact, then deploys that exact artifact to the `github-pages` environment.
- Vite content discovery therefore occurs as part of the same governed production build that creates the learner artifact.
- The workflow may add the lightweight root redirect to the artifact, but it must not republish the retired static learner runtime.
- Post-deploy smoke must confirm `/` points to `/app/`, `/app/` references a built `/revision/assets/*.js` asset and does not reference `/src/main.tsx`, and retired learner routes remain unavailable.
- The repository's Pages publishing source is GitHub Actions/custom workflow rather than legacy branch/Jekyll publishing.
- Deployment success is a release gate. A green PR build without a successful production artifact deployment is not sufficient.

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

## Migration principle
The learner runtime migration is complete. Future learner implementation work targets the canonical `/app/` React runtime. Compatibility, experimental or public routes must not be treated as alternative learner implementations.
