# Issue #760 — Compact editorial Course Overview tiles

**Status:** Founder-approved design and scoped implementation candidate, 1 November 2026. This document describes the PR candidate, not a shipped release.

## Canonical learner experience

Route: `/revision/app/#/courses/:courseId/overview`; the same `CourseSectionSpotlights` also renders module-specific Overview. Runtime `src/app/CourseExperienceScreen.tsx`; layout `src/app/course-overview-v2.css`; shared iconography in `src/app/ui/Icon.tsx`. Global Ask REV, REV's recommendation card and the existing course header remain unchanged.

## Founder decision and design constraints

Following PR #754's production release, the Founder found the section spotlight tiles too vertically stacked and the subsequent Option 3 editorial proposal too sparse. On 1 November, the Founder selected the compact horizontal review concept and replied **“go with that”**.

The four existing destinations — Learn, Practice, Exam Prep and Progress — now render in two columns where practical and one column on narrow phones. Each tile has one real, full-surface native button with an accessible action name, rather than an internal secondary Open button. The visible content keeps a semantic heading, a small directional arrow, a short description or confirmed learner-specific note, and a modest 44–48px right-aligned icon. Card height is content-led; no tall fixed minimum, stretched space-between column or decorative empty block. All colours and sizes come from shared learner tokens.

For verified saved Practice and exam work, the exact existing `SavedWork.actionLabel` remains both visible and the native button's accessible name, preserving the existing owner-checked `onOpenSavedWork` target. Saved tiles retain a visible In progress label, real title/detail and restrained highlight. Ordinary tiles call `onOpenSection`. Multiple saved items are not turned into artificial REV recommendations. Learn may show verified pages reviewed but not an unfinished-session indicator; Progress is never a session. Errors and loading remain outside the tiles.

## Tests and visual-release boundary

- `tests/e2e/interface-visual-regression.spec.ts`: four semantic headings, four native tile actions, four existing shared icons, no duplicate Ask REV and compact desktop height; screenshots attached as the visual approval evidence.
- `tests/e2e/practice-session-recovery.spec.ts`: existing verified saved Practice journey retains exact “Open saved Practice” entry, one action and continued saved question/evidence.
- Verify all four routes, true Practice and Exam Prep continuation, dark/light contrast, desktop/tablet/phone at and below 320px, keyboard and focus, 200% text zoom, and reduced motion. No new persistence, grading, planning, course content, schema, exam scoring or external network calls.
- C4 Course Overview desktop and phone screenshots **must differ** from PR #754's historically approved digests. Those digests are protected; never replace, mask, loosen or re-pin them without new Founder visual approval. Home, Learn and unrelated visual baselines remain untouched. A visual-regression failure on this candidate is a **visual-review hold**, not permission to bypass CI or approve merge.

## Documentation impact and release scope

The normative composition rule is `20-brand-and-experience/Learner Design System.md` §19, updated in the same PR. This file and `INDEX.md` locate the implementation. Issue #760 tracks the change; prior PR #754 technical notes and historical approvals remain intact. No ADR is necessary for this scoped presentation change. Production is unchanged until the eventual PR passes assurance, receives separate visual approval and separate PR-specific Founder merge approval, then successfully deploys.
