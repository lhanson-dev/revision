# Content Factory Durable Resume and Spend

**Implementation status:** durable restart foundation merged via PR #192; dependency-aware restart qualification implemented in Q5; ADR-0019 durable Assessment and Marking Pack candidate recovery implemented through checkpoint 4; completion-first cost-control semantics proposed on 28 September 2026  
**Related initiative:** GitHub Issue #169  
**Normative cost authority:** `60-business-operations/Content Factory Bootstrap Cost Strategy.md`, as amended by `60-business-operations/Content Factory Completion-First Cost Control Amendment.md`

## Purpose

Make the Content Factory economically and operationally restartable so an interrupted, cost-paused or deliberately resumed course job does not repurchase unchanged provider work, while ensuring changes to worker contracts invalidate only the work that genuinely depends on them.

This remains implementation truth. It does not weaken educational authority, source-rights policy, independent review, expert-review requirements or Founder merge governance.

## Durable checkpoint foundation

PR #192 established the GitHub-Issue-backed durable checkpoint layer. A course job exists before the first paid provider call and the durable record stores:

- generated artifacts and deterministic references;
- worker execution results;
- workflow-attempt records;
- cumulative course spend metadata; and
- call-level spend reserve/settle events.

Large records are chunked across issue comments. Incomplete or corrupt records are treated as cache misses rather than trusted state. Infrastructure failures are not reusable because the external condition may have recovered; unchanged terminal provider-contract failures remain reusable to avoid repurchasing the same invalid result.

## Completion-first cost-control semantics

The schema-v1 budget record retains its historical field name `maxSpendUsd` for compatibility. Under the completion-first amendment, the value is interpreted as the **bounded execution slice authorised for each deliberate attempt**, not a lifetime course ceiling.

The spend ledger remains cumulative across all attempts:

- provider-call reservations and observed settlements are never reset on resume;
- attempt 1 authorises one execution slice;
- a deliberate attempt 2 authorises a second equal slice while retaining attempt-1 cumulative spend;
- subsequent deliberate resumes follow the same bounded pattern;
- the ledger exposes both the per-attempt slice and the effective cumulative allowance created by the recorded attempts; and
- every provider call is still refused before execution when its conservative reservation would exceed the allowance authorised by the attempts so far.

The refusal is represented by `ContentFactoryCostPauseError` / `content_factory_cost_pause_required`. It means **checkpoint and resume**. It does not mean the course or content failed educational assurance.

This preserves two controls simultaneously:

1. no workflow attempt can run away with unbounded provider spend; and
2. the factory can still finish a valid course through explicit bounded resumes without discarding accepted work or hiding cumulative spend.

A resume is not a budget reset. Cumulative course cost remains the primary cost evidence.

## Q5 dependency-aware restart

The original PR #192 cache was intentionally conservative: reuse was keyed by worker method, exact input fingerprint and the complete implementation/content-head SHA. Q5 replaced that operational rule with semantic dependency fingerprints for schema-v2 worker cache records.

A reusable execution is identified by:

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
- a Coverage contract change invalidates the Course Knowledge Model and genuinely coverage-dependent Learn, Practice and assessment outputs, while retaining unrelated identity/source-discovery/structured-evidence/Board-Alignment executions; and
- a Git-head-only change with identical worker inputs and identical dependency contracts reuses semantic schema-v2 worker executions.

Exact input fingerprints remain part of the key, so source-data or structured-evidence changes also invalidate workers whose actual inputs change even when contract versions are unchanged.

## Changed-head resume

A resumed job created on an older content head does not continue blindly from its old late-stage state. The current pipeline is replayed from `requested` using the original governed request identity. During that replay, the dependency-aware cache supplies only executions whose exact inputs and semantic dependency fingerprint still match.

This matters because current deterministic validation, rights checks and orchestration must execute under the current approved implementation even when provider outputs can safely be reused.

The cumulative spend ledger remains attached to the same course job across this semantic replay. Reused executions retain their original retry and usage-cost provenance and do not create a second provider charge.

## Cost pause versus educational block

The live-pilot orchestration can still place a job in an operational `blocked` state when an exception prevents the attempt from continuing. A `content_factory_cost_pause_required` reason is explicitly resumable operational state, not `FAIL/HOLD` under the Content Accuracy Assurance Gate.

On the next deliberate resume:

- the durable attempt ledger opens the next bounded execution slice;
- the current pipeline and deterministic gates replay;
- semantic cache reuse supplies compatible accepted provider work;
- cumulative spend includes all prior attempts; and
- only outstanding or genuinely invalidated worker calls are purchased.

Educational blocking/material findings remain governed separately and cannot be bypassed by resuming or increasing an execution slice.

## ADR-0019 Assessment candidate durability

For every governed Assessment Item production slot:

- the slot marker is `assessment-slot:<question-family-id>:<component-id>`;
- each candidate run carries `assessment-slot:<question-family-id>:<component-id>:candidate:<n>`;
- candidate 1 and candidate 2 are separate `generateAssessmentItem` worker executions;
- each candidate permits at most one complete-diagnostic repair inside that candidate execution;
- the factory checkpoints immediately after every rejected or accepted candidate run;
- an accepted candidate worker run carries the accepted assessment artifact in `outputRefs`;
- a rejected candidate carries no accepted artifact output ref and consumes that candidate number;
- restart derives the next candidate number from the canonical worker-run markers; and
- accepted worker evidence that cannot be recovered fails closed rather than being overwritten.

The current durable Assessment boundary remains provider contract `9` / semantic integrity revision `output-integrity-v7`.

## ADR-0019 Marking Pack candidate durability

For every accepted Assessment Item:

- the Marking Pack slot marker is `marking-pack-slot:<assessment-item-id>`;
- candidate 1 and candidate 2 are separate durable `marking_pack` runs;
- the accepted Assessment Item remains frozen throughout pack recovery;
- each candidate permits at most one complete-diagnostic targeted repair;
- candidate rejection is checkpointed before another candidate is generated;
- rejected candidates cannot satisfy coverage or assembly requirements;
- accepted sibling packs remain reusable when another pack fails; and
- exhausted candidate recovery blocks truthfully rather than omitting the Marking Pack.

The durable Marking Pack boundary remains provider contract `5` / semantic integrity revision `output-integrity-v3`.

## Legacy compatibility

Existing schema-v1 worker checkpoint records remain valid but deliberately conservative:

- a v1 worker record is reusable only on its original exact head;
- successful same-head v1 reuse is migrated into a schema-v2 semantic cache record;
- a v1 worker record is never inferred safe across a head change; and
- pre-candidate recovery Assessment/Marking records remain historical execution evidence rather than invented current candidate state.

The budget metadata also remains schema v1. Its `maxSpendUsd` field is retained for storage compatibility but now has execution-slice semantics. Changing the configured slice for an existing job still fails closed so a resume cannot silently rewrite the economic contract of prior attempts.

## Workflow operation

`.github/workflows/content-factory-live-pilot.yml` remains manual, `main`-only and qualification-gated before any external model call. Its optional `resume_job_issue_number` means dependency-aware semantic resume.

Each workflow attempt:

1. loads or creates the durable job and checkpoint store;
2. loads the cumulative spend ledger;
3. records a new deliberate attempt, thereby authorising one additional configured execution slice;
4. replays current deterministic orchestration;
5. reuses compatible worker outputs from durable semantic cache;
6. reserves spend before every genuinely new provider call;
7. checkpoints accepted work as stages/candidates complete; and
8. records cumulative spend and reuse counts in retained evidence.

If a call cannot fit within the current authorised allowance, no provider call is made and the attempt pauses. A later resume continues from durable state.

The workflow still:

- publishes no learner content;
- keeps protected awarding-body inputs within their governed source-use boundaries;
- preserves deterministic and independent assurance requirements; and
- cannot use cost pressure to weaken content quality or trust controls.

## Provider independence

The durable checkpoint model is semantic rather than provider-loyal. Provider/model identity remains execution provenance. A different provider route may be introduced only after satisfying the governed quality, reliability, privacy, rights and worker-contract requirements for that role.

A provider change does not by itself justify repurchasing unrelated accepted work. Reuse remains controlled by exact inputs and semantic dependency contracts.

## Provider-free and live reliability assurance

Durable-store tests prove:

- accepted work survives process restart;
- unchanged terminal provider-contract failures are not repurchased;
- artifacts retain deterministic references across restart;
- a provider call is prevented before it would exceed the currently authorised execution allowance;
- the next deliberate attempt expands the allowance by one bounded slice while retaining cumulative spend; and
- the resumed provider call can then proceed without resetting earlier spend.

Q5 assurance separately proves dependency-aware replay and narrow invalidation across content-head changes.

## Deliberate limitations

- The durable checkpoint backend remains GitHub Issues for the current v0.x proof stage and is replaceable under the existing architecture.
- Dependency safety is explicit rather than inferred: a worker contract or dependency graph change must update the relevant version/graph evidence.
- Legacy v1 worker checkpoints require same-head reuse or migration before semantic cross-head reuse exists.
- Opening another execution slice is a deliberate resume action; the workflow does not recursively buy unlimited slices inside one attempt.
- Cost pause/resume does not approve educational content, remove expert review or change publication eligibility.
- Provider switching remains separately subject to worker-role qualification rather than being automatic fallback.

## Documentation impact

This record now reflects completion-first cost-control semantics: spend remains cumulative, each explicit attempt is bounded, and cost exhaustion pauses rather than making content educationally fail. Historical pilot evidence is not rewritten.
