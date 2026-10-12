# Interface System B5 — Exam Prep and Exam Experience Migration

**Status:** live in production via PR #121  
**Current learner authority:** `20-brand-and-experience/Learner Design System.md` §20 and `20-brand-and-experience/Product UX Principles.md`
**Original B5 authority (historical):** `20-brand-and-experience/Visual Brand System.md` v1.0 and `Product UX Principles.md` v0.4  
**Depends on:** B4 Learn/Practice live via PR #119  
**Canonical signed-in runtime (current):** `/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` → `CourseExperienceScreen` → `ExamPrepSection` → `ExamPrepPage` or the focused `ExamSimulator`
**Original B5 runtime (historical):** `PlannerRuntime` → compatibility `App` → contextual Exam Prep → `ExamSimulator`

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
## Learner design reconciliation after PR #589 — proposed Exam package (10 October 2026, unmerged)

**Current implementation owner:** `PlannerRuntime → CourseExperienceScreen → ExamPrepSection → ExamPrepPage` for the learner course-page preparation state. The B5 record's historical compatibility-`App` path remains true of the original migration, but does not describe the current canonical signed-in learner route.

**Focused exam boundary:** The old `PracticeDialog` wrapper was still a live modal parent for a timed `ExamSimulator`, even though `ExamSimulator` already owns a dedicated full-viewport `exam-session-page`. Remove this duplicate Practice-owned modal and its transitional `exam-v2.css` styles. Keep preparation and choice on `ExamPrepPage` inside the normal learner shell, untimed mock question practice in a page-level `exam-prep-activity`, and the timed full-paper session in the one existing dedicated full-viewport simulator. Existing in-progress answer/timer/pause/stop/marking/persistence logic stays in `ExamSimulator`, including explicit stop confirmation; after deliberate discard, return to Exam Prep with keyboard focus restored to the initiating control.

**Visual implementation:** `ui/exam/exam-prep.css` and `exam-v2.css` migrate all direct `--rv-*` reads to canonical theme, action, learning/functional status, typography, shape and focus roles. The focused exam top bar uses the neutral Graphite performance role rather than REV-only Deep Teal. Shared interruption modals for Pause and Stop remain live and preserve the governed focus, timer and obscuring behaviour. The canonical Exam Prep guide retains paper choice, AOs, commands, exam guidance and mock availability.

**Documentation impact:** This is implementation alignment to already approved `20-brand-and-experience/Learner Design System.md` §20 and governing Core Journeys/Course Placement, so no new normative decision or ADR is needed. This B5 record and the implementation reconciliation document change in the same PR. Existing B5 production evidence is preserved as historical.

**Assurance boundary:** Only directly affected Exam Prep modal-structure tests are updated; timed controls, pause/resume/stop, navigation, scoring, marking, security, accessibility and response persistence tests remain. The four changed tablet Exam Prep/timed-exam baselines were held fail-closed until the Founder approved the reviewed CI #2948 Light/Dark captures on 10 October 2026. Subsequent visual drift must continue to fail closed; visual approval did not authorise a merge.

The dedicated timed-paper viewport overlays all learner navigation, including the phone dock (which has a higher stacking layer than the old B5 default). Explicit Stop discards the attempt and returns to Exam Prep; the results-screen 'Start another attempt' button continues to use the simulator's prior reset-to-launch contract, not an implicit navigation away. No marking, timer, evidence or persistence contract is altered.

The timed `exam-session-page` now toggles a scoped `planner-runtime--exam-focus` state: global Sidebar/Rail/TabBar, mobile top bar and contextual Ask REV access are hidden from both view and the accessibility tree during writing/self-marking. The focus region receives keyboard focus when starting a full paper. Global navigation returns automatically when the attempt is explicitly stopped or the completed result is displayed. These are presentation/focus changes, not a new exam timer or evidence engine.

### Focused Exam browser assurance correction (PR #591)

CI #2947 confirmed the existing Course Overview REV appearance remained unchanged. Its exam mock surface check, however, still compared against the old `--rv-surface` role, and both the Course Overview and site-wide theme journeys expected the retired mock dialog. Those two browser contracts now check the canonical `--color-surface` and the named full-viewport exam region, including explicit Stop confirmation and return to the course page. The new untimed test chooses a legitimately enabled, published mock, respecting the deliberately disabled untimed path for restricted pilot papers. The four tablet Exam Prep and timed-exam screenshot digests remained fail closed during CI #2948, pending Founder visual approval; after that approval they were pinned to the exact reviewed captures, without widening the 18-state B7 visual matrix.

### PR #591 visual-baseline approval — 10 October 2026 (not merge approval)

The Founder reviewed the four tablet (820px) Exam Prep and focused timed Exam Simulator screenshots from CI #2948, Light and Dark, and replied “Approve PR #591” to the explicitly scoped request “Approve PR #591 Exam visual baselines”. These four, and only these four, existing B7 SHA-256 screenshot baselines are updated to the exact approved captured bytes. Source: run `38042624110`, commit `8b2cb15eb78c8d319ebd398cdb714f89aeda53c4`, retained artifact `interface-visual-regression-38042624110` (ID `11666565708`). Each screenshot reproduced the same hash on the initial attempt and retry. Of 437 executed browser tests, 433 passed and only these four intentionally unapproved screenshots failed before pinning; unit tests, typecheck, lint, build, DB/RLS and security passed.

The original 18-state visual contract remains intact, with 14 unrelated baselines untouched. Approval authorises pinning these four screenshots **only**. Fresh exact-head CI, main refresh and separate explicit Founder merge approval for PR #591 remain required. No design authority or marking/timer/evidence contract changes are introduced by the baseline pinning itself.
