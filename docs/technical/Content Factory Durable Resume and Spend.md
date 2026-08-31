# Content Factory Durable Resume and Spend

**Implementation status:** durable restart foundation merged via PR #192; dependency-aware restart qualification implemented in Q5; ADR-0019 Assessment candidate durability implementation checkpoint 3 in progress  
**Current approved baseline for checkpoint 3:** `c6f27bd735018690457f96b1d7014b319bc3dfb4`  
**Related initiative:** GitHub Issue #169

## Purpose

Make the Content Factory economically and operationally restartable so an interrupted or deliberately resumed course job does not repurchase unchanged provider work, while ensuring changes to worker contracts invalidate only the work that genuinely depends on them.

This is implementation truth under the existing Content Factory Operating Model, ADR-0019 and Reliability Qualification Standard. It does not change educational authority, source-rights policy, independent review, expert-review requirements or Founder merge governance.

## Durable checkpoint foundation

PR #192 established the GitHub-Issue-backed durable checkpoint layer. A course job exists before the first paid provider call and the durable record stores:

- generated artifacts and deterministic references;
- worker execution results;
- workflow-attempt records;
- cumulative course spend metadata;
- call-level spend reserve/settle events.

Large records are chunked across issue comments. Incomplete or corrupt records are treated as cache misses rather than trusted state. Infrastructure failures are not reusable because the external condition may have recovered; unchanged terminal provider-contract failures remain reusable to avoid repurchasing the same invalid result.

The course spend ceiling remains cumulative across workflow attempts. Provider calls reserve a conservative amount before execution and settle to observed cost when usage is available. If transport failure leaves charging uncertain, the reservation remains counted.

## Q5 dependency-aware restart

The original PR #192 cache was intentionally conservative: reuse was keyed by worker method, exact input fingerprint and the complete implementation/content-head SHA. The original spend ledger also rejected any changed-head resume. That was safe for early pilots but made Git commit identity a universal invalidation key.

Q5 replaces that operational rule with semantic dependency fingerprints for new schema-v2 worker cache records.

A reusable execution is now identified by:

1. exact worker method;
2. exact canonical input fingerprint; and
3. a transitive dependency fingerprint derived from the worker's governed contract version and the contract versions of upstream worker boundaries on which it semantically depends.

The Git head that originally executed the worker remains recorded as provenance, but it is no longer part of the semantic cache key.

`src/content-factory/durable-worker-dependencies.ts` contains the explicit dependency graph. `src/content-factory/q5-durable-resume.ts` implements dependency-aware cache lookup, cross-head provenance reporting, spend-ledger loading and semantic job replay.

## Dependency behaviour

The Q5 dependency graph deliberately separates independent branches of work.

Examples:

- a Practice compiler contract change invalidates Practice and assurance work that reviews it, but does not invalidate the Course Knowledge Model, Learn or independent assessment-generation branch;
- an Assessment Blueprint compiler contract change invalidates the assessment branch and assurance work, but does not invalidate Learn or Practice;
- a Coverage contract change invalidates the Course Knowledge Model and genuinely coverage-dependent Learn, Practice and assessment outputs, while retaining unrelated identity/source-discovery/structured-evidence/Board-Alignment executions;
- a Git-head-only change with identical worker inputs and identical dependency contracts reuses all semantic schema-v2 worker executions.

Exact input fingerprints remain part of the key, so source-data or structured-evidence changes also invalidate workers whose actual inputs change even when contract versions are unchanged.

## Changed-head resume

A resumed job created on an older content head does not continue blindly from its old late-stage state. The current pipeline is replayed from `requested` using the original governed request identity. During that replay, the dependency-aware cache supplies only executions whose exact inputs and semantic dependency fingerprint still match.

This matters because current deterministic validation, rights checks and orchestration must execute under the current approved implementation even when provider outputs can safely be reused.

The cumulative spend ledger remains attached to the same course job across this semantic replay. Reused executions retain their original retry and usage-cost provenance and do not create a second provider charge.

## ADR-0019 Assessment candidate durability

PR #263 introduced bounded two-candidate Assessment Item recovery, but the candidate loop still lived inside one worker invocation. That meant the job payload could record only the final combined execution; it could not reconstruct candidate 1 rejection versus candidate 2 acceptance after an interruption.

Implementation checkpoint 3 makes the existing canonical `workerRuns[]` record the durable candidate-attempt ledger rather than introducing a parallel job-state model.

For every governed Assessment Item production slot:

- the slot marker is `assessment-slot:<question-family-id>:<component-id>`;
- each candidate run also carries `assessment-slot:<question-family-id>:<component-id>:candidate:<n>`;
- candidate 1 and candidate 2 are separate `generateAssessmentItem` worker executions;
- each candidate still permits at most one complete-diagnostic repair inside that candidate execution;
- the factory checkpoints the job immediately after every rejected or accepted candidate run;
- an accepted candidate worker run carries the accepted assessment artifact in `outputRefs`;
- a rejected candidate carries no accepted artifact output ref and consumes that candidate number;
- restart derives the next candidate number from the canonical worker-run markers;
- if a terminal candidate execution was cached but the process stopped before the job checkpoint, replaying the exact candidate input can reuse that dependency-aware cached execution without another provider charge;
- if accepted worker-run evidence exists but its artifact cannot be recovered, the factory fails closed rather than silently generating replacement content over the accepted slot.

This is deliberately not a new generic retry loop. The candidate ceiling remains exactly two; candidate numbers are part of the exact worker input fingerprint; cumulative spend remains enforced by the existing durable course ledger.

### Worker version/invalidation correction

Checkpoint 3 also closes a semantic-cache versioning gap exposed during review of PR #263.

The live Assessment Item provider boundary had advanced to contract v7, but the dependency-aware cache fingerprint still used the older generic Assessment contract plus `output-integrity-v5`. That could allow a changed-head semantic replay to treat a pre-recovery execution as reusable even though candidate lifecycle semantics had materially changed.

The durable Assessment boundary now advances to:

- generic Assessment Item input contract: `3`;
- live provider Assessment Item contract: `8`;
- durable semantic integrity revision: `output-integrity-v6`.

Because Marking Pack and assurance dependency closures already depend on `generateAssessmentItem`, those genuine downstream dependants are invalidated automatically. Learn and Practice remain independently reusable when their own inputs/contracts are unchanged.

## Legacy compatibility

Existing schema-v1 worker checkpoint records remain valid but deliberately conservative:

- a v1 record is reusable only on its original exact head;
- a successful same-head v1 reuse is migrated into a schema-v2 semantic cache record;
- a v1 record is never inferred safe across a head change;
- therefore the first cross-head resume of an old v1-only job may regenerate provider work before future semantic reuse becomes available.

Pre-checkpoint-3 Assessment runs without deterministic candidate markers remain historical execution evidence. A successfully persisted Assessment Item artifact can still be reused through the existing artifact/worker-run path when its dependency evidence remains valid; old combined candidate-loop executions are not treated as evidence that a new durable candidate number has been consumed under the checkpoint-3 topology.

This fail-closed migration avoids inventing dependency evidence that historical records did not capture.

## Workflow operation

`.github/workflows/content-factory-live-pilot.yml` remains manual, `main`-only and qualification-gated before any external model call. Its optional `resume_job_issue_number` means dependency-aware semantic resume.

The durable live-pilot runner now passes its existing GitHub-Issue `checkpointJob` callback into the Assessment/Marking factory. Assessment candidate acceptance/rejection is therefore persisted during the Assessment stage rather than only after the entire Assessment/Marking stage returns.

The workflow still:

- publishes no learner content;
- keeps AQA `REFERENCE_ONLY`;
- does not send protected AQA source prose to generative workers; and
- cannot make paid model calls while `content-factory/reliability-qualification.json` remains unqualified.

Checkpoint 3 does not itself authorize another paid pilot.

## Provider-free assurance

Existing Q5 assurance continues to prove dependency-aware replay, narrow invalidation and cumulative spend mechanics.

Checkpoint 3 adds provider-free tests for the Assessment candidate ledger itself, including:

- deterministic slot/candidate markers;
- reconstructing the next candidate after a durably recorded rejection;
- ignoring unrelated generation runs;
- preserving infrastructure failures as non-candidate failures; and
- distinguishing deterministic candidate validation rejection from infrastructure failure.

The wider Assessment/Marking suite and exact-head CI remain responsible for proving that these markers are integrated into the actual assessment factory without weakening existing assessment/Marking Pack validation.

## Deliberate limitations

- The durable checkpoint backend remains GitHub Issues for the current v0.x proof stage and is replaceable under the existing architecture.
- Dependency safety is explicit rather than inferred: a worker contract or dependency graph change must update the relevant version/graph evidence.
- Legacy v1 checkpoints require same-head reuse or regeneration before semantic cross-head reuse exists.
- Durable Assessment candidate state does not yet provide Marking Pack candidate recovery.
- Course-level recovery semantics after downstream candidate exhaustion remain a separate ADR-0019 implementation slice.
- The Content Factory remains paused and requires provider-free requalification, bounded live soak and separate Q8 before another full-course confirmation run.
- `expert_review_ready` still does not mean learner-published, benchmark-approved or awarding-body endorsed.

## Documentation impact

Checkpoint 3 changes current implementation behaviour and therefore updates this technical record, the Content Factory Architecture and the Reliability Qualification Harness. No normative authority change is required: ADR-0019 and the active Reliability Qualification Standard already require durable bounded candidate recovery and dependency-aware invalidation. Historical pilot evidence is not rewritten.
