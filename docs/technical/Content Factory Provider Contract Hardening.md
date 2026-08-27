# Content Factory Provider Contract Hardening

**Implementation status:** PR #191 production-verified; Pilot #8 Learning Blueprint follow-up in governed implementation  
**Date:** 27 August 2026  
**Related initiative:** GitHub Issue #169  
**Trigger evidence:** Content Factory live Pilots #7 and #8

## Purpose

Harden the Content Factory's AI-provider boundary so deterministic factory decisions cannot drift inside otherwise schema-valid model output, transient retries do not become repeated spend on deterministic failures, and the shared factory remains usable across materially different subjects and qualifications.

This is an implementation correction under the existing Content Factory v2, testing/assurance and bootstrap-cost authorities. It does not weaken educational gates, source-rights controls or qualified-human review.

## Pilot #7 evidence

Pilot #7 stopped during Learn/Practice generation after the Learning Blueprint had already selected the allowed practice modes for `marketing-demand-and-positioning`. The provider returned an additional `short_answer` activity. The downstream deterministic validator correctly rejected the unplanned mode.

The failure exposed a provider-contract gap rather than a reason to relax the validator: the provider-facing schema still allowed every generic Practice mode even though the Blueprint had already narrowed the valid set for that work unit.

Pilot #7 remains historical failed evidence. It is not rewritten by this implementation.

## Pilot #8 evidence

Pilot #8 ran from approved `main` after PRs #191 and #192. It stopped during Learning Blueprint planning before any Learn/Practice collateral generation because the provider returned an internally contradictory plan for `business-foundations`: the work unit required Practice output but selected no Practice mode.

The deterministic downstream validator correctly rejected the impossible Blueprint. PR #192 also behaved as intended: the live workflow created durable Issue #193, preserved completed checkpoints/evidence and stopped early rather than continuing to buy downstream generation.

The Pilot #8 defect is upstream of the PR #191 collateral contracts. It demonstrates that provider-selected Learning Blueprint modes must be compiled against governed Coverage requirements before the Blueprint is allowed to drive paid collateral generation.

Pilot #8 remains historical failed evidence. It is not rewritten by this follow-up.

## Governing implementation principle

Once Revision has made a deterministic decision, the provider must not be asked to make the same decision again as canonical factory state.

The boundary is:

```text
Revision-owned plan / policy / Coverage requirements
        ↓
provider pedagogical proposal
        ↓
deterministic Revision compilation
        ↓
exact downstream provider contract
        ↓
creative provider content only
        ↓
deterministic Revision-owned identity / policy injection
        ↓
full domain validation
```

This is the same class of ownership rule already used for governed assessment-item target fields and fixed pilot assessment contexts.

## Learning Blueprint compilation after Pilot #8

Coverage already owns whether each curriculum requirement needs Learn and/or Practice output through `learnRequired` and `practiceRequired`. Provider-returned `requiredOutputs` is therefore not treated as canonical factory state.

Before a provider-generated Learning Blueprint reaches the domain pipeline, Revision now compiles each proposed work unit against the referenced governed Coverage requirements:

- `requiredOutputs` is derived deterministically from the referenced Coverage requirements;
- provider attempts to omit a required output or introduce an unrequired output are overwritten by the governed Coverage state;
- any required Learn output always includes `explanation`, while a provider-selected `worked_example` is preserved where supplied;
- provider-selected valid Practice modes are preserved where at least one was supplied;
- if Practice is governed as required but the provider selected no Practice mode, Revision chooses one bounded subject-agnostic baseline from the supplied knowledge structure: `quantitative` when the selected knowledge carries formulas, otherwise `application` when it carries application contexts, otherwise `retrieval`;
- learning modes are removed from Practice-only work units and Practice modes are removed from Learn-only work units;
- deferred/not-applicable requirements cannot be turned into new Learn/Practice work by the provider; and
- a work unit with no governed Learn or Practice requirement fails once as a provider-contract failure rather than triggering blind retries.

The compiler deliberately adds **no second model call**. This prevents a cheap planning inconsistency from causing another paid planning pass and preserves the existing per-course provider budget accounting in one adapter execution path.

The existing domain validator remains defence in depth and still checks node coverage, requirement coverage, component scope and persisted collateral completeness.

## Learn provider contract

The compiled Learning Blueprint is responsible for selecting `explanation` and/or `worked_example` before collateral generation.

For each work unit, the provider schema is derived from those selected modes:

- `sections` exists only when `explanation` is selected;
- `workedExamples` exists only when `worked_example` is selected;
- unselected output classes are absent from the provider contract rather than merely discouraged by prompt text;
- provider output does not own section/worked-example identifiers;
- Revision injects stable work-unit-derived identifiers after provider validation;
- the complete normalized result is still validated against the unchanged learner-collateral domain schema.

The Blueprint/downstream validator remains defence in depth.

## Practice provider contract

The five reusable Practice modes remain:

- `retrieval`;
- `flashcard`;
- `short_answer`;
- `application`;
- `quantitative`.

For each work unit, the provider receives an `activitiesByMode` object containing exactly the compiled Blueprint-selected mode keys and no other mode keys.

The provider does **not** return:

- an activity `mode` field; or
- an activity `id` field.

Revision injects both deterministically from the selected Blueprint mode and work-unit identity. The normalized result is then validated against the unchanged Practice collateral domain schema.

This removes the Pilot #7 failure class: an unselected mode is no longer a valid provider-output field that can survive structured-output validation.

## Structured output policy

The Blueprint-derived Learn and Practice collateral provider schemas use strict structured output at the OpenAI boundary.

The Learning Blueprint planner remains a provider pedagogical proposal followed by deterministic Revision compilation. Its canonical downstream result is not permitted to rely on provider-returned output-requirement choices.

Other existing worker contracts remain on their current structured-output behaviour until their schemas are deliberately hardened and regression-tested. This avoids turning a reliability fix into an uncontrolled whole-adapter schema migration.

Strict provider validation does not replace Revision domain validation.

## Retry classification

Automatic retries are reserved for failures that may plausibly succeed without changing the request:

| Failure class | Automatic retry |
| --- | --- |
| network/transport exception | bounded |
| HTTP 429 | bounded |
| provider HTTP 5xx | bounded |
| malformed/non-JSON infrastructure response | bounded |
| completed provider output violates requested schema | **no** |
| provider refusal / unusable completed output | **no** |
| deterministic provider/domain normalization mismatch | **no** |
| educational/content defect found by assurance | **no blind regeneration** |
| source-rights / identity ambiguity | **block** |

A completed but contract-invalid provider response is recorded as a worker `failure`, allowing the Content Factory orchestrator to block through its normal worker-failure path rather than paying for repeated identical attempts.

## Course-agnostic provider boundary

The shared provider adapter must not embed Business-specific pedagogy or assessment assumptions.

Generic worker instructions require subject-authentic examples, contexts, stimuli and assessment shapes derived from the supplied course identity, knowledge model, Board Alignment and Question Family.

The Pilot #8 compiler fallback is also subject-agnostic: it uses only formulas and application-context availability from the selected knowledge nodes, not Business-specific keywords or course IDs.

Business-specific facts and constraints remain in the AQA AS Business pilot profile rather than the shared provider engine.

This separation supports the approved scale-proof requirement across quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text course shapes.

## Assurance

PR #191 added deterministic/fake-provider assurance covering:

- all 31 non-empty combinations of the five Practice modes;
- exact Blueprint-selected Practice keys at the provider JSON-schema boundary;
- absence of provider-owned `mode` and `id` activity fields;
- deterministic Practice mode/ID injection;
- valid Learn-mode combinations and exact provider field presence;
- deterministic Learn section/worked-example ID injection;
- strict structured output for the Learn/Practice collateral contracts;
- non-Business course identity in provider-contract regression tests;
- absence of Business-specific generic Learn/Practice instructions;
- non-retry of completed schema-invalid provider output; and
- preservation of bounded retries for transient provider failure.

The Pilot #8 follow-up adds provider-free assurance covering:

- the exact `Practice required + no Practice mode` failure observed in Pilot #8;
- deterministic replacement of provider `requiredOutputs` with governed Coverage requirements;
- Learn-only and Practice-only output ownership;
- guaranteed `explanation` for governed Learn output;
- quantitative, application and retrieval fallback selection from generic knowledge structure;
- removal of ungoverned modes; and
- one-call/no-blind-retry behaviour for canonical Blueprint compilation.

No paid provider calls are required for this assurance.

## Durable reliability boundary

PR #192 subsequently production-verified durable course-job creation before paid calls, persistent checkpoints/artifacts, exact-head resume/reuse, cumulative per-course attempt spend and early-failure evidence. Pilot #8 exercised that path successfully even though the Blueprint itself failed: Issue #193 and the workflow evidence survived the early stop.

Cross-version checkpoint reuse remains deliberately disallowed. A Learning Blueprint implementation change requires a new approved `main` proof rather than pretending a prior failed course package is compatible.

## Documentation impact

This document records implementation truth for PR #191 and the Pilot #8 Learning Blueprint follow-up. Existing normative authority already requires course independence, schema-valid workers, deterministic work to remain deterministic, restartability/idempotency, bounded retries, reuse of governed artifacts and cost observability, so no normative authority amendment is required for this fix.

`docs/technical/Content Factory Architecture.md`, `docs/technical/Content Factory v2 Implementation Plan.md`, `docs/technical/Content Factory v2 Live Adapter Pilot.md` and `docs/technical/Content Factory Durable Resume and Spend.md` remain the broader architecture/implementation sources. This focused record documents the provider-contract corrections.

Historical Pilot #6, Pilot #7 and Pilot #8 evidence remains historical evidence and must not be rewritten.
