# Content Factory Foundation Pre-Calibration Assembly Guard

**Status:** Current implementation record — released through PR #309; Slice 3B Run #19 reviewer/normaliser repair in progress  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Decision:** `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`  
**Applies to:** AQA A-level Business 7132 / 2027 Foundation profile

## Purpose

Prevent Foundation generation or remediation from presenting unsupported constituent Paper 2/Paper 3 mark and timing patterns as governed Exam Truth before qualified assessment calibration.

This closes the second upstream ownership issue exposed by the fifth retained Slice 3B proof. The first issue — under-supplied Course Truth semantics — is addressed separately by ADR-0021 and the enriched Revision-owned semantic seed.

## Governing evidence boundary

Current Board Alignment supports:

- Paper 2: compulsory, 100 marks, 120 minutes, three compulsory data-response questions worth approximately 33 marks each;
- Paper 3: compulsory, 100 marks, 120 minutes, one compulsory case study followed by approximately six questions.

It does not support a fixed generated internal sub-question mark/timing pattern. Question Families also remain `not_calibrated` during Foundation compilation.

Therefore exact constituent allocations are not Foundation truth until a qualified calibration step establishes them.

## Runtime implementation

`src/content-factory/foundation-precalibration-assembly.ts` owns the AQA 7132 pre-calibration policy.

For `paper2-data-response` and `paper3-case-study`, the normalizer:

1. verifies that the Question Family is still bound to the expected Exam Truth component;
2. verifies that the corresponding Board Alignment-derived assessment requirement remains present;
3. requires the component mark total to remain available;
4. requires `calibrationStatus = not_calibrated`;
5. rejects provider-authored exact constituent mark/timing allocations placed in Question Family semantic fields;
6. replaces the provider-supplied mark range with the component-wide pre-calibration envelope `1..100`; and
7. replaces the provider-supplied response shape with compiler-owned aggregate-only wording that explicitly leaves constituent marks/timing unfixed until qualified calibration.

The component totals/timings themselves remain exact in Exam Truth. The broad Question Family mark envelope is not a claim that every mark value is authentic for every question; it is deliberately a non-calibrated boundary that prevents invented precision.

### Aggregate component facts are not constituent allocations

The guard must distinguish two different kinds of numeric statement:

- **allowed aggregate fact:** a verified whole-component fact such as a Paper 2 `120-minute` timing or `100-mark` total, clearly described as component/paper-level; and
- **forbidden constituent allocation:** a fixed number or sequence attached to an individual question, sub-question, set or other constituent demand before qualified calibration.

The deterministic detector therefore permits only exact values that match the governed component total/timing and are locally described as aggregate component/paper facts. It continues to fail closed on per-question/per-set values, exact constituent sequences, and unsupported precision hidden in provider-authored semantic fields.

## Entry points

### Initial Foundation compilation

The main-only Foundation live proof composes `createAqaAlevelBusiness7132FoundationLiveWorkers(...)` with `withAqa7132PreCalibrationAssemblyGuard(...)` before `compileFoundationJob(...)` persists Question Families.

The proof producer version advances to `foundation-live-adapter-v3` so retained evidence makes the new boundary explicit.

### Targeted Slice 3B remediation

`foundation-independent-review-live-adapter.ts` applies `normaliseAqa7132PreCalibrationQuestionFamily(...)` to every Question Family replacement before it enters the provider-neutral remediation core.

The remediation prompt states that uncalibrated Paper 2/Paper 3 families must not invent fixed constituent mark sequences or per-question timing allocations. It may reference verified whole-component facts only when they remain clearly aggregate.

The independent-review prompt also states that deliberate absence of constituent calibration is not, by itself, a blocking/material defect when the supplied Foundation explicitly defers that calibration under the governed pre-calibration boundary. Review remains free to challenge contradictions with verified aggregate totals, timings, compulsory shape or other supported assessment evidence.

## Deterministic checks

`aqa7132PreCalibrationAssemblyProblems(...)` exposes the same invariant as a deterministic checker for retained Question Families. It detects:

- missing/mismatched component binding;
- missing source assessment requirement;
- an improper calibration claim;
- exact constituent allocations hidden in provider-authored fields;
- drift from the component-wide pre-calibration mark envelope; and
- drift from the compiler-owned aggregate-only response shape.

The current live compilation and remediation paths normalize before persistence. The checker exists so retained/integration assurance can assert the same boundary without relying on prompt behaviour.

## Regression assurance

`foundation-precalibration-assembly.test.ts` covers:

- removal of the exact `5/10/15/20/25/25` and `6/12/18/24/30/30` Paper 3 pattern observed in the fifth proof;
- fail-closed detection of an exact allocation hidden outside `responseShape`;
- acceptance of a verified aggregate `120-minute` component timing when clearly described as component-level;
- continued rejection of a constituent timing even when the surrounding sentence also mentions the paper;
- deterministic detection of persisted drift; and
- normalization of initial Question Family compilation.

The independent-review live-adapter suite locks the reviewer/remediation instructions so pre-calibration non-claims are not silently converted into invented precision. Full repository CI remains mandatory before merge.

## Slice 3B Run #19 evidence — 5 September 2026

The first post-ADR-0022 Slice 3B proof ran as workflow `33954158017` on released `main` `519766280f9acd4b0687a99cdd914dae33ce9cd1`, reviewing source Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

Retained evidence established:

- source artifact identity/digest verification passed;
- deterministic Foundation assurance passed;
- one genuinely fresh independent-review context was used;
- no provider incomplete-response diagnostic occurred;
- learner-facing assets remained `0`;
- provider spend was `$0.167342 / $12.00`;
- the independent reviewer returned `fail_hold` with two material findings asking for Paper 2/Paper 3 constituent assembly precision; and
- the first targeted remediation failed before retaining a corrected candidate because the local guard misclassified the valid phrase `component-level 120-minute response-time envelope` as a forbidden constituent timing allocation.

This is an implementation/reviewer-contract boundary, not evidence that exact constituent timing should now be invented. The reviewer recommendations to add exact constituent mark/time bands go beyond the currently governed evidence to the extent they require unsupported precision before qualified calibration.

The correct repair is therefore to:

1. keep the ADR-0022 aggregate-only pre-calibration rule unchanged;
2. tell the independent reviewer explicitly that absence of exact constituent calibration is intentional and is not itself a material defect;
3. forbid reviewer recommendations that invent constituent precision not supported by supplied governed evidence; and
4. make the deterministic guard distinguish allowed exact aggregate component facts from forbidden constituent allocations.

The retained Run #19 source candidate remains valid proof input because no material Foundation truth changed. After this implementation repair is released, one fresh Slice 3B proof may review the same exact source Foundation under the new reviewed implementation commit. A new Foundation compilation is not required solely for this normaliser/reviewer-contract correction.

## Source and rights impact

None. This hardening does not put additional AQA source text into generative context and does not change source-use classifications. It works only from already-governed structured Board Alignment facts and Revision-owned Question Family contracts.

## User/product impact

None. No learner-facing asset is created or changed. The change affects Foundation correctness and assurance only.

## Next governed step

After the Run #19 reviewer/normaliser repair is exact-head assured, Founder-approved, merged and production-verified:

1. rerun one governed Slice 3B proof against the same exact retained source Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`;
2. require deterministic assurance PASS on the new reviewed implementation commit;
3. require a genuinely fresh independent-review context;
4. allow only evidence-supported smallest-safe remediation; and
5. enter Slice 3C only if the exact final Foundation version reaches deterministic PASS plus independent-review PASS.

Do not increase the three-cycle remediation limit and do not manufacture constituent calibration merely to satisfy a reviewer request that is unsupported by governed evidence.
