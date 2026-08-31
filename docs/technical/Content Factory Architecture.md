# Content Factory Architecture

Status: Approved target; v0.1 foundation partially implemented; ADR-0019 candidate-recovery migration in progress.

## Purpose

Define the technical architecture for scaling Revision content production independently of conversational state while preserving the canonical learner application boundary.

The learner product already consumes automatically discovered, validated content packs. The Content Factory is a separate **content production plane** that creates, assures and proposes those packs through governed branches and pull requests. Its minimal Founder-facing intake can be presented as a role-gated operational screen inside the existing `/app/` React runtime without turning the Content Factory into a second learner runtime.

## Architectural decision

Content production must not depend on one long-lived chat conversation.

The scalable architecture separates:

- **orchestration** — durable job state, stage sequencing, retries and handoffs;
- **workers** — AI/model or deterministic tasks with bounded inputs/outputs;
- **canonical content/evidence** — repository files and PR history;
- **operational job state** — durable Content Factory state outside chat memory;
- **learner publication** — existing validated content packs discovered by the learner catalogue; and
- **operational presentation** — role-gated Content Operations controls that invoke trusted server-side adapters without exposing privileged credentials to the browser.

```text
Founder
   |
/app/ -> role-gated Admin / Content Operations
   |
official awarding-body URL(s)
   |
trusted server-side intake adapter
   |
GitHub Issue job record
   |
Content Factory orchestrator
   |
   +--> identity/source worker
   +--> coverage compiler
   +--> generation workers (parallel where safe)
   +--> deterministic validator
   +--> independent educational reviewer
   +--> remediation worker
   +--> assembly / CI worker
   |
governed content branch / PR
   |
Founder merge approval
   |
main -> production build/deploy -> production smoke
   |
validated content catalogue -> /app/
   |
   +--> human-review export / benchmark review when required
```

## Existing learner architecture remains authoritative

The factory must preserve the current learner boundary:

- content is stored as validated packs under `content/**/index.ts`;
- the content registry discovers packs automatically at build time;
- only packs with `manifest.status === 'available'` enter the ordinary learner catalogue;
- ordinary new subjects must not require hard-coded subject routes or shared React changes;
- the canonical application runtime remains `/app/`;
- standard learner navigation remains separate from role-gated operational controls; and
- a successful merge is not equivalent to a successful production deployment.

The factory remains upstream of learner content publication. A role-gated Content Operations screen inside `/app/` is an operational entry point, not a competing learner catalogue or second application runtime.

## v0.1 components

### 1. Intake adapter

Accept one or more official awarding-body course/specification URLs plus optional Founder constraints.

The first user-facing adapter is the role-gated Content Operations screen inside `/app/`. It calls a trusted server-side endpoint, which creates the durable content job rather than relying on conversational state.

The browser may determine whether to present the Admin entry point from the signed-in user's database-backed role, but privileged job creation must revalidate that role server-side.

### 2. Orchestrator

Owns the state machine defined by `80-company-workflows/Content Factory Operating Model.md`.

Required responsibilities:

- create/resume jobs;
- evaluate stage prerequisites;
- dispatch bounded worker tasks;
- record worker results and exact commit/artifact references;
- record material worker/model/contract provenance;
- enforce independent-review separation;
- distinguish ordinary rejected generative candidates from genuine course-level blockers;
- recover rejected candidates within governed candidate/retry/spend ceilings when the affected worker boundary supports candidate recovery;
- stop on genuine blockers;
- handle retryable failures;
- expose current job status;
- stop at Founder merge approval;
- resume after an approved merge for deployment verification;
- report `pilot_live` only after the governed production deployment and smoke checks succeed.

The orchestrator must not make educational authority decisions merely because it controls sequencing.

### 3. v0.1 job store — GitHub Issues

The job store must persist machine-readable state outside model/chat memory and outside the mutable content branch lifecycle.

For v0.1, each course job uses one **GitHub Issue in the Revision repository** as its durable operational record.

The issue contains a schema-validated machine-readable payload or equivalent structured block and may use labels for coarse state. It links to the course branch/PR and repository evidence artifacts.

Minimum record shape:

```text
job_id
request_url(s)
course_identity
cohort_validity
components
state
branch
pull_request
source_record_ref
source_set_version_or_fingerprint
coverage_map_ref
work_units[]
worker_runs[]
validation_ref
independent_review_ref
remediation_ref
ci_ref
merged_commit
deployment_ref
human_review_ref
blockers[]
timestamps
```

`worker_runs[]` is also the durable candidate-attempt ledger for recovery-enabled boundaries. A candidate attempt is identified by deterministic production-slot/candidate input refs, so restart can reconstruct the next permitted attempt from the canonical job payload without relying on in-memory loop state.

The job issue is operational evidence only. It cannot override content authority, CI, publication gates or Founder merge approval.

GitHub Issues are chosen for v0.1 because they survive branch merges, avoid operational-status commits to `main`, provide history and linking to PRs, and require no new operational database before the pipeline is proven. The job-store adapter must remain replaceable so a dedicated operational store can be introduced later without changing educational/content architecture.

### 4. Source representation

Workers should not repeatedly rediscover the same course identity from scratch once it has been validated.

The factory should create a structured source register containing:

- source URL;
- awarding body;
- source type;
- version/date where available;
- checked date;
- what curriculum/assessment claim group it governs;
- currency/limitation status;
- a stable source-set version/fingerprint where practical.

This structured representation is a routing/provenance aid, not a replacement for the official source.

### 5. Structured coverage map

The current readable source/coverage Markdown remains useful for human audit, but scale requires a machine-readable companion.

A v0.1 implementation should represent each coverage item with fields equivalent to:

```text
requirement_id
official_reference
requirement_summary
skills_or_knowledge
component_scope[]
revision_topic_or_area
learn_required
practice_required
exam_prep_required
coverage_status
content_refs[]
source_refs[]
```

The factory can generate the readable `SOURCE_AND_COVERAGE.md` from, or alongside, this structured map.

The map is the downstream generation contract and enables automated gap checks.

A rejected generative candidate can never discharge a required coverage or dependent-artifact obligation. A required slot remains unfilled until an accepted artifact satisfies it. If bounded recovery is exhausted, the course must block rather than silently omit the requirement or dependent artifact.

### 6. Work-unit planner

The planner converts the coverage map into bounded generation tasks.

Work units should be educationally coherent, such as one specification area, skill cluster or paper/component practice set. They must carry explicit source and coverage references.

Avoid arbitrary splits based only on token length because they weaken coherence and make omissions harder to detect.

### 7. Generation workers

Workers produce typed Revision content against the existing schema and leave packs in `preview` until publication gates pass.

Workers may be model-routed by task complexity. The architecture must support replacing a model/provider without changing the content governance lifecycle.

Each material worker run should return enough provenance to identify the worker/stage, worker-contract or prompt-template version, model/provider where applicable, input references, output artifact/commit, result, retry count and usage/cost where available.

Under ADR-0019, a model output at a recovery-enabled boundary is a **candidate**, not accepted course content, until the relevant deterministic/compiler and educational checks have accepted it. Rejected candidates remain operational evidence where useful and must not silently become canonical learner content.

### 8. Deterministic assurance service

Where checks are computable, implement them as reusable code/tests rather than prompts.

Target checks include:

- content-schema validation;
- IDs/references;
- coverage completeness;
- arithmetic and units;
- answer-key consistency;
- question/section/exam totals;
- AO totals where stored;
- pack metadata consistency;
- duplicate/contradictory structured items.

These checks should produce machine-readable results suitable for the job record and PR summary.

For repair-eligible parseable candidates, deterministic validation must expose the **complete safely inspectable actionable defect set** before a provider repair call. A first-error throwing API may remain as a compatibility surface for callers that only need fail-fast validation, but provider repair must use an aggregate diagnostic API rather than treating the first exception as the complete defect set.

### 9. Independent-review worker boundary

Independent review must run with a fresh model context/worker identity that did not generate the reviewed content.

The orchestrator supplies:

- exact branch/commit;
- complete content scope;
- official source register;
- coverage map;
- deterministic verification output;
- current Accuracy Gate instructions.

The reviewer returns a structured issue register and PASS / CONDITIONAL PASS / FAIL-HOLD decision.

This boundary is mandatory even if generation and review use the same underlying model family.

### 10. Remediation loop

Blocking/material findings become explicit remediation tasks.

Only affected work units should normally be reopened. After correction, affected deterministic/educational checks are invalidated and rerun.

The architecture must preserve earlier assurance evidence rather than overwrite history.

### 11. GitHub/CI adapter

The factory uses governed branches and PRs as the change boundary.

The adapter must:

- create/update the course branch/PR;
- write source, coverage and assurance artifacts;
- read exact-head CI status;
- distinguish infrastructure failure from content/test failure;
- never treat mergeability as Founder approval;
- never merge automatically under current governance.

The current Revision CI/build toolchain remains governed by the existing technical stack and CI workflow; the Content Factory must consume that result rather than create a parallel assurance path.

### 12. Deployment verification adapter

After explicit Founder merge approval and the actual merge, the factory resumes the job in `deployment_verification`.

The adapter must correlate the merged commit with the production deployment and verify the current post-publication/release controls, including:

- successful production deployment;
- canonical `/app/` runtime smoke;
- expected catalogue discovery of new `available` packs;
- correct subject/course/paper projection where applicable;
- absence of a subject-specific or legacy-route workaround for an ordinary pack addition.

Only then may the job move to `pilot_live`.

### 13. Human-review export generator

The export generator creates the portable teacher/subject-specialist review document from the exact reviewed content version and source/coverage evidence.

The v0.1 export may remain PDF-based. A later richer Content Operations review experience can consume the same underlying structured job/content data.

## Candidate-recovery architecture after Pilot #20

ADR-0019 changes the reliability topology at generative worker boundaries. The target lifecycle is:

`planned slot → candidate generation → complete diagnostics → accept or reject → bounded resample → freeze accepted artifact → generate dependent artifact`

The implementation must satisfy these invariants:

- ordinary provider/model variability is expected production behaviour rather than an automatic course failure;
- recovery happens at the smallest safe candidate/subartifact scope;
- accepted sibling artifacts remain immutable unless a genuine dependency change invalidates them;
- fresh candidate resampling is preferred to repeated whole-artifact rewriting when semantic generation is unstable;
- candidate and retry budgets are bounded and included in course spend accounting;
- course-level `blocked` state is reserved for unresolved authority/identity/rights/coverage ambiguity, exhausted governed recovery/spend limits, unrecoverable infrastructure, or educational ambiguity that automation cannot safely resolve;
- educational assurance remains unchanged and can still reject an educationally weak candidate or course.

### Implementation checkpoint 1: complete Assessment Item diagnostics

The first implementation slice after ADR-0019 is the Assessment Item diagnostic boundary:

- `assessment-integrity.ts` exposes a non-throwing aggregate diagnostic path for structured Assessment Items;
- the aggregate path inspects all safely parseable subquestions and reports simultaneous mark, requirement, command/demand, MCQ and coverage findings rather than stopping after the first semantic failure;
- the existing `validateStructuredAssessment` fail-fast API is retained for compatibility and returns the first diagnostic as an exception;
- the Assessment Item provider worker uses the aggregate path before its single permitted targeted repair;
- the Assessment Item worker contract was versioned to `6` because the provider/repair behaviour materially changed;
- a Pilot #20 regression proves calculation- and interpretation-demand defects in different subquestions are supplied together to the one repair call.

Checkpoint 1 by itself did **not** implement bounded fresh-candidate resampling, slot-level accepted-sibling preservation, Marking Pack candidate recovery, or the orchestrator change that prevents an ordinary rejected candidate from blocking the course.

### Implementation checkpoint 2: bounded Assessment Item candidate resampling

The second implementation slice added bounded worker-local recovery for the governed Assessment Item / Question Family slot:

- the Assessment Item worker contract was versioned to `7` because candidate lifecycle and provider-call provenance materially changed;
- each Assessment Item slot may use at most **two fresh candidates**;
- each candidate may receive at most **one** complete-diagnostic targeted repair, preserving the Reliability v2 one-repair-per-artifact ceiling;
- when candidate 1 remains invalid after repair, candidate 2 is generated fresh from the governed slot inputs and target policy rather than rewriting or preserving candidate 1 wording;
- a valid first-pass candidate still uses one provider call and no recovery call;
- provider usage cost and retry/resample counts are accumulated across the bounded candidate sequence;
- exhausted candidate recovery returns an explicit `assessment_item_v2_candidate_recovery_exhausted` failure; no third candidate or unbounded loop is possible;
- Assessment Item generation is already scoped to one governed item/Question Family worker invocation, so rejection and resampling do not mutate unrelated already accepted Assessment Item siblings at this worker boundary.

Checkpoint 2 did **not** make candidate state durable across orchestrator restart; the two-candidate loop still lived inside one worker execution.

### Implementation checkpoint 3: durable Assessment Item slot/candidate state

The third implementation slice moves Assessment Item candidate sequencing to the assessment factory/orchestration boundary:

- each candidate attempt is recorded as a normal `generation` entry in canonical `workerRuns[]`;
- deterministic input refs identify the production slot (`assessment-slot:<family>:<component>`) and candidate number, allowing restart to reconstruct the next permitted attempt without a second state model;
- rejected and accepted candidate runs are checkpointed to the GitHub-Issue job payload immediately, before later Assessment siblings or Marking Packs are generated;
- candidate 1 and candidate 2 are separate dependency-aware worker executions, so a terminal cached attempt can be reused without another provider call after a process restart;
- the factory refuses to overwrite an accepted slot if its accepted worker-run evidence exists but the persisted artifact cannot be recovered;
- the provider boundary is contract `8`; a directly invoked non-orchestrated worker still retains the same two-candidate bounded fallback, while production orchestration supplies the exact candidate number;
- the generic Assessment Item input contract advances to `3` and the durable semantic integrity version advances to `output-integrity-v6`, preventing pre-durable candidate executions from being reused across a changed-head resume;
- the governed ceiling remains two fresh candidates and one targeted repair per candidate; this checkpoint changes ownership/durability, not the educational or spend limits.

Checkpoint 3 did **not** implement Marking Pack candidate replacement, whole-course orchestrator recovery after downstream candidate exhaustion, Q1–Q7 requalification or Q8 eligibility.

### Implementation checkpoint 4: durable Marking Pack candidate recovery

The fourth implementation slice applies the same bounded durable candidate topology to the Marking Pack for each already accepted Assessment Item:

- the accepted Assessment Item remains frozen while its Marking Pack is manufactured; a rejected Marking Pack candidate cannot trigger question regeneration;
- each Marking Pack production slot is identified as `marking-pack-slot:<assessment-item-id>` and each candidate as `...:candidate:<n>`;
- candidate 1 and candidate 2 are separate canonical `marking_pack` worker runs in `workerRuns[]`;
- the factory owns the two-candidate ceiling and checkpoints every rejected or accepted candidate immediately through the durable job payload;
- each candidate still receives at most one complete-diagnostic targeted repair before it is accepted or rejected;
- if candidate 1 remains invalid after its repair, candidate 2 is a fresh generation from the same accepted question, Question Family and governed inputs rather than a second rewrite of candidate 1;
- a rejected candidate carries no Marking Pack output ref and does not create `markingPackCoverage`; therefore it cannot satisfy the required dependent-artifact slot;
- the course can advance only after every markable Assessment Item has an accepted Marking Pack in `markingPackCoverage`; exhausted recovery blocks rather than silently omitting a pack;
- accepted sibling Marking Packs and accepted Assessment Items are preserved while another pack recovers;
- if a successful Marking Pack worker-run record exists but its accepted coverage/artifact cannot be recovered, the factory fails closed instead of generating over accepted work;
- the live Marking Pack provider boundary advances from contract `4` to `5`; direct non-orchestrated callers retain the bounded two-candidate fallback, while production orchestration supplies one exact candidate number at a time;
- the generic Marking Pack input contract advances from `2` to `3` and the durable semantic integrity revision advances from `output-integrity-v2` to `output-integrity-v3`, preventing pre-recovery Marking Pack executions from being reused across changed-head replay.

Checkpoint 4 completes durable candidate recovery for the Assessment Item → Marking Pack production pair. It is implementation evidence only: the wider course-level recovery/coverage-completeness topology still requires provider-free requalification, repeated stability proof, bounded live soak and a separate Q8 transition before full-course execution can resume.

The machine-readable qualification state remains paused.

## Worker contract/versioning

Worker implementations and prompts will evolve. The orchestrator therefore treats worker contracts as versioned execution dependencies.

At minimum, material generated/reviewed outputs should be attributable to:

- stage/worker identity;
- contract/template version;
- model/provider/configuration class where applicable;
- source/coverage input versions;
- output commit/artifact;
- run result/retries;
- usage/cost where available.

A material worker-contract change can trigger targeted revalidation when prior quality assumptions are no longer safe.

## Failure and retry design

Each factory stage should be idempotent or explicitly versioned.

Retry/recovery rules:

- transient network/model/CI/deployment infrastructure failures may retry within bounded limits;
- an ordinary invalid model candidate at a recovery-enabled boundary is rejected and recovered at candidate scope within governed limits rather than immediately blocking the course;
- fresh resampling is preferred to repeated whole-artifact repair where ADR-0019 identifies semantic instability;
- exhausted candidate/retry/spend limits become an explicit course-level blocker rather than an unbounded loop;
- educational ambiguity does not auto-retry into a guessed answer — it becomes `blocked`;
- a material upstream source/coverage change invalidates dependent generation/review stages;
- retries/resampling must not create duplicate job issues, branches, PRs or canonical content identifiers;
- accepted unaffected artifacts must be preserved across candidate recovery and resume;
- the job record must show the latest valid stage plus rejected/failed attempts where operationally useful;
- a failed post-merge deployment keeps the job out of `pilot_live` even though the merge has already occurred.

Candidate-scope recovery is being implemented incrementally after Pilot #20. Complete Assessment Item diagnostics, bounded Assessment Item resampling, durable Assessment candidate state and durable Marking Pack candidate recovery are implemented. The production topology must still be requalified end to end—including the invariant that every mandatory coverage/dependent-artifact requirement ends in accepted content or an explicit blocker—before the machine-readable qualification state can leave `paused`.

## Parallelism

Parallel generation is permitted only after course identity, source set and coverage map are stable enough to define non-overlapping work units.

A configurable concurrency limit should cap model/API usage and GitHub write contention.

Independent review should consume an assembled content version rather than reviewing fragments that later change without revalidation.

## Cost controls

The architecture should make cost measurable per job and stage.

Track at least:

- model/provider;
- worker contract/version;
- task/stage;
- request count;
- token/usage cost where available;
- retries and rejected candidate count where recovery is enabled;
- total job cost;
- human-review status/cost when relevant.

The orchestrator should support per-job and batch usage limits so retry loops, candidate resampling or concurrency cannot consume unbounded spend.

Routing policy should prefer deterministic code and lower-cost workers where quality evidence supports them, while preserving stronger review for high-risk educational tasks.

## Security and copyright boundary

- Do not store secrets in job issues or content files.
- Only approved connectors/services may access private operational systems.
- Browser-delivered code must not contain GitHub write credentials, service-role credentials or model-provider secrets.
- Privileged Content Operations actions must cross a trusted server-side authorization boundary that revalidates the database-backed admin role.
- Official source references may be stored; substantial copyrighted awarding-body content must not be copied merely to make the factory self-contained.
- Generated learner content should remain Revision-authored unless an appropriate licensed/official use is deliberately approved.

## v0.1 implementation sequence

1. Define machine-readable job, source-register and coverage schemas.
2. Implement the GitHub-Issue job-store adapter and one-course orchestrator state machine.
3. Add the minimal role-gated Content Operations intake inside `/app/`, database-backed admin assignment and trusted server-side job-creation adapter.
4. Implement deterministic validators and stage invalidation/restart rules.
5. Add isolated generation and independent-review worker invocation contracts with worker-run provenance.
6. Automate branch/PR and exact-head CI handling plus the final Founder-approval stop.
7. Add post-merge deployment verification and `pilot_live` transition.
8. Implement ADR-0019 candidate recovery in bounded slices: complete diagnostics, Assessment Item candidate resampling, durable Assessment slot state and durable Marking Pack recovery.
9. Requalify the actual candidate-recovery topology through Q1–Q7, including mandatory coverage/dependent-artifact completeness under deliberate candidate rejection, then perform a separate Q8 transition before another full-course confirmation run.
10. Prove the pipeline on several materially different qualification types.
11. Add batch intake/concurrency and spend limits.
12. Expand Content Operations into a broader dashboard only if operational volume justifies it.

## Explicitly out of v0.1

- automated merging;
- replacing qualified human benchmark review;
- a large bespoke workflow platform;
- a broad production-grade operations dashboard before the pipeline is proven;
- a second standalone Admin application or separate Admin authentication system;
- hard-coding awarding-body or subject logic into the learner React application;
- treating AI output as educational authority.
