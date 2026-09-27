# Plan Setup Form Refinement

**Status:** implementation candidate pending governed merge  
**Date:** 27 September 2026  
**Canonical route:** `#/plan` in `PlannerRuntime`  
**Product authority:** `10-product-governance/Adaptive Revision Planning.md`  
**Experience authority:** `20-brand-and-experience/Product UX Principles.md`  
**Interface standard:** `docs/technical/Interface System Operating Standard.md`

## Purpose

Record the implementation refinement requested after the first live Plan setup review: form controls must read as one coherent Interface System family, the date chooser must be usable at a practical size, and the missing-exam setup content should align to the normal learner canvas instead of dedicating a full left column to a decorative calendar icon.

This does not change planner logic, evidence semantics, assessment behaviour or the approved Plan journey.

## Shared form-control change

`TextField`, `SelectField` and their shared CSS remain the common control boundary.

The implementation now:

- normalises native select presentation through the shared `SelectField` anatomy so dropdown typography, height, spacing and focus treatment match ordinary fields;
- keeps the public `TextField type="date"` usage contract while rendering a Revision-controlled date-entry treatment;
- accepts and emits the existing ISO `YYYY-MM-DD` value expected by application state and persistence;
- presents dates to the learner as `DD / MM / YYYY`;
- provides a larger shared calendar popover with Monday-Sunday columns, month navigation, bounded dates and keyboard-accessible controls; and
- preserves normal required-field validation, direct numeric date entry, light/dark semantic roles and shared focus treatment.

The shared change means pages using the common field components receive the same control typography and sizing rather than Plan carrying a one-off visual fix.

## Plan setup composition

`src/app/plan-setup-refinement.css` owns only the missing-input Plan composition. It consumes existing Interface System tokens and does not introduce a second visual foundation.

For the **Add your exams** state:

- the main heading, explanation and form content begin on the same left edge inside the shared learner canvas;
- the calendar illustration becomes a restrained circular icon at the top-right of the setup surface;
- the icon no longer reserves a full desktop column;
- the optional mock/topic-test/other-assessment form may use the full available setup width; and
- phone layouts retain the same hierarchy with a smaller corner icon and no horizontal overflow.

## Assurance

Assurance is extended with:

- shared component unit coverage for select/date field anatomy; and
- responsive Playwright coverage confirming Plan left alignment, compact corner-icon placement, equal select/date typography and height, practical calendar-popover width and no page overflow.

Existing Interface System, Plan/Progress, dark-theme, accessibility and visual-regression suites remain part of normal Revision CI.

## Documentation impact

No normative authority amendment is required because the requested design is consistent with the already approved Plan setup journey, stable learner canvas and shared-control rules. This document updates current implementation truth only. Historical Plan/release evidence is not rewritten.
