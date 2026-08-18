# ADR-0011 — Content Factory Orchestration

Status: Draft pending merge
Date: 2026-08-18

## Decision

Revision will scale educational content production through a stateful **Content Factory** rather than treating a single AI conversation or a large execution prompt as the workflow.

The factory will orchestrate bounded workers for course identification, official-source resolution, specification coverage compilation, content generation, deterministic validation, independent educational review, remediation, CI assembly and human-review export.

AI workers are replaceable execution components. Repository governance and approved educational sources remain authoritative.

## Key rules

- Content production job state is separate from learner publication status (`planned` / `preview` / `available`).
- Durable job state must exist outside conversational/model memory.
- Generation may run in parallel only from an approved structured coverage map.
- Deterministic checks use code where practical rather than relying on model judgement.
- Independent A2/A3 review must run in a fresh worker/context that did not generate the reviewed content.
- GitHub branches/PRs remain the governed change and publication boundary for v0.1.
- The factory stops before merge and requires explicit Founder approval for the specific PR/merge.
- Qualified human subject review remains required for the commercial benchmark threshold defined by the content workflow.
- The learner runtime/content catalogue architecture is unchanged; the factory operates upstream of validated content packs.

## v0.1 boundary

Start with a lightweight repository/automation implementation that can run one course end-to-end and persist structured job/coverage state. Prove the model across materially different qualification types before adding a richer Content Operations admin UI or a large workflow platform.

## Consequences

Benefits:
- adding many qualifications becomes repeatable and observable;
- review independence can be enforced automatically;
- interrupted jobs can resume without reconstructing chat context;
- model/provider choice can vary by task without changing governance;
- cost and quality can be measured per stage/course;
- Founder involvement can reduce to genuine option decisions and final merge approval.

Costs/risks:
- introduces orchestration/job-state implementation that does not exist yet;
- machine-readable coverage contracts must be designed carefully for different subject shapes;
- parallel generation increases the need for deterministic IDs, provenance and assembly controls;
- automation must not create false confidence or weaken human-review thresholds.
