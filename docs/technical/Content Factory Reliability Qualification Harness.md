# Content Factory Reliability Qualification Harness

## Status

Course-agnostic Content Factory reliability qualification is active on approved `main`. Paid end-to-end live pilots remain paused.

This document is current implementation truth. The governing rule is `80-company-workflows/Content Factory Reliability Qualification Standard.md`.

Q1 worker-contract ownership inventory has now been completed against production-verified `main` commit `15737d04f769264dd986bede2d909e228bc408d3`. The inventory is complete enough to expose current ownership and blockers, but **Q1 is not PASS** because two generic contract blockers remain. Q2 is the next remediation/qualification gate.

## Why the calibration method changed

Pilot #15 ran from approved `main` commit `7df79c28ae0f72610cbb28f9c01f366f85aa2c0d` as workflow run `33149356421` and durable Issue `#209`.

It stopped from `mapped` before normal generation progression with:

`Practice work unit marketing-research evidence for data interpretation is not an exact excerpt from the generated learner content`

The run had only reached the Course Knowledge Model plus deterministic intake/source/coverage stages. No Question Families, markable assessment items or Marking Packs had been produced. The first Course Knowledge Model provider call cost `$0.053106`; the workflow stopped before the later stages that previous pilots had reached.

The significance is systemic rather than Business-specific. Pilot #10 had already documented the same class of failure: generated educational content can be valid while a second model-authored representation of exact evidence drifts. Pilot #10 therefore moved Learn and Practice evidence to bounded locators resolved deterministically by Revision. Pilot #15 proves that this intended ownership is still not reliable across the currently exercised Practice path.

Repeated whole-course paid runs are therefore no longer the primary debugging mechanism.

## Current implementation boundary

Approved `main` now contains a fail-closed preflight before the live-pilot model call:

`workflow_dispatch → checkout/install → reliability qualification preflight → only if qualified: paid live pilot`

The preflight reads:

`content-factory/reliability-qualification.json`

The current status is intentionally:

`paused`

and `livePilotEligible` is `false`.

There is no workflow input or environment-variable bypass. Re-enabling the paid pilot requires a governed change to the repository qualification evidence and normal Founder-approved merge.

## Course-agnostic qualification architecture

The reliability work is organised by reusable worker boundary rather than by named course examples.

The qualification harness covers:

1. Course Knowledge Model / structured course facts;
2. Learning Blueprint planning;
3. Learn generation;
4. Practice generation;
5. Assessment Blueprint planning;
6. Question Family generation;
7. assessment-item generation;
8. Marking Pack generation;
9. deterministic validation;
10. independent review;
11. remediation;
12. expert-review package assembly;
13. orchestrator restart/reuse/dependency invalidation in Q5.

The machine-readable inventory is:

`content-factory/reliability-contract-inventory.json`

Its schema v2 inventory is test-enforced and tied to the exact reviewed `main` commit. Every governed material worker boundary must be present exactly once, must be generic, must identify implementation evidence, and must classify each inventoried mechanically checked representation using the five governed ownership classes.

## Q1 — completed ownership audit, not yet PASS

Q1 reviewed the actual current implementation rather than reconstructing contract intent from pilot history.

The audit confirms the intended generic ownership model for the main reliability-sensitive representations:

- exact Learn evidence → bounded locator/reference resolved by Revision;
- exact Practice evidence → bounded locator/reference resolved by Revision;
- job, artifact, fingerprint and immutable cross-reference metadata → deterministic derivation where Revision already owns the source values;
- unknown/out-of-scope requirement, component, node, family and artifact references → fail closed;
- assessment response-demand versus learner-facing command mismatch → strict deterministic validation plus one bounded targeted repair where the intended educational demand is linguistic;
- expert-review package composition and exact-version assurance bindings → deterministic derivation / fail closed;
- educational explanations, questions, marking judgement, independent-review findings and remediated educational content → generative judgement subject to downstream assurance.

Two generic blockers prevent Q1 from being marked PASS:

### Q1-PRACTICE-EVIDENCE-PATH

`src/content-factory/provider-coverage-evidence.ts` contains the intended generic Practice locator resolver: mode + one-based activity index + one of `prompt`, `expectedResponse`, `explanation` or `improvementAction` resolves to the exact generated learner-content string.

Pilot #15 nevertheless reached the exact-evidence mismatch class. Q2 must therefore exercise the **actual adapter/compiler path**, across every supported Practice mode, to find the path that bypasses the resolver or creates an incompatible representation. This is not a Business-specific content fix.

### Q1-MARKING-PACK-DUPLICATE-AO-ARITHMETIC

`validateMarkingPack` still parses and validates provider-authored `assessmentObjectiveAllocation`, including checking that its aggregate marks total equals the assessment-item maximum, before final pack assembly. Where structured subquestion guidance already provides the underlying allocations, this is duplicated model-authored arithmetic.

The governed target ownership is deterministic derivation from validated structured guidance. Q2 must remove the duplicated aggregate authorship or derive it before the aggregate checks, while retaining strict validation of genuine educational allocation choices.

These blockers are deliberately machine-readable in the inventory. The inventory status is therefore `complete_with_blockers`, not `pass` or `qualified`.

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

## Q1 regression enforcement

`src/content-factory/reliability-contract-inventory.test.ts` prevents the inventory from silently degrading by asserting that:

- every governed material worker boundary appears exactly once;
- all boundaries are generic rather than course-specific;
- every boundary has implementation evidence and at least one classified mechanical representation;
- only the five governed ownership classes are used;
- every blocker is explicit both at field level and in the top-level blocker register;
- the inventory cannot claim Q1 completion without retaining known generic Practice-evidence and Marking-Pack-arithmetic blockers;
- assessment response-demand ownership remains `targeted_repair_eligible` rather than being silently weakened or reclassified.

This is the contract-test foundation for Q2. It does not substitute for Q2 adversarial provider-response tests.

## Provider-free contract matrix — Q2

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

Q2 starts with the two blockers exposed by Q1, then expands across the full worker inventory. Historical pilot wording must not be invented when rejected provider output was not retained. Synthetic regressions represent the defect class and are labelled as such.

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

This Q1 increment changes implementation evidence, not the normative Reliability Qualification Standard. The existing authority already requires the ownership inventory and course-agnostic process.

This increment therefore updates:

- the machine-readable generic contract inventory;
- test enforcement of that inventory;
- this technical qualification record.

`content-factory/reliability-qualification.json` remains `paused`; Q1 is not represented as PASS while the two generic blockers remain. Historical Pilot #15 / Issue #209 remains unchanged. Future qualification work must append evidence rather than rewriting prior pilot records.
