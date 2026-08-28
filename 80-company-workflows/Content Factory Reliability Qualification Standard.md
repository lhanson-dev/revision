---
title: "Content Factory Reliability Qualification Standard"
document_id: "content-factory-reliability-qualification-standard"
document_type: "workflow-standard"
authority: "company-workflows"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-08-28"
source_of_truth_for: ["Content Factory pre-live reliability qualification", "paid live-pilot eligibility", "course-agnostic worker-contract qualification"]
depends_on: ["Content Factory Operating Model", "Content Accuracy Assurance Gate", "Content Factory Bootstrap Cost Strategy", "AI Agent Constitution"]
---
# Content Factory Reliability Qualification Standard

## Purpose

Define the reliability qualification that the Content Factory must pass before Revision spends money on another full end-to-end live course pilot.

This standard applies to the **Content Factory process itself**, not to AQA Business or any one subject, awarding body, qualification or course. A remediation is not sufficient merely because it allows one previously failing Business example to pass.

## Trigger

Live Pilots #10–#15 exposed repeated provider-contract and deterministic-cross-reference failures at different points in the pipeline. Pilot #15 returned to the exact-evidence class previously addressed after Pilot #10 and failed before assessment or Marking Pack generation.

The calibration method therefore changes from repeated whole-course paid probing to staged, provider-free reliability qualification followed by a paid confirmation run.

Historical pilot evidence remains historical evidence and must not be rewritten.

## Core rule

**Paid end-to-end Content Factory live pilots are paused until the reliability qualification gate is PASS on approved `main`.**

The live-pilot workflow must fail before any external model call when the machine-readable qualification status is not `qualified`.

Re-enabling paid live pilots requires a governed repository change with exact-head assurance and explicit Founder merge approval. It must not be bypassed through a workflow input, environment variable or Business-specific exception.

## Course-agnostic design rule

Every reliability correction must be expressed at the smallest reusable process boundary that applies across courses.

The Content Factory must not encode a Business-specific fix where the underlying contract is generic. Subject-specific rules are permitted only where educational authority genuinely differs by subject or qualification shape, and they must plug into a generic worker/orchestrator contract rather than redefine the pipeline.

Qualification evidence must therefore cover materially different course shapes, including at least:

- quantitative/business/economics-style content;
- mathematics;
- science;
- essay/humanities;
- language or prescribed-text content.

Synthetic fixtures may be used for provider-free qualification where they exercise the same schemas, worker boundaries and validators as production. They are not educational benchmark evidence.

## Deterministic ownership rule

For every model-authored field that is subsequently checked mechanically, the implementation must explicitly classify ownership as one of:

1. **generative judgement** — genuinely requires model authorship;
2. **deterministically derived** — must be computed from validated generated artifacts or governed structured inputs;
3. **bounded locator/reference** — the model may identify a structured location or key, but Revision resolves the final mechanically checked value;
4. **targeted repair eligible** — linguistic mismatch may receive at most one validator-directed repair where deterministic derivation cannot preserve the intended educational demand;
5. **fail closed** — a real educational/contract defect that must stop the affected work unit.

Duplicated authorship is prohibited where Revision can derive the mechanically checked representation deterministically without losing educational meaning.

This includes, where applicable, exact evidence excerpts, aggregate totals, IDs and cross-references, mark/AO totals, generated-content locations and other clerical representations of already-produced content.

## Qualification gates

The reliability qualification is PASS only when all applicable gates below pass on the same implementation head.

### Q1 — worker-contract inventory

Maintain a machine-readable or test-enforced inventory of material provider contracts and mechanically validated fields for:

- Course Knowledge Model / structured course facts;
- Learn generation;
- Practice generation;
- Assessment Blueprint and Question Families where model-assisted;
- assessment-item generation;
- Marking Pack generation;
- independent review output;
- remediation output;
- expert-review package assembly.

Every mechanically validated field must have an explicit ownership classification under the deterministic ownership rule.

### Q2 — provider-free contract matrix

Each material worker boundary must have provider-free tests covering at least:

- valid first-pass output;
- structurally malformed output;
- missing/duplicate references;
- invalid bounded locators;
- model paraphrase where exact evidence is required;
- inconsistent totals/cross-references;
- demand/metadata mismatch where applicable;
- one targeted repair success where the contract permits repair;
- repair failure and fail-closed behaviour;
- no extra provider call for valid output.

Tests must exercise generic contracts rather than a single named Business case.

### Q3 — subject-shape matrix

Run the same contract and pipeline harness against fixtures representing the different course shapes listed above. The purpose is to detect assumptions that accidentally force every course through a Business-shaped representation.

A subject-shape fixture may contain invented, non-production educational content. The qualification claim is process compatibility, not factual subject approval.

### Q4 — deterministic pipeline simulation

A complete course-build simulation using stored/synthetic provider responses must traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

without paid provider calls.

The simulation must prove:

- every stage transition;
- deterministic validation at the intended boundary;
- targeted remediation against the smallest affected work unit;
- correct dependent-stage invalidation;
- independent-review separation;
- expert-review package assembly;
- no publication side effect.

### Q5 — restart, reuse and dependency-aware invalidation

Qualification must prove that interruption or a defect does not force unaffected successful stages to be regenerated.

At minimum:

- unchanged completed worker executions are reusable across an allowed resume;
- a worker-contract change invalidates only outputs whose quality assumptions depend on that contract, plus genuine downstream dependants;
- a Practice compiler change must not automatically invalidate unrelated Course Knowledge Model or Learn outputs;
- an assessment compiler change must not automatically invalidate unrelated Learn/Practice artifacts;
- source/coverage changes deliberately invalidate all genuinely affected downstream content;
- spend/retry provenance remains truthful after reuse/remediation.

Implementation-head changes alone must not be treated as a universal semantic invalidation key once dependency-aware fingerprints are available.

### Q6 — repeated qualification stability

The deterministic pipeline simulation and subject-shape matrix must pass repeatedly without a new contract-class failure. The repository's technical qualification record must state the repetition count and exact evidence used.

A single green run is insufficient to claim reliability qualification.

### Q7 — paid confirmation eligibility

Only after Q1–Q6 PASS may the machine-readable status be changed to `qualified` through a governed PR.

The next paid end-to-end live course run is then a **confirmation pilot**, not the primary debugging mechanism. It must still obey source-rights, educational assurance, spend and human-review authority.

## Failure handling during qualification

When a qualification test exposes a defect:

- classify the defect by generic worker/contract boundary;
- fix the reusable process rather than the fixture-specific wording;
- add a regression that represents the defect class without claiming synthetic wording is historical live evidence;
- rerun the affected qualification gates;
- update dependency invalidation evidence where the fix changes contract ownership;
- do not run a paid full-course pilot merely to discover whether the patch happened to work.

## Relationship to educational assurance

This reliability gate does not lower or replace the Content Accuracy Assurance Gate.

A pipeline can be operationally reliable and still produce educational content that fails A1/A2/A3/A4 review. Conversely, a valid educational item must not be discarded because the model was unnecessarily asked to duplicate a deterministic clerical representation.

Reliability qualification exists to make the orchestration and contracts dependable enough that educational assurance can evaluate the content rather than repeatedly debug metadata drift.

## Cost and scale

This standard implements the existing bootstrap optimisation order:

- deterministic work deterministically;
- reuse governed artifacts;
- bound retries;
- target remediation;
- measure before scaling.

No change is made to the US$20 per-course ceiling or the quality/trust floor. Paid pilots remain paused because further whole-course probing is currently lower-value evidence than provider-free reliability qualification.

## Documentation and evidence

Maintain:

- a machine-readable current qualification status;
- a technical qualification record describing the harness, fixtures, repetitions and known limitations;
- historical pilot records unchanged;
- an indexed trail from the operating model to this standard and its implementation.

Any material change to these qualification gates, live-pilot eligibility or the course-agnostic design rule requires normal governed review and Founder-approved merge.