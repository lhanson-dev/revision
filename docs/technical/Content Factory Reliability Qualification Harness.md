# Content Factory Reliability Qualification Harness

## Status

The Content Factory has completed the post-Confirmation-Pilot #20 Reliability v2.0 requalification sequence.

- Post-Pilot #20 Q1–Q6 provider-free candidate-recovery qualification: **PASS**.
- Post-Pilot #20 Q7 candidate-aware bounded live-worker soak attempt 6: **PASS**.
- Q8 confirmation-pilot eligibility: **restored by this separate governed state transition once merged**.
- Machine state after Q8: **`qualified`**.
- `livePilotEligible` after Q8: **`true`**.
- Next paid run class: **one bounded `confirmation_pilot`**.
- Q8 itself performs **no provider call, full-course execution, course assembly or learner publication**.
- Content Factory maturity remains **not achieved**.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Cost authority: `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current Q8 evidence: `content-factory/reliability-v2-f-q8-eligibility-003.json`.

Current Q7 PASS evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`.

Current provider-free Q1–Q6 evidence: `content-factory/reliability-post-pilot20-q1-q6-consolidation.json`.

Architecture decision: `decisions/ADR-0019-content-factory-candidate-recovery.md`.

No educational assurance requirement is lowered by this transition. `80-company-workflows/Content Accuracy Assurance Gate.md` remains the authority for trusted learner content.

## Reliability objective

The post-Pilot #20 objective is no longer to prove that individual model calls are usually valid. It is to prove that the **production system remains reliable when ordinary model candidates are invalid**.

The target is:

`deterministic production slot → generated candidate → complete diagnostics → accept or reject → bounded automatic resampling/recovery → freeze accepted artifact → dependent generation/assurance → expert_review_ready`

A rejected candidate is expected production scrap. It is not itself a course failure.

The factory is reliable only when it can recover automatically from expected candidate variability while retaining all educational assurance and spend controls.

A second hard invariant applies to completeness: **reject attempts, not requirements**. A rejected candidate cannot satisfy a required curriculum or dependent-artifact slot. Each mandatory requirement must terminate in accepted required coverage/artifacts or an explicit blocking state; silent omission is not a valid recovery outcome.

## Success definition: trusted and repeatable

The Content Factory succeeds only when both of these outcomes are demonstrated together:

1. **Trusted content** — the resulting Learn, Practice, Assessment Item and Marking Pack artifacts satisfy the applicable A1–A4 accuracy/assurance controls, independent educational challenge and later qualified human benchmark review. Finishing the pipeline is not evidence that content can be trusted by students.
2. **Repeatable production** — materially different new courses can traverse the same generic production contracts without course-specific engineering changes, prompt/worker-contract correction after observing a course failure, or manual rescue of ordinary rejected candidates.

This is the scale target for adding courses. Neither first-pass provider perfection nor one successful Business course is sufficient evidence.

## Why the post-Pilot #19 qualification was insufficient

Historical Reliability v2 qualification had previously reached Q1–Q7 PASS and a separate Q8 transition made Pilot #19 eligible.

Pilot #19 exposed the generic Assessment Item engineering-contract class:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

The deterministic validator incorrectly treated every `responseDemands[]` value as requiring independent lexical proof in the learner-facing command. That was valid for explicit operational demands such as calculation, interpretation, analysis and evaluation, but invalid for structurally valid selection MCQs whose educational cognitive classification was `knowledge` or `application`.

The factory returned to `paused`, the Assessment Item boundary was corrected and Reliability v2 Q1–Q7 was repeated.

The fourth bounded live soak then accepted 20/20 Assessment Item and Marking Pack samples across all five governed subject shapes. A separate Q8 restored confirmation-pilot eligibility.

That evidence was real, but Pilot #20 exposed a property that the qualification did not prove: **automatic recovery of a real production assessment topology when more than one independent defect exists and an individual candidate is rejected**.

The qualification therefore tested the production validators and compilers but did not sufficiently prove the production failure/recovery topology.

## Confirmation Pilot #20

Pilot #20 ran on approved `main`:

`b240ea9b6e2d56a644048c6085162c58429aef33`

Workflow:

`33420994194`

Job issue:

`#260`

Artifact:

- ID `9769262820`
- digest `sha256:155b3e5d229e82c7d5f2af7e1b43f2ae7050f53a8ccd198c8de5c800a6b35b6d`

Observed:

- 13 Learn/Practice work units planned;
- 13/13 Learn/Practice work units completed;
- 5 Question Families produced;
- 37 total worker executions;
- 30 provider worker executions;
- known provider spend **US$0.670708**;
- zero human interventions;
- zero markable Assessment Items accepted before the run blocked;
- no learner publication;
- final state `blocked` rather than `expert_review_ready`.

The first Assessment Item candidate failed calculation-demand validation for q1. The one complete-candidate repair corrected that failure but then exposed an interpretation-demand failure for q5.

The resulting production error was:

`assessment_item_v2_after_complete_diagnostic_repair`

### Generic root cause

The failure is classified as:

`assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`

Two production behaviours were coupled:

1. `diagnoseAssessmentItemV2Candidate()` ran the semantic structured validator in a `try/catch`. The validator could throw after the first safely inspectable semantic defect, so that one thrown error could be presented to the repair worker as though it were the complete diagnostic set.
2. `runAssessmentAndMarkingFactory()` converted an Assessment Item or Marking Pack worker failure directly into `blockJob(...)`. A rejectable candidate therefore became a course-level blocker rather than a bounded candidate-level recovery event.

This is generic architecture. It is not an AQA Business-specific educational defect.

## Stop-loss history

Pilots #19 and #20 were two consecutive confirmation-course attempts exposing generic engineering classes.

Reliability Standard v2.0 therefore prohibited a third full-course confirmation merely to discover the next failure and required the affected production architecture to change and be requalified.

That stop-loss is retained as historical truth. The post-Pilot #20 Q1–Q8 sequence described below is the governed evidence that now permits one further confirmation-pilot run class.

Maturity remains:

**0 consecutive materially different real courses reaching `expert_review_ready` without engineering/worker-contract correction between runs.**

## Candidate-recovery architecture

ADR-0019 defines the replacement production model.

### Deterministic production slots

The factory plans the required assessment inventory from governed Assessment Blueprint / Question Family constraints.

Mechanically provable properties belong to Revision/compiler ownership where educational meaning is not lost.

### Candidate generation

A model output is not canonical content merely because the provider call succeeded. It is a candidate.

Candidates must pass compilation and deterministic/educational checks before acceptance.

### Candidate rejection and replacement

A rejected candidate is discarded from canonical course content and automatically resampled within a bounded retry/candidate/spend policy.

Fresh resampling is preferred to repeatedly rewriting a complex candidate where semantic variation is the failure source.

### Smallest-safe recovery

- invalid subquestion → replace/recover the smallest safely independent question slot;
- invalid Assessment Item → replace that item without regenerating accepted siblings;
- invalid Marking Pack → replace that pack while preserving the frozen accepted Assessment Item;
- shared case/stimulus → validate and freeze context before independently generating dependent slots where the assessment shape permits it.

### Required-slot completeness

Candidate rejection never changes what the governed course requires.

- an Assessment slot remains unfilled until an Assessment Item candidate is accepted;
- a markable accepted Assessment Item remains incomplete for course assembly until an accepted Marking Pack exists for it;
- rejected Assessment/Marking candidates carry no accepted artifact/coverage reference;
- bounded recovery exhaustion creates an explicit blocker;
- `expert_review_ready` qualification must fail if any mandatory coverage or required dependent artifact is absent.

### Course-level blocker

The course becomes blocked only when automation cannot safely recover, for example:

- unresolved identity/learner option;
- source-rights ambiguity;
- unrecoverable authority/coverage problem;
- material educational ambiguity that cannot safely be automated;
- exhausted governed candidate/retry/spend ceiling;
- non-recoverable infrastructure state.

An ordinary bad candidate is not itself a course blocker.

## Implementation checkpoint 1 — complete Assessment Item diagnostics

The first production slice of ADR-0019 addressed the Pilot #20 diagnostic defect without claiming the wider recovery topology was complete.

Implemented in the shared Assessment Item integrity boundary:

- a non-throwing `diagnoseStructuredAssessment()` API returns all safely inspectable structured-assessment findings for a parseable artifact;
- it aggregates duplicate IDs, mark-total mismatch, duplicate requirement references, unsupported response demands, MCQ contract findings, coverage-evidence duplication/mismatch, invalid coverage excerpts and governed-requirement mismatch;
- schema-unparseable subquestion input returns the available schema issue set and does not pretend later semantic checks are safe;
- `validateStructuredAssessment()` remains as a fail-fast compatibility API, now backed by the aggregate diagnostics and throwing the first finding for existing callers;
- `diagnoseAssessmentItemV2Candidate()` uses the aggregate API before the provider repair call;
- Assessment Item worker/repair contract version moved from `5` to `6` because the repair input contract materially changed;
- a direct shared-validator regression and a worker-boundary Pilot #20 regression prove simultaneous calculation- and interpretation-demand defects are surfaced together;
- the worker regression proves those two defects can be corrected in the existing single permitted targeted repair call rather than serially discovered across separate runs.

Checkpoint 1 established the diagnostic foundation but did not itself add fresh candidate resampling or the wider recovery topology.

## Implementation checkpoint 2 — bounded Assessment Item candidate resampling

The second production slice moved ordinary post-repair Assessment Item rejection from immediate worker failure into a bounded fresh-candidate loop.

Implemented initially at the Assessment Item worker boundary:

- Assessment Item generation/repair contract version moved from `6` to `7`;
- each governed Assessment Item / Question Family slot may generate at most **two fresh candidates**;
- each candidate may receive at most **one** complete-diagnostic targeted repair;
- candidate 2 is a fresh generation from the governed slot inputs and policy and is not instructed to patch or preserve rejected candidate 1 wording;
- a valid first-pass candidate continues to use one provider call and zero recovery calls;
- the worker accumulates usage cost and retry/resampling provenance across generation, repair and fresh resample calls;
- candidate 1 can fail diagnostics after its repair and candidate 2 can still be accepted automatically without returning a worker failure;
- if candidate 2 also remains invalid after its one repair, the worker fails closed with `assessment_item_v2_candidate_recovery_exhausted` and records both rejection summaries;
- no candidate 3 is permitted, so the recovery loop is mechanically bounded;
- provider-free regressions prove successful candidate-2 recovery and truthful exhaustion after both candidates.

Checkpoint 2 did **not** make the candidate sequence durable. The two-candidate loop still lived inside one worker execution, so a job restart could not reconstruct candidate 1 rejection versus candidate 2 acceptance from canonical job state.

## Implementation checkpoint 3 — durable Assessment Item slot/candidate state

The third production slice moved candidate sequencing into the assessment factory/orchestration boundary and made every Assessment Item candidate attempt durable.

Implemented in the production Assessment path:

- each Assessment Item candidate attempt is a separate `generation` worker execution;
- `workerRuns[]` remains the canonical operational state rather than adding a parallel recovery-state model;
- deterministic input refs identify the production slot as `assessment-slot:<question-family-id>:<component-id>` and each candidate as `...:candidate:<n>`;
- the factory derives the next candidate number from those persisted worker runs;
- rejected and accepted candidate runs are checkpointed to the GitHub-Issue job record immediately, before later Assessment siblings or Marking Packs are generated;
- the accepted worker run carries the frozen Assessment Item artifact in `outputRefs`; rejected candidates carry no accepted artifact ref but durably consume their candidate number;
- the factory owns the two-candidate ceiling and passes the exact candidate number to the Assessment worker;
- the live Assessment provider boundary advances from contract `7` to `8`; one complete-diagnostic repair remains the maximum within each candidate;
- the generic Assessment Item input contract advances from `2` to `3` because candidate number is now an orchestration-owned worker input;
- the dependency-aware durable semantic version advances from `output-integrity-v5` to `output-integrity-v6`, preventing pre-durable candidate executions from being reused across a changed-head replay;
- candidate-specific exact inputs allow a terminal cached execution to be reused without another provider call if a process stops after the worker finishes but before its job checkpoint is persisted;
- accepted sibling artifacts remain frozen; if accepted worker-run evidence exists but the referenced artifact cannot be recovered, the factory fails closed rather than regenerating over accepted work;
- provider/infrastructure failures remain distinct from candidate rejection and are not silently consumed as candidate scrap;
- direct non-orchestrated Assessment worker callers retain the same bounded two-candidate fallback for compatibility, while production orchestration supplies one exact candidate at a time.

Checkpoint 3 was implementation evidence only and did not yet provide the dependent Marking Pack recovery path.

## Implementation checkpoint 4 — durable Marking Pack candidate recovery

The fourth production slice makes Marking Pack recovery independent, bounded and durable while preserving the accepted Assessment Item.

Implemented in the production Assessment/Marking path:

- each accepted Assessment Item defines a required Marking Pack slot `marking-pack-slot:<assessment-item-id>`;
- each Marking Pack candidate attempt is a separate canonical `marking_pack` worker execution with `...:candidate:<n>` input evidence;
- the factory derives candidate sequence from persisted `workerRuns[]` and owns a hard two-candidate ceiling;
- the live Marking Pack provider contract advances from `4` to `5` and accepts orchestration-owned candidate number/max-candidate inputs;
- each candidate may receive at most one complete-diagnostic targeted repair using the existing Marking Pack compiler/diagnostic boundary;
- if candidate 1 remains invalid after its repair, candidate 2 is generated fresh from the same frozen accepted Assessment Item, Question Family and governed inputs, not from candidate 1 wording;
- rejected Marking Pack candidates carry no accepted output ref and create no `markingPackCoverage` entry;
- an accepted pack and its coverage entry are checkpointed before later sibling packs continue;
- the accepted Assessment Item is never regenerated merely because its Marking Pack candidate failed;
- already accepted sibling Marking Packs remain untouched while another pack recovers;
- recovery exhaustion creates an explicit course blocker and cannot be treated as a completed marking slot;
- if durable success evidence exists but the accepted Marking Pack coverage/artifact cannot be recovered, the factory refuses to overwrite accepted work;
- the generic Marking Pack input contract advances from `2` to `3` and durable semantic integrity advances from `output-integrity-v2` to `output-integrity-v3` so pre-recovery Marking Pack executions cannot be reused across a changed-head replay;
- direct non-orchestrated Marking Pack callers retain a bounded two-candidate fallback while production orchestration executes one exact candidate at a time;
- provider-free regressions cover candidate replacement, two-candidate exhaustion, durable restart at candidate 2, preservation of accepted Assessment Items, deterministic slot markers and current dependency versioning.

Checkpoint 4 is implementation evidence only. At that point it did **not** restore Q1–Q7 status or Q8 eligibility.

## Implementation checkpoint 5 — required coverage reconciliation before course-pack acceptance

The fifth production slice closed the remaining manufacturing-boundary gap between successful candidate recovery and mandatory curriculum completeness.

Implemented in the governed qualification and durable live-pilot orchestration paths:

- the existing Assessment Item and Marking Pack candidate-recovery factory remains unchanged;
- a guarded orchestration boundary intercepts the immutable `course_content_pack` manifest write before it is accepted;
- the guard reads the persisted Coverage Map and derives accepted Learn/Practice evidence from persisted work-unit ownership plus the manifest artifacts;
- accepted Exam Prep evidence is derived from Assessment Item `requirementIds` in the proposed manifest;
- every active requirement must have every channel it declares mandatory: Learn, Practice and/or Exam Prep;
- `deferred` and `not_applicable` remain the only governed non-blocking exceptions;
- if any required channel is absent, the manifest write is refused and the course is explicitly blocked with `required_coverage_reconciliation_failed`;
- successful sibling candidate/Marking Pack checkpoints remain durable and are not deleted merely because another mandatory requirement remains uncovered;
- already-validating jobs with a persisted manifest are reconciled again when they re-enter the governed orchestration path, so older manifests cannot bypass the new invariant;
- the later deterministic `coverage-completeness` assurance remains an independent backstop rather than being weakened or replaced;
- provider-free regressions prove that accepted sibling evidence cannot compensate for a missing required Exam Prep channel and that all missing channels are surfaced together;
- the existing deterministic full-pipeline simulation continues through the guarded production topology and must still reach `expert_review_ready` when mandatory coverage is genuinely complete.

Checkpoint 5 was implementation evidence only. The later Q1–Q8 evidence below is what restores execution eligibility.

## Completed post-Pilot #20 requalification

The reset qualification requirements have now been exercised against the production candidate-recovery topology rather than reused from the earlier transactional-generation proof.

### Q1–Q6 — provider-free PASS

Canonical consolidation:

`content-factory/reliability-post-pilot20-q1-q6-consolidation.json`

The qualification includes current ownership, historical replay including Pilot #20, adversarial candidate-recovery coverage, deterministic full-pipeline recovery, restart/reuse/dependency invalidation and repeated stability evidence.

The provider-free evidence does not call a live provider and does not rewrite historical failure evidence.

### Q7 — candidate-aware bounded live soak PASS

Attempt 005 accepted 20/20 governed outputs but its historical evidence instrument could not distinguish targeted repair from fresh candidate resampling. It remains preserved as instrumentation-limited evidence and did not itself promote Q7.

Attempt 006 is the decisive Q7 record:

- workflow `33554413877` / run #21;
- approved `main` `e74e04613c8d9fa8d7eba617bb839ef368d26029`;
- artifact ID `9818944889`;
- digest `sha256:43be3553cf21db5892efbfab888c0211f7a02944408a631d228d06fd8955a30b`;
- 20/20 accepted;
- all five governed subject shapes;
- Assessment Item 10/10 accepted;
- Marking Pack 10/10 accepted;
- 31 provider calls completely classified;
- 10 targeted repairs;
- 1 fresh candidate resample;
- 0 controlled fail-closed samples;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- known spend US$0.404658;
- no full-course assembly;
- no learner publication.

One science Assessment Item exercised:

`initial generation → targeted repair → fresh candidate resample → accepted`

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

Durable evidence:

`content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`

### Q8 — separate eligibility transition

Q8 is a repository-state transition only.

Current record:

`content-factory/reliability-v2-f-q8-eligibility-003.json`

It binds the post-Pilot #20 provider-free and Q7 evidence to:

- `status: qualified`;
- `livePilotEligible: true`;
- all Q1–Q7 gates PASS;
- next paid run class `confirmation_pilot`.

The Q8 transition itself uses no provider call and triggers no full-course execution, course assembly or learner publication.

The later confirmation pilot remains an explicit paid run and is not dispatched by this state change.

## Historical Q7/Q8 continuity

Historical evidence remains historical truth and is not rewritten.

Earlier Q7 attempts remain in their original records, including attempts 1–2 FAIL and attempts 3–4 historical PASS.

`content-factory/reliability-v2-f-q8-eligibility.json` and `content-factory/reliability-v2-f-q8-eligibility-002.json` remain the earlier Q8 decisions for their then-current evidence lineages.

The current post-Pilot #20 Q8 decision is appended as `content-factory/reliability-v2-f-q8-eligibility-003.json`.

## Current machine state

After the Q8 transition reaches approved `main`, `content-factory/reliability-qualification.json` records:

- `status: qualified`;
- `livePilotEligible: true`;
- Q1–Q7 `pass`;
- current Q7 evidence `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`;
- current Q8 eligibility record `content-factory/reliability-v2-f-q8-eligibility-003.json`;
- `nextPaidRunClass: confirmation_pilot`.

The paid live-pilot preflight in `scripts/content-factory-live-pilot-qualification.mjs` must pass before provider execution, and the live-pilot workflow keeps that preflight ahead of the paid run with no bypass.

Qualification is not publication approval and is not maturity.

## Cost position

Known Q7 soak spend through attempt 006 is **US$2.496296** in total.

Attempt 006 used **US$0.404658**, or 8.09316% of the governed US$5 per-soak ceiling.

The US$5 Q7 ceiling remains proportionate and is not increased by this transition.

The US$20 confirmation-course ceiling remains unchanged. A later confirmation pilot remains subject to normal spend logging and stop-loss controls.

## Documentation impact

No normative authority or ADR change is required for Q8. Reliability Standard v2.0 already defines the separate Q8 state transition and ADR-0019 already governs candidate recovery.

This transition:

- appends the post-Pilot #20 Q8 evidence record;
- updates the machine-readable qualification state from paused to qualified;
- binds that state to current post-Pilot #20 provider-free and Q7 evidence;
- updates executable assurance to expect current Q8 eligibility while preserving historical assertions;
- updates this technical harness to the current Q1–Q8 state;
- preserves historical evidence records unchanged;
- does not change worker/compiler runtime logic;
- does not call a provider, run a full course, assemble a course or publish learner content.

The next governed paid activity, if separately requested, is one confirmation pilot under the same qualification evidence and existing cost, rights, accuracy and expert-review controls.
