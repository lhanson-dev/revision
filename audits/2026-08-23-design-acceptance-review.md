# Design Acceptance Review — 23 August 2026

**Status:** In progress  
**Review type:** Point-in-time design / UX / implementation-conformance audit  
**Baseline:** approved `main` at `1b2967e262086ba90898fb7b9a60cfa883f9dd16`  
**Canonical learner runtime:** `/revision/app/` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx` with compatibility `App` consumers  
**Purpose:** determine whether the current Revision product is visually coherent, usable, accessible and recognisably Revision before B7 compatibility retirement, and identify assurance improvements needed to prevent visible design regressions from escaping CI.

## Authority and evidence boundary

This audit records evidence and findings. It does **not** create or amend design authority.

Normative review baseline:

- `20-brand-and-experience/Visual Brand System.md`;
- `20-brand-and-experience/Product UX Principles.md`;
- `10-product-governance/Global Learner Navigation.md` for approved global-navigation behaviour;
- applicable active product journey authority;
- `50-engineering-standards/Testing & Assurance Standard.md`; and
- `docs/technical/Interface System Operating Standard.md` as the implementation discipline for the shared system.

Implementation evidence comes from current `main`, technical documentation and automated assurance. Historical audits remain historical and are not rewritten.

`20-brand-and-experience/Emotional Experience Principles.md` is a draft authority candidate and may inform review questions, but is not promoted to binding authority by this audit.

## Review model

A screen is not accepted merely because its route loads or CI is green. Review must distinguish:

1. **Route coverage** — the destination renders and remains navigable.
2. **Material-state coverage** — materially different visual/interaction states on that route are exercised.
3. **Design-system conformance** — typography, colour, spacing, radii, controls, icons, assets, focus, responsive behaviour and theme translation follow the governed system.
4. **Design acceptance** — hierarchy, composition, density, scanning, prominence and interaction actually work well for the learner/admin job.
5. **Regression ownership** — high-value states have sufficient automated assurance to make recurrence unlikely.

The Practice `REV recommends` production escape after PR #125 is the explicit evidence for this distinction: Practice route coverage existed while the material recommendation state had not been asserted strongly enough.

## Scope matrix

### Learner-wide / account

- [ ] Sign in
- [ ] Create account
- [ ] Password recovery
- [ ] Loading / auth resolution
- [ ] Home
- [ ] Ask REV contextual overlay
- [ ] Expanded REV workspace
- [ ] Plan
- [ ] Global Progress
- [ ] current Subjects / academic navigation compatibility surface
- [ ] Profile modal
- [ ] Settings / Light-Dark appearance
- [ ] desktop account popover
- [ ] tablet/mobile navigation drawer
- [ ] persistent mobile/tablet Ask REV dock

### Course and learning

- [ ] Subject/course entry and overview
- [ ] Learn
- [ ] Practice — no recommendation
- [ ] Practice — `REV recommends` present
- [ ] Practice — each applicable activity family
- [ ] feedback / answer / evidence states
- [ ] contextual Progress
- [ ] Exam Prep
- [ ] expanded paper/component state
- [ ] Exam Simulator — active
- [ ] Exam Simulator — paused
- [ ] Exam Simulator — stop confirmation
- [ ] Exam Simulator — completion/result where applicable

### Admin / operational

- [ ] Admin entry / denied access
- [ ] Admin dashboard/content operations
- [ ] Users
- [ ] Activity
- [ ] System Health
- [ ] Founder Assurance
- [ ] Planner Admin
- [ ] tables, filters, empty/error/unknown states where present

### Cross-cutting

- [ ] Light theme
- [ ] Dark theme
- [ ] 390×844 representative phone
- [ ] 820×1180 representative tablet
- [ ] 1440×900 representative desktop
- [ ] keyboard/focus path
- [ ] WCAG contrast / target sizing / reflow
- [ ] reduced motion where applicable
- [ ] loading / empty / error / disabled / saving states
- [ ] surface-family use and card density
- [ ] typography hierarchy and line length
- [ ] spacing rhythm / responsive gutters
- [ ] primary-vs-secondary action hierarchy
- [ ] icon / identity / asset consistency
- [ ] screenshot/visual-regression strategy for high-value canonical states

## Known product transition — not to be misclassified

Current approved `main` now contains the FI-020 learner-course authority change. `Global Learner Navigation.md` governs a future-facing **Courses** global destination and persisted learner-course context, while the current runtime still exposes **Subjects** and the published catalogue because FI-020 production implementation has not yet been completed.

This review therefore:

- may assess the visual quality and accessibility of the current Subjects compatibility experience;
- must not treat Subjects as the final accepted information architecture;
- must not spend implementation effort polishing structural behaviour that FI-020 will deliberately replace unless a current production defect requires it; and
- must review the eventual Courses implementation separately when it exists.

The current README also still describes an older five-destination mobile model and should not be used as normative navigation authority where it conflicts with `Global Learner Navigation.md`.

## Initial findings

### DAR-001 — Global shell bypasses the shared icon registry

**Type:** Design-system implementation conformance  
**Status:** Open finding  
**Evidence:** `src/app/PlannerRuntime.tsx` defines a local `NavIcon` SVG family for Home, Plan, Progress, Subjects, Profile, Settings, Admin, Upgrade and Logout. `src/app/ui/index.ts` exposes the governed shared `Icon` component, while the Interface System Operating Standard says recurring product icons should come through the controlled registry rather than page-local interpretations.

**Risk:** local shell icons can drift in stroke, geometry, sizing and future Courses migration, undermining the intended one-system visual language.

**Disposition:** inspect the shared registry coverage and classify whether shell navigation should migrate before or as part of the next navigation implementation. Do not create a second icon family.

### DAR-002 — Shell uses text glyphs where governed identity/control anatomy exists

**Type:** Design-system / brand conformance  
**Status:** Open finding  
**Evidence:** desktop Ask REV currently uses a decorative `✦` glyph; several shell close controls use `×`. Mobile Ask REV already uses `RevPresence`, demonstrating a controlled REV identity path, and the shared system exposes `IconButton`/`Icon`.

**Risk:** inconsistent REV identity and control language across breakpoints; browser/font rendering differences; local controls not benefiting from shared icon-button states.

**Disposition:** review desktop Ask REV, drawer close and REV-panel close as part of shell acceptance. Prefer Living E / shared icon-control anatomy where required by the approved visual system.

### DAR-003 — Site-wide theme assurance is materially stronger in Dark mode than Light mode

**Type:** Assurance gap  
**Status:** Open finding  
**Evidence:** `tests/e2e/site-theme-integrity.spec.ts` is a Dark-mode rendered sweep. Targeted tests exercise Light/Dark switching, but there is no equivalent material-state-wide Light-mode contract across the whole application.

**Risk:** Light mode is a first-class governed experience but could regress in a state not covered by targeted tests while the Dark sweep remains green.

**Disposition:** during this review, identify the smallest useful canonical Light-mode state set rather than duplicating every Dark assertion mechanically.

### DAR-004 — No screenshot-based visual regression for canonical design states

**Type:** Assurance gap  
**Status:** Open finding  
**Evidence:** current automated checks validate semantic roles, computed styles, accessibility and responsive behaviour but do not provide a canonical screenshot/image comparison layer.

**Risk:** hierarchy, spacing, alignment, unintended wrapping, excessive whitespace, misplaced overlays or visually wrong-but-semantic compositions can pass token/DOM assertions.

**Disposition:** define a bounded visual-regression set after the acceptance review identifies the high-value canonical states. Avoid hundreds of brittle screenshots.

### DAR-005 — Compatibility cascade remains large and final acceptance must not assume B7 is complete

**Type:** Technical/design-system debt  
**Status:** Known / expected pre-B7  
**Evidence:** `src/main.tsx` still imports legacy/compatibility CSS alongside the migrated Interface System and final `interface-theme-integrity.css` compatibility layer.

**Risk:** cascade complexity has already caused repeated production theme escapes. B7 is intended to retire compatibility only after zero-live-consumer proof.

**Disposition:** complete this acceptance review first, then use its accepted target as an input to B7. Do not delete compatibility styling to make the audit look cleaner.

### DAR-006 — Theme-integrity technical checkpoint is stale after PR #126

**Type:** Documentation drift  
**Status:** Open documentation finding  
**Evidence:** `docs/technical/Interface Theme Integrity Pre-B7.md` still says the Practice recommendation follow-up is in progress and B7 is blocked pending that follow-up, although PR #126 merged and `revision/path-to-live` succeeded.

**Risk:** contributors can make sequencing decisions from stale implementation documentation.

**Disposition:** update the technical checkpoint in the eventual governed remediation/documentation PR. Do not rewrite historical audit evidence.

## Acceptance questions for every learner surface

For each material state, answer:

- Is the primary useful action obvious within a quick scan?
- Is the purpose/expected outcome explained before asking the learner to act?
- Are measured results/recommendations explained after measuring?
- Does the page avoid unnecessary dashboard/card density?
- Is secondary detail progressively disclosed rather than competing with the primary path?
- Do type hierarchy, line length and spacing create a calm reading/working rhythm?
- Are primary, secondary and destructive actions visually unambiguous?
- Does REV look like the same product presence everywhere it appears?
- Are Light and Dark genuinely equivalent-quality experiences rather than simple colour inversions?
- Does phone/tablet preserve the same product hierarchy without cramped controls or obscured content?
- Are focus, touch targets, reduced motion and semantic states acceptable?

## Planned review sequence

1. **A — Shell, authentication and account:** global navigation, Ask REV, auth, Profile/Settings, responsive shell.
2. **B — Home, Plan and global Progress:** hierarchy, density, next-action prominence, empty/loading/error states.
3. **C — Academic/course surfaces:** current compatibility entry, course overview, contextual navigation.
4. **D — Learn and Practice:** focused-work hierarchy, recommendation, activity and feedback states.
5. **E — Exam Prep and Exam Simulator:** technique, paper expansion, timer/pause/stop/result states.
6. **F — Admin:** table density, statuses, operational hierarchy, Unknown vs Healthy truthfulness.
7. **G — Cross-site acceptance:** Light/Dark parity, responsive consistency, icon/assets, spacing/type, visual-regression selection.

Findings may be fixed in separate governed branches/PRs by coherent scope. This audit branch itself is evidence, not a dumping ground for production fixes.

## Documentation-impact check

Creating this point-in-time audit is appropriate because the task is an evidence/review activity. No normative authority changes are made here. Implementation fixes discovered by the review must update affected code and technical documentation in their own governed changes. If a finding demonstrates that an approved design rule itself is wrong, that must be treated as a proposed authority change rather than silently corrected in CSS.
