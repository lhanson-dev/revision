# React Cutover Parity Audit

**Status:** product parity closed; production deployment correction pending  
**Date:** 2026-08-17  
**Decision:** **NO-GO for legacy deletion until the Vite build is deployed and production smoke passes**

## Purpose

This audit compares the current production legacy learner runtime with the governed React `/app/` implementation before any cutover or deletion.

Parity does **not** mean copying every legacy implementation detail. A legacy behaviour may be superseded where current product/evidence authority deliberately requires a safer or more truthful model. The cutover test is whether every material learner capability has either:

1. an equivalent or better React journey; or
2. an explicit governed disposition explaining why it should not carry forward.

## Founder decisions recorded 2026-08-17

The following points are not cutover blockers:

- **Subject Catalogue / My Revision:** future product scope, not required for the first production cutover. The current single available Business Paper 2 module may be presented directly in My Revision for now. Catalogue architecture remains extensible through content manifests.
- **Legacy learner progress:** no migration or continuity requirement. The existing prototype is not materially used, so the production React experience may start from structured evidence collected in the new system. Do not manufacture new readiness evidence from legacy aggregate state.
- **Reset progress:** remove from the production learner product. Ordinary learning controls must not destructively reset evidence. Any future account/data deletion capability belongs in a separate privacy/data-rights journey, not in revision practice.
- **Mixed diagnostic and adaptive ordering:** useful future capabilities, but not required for the first cutover once a truthful evidence-based next action is present.

## Product parity status

The React learner implementation now covers the material first-cutover learner capabilities:

| Capability | React state | Audit conclusion |
|---|---|---|
| Authentication/session | Supabase | PASS |
| Multi-device shell | Responsive phone/tablet/desktop | PASS |
| Topic learning notes | Shared typed content pack | PASS |
| Flashcard recall | Structured scored evidence | PASS |
| Topic linking | Shared topic-link chains | PASS |
| Formula recall/data drills | Shared formulas and data drills | PASS |
| Topic quick checks | Structured MCQ evidence | PASS |
| Guided case-study practice | NorthPeak case study | PASS |
| Answer / exam-technique teaching | BLT, MOPS, calculations, case application, analyse and evaluate/assess | PASS |
| Evidence-driven next step | Deterministic topic/activity recommendation with evidence summary and confidence limitation | PASS |
| Exam-question writing | Harbour Home questions with AO self-assessment | PASS |
| Full Paper 2 simulation | 90 minutes / 80 marks / all eight Harbour Home questions | PASS |
| Results | Overall mark, percentage and AO1–AO4 breakdown | PASS |
| Recent Activity | Immediate factual evidence history | PASS |
| Readiness | Evidence-threshold model with confidence | PASS |
| Cloud evidence sync | Supabase `learning_evidence` | PASS in implementation; live production smoke still required |
| Save failure behaviour | Does not advance/clear work falsely | PASS |
| Self-marking transparency | Explicitly self-assessed; high confidence blocked without independent marking | PASS |

## Production gate finding — 2026-08-17

The first production-smoke attempt found that GitHub Pages was configured in legacy branch/Jekyll mode and publishing the raw repository tree. The Pages deployment itself could report success while `/app/index.html` still referenced `/src/main.tsx` rather than the Vite-built JavaScript bundle.

That is not an acceptable production deployment for the React app. A green CI build does not prove that production is serving the build artifact.

The first Pages run for merge `aa9d41f4cb5799218594ff5c716d7324bbd2f04d` also hit an external GitHub Pages 503 during deployment creation. Re-running the failed deployment succeeded, confirming that failure was transient infrastructure rather than Revision build failure. The more important product finding remains: the legacy Pages source publishes raw source rather than `dist/`.

### Required deployment correction

Before production smoke can be considered valid:

- Pages must be configured for GitHub Actions/custom workflow publishing.
- The production workflow must run `npm ci` and `npm run build`.
- Only the prepared `dist/` artifact should be deployed as the Pages artifact.
- During migration, the existing root `index.html` and legacy `subjects/` routes should be copied into `dist/` so fixing deployment does not silently perform cutover.
- Post-deploy smoke must prove `/app/` references a built `/revision/assets/*.js` file and does not reference `/src/main.tsx`.

## Explicitly non-blocking / retired behaviours

### Subject Catalogue / My Revision selection

**Disposition:** FUTURE SCOPE. Not required for first cutover. Keep the architecture content-pack driven so catalogue/add-remove journeys can be introduced when multiple subjects/papers exist.

### Legacy progress continuity

**Disposition:** RETIRE WITHOUT MIGRATION. The prototype is not materially used. The React evidence model starts clean. Existing legacy aggregate state must not be converted into fabricated structured evidence.

### Reset progress

**Disposition:** REMOVE. There will be no learner-facing `Reset progress` control in the production revision experience. Append-only evidence remains the learning record. A future privacy/data-deletion feature, if required, is a separate account/data-rights capability.

### Legacy readiness percentage

**Disposition:** RETIRE. Do not reproduce. The React evidence-threshold readiness + confidence model is the approved replacement.

### Exact legacy page/navigation implementation

**Disposition:** RETIRE after functional cutover. React does not need visual or code-structure parity.

### Legacy mind-map visual structure

**Disposition:** REPLACED by `Link topics`. Exact spatial UI parity is not required for first cutover.

### Mixed diagnostic and adaptive ordering

**Disposition:** DEFER. Useful future enhancement, but not required for first cutover once a truthful evidence-driven next-step recommendation exists.

## Browser assurance

CI runs Playwright against the production React build in Chromium using three representative viewports:

- phone: 390 × 844;
- tablet: 820 × 1180;
- desktop: 1440 × 900.

Checks cover sign-in, the authenticated Hub with a synthetic browser session, recommendations, Answer mode, learning/practice modes, progress surfaces, timed exam launch and horizontal-overflow protection. CI browser tests intercept evidence reads and do not write test evidence to live Supabase.

## Live Supabase smoke preflight

At the start of production smoke the database contained two existing Auth users and both were marked `is_test_user = false`. `learning_evidence` contained zero rows. Therefore neither existing user may be repurposed for smoke testing.

A marked synthetic account is still required for the final live persistence/RLS smoke. Do not contaminate real learner records merely to satisfy the gate.

## Cutover decision

**NO-GO for legacy deletion. Product parity is closed, but production deployment and live-data verification remain gates.**

Required sequence:

1. Merge the Vite Pages deployment correction after CI and Founder approval.
2. Configure the repository Pages source for GitHub Actions/custom workflow publishing.
3. Deploy the exact Vite `dist/` artifact from `main` and pass the HTTP artifact smoke.
4. Create/use a marked synthetic test account and verify real live evidence INSERT + SELECT plus RLS isolation without touching live-user data.
5. Exercise the deployed core learner journey.
6. If smoke passes, create a separate cutover PR that removes legacy learner runtime files and removes/replaces legacy learner links.
7. Re-run full CI and production smoke after cutover deployment.
8. Founder approval remains required for the deletion/cutover PR.

## Deletion candidates once the gate is satisfied

The historical implementation remains recoverable in Git history. Subject to final smoke and cutover review, the legacy learner runtime candidates remain:

```text
subjects/business/index.html
subjects/business/aqa-as/paper-2/
  index.html
  styles.css
  data-core.js
  data-recall.js
  data-test.js
  app-core.js
  app-test.js
  auth-sync.js
  v2.js
  feedback-v3.js
```

No files in this list are deleted by the deployment-correction PR.
