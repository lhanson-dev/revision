# Content Factory Reliability Qualification Harness

## Status

The Content Factory is **paused for paid full-course confirmation pilots** under Reliability Standard v2.0 following Confirmation Pilot #19.

Pilot #19 exposed a new generic Assessment Item engineering-contract class after the previous Q1–Q7 qualification and Q8 eligibility transition had passed. The current correction is deliberately provider-free: it redesigns the shared Assessment Item demand-validation boundary, advances the Assessment Item durable semantic version, preserves unaffected Learn/Practice output for dependency-aware reuse, and expands the next bounded Q7 live-soak matrix before any later Q8 transition can restore confirmation-pilot eligibility.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current Pilot #19 architecture/requalification evidence: `content-factory/reliability-pilot19-assessment-architecture-review.json`.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

No paid provider run, full-course assembly or learner publication is triggered by this architecture correction.

## Reliability objective

The target remains:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

Reliability qualification exists so educational assurance evaluates the educational product rather than repeatedly debugging avoidable provider representations or incorrect deterministic assumptions.

## Historical Q7 qualification remains historical truth

Reliability v2 previously completed three bounded Q7 live-worker soak attempts.

### Q7 attempt 1

Workflow `33265434110` exposed:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Result: 13 accepted / 7 controlled fail-closed; known spend US$0.423906. The generic class was corrected and provider-free requalified.

### Q7 attempt 2

Workflow `33282967568`, artifact `9723581809`, exposed:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

Result: 17 accepted / 3 controlled fail-closed; known spend US$0.455962. Revision removed duplicated provider ownership of subquestion requirement IDs and advanced the Assessment Item durable boundary to `2+output-integrity-v4` after provider-free requalification.

### Q7 attempt 3 — historical PASS

Workflow `33364521121` / run #18 on approved `main` `9755c7a40d5e61b76a49e51480e7c5403642e593` executed all 20 governed samples.

Result:

- 16 accepted / 4 controlled fail-closed;
- Assessment Item 8/10 accepted;
- Marking Pack 8/10 accepted;
- 12 targeted repairs;
- known spend US$0.432952;
- zero infrastructure incidents;
- zero escaped engineering-boundary exceptions;
- no full-course assembly or learner publication.

Artifact `9747914357`, digest `sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96`.

After classification, the four fail-closed samples were educational/semantic rejections rather than a new reusable engineering class. Q7 therefore passed at that point. The later Pilot #19 finding does not rewrite that historical result.

## Historical Q8 transition

`content-factory/reliability-v2-f-q8-eligibility.json` remains the historical record that Q1–Q7 had passed and Pilot #19 was eligible as a separate confirmation pilot. Q8 itself made no provider call and did not dispatch Pilot #19.

That record remains unchanged. The current qualification state is later evidence and now correctly overrides eligibility for future execution by returning the machine state to `paused`.

## Confirmation Pilot #19

Pilot #19 ran as workflow `33371449134` from exact approved `main`:

`23b0849354e99d6be865361009388af5922d2f3f`

Durable job: Issue #254.

Evidence artifact: `9750570226`.

Artifact digest:

`sha256:e9272de540d285fcb4c6dac8522ddd537f15c84c1f7f1e3835a029179e195fed`

Known course spend at stop: **US$0.7151 / US$20.00**.

The course stopped in `generating` before `expert_review_ready`. Source rights were approved and all governed Learn/Practice work units had completed. The failing Assessment Item was the first Paper 1 MCQ. Both the initial candidate and the one permitted targeted repair were rejected with the same deterministic error: the subquestion command did not ask for rewarded `knowledge` demand.

No learner content was published.

## Pilot #19 architecture finding

The failure was not merely a poor educational model output. It exposed an incorrect generic assumption in the deterministic Assessment Item validator.

The previous validator treated every `responseDemands[]` value as if it must be independently proved by a lexical command cue in learner-facing wording. That works for operational demands such as `calculate`, `interpret`, `analyse` and `evaluate`, where the command materially determines what the learner is asked to do.

It is not correct for a multiple-choice item represented as:

- interaction: `selection`;
- cognitive demand: `knowledge` or `application`.

A legitimate knowledge MCQ can say “Which option …?” without also saying “state”, “identify” or “define”. Requiring a second knowledge verb made valid MCQ shapes rejectable by construction. Simply adding `which/select/choose` to the generic knowledge vocabulary would be equally wrong because it would falsely claim that all selection questions mechanically prove knowledge demand.

Classification:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

Reliability classification:

`new_generic_engineering_contract_class`

Under Reliability Standard v2.0 this pauses full-course eligibility and returns the affected process to qualification.

## Corrected Assessment Item ownership model

The architecture correction separates three concerns.

### 1. Interaction mechanics

`selection` is mechanically validated as an interaction contract.

For MCQs Revision still requires:

- learner-facing selection wording such as `which`, `select` or `choose`;
- exactly four distinct options A–D;
- exactly one correct option;
- plausible distinct misconception bases for incorrect options.

This boundary remains strict and targeted-repair eligible.

### 2. MCQ cognitive meaning

For a structurally valid selection/MCQ, `knowledge` and `application` are educational cognitive classifications. They may legitimately coexist with selection wording without requiring a second lexical command verb.

These labels remain model-authored educational judgement constrained by:

- structured schema;
- governed requirement coverage;
- exact question-evidence checks;
- valid MCQ structure;
- deterministic course assurance;
- fresh-context independent review; and
- qualified expert review.

Revision does not pretend a lexical heuristic can mechanically prove this educational meaning.

### 3. Explicit operational cognitive demands

The strict command contract remains for:

- calculation;
- interpretation;
- analysis;
- evaluation.

A provider may not label a question with these rewarded demands unless compatible learner-facing wording actually asks for them. The existing one complete-diagnostic targeted repair remains available, followed by whole-artifact fail-closed revalidation.

This preserves the historical Pilot #11/#12/#14 guards rather than weakening them to make Pilot #19 pass.

## Marking Pack architecture review

Pilot #19 stopped before Marking Pack generation for the failed item, but the agreed architecture review considered Assessment Item and Marking Pack ownership together.

No additional Marking Pack ownership transfer is justified by Pilot #19:

- question identity, exact wording, marks, family and provenance remain compiler-owned;
- structured aggregate AO arithmetic remains compiler-owned;
- rubric ranges/skeleton and subquestion reconciliation remain deterministic/fail-closed;
- subject-specific marking judgement, indicative content, valid reasoning routes, misconceptions and diagnostic guidance remain generative educational judgement subject to independent/human assurance.

The Assessment Item semantic change genuinely invalidates dependent Marking Packs and downstream assurance evidence, but not unrelated Learn/Practice artifacts.

## Durable dependency impact

Assessment Item durable semantics advance from:

`2+output-integrity-v4`

to:

`2+output-integrity-v5`

Dependency-aware invalidation therefore applies to:

- Assessment Items;
- genuine dependent Marking Packs;
- downstream validation/independent-review evidence that depends on those artifacts.

It does **not** automatically invalidate:

- Course Knowledge Model;
- Learning Blueprint;
- Learn collateral;
- Practice collateral;
- Assessment Blueprint;
- Question Families.

This applies the Reliability Standard Q5 rule that a narrow semantic correction must not force unrelated successful work to be repurchased.

## Provider-free requalification

The Pilot #19 branch re-exercises Q1–Q6 without paid provider calls.

The provider-free matrix now explicitly proves:

- valid `selection + knowledge` MCQ accepted;
- valid `selection + application` MCQ accepted;
- calculation MCQ without explicit calculation command still fails closed;
- interpretation MCQ without explicit interpretation command still fails closed;
- non-MCQ knowledge without compatible command evidence still fails closed;
- historical requirement-cross-reference compiler ownership remains intact;
- five-shape deterministic pipeline simulation still reaches `expert_review_ready` with zero provider usage;
- dependency closure invalidates Assessment Item/downstream scope without invalidating Learn/Practice;
- repeated provider-free stability remains required.

Exact-head CI determines whether these candidate Q1–Q6 results can be recorded as PASS.

## Next bounded Q7

A new Q7 live-worker soak is required before any full-course confirmation pilot can become eligible again.

The soak harness remains bounded to 20 live samples across all five governed subject shapes and the two highest-risk production boundaries: Assessment Item and Marking Pack generation.

After Pilot #19, its Assessment Item coverage explicitly includes:

- quantitative/business/economics knowledge MCQ;
- quantitative/business/economics application MCQ;
- mathematics calculation demand;
- science analysis and interpretation demand;
- essay/humanities evaluation;
- language/prescribed-text analysis;
- Marking Pack samples across every governed subject shape.

Provider retries remain zero per request, bounded repair remains inside the production compiler, the Q7 ceiling remains US$5, and there is no learner publication or full-course assembly.

The live soak is **not triggered by this remediation PR**. It remains a separate governed paid qualification step after the architecture correction is merged and production-verified.

If Q7 passes with no new generic engineering class, a separate Q8 eligibility PR is still required before another full-course confirmation pilot.

## Maturity and stop-loss

Pilot #19 does not count as a successful maturity course. The sequence remains at zero consecutive successful materially different real courses.

Reliability Standard v2.0 formally requires an architecture review after two consecutive confirmation-course attempts expose new generic engineering classes. Revision chose to perform the review after the first such post-Q8 failure rather than spend another full-course attempt merely to reach the stop-loss threshold.

That does not change the standard. It is a more conservative application of the existing compiler-first and cost-control rules.

## Cost position

Historical Q7 attempts 1–3 used known spend of **US$1.312820** in total.

Pilot #19 stopped at approximately **US$0.7151** under its US$20 course ceiling.

No paid execution is performed by the architecture correction or provider-free Q1–Q6 requalification.

The next paid activity, once this correction is merged and exact-head assurance is complete, is a bounded Q7 live-worker soak under the existing US$5 ceiling—not another full course.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already requires:

- pausing after a new generic confirmation-pilot engineering class;
- compiler-first ownership review;
- historical replay and adversarial provider-free evidence;
- bounded Q7 requalification;
- a separate Q8 transition before another confirmation pilot.

This change updates current machine qualification state, the current Q1 ownership inventory, current executable reliability assurance, durable semantic dependency versioning and this indexed technical record. Pilot #19 is recorded append-only. Historical Q7 and Q8 evidence is not rewritten.

`INDEX.md` remains correct because this file is already the indexed technical reliability source. No ADR is required because the change refines ownership inside the already-approved Reliability v2 compiler-first architecture rather than changing the target architecture or governing workflow.
