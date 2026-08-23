# B7 Design Acceptance Rerun — 23 August 2026

**Status:** acceptance candidate on PR #148; reviewed baselines committed, final exact-head comparison CI/current-main check and Founder-approved merge still required  
**Evidence type:** point-in-time audit; not normative design authority  
**Original review:** `audits/2026-08-23-design-acceptance-review.md`  
**Implementation record:** `docs/technical/Interface System B7 Final Acceptance.md`  
**Baseline:** `main` after PR #147 / `7ac52d0702dca1bc11e87eede36bf0159947ca39`

## Purpose

Re-run the foundation-level Design Acceptance findings after B7.1–B7.5 without rewriting the original review.

This rerun asks a narrower question than a journey redesign: is the shared interface foundation now coherent enough that subsequent journey/screen work can build on one controlled visual and interaction system rather than competing local ownership?

## Acceptance criteria

B7 foundation acceptance requires evidence that:

- recurring identity/icons/common controls come from controlled shared sources;
- modal/drawer focus behaviour is centrally owned;
- the final compatibility/theme catch-all is gone;
- retained feature styles have named live composition jobs rather than hidden foundation ownership;
- Learn reads as a workspace rather than nested card inventory;
- persistent mobile/tablet Ask REV does not obscure ordinary actions and is absent during timed exam performance;
- Light/Dark and responsive hierarchy remain coherent; and
- durable screenshot regression protects representative composition/wrapping/overlap states.

## Rerun findings

### Shared identity, icon and overlay ownership

B7.1–B7.4 provide the required central ownership:

- authentication and learner-shell Revision identity use canonical `BrandAsset` exports;
- recurring learner-shell, Account, Home and Exam glyph jobs use the controlled `Icon` registry;
- Home alternate REV recommendation marks use governed `RevPresence`; and
- `ModalShell` / `DrawerShell` centrally own focus containment, inert background, Escape, body scroll lock and focus restoration.

No B7.5 change reintroduces a local identity/icon family.

### Common controls

B7.5 moves the two remaining materially partial families onto the public component registry where the interaction job is ordinary:

- Focused Learn/Practice: topic select, activity segmented control, ordinary buttons and written-answer textareas; and
- Admin/Content Operations: refresh/ordinary actions plus URL and multiline intake fields.

Specialist assessment controls and dense Admin operational composition remain feature-specific. Their retained job is semantically different rather than a copy of an ordinary component.

### Compatibility/theme ownership

The final `interface-theme-integrity.css` layer is deleted and its runtime import removed.

The Practice recommendation semantic rule lives in `interface-learn-practice.css`. Retained feature styles are inventoried by live consumer and retirement decision in the final B7 technical record. Static assurance fails if the catch-all bridge returns.

Fail-closed rendered checks materially improved the retirement rather than merely confirming it. CI #858 exposed Course Overview section/evidence surfaces that still depended on the catch-all; those roles moved into `interface-subjects-course.css`. CI #861 then exposed a literal-white `cross-section-next` background in retained `hierarchy.css`, which now consumes `--color-surface` directly. The same run showed that Exam Prep `.paper-exam-content` already intentionally owned `--color-surface-soft`; its older browser assertion was corrected to the feature-owned role instead of restoring the bridge-masked value.

By CI #864, the functional Light/Dark rendered sweeps, Course/Exam semantic checks, responsive/accessibility assurance and B7 dock checks all passed. The only deterministic browser failures were the 18 deliberately absent screenshot baselines.

### Learn composition

The Learn reading workspace no longer wraps every section in a bordered card. Sections sit on the workspace with dividers, while task/feedback surfaces remain bounded where interaction state requires them.

This resolves the foundation-level nested-card density finding without redesigning learning content.

### Persistent Ask REV

Tablet/mobile content retains reserved bottom space and browser geometry checks confirm ordinary learner actions can clear the fixed dock.

The dock is suppressed whenever `.exam-session-page` is active, so timed ExamSimulator performance owns the viewport.

### Visual regression

B7.5 defines an 18-state fixed-clock/reduced-motion screenshot set spanning:

- phone/tablet/desktop;
- Light and Dark;
- Home, Plan, Courses, Learn, Practice, Exam Prep, active timed exam; and
- Admin dashboard.

Revision CI #864 (`32655418540`) generated the candidate images after the bridge-dependency fixes. The 18 images were visually inspected in Light/Dark pairs across the canonical phone/tablet/desktop viewports; no separate composition or theme blocker was identified. The reviewed artifact was `interface-visual-regression-32655418540`, artifact ID `9497347227`, SHA-256 `bcd816e9461c8c396fa10ba1680459413a296392ff64b79de0bb3caa2abaaa33`.

Those exact 18 native PNGs are now committed under `tests/e2e/interface-visual-regression.spec.ts-snapshots/`. Missing or changed snapshots fail CI rather than updating automatically. A final exact-head comparison run remains required before this audit can move from candidate to accepted.

## Original DAR disposition

| Finding | Rerun disposition |
| --- | --- |
| DAR-001 / DAR-002 | **Resolved** — B7.2/B7.4 shared icon/glyph ownership |
| DAR-003 | **Acceptance gate** — semantic Light/Dark sweeps green through #864; final exact-head screenshot comparison remains |
| DAR-004 | **Acceptance gate** — durable 18-state screenshot regression added; reviewed baselines committed; final comparison remains |
| DAR-005 | **Resolved** — final theme bridge removed; retained source inventory recorded; #858/#861 live dependencies explicitly reassigned |
| DAR-006 | **Resolved in PR #148 candidate** — implementation/operating/registry/readiness/index records reconciled |
| DAR-007 | **Resolved** — B7.1 canonical authentication identity |
| DAR-008 | **Resolved** — shared identity/icons/overlay jobs across shell/account/auth |
| DAR-009 | **Resolved for foundation ownership** — recurring shell/Home jobs central; job-specific composition remains local |
| DAR-010 | **Resolved** — B7.4 governed REV recommendation identity |
| DAR-011 | **Deliberate retained exception** — domain/course recognition markers are not a generic icon library |
| DAR-012 | **Resolved** — Focused common controls use public UI components |
| DAR-013 | **Resolved** — Learn flattened to reading-workspace sections |
| DAR-014 | **Resolved** — B7.3 shared modal/drawer focus contract |
| DAR-015 | **Resolved** — B7.4 controlled Home glyphs |
| DAR-016 | **Resolved for common jobs** — shared ordinary Admin controls/fields; specialist dense operations composition retained |
| DAR-017 | **Resolved + browser gate** — dock-clearance geometry passes through #864 |
| DAR-018 | **Resolved + browser gate** — dock suppressed during active timed exam and passes through #864 |

## Current decision

**Candidate for B7 foundation acceptance.**

The implementation findings are reconciled and the intended 18 screenshot baselines have been generated, inspected and committed. Final acceptance now requires the exact final PR head to:

1. pass full Revision CI with the committed screenshot comparisons green;
2. remain current/clean with `main`; and
3. receive explicit Founder approval for that exact head before merge.

After a Founder-approved merge, `revision/path-to-live` must also succeed before Issue #137 is treated as complete/live.

## Documentation impact

This is new point-in-time evidence. It does not amend the Visual Brand System, Product UX Principles or other normative authority, and it does not rewrite the 23 August original Design Acceptance review.
