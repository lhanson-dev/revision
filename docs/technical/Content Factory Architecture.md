# Content Factory Architecture

Status: Approved target; v0.1 foundation partially implemented.

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
- stop on blockers;
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

### 6. Work-unit planner

The planner converts the coverage map into bounded generation tasks.

Work units should be educationally coherent, such as one specification area, skill cluster or paper/component practice set. They must carry explicit source and coverage references.

Avoid arbitrary splits based only on token length because they weaken coherence and make omissions harder to detect.

### 7. Generation workers

Workers produce typed Revision content against the existing schema and leave packs in `preview` until publication gates pass.

Workers may be model-routed by task complexity. The architecture must support replacing a model/provider without changing the content governance lifecycle.

Each material worker run should return enough provenance to identify the worker/stage, worker-contract or prompt-template version, model/provider where applicable, input references, output artifact/commit, result, retry count and usage/cost where available.

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

Retry rules:

- transient network/model/CI/deployment infrastructure failures may retry within bounded limits;
- educational ambiguity does not auto-retry into a guessed answer — it becomes `blocked`;
- a material upstream source/coverage change invalidates dependent generation/review stages;
- retries must not create duplicate job issues, branches, PRs or content identifiers;
- the job record must show the latest valid stage plus failed attempts where operationally useful;
- a failed post-merge deployment keeps the job out of `pilot_live` even though the merge has already occurred.

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
- retries;
- total job cost;
- human-review status/cost when relevant.

The orchestrator should support per-job and batch usage limits so retry loops or concurrency cannot consume unbounded spend.

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
8. Prove the pipeline on several materially different qualification types.
9. Add batch intake/concurrency and spend limits.
10. Expand Content Operations into a broader dashboard only if operational volume justifies it.

## Explicitly out of v0.1

- automated merging;
- replacing qualified human benchmark review;
- a large bespoke workflow platform;
- a broad production-grade operations dashboard before the pipeline is proven;
- a second standalone Admin application or separate Admin authentication system;
- hard-coding awarding-body or subject logic into the learner React application;
- treating AI output as educational authority.
