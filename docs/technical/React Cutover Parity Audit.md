# React Cutover Parity Audit

**Status:** final product-gap implementation candidate  
**Date:** 2026-08-17  
**Decision:** **NO-GO for legacy deletion until this candidate passes CI/browser assurance and production smoke**

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

## Current strengths of the React implementation

| Capability | React state | Audit conclusion |
|---|---|---|
| Authentication/session | Implemented with Supabase | PASS |
| Multi-device shell | Responsive phone/tablet/desktop CSS | PASS, backed by browser assurance |
| Topic learning notes | Shared typed content pack | PASS |
| Flashcard recall | Structured scored evidence | PASS |
| Topic linking | Shared topic-link chains | PASS; purpose of legacy mind-map journey retained without needing the same visual implementation |
| Formula recall/data drills | Shared formulas and data drills | PASS |
| Topic quick checks | Structured MCQ evidence | PASS |
| Guided case-study practice | NorthPeak case study | PASS |
| Answer / exam-technique teaching | Shared validated technique content rendered as a dedicated React `Answer` mode | IMPLEMENTED IN CANDIDATE — CI/browser gate pending |
| Evidence-driven next step | Deterministic topic/activity recommendation with evidence summary and confidence limitation | IMPLEMENTED IN CANDIDATE — CI/browser gate pending |
| Exam-question writing | Harbour Home questions with AO self-assessment | PASS |
| Full Paper 2 simulation | 90 minutes / 80 marks / all eight Harbour Home questions | PASS |
| Results | Overall mark, percentage and AO1–AO4 breakdown | PASS |
| Recent Activity | Immediate factual evidence history | PASS |
| Readiness | Evidence-threshold model with confidence | PASS and intentionally supersedes the legacy click/flashcard-weighted readiness formula |
| Cloud evidence sync | Supabase `learning_evidence` | PASS |
| Save failure behaviour | Does not advance/clear work falsely | PASS |
| Self-marking transparency | Explicitly self-assessed; high confidence blocked without independent marking | PASS |

## Final product gaps — implementation candidate

### Answer / exam-technique teaching

The legacy learner purpose is preserved through structured, validated content rather than Business-specific React code. The Business Paper 2 pack now supplies six answer guides:

- BLT analysis: case fact → because → leading to → therefore;
- MOPS evaluation: magnitude, objective, probability, short vs long term;
- calculation questions: formula → substitute → workings → answer + unit;
- case-study application: use a case fact and explain how it changes the argument;
- analyse structure;
- evaluate / assess structure.

The React workspace exposes this as a dedicated `Answer` learning mode between linking topics and scored testing. It is explicitly labelled as learning guidance and does not create scored readiness evidence merely because it is read.

**Candidate disposition:** CLOSED subject to CI/browser assurance.

### Evidence-driven next-step recommendation

The readiness engine now produces a deterministic recommendation from structured evidence. It:

- prioritises topics without enough evidence before already-supported topics;
- distinguishes missing coverage from demonstrated weakness;
- chooses Flashcards, Quick check or Exam question to add missing/weaker evidence;
- states the evidence count/types used;
- states the topic readiness score/confidence when one is available;
- states a confidence limitation, including when the recommendation is only a coverage recommendation or written exam evidence is self-assessed.

A learner with no evidence is **not** told that the first topic is weak. The UI says it is a coverage recommendation because Revision cannot judge strength yet.

The recommendation is actionable: `Start recommended activity` switches the workspace to the recommended topic and activity.

**Candidate disposition:** CLOSED subject to CI/browser assurance.

## Explicitly non-blocking / retired behaviours

### Subject Catalogue / My Revision selection

**Disposition:** FUTURE SCOPE. Not required for first cutover. Keep the architecture content-pack driven so catalogue/add-remove journeys can be introduced when multiple subjects/papers exist.

### Legacy progress continuity

**Disposition:** RETIRE WITHOUT MIGRATION. The prototype is not materially used. The React evidence model starts clean. Existing legacy aggregate state must not be converted into fabricated structured evidence.

### Reset progress

**Disposition:** REMOVE. There will be no learner-facing `Reset progress` control in the production revision experience. Append-only evidence remains the learning record. A future privacy/data-deletion feature, if required, is a separate account/data-rights capability.

### Legacy readiness percentage

The legacy dashboard calculates topic mastery primarily from flashcard score plus answered quiz state and then averages six topics. It can display a precise readiness percentage before sufficient varied evidence exists.

**Disposition:** RETIRE. Do not reproduce. The React evidence-threshold readiness + confidence model is the approved replacement.

### Exact legacy page/navigation implementation

The sidebar/mobile-nav layout, static HTML view switching and JavaScript-global architecture are implementation details rather than product capabilities.

**Disposition:** RETIRE after functional cutover. React does not need visual or code-structure parity.

### Legacy mind-map visual structure

The learner purpose is to connect business functions and extend causal chains. React's `Link topics` activity preserves that learning purpose using structured content.

**Disposition:** REPLACED. Exact mind-map UI parity is not required unless later user testing shows the spatial treatment itself materially improves learning.

### Mixed diagnostic and adaptive ordering

**Disposition:** DEFER. Useful future enhancement, but not required for first cutover once a truthful evidence-driven next-step recommendation exists.

## Browser assurance

CI runs Playwright against the production React build in Chromium using three representative viewports:

- phone: 390 × 844, touch/mobile context;
- tablet: 820 × 1180, touch context;
- desktop: 1440 × 900.

The candidate extends those checks to cover:

- unauthenticated sign-in usability;
- synthetic authenticated Revision Hub rendering without live learner credentials;
- visible evidence-driven recommendation and its confidence limitation;
- starting the recommended activity;
- dedicated Answer mode, including BLT and MOPS guidance;
- Learn / Flashcards / Quick check / Case study / Exam question availability;
- Recent Activity and Readiness Progress availability;
- full timed exam launch and question navigation;
- ordinary page content does not introduce horizontal page scrolling.

Supabase evidence reads are intercepted in these browser tests. CI does not write synthetic browser-test evidence to the live database.

## Cutover decision

**NO-GO for deletion until the candidate is proven.** The known product-parity gaps are implemented, but deletion remains gated by evidence, not intent.

Required sequence from this candidate:

1. Pass typecheck, lint, unit/content tests, production build and all phone/tablet/desktop Playwright assurance.
2. Founder approval and merge of this product-gap PR.
3. Deploy `/app/` from `main`.
4. Run production smoke with a marked synthetic test account, including real live evidence persistence/RLS and the core learner journey.
5. If smoke passes, create a separate cutover PR that removes legacy learner runtime files and removes/replaces legacy learner links.
6. Re-run full CI and production smoke after cutover deployment.
7. Founder approval remains required for the deletion/cutover PR.

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

No files in this list are deleted by this product-gap PR.
