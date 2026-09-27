# Plan Exam Setup Form Refinement

**Status:** Implementation candidate pending governed merge  
**Date:** 27 September 2026  
**Product authority:** `10-product-governance/Adaptive Revision Planning.md`  
**Experience authority:** `20-brand-and-experience/Product UX Principles.md`, `20-brand-and-experience/Visual Brand System.md`  
**Interface implementation:** `docs/technical/Interface System Implementation.md`, `docs/technical/Interface System Operating Standard.md`

## Purpose

Implement the Founder-approved refinement of the Plan missing-exam setup state while preserving the existing adaptive-planning behaviour and stable learner canvas.

The change addresses three observed usability issues:

1. ordinary selects and date fields looked visually inconsistent despite representing the same form hierarchy;
2. the browser-native date-picker popup was materially too small for the intended learner experience on desktop; and
3. the large decorative calendar tile consumed a full content column and pushed the setup copy away from the left edge of the learner canvas.

## Shared form-control change

`SelectField` remains a native select but now owns its chevron through the controlled Interface System icon registry and uses the same shared field typography, height, radius and semantic theme roles as other fields.

`TextField type="date"` now resolves through the shared date-field treatment. It preserves a native form-associated date input for value/required semantics while presenting a larger governed calendar surface for ordinary learner interaction. The calendar:

- uses the existing field size and typography roles;
- uses the controlled Plan/calendar icon and chevrons;
- supports previous/next month navigation;
- shows a seven-column Monday-first month view;
- uses the standard focus ring and action colour for selection;
- closes on selection, outside pointer interaction or Escape; and
- respects supplied `min`, `max`, `required`, `disabled`, hint and error state inputs.

Because the implementation is in the shared Interface System component layer, existing and future consumers of `TextField type="date"` receive the same treatment instead of Plan creating a local date-control fork.

## Plan composition change

The missing-exam setup retains one Standard surface, but the decorative calendar treatment is reduced to a compact top-right icon tile. The content itself begins at the normal left edge of the surface so the step label, heading, explanation and form controls share one clear alignment line.

The known-exam form remains responsive:

- desktop keeps exam, date and action on one row where space allows;
- tablet allows the primary action to wrap below without shrinking fields below useful widths; and
- phone stacks controls into a single column without horizontal page scrolling.

The optional mock/topic-test/other-assessment form may use the full setup content width rather than inheriting an unnecessarily narrow local maximum.

## Scope and non-changes

This refinement does **not** change:

- planner prioritisation or scheduling logic;
- assessment persistence or schema;
- evidence/readiness semantics;
- the approved Day / Week / Month model;
- the learner navigation shell; or
- REV planning authority.

It is an implementation and design-system consistency change only.

## Assurance

The change extends reusable component tests to cover the governed select/date anatomy and adds browser assurance for:

- matching select/date field typography and height;
- compact top-right Plan setup icon placement;
- left alignment between setup heading and form controls;
- a materially larger calendar popup; and
- Escape dismissal.

The existing responsive, accessibility, theme-integrity and visual-regression suites remain part of the exact-head CI gate. Any intentional Plan baseline change must be manually inspected before its digest is updated.

## Documentation impact

No normative authority amendment is required because the approved Plan authority already establishes the missing-setup journey and the Visual Brand System already requires consistent shared form anatomy. This record documents the implementation refinement; historical design and release evidence remains unchanged.
