# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 has now completed two bounded Q7 live-worker soak attempts. Both exposed generic Assessment Item contract classes, so Q8 remains blocked and the current provider-free gates Q1–Q6 are reopened to `pending`.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The current machine-readable state is `content-factory/reliability-qualification.json`.

## Reliability objective

The factory target remains:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The purpose of Q7 is to expose real provider variability cheaply before another full-course run. A correctly rejected educational defect does not automatically fail Q7; a new reusable engineering/provider-contract class does.

## Qualification history

### V2-A to V2-D

V2-A introduced compiler-first Marking Pack ownership and complete diagnostics. V2-B established the historical failure replay corpus. V2-C established adversarial provider-free mutation coverage. V2-D established provider-free Q1–Q6 qualification with repeated evidence.

Historical V2-D evidence remains unchanged.

### Q7 attempt 1

Workflow run `33265434110` / run #16 on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` executed all 20 samples.

Result:

- 13 accepted / 7 controlled fail-closed;
- Assessment Item 3/10 accepted;
- Marking Pack 10/10 accepted;
- known spend US$0.423906;
- no infrastructure incident.

Generic class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

That class was corrected by the Assessment Item v4 boundary and requalified provider-free. The resulting historical PASS record remains `content-factory/reliability-post-q7-assessment-item-requalification.json`.

### Q7 attempt 2

Workflow run `33282967568` / run #17 on approved `main` `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9` again executed all 20 governed samples.

Result:

- 17 accepted / 3 controlled fail-closed;
- Assessment Item 7/10 accepted;
- Marking Pack 10/10 accepted;
- 15 targeted repairs observed;
- known spend US$0.455962;
- 0 unpriced samples;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- no course assembly or learner publication.

Artifact ID `9723581809`, digest `sha256:b351f24be35d23b8dbecc78ba0cbf0228cac314cd20adfab2bf38dd19199d21b`.

Durable repository evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-002.json`.

Generic class:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

The three failed Assessment Item samples occurred across essay/humanities and language/prescribed-text shapes. In each, `coverageEvidence[].requirementId` did not exactly reconcile with the subquestion `requirementIds`, and the mismatch remained after the single permitted targeted repair.

The first-Q7 omission class did not recur. Marking Pack remained 10/10. The second failure is therefore a new, narrower Assessment Item cross-reference class.

## Current gate state

The second Q7 failure invalidates the current provider-free qualification claim for the affected implementation boundary. `content-factory/reliability-qualification.json` therefore records:

- Q1 `pending`;
- Q2 `pending`;
- Q3 `pending`;
- Q4 `pending`;
- Q5 `pending`;
- Q6 `pending`;
- Q7 `pending`;
- `status: paused`;
- `providerFreeQualificationEvidence: null`;
- `lastProviderFreeQualificationEvidence: content-factory/reliability-post-q7-assessment-item-requalification.json`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The first and second Q7 evidence records remain available in `q7FailureEvidenceHistory`; the latest second-run evidence is the active `q7FailureEvidence` pointer.

This state prevents another Q7 live run because the Q7 workflow preflight requires Q1–Q6 PASS. It also continues to prevent full-course live execution because the full-course workflow requires global `qualified` status.

## Provider-free corrective programme

The next work must be provider-free and generic.

### Q1 — ownership review

Revisit the duplicated Assessment Item cross-reference between:

- `subquestions[].requirementIds`;
- `subquestions[].coverageEvidence[].requirementId`.

The model must retain genuine educational judgement about which requirement an excerpt evidences. However, mechanically duplicated IDs should move to deterministic or bounded-reference ownership where that mapping can be preserved without inventing educational meaning.

### Q2 — historical replay

The second soak artifact retained the exact durable failure signature but not the raw provider candidates. The replay must therefore be explicitly labelled a **synthetic reproduction**, not exact historical output.

### Q3 — adversarial matrix

Add five-shape provider-free variants for:

- coverage-evidence requirement missing from `requirementIds`;
- declared requirement missing from coverage evidence;
- duplicates;
- reordering;
- simultaneous cross-reference defects;
- one complete-diagnostic repair;
- repair failure and fail-closed behavior.

### Q4 — deterministic pipeline

Prove the corrected boundary composes through `expert_review_ready` with no provider call and no publication.

### Q5 — dependency invalidation

Advance the relevant Assessment Item semantic fingerprint and prove only Assessment Item outputs and genuine downstream dependants are invalidated.

### Q6 — repeated stability

Repeat the corrected provider-free qualification under varied governed input ordering/seeds. A single green run is insufficient.

Only after Q1–Q6 return to PASS on approved `main` may a separate governed Q7 request be proposed.

## Cost position

The second Q7 run used US$0.455962, 9.11924% of the US$5 ceiling. Combined known spend across both completed Q7 attempts is US$0.879868.

The existing US$5 ceiling remains proportionate. The second failure is a contract-quality issue rather than a spend-ceiling issue, so no cost-authority change is required.

## Q8 and confirmation pilots

V2-F/Q8 remains blocked. No change may set `status: qualified` or `livePilotEligible: true` until Q1–Q7 all pass through governed evidence.

Pilot #19 must not run before Q8 merges.

## Documentation impact

No normative authority change is required. The active Reliability Qualification Standard and Bootstrap Cost Strategy already prescribe this reset path.

The technical harness, V2-E record, live-soak plan, machine-readable qualification state and assurance tests are updated in the same governed change. Historical Pilot records, first-Q7 evidence, V2-D evidence and the prior post-Q7 provider-free PASS record remain unchanged as historical evidence.

`INDEX.md` remains correct because this file is already the indexed technical reliability source.
