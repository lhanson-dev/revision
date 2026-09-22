# REV Guidance and Conversation Pattern Implementation

**Status:** current implementation description for the Course Overview pattern; Home follow-up tracked separately  
**Updated:** 2026-09-22

## Purpose

Describe how the Founder-approved `REV Guidance and Conversation Pattern` is implemented in the canonical learner runtime.

Normative authority is `20-brand-and-experience/REV Guidance and Conversation Pattern.md` together with the existing Visual Brand System, Identity Asset Usage Rules, Global Learner Navigation and screen-specific product authorities.

## Canonical runtime

Learner runtime:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime`

Course Overview route family:

`/revision/app/#/courses/:courseId/overview` → `CourseExperienceScreen`

Contextual Ask REV remains owned by `PlannerRuntime`. The Course Overview input does not create a new conversation implementation.

## Course Overview implementation

`CourseExperienceScreen` now treats the REV feature area as one coherent decision surface with two learner paths.

### REV leads

The surface shows:

- feature-scale canonical `RevPresence` / Living E in Resting state;
- the governed `PoweredByRev` compact identity component;
- the existing deterministic course recommendation;
- the existing evidence-based learner-facing recommendation reason;
- concise Exam Readiness and Evidence Coverage context derived from the existing `ModuleLearningState` model; and
- the existing direct start action into Practice or Exam Prep according to the recommendation.

No recommendation algorithm, readiness calculation or evidence semantics are changed by this presentation work.

### The student leads

A visually separated `Got something else on your mind?` row provides an `Ask REV anything…` input.

Submitting the input calls the existing `PlannerRuntime.openRev(draft)` path. That method stores the draft in the existing `revision:rev-draft` session handoff and opens the governed contextual REV drawer. `PlannerRevScreen` consumes that draft through its existing contract.

This means the new Course Overview field uses the same conversation layer, programme context and REV implementation as the persistent Ask REV control.

## Visual treatment

`src/app/course-overview-rev-feature.css` is a bounded fidelity layer loaded after the existing Home fidelity styles.

It deliberately reuses the established Home REV language:

- Deep Teal feature surface;
- feature-scale three-bar Living E;
- visible near-white/aqua halo core with restrained teal falloff;
- existing semantic Resting motion from `living-e.css`;
- governed `Powered by REV` treatment from `RevCompactWordmark.tsx` / Home fidelity styling;
- Primary Teal action treatment; and
- responsive Light/Dark-compatible role tokens.

The Course Overview does not copy Home's exact scale or composition. Home remains the larger learner-wide feature moment; Course Overview uses the same identity grammar at a smaller course-scoped scale.

## Progress presentation

The previous standalone `Your course position` card is removed from Course Overview because its concise signals are now integrated into the REV guidance area.

This avoids repeating a separate dashboard-style progress card while preserving the two approved meanings currently available in the model:

- Exam Readiness; and
- Evidence Coverage.

Detailed evidence interpretation remains the job of the Progress section.

## Responsive behaviour

Desktop uses Living E + guidance copy side by side, followed by a full-width conversation row.

Tablet reduces the Living E feature scale and stacks the conversation copy above its input.

Phone stacks the feature content vertically while preserving the hierarchy:

`Living E / Powered by REV → recommendation + reason → concise progress → start action → Ask REV`

The persistent tablet/mobile Ask REV dock remains unchanged. The inline field is contextual to the decision surface rather than a second persistent action.

## Assurance

The Course Overview dark-theme browser assurance checks:

- feature-scale Living E presence;
- governed `Powered by REV` attribution;
- concise progress context;
- `Got something else on your mind?` conversation route;
- draft handoff into the existing contextual Ask REV drawer; and
- existing Exam Prep dark-surface behaviour after the interaction.

Existing typecheck, lint, unit/build, accessibility, responsive browser, theme, identity and visual-regression assurance remain applicable.

## Home follow-up boundary

The same normative pattern is approved for Returning Student Home with learner-wide recommendation scope. That implementation is deliberately not included in the Course Overview follow-up branch and is tracked in Issue #365 so the PR remains bounded.

Until Issue #365 is implemented and released, the current Home implementation remains the live technical truth even though the new normative authority defines the intended next refinement.

## Documentation impact

This document records the Course Overview implementation only. It does not rewrite historical GJ-03 evidence or the prior Home implementation record. When Issue #365 changes Home, `docs/technical/Returning Student Home Implementation.md` and its visual assurance baselines must be updated in that governed PR.
