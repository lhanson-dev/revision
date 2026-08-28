# Content Factory Reliability Qualification Harness

## Status

Implementation and qualification plan for the course-agnostic Content Factory reliability reset introduced after live Pilot #15.

This document is current implementation truth. The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` before normal generation progression with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

The run had only reached the Course Knowledge Model plus deterministic intake/source/coverage stages. No Question Families, markable assessment items or Marking Packs had been produced. The first Course Knowledge Model provider call cost `$0.053106`; the workflow stopped before the later stages that previous pilots had reached.

The significance is systemic rather than Business-specific. Pilot #10 had already documented the same class of failure: generated educational content can be valid while a second model-authored representation of exact evidence drifts. Pilot #10 therefore moved Learn and Practice evidence to bounded locators resolved deterministically by Revision. Pilot #15 proves that this intended ownership is still not reliable across the currently exercised Practice path.

Repeated whole-course paid runs are therefore no longer the primary debugging mechanism.

## Current implementation boundary

This branch introduces a fail-closed preflight before the live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

The preflight reads:

`content-factory/reliability-qualification.json`

The current status is intentionally:

`paused`

and `livePilotEligible` is `false`.

There is no workflow input or environment-variable bypass. Re-enabling the paid pilot requires a governed change to the repository qualification evidence and normal Founder-approved merge.

## Course-agnostic qualification architecture

The reliability work is organised by reusable worker boundary rather than by named Business examples.

The qualification harness must cover:

1. Course Knowledge Model / structured course facts;
2. Learn generation;
3. Practice generation;
4. assessment design / Question Family boundaries where model-assisted;
5. assessment-item generation;
6. Marking Pack generation;
7. independent review;
8. remediation;
9. expert-review package assembly;
10. orchestrator restart/reuse/dependency invalidation.

The machine-readable starting inventory is:

`content-factory/reliability-contract-inventory.json`

Its current `in_review` / `pending` states are deliberate. The inventory does not claim qualification.

## Mechanical ownership audit

The audit question for every provider field is:

**Why is the model authoring this value if Revision subsequently checks it mechanically?**

Each field is classified as:

- generative judgement;
- deterministically derived;
- bounded locator/reference;
- targeted repair eligible;
- fail closed.

The objective is not to remove useful model judgement. It is to remove duplicated model authorship of clerical representations that Revision can derive without educational loss.

Examples already identified from live evidence include:

- exact Learn/Practice evidence excerpts → bounded locator resolved by Revision;
- Marking Pack aggregate AO totals → deterministically derived from validated subquestion allocations;
- assessment response-demand/command synchronisation → strict validator plus one bounded targeted repair where the intended educational demand is genuinely linguistic.

## Provider-free contract matrix

Before any paid confirmation pilot, provider-free tests must exercise every material generic worker contract with valid and adversarial responses.

The matrix includes:

- valid first-pass response;
- malformed structured response;
- missing/duplicate references;
- invalid locator/index/field references;
- paraphrased exact evidence;
- inconsistent totals;
- assessment demand/metadata mismatch;
- permitted targeted-repair success;
- targeted-repair failure;
- true fail-closed educational defects;
- proof that valid output does not create an unnecessary extra provider call.

Historical pilot wording must not be invented when rejected provider output was not retained. Synthetic regressions represent the defect class and are labelled as such.

## Subject-shape matrix

The same contracts must be exercised with provider-free fixtures representing materially different qualification shapes:

- quantitative/business/economics;
- mathematics;
- science;
- essay/humanities;
- language or prescribed-text.

These fixtures prove process/schema compatibility only. They do not claim educational correctness or replace subject-specific source/assurance work.

No worker implementation may assume a Business-shaped structure unless the governing generic contract explicitly allows a subject-specific plugin at that boundary.

## Deterministic pipeline simulation

A complete synthetic/stored-response course simulation must exercise the real orchestrator and validators without external provider calls through:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation if required → expert_review_ready`

The simulation must prove that the same implementation paths used by live workers can:

- resolve deterministic metadata;
- retain strict educational validation;
- remediate the smallest affected unit;
- assemble the expert-review package;
- avoid learner publication;
- fail closed on unrecoverable contract defects.

## Restart, reuse and invalidation qualification

The existing durable cache currently keys reuse to implementation head in ways that make a fresh implementation SHA a broad invalidation boundary. That was safe during early calibration but is too coarse for a mature stateful pipeline.

Reliability qualification must introduce or prove dependency-aware semantic fingerprints so that:

- unchanged upstream source/coverage artifacts remain reusable when an unrelated downstream compiler changes;
- a Practice compiler change invalidates affected Practice outputs and true dependants, not unrelated Learn or Course Knowledge Model outputs;
- an assessment compiler change invalidates assessment/Marking Pack/review dependants without regenerating unrelated teaching content;
- source or coverage changes invalidate the genuinely affected downstream graph;
- provider-contract changes invalidate outputs whose quality assumptions depend on that contract;
- cumulative spend and retry provenance remain truthful across reuse.

This is essential to making the Content Factory genuinely stateful rather than repeatedly starting a whole course from zero.

## Repeated stability gate

A single synthetic green run is not sufficient.

The final qualification record must state:

- exact implementation head;
- exact test/harness commands;
- subject-shape fixtures exercised;
- worker contracts covered;
- repeated full-pipeline simulation count;
- restart/reuse scenarios covered;
- known limitations;
- whether every Q1–Q6 gate in the governing standard passed.

Only then may `content-factory/reliability-qualification.json` be changed to `qualified` and `livePilotEligible: true` in a Founder-approved PR.

## Paid confirmation pilot

The first paid run after qualification is a confirmation pilot, not a discovery mechanism.

It must still:

- use approved `main`;
- apply source-rights controls;
- use the governed course spend ceiling;
- preserve independent educational review;
- remain unpublished through `expert_review_ready`;
- retain full durable evidence.

A failure after qualification must be classified against the generic contract inventory first. A named course example may provide evidence, but the remediation must address the reusable process unless the requirement is genuinely subject-specific.

## Documentation impact

This reliability reset is material process governance, so the branch includes:

- the new normative Reliability Qualification Standard;
- this technical implementation/qualification plan;
- a machine-readable qualification status;
- a machine-readable generic contract inventory;
- a fail-closed workflow preflight;
- regression assurance that the paused state blocks paid execution.

Historical Pilot #15 / Issue #209 remains unchanged. Future qualification work must append evidence rather than rewriting prior pilot records.
