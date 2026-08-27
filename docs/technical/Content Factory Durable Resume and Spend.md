# Content Factory Durable Resume and Spend

**Implementation status:** governed implementation on PR #192; exact-head Revision CI #1097 green on 27 August 2026; awaiting Founder merge approval and production verification  
**Date:** 27 August 2026  
**Related initiative:** GitHub Issue #169  
**Preceding increment:** PR #191 — Provider Contract Hardening

## Purpose

Make the live Content Factory economically and operationally restartable so an interrupted course job does not have to repurchase unchanged model work and the per-course spend ceiling remains cumulative across workflow attempts.

This is implementation truth under the existing Content Factory Operating Model and v2 implementation plan. It does not change educational authority, source-rights policy, independent review, expert-review requirements or Founder merge governance.

## Implemented boundary

PR #192 adds a GitHub-Issue-backed durable checkpoint layer for the existing manual Content Factory live pilot. The course job exists before the first paid provider call. Exact worker executions and generated artifacts are persisted against deterministic fingerprints so a later workflow attempt can reuse unchanged successful work rather than paying for it again.

The implementation also persists a course-level spend ledger. The configured $20 pilot ceiling applies to the cumulative course job across workflow attempts rather than resetting when a new process starts. Provider calls reserve a conservative amount before execution and settle to observed cost after a completed response. If a transport failure leaves provider charging uncertain, the reservation remains counted rather than assuming zero cost.

Resume is fail-closed to the exact implementation/content-head SHA that created the job. Cross-version reuse is deliberately not inferred because stronger dependency and invalidation evidence would be required.

## Durable evidence

The course GitHub Issue remains the v0.x operational job record. Durable checkpoint comments store:

- artifact values and deterministic references;
- worker execution results keyed by exact worker method, exact input fingerprint and content-head SHA;
- workflow-attempt records;
- cumulative spend metadata and call-level reserve/settle events.

Large records are chunked across comments and reconstructed only when every chunk is present and valid. Incomplete or corrupt records are treated as cache misses rather than trusted state.

## Resume behaviour

On a resumed workflow attempt:

1. load the existing course job and checkpoint comments;
2. verify the original content-head SHA and course spend ceiling;
3. reconstruct durable artifacts;
4. replay the existing orchestrator deterministically;
5. return cached exact-input successful worker executions without making provider calls;
6. return cached unchanged terminal provider-contract failures without buying the same invalid result again;
7. allow infrastructure failures to execute again because the external condition may have recovered;
8. checkpoint the resulting machine-readable job and attempt evidence.

This deliberately reuses the existing stage/orchestrator semantics instead of creating a second recovery pipeline.

## Workflow operation

`.github/workflows/content-factory-live-pilot.yml` retains manual `workflow_dispatch` and `main`-only execution. It now accepts optional `resume_job_issue_number`.

- Omit the input to create a new durable pilot course job.
- Supply the existing course-job issue number to resume that exact job.
- A resume from a different implementation/content-head SHA fails closed.
- The workflow continues to publish no learner content.
- AQA remains `REFERENCE_ONLY` and protected AQA source prose is not passed to generative workers.

## Failure evidence

Unexpected early pipeline exceptions are converted into a durable blocked job record and checkpointed before the workflow fails. Completed-attempt evidence is written for blocked and successful runs, including cumulative spend and worker-reuse counts.

This removes the Pilot #7 failure mode where useful provider work could disappear with the process before a durable course record existed.

## Assurance

Provider-free regression assurance covers:

- a forced mid-course infrastructure failure;
- a fresh-process restart from the same durable comment store;
- completed work-unit results reused rather than executed again;
- only the failed infrastructure unit executing again;
- unchanged terminal provider-contract failures reused without another worker call;
- large multi-comment artifact persistence and reconstruction;
- deterministic artifact references and idempotent duplicate writes;
- cumulative spend carried across workflow attempts;
- refusal before a provider call when the original course ceiling would be exceeded;
- exact-head mismatch rejection.

Exact-head Revision CI #1097 completed successfully on PR head `51b9180178ccf466f85a0c08c53e28f701de3be2`, covering secret scan, typecheck, lint, unit tests, production build, responsive browser assurance, database/RLS assurance and protected-service/browser integration assurance. This is pre-merge evidence only; post-merge CI and production deployment remain required before another paid pilot is permitted.

## Deliberate limitations

- The durable checkpoint backend is intentionally lightweight GitHub Issue comments for the current v0.x proof stage; it is replaceable under the existing architecture.
- Reuse is limited to the same implementation/content-head SHA.
- Batch and concurrent multi-course execution remain gated.
- This increment does not prove educational quality; the next paid AQA AS Business live pilot remains the proof that generation can progress through independent review after reliability hardening.
- `expert_review_ready` will still not mean learner-published, benchmark-approved or awarding-body endorsed.

## Documentation impact

No normative authority change is required. Existing Content Factory authority already requires durable jobs, safe restart/idempotency, unchanged-output reuse, bounded retries and per-job spend controls. This record documents how PR #192 implements those requirements. Historical Pilot #6 and Pilot #7 evidence remains unchanged.