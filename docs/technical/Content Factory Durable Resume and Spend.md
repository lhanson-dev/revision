# Content Factory Durable Resume and Spend

**Implementation status:** durable restart foundation merged via PR #192; dependency-aware restart qualification implemented in Q5; ADR-0019 durable Assessment and Marking Pack candidate recovery implemented through checkpoint 4; post-Pilot #21 Assessment wording ownership is current at provider contract 9 / `output-integrity-v7`; Q8 confirmation-pilot eligibility restored via PR #286  
**Current approved baseline for checkpoint 4:** `05df69add84541adaa0e487f78a8a0757900bf80`  
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

PR #263 introduced bounded two-candidate Assessment Item recovery, but the candidate loop still lived inside one worker invocation. Checkpoint 3 moved candidate sequencing to the assessment factory/orchestration boundary so the existing canonical `workerRuns[]` record became the durable candidate-attempt ledger rather than introducing a parallel state model.

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

The current durable Assessment boundary is:

- generic Assessment Item input contract: `3`;
- live provider Assessment Item contract: `9`;
- durable semantic integrity revision: `output-integrity-v7`.

Post-Pilot #21, the provider authors the educational `subquestions[].wording` once and Revision deterministically composes the duplicated top-level `questionWording`. The `output-integrity-v7` change invalidates pre-fix Assessment Item outputs and genuine downstream Marking Pack/assurance dependants while leaving unrelated Learn and Practice artifacts reusable when their own inputs and contracts are unchanged.

## ADR-0019 Marking Pack candidate durability

Checkpoint 4 applies the same durable candidate pattern to each Marking Pack without invalidating the accepted question it depends on.

For every accepted Assessment Item:

- the Marking Pack slot marker is `marking-pack-slot:<assessment-item-id>`;
- each candidate run also carries `marking-pack-slot:<assessment-item-id>:candidate:<n>`;
- candidate 1 and candidate 2 are separate `generateMarkingPack` worker executions recorded as canonical `marking_pack` runs;
- the accepted Assessment Item artifact/reference is an exact input to both candidates and remains frozen throughout pack recovery;
- each Marking Pack candidate permits at most one complete-diagnostic targeted repair;
- candidate 1 rejection is checkpointed immediately and restart derives candidate 2 from the durable worker-run ledger;
- candidate 2 is generated fresh from the same accepted question, Question Family and governed knowledge inputs rather than patching candidate 1;
- a rejected candidate has no accepted output ref and does not enter `markingPackCoverage`;
- therefore rejected candidates cannot satisfy the required dependent-artifact slot or allow course assembly to continue with a missing pack;
- if both candidates exhaust their recovery allowance, the course blocks explicitly rather than omitting the Marking Pack;
- an accepted candidate is checkpointed together with its `markingPackCoverage` entry before later sibling packs are attempted;
- accepted sibling packs remain reusable when another pack fails;
- accepted Marking Pack worker evidence whose coverage/artifact cannot be recovered fails closed rather than allowing an overwrite.

The durable Marking Pack boundary remains:

- generic Marking Pack input contract: `3`;
- live provider Marking Pack contract: `5`;
- durable semantic integrity revision: `output-integrity-v3`.

This version prevents pre-checkpoint-4 Marking Pack executions from being inferred reusable across a changed-head replay when they do not carry candidate-aware semantics. Independent review remains a genuine downstream dependency and is invalidated; unrelated Learn/Practice work is not.

## Legacy compatibility

Existing schema-v1 worker checkpoint records remain valid but deliberately conservative:

- a v1 record is reusable only on its original exact head;
- a successful same-head v1 reuse is migrated into a schema-v2 semantic cache record;
- a v1 record is never inferred safe across a head change;
- therefore the first cross-head resume of an old v1-only job may regenerate provider work before future semantic reuse exists.

Pre-checkpoint-3 Assessment runs without deterministic candidate markers and pre-checkpoint-4 Marking Pack runs without deterministic Marking Pack candidate markers remain historical execution evidence. They are not treated as proof that a candidate number has been consumed under the new durable topology.

This fail-closed migration avoids inventing dependency evidence that historical records did not capture.

## Workflow operation

`.github/workflows/content-factory-live-pilot.yml` remains manual, `main`-only and qualification-gated before any external model call. Its optional `resume_job_issue_number` means dependency-aware semantic resume.

The durable live-pilot runner passes its existing GitHub-Issue `checkpointJob` callback into the Assessment/Marking factory. Assessment Item and Marking Pack candidate acceptance/rejection can therefore be persisted during the assessment stage rather than only after the entire Assessment/Marking stage returns.

The workflow still:

- publishes no learner content;
- keeps AQA `REFERENCE_ONLY`;
- does not send protected AQA source prose to generative workers; and
- cannot make paid full-course model calls while `content-factory/reliability-qualification.json` remains unqualified.

Q8 has now completed through PR #286. The machine-readable qualification is `qualified` with `livePilotEligible: true`, so the next paid run class is a confirmation pilot. For the current lineage, that run is the continuation of Pilot #21 by resuming durable job Issue #281 rather than starting a new course.

## Provider-free and live reliability assurance

Q5 assurance proves dependency-aware replay, narrow invalidation and cumulative spend mechanics.

Assessment and Marking Pack candidate-state tests prove, at their implementation boundaries:

- deterministic slot/candidate markers;
- reconstructing the next candidate after a durably recorded rejection;
- preserving accepted Assessment Items while a dependent Marking Pack is rejected and replaced;
- preserving unrelated accepted sibling work;
- rejecting factory-validation failures as candidate scrap without adding accepted coverage;
- truthful blocking after the two-candidate ceiling is exhausted;
- interruption after candidate 1 followed by resume at candidate 2 without regenerating accepted questions; and
- semantic-version advancement so pre-recovery Marking Pack executions cannot be reused as candidate-aware current work.

After Confirmation Pilot #21, provider-free Q1-Q6 were requalified on the corrected Assessment wording boundary and the fresh Q7 attempt 007 live-worker soak passed 20/20 samples across all five governed subject shapes. Q1-Q7 are reliability qualification evidence rather than educational benchmark approval; the separate Q8 transition has now restored confirmation-pilot eligibility.

## Deliberate limitations

- The durable checkpoint backend remains GitHub Issues for the current v0.x proof stage and is replaceable under the existing architecture.
- Dependency safety is explicit rather than inferred: a worker contract or dependency graph change must update the relevant version/graph evidence.
- Legacy v1 checkpoints require same-head reuse or regeneration before semantic cross-head reuse exists.
- Durable Assessment Item and Marking Pack candidate recovery does not by itself prove whole-course recovery/coverage completeness under all downstream failure shapes.
- Q8 eligibility permits the confirmation continuation of Pilot #21, but does not establish Content Factory maturity; the governed maturity criterion still requires three consecutive materially different real courses to reach `expert_review_ready` without engineering correction between those course runs.
- `expert_review_ready` still does not mean learner-published, benchmark-approved or awarding-body endorsed.

## Documentation impact

This record now reflects the current post-Pilot #21 Assessment provider contract `9`, durable semantic `output-integrity-v7`, completed Q1-Q7 reliability position, and completed Q8 confirmation-pilot eligibility transition. No normative authority change is required: ADR-0019 and the active Reliability Qualification Standard already require durable bounded candidate recovery, smallest-safe-scope preservation, fail-closed exhaustion and dependency-aware invalidation. Historical pilot evidence is not rewritten.
