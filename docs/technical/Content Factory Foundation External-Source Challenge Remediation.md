# Content Factory Foundation External-Source Challenge Remediation

**Status:** Current implementation record  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related decision:** `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`  
**Applies to:** AQA A-level Business 7132 / 2027 Foundation profile

## Purpose

Record the targeted implementation remediation arising from the fresh external-source challenge of the AQA A-level Business 7132 / 2027 Foundation Candidate.

The challenge identified four Material issues. This change corrects those issues at the source/compilation/assurance boundaries so the next Foundation must be regenerated from corrected implementation rather than patched in place.

## Material finding remediation

### F-01 — complete quantitative-skills universe

The AQA quantitative annex obligation and governed Course Truth seed now retain the complete required semantic scope rather than a formula-led subset. The retained obligation includes:

- ratios, averages and fractions;
- percentages and percentage changes;
- construction and interpretation of standard graphical forms;
- index numbers;
- cost, revenue, profit and break-even information;
- investment appraisal;
- interpretation of price and income elasticity where supplied;
- combined use of quantitative and non-quantitative information for decision making;
- interpretation, application and analysis of written, graphical and numerical information;
- at least Level 2 mathematical skills; and
- the minimum 10% A-level quantitative-assessment requirement.

The deterministic coverage denominator therefore contains these obligations upstream. A narrowed generated artifact can no longer achieve apparent 100% reconciliation merely because the obligation itself omitted them.

### F-02 — qualification and paper-level AO ranges

Board Alignment requirement `aqa-exam-ao-weighting`, the source-led Exam Truth obligation and the deterministic AQA Exam Truth guard now use one canonical source-backed summary covering both the qualification and each paper.

The retained ranges are:

- overall: AO1 22–25%, AO2 24–27%, AO3 25–28%, AO4 23–26%;
- Paper 1: AO1 9–11%, AO2 9–11%, AO3 5–8%, AO4 5–8%;
- Paper 2: AO1 6–8%, AO2 8–11%, AO3 8–11%, AO4 6–9%; and
- Paper 3: AO1 5–8%, AO2 5–7%, AO3 9–12%, AO4 9–12%.

`normaliseAqa7132ExamTruth(...)` materialises the paper-specific ranges as compiler-owned component constraints while retaining the existing qualification-total `assessmentObjectiveCoveragePlan`. `aqa7132AssessmentObjectiveCoverageProblems(...)` fails if a paper constraint is missing or altered.

No exact midpoint AO target is invented. The source ranges remain the truth boundary.

### F-03 — truthful pre-calibration limitation

Question Families that remain `not_calibrated` are now explicitly disclosed as a known limitation in the qualified-expert review package.

The package states that exact constituent mark, assessment-objective and response-demand allocations must not be represented as calibrated assessment truth or used for unrestricted final learner-owned assessment generation until the governed calibration gate passes.

This is deliberately consistent with ADR-0022. Paper 2 and Paper 3 remain aggregate-only before qualified calibration; the remediation does not invent constituent mark/timing/AO allocations merely to remove the limitation.

### F-04 — 3.7.6 broad parent concepts

The source-led coverage obligation and governed Course Truth seed now preserve `demographic changes and population movements` as the examinable parent scope. Migration, consumer lifestyle/buying-behaviour change and growth of online businesses are retained as examples rather than treated as an exhaustive list.

The Course Truth seed explicitly requires application to familiar and unseen scenarios so generated learner material cannot narrow the scope back to the named examples.

## Deterministic regression coverage

Regression assurance now proves that:

- the quantitative obligation contains fractions, graphical forms, mixed quantitative/non-quantitative decision evidence, written/graphical/numerical handling, Level 2 mathematics and the 10% boundary;
- the Course Truth seed retains the same quantitative semantics;
- 3.7.6 retains its broad parent concepts and unseen-scenario requirement;
- Board Alignment carries the canonical qualification-plus-paper AO summary from the controlled AQA scheme source;
- the normalised Exam Truth contains all three paper-level AO constraints;
- removing a paper AO constraint causes deterministic failure;
- removing a governed quantitative constraint such as Level 2 mathematics causes deterministic failure;
- the qualified-expert review package carries the pre-calibration limitation; and
- the existing ADR-0022 regressions continue to reject fabricated exact Paper 2/Paper 3 constituent mark or timing allocations while retaining `not_calibrated` status.

## Scope deliberately excluded

The two Minor external-review findings are not silently folded into this focused remediation:

- F-05 — clearer provenance classification for command/demand authority; and
- F-06 — stronger authentic-business-context expectations.

They remain follow-up improvement candidates and do not justify broadening this Material-finding correction before the Foundation is re-proved.

## Documentation-impact check

No normative authority change is required.

The active Foundation production authority already requires complete Course Truth, complete Exam Truth, deterministic assurance, fresh independent review, explicit known limitations and qualified expert approval. This work corrects implementation so it satisfies those existing rules.

ADR-0022 remains unchanged and authoritative. Historical review/proof evidence is not rewritten.

This technical record is added because the implementation and deterministic assurance behaviour changed materially.

## User/product impact

There is no learner-facing product change in this remediation. No Learn, Practice or Exam Prep asset is created or modified.

The effect is upstream: a future AQA 7132 Foundation cannot progress while omitting the corrected curriculum/quantitative scope, paper-level AO constraints or the explicit pre-calibration limitation.

## Next governed proof chain

After this branch is exact-head assured, Founder-approved and merged into released `main`:

1. generate a completely new AQA 7132 / 2027 Foundation Candidate from corrected `main`;
2. run deterministic Foundation assurance against that exact candidate/fingerprint;
3. run a genuinely fresh-context independent Foundation review;
4. run a fresh external-source challenge using a reviewer context excluded from all generation and prior assurance contexts;
5. only if all blocking/material findings are cleared, package that exact fingerprint for qualified subject/assessment expert review; and
6. create an Approved Course Foundation only after the governed approval gates pass.

The previous failed/held candidate is historical evidence and must not be promoted by patching its artifacts.