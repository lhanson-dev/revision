# Design Acceptance Review — Increments B–G

**Companion evidence to:** `audits/2026-08-23-design-acceptance-review.md`  
**Baseline:** `main` at `1b2967e262086ba90898fb7b9a60cfa883f9dd16`  
**Status:** Review evidence; consolidate before final audit acceptance  
**Authority boundary:** evidence only; no authority amendment

This companion records the remainder of the implementation/conformance review while the primary audit file holds the scope, Increment A and initial findings. It exists to keep the in-progress draft review traceable; final disposition should be consolidated before the audit PR leaves draft.

## Increment B — Home, Plan and global Progress

### Home

**Provisional acceptance: ACCEPTABLE DIRECTION, remediation required for identity/icon consistency.**

The canonical Home is `PlannerHomeScreen`, not the compatibility `App.renderHome()` path. Its hierarchy aligns with the approved learner proposition:

1. REV presence and the question “what shall we do today?”;
2. direct Ask REV input;
3. one current recommendation with an explanation/action; and
4. a bounded Today’s plan list.

That is substantially calmer and more action-led than a dashboard of analytics. It also allows the learner to ask why a recommendation exists rather than forcing an unexplained path.

The implementation nevertheless contains local visual language:

- `REV recommends` uses a decorative `✦`;
- the recommendation’s prominent circular/halo mark contains `↗` rather than the Living E;
- send uses `↑`;
- activity tiles use `✓`, `□` and `◫`; and
- several navigation affordances use `›` / `→` text glyphs.

### DAR-010 — Home creates an alternate REV halo mark instead of using the Living E

**Type:** Brand identity / visual conformance  
**Status:** Open finding  
**Evidence:** `PlannerHomeScreen.tsx` renders `.planner-home-recommendation-mark` containing `↗`; `planner-runtime.css` gives that element a REV-style radial halo treatment. The active Brand System reserves the soft halo for REV identity/presence and defines the Living E as REV’s approved core identity.

**Risk:** a learner sees two different visual symbols representing REV: the governed Living E in `RevPresence`, and an arrow inside a halo on the recommendation card. That weakens recognition and creates an unintended secondary REV mark.

**Disposition:** either use the canonical Living E/REV asset for that recommendation presence or remove the halo/identity treatment and use an ordinary guidance affordance. Do not create a second REV symbol.

### Plan

**Provisional acceptance: STRONG.**

`PlanScreen.tsx` is the clearest example of the intended Interface System implementation. It consumes `PageHeader`, `Surface`, `Button`, `TextField`, `SelectField`, `Status`, `LoadingState` and `EmptyState` from the public UI registry. It separates:

- what matters now;
- current assessment outlook; and
- setup inputs for availability/assessments.

The copy consistently explains why data is requested and explicitly says realistic availability is not a target. Empty states explain the missing prerequisite instead of presenting a broken panel.

**Remaining design-acceptance question:** the lower setup section keeps availability and Add Assessment controls visible after setup. Rendered review should confirm that this remains calm rather than turning the lower half of Plan into a permanent configuration dashboard. This is a composition judgement, not currently a confirmed defect.

### Global Progress

**Provisional acceptance: ACCEPTABLE CURRENT COMPATIBILITY SURFACE.**

Global Progress is still compatibility markup, but `interface-plan-progress.css` deliberately translates it onto central type, spacing, surface, control and responsive roles. The page keeps the whole-programme summary separate from course/subject drill-down and recent activity.

The current subject/catalogue vocabulary is not final design authority because FI-020 changes the everyday academic destination to saved Courses. Do not optimise the subject grouping as though it were the future target structure. The eventual FI-020 implementation needs a fresh Progress acceptance check against active saved-course context.

## Increment C — academic/course surfaces

**Provisional acceptance: FUNCTIONALLY COHERENT, structurally transitional.**

Current course Overview has a sound hierarchy:

- breadcrumb/context;
- course title/description;
- sticky contextual navigation;
- one REV recommendation;
- Learn / Practice / Exam Prep / Progress section choices; and
- topic evidence overview.

The current Subject Home hop is transitional and should not be re-approved as final IA because FI-020 explicitly moves saved course selection to Courses → course Overview.

### DAR-011 — Course choice/navigation surfaces still use local letter/symbol iconography

**Type:** Icon/system conformance  
**Status:** Open finding  
**Evidence:** course Overview uses section tiles with `L`, `P`, `E` and `✓`; exam-paper expansion uses `＋`; breadcrumbs and other compatibility affordances use text-symbol chevrons. These sit alongside the controlled shared icon registry.

**Risk:** course surfaces look related through CSS but not through a single icon language; symbols depend on font rendering and make future system-wide icon changes harder.

**Disposition:** during FI-020/B7 migration, replace recurring UI symbols with controlled icon assets/components where a meaningful icon exists. Letter tiles may remain only if deliberately accepted as a course-section recognition device rather than an accidental substitute for missing icons.

## Increment D — Learn and Practice

**Provisional acceptance: STRONG UX MODEL; structural component migration remains incomplete.**

`FocusedLearningWorkspace` demonstrates several good product-design decisions:

- Learn, Practice and Exam Prep are focused sections rather than one long tool page;
- the current topic is explicit;
- activity choice is visually secondary to the working task;
- scored vs unscored activity is labelled before the learner acts;
- flashcard, quick-check, case-study, exam-question and formulas/data states disclose feedback progressively;
- result states explain meaning and next action rather than ending at a score; and
- self-assessed exam evidence is explicitly labelled as lower-confidence evidence.

The recently fixed `REV recommends` state is now explicitly assured in Dark mode and has a named semantic surface contract.

### DAR-012 — B4 focused-work markup still rebuilds common controls locally

**Type:** Design-system structural conformance  
**Status:** Open finding / B7 input  
**Evidence:** `FocusedLearningWorkspace.tsx` uses raw `button`, `select`, `textarea`, input and local class anatomy for mode tabs, primary/secondary actions and form controls. The B4 CSS translates these onto central visual roles, but the Interface System Operating Standard expects recurring controls to use the shared component family rather than a visually similar structural fork.

**Risk:** central interaction/accessibility improvements to `Button`, `SelectField`, field anatomy or shared states do not automatically propagate to focused learning activities.

**Disposition:** do not redesign the learning UX. During B7/structural migration, move genuinely shared control anatomy onto registry components while preserving the current focused composition and evidence behaviour.

### DAR-013 — Learn may be at risk of nested-surface/card density

**Type:** Design acceptance question, not yet confirmed defect  
**Status:** Requires rendered review  
**Evidence:** `.focused-workspace` is itself a bordered 20px surface; Learn then renders each `.learn-section` as another bordered 20px surface inside it. The Brand System says ordinary content should not be card-wrapped by default and Learn should be a reading workspace.

**Risk:** a long topic may feel like nested cards rather than a calm reading/explanation surface.

**Disposition:** inspect representative long Learn content in desktop/tablet/mobile. If the hierarchy feels over-contained, simplify section separation without changing content structure. Do not change solely from code inspection.

## Increment E — Exam Prep and Exam Simulator

**Provisional acceptance: STRONG BEHAVIOURAL DESIGN; one real modal-accessibility defect family remains.**

The exam experience implements the Founder-approved model correctly:

- timed exam becomes a dedicated full-viewport surface;
- persistent timer, Pause and Stop exam controls remain visible;
- Pause obscures the paper and freezes timer progression;
- Stop requires a destructive confirmation and allows continuation;
- full-paper and targeted-question paths are distinct;
- self-marking explains what the learner is doing before marks are saved; and
- results show mark derivation/AO breakdown and a next action rather than celebratory gamification.

`tests/e2e/exam-session-controls.spec.ts` specifically proves dedicated-page takeover, timer freeze on Pause, Continue, stop confirmation and discard behaviour.

### DAR-014 — Modal focus containment is missing as a shared design-system capability

**Type:** Accessibility / interaction-system defect  
**Status:** Open finding — remediation required before design acceptance  
**Affected states:** Ask REV contextual dialog, mobile navigation drawer, Exam Pause, Exam Stop confirmation; potentially future overlays using the same primitive contract.

**Evidence:**

- `PlannerRuntime` sets dialog roles/body scroll locking for the drawer and Ask REV but does not trap focus or make the underlying application inert.
- `ExamSimulator` marks the obscured exam `aria-hidden` and disables pointer interaction but does not make its focusable descendants inert or contain Tab navigation within the active interruption dialog.
- `AccountModal` independently implements a manual focus trap, proving that focus containment is currently solved inconsistently at feature level.
- the shared `ModalShell`/`DrawerShell` primitives provide ARIA roles/classes only and do not implement focus entry, containment, return or background inertness.
- current automated Axe coverage opens Ask REV and a timed exam but does not exercise keyboard focus containment in the modal/interruption states.

**Risk:** a keyboard user can potentially move focus into an obscured/inactive page while an interface claims to be modal. For the Exam pause state, that directly conflicts with the intended “cannot carry on with exam while paused” interaction contract.

**Disposition:** fix this centrally, not with another set of feature-specific traps. Define a reusable modal/drawer focus-management contract (initial focus, focus trap, Escape where allowed, return focus and inert/background blocking), migrate modal consumers, and add keyboard browser assurance for Ask REV, mobile drawer and Exam Pause/Stop.

### DAR-015 — Exam interruption uses a text play glyph instead of controlled iconography

**Type:** Icon conformance / minor polish  
**Status:** Open finding  
**Evidence:** Pause resume action uses `▶` inside the large Continue exam control. The shared icon registry currently has no play/resume icon.

**Disposition:** if the icon adds value, add a controlled `play`/`resume` icon to the registry and consume it; otherwise use the label alone. Do not retain a one-off font glyph in a prominent interaction.

## Increment F — Admin / Founder Assurance

**Provisional acceptance: STRONG OPERATIONAL HIERARCHY; component-structure debt remains.**

Admin correctly differs from the learner surface rather than forcing the same card density everywhere. Evidence from `ContentOperations`, `FounderAssurance` and `interface-admin.css` shows:

- wider 1280px operational layout;
- compact 36px Admin controls where appropriate;
- explicit Healthy / Attention needed / Unknown semantics;
- Unknown is never silently translated to Healthy;
- operational summary cards drill into details;
- detailed evidence uses first-class tables with sticky headers;
- Founder Assurance explicitly rejects a synthetic confidence score and exposes Covered / Partial / Uncovered / Unknown;
- destructive/attention semantics use governed status roles; and
- responsive layouts preserve table scrolling rather than collapsing evidence into misleading cards.

No broad Admin visual redesign is indicated by implementation evidence.

### DAR-016 — Admin B6 is visually migrated but still structurally local

**Type:** Design-system structural conformance  
**Status:** Open finding / B7 input  
**Evidence:** `ContentOperations.tsx` and `FounderAssurance.tsx` use local page headers, buttons, subnav, status badges, stat cards, forms and table markup rather than consuming much of the public React component registry. `interface-admin.css` successfully maps these to central roles, so visual consistency is stronger than structural reuse.

**Risk:** the Admin interface can diverge from shared interaction/focus/state improvements even while token checks remain green.

**Disposition:** do not force learner components where Admin genuinely needs different density. Reuse shared primitive anatomy where the job is the same (buttons, fields, statuses, icons, menus), and retain Admin-specific composition/table patterns as first-class variants where the job differs.

## Increment G — cross-site acceptance / assurance

### Current acceptance position

The current product is **not a failed design system** and does not need to be restarted. The strongest current surfaces (Plan, focused Practice flow, Exam Simulator behaviour, Admin evidence tables) already demonstrate the approved grammar well.

The design acceptance issue is that migration is uneven:

- token/theme conformance is ahead of component/identity conformance;
- Dark-mode state assurance is ahead of equivalent Light-mode breadth;
- route/state semantic assertions are ahead of composition/image regression;
- some modal behaviour is visually correct but not keyboard-modal; and
- compatibility code remains broad enough to create future drift if B7 is treated only as CSS deletion.

### Required remediation classes before final acceptance

1. **P1 — Overlay/modal keyboard contract:** DAR-014. This is the only current finding classified as a genuine interaction/accessibility defect family from implementation inspection.
2. **P2 — Canonical identity/icon consolidation:** DAR-001, DAR-002, DAR-007, DAR-010, DAR-011, DAR-015.
3. **P2 / technical design-system debt — shared component ownership:** DAR-008, DAR-009, DAR-012, DAR-016.
4. **Assurance hardening:** DAR-003 and DAR-004.
5. **Documentation/current-state correction:** DAR-006.
6. **Rendered design judgement:** DAR-013 and remaining light/dark/responsive composition checks.
7. **Known transition:** DAR-005 and FI-020 Courses implementation; do not re-approve Subjects as final IA.

Severity labels here describe design-remediation priority for the audit and must not be confused with the governed operational P0/P1/P2 defect register unless deliberately recorded there.

## Bounded visual-regression proposal

Do not screenshot every route/state. A useful first visual-regression set is approximately 15–20 canonical states chosen for high visual blast radius:

1. Sign in — Light desktop.
2. Sign in — Dark desktop.
3. Home — Light desktop with recommendation + Today plan.
4. Home — Dark desktop with recommendation + Today plan.
5. Home — mobile with Ask REV dock/drawer closed.
6. Plan — populated desktop.
7. Global Progress — populated desktop.
8. Course Overview — desktop.
9. Learn — representative long reading topic.
10. Practice — `REV recommends` visible.
11. Practice — quick-check feedback state.
12. Practice — case-study guidance state or representative complex written state.
13. Exam Prep — paper expanded.
14. Timed Exam — active desktop.
15. Timed Exam — active mobile.
16. Exam Pause overlay.
17. Exam Stop confirmation.
18. Exam result/AO breakdown.
19. Admin dashboard.
20. Founder Assurance evidence table.

For each selected state, use deterministic synthetic data, stable fonts/assets and explicit viewport/theme. Pixel/image snapshots should supplement—not replace—semantic/accessibility/behaviour tests. Review snapshot churn deliberately rather than auto-updating baselines.

## Light-mode parity proposal

Do not duplicate the full Dark-mode blacklist test mechanically. Instead add explicit computed/theme contracts for the same high-risk semantic states in both themes:

- auth card/action;
- Home recommendation/Today surface;
- Guidance/REV recommendation;
- answer/feedback/status surfaces;
- Exam performance/interruption surfaces;
- Admin status/evidence surface.

Then use the bounded screenshot set for wider composition parity.

## B7 acceptance constraint

B7 should be treated as **compatibility retirement plus ownership consolidation**, not simply deleting old CSS after a grep.

Before B7 is called complete it should prove:

- no live route/state depends on the retired compatibility source;
- surviving common controls/icons/assets are owned by the shared system rather than copied locally;
- accepted learner/Admin compositions retain their hierarchy;
- modal/focus behaviour remains correct;
- Light/Dark and responsive canonical-state regression remains green; and
- current technical docs no longer describe PR #126/theme hardening as pending.

## Documentation-impact check

These findings operationalise existing Visual Brand System, Identity Asset Usage Rules, Product UX Principles, Testing & Assurance Standard and Interface System Operating Standard. No normative authority amendment is proposed by this review evidence.

If Founder review later decides that an approved visual rule itself should change, that must be raised as an authority amendment rather than implemented as a CSS exception.
