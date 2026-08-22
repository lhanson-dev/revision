# Interface Theme Integrity — Pre-B7

**Status:** production baseline live via PR #123; course-page defect follow-up in progress  
**Authority:** `20-brand-and-experience/Visual Brand System.md` v1.0 and `docs/technical/Interface System Operating Standard.md`  
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`  
**Purpose:** close light/dark visual gaps before compatibility retirement

## Why this pass exists

B1–B6 intentionally retained legacy CSS until B7 can prove zero live dependency before deletion. The central `brand-tokens.css` theme roles correctly translate between light and dark modes, but several older compatibility styles still contain literal light-mode foregrounds and backgrounds.

Examples in legacy `app.css` and `hierarchy.css` include white field/surface backgrounds, dark fixed body text, light-only secondary controls, fixed success/error surfaces, white course hierarchy cards and legacy indigo course accents. The bounded B3–B6 migration layers override the primary migrated surfaces, but an uncovered descendant or fallback selector can still leak a light-only value into dark mode.

The first production hardening pass shipped through PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227` with `revision/path-to-live = success`. Founder production review then identified remaining course-page defects, proving that the initial browser assurance did not exercise the course hierarchy deeply enough.

This follow-up closes that route-specific gap before B7. It does not retire compatibility CSS.

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
- table heading surfaces;
- course section-choice cards, icons and evidence dots;
- course cross-section next-step and progress cards;
- Exam Prep paper cards and nested paper content; and
- scrollbars where the browser supports themed scrollbar colours.

`src/app/course-exam.css` also now uses the central semantic text, accent, border and surface roles directly for the paper expander and nested paper content instead of the legacy `--indigo`, `--line` and `--surface-soft` aliases.

The integrity layer contains no local hex/RGB/RGBA palette and does not define a third theme. Both light and dark continue to come from `brand-tokens.css`.

Dark mode also declares `color-scheme: dark` on the canonical runtime so browser-native form affordances are consistent with the active theme.

## Assurance

The Interface System governance test treats the integrity layer as a migrated semantic layer and verifies no local palette and the required semantic role usage.

The general browser Interface System test performs a real theme switch through Account Settings and checks computed styles on the live runtime, overlay and fields.

The course defect follow-up adds `tests/e2e/course-dark-theme.spec.ts`. It boots the canonical learner runtime directly in Dark mode and navigates through:

**Subjects → Business → AQA AS Business → Overview → Exam Prep**

It verifies actual computed styles for:

- course Overview section-choice surfaces;
- course section-icon accent text;
- Exam Prep paper-card surfaces;
- the paper expander accent;
- expanded paper-content surfaces; and
- the nested Exam Simulator surface.

The test resolves the semantic tokens in the running browser and compares rendered values against them, so a future return to literal white or incompatible accent colour fails assurance.

Normal Revision CI remains required, including responsive browser assurance, production build, database/RLS and protected-service regression assurance.

## Production evidence

- B6 Admin: PR #122 / merge `e10aed1e05ca173e8e87e75b1b3d909d4c39451d` / `revision/path-to-live = success`.
- Initial pre-B7 theme hardening: PR #123 / merge `0d0331255929c4f0e3687ab41fe24b3c2723a227` / `revision/path-to-live = success`.
- Course-page follow-up: governed defect branch `fix/course-dark-mode-defects`; production evidence pending PR assurance, Founder approval and merge.

## Documentation impact

This is implementation hardening of already-approved dual-theme visual authority. No normative product/brand authority change or ADR is required.

The technical checkpoint is updated because the production defect exposed an assurance gap in the earlier pass. Historical evidence is unchanged: PR #123 remains recorded as the first production hardening pass, while this follow-up records the additional defect and assurance required before B7.

B7 must not start compatibility deletion until this course-page follow-up is merged and production-verified, then its repository-wide dependency scan must run against the resulting `main`.
