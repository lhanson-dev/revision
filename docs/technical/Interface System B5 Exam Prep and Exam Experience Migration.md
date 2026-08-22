# Interface System B5 — Exam Prep and Exam Experience Migration

**Status:** in progress on governed B5 branch  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Depends on:** B4 Learn/Practice live via PR #119  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → compatibility `App` → contextual Exam Prep → `ExamSimulator`

## Purpose

Migrate the canonical Exam Prep and Exam Simulator experience onto the approved Revision Interface System while preserving exam content, evidence semantics, self-assessment rules, persistence and established timed-session behaviour.

B5 treats exam work as a deliberately different surface family from ordinary Learn/Practice. The learner should feel that starting a timed paper enters a focused exam environment rather than opening another card inside the normal application page.

## Existing product behaviour confirmed before implementation

Current `main` already implements the core exam-session behaviours previously requested by the Founder:

- contextual Exam Prep within the relevant course/paper;
- targeted one-question practice;
- full-paper timed practice;
- starting the timed paper opens a fixed full-viewport exam session;
- the timer runs only while the writing session is active;
- Pause opens a modal interruption, obscures/blocks the paper and suspends the timer until Continue exam;
- Stop exam opens an `Are you sure?` confirmation before discarding the unsaved attempt;
- finished writing moves into self-marking rather than revealing marking guidance during the timed attempt;
- saved evidence is explicitly self-assessed and confidence-limited; and
- results explain the evidence boundary and a useful next step.

B5 therefore does not create a new Exam Simulator feature or redefine marking policy. It migrates the existing capability onto the governed Exam/Performance visual family and adds assurance that the existing interruption/timer contract remains intact.

## Scope

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
- phone/tablet/desktop responsive behaviour, including exam-oriented tablet layouts;
- keyboard-visible focus treatment; and
- reduced-motion behaviour.

B5 does **not** change:

- exam content or mark allocations;
- assessment-objective definitions;
- self-assessment confidence weighting;
- evidence persistence contracts;
- recommendation/readiness algorithms;
- entitlement rules;
- AI/assisted marking policy; or
- the canonical learner runtime.

## Exam / Performance visual family

The Brand System defines timed work, marks, paper readiness and performance evidence as the **Exam / Performance** family.

The B5 migration therefore uses:

- calm Deep-Teal/Graphite semantic anchors through central theme roles;
- standard/quiet surfaces for case material and marking evidence;
- a dedicated full-page writing environment for timed sessions;
- persistent but restrained timing/status controls;
- semantic Error treatment only for the destructive stop action and late-timer warning;
- strong information hierarchy without gamified celebration; and
- the same component/token grammar in light and dark modes.

No exam-specific local palette, type scale, icon library or second theme is introduced.

## Pause contract

Pause is an interruption state, not merely a timer toggle.

While paused:

- the timer does not decrement;
- the exam content is visually obscured;
- pointer interaction with the exam is blocked;
- the interruption is modal and body scrolling is locked;
- the learner receives one dominant Continue exam action; and
- elapsed pause time is excluded from the recorded active exam duration.

The learner must not be able to use Pause as a way to continue reading or writing while the clock is stopped.

## Stop contract

Stop exam is deliberately harder to trigger than Pause.

Selecting Stop exam:

- pauses the running session while the confirmation is open;
- obscures the exam beneath the modal interruption;
- explains that the unsaved attempt will be discarded;
- requires an explicit destructive confirmation to stop; and
- provides a prominent Continue exam recovery action.

Cancelling/continuing resumes the same attempt and excludes the confirmation interruption from active elapsed time.

## Timer and completion semantics

The timer is performance support, not engagement gamification.

- normal time uses the inverse semantic action surface;
- the final ten minutes use the semantic error/warning treatment already represented by the simulator state;
- time reaching zero ends the writing phase and moves into self-marking;
- Pause/Stop-confirm suspend timer decrement;
- self-marking does not continue the writing timer; and
- recorded duration excludes paused interruption time and remains bounded by the official paper duration.

## Compatibility boundary

The canonical Exam Prep route is still rendered through compatibility `App` inside `PlannerRuntime`. B5 does not extract the full course/paper renderer simply for structural purity.

The timed `ExamSimulator` full-viewport takeover is canonical user-facing behaviour within that route. It is not a second application runtime or an experimental route.

Compatibility retirement remains B7 after zero-live-consumer assurance.

## Implementation

`src/app/interface-exam-experience.css` is the bounded B5 migration layer. It loads after B4 and legacy `exam.css`, translating the canonical exam surfaces onto central semantic roles while leaving legacy styling available for any still-unmigrated consumers until B7.

The layer:

- contains no local hex, RGB or RGBA palette values;
- consumes semantic light/dark colour roles from `brand-tokens.css`;
- consumes approved typography, spacing, radius, control, focus, elevation and overlay roles;
- preserves the dedicated full-viewport exam-session structure;
- gives pause/stop modal interruptions governed overlay treatment;
- uses the semantic error foreground/surface for destructive confirmation and timer-warning treatment;
- maintains standard 44px minimum controls and 48px input targets where applicable;
- supports responsive mobile/tablet/desktop exam layouts; and
- disables non-essential transition behaviour under reduced-motion preferences.

## Assurance required before Founder merge approval

B5 requires:

- exact canonical route/runtime confirmation;
- typecheck;
- lint;
- unit/component tests;
- Interface System governance assurance including `interface-exam-experience.css`;
- production build;
- responsive browser assurance for Exam Prep and timed/full-paper work on phone/tablet/desktop;
- light/dark verification;
- Pause assurance proving timer suspension and obscured/blocked exam content;
- Continue assurance proving the same attempt resumes;
- Stop exam confirmation and cancellation assurance;
- timer-expiry → self-marking transition assurance;
- keyboard/focus/accessibility checks for exam controls and modal interruption states;
- persistence/evidence regression confirmation; and
- current-main integration before merge.

After merge, `revision/path-to-live` must succeed on the merge commit before B5 is described as live.

## Documentation impact

B5 implements existing approved product journey and Brand/UX authority. The existing Exam Simulator behaviour already satisfies the previously requested pause/stop/full-session product direction, so no new product authority or feature-lifecycle promotion is required for this migration.

This technical record, the Interface System implementation status, B4 production status and `INDEX.md` are updated with the governed change. No ADR is required because canonical runtime, persistence, evidence architecture and service boundaries remain unchanged. Historical audits/research are not rewritten.
