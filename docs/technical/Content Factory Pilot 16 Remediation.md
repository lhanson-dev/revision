# Content Factory Pilot 16 Remediation

**Status:** implementation remediation in governed PR  
**Trigger:** Confirmation Pilot #16 / workflow run `33214478392` / durable job Issue `#226`  
**Failed implementation head:** `47c30e95c49c1951d0dd31c48b63a1d15506529f`

## Outcome of Pilot #16

The reliability qualification preflight passed and the paid AQA AS Business 7131 course build reached fresh-context independent educational review. The job then stopped in `independent_review` with `fail_hold`; it did not reach `expert_review_ready`, did not publish learner content and did not fail because of provider or infrastructure availability.

The live run consumed approximately `$1.80412` against the `$20` course ceiling. Its evidence remains historical in the workflow artifact and Issue `#226`.

The live workflow deliberately allowed zero automatic remediation cycles. That boundary remains unchanged: material findings from a paid live run return to governed repository remediation rather than being silently regenerated until a reviewer passes them.

## Findings and owning corrections

### 1. Percentage-change formula precedence

Pilot output contained:

`percentage change (%) = new value - original value / original value × 100`

The generated-output integrity compiler now canonicalises this known mathematical representation to:

`percentage change (%) = ((new value - original value) / original value) × 100`

This is deterministic representation correction rather than a second generative judgement.

### 2. MCQ answer-key pattern

All ten Pilot #16 MCQs placed the correct answer at option A. The new generic integrity compiler deterministically reorders already-generated option objects across multi-question MCQ sets so correct positions are distributed A–D while preserving the correct answer text and distractor content.

A provider-free regression proves that a ten-question all-A candidate is rejected as biased and that deterministic rebalancing produces a non-patterned four-position distribution without changing answer content.

### 3. Unstated assessment premises

The Pilot #16 UrbanFuel short-answer item asked the learner to treat a survey as quantitative without establishing its response format in the stimulus.

Assessment generation now receives a reusable integrity instruction: classifications, sampling claims, numerical baselines, time horizons and other factual premises required by a question must be established by the learner-facing wording or supplied context rather than presupposed.

The AQA Business short-answer family adds the same rule explicitly for research/data classification and sampling context.

### 4. Practice prompt/answer contradiction

A cash-flow activity asked the learner to identify the month with a deficit even though all calculated closing balances were positive and its expected response correctly said no deficit occurred.

The generated-output integrity compiler now repairs this deterministic prompt/answer presupposition mismatch by changing the definite prompt into a conditional question: determine whether a deficit occurs and identify/action it only if one does. Exact coverage evidence is updated with the same deterministic text correction.

### 5. RefillWorks option scope and financial horizon

The Pilot #16 case data admitted a material hybrid option: use 18,000 packs of existing spare annual capacity and outsource the remaining 6,000 packs. The generated item nevertheless framed automation versus outsourcing as the decision and did not give a sufficient time horizon for comparing one-off automation cost with recurring contribution effects.

The AQA Business pilot policy now makes three alternatives explicit:

- automation;
- full outsourcing;
- hybrid use of 18,000 packs of existing spare capacity plus 6,000 outsourced packs.

It also makes cost scope explicit for packs made on current equipment versus the automated line and supplies a three-year supermarket-contract horizon. The Paper 2 family policy requires material alternatives to be evaluated rather than silently collapsed into a binary choice.

These are Business-case facts plugged into the existing generic assessment contract; they do not redefine the Content Factory pipeline.

### 6. Marking Pack operational coverage

The Pilot #16 RefillWorks Marking Pack carried detailed level descriptors only for the 28-mark evaluation part, leaving 52 marks without operational point/level award logic.

The generated-output integrity compiler now requires every structured subquestion to have one or more local rubric entries, identified by the exact subquestion ID prefix, whose numeric bands collectively cover every integer mark from zero to that subquestion maximum.

Additional checks require:

- calculation rubrics to distinguish method/working from answer accuracy and consequential-error treatment;
- extended analysis/evaluation rubrics to distinguish more than one quality level.

If the first Marking Pack is otherwise structurally valid but fails this deterministic operational-rubric check, one validator-directed provider repair is allowed. Failure after that single repair fails closed.

### 7. Learner-language contamination

A Learn worked-example step ended with an isolated Malayalam token after an otherwise English sentence.

The integrity compiler removes only an isolated trailing token made entirely from a non-Latin letter script when the preceding string contains Latin-script learner text. The same correction is applied to matching exact coverage evidence. This is deliberately narrow and does not globally prohibit non-Latin content, preserving language/prescribed-text course compatibility.

## Reliability status

This remediation changes generated-output quality assumptions after Q7. The machine-readable reliability status is therefore re-paused on the branch:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The pause is bound to Pilot #16 run `33214478392`, Issue `#226` and failed implementation head `47c30e95c49c1951d0dd31c48b63a1d15506529f`.

A fresh paid pilot is prohibited until the corrected implementation passes provider-free reliability requalification on approved `main` and a separate governed qualification-status transition restores eligibility.

## Assurance expectation

The remediation PR must pass the normal exact-head Revision CI suite, including the new provider-free Pilot #16 defect-class regressions and the existing Q1–Q6 reliability suites. No paid model call is required to validate this PR.

After merge, provider-free requalification must be recorded against the corrected approved `main` before the next paid confirmation pilot is dispatched.

## Documentation impact

This is implementation/current-state evidence under the existing Content Factory Operating Model, Content Accuracy Assurance Gate and Reliability Qualification Standard. No normative authority changes are introduced.

Historical Pilot #16 evidence is not modified. Issue `#226` remains the durable fail-hold record for the exact failed course build.
