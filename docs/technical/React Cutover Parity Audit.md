# React Cutover Parity Audit

**Status:** current implementation audit  
**Date:** 2026-08-17  
**Decision:** **NO-GO for legacy deletion yet**

## Purpose

This audit compares the current production legacy learner runtime with the governed React `/app/` implementation before any cutover or deletion.

Parity does **not** mean copying every legacy implementation detail. A legacy behaviour may be superseded where current product/evidence authority deliberately requires a safer or more truthful model. The cutover test is whether every material learner capability has either:

1. an equivalent or better React journey; or
2. an explicit governed disposition explaining why it should not carry forward.

## Current strengths of the React implementation

The following capabilities are present in `/app/` and are suitable to carry forward:

| Capability | React state | Audit conclusion |
|---|---|---|
| Authentication/session | Implemented with Supabase | PASS |
| Multi-device shell | Responsive phone/tablet/desktop CSS | PASS, now backed by browser assurance |
| Topic learning notes | Shared typed content pack | PASS |
| Flashcard recall | Structured scored evidence | PASS for core recall; adaptive ordering gap noted below |
| Topic linking | Shared topic-link chains | PASS; purpose of legacy mind-map journey retained without needing the same visual implementation |
| Formula recall/data drills | Shared formulas and data drills | PASS |
| Topic quick checks | Structured MCQ evidence | PASS for topic practice; mixed/adaptive diagnostic gap noted below |
| Guided case-study practice | NorthPeak case study | PASS |
| Exam-question writing | Harbour Home questions with AO self-assessment | PASS |
| Full Paper 2 simulation | 90 minutes / 80 marks / all eight Harbour Home questions | PASS |
| Results | Overall mark, percentage and AO1–AO4 breakdown | PASS |
| Recent Activity | Immediate factual evidence history | PASS |
| Readiness | Evidence-threshold model with confidence | PASS and intentionally supersedes the legacy click/flashcard-weighted readiness formula |
| Cloud evidence sync | Supabase `learning_evidence` | PASS |
| Save failure behaviour | Does not advance/clear work falsely | PASS |
| Self-marking transparency | Explicitly self-assessed; high confidence blocked without independent marking | PASS |

## Material gaps before cutover

### P0 — learner catalogue / My Revision is not complete

The target learner architecture requires a Subject Catalogue and a learner-selected My Revision area:

`Browse → Subject → Qualification / Exam Board → Add paper → My Revision → Learn`

The current React Hub displays Business · AQA AS · Paper 2 directly, but it does not yet provide the governed catalogue/add/remove journey. That is acceptable during migration but not sufficient for the permanent learner shell.

**Required before cutover:** implement the shared-manifest-driven Catalogue and My Revision selection journey, even if Business Paper 2 is initially the only available pack.

### P0 — legacy progress continuity needs an explicit disposition

The legacy runtime stores learner state in `revision_progress` / legacy local state. The React readiness model uses new structured `learning_evidence`. The current React UI correctly says existing progress is preserved, but it does not convert legacy activity into new readiness evidence or otherwise surface that historical state in a meaningful learner view.

Deleting the legacy runtime before deciding this would make preserved historical progress harder for an existing learner to see.

**Required before cutover:** choose and implement one governed treatment:

- show legacy progress as labelled historical activity without treating it as new readiness evidence; or
- migrate only evidence that can be reconstructed truthfully and provenance-labelled; or
- explicitly retire the old progress representation while retaining the source data for agreed retention/history purposes.

Do **not** manufacture precise readiness evidence from old aggregate state.

### P1 — answer-blueprint teaching is missing as a dedicated React capability

The legacy product explicitly teaches BLT analysis, MOPS evaluation, calculation structure and case-study application before asking learners to write longer answers. React now gives marking guidance after writing, but there is no equivalent dedicated answer-blueprint learning journey.

**Required before cutover:** add an `Answer` / exam-technique learning mode using structured content, covering at minimum:

- case fact → because → leading to → therefore analysis chains;
- conditional judgement/evaluation;
- calculation workings + units;
- case evidence as application rather than decoration.

This should remain learning guidance, not scored evidence by itself.

### P1 — mixed diagnostic / adaptive practice is not yet equivalent

The legacy runtime has:

- a mixed 10-question diagnostic;
- a suggested session aimed at the current weakest area;
- flashcard ordering that pushes weaker cards earlier.

The current React UI provides topic quick checks and sequential flashcards, while the engine already has deterministic/evidence foundations. It does not yet expose a genuinely evidence-driven mixed diagnostic/recommendation loop.

**Required before cutover:** implement a truthful evidence-driven replacement rather than copying the legacy readiness formula. At minimum:

- mixed diagnostic selection across topics;
- recommendation of the least-supported / weakest evidenced topic;
- next activity recommendation with an explanation of the evidence used;
- flashcard/question selection may prioritise weak evidence, but must remain deterministic/testable and must not claim adaptivity that is not implemented.

### P1 — legacy reset behaviour requires disposition

The legacy runtime has a `Reset progress` action. The new evidence store is intentionally append-only from the browser. A direct equivalent reset would conflict with the new evidence model.

**Required before legacy deletion:** explicitly decide whether the learner needs:

- a new-practice-session reset only;
- an archive/hide-history function;
- a formal data-deletion journey handled separately from ordinary learning controls; or
- no learning-history reset.

Do not reintroduce browser-side destructive evidence mutation solely for parity.

## Legacy behaviours deliberately superseded

### Legacy readiness percentage

The legacy dashboard calculates topic mastery primarily from flashcard score plus answered quiz state and then averages six topics. It can display a precise readiness percentage before sufficient varied evidence exists.

**Disposition:** RETIRE. Do not reproduce. The React evidence-threshold readiness + confidence model is the approved replacement.

### Exact legacy page/navigation implementation

The sidebar/mobile-nav layout, static HTML view switching and JavaScript-global architecture are implementation details rather than product capabilities.

**Disposition:** RETIRE after functional cutover. React does not need visual or code-structure parity.

### Legacy mind-map visual structure

The learner purpose is to connect business functions and extend causal chains. React's `Link topics` activity preserves that learning purpose using structured content.

**Disposition:** REPLACED. Exact mind-map UI parity is not required unless later user testing shows the spatial treatment itself materially improves learning.

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

**NO-GO today.**

The remaining work is materially smaller than the completed migration, but deleting the legacy runtime now would knowingly remove or strand learner capabilities.

Recommended sequence:

1. Merge this assurance/audit PR once CI is green and Founder-approved.
2. Close P0 Catalogue/My Revision and legacy-progress continuity.
3. Close P1 answer blueprints and evidence-driven mixed/adaptive practice.
4. Decide reset/history disposition.
5. Extend Playwright coverage to the new closure journeys.
6. Run production smoke against the deployed `/app/` with a marked synthetic test account and verify live evidence persistence/RLS.
7. Create a separate cutover PR that removes legacy learner runtime files and redirects/links learner entry points to `/app/`.
8. Founder approval required for that deletion/cutover PR.

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
