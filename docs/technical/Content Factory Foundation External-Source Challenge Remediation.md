# Content Factory Foundation External-Source Challenge Remediation

**Status:** Current implementation record  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Related decision:** `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`  
**Applies to:** AQA A-level Business 7132 / 2027 Foundation profile

## Purpose

Record targeted implementation remediation arising from fresh external-source challenges of the AQA A-level Business 7132 / 2027 Foundation Candidate.

The first challenge identified four Material issues. Those issues were corrected at the source/compilation/assurance boundaries so the next Foundation had to be regenerated from corrected implementation rather than patched in place.

A later fresh proof chain exposed one further Material interpretation defect in the assessment-objective weighting denominator. That follow-up finding is recorded below and is corrected by this implementation update without rewriting the historical proof evidence.

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

### F-02 — qualification-total AO denominator and component contributions

Board Alignment requirement `aqa-exam-ao-weighting`, the source-led Exam Truth obligation and the deterministic AQA Exam Truth guard use one canonical source-backed summary for the qualification and its three components.

The AQA scheme-of-assessment table labels the Paper 1, Paper 2 and Paper 3 figures as **component weightings (approx %)** and the qualification figures as **overall weighting (approx %)**. Each paper contributes approximately 33.3% of the qualification, and the three 100-mark papers form the 300-mark qualification total.

The retained AO ranges are:

- overall qualification weighting: AO1 22–25%, AO2 24–27%, AO3 25–28%, AO4 23–26%;
- Paper 1 contribution to the qualification total: AO1 9–11%, AO2 9–11%, AO3 5–8%, AO4 5–8%;
- Paper 2 contribution to the qualification total: AO1 6–8%, AO2 8–11%, AO3 8–11%, AO4 6–9%; and
- Paper 3 contribution to the qualification total: AO1 5–8%, AO2 5–7%, AO3 9–12%, AO4 9–12%.

The Paper 1/2/3 figures are therefore **not within-paper percentages**. `normaliseAqa7132ExamTruth(...)` materialises them as compiler-owned component contribution constraints while retaining the qualification-total `assessmentObjectiveCoveragePlan`. `aqa7132AssessmentObjectiveCoverageProblems(...)` fails if a component contribution is missing or altered.

No exact midpoint AO target is invented. The source ranges and their qualification-total denominator remain the truth boundary.

### F-03 — truthful pre-calibration limitation

Question Families that remain `not_calibrated` are explicitly disclosed as a known limitation in the qualified-expert review package.

The package states that exact constituent mark, assessment-objective and response-demand allocations must not be represented as calibrated assessment truth or used for unrestricted final learner-owned assessment generation until the governed calibration gate passes.

This is deliberately consistent with ADR-0022. Paper 2 and Paper 3 remain aggregate-only before qualified calibration; the remediation does not invent constituent mark/timing/AO allocations merely to remove the limitation.

### F-04 — 3.7.6 broad parent concepts

The source-led coverage obligation and governed Course Truth seed preserve `demographic changes and population movements` as the examinable parent scope. Migration, consumer lifestyle/buying-behaviour change and growth of online businesses are retained as examples rather than treated as an exhaustive list.

The Course Truth seed explicitly requires application to familiar and unseen scenarios so generated learner material cannot narrow the scope back to the named examples.

## Follow-up fresh external challenge — AO denominator correction

After the first remediation was released, a completely new AQA 7132 / 2027 Foundation was generated on released `main`.

The fresh live proof initially produced Foundation fingerprint:

`958b6fae35460b204a49c8457de3de5f3652785f4d242a04ef975d7bbb0cc5c1`

Deterministic assurance passed. Fresh-context independent review then identified and remediated three Material assessment issues through two targeted remediation cycles and finished with deterministic and independent-review PASS on final fingerprint:

`230b7c9023645d7265a34807fa6f1e91244fc6f6efc5a3af930face84b01f03d`

A separate fresh external-source challenge then placed that exact final fingerprint on **HOLD**. The candidate had acquired correct qualification-total interpretation in part of its remediated Exam Truth, but the canonical Board Alignment/source-led obligation still used the older wording that AO ranges applied “within each paper”. The deterministic guard required that old summary, leaving contradictory assessment truth in the same Foundation.

The smallest safe correction is therefore upstream and canonical rather than candidate-specific:

- state explicitly that the AQA Paper 1/2/3 AO figures are component percentage contributions to the full qualification total;
- state explicitly that they are not within-paper percentages;
- retain every existing AO numerical range;
- retain the qualification-total AO coverage plan;
- retain all Paper 2/Paper 3 `not_calibrated` restrictions; and
- require deterministic regression evidence for the corrected denominator wording.

The held fingerprint `230b7c9023645d7265a34807fa6f1e91244fc6f6efc5a3af930face84b01f03d` remains historical evidence and is not eligible to proceed to qualified expert review.

## Deterministic regression coverage

Regression assurance proves that:

- the quantitative obligation contains fractions, graphical forms, mixed quantitative/non-quantitative decision evidence, written/graphical/numerical handling, Level 2 mathematics and the 10% boundary;
- the Course Truth seed retains the same quantitative semantics;
- 3.7.6 retains its broad parent concepts and unseen-scenario requirement;
- Board Alignment carries the canonical qualification-plus-component AO summary from the controlled AQA scheme source;
- the canonical AO summary explicitly identifies the full qualification total as the percentage denominator and rejects a within-paper interpretation;
- the normalised Exam Truth contains all three qualification-total component AO contribution constraints;
- removing a component AO contribution constraint causes deterministic failure;
- removing a governed quantitative constraint such as Level 2 mathematics causes deterministic failure;
- the qualified-expert review package carries the pre-calibration limitation; and
- the existing ADR-0022 regressions continue to reject fabricated exact Paper 2/Paper 3 constituent mark or timing allocations while retaining `not_calibrated` status.

## Scope deliberately excluded

The two earlier Minor external-review findings are not silently folded into this focused remediation:

- F-05 — clearer provenance classification for command/demand authority; and
- F-06 — stronger authentic-business-context expectations.

They remain follow-up improvement candidates and do not justify broadening this Material correctness correction.

## Documentation-impact check

No normative authority change is required.

The active Foundation production authority already requires complete and accurate Course Truth and Exam Truth, deterministic assurance, fresh independent review, explicit known limitations and qualified expert approval. This work corrects implementation so it satisfies those existing rules.

ADR-0022 remains unchanged and authoritative. Historical review/proof/challenge evidence is not rewritten. No `INDEX.md` change is required because authority locations and source-of-truth relationships are unchanged.

This current technical record is updated because the implementation and deterministic assurance behaviour changed materially.

## User/product impact

There is no learner-facing product change in this remediation. No Learn, Practice or Exam Prep asset is created or modified.

The effect is upstream: a future AQA 7132 Foundation cannot progress while representing component AO contributions with the wrong percentage denominator.

## Next governed proof chain

After this branch is exact-head assured, Founder-approved, merged and released on `main`:

1. generate a completely new AQA 7132 / 2027 Foundation Candidate from corrected `main`;
2. run deterministic Foundation assurance against that exact candidate/fingerprint;
3. run a genuinely fresh-context independent Foundation review;
4. run a fresh external-source challenge using a reviewer context excluded from all generation and prior assurance contexts;
5. only if all blocking/material findings are cleared, package that exact fingerprint for qualified subject/assessment expert review; and
6. create an Approved Course Foundation only after the governed approval gates pass.

Neither the earlier failed/held candidate nor the later held fingerprint `230b7c9023645d7265a34807fa6f1e91244fc6f6efc5a3af930face84b01f03d` may be promoted by patching their retained artifacts.
