# React Cutover Parity Audit

**Status:** current implementation audit  
**Date:** 2026-08-17  
**Decision:** **NO-GO for legacy deletion yet — two product gaps remain to close**

## Purpose

This audit compares the current production legacy learner runtime with the governed React `/app/` implementation before any cutover or deletion.

Parity does **not** mean copying every legacy implementation detail. A legacy behaviour may be superseded where current product/evidence authority deliberately requires a safer or more truthful model. The cutover test is whether every material learner capability has either:

1. an equivalent or better React journey; or
2. an explicit governed disposition explaining why it should not carry forward.

## Founder decisions recorded 2026-08-17

The following points are no longer cutover blockers:

- **Subject Catalogue / My Revision:** future product scope, not required for the first production cutover. The current single available Business Paper 2 module may be presented directly in My Revision for now. Catalogue architecture should remain extensible through content manifests.
- **Legacy learner progress:** no migration or continuity requirement. The existing prototype is not materially used, so the production React experience may start from structured evidence collected in the new system. Do not manufacture new readiness evidence from legacy aggregate state.
- **Reset progress:** remove from the production learner product. Ordinary learning controls must not destructively reset evidence. Any future account/data deletion capability belongs in a separate privacy/data-rights journey, not in revision practice.

Two areas remain for product closure before legacy deletion:

1. answer-blueprint / exam-technique teaching;
2. evidence-driven next-step recommendations.

A mixed diagnostic and adaptive ordering are useful future capabilities, but are not themselves required for the first cutover if the learner already receives a truthful evidence-based next action.

## Current strengths of the React implementation

The following capabilities are present in `/app/` and are suitable to carry forward:

| Capability | React state | Audit conclusion |
|---|---|---|
| Authentication/session | Implemented with Supabase | PASS |
| Multi-device shell | Responsive phone/tablet/desktop CSS | PASS, now backed by browser assurance |
| Topic learning notes | Shared typed content pack | PASS |
| Flashcard recall | Structured scored evidence | PASS |
| Topic linking | Shared topic-link chains | PASS; purpose of legacy mind-map journey retained without needing the same visual implementation |
| Formula recall/data drills | Shared formulas and data drills | PASS |
| Topic quick checks | Structured MCQ evidence | PASS |
| Guided case-study practice | NorthPeak case study | PASS |
| Exam-question writing | Harbour Home questions with AO self-assessment | PASS |
| Full Paper 2 simulation | 90 minutes / 80 marks / all eight Harbour Home questions | PASS |
| Results | Overall mark, percentage and AO1–AO4 breakdown | PASS |
| Recent Activity | Immediate factual evidence history | PASS |
| Readiness | Evidence-threshold model with confidence | PASS and intentionally supersedes the legacy click/flashcard-weighted readiness formula |
| Cloud evidence sync | Supabase `learning_evidence` | PASS |
| Save failure behaviour | Does not advance/clear work falsely | PASS |
| Self-marking transparency | Explicitly self-assessed; high confidence blocked without independent marking | PASS |

## Remaining material gaps before cutover

### P1 — answer-blueprint teaching needs a dedicated React capability

The legacy product explicitly teaches BLT analysis, MOPS evaluation, calculation structure and case-study application before asking learners to write longer answers. React now gives marking guidance after writing, but there is no equivalent dedicated answer-blueprint learning journey.

This is more than legacy parity: the agreed learner flow includes `Answer` between linking topics and testing, and learners should be taught the method before being judged on it.

**Required before cutover:** add an `Answer` / exam-technique learning mode using structured content, covering at minimum:

- case fact → because → leading to → therefore analysis chains;
- conditional judgement/evaluation;
- calculation workings + units;
- case evidence as application rather than decoration.

This remains learning guidance, not scored evidence by itself.

### P1 — evidence-driven next-step recommendation needs to be visible

The legacy runtime includes a mixed diagnostic, weakest-area suggestion and weaker-card ordering. Those exact mechanisms are **not** required for the first React cutover.

However, the approved Revision product principle is that evidence should tell the learner what to focus on next. The current React readiness panel explains whether enough evidence exists, but does not yet consistently turn the available topic/evidence picture into a concrete revision recommendation.

**Required before cutover:** add a truthful, deterministic recommendation such as:

- least-supported topic or weakest evidenced topic;
- recommended next activity type;
- short explanation of the evidence used and any confidence limitation.

Example: `Marketing has the weakest current evidence. Do one quick check or exam question there next. This recommendation is based on 3 scored Marketing activities versus 7–10 in your other topics.`

**Not required before first cutover:**

- a dedicated mixed 10-question diagnostic;
- adaptive flashcard ordering;
- opaque/personalised algorithms.

These can be added later if useful, provided any claimed adaptivity is deterministic/testable and evidence-based.

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

## Browser assurance introduced by this audit

CI now runs Playwright against the production React build in Chromium using three representative viewports:

- phone: 390 × 844, touch/mobile context;
- tablet: 820 × 1180, touch context;
- desktop: 1440 × 900.

The checks cover:

- unauthenticated sign-in usability;
- synthetic authenticated Revision Hub rendering without live learner credentials;
- Learn / Flashcards / Quick check / Case study / Exam question availability;
- Recent Activity and Readiness Progress availability;
- full timed exam launch and question navigation;
- ordinary page content does not introduce horizontal page scrolling.

Supabase evidence reads are intercepted in these browser tests. CI does not write synthetic browser-test evidence to the live database.

## Cutover decision

**NO-GO today, but only two product closures remain.**

Recommended sequence:

1. Merge this assurance/audit PR once CI is green and Founder-approved.
2. Add the Answer / exam-technique learning mode.
3. Add the evidence-driven next-step recommendation.
4. Extend Playwright coverage to those two closure journeys.
5. Run production smoke against the deployed `/app/` with a marked synthetic test account and verify live evidence persistence/RLS.
6. Create a separate cutover PR that removes legacy learner runtime files and redirects/links learner entry points to `/app/`.
7. Founder approval required for that deletion/cutover PR.

## Deletion candidates once the gate is satisfied

The historical implementation remains recoverable in Git history. Subject to the final cutover review, the legacy learner runtime candidates remain:

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

No files in this list are deleted by this audit PR.
