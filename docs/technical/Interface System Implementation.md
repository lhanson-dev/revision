# Revision Interface System Implementation

**Status:** B1–B6 live; B7.1–B7.4 live; B7.5 final acceptance implemented on PR #148 candidate, pending exact-head assurance and Founder-approved merge  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Final B7 record:** `docs/technical/Interface System B7 Final Acceptance.md`  
**Scope:** canonical application interface foundations, reusable components and the B1–B7 migration/retirement sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so learner and Admin surfaces inherit one coherent visual and interaction language instead of creating local fonts, colours, controls, status semantics, fields, radii, shadows, icons, overlays or theme rules.

Enterprise consistency is an implementation requirement. Shared foundations and reusable anatomy are central; feature/channel composition remains flexible within governed surface families.

## Canonical runtime

The governed application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The Interface System migration does not create a second runtime, persistence model or service architecture.

Relevant destinations include Home, Plan, Progress, Courses/course, contextual Learn/Practice, contextual Exam Prep, timed full-paper sessions, REV, Account and role-gated Admin routes.

## Implementation layers

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Semantic migrated-surface layers** — Plan/Progress, Courses, Learn/Practice, Exam and Admin Interface System files.
6. **Feature/channel composition** — current shell, Home, REV, Account, course/exam and Admin layout files with named live consumers.

B7.5 removes the previous seventh layer: the final `interface-theme-integrity.css` compatibility bridge. There is no longer a catch-all stylesheet whose job is to win the cascade after feature styles.

Feature styles may own genuine composition. They must not create a parallel design system.

## Central foundation contract

`brand-tokens.css` is the implementation source for reusable roles including Calm Teal and neutral foundations, light/dark semantic colours, Success / Warning / Error / Information roles, Manrope type roles, the 4px spacing rhythm, radius/elevation families, compact/standard/large controls, standard fields/icons, focus, motion, overlays and REV-derived roles.

Migrated interface layers consume these roles instead of declaring page-local palettes or type scales.

The public React registry under `src/app/ui/` supplies recurring structure including headers/surfaces, buttons, icon actions, text/select/textarea fields, semantic status, loading/empty states, overlay shells, menus, segmented controls, icons and canonical identity assets.

## Production migration state

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live; production verified on merge `609fc1247afa32d7d70fb32a87316dc1ce8939b7`.
- **B2.5 — reusable component/icon/asset foundation:** live via PR #116 / merge `2369b33fa35414556096d0287100c1df8dbec8d7`.
- **B3 — Courses/course migration:** live via PR #118 / merge `d44cdd85c1a175c1bc595527a0b50d98f90a9cee`.
- **B4 — Learn and Practice:** live via PR #119 / merge `41a61d3e276df8635c41f57c4e57329cc39725d7`.
- **B5 — Exam Prep / exam experience:** live via PR #121 / merge `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f`.
- **B6 — Admin:** live via PR #122 / merge `e10aed1e05ca173e8e87e75b1b3d909d4c39451d`.
- **Pre-B7 theme integrity:** historical production checkpoint; its catch-all bridge is retired by B7.5.
- **B7.1 — authentication identity ownership:** live via PR #140 / merge `e1bda1840201f125aea7dbee29e9ef247314fce6`.
- **B7.2 — learner-shell recurring icon ownership:** live via PR #142 / merge `c6994cbcaf2e7764945a8807d586dbf3f947e925`.
- **B7.3 — shared overlay/focus ownership:** live via PR #144 / merge `61222411576003c96c1954a8f6fae7e6e6898f8e`.
- **B7.4 — canonical identity and recurring glyph ownership:** live via PR #147 / merge `7ac52d0702dca1bc11e87eede36bf0159947ca39`.
- **B7.5 — final compatibility retirement / visual acceptance:** implemented on PR #148 candidate; final exact-head screenshot/CI evidence and Founder-approved merge remain required.

Issue #137 remains open until PR #148 is merged and its path-to-live succeeds.

## B7 shared overlay/focus contract

B7.3 moved modal/drawer keyboard and focus ownership into `src/app/ui/overlays.tsx` rather than allowing each feature to build a partial contract.

`ModalShell` and `DrawerShell` centrally own initial focus, Tab containment, focus redirection, background `inert` isolation, body scroll locking, governed Escape dismissal, focus restoration and active-dialog stacking.

Migrated consumers are contextual Ask REV, mobile learner navigation, Account settings and ExamSimulator Pause/Stop interruption dialogs.

## B7 identity, icon and recurring control ownership

B7.2–B7.4 remove recurring local shell/account/Home/exam icon and identity reconstructions:

- learner navigation/account jobs consume the shared `Icon` registry;
- authentication and the learner shell consume canonical `BrandAsset` exports;
- Account Profile/Settings graphics consume shared icons;
- Home recurring submit/arrow/chevron jobs consume controlled icons;
- Home REV recommendation identity consumes governed `RevPresence`; and
- Exam pause/resume uses the controlled `play` icon.

Course/activity-specific recognition markers remain domain composition rather than being misclassified as general navigation icons.

## B7.5 final compatibility retirement

B7.5 deletes `src/app/interface-theme-integrity.css` and removes its runtime import.

The Practice REV recommendation semantic treatment is owned by `interface-learn-practice.css`; other retained files must have a named live composition consumer and may not act as a second theme/foundation layer. The complete retained-source inventory and retirement decision are recorded in `Interface System B7 Final Acceptance.md`.

B7.5 also closes the remaining foundation-level Design Acceptance gaps:

- ordinary Focused Learn/Practice controls consume `SelectField`, `SegmentedControl`, `Button` and `TextAreaField`;
- ordinary Admin refresh/intake controls consume shared `Button`, `TextField` and `TextAreaField` while Admin-specific dense operational composition remains feature-owned;
- Learn sections are flattened into a reading workspace rather than nested bordered cards;
- tablet/mobile Ask REV clearance is asserted by browser geometry; and
- the Ask REV dock is hidden while the timed exam performance surface is active.

## Visual regression gate

B7.5 adds a bounded 18-state Playwright screenshot matrix rather than relying only on semantic-token assertions.

The matrix covers Light/Dark across representative phone/tablet/desktop Home, Plan, Courses, Learn, Practice, Exam Prep, active timed exam and Admin dashboard states. A fixed clock and reduced motion keep snapshots deterministic.

Snapshot changes fail CI. GitHub Actions retains visual evidence for inspection so a baseline cannot be updated silently.

The screenshot gate complements—not replaces—existing semantic theme sweeps, accessibility checks, responsive interaction tests, overlay/focus assurance and material-state tests.

## Migration / implementation rules

A surface is migrated only when:

1. colour, typography, border, radius, elevation, spacing and control sizing use central roles/components;
2. new hard-coded design values have a documented feature-specific reason;
3. interaction states include keyboard-visible focus and do not depend on hover alone;
4. light/dark use the same semantic roles and component structure;
5. reduced motion remains valid;
6. supported phone/tablet/desktop layouts preserve hierarchy and usability;
7. recurring icons and identity assets use controlled shared sources;
8. retained feature CSS has a named live composition job rather than hidden compatibility ownership; and
9. product behaviour, evidence, entitlement and learner/admin data contracts do not change unless separately governed.

## Quality gate

Every material interface PR checks typography, spacing, surface family, radius/elevation, reusable component/control use, icon/asset source where applicable, light/dark behaviour, phone/tablet/desktop behaviour, keyboard/focus/accessibility, loading/empty/error/disabled/saving states where relevant, and motion/reduced motion.

B7 final acceptance additionally requires:

- no runtime `interface-theme-integrity.css` import/file;
- retained source inventory with named consumers and decisions;
- fail-closed B7 ownership assurance;
- correct Learn reading composition;
- correct persistent-dock clearance and timed-exam suppression;
- the committed 18-state screenshot regression set;
- full exact-head Revision CI; and
- current-main integration before Founder approval.

## Documentation impact

B7 implements existing brand, identity, UX, accessibility and Interface System authority. No normative authority amendment or ADR is required for the final cleanup itself.

The component registry, operating standard, B7 technical records, this implementation record and `INDEX.md` are maintained in the same governed change. The original Design Acceptance audit remains historical point-in-time evidence; B7.5 adds a separate acceptance rerun.
