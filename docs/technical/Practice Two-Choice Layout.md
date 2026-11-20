# Course Practice — two-choice layout

**Status:** Draft implementation in PR #857; not merged or released.  
**Canonical learner entry:** signed-in course `/revision/app/`, Courses → selected course → Practice.  
**Scope:** Course Practice landing and activity selection only. Module-specific/legacy paper Practice and Exam Prep are not newly reworked by this change.

## Problem and design decision

Previously Course Practice presented scored Quick Questions as a large card beside a tall Warm-up + REV column, and separately appended the LF-05 original written-answer panel below. This made original writing appear secondary, increased scrolling and over-emphasised REV.

The revised start screen gives equal entry affordance to:
- **Quick questions:** scored objective Practice, with existing selection of length and type, saved checkpoint and existing evidence semantics unchanged.
- **Extended answers:** original LF-05 writing, explicitly labelled non-scored self-review. It only appears if the owner-scoped catalogue reports a published question for the course (or the explicit incoming topic filter). Its source/version, private draft, 14-day expiry, submitted-first-answer guidance, deletion and RLS constraints remain unchanged.

After the choice, only its respective configuration/workspace is shown. The selected card and its configuration share a continuous bordered surface, with an uninterrupted vertical connector on desktop; on a phone the active card and controls appear adjacent, before the other choice. Optional warm-ups (flashcards, formulas/guided exercises, case study where published) are below, not equal to a scored route; no warm-up counts towards Exam readiness. REV remains a supporting explanatory surface, not a competing launch card.

## Source ownership and implementation

- `src/app/CourseExperienceScreen.tsx`: injects the existing `Lf05WrittenPracticePanel` into Course Practice's shared start surface, rather than rendering an unrelated bottom section; preserves the existing incoming topic filter so the course-wide writing catalogue is not silently narrowed.
- `src/app/FocusedLearningWorkspace.tsx`: passes the optional written-practice render slot to the canonical PracticeStart.
- `src/app/ui/practice/PracticeStart.tsx`: manages choice disclosure, keeps the written panel mounted while the user changes the selected choice, retains scored session recovery and warm-up routes, and blocks activity switching with unconfirmed written changes.
- `src/app/Lf05WrittenPracticePanel.tsx`: reports actual catalogue availability and navigation safety; no changes to saved-answer or marking service semantics.
- `src/app/ui/practice/practice.css`: token-governed equal-choice cards, focused panel, secondary warm-ups and compact REV; collapses to one column on narrow screens.
- `tests/e2e/practice-start.spec.ts`: verifies the new initial choice and existing scored and warm-up paths.

## Exclusions and verification

No changes to objective scoring, mark tariffs, evidence calculation, official-paper claims, answer retention, authentication or database schema. The standalone HTML mock is **illustrative only**; browser assurance must evaluate the actual signed-in route, both light/dark themes, keyboard focus and mobile layout.

CI and review evidence belong to PR #857. No merge or public release is implied by this document.
## Regression adaptation (19 November 2026)

The route now requires the visible **Choose quick questions** entry choice before configuring lengths/types or pressing Start. Existing authenticated learner-journey checks (independently recorded practice evidence, remediation, planner rechecks, persistence after reload and course removal/re-add) retain all underlying assertions; only the entry sequence is adjusted. Synthetic visual checks use the same selection step. These adaptations do not substitute for green exact-commit CI, real DB/browser assurance, or independent merge approval.
