# Revision Interface System Implementation

**Status:** B1 foundation live; B2 Plan/Progress live; B2.5 reusable component foundation live; B3 Subjects/course live; B4 Learn/Practice live; B5 Exam Prep/exam experience live; B6 Admin live; pre-B7 theme integrity hardening in progress  
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

Relevant destinations include Plan, Progress, Subjects/course, contextual Learn/Practice, contextual Exam Prep, timed full-paper sessions and the role-gated Admin routes. Compatibility rendering inside the canonical runtime remains temporary and is retired only in B7 after zero-live-consumer assurance.

## Implementation layers

1. **Normative visual/UX authority** — numbered governance documents.
2. **Foundation roles** — `src/app/brand-tokens.css`.
3. **Shared CSS primitives** — `src/app/interface-system.css`.
4. **Reusable React component layer** — `src/app/ui/` with shared anatomy in `src/app/ui/ui-components.css`.
5. **Feature/channel composition** — bounded migration styles and product-specific markup/logic.
6. **Temporary pre-B7 theme-integrity bridge** — `src/app/interface-theme-integrity.css`, loaded last while literal legacy theme values still exist.

Feature styles may own genuine composition. They must not create a parallel design system.

## Central foundation contract

`brand-tokens.css` is the implementation source for reusable roles including Calm Teal and neutral foundations, light/dark semantic colours, semantic Success / Warning / Error / Information roles, Manrope type roles, the 4px spacing rhythm, radius/elevation families, compact/standard/large controls, standard fields/icons, focus, motion, overlays and REV-derived roles.

Migrated interface layers consume these roles instead of declaring page-local palettes or type scales.

## Production migration state

- **B1 — foundation/account/overlays:** live.
- **B2 — Plan and Progress:** live; production verified on merge commit `609fc1247afa32d7d70fb32a87316dc1ce8939b7`.
- **B2.5 — reusable component/icon/asset foundation:** live via PR #116 / merge `2369b33fa35414556096d0287100c1df8dbec8d7`.
- **B3 — Subjects, Subject Home and course/specification:** live via PR #118 / merge `d44cdd85c1a175c1bc595527a0b50d98f90a9cee`.
- **B4 — Learn and Practice:** live via PR #119 / merge `41a61d3e276df8635c41f57c4e57329cc39725d7`.
- **B5 — Exam Prep / exam experience:** live via PR #121 / merge `3fcafc5b6abf65c15b8edf1899dbdb8fb404167f`, with Revision CI #707 and `revision/path-to-live = success`.
- **B6 — Admin:** live via PR #122 / merge `e10aed1e05ca173e8e87e75b1b3d909d4c39451d`, with Revision CI #709 and `revision/path-to-live = success`.
- **Pre-B7 theme integrity:** in progress on governed branch; fixes remaining light/dark compatibility leaks before deletion work begins.
- **B7 — compatibility retirement:** not started; remove aliases/redundant legacy CSS only after repository search and regression prove zero live dependency.

## Why the pre-B7 theme integrity pass is required

B1–B6 deliberately did not delete old CSS. Repository inspection after B6 found that the central theme tokens translate correctly, but legacy files such as `app.css` still contain literal light-mode values including white field/surface backgrounds, fixed dark text, light-only secondary controls and fixed semantic surfaces.

The bounded B3–B6 layers override the main migrated surfaces, but uncovered descendants or fallback states can still inherit those literal values when the runtime switches to dark mode. That creates the observed failure mode where some text or controls become difficult or impossible to read.

`src/app/interface-theme-integrity.css` is therefore a temporary final compatibility layer. It:

- contains no local hex/RGB/RGBA palette;
- maps remaining live headings, secondary text and metadata onto `--color-text` / `--color-text-secondary`;
- maps remaining ordinary surfaces and form controls onto central surface/border roles;
- maps placeholders and disabled controls onto theme-aware secondary roles;
- maps success/warning/error states onto central semantic roles;
- explicitly hardens Admin, Founder Assurance and table descendants;
- enables `color-scheme: dark` in dark runtime mode for browser-native affordances; and
- loads after B6 so literal compatibility declarations cannot win the cascade.

This bridge is deliberately removed or absorbed during B7 once the legacy sources that made it necessary are safely retired.

Detailed rationale and assurance are recorded in `docs/technical/Interface Theme Integrity Pre-B7.md`.

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

The pre-B7 theme-integrity pass additionally requires:

- static assurance that the integrity layer contains no local palette;
- static assurance that required semantic foreground/background/status roles are present;
- import-order assurance proving the bridge loads after B6;
- browser assurance that switches the live account/runtime from light to dark;
- computed-style checks proving overlay and field foreground/background values actually change with the theme rather than remaining legacy light values;
- responsive browser assurance; and
- the normal production build, database/RLS and protected-service regression suite.

## Documentation impact

B6 is now production-live and this document records the post-B6 theme-integrity checkpoint before B7. The change implements already-approved dual-theme Visual Brand System authority; it does not alter product behaviour, routes, authorization, metrics, evidence semantics or backend boundaries. No normative authority amendment or ADR is required.

Historical evidence remains unchanged. B7 should begin only from a `main` where this hardening has passed governed merge and production verification.