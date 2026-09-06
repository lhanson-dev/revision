# Content Factory Foundation Pre-Calibration Assembly Guard

**Status:** Current implementation record — released through PR #320; aggregate/constituent context classifier repair in progress  
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

### Governed aggregate and approximate facts are not invented constituent allocations

The guard must distinguish three different kinds of numeric statement:

- **allowed aggregate fact:** a verified whole-component fact such as a Paper 2 `120-minute` timing or `100-mark` total, clearly described as component/paper-level or as the total of the complete assembled question set;
- **allowed source-backed approximate shape:** the profile-specific verified Paper 2 statement that its three compulsory data-response questions are worth approximately 33 marks each; and
- **forbidden constituent allocation:** a fixed number or sequence attached to an individual question, sub-question, set or other constituent demand before qualified calibration when that precision is not established by governed Exam Truth.

The deterministic detector therefore permits an exact whole-component value only when it equals the governed component total/timing, the numeric phrase is locally bound to aggregate component/paper/set context, and the value is not directly assigned to a constituent. Merely mentioning a constituent question elsewhere in the same sentence does not turn an otherwise valid aggregate fact into a constituent allocation.

Direct constituent assignment remains fail-closed. Examples include `each question should receive 20 marks`, `100 marks per question`, `one 100-mark question`, or assigning the full component total to each constituent question. The classifier checks the grammatical relationship around the numeric phrase rather than rejecting any sentence that happens to contain both aggregate and constituent terminology.

For the separate Paper 2 approximate-shape fact, the detector permits `33 marks each` only when all of the following are true:

- the active source assessment requirement is the governed `paper2-structure` requirement;
- that source requirement itself states the approximate `33 marks each` data-response shape;
- the provider text uses approximation language;
- the text refers to data-response questions rather than sub-questions or another constituent type; and
- the value is 33 marks.

This is not a general relaxation for per-question mark claims. An exact claim such as `Each compulsory data-response question is worth 33 marks` remains unsupported because it removes the governed approximation. A statement assigning approximately 33 marks to sub-questions also remains unsupported because it changes the governed constituent being described.

## Entry points

### Initial Foundation compilation

The main-only Foundation live proof composes `createAqaAlevelBusiness7132FoundationLiveWorkers(...)` with `withAqa7132PreCalibrationAssemblyGuard(...)` before `compileFoundationJob(...)` persists Question Families.

The proof producer version remains explicit in retained evidence so the applied implementation boundary can be reconstructed.

### Targeted Slice 3B remediation

`foundation-independent-review-live-adapter.ts` applies `normaliseAqa7132PreCalibrationQuestionFamily(...)` to every Question Family replacement before it enters the provider-neutral remediation core.

The remediation prompt states that uncalibrated Paper 2/Paper 3 families must not invent fixed constituent mark sequences or per-question timing allocations. It may reference verified whole-component facts and source-backed approximate structure only within the governed evidence boundary.

The independent-review prompt also states that deliberate absence of constituent calibration is not, by itself, a blocking/material defect when the supplied Foundation explicitly defers that calibration under the governed pre-calibration boundary. Review remains free to challenge contradictions with verified aggregate totals, timings, compulsory shape or other supported assessment evidence.

## Deterministic checks

`aqa7132PreCalibrationAssemblyProblems(...)` exposes the same invariant as a deterministic checker for retained Question Families. It detects:

- missing/mismatched component binding;
- missing source assessment requirement;
- an improper calibration claim;
- unsupported exact constituent allocations hidden in provider-authored fields;
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

`foundation-precalibration-aggregate-context.test.ts` locks the aggregate/constituent classifier boundary:

- `Ensure the assembled set totals 100 marks.` is accepted because `100` is the verified whole-component total and no constituent allocation is asserted;
- a verified `component-level 120-minute response-time envelope` remains accepted even when the sentence goes on to discuss what each constituent question should contain;
- a common-failure description such as `Treating the aggregate 100-mark question-set envelope as the mark allocation for one constituent ... question` remains accepted because it is describing the aggregate envelope and the number itself is not assigned to the constituent;
- `Each question in the assembled set should receive 20 marks.` remains rejected as an unsupported constituent allocation; and
- assigning the full `100-mark` component total to each constituent question remains rejected.

`foundation-precalibration-source-backed-approximate-context.test.ts` locks the live-proof #7 boundary:

- `Ensure a compiled paper contains three compulsory data-response questions worth approximately 33 marks each.` is accepted because it restates the governed `paper2-structure` approximate shape;
- `Ensure each compulsory data-response question is worth 33 marks.` remains rejected because it converts approximate Exam Truth into unsupported exact precision; and
- `Ensure each sub-question is worth approximately 33 marks.` remains rejected because it attaches the value to a constituent not supported by the governed source requirement.

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

The correct repair was therefore to keep ADR-0022 unchanged while making the deterministic guard distinguish allowed aggregate component facts from forbidden constituent allocations and aligning reviewer instructions to that same evidence boundary.

The retained Run #19 source candidate remains historical proof input. It is not the fresh Foundation Candidate required after the later requirement-led coverage hardening.

## Fresh Foundation live proof #5 evidence — 5 September 2026

After PRs #318 and #319 were released, workflow `33992012077` launched a fresh AQA 7132 / 2027 Foundation compilation from `main` commit `fa0ec5624e31e47576957433ab8258a10e8265d2`.

The proof reached the live Question Family generation stage and then failed closed before a Foundation Candidate/fingerprint was retained. The provider-produced Paper 3 family contained the sentence:

`Ensure the assembled set totals 100 marks.`

The deterministic guard rejected that sentence as an unsupported exact constituent allocation. This was a false positive because:

- Paper 3's whole-component total of 100 marks is already governed Exam Truth;
- the sentence refers to the complete assembled set rather than allocating marks to any constituent question; and
- no exact sub-question or timing pattern was introduced.

No learner-facing assets were generated and no failed Candidate was promoted. The evidence-upload step ran, but the test failed before creating the proof-evidence directory, so no new Foundation fingerprint exists from run #5.

PR #320 repaired this case by recognising `assembled set` as aggregate context only when the numeric value equals the verified whole-component total/timing and no constituent-allocation language is present. PR #320 was Founder-approved, merged and production-verified before the next proof was attempted.

## Fresh Foundation live proof #7 evidence — 5 September 2026

Workflow `33994117446` launched the next fresh AQA 7132 / 2027 Foundation compilation from released `main` commit `d800fc242afa4ba9901d3bd991ed89375ba5577a` after PR #320 was fully production-verified.

The proof again reached live Question Family generation and failed closed before a Foundation Candidate/fingerprint was retained. The Paper 2 family contained the sentence:

`Ensure a compiled paper contains three compulsory data-response questions worth approximately 33 marks each.`

The existing detector rejected the numeric phrase because it contained question-level `33 marks each` wording. That was a false positive against the current governed evidence boundary rather than a curriculum/exam omission:

- ADR-0022 explicitly records that Paper 2 has three compulsory data-response questions worth approximately 33 marks each;
- ADR-0022 explicitly says verified approximate paper shape remains enforceable before qualified constituent calibration;
- the sentence preserves the approximation rather than converting it into an exact 33-mark allocation; and
- the sentence does not invent any sub-question or timing pattern.

No learner-facing assets were generated, no Candidate was promoted, and no proof artifact or Foundation fingerprint was retained. The artifact upload step found no proof-evidence directory because compilation stopped at the guarded Question Family boundary.

The narrow implementation repair is source-bound rather than keyword-permissive: it recognises the approximate 33-marks-each Paper 2 data-response fact only when the active `paper2-structure` Exam Truth requirement independently carries the same governed fact. Exact 33-mark-per-question claims, approximate values attached to sub-questions, and other unsupported constituent precision remain fail-closed.

This repair does not change ADR-0022 or the active requirement-led coverage authority. It corrects current implementation so it enforces those existing decisions accurately.

## Slice 3B retained proof blocker — 6 September 2026

A later retained AQA 7132 / 2027 Foundation Candidate from source proof run `34049089770` on `main` `ea8b1143270f70477dc5964f863c0e8e764bf3d5` produced Foundation fingerprint `4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d` and passed deterministic Foundation assurance with 19 checks and zero failures.

Fresh-context independent review then entered targeted remediation and failed closed in remediation normalisation on this Paper 2 common-failure description:

`Treating the aggregate 100-mark question-set envelope as the mark allocation for one constituent data-response question.`

The existing detector incorrectly rejected the sentence because its aggregate `100-mark` fact and the later constituent terminology occurred in the same local context. The number itself is not an asserted constituent allocation; the sentence explicitly describes the incorrect mapping as a failure mode.

This is the same classifier class as the earlier `component-level 120-minute response-time envelope` false positive: aggregate truth was rejected because constituent terminology appeared elsewhere in the sentence. The repair therefore changes the detector from a broad co-occurrence test to a relationship test:

- the amount must still equal the governed whole-component mark/timing value;
- the numeric phrase must still have explicit aggregate component/paper/set context;
- a number directly assigned to `each`, `per`, an individual/constituent question or equivalent remains rejected; and
- unrelated constituent terminology later in the sentence no longer invalidates the aggregate fact.

No compiler-owned response shape, source-rights rule, Foundation authority or pre-calibration policy is relaxed. The Foundation remains blocked until this implementation change is released and the exact retained candidate clears deterministic re-assurance plus a genuinely fresh independent review.

## Documentation impact check

No normative authority or ADR change is required for this classifier repair. The active authority and ADR already require aggregate component facts to remain usable while unsupported constituent precision fails closed. This technical record is updated because the implementation classifier and proof history changed. Historical proof outcomes above remain unchanged.

## Source and rights impact

None. This hardening does not put additional AQA source text into generative context and does not change source-use classifications. It works only from already-governed structured Board Alignment/Exam Truth facts and Revision-owned Question Family contracts.

## User/product impact

None. No learner-facing asset is created or changed. The change affects Foundation correctness and assurance only.

## Next governed step

After the aggregate/constituent classifier repair is exact-head assured, Founder-approved, merged and production-verified:

1. bind deterministic Foundation re-assurance to the retained exact source candidate/fingerprint from run `34049089770`;
2. require the exact candidate to pass the released deterministic layer under the new implementation;
3. run a genuinely fresh-context independent Foundation review against that exact candidate;
4. require any targeted remediation to remain within the same pre-calibration evidence boundary; and
5. continue to external-source challenge and qualified-human packaging only if the exact candidate passes the preceding gates.

A fresh Foundation source compilation is not required merely because this repair changes assurance/remediation classification rather than Course Truth or Exam Truth generation. If any later remediation materially changes the Foundation fingerprint, the resulting exact version must be re-assured and re-reviewed under the normal governed dependency rules.

Do not increase the remediation limit and do not manufacture constituent calibration merely to satisfy provider or reviewer wording unsupported by governed evidence.