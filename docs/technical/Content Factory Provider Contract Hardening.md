# Content Factory Provider Contract Hardening

**Implementation status:** governed implementation on PR #191; must merge through normal Founder approval  
**Date:** 27 August 2026  
**Related initiative:** GitHub Issue #169  
**Trigger evidence:** Content Factory live Pilot #7

## Purpose

Harden the Content Factory's AI-provider boundary so deterministic factory decisions cannot drift inside otherwise schema-valid model output, transient retries do not become repeated spend on deterministic failures, and the shared factory remains usable across materially different subjects and qualifications.

This is an implementation correction under the existing Content Factory v2, testing/assurance and bootstrap-cost authorities. It does not weaken educational gates, source-rights controls or qualified-human review.

## Pilot #7 evidence

Pilot #7 stopped during Learn/Practice generation after the Learning Blueprint had already selected the allowed practice modes for `marketing-demand-and-positioning`. The provider returned an additional `short_answer` activity. The downstream deterministic validator correctly rejected the unplanned mode.

The failure exposed a provider-contract gap rather than a reason to relax the validator: the provider-facing schema still allowed every generic Practice mode even though the Blueprint had already narrowed the valid set for that work unit.

Pilot #7 remains historical failed evidence. It is not rewritten by this implementation.

## Governing implementation principle

Once Revision has made a deterministic decision, the provider must not be asked to make the same decision again.

The boundary is:

```text
Revision-owned plan / policy
        ↓
exact provider contract
        ↓
creative provider content only
        ↓
deterministic Revision-owned identity / policy injection
        ↓
full domain validation
```

This is the same class of ownership rule already used for governed assessment-item target fields and fixed pilot assessment contexts.

## Learn provider contract

The Learning Blueprint remains responsible for selecting `explanation` and/or `worked_example`.

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

For each work unit, the provider receives an `activitiesByMode` object containing exactly the Blueprint-selected mode keys and no other mode keys.

The provider does **not** return:

- an activity `mode` field; or
- an activity `id` field.

Revision injects both deterministically from the selected Blueprint mode and work-unit identity. The normalized result is then validated against the unchanged Practice collateral domain schema.

This removes the Pilot #7 failure class: an unselected mode is no longer a valid provider-output field that can survive structured-output validation.

## Structured output policy

The new Blueprint-derived Learn and Practice provider schemas use strict structured output at the OpenAI boundary.

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

Generic worker instructions now require subject-authentic examples, contexts, stimuli and assessment shapes derived from the supplied course identity, knowledge model, Board Alignment and Question Family.

Business-specific facts and constraints remain in the AQA AS Business pilot profile rather than the shared provider engine.

This separation supports the approved scale-proof requirement across quantitative/business/economics, mathematics, science, essay/humanities and language/prescribed-text course shapes.

## Assurance

PR #191 adds deterministic/fake-provider assurance covering:

- all 31 non-empty combinations of the five Practice modes;
- exact Blueprint-selected Practice keys at the provider JSON-schema boundary;
- absence of provider-owned `mode` and `id` activity fields;
- deterministic Practice mode/ID injection;
- valid Learn-mode combinations and exact provider field presence;
- deterministic Learn section/worked-example ID injection;
- strict structured output for the new Learn/Practice contracts;
- non-Business course identity in provider-contract regression tests;
- absence of Business-specific generic Learn/Practice instructions;
- non-retry of completed schema-invalid provider output;
- preservation of bounded retries for transient provider failure.

No paid provider calls are required for this assurance.

## Deliberate next reliability increment

This PR does **not** claim that the live pilot is fully restartable across workflow runs.

The existing live-pilot artifact store is process-memory backed, and the live integration harness creates the durable GitHub job/evidence record only after the course runner returns. Therefore an early workflow failure can still lose resumable paid work even when earlier work units succeeded.

Before another paid live pilot, a separate governed reliability PR should implement:

1. durable course-job creation before the first paid provider call;
2. durable artifact/checkpoint persistence after successful material stages/work units;
3. input/output/worker-contract fingerprints sufficient to decide safe reuse;
4. restart from the failed/invalidated unit without replaying unchanged successful units;
5. cumulative course-spend persistence across workflow attempts;
6. evidence persistence on early failure; and
7. forced-failure/restart assurance proving previous paid work is not called again.

The per-course spend ceiling must ultimately apply to the cumulative course job rather than resetting with a new workflow process.

## Documentation impact

This document records implementation truth for PR #191. Existing normative authority already requires course independence, schema-valid workers, restartability/idempotency, bounded retries, deterministic ownership, reuse of governed artifacts and cost observability, so no normative authority amendment is required for this fix.

`docs/technical/Content Factory Architecture.md`, `docs/technical/Content Factory v2 Implementation Plan.md` and `docs/technical/Content Factory v2 Live Adapter Pilot.md` remain the broader architecture/implementation sources. This focused record documents the provider-contract correction and the deliberately separated durable-resume follow-up.

Historical Pilot #6 and Pilot #7 evidence remains historical evidence and must not be rewritten.
