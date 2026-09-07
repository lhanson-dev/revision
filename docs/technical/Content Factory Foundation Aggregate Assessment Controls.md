# Content Factory Foundation Aggregate Assessment Controls

**Status:** Implementation companion to the Foundation pre-calibration guard  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Decision boundary:** `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`

## Purpose

Define the implementation distinction between aggregate assessment controls and constituent calibration during Foundation production.

For AQA A-level Business 7132, two aggregate facts must be usable without inventing constituent precision:

- qualification-total assessment-objective ranges; and
- exact complete-paper mark totals for Paper 2 and Paper 3 Question Families.

## Assessment-objective coverage plan

`foundationAssessmentBlueprintSchema` supports `assessmentObjectiveCoveragePlan` with:

- an exact source assessment-requirement binding;
- `qualification_total` scope;
- the complete qualification mark total;
- one minimum/maximum percentage range for every Exam Truth assessment objective;
- `sum_assessment_objective_marks_within_ranges` generation validation; and
- `marking_pack_generation` as the point where generated mark allocations must be tallied.

For AQA 7132 the compiler binds this plan to `aqa-exam-ao-weighting` and uses AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%. Provider-generated exact AO percentages are not promoted into Exam Truth when the governed source supports only ranges.

## Complete-set mark totals

`questionFamilySchema.aggregateMarkTotal` records the exact mark total of the complete Question Family assembly where that family represents a whole governed paper/set.

For AQA 7132:

- `paper2-data-response.aggregateMarkTotal = 100`; and
- `paper3-case-study.aggregateMarkTotal = 100`.

This does not change ADR-0022's `markRange = 1..100` pre-calibration envelope. The envelope remains a deliberate non-claim about constituent marks, while `aggregateMarkTotal` states that the complete assembled set must total the verified component mark total.

## Remediation ownership

The independent-review remediation adapter preserves Board Alignment-derived assessment objectives and assessment requirements, restores compiler-owned aggregate controls, and rejects the semantic effect of provider attempts to:

- convert AO ranges into exact percentage targets;
- alter the source-backed AO requirement;
- lower or otherwise change the complete Paper 2/Paper 3 set total; or
- replace the pre-calibration boundary with invented constituent mark/timing allocations.

## Assurance

Focused regression suites cover schema invariants, AQA normalisation, aggregate/constituent classification and the exact observed failed-remediation pattern. Full repository CI remains mandatory before merge.

This implementation creates no learner-facing assets and does not change source-rights classification, normative Foundation authority or ADR-0022.