# LF-01 — Exam-date calendar viewport correction

**Scope:** learner feedback #765, LF-01. **Status:** merged and deployed via [PR #766](https://github.com/lhanson-dev/revision/pull/766); Founder visual feedback positive on 1 November 2026; specific remaining learner-journey checks open.

## Actual surfaces

Canonical `/revision/app/#/plan` renders `PlannerRuntime → PlanScreen`; the Plan Exam dates manager (including optional mock dates) and `FirstUseGate → OnboardingPlanSetup` use the shared `TextField type="date"`. This is Revision's **custom** date calendar in `src/app/ui/controls.tsx`, not the browser-native date chooser and not the Plan navigation `PlanDatePicker.tsx`.

## Finding and bounded correction

The custom calendar used `position: absolute` below its trigger inside the Plan Exam dates modal. The enclosing `.pln-dialog` has a viewport-bound maximum height and `overflow-y: auto`, allowing the calendar to extend beyond the scrollable dialog and be cropped, especially on small laptop heights and at browser zoom. This is supported by current source; it is **not** a confirmed recreation on the original learner's browser.

The shared calendar now measures its trigger and popover and anchors to available viewport space, placing it above the trigger where that offers more room, clamping to viewport margins and allowing its own vertical scroll in small-height viewports. Repositioning responds to resize and nested scrolling. Its DOM remains inside the owning dialog for focus-trap and accessibility ownership. No new calendar, persisted-date transformation, schema change, navigation change or assessment-save change is introduced.

## Assurance and open acceptance

`tests/e2e/plan-screen-v22.spec.ts` asserts the short desktop exam manager calendar fits in the viewport, month navigation/date selection, keyboard Escape and parent-dialog survival. `tests/e2e/student-first-use.spec.ts` asserts short laptop/phone calendar visibility and dismissal. Existing Plan Day/Week/Month and first-use save/retry/legacy assessment coverage remain required.

**Verified release evidence (1 November 2026):** PR #766 exact head `c5b93834afd722841d23bda5d48d7d84b50e4037` passed [Revision CI run 41342064273](https://github.com/lhanson-dev/revision/actions/runs/41342064273), including static/typecheck/lint/unit/build, database/RLS, signup, protected services and desktop/tablet/phone responsive browser checks. Founder-approved merge `2f0b9030208654696396cf2d3a6b2a6f26a0c985` completed [Pages deployment, backend readiness and production smoke run 41342761469](https://github.com/lhanson-dev/revision/actions/runs/41342761469), publishing `revision/path-to-live = success`. The Founder subsequently reported **“looks good”**, accepted as a visual check of the deployed correction and recorded in [Issue #765](https://github.com/lhanson-dev/revision/issues/765).

**Remaining limits:** The Founder statement does not establish a successful date-save/reopen/edit on the original student's account, the 200% browser-zoom scenario or each Chrome/Edge/Safari variation. These remain separately identified for closure; visual acceptance or a synthetic browser test is not evidence of the original student's complete workflow. The P1 defect record remains Open until those material checks are resolved or explicitly risk-accepted.

**Documentation impact:** existing Product UX Principles, Learner Design System and Testing & Assurance Standard already require accessible responsive dialogs; there is no new normative product rule. Defect Register is updated as an open provisional P1; this technical implementation note records the fix without changing historical audits. No ADR or database migration is required.
