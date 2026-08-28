# Content Factory Pilot 16 Remediation

**Status:** remediation merged; provider-free requalification in progress  
**Trigger:** Confirmation Pilot #16 / workflow run `33214478392` / durable job Issue `#226`  
**Failed implementation head:** `47c30e95c49c1951d0dd31c48b63a1d15506529f`  
**Remediation main:** `9f4d86dbeaca5a6fac13884bf8b161964a68ec88`

## Outcome of Pilot #16

The reliability qualification preflight passed and the paid AQA AS Business 7131 course build reached fresh-context independent educational review. The job then stopped in `independent_review` with `fail_hold`; it did not reach `expert_review_ready`, did not publish learner content and did not fail because of provider or infrastructure availability.

The live run consumed approximately `$1.80412` against the `$20` course ceiling. Its evidence remains historical in the workflow artifact and Issue `#226`.

The live workflow deliberately allowed zero automatic remediation cycles. That boundary remains unchanged: material findings from a paid live run return to governed repository remediation rather than being silently regenerated until a reviewer passes them.

## Findings and owning corrections

### 1. Percentage-change formula precedence

Pilot output contained:

`percentage change (%) = new value - original value / original value × 100`

The generated-output integrity compiler canonicalises this known mathematical representation to:

`percentage change (%) = ((new value - original value) / original value) × 100`

This is deterministic representation correction rather than a second generative judgement.

### 2. MCQ answer-key pattern

All ten Pilot #16 MCQs placed the correct answer at option A. The generic integrity compiler deterministically reorders already-generated option objects across multi-question MCQ sets so correct positions are distributed A–D while preserving the correct answer text and distractor content.

A provider-free regression proves that a ten-question all-A candidate is rejected as biased and that deterministic rebalancing produces a four-position distribution without changing answer content.

### 3. Unstated assessment premises

The Pilot #16 UrbanFuel short-answer item asked the learner to treat a survey as quantitative without establishing its response format in the stimulus.

Assessment generation receives a reusable integrity instruction: classifications, sampling claims, numerical baselines, time horizons and other factual premises required by a question must be established by the learner-facing wording or supplied context rather than presupposed.

The AQA Business short-answer family additionally carries course-specific research/data context because that is part of the pilot's assessment shape; it plugs into the generic assessment contract rather than redefining it.

### 4. Practice prompt/answer contradiction

A cash-flow activity asked the learner to identify the month with a deficit even though all calculated closing balances were positive and its expected response correctly said no deficit occurred.

The first remediation implementation used an exact cash-flow phrase mutation. Provider-free requalification identified that as too Business-shaped for a generic worker boundary. It has therefore been replaced by a generic generation guardrail carried in the Practice provider payload:

- every prompt must be internally consistent with its own expected response and explanation;
- the task must not presuppose a result, state, category, data property or problem contradicted by the generated answer;
- when the learner is meant to determine whether a condition exists, the task must be phrased conditionally rather than asserting the condition.

This preserves generative educational judgement while making the contract course-agnostic. Independent review remains the fail-closed educational backstop if a semantic contradiction survives generation.

### 5. RefillWorks option scope and financial horizon

The Pilot #16 case data admitted a material hybrid option: use 18,000 packs of existing spare annual capacity and outsource the remaining 6,000 packs. The generated item nevertheless framed automation versus outsourcing as the decision and did not give a sufficient time horizon for comparing one-off automation cost with recurring contribution effects.

The AQA Business pilot policy makes three alternatives explicit:

- automation;
- full outsourcing;
- hybrid use of 18,000 packs of existing spare capacity plus 6,000 outsourced packs.

It also makes cost scope explicit for packs made on current equipment versus the automated line and supplies a three-year supermarket-contract horizon. The Paper 2 family policy requires material alternatives to be evaluated rather than silently collapsed into a binary choice.

These are Business-case facts plugged into the existing generic assessment contract; they do not redefine the Content Factory pipeline.

### 6. Marking Pack operational coverage

The Pilot #16 RefillWorks Marking Pack carried detailed level descriptors only for the 28-mark evaluation part, leaving 52 marks without operational point/level award logic.

The generated-output integrity compiler requires every structured subquestion to have one or more local rubric entries, identified by the exact subquestion ID prefix, whose numeric bands collectively cover every integer mark from zero to that subquestion maximum.

Additional checks require:

- calculation rubrics to distinguish method/working from answer accuracy and consequential-error treatment;
- extended analysis/evaluation rubrics to distinguish more than one quality level.

If the first Marking Pack is otherwise structurally valid but fails this deterministic operational-rubric check, one validator-directed provider repair is allowed. Failure after that single repair fails closed.

### 7. Learner-language contamination

A Learn worked-example step ended with an isolated Malayalam token after an otherwise English sentence.

The first remediation implementation removed an isolated trailing non-Latin token from otherwise Latin learner text. Provider-free requalification demonstrated that this could also remove legitimate target-language material in a language or prescribed-text course, so that mutation has been removed.

The generic Learn provider payload now carries two paired requirements:

- do not append unrelated fragments, stray tokens or accidental text in another writing system;
- preserve legitimate target-language, transliterated, quoted or prescribed-text wording when the course genuinely requires it, and never delete valid learner content merely because its script differs from surrounding text.

A direct provider-free regression uses legitimate non-Latin target-language text and proves it is preserved exactly through the live-adapter contract. Independent review remains responsible for judging whether mixed-script content is educationally intentional rather than relying on a blind script heuristic.

## Requalification defect and durable invalidation

The post-Pilot-16 provider-free requalification deliberately challenged the remediation against the course-agnostic design rule. It exposed the two unsafe subject-shaped mutations described above before another paid run.

The correction advances only the changed durable semantic assumptions:

- `generateLearningCollateral` → `3+output-integrity-v2`;
- `generatePracticeCollateral` → `3+output-integrity-v2`.

This prevents compatible-cache logic from reusing pre-v2 Learn or Practice outputs across the change. Unrelated identity, source, coverage and independent assessment-generation work remains reusable where its dependency closure has not changed.

The machine-readable requalification layer is `content-factory/reliability-post-pilot16-requalification.json`.

## Reliability status

The machine-readable global reliability status on approved `main` remains:

- `status: paused`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The pause is bound to Pilot #16 run `33214478392`, Issue `#226` and failed implementation head `47c30e95c49c1951d0dd31c48b63a1d15506529f`.

A fresh paid pilot remains prohibited until the corrected implementation passes provider-free Q1–Q6 requalification through exact-head assurance on approved `main` and a separate governed qualification-status transition restores eligibility.

## Assurance expectation

The requalification change must pass the normal exact-head Revision CI suite. That suite includes:

- the original Q1 and Q2 provider-free contract evidence;
- the post-Pilot-16 output-integrity regressions;
- all five Q3 subject shapes;
- the full Q4 deterministic remediation simulation;
- Q5 restart/reuse/dependency invalidation using the current semantic worker policy;
- three complete Q6 stability repetitions;
- the fail-closed global paid-pilot preflight while status remains paused.

No paid model call is required or permitted to prove this requalification.

## Documentation impact

This remains implementation/current-state evidence under the existing Content Factory Operating Model, Content Accuracy Assurance Gate and Reliability Qualification Standard. No normative authority change is introduced.

The Reliability Qualification Harness is updated with the new current requalification layer. `INDEX.md` does not require a new pointer because the indexed harness remains the current technical source of truth. Historical Pilot #16 evidence is not modified. Issue `#226` remains the durable fail-hold record for the exact failed course build.
