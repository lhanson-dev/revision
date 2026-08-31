# Content Factory Reliability Qualification Harness

## Status

The Content Factory is **qualified for a governed full-course confirmation pilot** under Reliability Standard v2.0.

Reliability v2 completed three bounded Q7 live-worker soak attempts. Attempts 1 and 2 exposed generic Assessment Item engineering contract classes; both were corrected and requalified provider-free through Q1–Q6. Attempt 3 executed all 20 governed live samples and, after the required engineering-vs-educational classification, exposed **no new generic engineering/provider-contract class**. Q1–Q7 are therefore PASS.

V2-F/Q8 is the separate governed eligibility transition required by the standard. The current machine-readable state is now `status: qualified`, `livePilotEligible: true`, with qualification evidence bound to approved `main` `166f9cb6957b995b81ff3eec84062b2f09ecec6c`, the current provider-free Q1–Q6 record and the passing Q7 live-soak record.

This state makes the next paid end-to-end run eligible only as a **confirmation pilot**. Q8 itself does not dispatch that run, execute a provider call, assemble or publish a real course, approve educational content or establish maturity for routine batch production.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The current machine-readable state is `content-factory/reliability-qualification.json`, with the Q8 transition record at `content-factory/reliability-v2-f-q8-eligibility.json`.

## Reliability objective

The factory target remains:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

Q7 exists to expose real provider variability cheaply before another full-course run. A correctly rejected educational defect does not automatically fail Q7; a new reusable engineering/provider-contract class does.

## Qualification history

### V2-A to V2-D

V2-A introduced compiler-first Marking Pack ownership and complete diagnostics. V2-B established the historical failure replay corpus. V2-C established adversarial provider-free mutation coverage. V2-D established provider-free Q1–Q6 qualification with repeated evidence.

Historical V2-D evidence remains unchanged.

### Q7 attempt 1

Workflow run `33265434110` / run #16 on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` executed all 20 samples.

Result: 13 accepted / 7 controlled fail-closed, known spend US$0.423906, no infrastructure incident.

Generic class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

That class was corrected and requalified provider-free. Historical evidence remains unchanged.

### Q7 attempt 2

Workflow run `33282967568` / run #17 on approved `main` `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9` executed all 20 samples.

Result: 17 accepted / 3 controlled fail-closed, 15 targeted repairs, known spend US$0.455962, zero infrastructure incidents and zero escaped engineering-boundary exceptions.

Artifact ID `9723581809`, digest `sha256:b351f24be35d23b8dbecc78ba0cbf0228cac314cd20adfab2bf38dd19199d21b`.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-002.json`.

Generic class:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

The provider was independently authoring both the subquestion requirement-ID set and the coverage-evidence requirement IDs. Q1 reclassified that duplicated clerical relationship to compiler ownership. Revision now derives `subquestions[].requirementIds` from validated `coverageEvidence[].requirementId`, while the educational coverage judgement remains model-authored and fail-closed validated.

The Assessment Item durable semantic boundary advanced to `2+output-integrity-v4`. Q1–Q6 were requalified provider-free on the corrected boundary.

### Q7 attempt 3 — PASS

Workflow run `33364521121` / run #18 on approved `main` `9755c7a40d5e61b76a49e51480e7c5403642e593` executed all 20 governed samples.

Result:

- 16 accepted / 4 controlled fail-closed;
- Assessment Item 8/10 accepted;
- Marking Pack 8/10 accepted;
- 12 targeted repairs observed;
- known spend US$0.432952;
- 0 unpriced samples;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- no course assembly or learner publication.

Artifact ID `9747914357`, digest `sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96`.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`.

The live workflow intentionally concluded non-zero because its harness requires classification whenever any controlled fail-closed sample occurs. The artifact upload succeeded; the durable classification determines the Q7 gate outcome.

## Attempt-3 classification

### Assessment Item

Two samples in essay/humanities and language/prescribed-text failed governed-requirement coverage after the single permitted repair.

This is not recurrence of the attempt-2 engineering class. At the v5 provider boundary, Revision no longer asks the provider to author `subquestions[].requirementIds`; it compiles those IDs from `coverageEvidence[].requirementId`. The deterministic compiler reached the intended strict semantic coverage check and rejected items whose provider-authored evidence did not genuinely cover exactly the governed requirements.

The active Q1 ownership inventory classifies this boundary as fail closed rather than permitting Revision to invent educational coverage. The two rejections therefore demonstrate intended behaviour, not a missing engineering normalization.

### Marking Pack

Two calculation Marking Pack samples in quantitative/business/economics and mathematics failed because provider-authored rubric descriptors still did not explain final-answer accuracy or consequential-error treatment after the single permitted repair.

The Q1 ownership inventory classifies marking judgement, routes and rubric descriptor meaning as generative educational judgement. The v2 compiler deterministically checks the required educational marking dimensions but does not fabricate subject-specific marking guidance merely to make the artifact pass.

These are controlled educational/semantic rejections handled by the designed fail-closed boundary.

### Q7 decision

Attempt 3 demonstrated:

- no recurrence of either previous Q7 generic engineering class;
- no new generic engineering/provider-contract class;
- complete deterministic diagnostics;
- one bounded repair where needed;
- whole-artifact revalidation;
- truthful fail-closed behaviour for unresolved educational defects;
- zero infrastructure incidents;
- zero escaped engineering-boundary exceptions.

**Q7 PASS.** No Q1–Q6 reset is required.

## Provider-free Q1–Q6 PASS evidence

The current provider-free PASS record remains `content-factory/reliability-post-q7-002-assessment-item-requalification.json`.

It covers:

- Q1 — compiler/model/fail-closed ownership split, including compiler ownership of duplicated Assessment Item requirement IDs;
- Q2 — append-only historical/synthetic regression corpus;
- Q3 — five governed subject shapes with adversarial provider-output variations;
- Q4 — deterministic full-pipeline composition through `expert_review_ready` with zero provider usage and no publication;
- Q5 — semantic dependency invalidation restricted to genuinely affected artifacts;
- Q6 — repeated provider-free stability.

The third live soak does not invalidate that evidence because it exposed no new generic engineering class.

## Q8 eligibility decision

V2-F/Q8 reviews the complete Q1–Q7 evidence already merged on approved `main` and restores the full-course confirmation-pilot gate without changing production worker/compiler logic.

The Q8 record is `content-factory/reliability-v2-f-q8-eligibility.json`. It binds the decision to approved `main` `166f9cb6957b995b81ff3eec84062b2f09ecec6c` and records:

- Q1–Q7 `pass`;
- provider-free Q1–Q6 evidence `content-factory/reliability-post-q7-002-assessment-item-requalification.json`;
- Q7 PASS evidence `content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`;
- Q6 repetition count 3;
- Q7 attempt 3 / workflow `33364521121` / 20 executed samples;
- no provider calls used by the Q8 transition itself;
- no full-course execution, assembly or learner publication triggered by Q8;
- next paid run class `confirmation_pilot`;
- maturity not yet achieved.

`content-factory/reliability-qualification.json` now records:

- `status: qualified`;
- `livePilotEligible: true`;
- all seven required gates in `passedGates`;
- `qualifiedEvidence.qualificationEvidenceMainSha: 166f9cb6957b995b81ff3eec84062b2f09ecec6c`;
- `qualifiedEvidence.eligibilityRecord: content-factory/reliability-v2-f-q8-eligibility.json`;
- `qualifiedEvidence.nextPaidRunClass: confirmation_pilot`.

The existing full-course workflow remains fail closed: its preflight requires `qualified`, `livePilotEligible: true`, non-null qualification evidence and every required gate in `passedGates` before any paid provider execution step can begin.

## Cost position

Attempt 3 used US$0.432952, 8.65904% of the US$5 ceiling. Combined known spend across all three Q7 attempts is **US$1.312820**.

The existing US$5 Q7 ceiling remains proportionate. The next full-course confirmation pilot remains governed by the existing **US$20 per-course hard ceiling** and the wider bootstrap cost strategy. Q8 makes no cost-authority change.

## Confirmation-pilot boundary

Pilot #19 is eligible after Q8 reaches approved `main`, but Q8 does not dispatch it.

The next paid end-to-end real course run is a confirmation pilot, not a debugging mechanism. Its outcomes must be classified under the Reliability Standard:

- educational finding — normal assurance/remediation work, not automatically a reliability failure;
- provider/infrastructure incident — bounded retry/resume rules apply;
- new generic contract/engineering failure — pause full-course eligibility and return to Reliability v2 qualification.

A successful Pilot #19 would still not make the Content Factory mature. Maturity requires three consecutive materially different real courses to reach `expert_review_ready` on their initial full factory run without engineering/code/worker-contract correction between runs, across more than one governed subject shape.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already defines Q8, confirmation-pilot classification, maturity and the stop-loss rule. The Bootstrap Cost Strategy already governs the US$20 course ceiling and quality-first spend controls.

This Q8 change updates the machine-readable qualification state, adds an append-only V2-F/Q8 eligibility record, updates this indexed technical harness and updates executable qualification/preflight assurance. Historical Pilot records, Q7 failure evidence, Q7 PASS evidence, V2-D evidence and provider-free requalification records remain unchanged.

`INDEX.md` remains correct because this file is already the indexed technical reliability source. No ADR is required because Q8 implements the already-approved Reliability v2 architecture rather than changing it.
