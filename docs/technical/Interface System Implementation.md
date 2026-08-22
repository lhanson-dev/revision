# Revision Interface System Implementation

**Status:** B1 foundation live; B2 Plan/Progress live; B2.5 reusable component foundation live; B3 Subjects/course live; B4 Learn/Practice live; B5 Exam Prep/exam experience live; B6 Admin in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** current canonical application interface foundations, reusable components and bounded migration sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so product and Admin surfaces inherit one coherent visual and interaction language instead of creating local fonts, colours, controls, status semantics, tables, fields, radii, shadows, icons or theme rules.

Enterprise consistency is an implementation requirement. Shared foundations and reusable anatomy are central; feature and channel composition remain flexible within their governed surface families.

## Canonical runtime

The governed application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The interface migration does not create a second runtime, persistence model or service architecture.

Relevant destinations include:

- Plan: `#/plan` → `PlannerRuntime` → `PlanScreen`;
- Progress: `#/progress` → `PlannerRuntime` → compatibility `App`;
- Subjects and course/component routes → compatibility `App`;
- contextual Learn/Practice → `FocusedLearningWorkspace`;
- contextual Exam Prep → `FocusedLearningWorkspace` + `ExamSimulator`;
- timed exam session → `ExamSimulator` full-viewport state inside the canonical runtime;
- Admin: role-gated `#/admin` and Admin detail routes inside the same runtime.

## Implementation layers

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Feature/channel composition** — bounded migration styles and product-specific markup/logic.

Feature styles may own genuine composition. They must not create a parallel design system.

## Central foundation contract

`brand-tokens.css` is the implementation source for reusable roles including:

- Calm Teal and neutral foundations;
- light/dark semantic colours;
- semantic Success / Warning / Error / Information roles;
- Manrope type roles;
- 4px spacing rhythm;
- radius/elevation families;
- compact/standard/large control heights;
- standard fields and icon sizes;
- focus, motion and overlay roles; and
- REV-derived roles.

Migrated interface layers consume these roles instead of declaring page-local palettes or type scales.

## Shared primitive/component contract

`interface-system.css`, `src/app/ui/ui-components.css` and `src/app/ui/index.ts` provide the shared implementation grammar for surfaces, buttons, fields, overlays, menus, statuses, controls, icons and canonical brand assets.

The public React registry includes PageHeader, Surface, Button, IconButton, TextField, SelectField, Status, EmptyState, LoadingState, ModalShell, DrawerShell, PopoverShell, Menu, MenuItem, SegmentedControl, Icon and BrandAsset.

The controlled icon registry uses `currentColor`, rounded stroke treatment and central icon roles. The Living E remains identity rather than a generic product icon.

Compatibility selectors remain only for still-live legacy consumers and are retired in B7 after zero-live-consumer assurance.

## Production migration state

### B1 — foundation/account/overlays

**Live.** Established central roles, primitive CSS, account treatment and overlay grammar.

### B2 — Plan and Progress

**Live.** Production verified on merge commit `609fc1247afa32d7d70fb32a87316dc1ce8939b7` with durable `revision/path-to-live = success`.

### B2.5 — reusable component/icon/asset foundation

**Live.** PR #116 merged as `2369b33fa35414556096d0287100c1df8dbec8d7` after exact-head Revision CI #689 passed.

### B3 — Subjects, Subject Home and course/specification

**Live.** PR #118 merged as `d44cdd85c1a175c1bc595527a0b50d98f90a9cee` with successful post-merge path-to-live evidence.

`src/app/interface-subjects-course.css` is the bounded B3 layer.

### B4 — Learn and Practice

**Live.** PR #119 merged as `41a61d3e276df8635c41f57c4e57329cc39725d7` after exact-head CI #702 and Founder approval-gate success; post-merge path-to-live succeeded.

`src/app/interface-learn-practice.css` is the bounded B4 layer.

### B5 — Exam Prep / exam experience

**Live.** PR #121 merged as `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f` after exact-head Revision CI #707 passed on `317063817d4b6585309f8a0557103aaa1658eb23`, the Founder approval gate succeeded, and post-merge `revision/path-to-live` succeeded.

`src/app/interface-exam-experience.css` is the bounded B5 layer. It preserves the established full-page timed exam, pause, stop-confirm, self-marking and evidence contracts while translating presentation onto the Exam / Performance family.

Detailed production evidence is recorded in `docs/technical/Interface System B5 Exam Prep and Exam Experience Migration.md`.

## B6 current implementation state

**In progress on governed branch.** B6 migrates the protected Admin/operations surfaces onto the Brand System's Admin profile without changing operational meaning, authorization or backend contracts.

The canonical Admin surfaces remain role-gated views inside the same application runtime:

- `#/admin`;
- `#/admin/users`;
- `#/admin/activity`;
- `#/admin/health`;
- `#/admin/assurance`;
- `#/admin/content`; and
- planner-specific Admin assurance where exposed.

`src/app/interface-admin.css` is the bounded B6 layer. It deliberately loads after legacy Admin styles so it can translate current live surfaces onto central roles while B7 retains responsibility for deleting redundant compatibility CSS.

B6 covers:

- Admin page hierarchy and section navigation;
- operational health/status presentation;
- high-level metric and evidence summaries;
- Needs attention and operational panels;
- first-class tables with compact density and sticky headings;
- trends and definition lists;
- Content Operations forms and feedback;
- Founder Assurance summary and coverage presentation;
- Planner Assurance presentation;
- light/dark parity;
- responsive phone/tablet/desktop layouts;
- keyboard-visible focus; and
- reduced-motion handling.

B6 follows the Brand System's Admin rules: functional and restrained; dense where the job requires it; tables remain tables; compact 36px controls are allowed in appropriate desktop operational contexts; semantic colours retain their governed meanings; Unknown is never styled as Healthy; destructive actions retain Error semantics; and Living E halo is not used decoratively.

Detailed implementation and assurance scope is recorded in `docs/technical/Interface System B6 Admin Migration.md`.

## Migration rules

A surface group is migrated only when:

1. colour, typography, border, radius, elevation, spacing and control sizing use central roles/components;
2. new hard-coded design values have a documented feature-specific reason;
3. interaction states include keyboard-visible focus and do not depend on hover alone;
4. light/dark use the same semantic roles and component structure;
5. reduced motion remains valid;
6. supported phone/tablet/desktop layouts preserve hierarchy and usability;
7. recurring icons and identity assets use controlled shared sources;
8. compatibility remains only where a live consumer still requires it; and
9. product behaviour, evidence, entitlement and learner/admin data contracts do not change unless separately governed.

## Bounded rollout

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live.
- **B2.5 — reusable component/icon/asset foundation:** live via PR #116.
- **B3 — Subjects, Subject Home, course/specification:** live via PR #118.
- **B4 — Learn and Practice:** live via PR #119.
- **B5 — Exam Prep / exam experience:** live via PR #121.
- **B6 — Admin:** in progress; same foundations at appropriate operational density.
- **B7 — compatibility retirement:** remove aliases and redundant legacy feature CSS only after repository search and regression prove zero live dependency.

## Quality gate

Every material interface PR checks:

- typography role;
- spacing rhythm;
- surface family;
- radius/elevation;
- reusable component/control;
- icon/asset source where applicable;
- light/dark behaviour;
- phone/tablet/desktop behaviour;
- keyboard/focus/accessibility;
- loading/empty/error/disabled/saving states where relevant; and
- motion/reduced motion.

B6 additionally checks Admin-specific table density/overflow, operational status truthfulness, Content Operations form states and Founder Assurance evidence semantics.

## B6 assurance

Required assurance includes:

- typecheck;
- lint;
- unit/component tests;
- Interface System governance tests including the B6 Admin layer;
- no-local-palette assurance;
- production build;
- existing Admin operations browser journey assurance;
- responsive Admin assurance across supported projects;
- light/dark semantic-role assurance;
- table overflow/sticky-heading regression checks;
- keyboard/focus/accessibility coverage;
- Content Operations form-state regression assurance;
- Founder Assurance truthfulness regression assurance;
- protected Admin/database service assurance from the normal CI suite; and
- current-main integration before merge.

After merge, B6 becomes Live only when the resulting merge commit has durable `revision/path-to-live = success`.

## Documentation impact

B6 implements existing Visual Brand System and Interface System authority rather than changing normative product direction. It does not alter canonical runtime, routes, authorization, metrics, evidence semantics or backend boundaries, so no normative authority amendment or ADR is required.

This implementation record, B5 production record, B6 migration record and `INDEX.md` are maintained with the implementation. The Interface System Component Registry requires no amendment because B6 introduces no new public reusable component, icon source or identity asset. Historical evidence remains unchanged.