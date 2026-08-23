# Target System Architecture

Status: Approved target, learner cutover complete; FI-020 learner-course projection implemented on the current feature branch pending governed production release.

## Current state
Revision's governed learner product is the React application at `/app/`. Supabase Auth, structured learning evidence and adaptive-planner persistence are live. The previous static learner runtime and legacy static `subjects/` pages are retired from production.

Until a public marketing/editorial site is introduced, the repository root `/` contains only a lightweight redirect into `/app/`.

The React runtime presents the governed learner hierarchy as distinct client-side screens. Global learner destinations are Home / Plan / Progress / Courses. Ask REV is a persistent global action rather than a peer destination. Courses projects the authenticated learner's saved active courses directly; only the selected course expands its applicable Overview / Learn / Practice / Exam Prep / Progress sections.

Subject remains academic/catalogue metadata and may organise Add Course discovery, but it is not a required everyday navigation hop.

The learner shell is catalogue driven. Published content packs are discovered at build time and provide subject, qualification, paper/component and capability metadata. Stable course identities are derived from that catalogue. Persisted learner-course membership then filters the supported published catalogue into the learner's active programme.

## Target state

```text
Public browser
   |
SEO marketing/content web at /
   |
Authenticated learner product at /app/
   |
React catalogue-driven application shell
   |-- app: generic routes/screens/components, Courses and active-programme projection
   |-- engine: learning/recall/assessment/progress/recommendations/exam/planning
   |-- services: auth/course-membership/progress/platform integrations
   |
automatically discovered, versioned content packs (TypeScript + Zod validation)
   |
Published supported course catalogue
   |
authenticated learner-course membership
   |
active learner programme
   |
Supabase Auth + learner-owned programme/progress/planner data
```

## Permanent route boundary
- `/` and public content routes are reserved for the future crawlable marketing and editorial website.
- Until that website exists, `/` may redirect to `/app/`; it must not contain a competing learner runtime.
- `/app/` is the permanent authenticated learner-product boundary.
- Learner routes/screens, including Home, Plan, Progress, Courses, course/component study, assessments, exams, Ask REV and account journeys, live beneath `/app/`.
- The current GitHub Pages implementation uses hash routes beneath `/app/` for reloadable client-side learner screens because Pages does not provide a general SPA deep-route rewrite.
- Canonical learner-facing academic routes are `#/courses`, `#/courses/:courseId/:section` and, where component-specific learning genuinely applies, `#/courses/:courseId/components/:moduleId/:section`.
- Previous `#/subjects/...` hashes are compatibility inputs only. The runtime normalises compatible subject-first routes to the canonical Courses route family.
- Hash routing is a hosting implementation choice and may change without moving the permanent `/app/` boundary.
- Marketing pages may link into `/app/`, but authenticated learner application state must not be coupled to public-page rendering.
- The public marketing rendering/hosting strategy may evolve independently to support SEO, static generation or server rendering without relocating the learner product.

## Learner application hierarchy

The React application preserves the governed separation between global and contextual navigation:

```text
/app/
  Home
  Plan
  Progress
  Courses
    Saved Course / specification
      Overview
      Learn
      Practice where available
      Exam Prep where available
        Paper / component where applicable
      Progress
  Ask REV (persistent global action)
```

Academic structures vary by specification. The runtime must not hard-code every future subject into Business's numbered-paper model. Focused sections are experience sections applied where meaningful; topics/specification areas remain cross-cutting content/evidence entities.

Subject remains part of the underlying academic hierarchy and catalogue identity. The learner-facing navigation projection deliberately starts at the learner's saved course set.

## Content catalogue and learner-programme architecture

### Discovery

`src/engine/content/content-registry.ts` discovers `content/**/index.ts` entry points with Vite `import.meta.glob` during the build. Each entry point must default-export a validated `ContentPack`.

The registry validates the registration surface structurally by requiring a default pack export and rejecting duplicate manifest IDs. Content correctness remains governed by the Zod content schema and content-pack tests.

### Publication state

Only content packs with `manifest.status === 'available'` enter the supported learner catalogue. `preview` and `planned` packs remain registered content but are not addressable through learner study or Add Course.

### Generic catalogue projection

`src/app/catalogue-model.ts` projects available adapters into:

- subjects as academic/catalogue metadata;
- stable courses/specifications;
- papers/components;
- supported focused sections;
- per-module/course evidence/readiness state; and
- deterministic priority inputs.

Course identity is stable and explicit enough to persist independently of the currently rendered navigation tree.

### Learner-course membership projection

FI-020 adds persisted learner-owned programme context through `public.learner_courses` and the corresponding learner-course service.

Conceptually:

```text
available content packs
    → supported published catalogue
    → stable catalogue course IDs
    + learner_courses(user_id, course_id)
    → active learner programme
```

`src/app/learner-programme.ts` resolves saved course IDs against the current published catalogue. Unknown IDs do not silently map to another course; they are excluded from new study/recommendation actions while historical evidence remains untouched and an integrity condition can be surfaced.

The active learner programme scopes:

- Home recommendations;
- adaptive Plan candidates and assessment choice;
- global Progress aggregation;
- learner-wide REV context; and
- contextual Courses navigation.

A published course is therefore not equivalent to a learner course.

### Existing-user transition

Before FI-020, the pilot runtime treated all currently published Business courses as part of every authenticated learner's programme. The FI-020 migration performs a bounded one-time seed for users who already exist when the migration runs, using the exact two course identities exposed by that pilot runtime:

- `aqa:aqa-a-level:7132`;
- `aqa:aqa-as:7131`.

Future users and future published courses are not automatically enrolled.

### Evidence scope

Learning evidence remains independent of course membership. Membership is programme context, not mastery/readiness evidence.

Removing a course removes it from active learner-wide planning/navigation/recommendation scope but does not delete learning evidence or exam attempts. Re-adding the course can make that historical evidence relevant again subject to the normal evidence recency/confidence rules.

Shared-syllabus courses aggregate evidence across their paper/module identities at course level while preserving paper identity for paper-specific exam attempts.

## Persistence and security boundary

`public.learner_courses` stores `(user_id, course_id, created_at)` with duplicate prevention through the composite primary key. Browser roles receive only the minimum required select/insert/delete capability, and authenticated RLS restricts access to rows owned by `(select auth.uid()) = user_id`.

`public.learner_course_events` stores bounded FI-020 course-management/assurance telemetry separately from learning evidence. Learners may insert/select only their own event rows and cannot mutate historical telemetry through update/delete browser grants.

The code-driven catalogue means `course_id` is an application-level reference rather than a database foreign key to a course table. Runtime and assurance therefore validate persisted course IDs against the published catalogue.

## Path-to-live environment topology

Revision keeps one canonical source repository and one canonical integrated product state while adding two non-production review environments with different jobs:

- **Prototype** — disposable concept work derived from current `main`, using synthetic/demo data to resolve experience uncertainty before production implementation;
- **Staging** — the exact final current-main-integrated implementation candidate after required assurance, used for browser validation before Founder production approval; and
- **Production** — the live product deployed from Founder-approved `main` only.

The approved target hosting boundary is `lhanson-dev/revision` as the sole source/governance repository plus `lhanson-dev/revision-nonprod` as generated/static hosting space for Prototype and Staging only. The non-production repository must not become an independent source codebase, product authority or development branch model.

Prototype artifacts are not promoted into Staging. Once a concept is agreed, the real change is implemented in a governed PR from the then-current `main`; Staging is then rebuilt from the exact final integrated PR candidate.

The non-production hosting repository and workflows are not yet implemented. Until they are introduced by follow-on governed PRs, the existing Production deployment remains the only operational deployment path.

See `docs/technical/Path to Live Environments.md` and `decisions/ADR-0017-prototype-staging-production-path-to-live.md` for the detailed target and rationale.

## Production deployment
- GitHub Pages remains the current production host while Revision proves the product.
- `main` is the production source of truth, but Pages publishes the **built Vite artifact**, not raw TypeScript/source files from the repository tree.
- The production workflow installs dependencies, runs the production build, uploads `dist/` as the Pages artifact, then deploys that exact artifact to the `github-pages` environment.
- Vite content discovery therefore occurs as part of the same governed production build that creates the learner artifact.
- The workflow may add the lightweight root redirect to the artifact, but it must not republish the retired static learner runtime.
- Post-deploy smoke must confirm `/` points to `/app/`, `/app/` references a built `/revision/assets/*.js` asset and does not reference `/src/main.tsx`, and retired static learner routes remain unavailable.
- The repository's Pages publishing source is GitHub Actions/custom workflow rather than legacy branch/Jekyll publishing.
- Deployment success is a release gate. A green PR build without a successful production artifact deployment is not sufficient.

### Backend-readiness dependency

The frontend does not execute production Supabase migrations. A frontend release that depends on new database/server capabilities must therefore fail closed until production has them.

FI-020 advances `public.revision_release_readiness()` to contract `courses-v1`. The contract requires the existing planner/backend capabilities plus `learner_courses` and `learner_course_events`. `.github/workflows/deploy-pages.yml` expects the same contract before it builds/publishes the FI-020 frontend.

The readiness RPC remains `SECURITY INVOKER`; adding FI-020 must not reintroduce unnecessary elevated execution.

## Operational layer
GitHub Actions provides risk-based assurance, builds and deployment. A protected Admin/Operations view surfaces system health, real-user usage, learning-system health and actionable issues.

FI-020 course events and integrity handling provide bounded operational evidence for course setup. Membership telemetry is not learning evidence and must not be interpreted as educational progress.

## Migration principle
The learner runtime migration is complete. Future learner implementation work targets the canonical `/app/` React runtime. Compatibility, experimental or public routes must not be treated as alternative learner implementations.

Within the authenticated runtime, subject-first hashes are now compatibility inputs rather than the canonical learner route model. Future course-related implementation must preserve `published catalogue ≠ active learner programme` as an architectural invariant.