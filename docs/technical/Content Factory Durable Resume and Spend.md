# Content Factory Durable Resume and Spend

**Implementation status:** durable restart foundation merged via PR #192; dependency-aware restart qualification implemented in Q5 branch on 28 August 2026  
**Current approved baseline reviewed for Q5:** `93b6bd9c2bb29d4c2150710eef79becc76525d69`  
**Related initiative:** GitHub Issue #169

## Purpose

Make the Content Factory economically and operationally restartable so an interrupted or deliberately resumed course job does not repurchase unchanged provider work, while ensuring changes to worker contracts invalidate only the work that genuinely depends on them.

This is implementation truth under the existing Content Factory Operating Model and Reliability Qualification Standard. It does not change educational authority, source-rights policy, independent review, expert-review requirements or Founder merge governance.

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

## Legacy compatibility

Existing schema-v1 worker checkpoint records remain valid but deliberately conservative:

- a v1 record is reusable only on its original exact head;
- a successful same-head v1 reuse is migrated into a schema-v2 semantic cache record;
- a v1 record is never inferred safe across a head change;
- therefore the first cross-head resume of an old v1-only job may regenerate provider work before future semantic reuse becomes available.

This fail-closed migration avoids inventing dependency evidence that historical records did not capture.

## Workflow operation

`.github/workflows/content-factory-live-pilot.yml` remains manual, `main`-only and qualification-gated before any external model call. Its optional `resume_job_issue_number` now means dependency-aware semantic resume rather than exact-head-only resume.

The workflow still:

- publishes no learner content;
- keeps AQA `REFERENCE_ONLY`;
- does not send protected AQA source prose to generative workers; and
- cannot make paid model calls while `content-factory/reliability-qualification.json` remains unqualified.

Q5 does not itself authorize another paid pilot.

## Q5 provider-free assurance

`src/content-factory/q5-dependency-aware-resume.test.ts` proves:

- the dependency policy covers every durable worker boundary and is acyclic;
- a head-only change reuses all unchanged semantic executions;
- a Practice contract change has the required narrow invalidation boundary;
- an assessment compiler change does not invalidate Learn/Practice;
- a Coverage contract change propagates only through genuine downstream dependants;
- reused executions preserve retry and usage-cost provenance;
- cumulative spend is retained across changed-head replay without double charging reused work; and
- a changed-head late-stage job is replayed from the governed request rather than trusted as current.

The machine-readable Q5 evidence record is `content-factory/reliability-q5-restart-reuse-invalidation.json`.

## Deliberate limitations

- The durable checkpoint backend remains GitHub Issue comments for the current v0.x proof stage and is replaceable under the existing architecture.
- Dependency safety is explicit rather than inferred: a worker contract or dependency graph change must update the relevant version/graph evidence.
- Legacy v1 checkpoints require same-head reuse or regeneration before semantic cross-head reuse exists.
- Q5 proves restart, reuse, invalidation, spend and provenance mechanics; it does not prove educational correctness.
- Q6 repeated qualification stability remains required.
- `expert_review_ready` still does not mean learner-published, benchmark-approved or awarding-body endorsed.

## Documentation impact

Q5 changes current implementation behaviour and therefore updates this technical record and the Reliability Qualification Harness. No normative authority change is required: the active Reliability Qualification Standard already requires dependency-aware invalidation and explicitly prohibits implementation-head identity from remaining a universal semantic invalidation key. Historical pilot evidence is not rewritten.