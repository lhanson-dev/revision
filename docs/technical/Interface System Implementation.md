# Revision Interface System Implementation

**Status:** B1 foundation live; B2 Plan/Progress live; B2.5 reusable component foundation live; B3 Subjects/course live; B4 Learn/Practice live; B5 Exam Prep/exam experience in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** current learner-runtime interface foundations, reusable components and bounded migration sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so new features inherit a coherent visual and interaction language instead of creating local fonts, colours, cards, buttons, modals, menus, fields, radii, shadows, icons or theme rules.

Revision may take interaction-quality cues from polished conversational products such as ChatGPT — restrained surfaces, predictable overlays, progressive disclosure, stable geometry, quiet motion and strong responsive behaviour — while retaining Revision's own Calm Teal palette, Manrope typography, Living E and learner experience principles.

Enterprise consistency is an implementation requirement. Shared foundations and reusable anatomy are central; feature composition is the flexible layer.

## Canonical runtime

The governed learner application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

B2/B2.5/B3/B4/B5 do not create a new runtime, service or persistence model.

Canonical learner-wide destinations relevant to this migration remain:

- Plan: `#/plan` → `PlannerRuntime` → `PlanScreen`;
- Progress: `#/progress` → `PlannerRuntime` → compatibility `App` → `renderGlobalProgress()`;
- Subjects: `#/subjects` → `PlannerRuntime` → compatibility `App` → `renderSubjects()`;
- Subject Home: subject route → compatibility `App` → `renderSubjectHome()`;
- Course/specification: course/module route → compatibility `App` → course/module renderer;
- contextual Learn/Practice: course/component section route → compatibility `App` → `FocusedLearningWorkspace`;
- contextual Exam Prep: course/component `exam-prep` section → compatibility `App` → `FocusedLearningWorkspace` exam-technique guidance + `ExamSimulator`;
- timed full-paper session: `ExamSimulator` state transition within the canonical Exam Prep route → fixed full-viewport `exam-session-page` takeover.

The full-viewport timed session is a focused state of the canonical learner runtime, not a second application or experimental route.

## Implementation stack

The production interface system has five explicit layers:

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Feature composition** — bounded feature/page CSS and product-specific markup/logic.

Feature CSS may own layout and genuinely feature-specific composition. It must not create a parallel design system.

## Central foundation roles

`brand-tokens.css` is the single implementation source for reusable learner-runtime roles including:

- Calm Teal and neutral foundations;
- light/dark semantic colour roles;
- semantic status roles;
- Manrope font-family role;
- approved responsive type roles from Display XL through Caption;
- radius/elevation families;
- governed 4px spacing rhythm;
- compact/standard/large control heights;
- standard field/icon-button/icon sizes and stroke role;
- motion/easing;
- overlay/focus roles; and
- REV-derived roles.

New shared components consume these roles. Migrated interface layers must not create page-local palettes or type scales.

## Shared CSS primitive contract

`interface-system.css` supplies:

- Standard, Quiet, Interactive, Feature and Floating surfaces;
- overlay surface/backdrop treatment;
- Primary, Strong, Secondary, Tertiary, Destructive, Compact and Large button rules;
- standard icon-button treatment;
- menu/menu-item grammar;
- field anatomy;
- segmented controls;
- Success/Warning/Error/Information statuses; and
- reduced-motion treatment.

Compatibility selectors remain only for still-unmigrated live consumers and are retired in B7 after zero-live-consumer assurance.

## B2.5 reusable React layer

`src/app/ui/index.ts` is the public component import boundary. The initial registry contains:

- `PageHeader`;
- `Surface`;
- `Button` / `IconButton`;
- `TextField` / `SelectField`;
- `Status`;
- `EmptyState` / `LoadingState`;
- `ModalShell` / `DrawerShell` / `PopoverShell`;
- `Menu` / `MenuItem`;
- `SegmentedControl`;
- `Icon`; and
- `BrandAsset`.

`src/app/ui/ui-components.css` owns shared component anatomy but consumes the existing token/primitive system. It contains no separate light/dark palette.

### Controlled icon source

`src/app/ui/Icon.tsx` is the single general-purpose rounded-line product icon registry established by B2.5.

The registry:

- renders inline SVG with `currentColor`;
- uses central icon sizes/stroke role;
- uses rounded caps/joins;
- keeps product icons semantically neutral until used by their containing control/content; and
- deliberately excludes the Living E because the Living E is identity, not a generic UI icon.

A missing recurring icon should be added here with assurance rather than imported ad hoc from a second library.

### Canonical runtime identity assets

`src/app/ui/BrandAsset.tsx` binds runtime use to approved assets already registered in `assets/brand/manifest.json`.

Current helper variants cover:

- primary Revision wordmark light/dark exports;
- Living E Resting light/dark exports; and
- Living E navigation light/dark exports.

Both theme sources live in the same component structure; runtime `data-theme` plus central CSS selects the visible treatment. Pages do not invent local identity artwork or local dark-mode asset rules.

### First proof consumer

`PlanScreen` is the first learner page to move from CSS-class-only primitive consumption to the reusable React registry. It uses shared PageHeader, Surface, Status, Empty/Loading, Button and Field components.

The planner calculation, reason codes, assessments, availability, persistence, activity events, labels and navigation behaviour are unchanged.

## B1 and B2 current production state

### B1 — foundation/account/overlay grammar

**Live.** Established central spacing/control/motion/overlay roles, shared primitive CSS, account workspace adoption and overlay compatibility bridge.

### B2 — Plan and Progress

**Live.** Established central responsive typography/icon roles and migrated Plan/Progress visual composition onto the governed page/surface/control/theme grammar. Production was verified on merge commit `609fc1247afa32d7d70fb32a87316dc1ce8939b7` with durable `revision/path-to-live = success`.

## B2.5 current production state

**Live.** PR #116 merged to `main` as merge commit `2369b33fa35414556096d0287100c1df8dbec8d7` after exact-head Revision CI #689 passed on `5a1e18ad39fdd9f2ee1088a63abc1475404094e0`.

B2.5 provides the reusable component/icon/asset foundation required for B3 and later migrations:

- React component registry;
- controlled icon registry;
- theme-paired canonical identity helper;
- contributor component reference;
- Plan proof adoption;
- component semantic/render tests; and
- expanded governance assurance for tokens, local palette drift, registry exports, icon rules and canonical asset references.

## B3 current production state

**Live.** PR #118 merged to `main` as merge commit `d44cdd85c1a175c1bc595527a0b50d98f90a9cee`; the post-merge `revision/path-to-live` verification completed successfully on that merge commit.

`src/app/interface-subjects-course.css` is the bounded B3 migration layer. It consumes only central semantic roles for colour, typography, spacing, radius, elevation, controls, focus and responsive behaviour while preserving catalogue, routing, evidence, content-placement and progress semantics.

Detailed implementation scope and production status are recorded in `docs/technical/Interface System B3 Subjects and Course Migration.md`.

## B4 current production state

**Live.** PR #119 merged to `main` as merge commit `41a61d3e276df8635c41f57c4e57329cc39725d7` after final exact-head Revision CI #702 passed on the mechanically refreshed branch and the governed Founder approval gate succeeded. Post-merge `revision/path-to-live` completed successfully on the merge commit.

`src/app/interface-learn-practice.css` is the bounded B4 migration layer. It establishes:

- focused reading hierarchy for Learn;
- secondary activity selection so current Practice work dominates;
- governed topic, control and field presentation;
- progressive answer/model-answer/feedback reveal treatment;
- semantic correct/incorrect/result states;
- light/dark parity;
- responsive phone/tablet/desktop composition;
- keyboard-visible focus; and
- reduced-motion handling.

The existing progressive-disclosure state machine in `FocusedLearningWorkspace.tsx` remains unchanged.

Detailed implementation scope and production evidence are recorded in `docs/technical/Interface System B4 Learn and Practice Migration.md`.

## B5 current implementation state

**In progress on governed branch.** B5 migrates the existing canonical Exam Prep and Exam Simulator experience onto the Brand System's Exam / Performance family.

Current `main` already implements the key exam-session product behaviour: full-viewport timed paper, running timer, pause with obscured paper and suspended timer, stop confirmation, self-marking after writing, confidence-limited self-assessed evidence and result explanation. B5 does not redefine those behaviours; it translates them onto central semantic roles and adds explicit assurance that they remain intact.

`src/app/interface-exam-experience.css` is the bounded B5 migration layer. It deliberately loads after legacy `exam.css` and B4 so the exam experience consumes central colour, typography, spacing, radius, control, overlay, status, focus and motion roles without deleting compatibility styling before B7.

B5 covers:

- Exam Prep launch and targeted/full-paper practice;
- dedicated full-viewport timed session;
- sticky paper identity, answered count, Pause/Stop and timer controls;
- source/case disclosure;
- question navigation and answer fields;
- self-marking and AO controls;
- performance result presentation;
- pause overlay and large Continue exam action;
- stop-confirm overlay and destructive/continue actions;
- semantic late-timer warning;
- light/dark parity;
- phone/tablet/desktop exam responsiveness;
- keyboard-visible focus; and
- reduced-motion handling.

Detailed implementation scope and interruption/timer contracts are recorded in `docs/technical/Interface System B5 Exam Prep and Exam Experience Migration.md`.

## Migration rules

A surface group is migrated only when:

1. colour, typography, border, radius, elevation, spacing, control sizing and standard motion use central roles/components;
2. new local hard-coded design values have a documented feature-specific reason;
3. interaction states include keyboard focus and do not depend on hover alone;
4. light/dark use the same semantic roles and component structure;
5. reduced motion remains valid;
6. phone/tablet/desktop preserve hierarchy;
7. recurring icons and identity assets use controlled shared sources;
8. compatibility aliases remain only for unmigrated live consumers; and
9. educational logic, evidence, entitlement and learner data contracts do not change unless separately governed.

## Bounded rollout

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live.
- **B2.5 — reusable component/icon/asset foundation:** live via PR #116.
- **B3 — Subjects, Subject Home, course/specification:** live via PR #118.
- **B4 — Learn and Practice:** live via PR #119.
- **B5 — Exam Prep / exam experience:** in progress; Exam/Performance family and governed pause/stop/timed interactions.
- **B6 — Admin:** same foundations/components at appropriate operational density.
- **B7 — compatibility retirement:** remove aliases/redundant feature CSS only after repository search and regression prove zero live dependency.

## Quality gate for future UI PRs

Every material interface PR checks:

- typography role;
- spacing rhythm;
- surface family;
- radius/elevation;
- reusable component/control;
- icon source;
- canonical asset usage where applicable;
- light/dark behaviour;
- phone/tablet/desktop behaviour;
- keyboard/focus/accessibility;
- loading/empty/error/disabled/saving states where relevant; and
- motion/reduced motion.

This is a coherence requirement, not a requirement that every page use the same composition.

## Assurance

B5 is material interface work because it changes the presentation of timed exam activity, a high-focus learner journey, but it does not change exam evidence semantics, marking policy or persistence architecture.

Required assurance includes:

- typecheck;
- lint;
- unit tests;
- interface-system governance tests including the B5 layer and current ExamSimulator interruption contract;
- production build;
- responsive Exam Prep/full-paper browser assurance across phone/tablet/desktop;
- light/dark semantic-role assurance;
- Pause → timer suspension → Continue interaction checks;
- Stop → confirmation → Continue/confirm interaction checks;
- timer-expiry → self-marking checks;
- keyboard/focus/accessibility coverage;
- regression confirmation that evidence generation/persistence semantics are unchanged; and
- production smoke/path-to-live after merge.

## Documentation impact

B5 implements existing Visual Brand System, Product UX and Core User Journey authority rather than changing normative product direction. No ADR is required because canonical runtime, routes, evidence contracts and architecture boundaries remain unchanged.

This implementation record, the B4 production-state record, the B5 migration record and `INDEX.md` are maintained with the implementation. The Interface System Component Registry requires no amendment because B5 introduces no new reusable component, icon source or identity asset. Historical audits/research remain unchanged.
