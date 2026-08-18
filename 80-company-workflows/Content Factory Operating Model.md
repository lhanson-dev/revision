# Content Factory Operating Model

## Purpose

Define how Revision scales production of governed learner content from one course at a time to many qualifications without turning individual chat conversations into the workflow.

The Content Factory is the execution/orchestration layer for the existing educational authorities. It does not replace or weaken:

- `Awarding Body URL Content Intake Workflow.md`;
- `Content Pack Production and Assurance Workflow.md`;
- `Content Accuracy Assurance Gate.md`;
- `Human Subject Review Pack Template.md`;
- Founder merge approval.

## Core decision

Revision will treat content production as a **stateful pipeline** rather than a single AI conversation.

The workflow is owned by an orchestrator. AI models, scripts and human reviewers are workers that perform bounded stages. Workers may change over time without redefining the workflow or educational authority.

The normal scalable path is:

**official awarding-body URL → content job → source resolution → coverage map → generation work units → deterministic validation → independent educational review → remediation → CI verification → pilot-ready PR → Founder merge approval → later human benchmark review**

## Separation of production state and learner publication state

Content Factory job state is operational and must remain separate from learner catalogue publication status.

Learner content continues to use:

- `planned` — identified but not ready;
- `preview` — registered/in construction/under assurance and hidden from the ordinary learner catalogue;
- `available` — permitted to enter the learner catalogue under the governed publication gate.

Content Factory jobs use their own lifecycle:

1. `requested`
2. `identified`
3. `sourced`
4. `mapped`
5. `generating`
6. `validating`
7. `independent_review`
8. `remediation` when required
9. `ci_verification`
10. `ready_for_founder_merge_approval`
11. `merged_pilot`
12. `human_review` where commercial benchmark review is required
13. `benchmark_approved`

A job may also be `blocked` at any stage with an explicit reason.

Operational job state must never be used as a shortcut around learner publication gates. In particular, a job being `ready_for_founder_merge_approval` does not itself make a pack `available`; all applicable content and CI gates must already permit that status.

## Minimum Founder interaction

The intended Founder interaction for an ordinary course is:

1. provide one official awarding-body course/specification URL, or a batch of such URLs;
2. answer only genuine learner/course-option questions that cannot be resolved from official authority;
3. receive a final exception/blocker or `ready_for_founder_merge_approval` decision;
4. explicitly approve or reject the merge.

The Founder should not have to manually coordinate generation context, independent-review context, deterministic checks or PR status for each course once orchestration exists.

## Content job record

Every orchestrated course addition must have a machine-readable job record or equivalent durable state containing at least:

- job ID;
- original Founder request / official URL(s);
- resolved subject, qualification, awarding body and specification identifier;
- cohort/series validity and withdrawal/replacement information where relevant;
- compulsory papers/components and unresolved learner choices;
- source-register reference;
- coverage-map reference;
- content pack IDs / paths;
- branch and PR identity;
- current factory state;
- generation work units and their status;
- deterministic validation result/reference;
- independent-review result/reference;
- remediation findings/status;
- CI run/result on the relevant head;
- human-review status where applicable;
- blockers/limitations;
- timestamps and exact reviewed/generated commit identifiers where material.

The job record is operational evidence. Normative educational truth remains in the approved source records, coverage maps and governing workflow documents.

## Worker model

### 1. Intake / identity worker

Input: official awarding-body URL.

Output: resolved course identity, currency, components, assessment structure and any genuine learner-specific option requiring Founder input.

It must not generate learner content before identity is sufficiently resolved.

### 2. Source worker

Input: resolved course identity.

Output: approved official source set and provenance record covering specification, assessment, objectives, appendices, specimen/past-paper material, mark schemes, examiner guidance/notices and prescribed material as applicable.

Primary educational authority governs scope. Secondary material may supplement but must not silently redefine it.

### 3. Coverage compiler

Input: approved official source set.

Output: a structured specification coverage map that can be rendered into readable Markdown/PDF evidence.

The structured map should represent examinable requirements/skills, ownership, component scope, expected Learn/Practice/Exam Prep coverage and completeness state.

Coverage is the contract for downstream generation. Generation workers may not decide that omitted specification requirements do not matter merely because they were not assigned.

### 4. Generation workers

Input: explicit coverage work units plus relevant approved sources and content-schema contract.

Output: original Revision learner content in `preview`.

Generation may run in parallel when work units are genuinely separable, for example by specification area or assessment component. Parallelism must be based on the coverage map rather than arbitrary token-size chunks.

Generation workers must preserve subject-authentic educational structure. They must not force every qualification into a Business-shaped pattern.

### 5. Deterministic validation worker

Input: generated content and metadata.

Output: mechanical verification report.

Use code rather than linguistic judgement for checks that can be deterministic, including as applicable:

- schema validity;
- duplicate IDs / broken references;
- arithmetic, percentages, ratios, units and formula application;
- answer-key consistency;
- question/section/exam mark totals;
- assessment-objective totals stored by Revision;
- duration/mark metadata;
- internal numerical consistency of invented cases;
- coverage-map completion checks.

### 6. Independent educational review worker

Input: finished generated content, approved source set, structured coverage map and deterministic report.

Output: governed A2/A3 issue register and gate decision.

The reviewer must be genuinely independent of the generation context that produced the content. The orchestrator must enforce this separation; a generating worker cannot relabel itself as the independent reviewer.

### 7. Remediation worker

Input: verified blocking/material findings.

Output: narrowly scoped corrections plus revalidation evidence.

Remediation should fix findings rather than regenerate unrelated content. Historical assurance evidence must remain historically truthful.

### 8. Assembly / CI worker

Input: resolved content and assurance evidence.

Output: final branch/PR state, exact-head CI result and publication eligibility decision.

Infrastructure failures must be distinguished from content/test failures but neither may be silently treated as green CI.

### 9. Human-review export worker

Input: the exact content version requiring qualified subject review.

Output: portable reviewer PDF/equivalent containing the governed review brief, source references, coverage summary, learner-facing content and sign-off structure.

Human subject review remains the commercial benchmark gate defined by the content workflow; it is not replaced by AI orchestration.

## Orchestrator responsibilities

The orchestrator owns sequence and state, not educational truth.

It must:

- create/resume durable jobs;
- invoke only stages whose prerequisites are satisfied;
- pass explicit source and coverage context into workers;
- record exact outputs/commit identities;
- enforce independent-review separation;
- stop on material ambiguity or blocking findings;
- allow safe restart without duplicating completed work;
- distinguish retryable infrastructure failure from educational failure;
- update PR/job status as work progresses;
- stop before merge unless explicit Founder approval for the specific merge exists.

The orchestrator must not silently downgrade a failed gate in order to keep the pipeline moving.

## Idempotency and restartability

At scale, jobs will fail or be interrupted. Each stage should therefore be restartable from durable inputs and outputs.

Where practical:

- stage outputs receive stable identifiers/checksums/commit references;
- a completed unchanged stage is reused rather than regenerated;
- retries do not create duplicate content IDs or duplicate PRs;
- a material upstream change invalidates affected downstream stages deliberately rather than leaving stale assurance marked complete.

## Cost and model routing

Use the cheapest reliable mechanism for each task.

- deterministic code for deterministic checks;
- smaller/lower-cost models for bounded transformation or straightforward retrieval work where quality evidence supports it;
- stronger reasoning models for complex generation, assessment design and independent educational challenge where needed;
- no unnecessary replay of large source/context bundles when a validated structured representation can be reused safely.

Cost optimisation must not weaken source fidelity, independent review or publication gates.

## Batching and concurrency

The factory must support multiple course jobs concurrently.

Batch input may contain many official URLs. Each course receives its own job identity, branch/PR boundary and assurance evidence unless a deliberately approved multi-course change has a clear reason.

Concurrency must be bounded so that:

- API/model spend remains controllable;
- GitHub writes do not collide;
- review independence remains meaningful;
- failures are attributable to a single job/stage;
- Founder approval remains understandable.

## v0.1 operating boundary

The first implementation should remain deliberately simple.

For v0.1:

- GitHub remains the canonical store for learner content, source/coverage evidence, assurance records and PR review history;
- durable job state may initially be stored as structured repository files or another deliberately approved lightweight operational store;
- the existing branch/PR model remains the publication/change boundary;
- the current `content/**/index.ts` + schema + catalogue architecture remains unchanged;
- no dedicated Admin UI is required to prove the factory;
- no automated merge is permitted;
- human subject review remains external/portable for the MVP benchmark process.

The factory should first prove repeatability across materially different qualification types before a richer administration dashboard is built.

## Scaling validation target

Before treating the factory design as mature, run it across a representative mix of at least several different course shapes, for example:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language or prescribed-text course.

The purpose is to prove that source mapping, coverage compilation, content schema, worker boundaries and assurance work across subject structures rather than only Business.

## Future administration capability

A protected Content Operations interface may later show jobs by state, blockers, source/coverage health, assurance findings, CI status and human-review status, and may allow authorised reviewers to annotate or sign off content.

That interface is an internal administration/content-operations capability. It is not part of the learner or teacher feature set unless separately governed later.

## Publication and merge boundary

A Content Factory job may report `ready_for_founder_merge_approval` only when the applicable content workflow and accuracy gates are satisfied and CI is green on the exact intended head.

Every merge into `main` continues to require explicit Founder approval for that specific PR/merge.
