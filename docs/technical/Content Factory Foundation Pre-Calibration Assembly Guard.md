# Content Factory Foundation Pre-Calibration Assembly Guard

**Status:** Current implementation record — implementing PR pending Founder approval  
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

## Entry points

### Initial Foundation compilation

The main-only Foundation live proof composes `createAqaAlevelBusiness7132FoundationLiveWorkers(...)` with `withAqa7132PreCalibrationAssemblyGuard(...)` before `compileFoundationJob(...)` persists Question Families.

The proof producer version advances to `foundation-live-adapter-v3` so retained evidence makes the new boundary explicit.

### Targeted Slice 3B remediation

`foundation-independent-review-live-adapter.ts` applies `normaliseAqa7132PreCalibrationQuestionFamily(...)` to every Question Family replacement before it enters the provider-neutral remediation core.

The remediation prompt also states that uncalibrated Paper 2/Paper 3 families must not invent fixed constituent mark sequences or per-question timing allocations.

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
- deterministic detection of persisted drift; and
- normalization of initial Question Family compilation.

The independent-review live-adapter suite covers the remediation provider boundary. Full repository CI remains mandatory before merge.

## Source and rights impact

None. This hardening does not put additional AQA source text into generative context and does not change source-use classifications. It works only from already-governed structured Board Alignment facts and Revision-owned Question Family contracts.

## User/product impact

None. No learner-facing asset is created or changed. The change affects Foundation correctness and assurance only.

## Next governed step

Do not rerun the retained fifth-proof candidate.

After this change and ADR-0021 are both released:

1. run one fresh main-only Foundation live proof;
2. verify the new Foundation artifact/fingerprint, 82-node semantic Course Truth, quantitative `30 / 300` plan, pre-calibration Paper 2/Paper 3 families and zero learner assets;
3. rebind Slice 3B to that exact retained candidate;
4. run deterministic assurance plus one governed fresh-context independent-review/remediation proof; and
5. enter Slice 3C only if the exact candidate reaches deterministic PASS and independent-review PASS.
