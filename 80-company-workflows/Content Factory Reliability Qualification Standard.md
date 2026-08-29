---
title: "Content Factory Reliability Qualification Standard"
document_id: "content-factory-reliability-qualification-standard"
document_type: "workflow-standard"
authority: "company-workflows"
status: "active"
version: "2.0"
owner: "Founder"
effective_date: "2026-08-29"
source_of_truth_for: ["Content Factory pre-live reliability qualification", "paid live-pilot eligibility", "course-agnostic worker-contract qualification", "live worker-soak qualification"]
depends_on: ["Content Factory Operating Model", "Content Accuracy Assurance Gate", "Content Factory Bootstrap Cost Strategy", "AI Agent Constitution"]
---
# Content Factory Reliability Qualification Standard

## Purpose

Define the reliability qualification that the Content Factory process must pass before Revision treats another full end-to-end live course run as useful confirmation evidence.

This standard applies to the **Content Factory process itself**, not to AQA Business or any one subject, awarding body, qualification or course. A correction is not sufficient merely because it allows one previously failing example to pass.

The reliability objective is not that every model call is perfect on first generation. The objective is that expected model variability is converted by compiler-owned structure, deterministic validation and bounded repair into a valid artifact or a truthful fail-closed result **without engineering intervention**.

## Trigger and v2 change

Pilots #10–#15 showed that repeated paid whole-course probing was discovering new provider-contract and deterministic-cross-reference failures one at a time. Version 1.0 therefore introduced provider-free Q1–Q6 qualification before a paid confirmation pilot.

Pilots #17 and #18 then demonstrated a remaining limitation in that method:

- Pilot #17 exposed a plausible provider representation that was not represented in the provider-free qualification fixtures;
- Pilot #18 exposed a Marking Pack validation/repair path in which validation stopped at the first defect, the single repair was directed only at that defect, and a second defect of the same class became visible only after repair.

A repeatedly green synthetic suite is therefore necessary but not sufficient evidence that the live provider boundary is robust.

Version 2.0 changes the calibration method again. Full-course paid probing remains paused while Revision closes known contract classes using a compiler-first design, replays historical failures, adversarially mutates provider outputs, aggregates complete artifact diagnostics, and then performs a small bounded live worker soak before any further full-course confirmation run.

Historical pilot evidence remains historical evidence and must not be rewritten.

## Core rule

**Paid end-to-end Content Factory live course pilots are paused until Q1–Q7 below are PASS on approved `main` and a separate governed eligibility transition has restored the machine-readable status to `qualified`.**

The full-course live-pilot workflow must fail before any external model call when the machine-readable qualification status is not `qualified`.

A bounded live worker soak under Q7 is a distinct reliability qualification activity. It does not authorize a full-course run, content publication or educational approval.

Re-enabling paid full-course pilots requires a governed repository change with exact-head assurance and explicit Founder merge approval. It must not be bypassed through workflow input, environment variable, subject-specific exception or manual reuse of a previously qualified status.

## Course-agnostic design rule

Every reliability correction must be expressed at the smallest reusable process boundary that applies across courses.

The Content Factory must not encode a Business-specific fix where the underlying contract is generic. Subject-specific rules are permitted only where educational authority genuinely differs by subject or qualification shape, and they must plug into a generic worker/orchestrator contract rather than redefine the pipeline.

Qualification evidence must cover materially different course shapes, including at least:

- quantitative/business/economics-style content;
- mathematics;
- science;
- essay/humanities;
- language or prescribed-text content.

Synthetic fixtures may be used where they exercise the same schemas, compilers, worker boundaries and validators as production. They are process evidence, not educational benchmark evidence.

## Compiler-first ownership rule

For every field a model might author, the implementation must decide whether the model should own the educational meaning or whether Revision can safely construct the mechanically checked representation.

The permitted ownership classes remain:

1. **generative judgement** — genuinely requires model authorship;
2. **deterministically derived** — must be computed from validated generated artifacts or governed structured inputs;
3. **bounded locator/reference** — the model may identify a structured location or key, but Revision resolves the final mechanically checked value;
4. **targeted repair eligible** — a linguistic or semantic mismatch may receive at most one validator-directed repair where deterministic derivation cannot preserve the intended educational demand;
5. **fail closed** — a real educational or contract defect that must stop the affected work unit.

The default for mechanically provable structure is now **compiler ownership**, not model authorship.

If Revision can construct an ID, aggregate, total, exact reference, mark band, positional label, coverage pointer, required skeleton or other clerical representation without losing educational meaning, the model must not be asked to author that representation merely so Revision can validate it afterwards.

For example, where a calculation Marking Pack requires an operational mark skeleton, Revision should construct the governed structure of the rubric where possible and ask the model for the subject-specific educational marking meaning that belongs inside it.

Duplicated authorship is prohibited where deterministic derivation can preserve the intended educational meaning.

## Complete-diagnostic validation rule

A validator that supports targeted repair must normally inspect the whole parseable artifact and return the complete actionable defect set before any repair call is made.

The repair worker must receive that complete defect set and may receive at most one targeted repair attempt for that artifact under the applicable contract.

The implementation must not deliberately create a serial loop in which:

`validate first defect → repair first defect → discover second defect → require another paid course run`.

A validator may stop early only when the artifact is structurally unparseable or an earlier condition genuinely makes later validation unsafe or meaningless. That early-stop reason must be explicit.

After the one permitted targeted repair, the whole artifact must be revalidated. Remaining contract defects fail closed.

## Historical failure corpus rule

All durable historical Content Factory contract-class failures must become permanent regression evidence.

For Pilots #1–#18 and later pilots:

- where the exact historical provider output is durably available and lawful to retain, replay that exact output through the current compiler/validator boundary;
- where exact output is unavailable, retain a synthetic reproduction of the defect class clearly labelled as a reproduction rather than historical exact evidence;
- preserve the original pilot record unchanged;
- prove that each known defect class is now deterministically normalized/compiled, repaired within the bounded policy, or truthfully rejected at the intended boundary.

A later fix may change the expected modern outcome but must not rewrite what historically occurred.

## Adversarial mutation rule

Qualification must not test only one valid fixture and one previously observed invalid fixture.

Provider-free tests must systematically create near-boundary and simultaneous variations, including where applicable:

- omitted, blank, whitespace-only and malformed optional values;
- duplicated, missing and reordered references;
- inconsistent aggregates and mark totals;
- multiple invalid subquestions in the same artifact;
- overlapping, missing or out-of-range mark bands;
- multiple calculation rubrics with missing method/accuracy treatment;
- mixed valid and invalid bounded locators;
- plausible alternative model phrasings;
- several independent repair-eligible defects in one artifact;
- combinations that must remain fail closed.

The objective is to discover contract classes cheaply before a whole course run rather than to enumerate every possible wording.

## Qualification gates

Reliability qualification evidence is PASS only when Q1–Q7 below pass on the same implementation head.

### Q1 — compiler/worker ownership inventory

Maintain a machine-readable or test-enforced inventory of every material provider contract and mechanically validated field for:

- Course Knowledge Model / structured course facts;
- Learn generation;
- Practice generation;
- Assessment Blueprint and Question Families where model-assisted;
- assessment-item generation;
- Marking Pack generation;
- independent review output;
- remediation output;
- expert-review package assembly.

Every mechanically checked field must have one of the governed ownership classifications. Q1 must explicitly challenge whether each model-authored mechanical field can move to compiler ownership.

A field may remain generative only where removing model authorship would lose educational meaning or useful judgement.

### Q2 — historical failure replay corpus

Replay the durable historical failure corpus through the current implementation.

Q2 passes only when every included historical contract class has a current expected outcome and no known previously corrected contract class can silently recur.

The corpus must distinguish exact historical outputs from synthetic reproductions.

### Q3 — adversarial provider-free contract and subject-shape matrix

Exercise the same production schemas, compilers and validators against the five governed course shapes and adversarial mutations.

At minimum this must cover:

- valid first-pass output;
- structurally malformed output;
- missing/duplicate references;
- invalid bounded locators;
- model paraphrase where exact evidence is required;
- inconsistent totals/cross-references;
- demand/metadata mismatch where applicable;
- multiple simultaneous defects in a single parseable artifact;
- one targeted repair using the **complete diagnostic set** where the contract permits repair;
- repair failure and fail-closed behaviour;
- no extra provider call for valid output.

A subject-shape fixture may contain invented non-production educational content. The qualification claim is process compatibility, not factual subject approval.

### Q4 — deterministic full-pipeline simulation

A complete course-build simulation using stored/synthetic provider responses must traverse:

`requested → identified → sourced → mapped → generating → validating → independent_review → remediation when applicable → expert_review_ready`

without paid provider calls.

The simulation must prove:

- every stage transition;
- compiler ownership at the intended boundaries;
- complete-diagnostic validation before targeted repair;
- targeted remediation against the smallest affected work unit;
- correct dependent-stage invalidation;
- independent-review separation;
- expert-review package assembly;
- no publication side effect.

### Q5 — restart, reuse and dependency-aware invalidation

Qualification must prove that interruption or a defect does not force unaffected successful stages to be regenerated.

At minimum:

- unchanged completed worker executions are reusable across an allowed resume;
- a worker-contract or compiler-semantic change invalidates only outputs whose quality assumptions depend on that change, plus genuine downstream dependants;
- a Practice compiler change must not automatically invalidate unrelated Course Knowledge Model or Learn outputs;
- an assessment/Marking Pack compiler change must not automatically invalidate unrelated Learn/Practice artifacts;
- source/coverage changes deliberately invalidate all genuinely affected downstream content;
- spend/retry provenance remains truthful after reuse/remediation.

Implementation-head changes alone must not be treated as a universal semantic invalidation key once dependency-aware fingerprints are available.

### Q6 — repeated provider-free stability

Q2–Q5 must pass repeatedly without a new contract-class failure. The technical qualification record must state the repetition count and exact evidence used.

A single green run is insufficient.

Repetition must vary mutation seeds/order or equivalent adversarial inputs where the harness supports it; repeating one immutable fixture three times is not sufficient evidence by itself.

### Q7 — bounded live worker soak

After Q1–Q6 PASS, Revision may run a **bounded live provider soak** against high-risk worker boundaries without running a full course.

The soak exists to sample real provider variability against the same compilers and validators exercised provider-free.

It must:

- use synthetic or rights-safe structured inputs rather than building/publishing a real learner course;
- cover all five governed subject shapes across the soak set;
- include the highest-risk generation boundaries, including assessment-item and Marking Pack generation and other boundaries identified by Q1 risk classification;
- produce at least 20 live worker outputs in total before claiming PASS, unless a stricter technical record is approved;
- include multiple independent samples for assessment-item and Marking Pack generation;
- use the same compiler, validator and bounded-repair code as production;
- record provider/model, contract version, result, repair count and cost for every sample;
- remain within the live-soak spend ceiling in the Content Factory Bootstrap Cost Strategy;
- perform no learner publication and no full-course assembly;
- fail qualification if it exposes a new generic contract class that the compiler/repair boundary cannot safely handle.

A live output that is correctly rejected for a genuine educational defect does not by itself prove reliability failure. A new **engineering contract class** does.

If Q7 finds a new generic contract defect, return to the affected Q1–Q6 gates before another soak. Do not escalate directly to a full-course run.

## Q8 — full-course confirmation eligibility

Only after Q1–Q7 PASS may `content-factory/reliability-qualification.json` be changed to `qualified` through a separate governed PR.

The next paid end-to-end real course run is then a **confirmation pilot**, not a debugging mechanism. It must still obey source-rights, educational assurance, spend and human-review authority.

A confirmation pilot must be classified carefully:

- **educational finding** — content is generated and the educational assurance system correctly identifies something that needs remediation; this is expected assurance work, not automatically an engineering reliability failure;
- **provider/infrastructure incident** — handled under bounded retry/resume rules;
- **new generic contract/engineering failure** — reliability failure; pause full-course eligibility and return to v2 qualification.

## Maturity exit criterion

The Content Factory must not be described as mature or ready for routine batch course production merely because one confirmation course succeeds.

Maturity requires **three consecutive materially different real courses** to reach `expert_review_ready` on their initial full factory run without any engineering/code/worker-contract correction being required between those course runs.

Those three courses must represent more than one governed subject shape.

The following do not break the sequence when correctly handled by the existing factory:

- normal educational findings and targeted content remediation;
- bounded provider/infrastructure retry;
- qualified human-review findings;
- content-specific course decisions that do not alter the reusable process.

A new generic engineering contract class resets the maturity sequence after remediation/requalification.

## Stop-loss architecture review

After v2 qualification, if **two consecutive confirmation-course attempts** expose new generic engineering contract classes requiring reusable code/contract changes, no third full-course confirmation attempt may be started merely to see what fails next.

Before another full-course attempt, Revision must perform a deliberate architecture review of the affected worker/compiler boundary and decide whether further generative ownership should move into deterministic/template/compiler ownership or whether a different production approach is required.

This stop-loss does not require abandoning the Content Factory. It prevents indefinite paid whole-course debugging.

## Failure handling during qualification

When qualification exposes a defect:

- classify the defect by generic worker/compiler boundary;
- fix the reusable process rather than fixture-specific wording;
- prefer deterministic compiler ownership over prompt accumulation where educational meaning permits;
- add exact historical replay or a labelled synthetic regression as appropriate;
- add adversarial variants, including simultaneous defects where applicable;
- rerun the affected gates and dependency evidence;
- do not run a paid full-course pilot merely to discover whether the patch happened to work.

## Relationship to educational assurance

This reliability gate does not lower or replace the Content Accuracy Assurance Gate.

A pipeline can be operationally reliable and still produce educational content that fails A1/A2/A3/A4 review. That is why independent educational review and qualified human review remain essential.

Conversely, a valid educational item must not be discarded merely because the model was unnecessarily asked to duplicate a deterministic clerical representation.

Reliability qualification exists so educational assurance evaluates the educational product rather than repeatedly debugging JSON, metadata, totals, cross-references or other compiler-owned structure.

## Cost and scale

This standard implements the bootstrap optimisation order:

- deterministic work deterministically;
- reuse governed artifacts;
- send only necessary context;
- bound retries;
- target remediation;
- measure provider variability before scaling.

The US$20 per-course ceiling remains unchanged. The bounded Q7 live soak uses its separate lower ceiling under the Content Factory Bootstrap Cost Strategy and counts against the existing API working envelope.

## Documentation and evidence

Maintain:

- a machine-readable current qualification status;
- a technical qualification record describing the corpus, mutation strategy, repetitions, live-soak sample set and known limitations;
- historical pilot records unchanged;
- live-soak cost and outcome evidence;
- an indexed trail from the operating model to this standard and its implementation.

Any material change to these qualification gates, compiler-first ownership rule, live-soak eligibility, full-course eligibility, maturity criterion or stop-loss rule requires normal governed review and Founder-approved merge.
