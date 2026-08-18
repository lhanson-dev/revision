# Content Factory v0.1 Foundation Implementation

Status: Implemented on governed branch, pending merge.

## Purpose

Record the first implementation slice of the approved Content Factory architecture.

This implementation provides the typed operational contracts and guarded state machine needed before Revision connects real source, generation, review, GitHub and deployment workers.

It does **not** change the learner runtime. The canonical learner product remains `/app/`, and the Content Factory remains an upstream content-production plane.

## Canonical implementation location

The v0.1 foundation lives under:

`src/content-factory/`

It is included in the repository TypeScript, lint and Vitest assurance surface but is not imported by the learner application, so it does not enter the learner bundle merely by existing.

## Implemented in this slice

### Machine-readable schemas

`src/content-factory/schema.ts` defines Zod contracts for:

- Content Factory job state and lifecycle;
- resolved course identity and cohort validity;
- compulsory/optional course components;
- official-source registers and source-set fingerprints;
- structured specification coverage requirements;
- educational generation work units;
- worker/model provenance;
- deterministic validation results;
- independent-review results;
- remediation, CI, merge, deployment and human-review evidence;
- operational blockers.

The job contract keeps operational factory state separate from learner publication state.

### Guarded state machine

`src/content-factory/orchestrator.ts` implements the approved lifecycle and prevents invalid progression.

Important enforced boundaries include:

- a course cannot become `identified` until identity/components are resolved and learner-specific choices are cleared;
- sourcing requires a source-register reference and source-set fingerprint;
- generation requires governed work units;
- validation cannot begin until generation work units are complete and content-pack references exist;
- independent review requires deterministic validation tied to an exact commit;
- the reviewer context must differ from successful generation contexts;
- blocking/material findings prevent progression to CI;
- CI must pass on the same commit that received independent review before Founder merge approval can be requested;
- `merged` requires an explicit Founder-approval record plus the actual merged commit;
- `pilot_live` requires successful deployment/smoke evidence for that merged commit;
- `benchmark_approved` requires a passing qualified-human review record;
- jobs can enter `blocked` and resume from their prior stage only after blockers are explicitly resolved.

The state machine records an approved merge; it does not perform one.

### GitHub Issue job-store contract

`src/content-factory/github-issue-job-store.ts` provides:

- a schema-validated JSON payload embedded in a human-readable GitHub Issue body;
- serialization and parsing of that payload;
- a small injected GitHub Issue client contract;
- create/load/save job-store behaviour against that contract.

This establishes the approved one-Issue-per-course durable-state boundary without coupling the domain model to a particular SDK, token or network implementation.

## Not implemented yet

This slice does not yet provide:

- awarding-body URL fetching or official-source resolution;
- generation of source registers from live official pages;
- automatic coverage compilation from specifications;
- AI generation workers;
- independent-review worker invocation;
- remediation worker invocation;
- a concrete GitHub API client binding for the job-store contract;
- automatic branch/PR creation and exact-head CI polling;
- deployment verification automation;
- batch intake/concurrency;
- Content Operations UI;
- automated merge.

Those remain downstream v0.1 slices under the approved architecture.

## Assurance

The implementation has unit coverage for:

- requested-job creation;
- source-register uniqueness;
- coverage completion references;
- guarded identity/source progression;
- independent-review context separation;
- reviewed-head versus CI-head matching;
- explicit Founder merge approval;
- merged-commit versus deployed-commit matching;
- block/resume behaviour;
- GitHub Issue job-payload round trips.

The normal repository CI remains the acceptance gate for this implementation.

## Next implementation slice

After this foundation is merged, the next slice should add:

1. concrete GitHub Issue client binding and job creation/update integration;
2. source-register and coverage-map persistence conventions alongside course branches;
3. intake/source worker contract able to take one official awarding-body URL to a resolved `sourced` job;
4. coverage compiler/work-unit planner able to take that job to `mapped`;
5. deterministic checks around source/coverage cross-references.

AI content generation should be connected only after the intake/source/coverage path is reliably restartable and observable.

## Documentation impact

No product, educational-assurance or merge-governance authority changes in this slice. It implements the already approved Content Factory authority and records the resulting technical implementation boundary here.
