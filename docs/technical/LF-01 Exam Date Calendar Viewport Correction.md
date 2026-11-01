# LF-01 — Exam-date calendar viewport correction

**Scope:** learner feedback #765, LF-01. **Status:** candidate, not merged or live.

## Actual surfaces

Canonical `/revision/app/#/plan` renders `PlannerRuntime → PlanScreen`; the Plan Exam dates manager (including optional mock dates) and `FirstUseGate → OnboardingPlanSetup` use the shared `TextField type="date"`. This is Revision's **custom** date calendar in `src/app/ui/controls.tsx`, not the browser-native date chooser and not the Plan navigation `PlanDatePicker.tsx`.

## Finding and bounded correction

The custom calendar used `position: absolute` below its trigger inside the Plan Exam dates modal. The enclosing `.pln-dialog` has a viewport-bound maximum height and `overflow-y: auto`, allowing the calendar to extend beyond the scrollable dialog and be cropped, especially on small laptop heights and at browser zoom. This is supported by current source; it is **not** a confirmed recreation on the original learner's browser.

The shared calendar now measures its trigger and popover and anchors to available viewport space, placing it above the trigger where that offers more room, clamping to viewport margins and allowing its own vertical scroll in small-height viewports. Repositioning responds to resize and nested scrolling. Its DOM remains inside the owning dialog for focus-trap and accessibility ownership. No new calendar, persisted-date transformation, schema change, navigation change or assessment-save change is introduced.

## Assurance and open acceptance

`tests/e2e/plan-screen-v22.spec.ts` asserts the short desktop exam manager calendar fits in the viewport, month navigation/date selection, keyboard Escape and parent-dialog survival. `tests/e2e/student-first-use.spec.ts` asserts short laptop/phone calendar visibility and dismissal. Existing Plan Day/Week/Month and first-use save/retry/legacy assessment coverage remain required.

These tests need exact-head CI execution before their results may be called passing. Browser compatibility and 200% zoom, light/dark, date save/reload with actual authenticated state and real learner verification remain open until specifically evidenced. In particular, a screenshot of a simulated browser is not the original student's reproduction or production acceptance.

**Documentation impact:** existing Product UX Principles, Learner Design System and Testing & Assurance Standard already require accessible responsive dialogs; there is no new normative product rule. Defect Register is updated as an open provisional P1; this technical implementation note records the fix without changing historical audits. No ADR or database migration is required.
