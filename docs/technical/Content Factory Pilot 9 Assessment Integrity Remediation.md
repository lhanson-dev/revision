# Content Factory Pilot 9 Assessment Integrity Remediation

## Status

Implementation record for the assessment-integrity remediation triggered by AQA AS Business live Pilot #9.

This document describes how the system works. It does not replace the Content Factory v2, Content Accuracy Assurance, source-rights, independent-review or expert-review authority.

## Trigger

Pilot #9 completed the full generation path and reached independent fresh-context review, which correctly returned `fail_hold`. After the separate learning/coverage remediation in PR #196, the remaining assessment findings were:

- the Revision-owned RefillWorks contribution calculation depended on ambiguous context labels;
- a calculate-only task could be paired with marking guidance that rewarded interpretation not explicitly requested by the question;
- Paper 2 could claim a curriculum requirement through an item-level tag without question-level evidence that the requirement was genuinely assessed;
- multi-part assessments were represented as one `questionWording` blob with one overall mark value, limiting deterministic assurance of individual commands, marks and coverage;
- some MCQ distractors were too implausible to provide useful diagnostic demand.

Historical Pilot #9 evidence in Issue #195 remains unchanged.

## Implemented boundary

### Structured subquestions

Assessment items may now carry a canonical `subquestions` array. Each structured subquestion records:

- stable subquestion ID;
- exact command and learner-visible wording;
- its own maximum mark;
- exact curriculum requirement IDs assessed by that subquestion;
- response demands such as selection, calculation, interpretation, analysis or evaluation;
- exact-excerpt coverage evidence tied to the subquestion wording;
- for selection/MCQ questions, A-D options with one correct answer and a misconception basis for every distractor.

Configured live assessment policies require this structure. Existing non-live/synthetic compatibility paths can still omit it while their fixtures migrate deliberately.

The learner-visible `questionWording` must contain every structured subquestion wording verbatim. Metadata therefore cannot claim a task that is absent from the rendered assessment.

### Mark and command integrity

Deterministic validation checks that:

- subquestion marks total the governed item maximum;
- a response demand is only declared when the command/wording asks the learner to perform it;
- a calculate-only task cannot silently claim interpretation, analysis or evaluation demand;
- Marking Pack `subquestionGuidance` covers every structured subquestion exactly once;
- marking guidance preserves the subquestion mark value;
- marking guidance cannot reward a demand absent from the question;
- per-subquestion AO allocations total the subquestion mark value;
- aggregated subquestion AO allocations reconcile to the whole-item AO allocation.

This keeps judgement about the quality of analysis/evaluation with independent and expert review while making mechanically provable command/mark mismatches fail earlier.

### Genuine assessment coverage

For a configured assessment item, the union of requirement IDs evidenced by its subquestions must equal the Revision-owned governed requirement IDs for that item.

Every claimed requirement must have an exact excerpt from the actual subquestion wording. An item-level tag alone is no longer sufficient evidence that a requirement is assessed.

This works with the PR #196 final Coverage Map logic: assessment coverage can only be finalised from assessment artifacts whose governed tags are backed by question-level evidence.

### MCQ distractor quality

Structured selection questions must contain exactly four distinct A-D options with exactly one correct answer. Every incorrect option must identify a distinct plausible misconception basis.

This does not pretend that code can determine whether a distractor is pedagogically excellent. It prevents obviously unstructured distractors from passing the provider boundary and gives independent review explicit misconception intent to challenge.

### Provider boundary

`openai-live-adapter.ts` now layers the assessment-integrity compiler after the existing Learning Blueprint compiler.

For configured assessment policies, provider output must contain structured subquestions. Completed provider output that is structurally invalid is converted into a terminal provider-contract failure and is not blindly repurchased through retry.

Structured Marking Packs are challenged in the same way. No additional model call is introduced.

## AQA AS Business pilot correction

Course-specific corrections remain outside the generic provider adapter.

Before the durable AQA live pilot reaches paid assessment generation, the pilot policy:

- removes the redundant `marketing-demand-and-positioning` tag from the Paper 2 case-study item; that requirement remains assessed in the governed Paper 1 policy;
- changes the RefillWorks `Current selling price` label to `Supermarket-contract selling price`;
- changes `Outsourcing cost for additional packs` to `Total variable cost per outsourced supermarket pack`;
- explicitly states in the original Revision-owned case context that GBP 3.40 is the supermarket-contract selling price and GBP 1.70 is the complete variable cost per outsourced supermarket pack.

The resulting contribution calculation no longer depends on unstated assumptions about whether those values apply to the new contract or whether other variable costs exist.

The pilot correction is idempotent so repeated execution within a process does not duplicate context clarification.

## Assurance

Provider-free assurance covers:

- exact mark totals across structured subquestions;
- exact curriculum requirement coverage;
- calculate-only command/reward mismatch rejection;
- misconception-based MCQ distractor requirements;
- subquestion-to-Mark\-ing-Pack demand and AO reconciliation;
- configured live-provider output requiring structured subquestions;
- terminal contract failure without retry for a completed but unstructured assessment response;
- AQA Pilot #9 RefillWorks context correction;
- removal of the unsupported duplicate Paper 2 marketing coverage claim.

Full repository CI remains required before merge. A fresh paid pilot is not justified until this remediation is merged and production-verified.

## Documentation impact

No normative authority change is required. Existing Content Factory and Content Accuracy Assurance authority already requires assessment fidelity, correct marks/calculations, traceable coverage, deterministic checking of mechanically provable rules, independent challenge and `fail_hold` for unresolved material defects.

This change updates implementation contracts and technical documentation only. Pilot #9 / Issue #195 remains immutable historical evidence; the remediation is recorded separately through the governed branch/PR and initiative status.
