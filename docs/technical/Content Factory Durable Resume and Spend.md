# Content Factory Durable Resume and Spend

**Implementation status:** governed implementation on the durable-resume reliability PR  
**Date:** 27 August 2026  
**Related initiative:** GitHub Issue #169  
**Preceding increment:** PR #191 — Provider Contract Hardening

## Purpose

Make the live Content Factory economically and operationally restartable so an interrupted course job does not have to repurchase unchanged model work and the per-course spend ceiling remains cumulative across workflow attempts.

This is implementation truth under the existing Content Factory Operating Model and v2 implementation plan. It does not change educational authority, source-rights policy, independent review, expert-review requirements or Founder merge governance.

## Reliability problem

The pre-hardening live pilot held artifacts in process memory and created its durable GitHub job only after the course runner returned. An early failure could therefore leave useful paid work visible only in transient workflow logs and force a later workflow to buy the same work again.

The provider client also enforced its spend ceiling only within one process. Restarting the workflow created a fresh in-memory counter, so the nominal per-course ceiling was not yet a durable course-level control.

## Durable job boundary

A live course job is now created as a GitHub Issue **before the first paid provider call**.

The issue remains operational evidence only. It does not become educational authority or publication approval.

The live workflow can optionally receive an existing job issue number to resume. Resume is fail-closed to the exact same approved content-head SHA. A changed repository head is treated as a new implementation context rather than silently reusing outputs produced under different code/contracts.

This intentionally conservative rule means:

- transient/interrupted workflow attempts on the same approved implementation can reuse paid work;
- a governed implementation change after a content/contract defect does not silently inherit old generated outputs;
- future targeted invalidation can become more granular only when contract/version dependency evidence is strong enough to make that safe.

## Checkpoint store

For the bootstrap live pilot, durable checkpoints use GitHub Issue comments attached to the course job.

Checkpoint records are machine-readable, chunked when required, and cover:

- generated artifacts;
- worker executions and their outputs/provenance;
- cumulative spend metadata and per-call reservations/settlements;
- workflow-attempt records.

Large checkpoint payloads are split into multiple comment chunks and reconstructed only when every chunk is present. Incomplete/corrupted records are ignored as cache misses rather than treated as valid evidence.

Generated artifacts use deterministic references derived from:

`job + artifact kind + artifact fingerprint`

Rewriting an unchanged artifact therefore reuses the existing reference instead of creating duplicate content identity.

## Exact-input worker reuse

Every bounded worker call is keyed by:

`worker method + exact input fingerprint + approved content-head SHA`

On first execution, the worker result is durably recorded before the pipeline relies on it for later paid work.

On restart:

- a successful exact-input execution is returned from the durable cache without a provider call;
- a terminal non-infrastructure failure is also reused, preventing manual reruns from repeatedly paying for an unchanged deterministic/provider-contract defect;
- an infrastructure failure is recorded as evidence but is not reused as a terminal result, allowing a later attempt to retry the affected worker;
- changed input or changed implementation head creates a cache miss and runs the worker normally.

This gives the factory work-unit-level economic idempotency even when an interruption occurs inside a larger generation stage.

## Stage job checkpoints

The durable runner saves the machine-readable Content Factory job after each completed major factory stage:

1. intake / identity / rights / mapping / Course Knowledge Model;
2. Learn + Practice generation;
3. assessment + Marking Packs;
4. deterministic assurance + independent review / remediation state;
5. expert-review packaging.

If a process fails inside a stage, the issue may contain the last completed stage job snapshot while worker/artifact comments contain later completed work-unit checkpoints. A restart replays deterministic orchestration, but exact-input cached workers and deterministic artifact references reconstruct the stage without repurchasing those completed units.

This is deliberate: the job state remains schema-governed while the worker cache provides finer-grained interruption recovery.

## Cumulative course spend ledger

The live pilot now persists a course-level spend ledger in the same durable issue.

The ledger is tied to:

- course job ID;
- exact content-head SHA;
- configured course ceiling.

Each provider HTTP attempt follows a reserve/settle model:

1. calculate a conservative maximum cost for the intended call;
2. durably reserve that amount **before** sending the provider request;
3. refuse the request if cumulative settled/open-reserved spend would exceed the course ceiling;
4. after the response, settle the reservation to observed token-derived cost where usage is available;
5. retain the conservative reservation when usage cannot be read.

An interrupted process therefore cannot silently forget a potentially chargeable call. Open reservations remain conservative budget consumption until deliberately reconciled by later governed tooling.

The existing provider-process ceiling remains defence in depth; the durable ledger is the cross-workflow course-level authority for the live pilot's operational spend envelope.

## Retry economics

The provider-contract rules introduced by PR #191 remain in force:

- transient network / 429 / provider 5xx conditions may retry within bounded limits;
- completed contract-invalid output is not blindly retried;
- educational/material review findings are not regenerated randomly;
- source-rights or identity ambiguity blocks.

Durable reuse adds another protection: a manual workflow restart does not reset these economics. Terminal unchanged worker failures are replayed from evidence, while successful work is reused.

## Workflow operation

The manual `Content Factory Live Pilot` workflow retains its one-at-a-time concurrency guard and $20 course ceiling.

A normal new run leaves the resume input empty and creates a fresh durable job issue.

A recovery run supplies the prior course job issue number. The workflow loads its checkpoints, verifies the exact head/ceiling, increments the durable attempt count and resumes without repeating unchanged provider work.

The workflow still:

- runs only from approved `main`;
- keeps AQA material `REFERENCE_ONLY`;
- does not publish learner content;
- stops on substantive educational/assessment failure;
- requires qualified review later in the governed lifecycle.

## Failure evidence

The live integration harness now writes an evidence file for both successful and blocked completed attempts. The evidence includes:

- durable job issue;
- exact content head;
- attempt number;
- final job/report state;
- cumulative course spend and remaining envelope;
- worker executions reused without provider calls;
- worker executions actually performed in the current attempt;
- current artifacts;
- failure detail where present.

The course job itself retains worker/artifact/spend checkpoint comments even if later orchestration fails.

## Assurance

Provider-free regression assurance covers:

- forced mid-course infrastructure failure followed by a fresh-process restart;
- proof that already-successful work units are not executed again;
- proof that only the failed infrastructure unit executes again;
- stable output identity after replay;
- terminal provider-contract failure reuse without another worker call;
- large multi-comment artifact persistence and reconstruction;
- deterministic artifact-reference reuse without duplicate writes;
- cumulative spend carried into a second workflow attempt;
- refusal of a provider request that would breach the original course ceiling after restart;
- exact-head mismatch rejection.

No paid provider calls are required for this assurance.

## Deliberate scope boundary

This increment does **not** claim batch/concurrency maturity. Multi-course parallelism remains gated until single-course live reliability is proven and a real course reaches `expert_review_ready`.

It also does not reuse paid outputs across a changed implementation head. That is conservative by design: targeted cross-version reuse requires explicit dependency/contract invalidation evidence rather than assumptions.

## Documentation impact

No normative authority amendment is required. The active Content Factory Operating Model and v2 implementation plan already require durable jobs, restartability/idempotency, reuse of unchanged successful work, bounded retries and per-job spend controls.

This document records how the live-pilot implementation satisfies those existing requirements. Pilot #6 and Pilot #7 remain historical evidence and are not rewritten.
