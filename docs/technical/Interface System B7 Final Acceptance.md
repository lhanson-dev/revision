# Revision Interface System — B7 Final Acceptance

**Status:** Complete and live via PR #148; exact-head Revision CI #869 and governed production run `32656318718` succeeded  
**Authority:** `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`, `50-engineering-standards/Testing & Assurance Standard.md`  
**Operating standard:** `docs/technical/Interface System Operating Standard.md`  
**Parent task:** Issue #137 — Task 1: Complete B7 foundation cleanup  
**Branch baseline:** `main` at `7ac52d0702dca1bc11e87eede36bf0159947ca39` (PR #147 / B7.4 merge)

## Purpose

Close the final Interface System migration increment without turning foundation cleanup into a journey redesign.

B7.5 proves that the canonical `/revision/app/` runtime no longer depends on a final compatibility stylesheet to hide competing visual ownership, that remaining common control jobs use the public shared system, that the blocking Design Acceptance composition defects are resolved, and that representative Light/Dark compositions are protected by durable browser screenshots.

Historical Design Acceptance evidence is not rewritten. A new point-in-time acceptance rerun records the post-B7 state.

## Canonical runtime

The governed runtime remains:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `PlannerRuntime`

B7.5 does not create a second runtime, route model, data model, evidence model, entitlement contract or backend service.

## B7.5 implementation changes

### Final theme bridge retirement

`src/app/interface-theme-integrity.css` is deleted and no longer imported by `src/main.tsx`.

Its remaining material jobs are moved to their owning semantic/feature layers. In particular, the Practice `REV recommends` Guidance surface is explicitly governed in `interface-learn-practice.css` rather than depending on a final catch-all selector.

The fail-closed retirement runs exposed real dependencies rather than allowing the deleted bridge to be declared unused prematurely:

- Revision CI #858 found Course Overview `.section-choice` and `.evidence-dot` surfaces rendering literal white in Dark mode across phone, tablet and desktop. Those semantic roles now live in `interface-subjects-course.css`.
- Revision CI #861 found `cross-section-next` still using a literal white background from retained `hierarchy.css`. That retained owner now consumes `--color-surface` directly.
- The same #861 run showed `.paper-exam-content` resolving to `--color-surface-soft`. That was already the intentional `course-exam.css` owner contract; the previous browser assertion had encoded the old bridge-masked `--color-surface` result. The assertion now verifies `--color-surface-soft` rather than forcing the retired override back into the implementation.

Static B7 assurance protects all three ownership decisions and fails if the deleted bridge or runtime import returns.

### Focused Learn / Practice common control ownership

`FocusedLearningWorkspace` now consumes the public Interface System for ordinary recurring jobs:

- `SelectField` for the topic selector;
- `SegmentedControl` plus shared `Button` variants for activity selection;
- shared `Button` for ordinary primary/secondary actions; and
- `TextAreaField` for written case/exam-practice drafts.

Specialist multiple-choice labels/radios and AO self-mark number inputs remain feature-specific because their interaction job is assessment evidence rather than a generic field/button treatment.

### Learn reading-workspace composition

Learn content no longer renders each section as a nested bordered surface. `.focused-learn .learn-section` is transparent and borderless, with a simple divider between sections. Practice and specialist task surfaces retain bounded cards where interaction/state requires them.

This is the foundation-level DAR-013 correction; it does not redesign learning content or sequencing.

### Admin common control ownership

Admin remains a deliberately dense operational family. B7.5 moves ordinary shared jobs onto the public component layer:

- refresh actions use shared compact secondary `Button`;
- the Content Operations primary route/intake actions use shared `Button`;
- the official URL uses `TextField`; and
- optional course instructions use `TextAreaField`.

Admin-specific stat cards, sub-navigation, health rows, tables, trends and operational text links remain feature composition rather than being forced into learner component shapes.

### Persistent Ask REV dock

The tablet/mobile Ask REV dock remains available on normal learner work, with reserved bottom space verified by browser geometry.

When `.exam-session-page` is active, `mobile-navigation.css` suppresses the dock. The timed exam therefore owns the viewport without a global tutor action appearing above the performance surface.

## Retained runtime stylesheet inventory

A filename being older is not by itself evidence of obsolete ownership. B7.5 distinguishes **foundation/theme compatibility** from **live feature composition**.

The final catch-all theme bridge is retired. The following loaded sources remain because they have named live consumers. None is allowed to act as a second colour/type/identity foundation; semantic Interface System layers and rendered assurance enforce that boundary.

| Retained source | Named live consumer / job | B7 retirement decision |
| --- | --- | --- |
| `app.css` | canonical learner screen structural markup still shared by several pre-journey layouts | retain transitional structure; do not use for new foundation values; decompose only with the owning journey refactor |
| `exam.css` | Exam Prep / ExamSimulator legacy structural markup beneath the B5 semantic layer | retain live structure until exam journey refactor; B5 owns semantic visual contract |
| `rev-home.css` | Home and REV feature composition | retain as current feature composition; not a compatibility bridge |
| `hierarchy.css` | shared current page/content hierarchy relationships | retain while live; central tokens remain value authority; `cross-section-next` now owns a semantic surface role directly rather than relying on the retired catch-all |
| `course-exam.css` | course Exam Prep paper/component composition | retain current composition; `.paper-exam-content` intentionally owns `--color-surface-soft` |
| `content-operations.css` | Content Operations job/form layout | retain Admin feature composition; common controls now use shared components |
| `admin-operations-responsive.css` | Admin responsive/density layout | retain Admin-specific responsive composition |
| `planner.css` | planner-specific structural/form relationships still consumed by Plan | retain transitional planner composition; shared tokens/components own recurring foundations |
| `planner-runtime.css` | canonical learner shell, Home composition and Ask REV panel composition | retain as current runtime composition |
| `planner-today.css` | planner/today task composition | retain as current planner feature composition |
| `planner-rev.css` | REV conversation/page composition | retain as current REV feature composition |
| `living-e.css` | Living E presentation/state composition | retain as governed REV identity implementation |
| `living-e-accessibility.css` | Living E accessibility/reduced-motion treatment | retain as governed accessibility implementation |
| `sidebar-account-menu.css` | desktop account popover placement/composition | retain placement only; shared menu/overlay interaction remains central |
| `account-modal.css` | Account workspace content composition | retain composition only; shared ModalShell owns modal interaction |
| `profile-edit.css` | Profile editing content layout | retain Account feature composition |
| `mobile-navigation.css` | tablet/mobile shell, drawer and persistent Ask REV placement | retain canonical responsive shell composition |
| `contextual-navigation.css` | Courses contextual learner navigation | retain current contextual navigation composition |

`courses.css`, the numbered Interface System migration layers, shared UI CSS and semantic brand tokens are current semantic implementation sources rather than compatibility debt.

The deliberate decision is therefore not “delete every pre-B7 file”. It is: remove the final masking layer, prove the retained file has a live composition job, keep foundation values centralized, and defer structural decomposition to the journey that owns the layout.

## Design Acceptance reconciliation

The original `audits/2026-08-23-design-acceptance-review.md` remains historical evidence. B7 disposition is:

| DAR | B7 disposition |
| --- | --- |
| DAR-001 / DAR-002 | recurring learner-shell icons moved to controlled registry in B7.2; remaining recurring glyphs consolidated in B7.4 |
| DAR-003 | Light/Dark breadth protected by semantic rendered sweeps plus the B7.5 screenshot matrix |
| DAR-004 | B7.5 adds a bounded 18-state durable screenshot regression set with reviewed committed baselines |
| DAR-005 | final `interface-theme-integrity.css` bridge deleted; retained sources inventoried; CI #858/#861 exposed and relocated remaining real dependencies rather than masking them |
| DAR-006 | B7 technical records, registry, operating standard and index reconciled in B7.5 |
| DAR-007 | authentication uses canonical `BrandAsset` via B7.1 |
| DAR-008 | shell/account/auth recurring identity, icon and overlay jobs use shared component ownership through B7.1–B7.4 |
| DAR-009 | recurring shell/Home identity and glyph ownership removed; page-specific composition remains deliberately feature-owned |
| DAR-010 | Home alternate REV mark replaced by governed `RevPresence` in B7.4 |
| DAR-011 | course letter/task markers remain deliberate domain-recognition devices, not a competing general icon library |
| DAR-012 | Focused Learn/Practice common controls moved to public Interface System components in B7.5 |
| DAR-013 | Learn nested bordered sections flattened into one reading workspace in B7.5 |
| DAR-014 | modal/drawer focus, inertness, Escape, scroll lock and focus return centralized in B7.3 |
| DAR-015 | Home recurring control glyphs moved to controlled icons in B7.4 |
| DAR-016 | ordinary Admin buttons/fields use shared components in B7.5; operational tables/stat cards/navigation retain Admin-specific composition |
| DAR-017 | browser geometry asserts the tablet/mobile dock does not obscure ordinary learner actions |
| DAR-018 | tablet/mobile dock is suppressed while a timed exam is active |

## Bounded visual regression gate

`tests/e2e/interface-visual-regression.spec.ts` defines 18 named viewport/theme states using a fixed clock and reduced motion:

1. phone Home — Light;
2. phone Home — Dark;
3. desktop Home — Light;
4. desktop Home — Dark;
5. desktop Plan — Light;
6. desktop Plan — Dark;
7. tablet Courses — Light;
8. tablet Courses — Dark;
9. desktop Learn — Light;
10. desktop Learn — Dark;
11. phone Practice — Light;
12. phone Practice — Dark;
13. tablet Exam Prep — Light;
14. tablet Exam Prep — Dark;
15. tablet active timed exam — Light;
16. tablet active timed exam — Dark;
17. desktop Admin dashboard — Light; and
18. desktop Admin dashboard — Dark.

The set is deliberately bounded. It protects high-value composition, wrapping, theme parity and responsive shell relationships without creating a screenshot for every route/state combination.

Revision CI #864 (`32655418540`) rendered the final candidate set after the bridge dependency fixes. All non-screenshot functional, accessibility, responsive and theme assurance in that run passed; its only deterministic failures were the 18 deliberately missing baseline files. One existing desktop REV-motion case failed its first attempt and passed its configured retry.

The 18 #864 images were visually inspected as Light/Dark pairs across phone, tablet and desktop. No separate composition/theme blocker was identified: ordinary mobile/tablet learner states retained the Ask REV dock with usable content clearance, while timed exam states were isolated from the global dock.

The reviewed evidence came from artifact `interface-visual-regression-32655418540` (artifact ID `9497347227`, SHA-256 `bcd816e9461c8c396fa10ba1680459413a296392ff64b79de0bb3caa2abaaa33`). Those exact 18 native PNGs are committed under `tests/e2e/interface-visual-regression.spec.ts-snapshots/`. Future missing or changed snapshots fail Playwright rather than updating automatically.

Final exact-head Revision CI #869 subsequently passed with the committed screenshot comparisons green.

## Automated assurance

B7.5 adds or extends:

- `scripts/assurance/b7-final-acceptance.test.mjs` — fail-closed final ownership/composition/screenshot-matrix contract, including Course Overview, retained hierarchy and Exam Prep semantic theme ownership after bridge retirement;
- `scripts/assurance/site-theme-integrity.test.mjs` — post-bridge stylesheet classification and bridge-return prevention;
- `scripts/assurance/interface-system-governance.test.mjs` — post-B7 shared registry/theme/composition rules;
- `src/app/ui/ui-components.test.tsx` — shared textarea semantics;
- `tests/e2e/b7-final-acceptance.spec.ts` — dock clearance and timed-exam suppression; and
- `tests/e2e/interface-visual-regression.spec.ts` plus its 18 reviewed native PNG baselines — durable Light/Dark composition regression.

Existing phone/tablet/desktop, theme, accessibility, overlay/focus, persistence, database/RLS and protected-service assurance remains part of the normal risk-classified Revision CI.

## Documentation impact

B7.5 implements existing brand, UX and engineering authority. No normative authority amendment and no ADR are required for the final cleanup itself.

The B7.5 change updated current technical truth in:

- this final B7 record;
- `Interface System Implementation.md`;
- `Interface System Operating Standard.md`;
- `Interface System Component Registry.md`;
- the pre-B7 theme-integrity checkpoint with a retirement disposition; and
- `INDEX.md`.

A new post-B7 point-in-time Design Acceptance rerun was added under `audits/`. The 23 August pre-B7 audit was not rewritten.

## Completion and Issue #137

B7 foundation cleanup is complete and live.

Completion evidence:

- B7.5 PR #148 merged from exact approved head `344eb64ae6e98c50e03844e8fb4f60a48c74ca55`;
- final merge commit on `main`: `e1ebaf6f25d9348bb1a56926b33eaa748a334a97`;
- exact-head Revision CI #869 succeeded, including committed screenshot comparisons;
- governed production run `32656318718` succeeded across release lineage, backend readiness, build, GitHub Pages deployment and production smoke; and
- durable `revision/path-to-live = success` was published on the merge commit.

Issue #137 is closed as completed. Further journey-led work builds from this accepted shared foundation rather than reopening foundation ownership by default.
