# Content Factory Reliability v2-E Live Worker Soak

## Status

**Three bounded Q7 live-worker soaks have completed. Attempts 1 and 2 exposed generic Assessment Item engineering contract classes and were corrected through the governed Q1–Q6 reset path. Attempt 3 completed all 20 governed samples and exposed no new generic engineering/provider-contract class. Its four controlled fail-closed samples are classified as educational/semantic rejections handled by the intended deterministic validation and single-repair boundary. Q7 is therefore PASS.**

The active authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The US$5 per-soak guardrail remains governed by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

The Content Factory remains **paused for full-course live execution**. Q7 PASS does not itself restore production eligibility: V2-F/Q8 is a separate governed eligibility transition. `qualifiedEvidence` remains null and `livePilotEligible` remains false until Q8 is Founder-approved and merged.

## Canonical runtime

Q7 uses:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`;
- production `createOpenAIModelAssistedWorkers` Assessment Item and Marking Pack boundaries;
- the governed request file `content-factory/reliability-v2-e-live-worker-soak-request.json` for approved-main push execution.

Each soak is limited to 20 rights-safe synthetic worker samples across all five governed subject shapes, uses production compiler/validator/repair code, performs no full-course assembly or learner publication, and is capped at US$5.

## Execution history

### Attempt 1 — run 33265434110 / run #16

Approved `main`: `69d7abb7d3236616b687cbed480e7584ceb69fc9`.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

Observed:

- 20/20 executed;
- 13 accepted;
- 7 controlled fail-closed;
- Assessment Item 3/10 accepted;
- Marking Pack 10/10 accepted;
- 9 targeted repairs observed;
- 0 infrastructure incidents;
- known provider cost US$0.423906.

Generic class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Live Assessment Item candidates omitted required subquestion structure before the repair boundary could inspect it. That reusable class was corrected and Q1–Q6 were requalified provider-free. Historical attempt-1 evidence remains unchanged.

### Attempt 2 — run 33282967568 / run #17

Approved `main`: `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9`.

Artifact ID `9723581809`, digest `sha256:b351f24be35d23b8dbecc78ba0cbf0228cac314cd20adfab2bf38dd19199d21b`.

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-002.json`.

Observed:

- 20/20 executed;
- 17 accepted;
- 3 controlled fail-closed;
- Assessment Item 7/10 accepted;
- Marking Pack 10/10 accepted;
- 15 targeted repairs observed;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- known provider cost US$0.455962.

Generic class:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

The provider was authoring the same requirement-ID relationship twice through both `subquestions[].requirementIds` and `coverageEvidence[].requirementId`. The class repeated across essay/humanities and language/prescribed-text shapes. Q1 identified duplicated clerical authorship; Revision now derives final `subquestions[].requirementIds` from validated coverage-evidence mappings. The Assessment Item semantic boundary advanced to `2+output-integrity-v4`, and Q1–Q6 were requalified provider-free.

Historical attempt-2 evidence remains unchanged.

### Attempt 3 — run 33364521121 / run #18

Approved `main`: `9755c7a40d5e61b76a49e51480e7c5403642e593`.

Artifact:

- ID `9747914357`;
- name `content-factory-live-worker-soak-9755c7a40d5e61b76a49e51480e7c5403642e593`;
- digest `sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96`.

Durable repository evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`.

Observed:

- 20/20 planned samples executed;
- 16 accepted;
- 4 controlled fail-closed;
- Assessment Item 8/10 accepted;
- Marking Pack 8/10 accepted;
- 12 targeted repairs observed;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- provider/model `openai` / `gpt-5.6-terra`;
- known provider cost US$0.432952;
- unpriced samples 0;
- full-course assembly false;
- learner publication false.

The workflow job concluded non-zero because the Q7 harness intentionally requires manual engineering-vs-educational classification whenever any controlled fail-closed sample occurs. The evidence artifact was uploaded successfully and the non-zero workflow conclusion is not itself an engineering-failure classification.

## Attempt-3 controlled fail-closed classification

The Reliability Standard explicitly distinguishes a correctly rejected genuine educational defect from a new generic engineering contract class. The active Q1 ownership inventory provides the boundary for that decision.

### Assessment Item — two controlled educational/semantic rejections

Affected samples:

- `essay_humanities-assessment_item_generation-1`;
- `language_prescribed_text-assessment_item_generation-2`.

Both failed strict governed-requirement coverage after the single permitted complete-diagnostic repair. This is **not** recurrence of the attempt-2 cross-reference class:

- provider-authored `subquestions[].requirementIds` no longer exists at the v5 provider boundary;
- Revision derived the final requirement-ID representation from `coverageEvidence[].requirementId` as intended;
- strict whole-artifact validation then determined that the provider-authored educational coverage evidence did not genuinely evidence exactly the governed requirement set;
- the affected items were rejected without weakening the intended assessment demand or inventing coverage.

The Q1 ownership model deliberately leaves the educational coverage judgement subject to fail-closed validation once compiler-owned clerical representation has been removed. These two samples therefore demonstrate the intended reliability outcome: **valid artifact or truthful fail closed without engineering intervention**.

### Marking Pack — two controlled educational/semantic rejections

Affected samples:

- `quantitative_business_economics-marking_pack_generation-2`;
- `mathematics-marking_pack_generation-2`.

Both remained without sufficient final-answer accuracy or consequential-error treatment in the provider-authored calculation rubric after the single permitted repair. In the quantitative/business/economics sample, the same repair also successfully removed an initial unasked application demand before the remaining rubric defect failed closed.

The Q1 inventory classifies rubric descriptor meaning, marking routes and diagnostic guidance as **generative educational marking judgement**. Revision deterministically validates that calculation guidance addresses method/working and accuracy/consequential-error treatment, but it does not invent the subject-specific marking meaning merely to force acceptance. These samples were therefore correctly rejected by the intended educational assurance boundary.

### Q7 decision

Attempt 3 exposed:

- no new generic engineering/provider-contract class;
- no infrastructure incident;
- no escaped engineering-boundary exception;
- no recurrence of either previously corrected Q7 engineering class;
- correct complete-diagnostic validation;
- at most one targeted repair per affected artifact;
- correct whole-artifact revalidation and fail-closed behaviour.

**Q7 PASS.**

No Q1–Q6 reset is required from attempt 3.

## Cost position

Attempt-3 known usage was US$0.432952, 8.65904% of the governed US$5 ceiling.

Combined known spend across all three Q7 soaks is **US$1.312820**.

Decision: **retain the US$5 per-soak ceiling**. Attempt 3 completed all planned samples well inside the ceiling and the controlled educational rejections provide no evidence that more spend would improve the engineering boundary.

## Machine-readable position and next work

`content-factory/reliability-qualification.json` now records:

- Q1–Q7 `pass`;
- `status: paused`;
- `q7PassEvidence: content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`;
- `providerFreeQualificationEvidence: content-factory/reliability-post-q7-002-assessment-item-requalification.json`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The next reliability step is **V2-F/Q8 — the separate governed eligibility transition**. Q8 may only restore `qualified` / `livePilotEligible` through its own assured, Founder-approved PR. Pilot #19 remains blocked until Q8 merges.

No additional paid Q7 soak is required by this evidence.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already defines the distinction between controlled educational rejection and a new generic engineering contract class, and the Bootstrap Cost Strategy already governs the spend response.

This evidence PR updates the Q7 technical record, Reliability Qualification Harness, current machine-readable qualification state and assurance tests. Attempts 1 and 2, historical Pilot records, provider-free requalification records and defect evidence remain unchanged as historical evidence.

`INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and Reliability Qualification Harness remain the canonical indexed sources.
