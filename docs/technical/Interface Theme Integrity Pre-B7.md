# Interface Theme Integrity — Pre-B7

**Status:** in progress on governed branch  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** close light/dark visual gaps before compatibility retirement

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 can prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translate between light and dark modes, but several older compatibility styles still contain literal light-mode foregrounds and backgrounds.

Examples in legacy `app.css` include white field/surface backgrounds, dark fixed body text, light-only secondary controls and fixed success/error surfaces. The bounded B3–B6 migration layers override the primary migrated surfaces, but an uncovered descendant or fallback selector can still leak a light-only value into dark mode.

This pass hardens that compatibility boundary before B7. It does not retire compatibility CSS.

## Implementation

`src/app/interface-theme-integrity.css` loads after all migrated Interface System layers.

It translates remaining live compatibility selectors onto central semantic roles for:

- ordinary and secondary text;
- headings and legacy metadata;
- ordinary supporting surfaces;
- fields, selects and textareas;
- placeholder and disabled text;
- primary, secondary and tab controls;
- success, warning and error states;
- Admin and Founder Assurance text/table descendants;
- table heading surfaces; and
- scrollbars where the browser supports themed scrollbar colours.

The layer contains no local hex/RGB/RGBA palette and does not define a third theme. Both light and dark continue to come from `brand-tokens.css`.

Dark mode also declares `color-scheme: dark` on the canonical runtime so browser-native form affordances are consistent with the active theme.

## Assurance

The Interface System governance test now treats the integrity layer as a migrated semantic layer and verifies:

- no local colour palette;
- required semantic foreground/surface roles;
- success/warning/error role use;
- dark-mode compatibility declaration; and
- import ordering after B6.

The browser Interface System test now performs a real theme switch through Account Settings and checks computed styles on the live runtime, overlay and field controls. It specifically proves that dark-mode field foreground/background values do not remain the legacy white/dark-text pair.

Normal Revision CI remains required, including responsive browser assurance, production build, database/RLS and protected-service regression assurance.

## B6 production closeout

B6 Admin is production-live via PR #122, merge commit `e10aed1e05ca173e8e87e75b1b3d909d4c39451d`, with durable `revision/path-to-live = success`.

## Documentation impact

This is implementation hardening of already-approved dual-theme visual authority. No normative product/brand authority change or ADR is required.

`Interface System Implementation.md` and `INDEX.md` are updated with this pre-B7 checkpoint. Historical evidence is unchanged.

B7 must not start compatibility deletion until this pass is merged, production-verified, and its repository-wide dependency scan is performed against the resulting `main`.
