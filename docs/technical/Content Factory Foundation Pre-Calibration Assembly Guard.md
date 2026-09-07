# Content Factory Foundation Pre-Calibration Assembly Guard

**Status:** Current implementation record — aggregate assessment-control remediation in progress  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Decision:** `decisions/ADR-0022-foundation-precalibration-assessment-assembly.md`  
**Applies to:** AQA A-level Business 7132 / 2027 Foundation profile

## Purpose

Prevent Foundation generation or remediation from presenting unsupported constituent Paper 2/Paper 3 mark and timing patterns as governed Exam Truth before qualified assessment calibration, while retaining exact aggregate assessment facts needed to generate and validate a complete qualification.

This closes the upstream ownership issues exposed by retained Slice 3B proof and review evidence without weakening the deliberate pre-calibration boundary in ADR-0022.

## Governing evidence boundary

Current Board Alignment supports:

- Paper 2: compulsory, 100 marks, 120 minutes, three compulsory data-response questions worth approximately 33 marks each;
- Paper 3: compulsory, 100 marks, 120 minutes, one compulsory case study followed by approximately six questions; and
- qualification-total assessment-objective ranges: AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%, sourced through Board Alignment requirement `aqa-exam-ao-weighting`.

It does not support a fixed generated internal sub-question mark/timing pattern or invented exact AO percentage targets. Question Families also remain `not_calibrated` during Foundation compilation.

Therefore exact constituent allocations are not Foundation truth until a qualified calibration step establishes them. Exact complete-set totals and qualification-total AO range validation are different: they are aggregate controls over already-governed facts and do not assert constituent precision.

## Runtime implementation

`src/content-factory/foundation-precalibration-assembly.ts` owns the AQA 7132 pre-calibration policy.

For `paper2-data-response` and `paper3-case-study`, the normalizer:

1. verifies that the Question Family is still bound to the expected Exam Truth component;
2. verifies that the corresponding Board Alignment-derived assessment requirement remains present;
3. requires the component mark total to remain available;
4. requires `calibrationStatus = not_calibrated`;
5. rejects provider-authored exact constituent mark/timing allocations placed in Question Family semantic fields;
6. replaces the provider-supplied mark range with the component-wide pre-calibration envelope `1..100`;
7. records `aggregateMarkTotal = 100` as the exact total of the complete Paper 2/Paper 3 set; and
8. replaces the provider-supplied response shape with compiler-owned aggregate-only wording that explicitly leaves constituent marks/timing unfixed until qualified calibration.

The component totals/timings themselves remain exact in Exam Truth. The broad Question Family `markRange` is not a claim that every mark value is authentic for every question and is not permission for an assembled set to total less than the governed paper total. `aggregateMarkTotal` owns that separate complete-set invariant.

### Qualification-total assessment-objective control

`foundationAssessmentBlueprintSchema` now supports a separate `assessmentObjectiveCoveragePlan` rather than forcing source-backed ranges into the existing optional exact `weightingPercent` field.

For AQA 7132 the compiler-owned plan:

- points to Board Alignment requirement `aqa-exam-ao-weighting`;
- has scope `qualification_total`;
- uses the complete qualification mark total from the three governed paper totals;
- records AO1 22-25%, AO2 24-27%, AO3 25-28% and AO4 23-26%;
- requires generated marking allocations to be summed and validated within those ranges; and
- requires that allocation validation at Marking Pack generation rather than manufacturing exact percentage targets during Foundation generation.

The AQA normalizer removes provider-supplied exact AO `weightingPercent` values when the governing evidence is range-based. The source range remains truth; a convenient single-number midpoint is not promoted into Exam Truth.

`foundation-independent-review-live-adapter.ts` also preserves Board Alignment-derived assessment objectives and requirements during targeted remediation and then reapplies the AQA compiler normalizer. This prevents remediation from rewriting a governed range as an exact target or from removing the aggregate Paper 2/Paper 3 total.

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

The main-only Foundation live proof composes `createAqaAlevelBusiness7132FoundationLiveWorkers(...)` with `withAqa7132PreCalibrationAssemblyGuard(...)` before `compileFoundationJob(...)` persists Exam Truth and Question Families.

The guard materialises the source-bound AO coverage plan during Exam Truth compilation and the complete-set aggregate mark total during Question Family compilation. The proof producer version remains explicit in retained evidence so the applied implementation boundary can be reconstructed.

### Targeted Slice 3B remediation

`foundation-independent-review-live-adapter.ts` preserves compiler/Board Alignment-owned Exam Truth fields, reapplies `normaliseAqa7132ExamTruth(...)`, and applies `normaliseAqa7132PreCalibrationQuestionFamily(...)` before replacements enter the provider-neutral remediation core.

The remediation prompt states that uncalibrated Paper 2/Paper 3 families must not invent fixed constituent mark sequences or per-question timing allocations. It also states that source-backed AO ranges must not be converted into exact `weightingPercent` targets. It may reference verified whole-component facts and source-backed approximate structure only within the governed evidence boundary.

The independent-review prompt distinguishes `aggregateMarkTotal` from the pre-calibration `markRange` and recognises `assessmentObjectiveCoveragePlan` as the qualification-total AO generation/validation contract. Deliberate absence of constituent calibration is not, by itself, a blocking/material defect when the supplied Foundation explicitly defers that calibration under the governed pre-calibration boundary.

## Deterministic checks

`aqa7132PreCalibrationAssemblyProblems(...)` exposes the Question Family invariant as a deterministic checker. It detects:

- missing/mismatched component binding;
- missing source assessment requirement;
- an improper calibration claim;
- unsupported exact constituent allocations hidden in provider-authored fields;
- drift from the component-wide pre-calibration mark envelope;
- missing/drifted complete-set `aggregateMarkTotal`; and
- drift from the compiler-owned aggregate-only response shape.

`aqa7132AssessmentObjectiveCoverageProblems(...)` checks the AQA aggregate AO boundary:

- the exact Board Alignment requirement ID, summary and qualification-wide scope;
- absence of invented exact AO weighting values;
- exact AO1-AO4 range coverage;
- complete qualification mark total; and
- compiler-owned generation-validation semantics.

The Foundation assessment-blueprint schema independently checks that any AO coverage plan references an Exam Truth assessment requirement, covers exactly the declared AO IDs, admits a valid 100% total allocation and uses the complete component mark total where that total is known.

## Regression assurance

`foundation-precalibration-assembly.test.ts` covers:

- removal of the exact `5/10/15/20/25/25` and `6/12/18/24/30/30` Paper 3 pattern observed in the fifth proof;
- fail-closed detection of an exact allocation hidden outside `responseShape`;
- acceptance of a verified aggregate `120-minute` component timing when clearly described as component-level;
- continued rejection of a constituent timing even when the surrounding sentence also mentions the paper;
- deterministic detection of persisted pre-calibration drift;
- exact `aggregateMarkTotal = 100` for Paper 2/Paper 3 while `markRange` remains `1..100`;
- removal of invented AO targets `23/25/26/26`;
- source-backed AO range-plan materialisation over 300 qualification marks; and
- detection of altered AO range values.

`foundation-independent-review-aggregate-remediation.test.ts` reproduces the observed failed-remediation class directly: a provider returns exact AO targets and a wrong Paper 2 complete-set total, and Revision must restore the governed ranges and exact 100-mark aggregate while leaving constituent calibration unfixed.

`foundation-precalibration-aggregate-context.test.ts` locks the aggregate/constituent classifier boundary:

- `Ensure the assembled set totals 100 marks.` is accepted because `100` is the verified whole-component total and no constituent allocation is asserted;
- a verified `component-level 120-minute response-time envelope` remains accepted even when the sentence goes on to discuss what each constituent question should contain;
- a common-failure description such as `Treating the aggregate 100-mark question-set envelope as the mark allocation for one constituent ... question` remains accepted because it is describing the aggregate envelope and the number itself is not assigned to the constituent;
- `Each question in the assembled set should receive 20 marks.` remains rejected as an unsupported constituent allocation; and
- assigning the full `100-mark` component total to each constituent question remains rejected.

`foundation-precalibration-source-backed-approximate-context.test.ts` locks the source-backed Paper 2 boundary. Full repository CI remains mandatory before merge.

## Slice 3B Run #19 evidence — 5 September 2026

The first post-ADR-0022 Slice 3B proof ran as workflow `33954158017` on released `main` `519766280f9acd4b0687a99cdd914dae33ce9cd1`, reviewing source Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`.

Retained evidence established that deterministic Foundation assurance passed but fresh independent review asked for unsupported constituent precision, while targeted remediation was initially blocked by a classifier false positive on `component-level 120-minute response-time envelope`. The correct repair kept ADR-0022 unchanged and distinguished aggregate facts from constituent allocations.

## Fresh Foundation live proof #5 evidence — 5 September 2026

Workflow `33992012077` on `main` `fa0ec5624e31e47576957433ab8258a10e8265d2` failed closed on the valid aggregate sentence `Ensure the assembled set totals 100 marks.` before retaining a Candidate. PR #320 subsequently corrected that aggregate-context case without relaxing constituent controls.

## Fresh Foundation live proof #7 evidence — 5 September 2026

Workflow `33994117446` on released `main` `d800fc242afa4ba9901d3bd991ed89375ba5577a` failed closed on the source-backed Paper 2 phrase `approximately 33 marks each`. The subsequent narrow repair made that exception source-bound to `paper2-structure`; exact or sub-question reinterpretations remained blocked.

## Slice 3B retained proof blocker — 6 September 2026

Source proof run `34049089770` on `main` `ea8b1143270f70477dc5964f863c0e8e764bf3d5` retained Foundation fingerprint `4171ecaf91a6dc50bfcec334f1727892a6767fe7ff25eae1db1f034d6c9a103d` and passed deterministic assurance. Fresh independent review later exposed another classifier false positive in a Paper 2 common-failure description that mentioned an aggregate `100-mark question-set envelope` and a constituent question in the same sentence. The relationship-based classifier repair preserved the exact aggregate/constituent boundary and did not change ADR-0022.

## Fresh post-PR #333 proof chain — 7 September 2026

After PR #333 was Founder-approved, merged and production-verified, a completely fresh Foundation chain was started from released `main` `e0a171c70fcf4f3136afd658527e58b823b76735` rather than reusing the earlier candidate.

Foundation Live Proof run `34120239996` succeeded and retained:

- source artifact `10017963704`;
- source/main SHA `e0a171c70fcf4f3136afd658527e58b823b76735`;
- Foundation fingerprint `d87397cef27388dcc37120b9e72c4cd685be0f35fd26b81f3d0565b750fa58ed`; and
- learner-facing assets `0`.

Deterministic assurance run `34120660042` passed with 19 checks and zero failures.

Fresh independent-review run `34120766027` then returned `fail_hold` with three material findings:

1. the AQA overall AO ranges existed in Exam Truth but there was no structured qualification-total generation/validation control requiring generated marks to be tallied against those ranges;
2. the complete Paper 2 Question Family did not separately bind the assembled set to the verified 100-mark component total; and
3. the complete Paper 3 Question Family had the same set-total ambiguity.

The reviewer did not require invented constituent tariffs. It correctly distinguished the complete-set total from the deferred internal allocations.

The first targeted remediation then demonstrated the remaining ownership defect. It converted the range evidence into exact AO targets `AO1 23%, AO2 25%, AO3 26%, AO4 26%`. Deterministic re-assurance correctly failed because Board Alignment supports ranges, not those exact weightings. The remediated fingerprint `209911e56d704f1f5b2e8fb732b3282da2ed98ec15fb6826f065e7c83bf6c00b` is therefore failed historical evidence and must not progress.

The current repair keeps both protections:

- source-backed ranges remain source truth and are represented in a separate qualification-total `assessmentObjectiveCoveragePlan`; and
- the exact Paper 2/Paper 3 set total is represented as `aggregateMarkTotal`, separate from ADR-0022's non-claim `markRange` envelope.

## Documentation impact check

No normative authority or ADR change is required. The active Foundation workflow already requires source-backed Exam Truth and deterministic/fresh independent assurance. ADR-0022 already requires exact aggregate component facts to remain enforceable while unsupported constituent precision stays unfixed before qualified calibration. This change supplies missing implementation representation and remediation ownership for those existing rules.

The implementation schema, AQA normalizers, remediation adapter, regressions and this technical record are changed together. Historical proof outcomes remain unchanged.

## Source and rights impact

None. No additional AQA source text enters generative context and no source-use classification changes. The AO plan uses the already-controlled Board Alignment requirement `aqa-exam-ao-weighting`; Question Family aggregate totals use already-governed component marks.

## User/product impact

None. No learner-facing asset is created or changed. The change affects Foundation correctness, representation and assurance only.

## Next governed step

Because this change alters the generated/persisted Foundation representation and therefore its fingerprint, the post-release assurance chain must start from a **new Foundation Live Proof on the new released `main`** rather than reusing `d87397ce...`.

After this implementation is exact-head assured, Founder-approved, merged and production-verified:

1. run a completely fresh AQA 7132 / 2027 Foundation Live Proof;
2. bind deterministic Foundation assurance to that exact new source run, artifact, main SHA and fingerprint;
3. only after deterministic PASS, run a genuinely fresh-context independent review against the exact new Foundation;
4. require any targeted remediation to pass the same aggregate AO/set-total and pre-calibration boundaries;
5. if independent review passes, run the required fresh external-source challenge; and
6. proceed to qualified expert packaging/review only if the exact candidate passes all preceding gates.

Do not increase the remediation limit, invent exact AO weightings, or manufacture constituent calibration merely to satisfy a provider or reviewer.