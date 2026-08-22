# Interface System B5 — Exam Prep and Exam Experience Migration

**Status:** live in production via PR #121  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Depends on:** B4 Learn/Practice live via PR #119  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → compatibility `App` → contextual Exam Prep → `ExamSimulator`

## Production evidence

PR #121 merged to `main` as merge commit `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f` after exact-head Revision CI #707 completed successfully on `317063817d4b6585309f8a0557103aaa1658eb23` and the governed Founder approval gate reached success. Post-merge `revision/path-to-live` completed successfully on the merge commit.

B5 is therefore production-live rather than merely merged.

## Purpose

Migrate the canonical Exam Prep and Exam Simulator experience onto the approved Revision Interface System while preserving exam content, evidence semantics, self-assessment rules, persistence and established timed-session behaviour.

B5 treats exam work as a deliberately different surface family from ordinary Learn/Practice. Starting a timed paper enters a focused exam environment rather than another ordinary application card.

## Existing product behaviour preserved

The migration retained the established exam-session contract:

- contextual Exam Prep within the relevant course/paper;
- targeted one-question practice;
- full-paper timed practice;
- starting the timed paper opens a fixed full-viewport exam session;
- the timer runs only while the writing session is active;
- Pause obscures/blocks the paper and suspends the timer until Continue exam;
- Stop exam opens an `Are you sure?` confirmation before discarding the unsaved attempt;
- finished writing moves into self-marking rather than revealing marking guidance during the timed attempt;
- saved evidence remains explicitly self-assessed and confidence-limited; and
- results explain the evidence boundary and a useful next step.

B5 did not create a new Exam Simulator feature or redefine marking policy.

## Scope delivered

B5 covers:

- Exam Prep launch and paper-practice surfaces;
- full-paper launch hierarchy;
- dedicated full-viewport timed session;
- sticky exam identity / answered-count / timer controls;
- question navigation;
- source/case material disclosure;
- written-answer field presentation;
- Finish and self-mark transition presentation;
- AO self-marking controls;
- result and performance evidence presentation;
- pause interruption;
- stop-confirm interruption;
- timer warning state;
- light/dark parity;
- phone/tablet/desktop responsive behaviour;
- keyboard-visible focus treatment; and
- reduced-motion behaviour.

B5 does not change exam content, mark allocations, assessment-objective definitions, evidence confidence weighting, persistence contracts, recommendation/readiness algorithms, entitlement rules, assisted-marking policy or the canonical runtime.

## Exam / Performance visual family

The production implementation uses the Brand System's **Exam / Performance** family:

- calm semantic Deep-Teal/Graphite anchors through central theme roles;
- standard/quiet surfaces for case material and marking evidence;
- a dedicated full-page writing environment for timed sessions;
- persistent but restrained timing/status controls;
- semantic Error treatment for destructive stop and late-timer warning states;
- strong information hierarchy without gamified celebration; and
- the same component/token grammar in light and dark modes.

No exam-specific local palette, type scale, icon library or second theme was introduced.

## Pause contract

While paused:

- the timer does not decrement;
- exam content is visually obscured;
- pointer interaction is blocked;
- the interruption is modal and body scrolling is locked;
- one dominant Continue exam action is shown; and
- elapsed pause time is excluded from recorded active exam duration.

## Stop contract

Selecting Stop exam:

- pauses the running session while confirmation is open;
- obscures the exam beneath the modal interruption;
- explains that the unsaved attempt will be discarded;
- requires explicit destructive confirmation; and
- provides a prominent Continue exam recovery action.

Continuing resumes the same attempt and excludes the interruption from active elapsed time.

## Timer and completion semantics

- normal time uses the inverse semantic action surface;
- the final ten minutes use the semantic warning/error treatment represented by simulator state;
- time reaching zero ends writing and moves into self-marking;
- Pause/Stop-confirm suspend timer decrement;
- self-marking does not continue the writing timer; and
- recorded duration excludes paused interruption time and remains bounded by official paper duration.

## Compatibility boundary

The canonical Exam Prep route remains rendered through compatibility `App` inside `PlannerRuntime`. The timed `ExamSimulator` full-viewport takeover is canonical user-facing behaviour within that route, not a second application runtime.

Compatibility retirement remains B7 after zero-live-consumer assurance.

## Implementation

`src/app/interface-exam-experience.css` is the bounded B5 migration layer. It loads after B4 and legacy `exam.css` and consumes central semantic colour, typography, spacing, radius, control, focus, elevation and overlay roles.

The layer contains no local hex, RGB or RGBA palette values and preserves responsive and reduced-motion behaviour.

## Assurance completed

Final exact-head Revision CI #707 passed the governed quality suite, including typecheck, lint, unit tests, production build, responsive browser assurance, database/RLS assurance, authenticated persistence/reload, protected Edge Function authorization and database-backed browser persistence/reload.

The exact Founder approval marker and `revision/founder-approval = success` were verified before merge. Production release lineage then completed with durable `revision/path-to-live = success` on merge commit `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f`.

## Documentation impact

B5 implemented existing approved product journey and Brand/UX authority. No ADR or normative product-authority change was required because canonical runtime, persistence, evidence architecture and service boundaries remained unchanged. Historical audits/research remain unchanged.