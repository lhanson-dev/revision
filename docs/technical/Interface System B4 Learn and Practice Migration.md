# Interface System B4 — Learn and Practice Migration

**Status:** in progress on governed B4 branch  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Depends on:** B3 Subjects/course migration live via PR #118  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → compatibility `App` → `FocusedLearningWorkspace`

## Purpose

Migrate the canonical Learn and Practice working experience onto the approved Revision Interface System while preserving educational content, evidence generation, readiness calculation, persistence and routing behaviour.

B4 is specifically about the quality and hierarchy of focused learner work: the learner should see the current explanation, question or task as the dominant object; activity choice and supporting detail remain available without competing with the work; answers and feedback appear progressively when they become useful.

## Scope

B4 covers the Interface System presentation for `FocusedLearningWorkspace` where it serves Learn and Practice, including:

- workspace heading and topic selection;
- Learn topic-note and topic-link reading surfaces;
- Practice activity selection;
- flashcard prompt, reveal and self-rating states;
- quick-check option, answer and feedback states;
- case-study reading, draft and guidance states;
- formula/data reveal-and-check states;
- written-practice answer fields and feedback primitives shared by the workspace;
- recommendation and next-step hierarchy already rendered by the workspace;
- saving, error and disabled states;
- light/dark parity;
- phone/tablet/desktop responsive behaviour;
- keyboard-visible focus treatment; and
- reduced-motion behaviour.

B4 does **not** change question content, evidence weighting, readiness logic, recommendation logic, entitlement rules, storage contracts or navigation semantics.

## Focused-work hierarchy

The approved Brand System distinguishes Learn and Practice rather than forcing them into a common dashboard layout.

### Learn

Learn prioritises sustained reading, explanation and connection of ideas. The B4 migration therefore:

- uses a constrained reading width;
- presents topic sections in a calm single-column hierarchy rather than a dense two-column card grid;
- keeps the topic selector available without making configuration the main event; and
- retains next-step guidance after the learning content.

### Practice

Practice prioritises the current task, prompt and feedback. The B4 migration therefore:

- gives the active task the dominant content width and visual hierarchy;
- treats activity choice as a secondary segmented-style control;
- keeps selectable answers large, readable and keyboard/touch usable;
- reveals answers, model answers, marking guidance and result explanation only after the learner asks or submits; and
- uses semantic success/error/information roles for feedback rather than local green/red palettes.

## Existing progressive-disclosure behaviour retained

`FocusedLearningWorkspace.tsx` already contains the required state transitions. B4 deliberately preserves them rather than rebuilding the component merely for visual migration:

- flashcard prompt → Show answer → self-rating;
- quick check → select answer → Check answer → explanation → next question;
- case response → Compare with guidance → improvement guidance → next question;
- formula/data prompt → reveal → next item;
- written exam practice → draft → marking guidance → self-assessment/result where applicable.

The migration styles those states consistently but does not change when evidence is recorded or what the resulting evidence means.

## Implementation

`src/app/interface-learn-practice.css` is the dedicated B4 migration layer. It loads after the legacy styles and prior Interface System migration layers so the canonical focused workspace receives the governed semantic grammar without prematurely deleting compatibility CSS needed by other live surfaces.

The layer:

- contains no local hex, RGB or RGBA palette values;
- consumes semantic light/dark colour roles from `brand-tokens.css`;
- consumes approved typography, spacing, radius, control, focus and motion roles;
- uses semantic status roles for correct, incorrect and recorded-result treatments;
- preserves visible text/markup alongside colour feedback;
- provides responsive changes at constrained tablet/mobile widths; and
- removes non-essential transitions under reduced-motion preferences.

## B5 boundary

`FocusedLearningWorkspace` also contains an exam-technique mode used by Exam Prep. Because some descendant classes are shared, B4 may translate their generic typography, controls and surfaces onto central tokens.

That does **not** declare Exam Prep complete. B5 retains ownership of:

- the Exam/Performance surface family;
- dedicated exam-session presentation;
- timed work;
- pause/stop flows;
- paper-level performance interactions; and
- the final governed Exam Prep visual hierarchy.

This boundary prevents B4 from accidentally absorbing the materially different exam-experience increment.

## Compatibility boundary

B4 does not extract `FocusedLearningWorkspace` from the current compatibility `App` route simply for structural purity. The canonical learner-facing route and component are already proven. B7 remains responsible for compatibility retirement after zero-live-consumer assurance.

A future component extraction is justified only if it materially improves ownership, testability or feature evolution; it is not required merely to make the migration look cleaner architecturally.

## Assurance required before Founder approval

B4 requires:

- typecheck;
- lint;
- unit/component tests;
- Interface System governance tests including `interface-learn-practice.css`;
- production build;
- responsive browser coverage for Learn and Practice on phone/tablet/desktop;
- light/dark verification;
- keyboard/focus/accessibility checks;
- flashcard, quick-check, case, reveal and feedback-state checks;
- regression confirmation that evidence generation and persistence semantics are unchanged; and
- current-main integration before merge.

After merge, the governed `revision/path-to-live` verification must succeed before B4 is described as live.

## Documentation impact

B4 implements already-approved Visual Brand System and Product UX Principles. It does not change normative product or experience authority, so no authority amendment or ADR is required.

Current implementation documentation and the knowledge index are updated in the same governed branch. The Interface System Component Registry is not changed because B4 introduces no new reusable component, icon source or identity asset. Historical audits, decisions and research remain unchanged.
