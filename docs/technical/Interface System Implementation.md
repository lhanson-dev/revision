# Revision Interface System Implementation

**Status:** B1–B6 live; pre-B7 theme integrity live; B7 foundation cleanup in progress through bounded increments  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `20-brand-and-experience/Product UX Principles.md` v0.4  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Component registry:** `docs/technical/Interface System Component Registry.md`  
**Scope:** current canonical application interface foundations, reusable components and bounded migration/retirement sequence; this document does not redefine brand or product authority

## Purpose

Turn the approved Revision Brand System into a dependable production interface layer so product and Admin surfaces inherit one coherent visual and interaction language instead of creating local fonts, colours, controls, status semantics, tables, fields, radii, shadows, icons, overlays or theme rules.

Enterprise consistency is an implementation requirement. Shared foundations and reusable anatomy are central; feature and channel composition remain flexible within their governed surface families.

## Canonical runtime

The governed application remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

The interface migration does not create a second runtime, persistence model or service architecture.

Relevant destinations include Plan, Progress, Courses/course, contextual Learn/Practice, contextual Exam Prep, timed full-paper sessions and the role-gated Admin routes. Compatibility rendering inside the canonical runtime remains temporary and is retired only in the final B7 work after zero-live-consumer assurance.

## Implementation layers

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Feature/channel composition** — bounded migration styles and product-specific markup/logic.
6. **Temporary theme-integrity compatibility bridge** — `src/app/interface-theme-integrity.css`, retained until final B7 compatibility retirement proves it can be reduced or removed safely.

Feature styles may own genuine composition. They must not create a parallel design system.

## Central foundation contract

`brand-tokens.css` is the implementation source for reusable roles including Calm Teal and neutral foundations, light/dark semantic colours, semantic Success / Warning / Error / Information roles, Manrope type roles, the 4px spacing rhythm, radius/elevation families, compact/standard/large controls, standard fields/icons, focus, motion, overlays and REV-derived roles.

Migrated interface layers consume these roles instead of declaring page-local palettes or type scales.

## Production migration state

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live; production verified on merge commit `609fc1247afa32d7d70fb32a87316dc1ce8939b7`.
- **B2.5 — reusable component/icon/asset foundation:** live via PR #116 / merge `2369b33fa35414556096d0287100c1df8dbec8d7`.
- **B3 — Courses/course migration:** live via PR #118 / merge `d44cdd85c1a175c1bc595527a0b50d98f90a9cee`.
- **B4 — Learn and Practice:** live via PR #119 / merge `41a61d3e276df8635c41f57c4e57329cc39725d7`.
- **B5 — Exam Prep / exam experience:** live via PR #121 / merge `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f`, with Revision CI #707 and `revision/path-to-live = success`.
- **B6 — Admin:** live via PR #122 / merge `e10aed1e05ca173e8e87e75b1b3d909d4c39451d`, with Revision CI #709 and `revision/path-to-live = success`.
- **Pre-B7 theme integrity:** live as the temporary compatibility safety layer while legacy declarations remain.
- **B7.1 — authentication identity ownership:** live via PR #140 / merge `e1bda1840201f125aea7dbee29e9ef247314fce6`.
- **B7.2 — learner-shell recurring icon ownership:** live via PR #142 / merge `c6994cbcaf2e7764945a8807d586dbf3f947e925`.
- **B7.3 — shared overlay/focus ownership:** implemented on the current governed branch; pending PR validation and Founder-approved merge.
- **B7.4 / B7.5:** not complete; shell-local identity/common-control ownership and final compatibility retirement/acceptance remain outstanding.

Issue #137 therefore remains open until the complete B7 acceptance gate is satisfied.

## Theme-integrity compatibility layer

Repository inspection after B6 found that the central theme tokens translated correctly while legacy files such as `app.css` still contained literal light-mode values including white field/surface backgrounds, fixed dark text, light-only secondary controls and fixed semantic surfaces.

`src/app/interface-theme-integrity.css` remains the temporary final compatibility layer while those legacy consumers are still being retired. It:

- contains no local hex/RGB/RGBA palette;
- maps remaining live headings, secondary text and metadata onto `--color-text` / `--color-text-secondary`;
- maps remaining ordinary surfaces and form controls onto central surface/border roles;
- maps placeholders and disabled controls onto theme-aware secondary roles;
- maps success/warning/error states onto central semantic roles;
- explicitly hardens Admin, Founder Assurance and table descendants;
- enables `color-scheme: dark` in dark runtime mode for browser-native affordances; and
- loads after the migrated interface layers so literal compatibility declarations cannot win the cascade.

This bridge is reduced or removed only during B7.5 after consumer inventory and regression prove that deletion is safe. Detailed rationale and assurance remain recorded in `docs/technical/Interface Theme Integrity Pre-B7.md`.

## B7.3 shared overlay/focus contract

B7.3 moves modal/drawer keyboard and focus ownership into `src/app/ui/overlays.tsx` rather than allowing each feature to build a partial contract.

`ModalShell` and `DrawerShell` now centrally own:

- initial focus;
- forward/reverse Tab containment;
- focus redirection if focus escapes programmatically;
- background `inert` isolation;
- body scroll locking;
- `Escape` dismissal through consumer `onDismiss`;
- focus restoration, including responsive cases where the original launcher DOM node is replaced; and
- active-dialog stacking so overlay transitions do not steal focus.

Feature/channel composition still owns placement. The reusable component stylesheet therefore no longer imposes `position: relative` on modal/drawer shells.

The migrated B7.3 consumers are:

- contextual Ask REV drawer;
- mobile learner navigation drawer;
- Account settings modal; and
- ExamSimulator Pause/Stop interruption dialogs.

The Ask REV/mobile/account close controls and mobile account chevron touched by this increment use the controlled `Icon`/`IconButton` system. The shell-local `RevWordmark()` and remaining identity/common-control cleanup are intentionally left for B7.4.

Detailed scope and assurance are recorded in `docs/technical/Interface System B7 Overlay Focus Consolidation.md`.

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

## Quality gate

Every material interface PR checks typography, spacing, surface family, radius/elevation, reusable component/control use, icon/asset source where applicable, light/dark behaviour, phone/tablet/desktop behaviour, keyboard/focus/accessibility, loading/empty/error/disabled/saving states where relevant, and motion/reduced motion.

B7.3 additionally requires browser proof that shared overlays provide:

- correct initial focus;
- `Tab` and `Shift+Tab` containment;
- governed `Escape` behaviour;
- background inertness;
- body scroll locking;
- focus return; and
- unchanged active-exam continuity for Pause/Stop interruptions.

Because B7.3 changes shared learner runtime/interface behaviour, it is treated as Level 3 High risk under `50-engineering-standards/Testing & Assurance Standard.md`: relevant lower-level checks, full relevant critical-journey regression, the responsive browser suite and production build must pass before merge readiness.

B7.5 will add the bounded Light/Dark screenshot regression set and rerun Design Acceptance before Issue #137 can close.

## Documentation impact

B7.3 implements existing accessibility, brand and navigation authority; it does not change routes, authorization, metrics, evidence semantics, backend boundaries or product scope. No normative authority amendment or ADR is required.

The component registry, B7.3 technical record and Knowledge Index are updated in the same governed change. Historical audits remain unchanged as point-in-time evidence.
