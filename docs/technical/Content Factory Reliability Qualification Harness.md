# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 has completed two bounded Q7 live-worker soak attempts. Both exposed generic Assessment Item contract classes. The second class is now corrected provider-free and Q1–Q6 have passed exact-head provider-free assurance. Q7 itself remains pending, Q8 remains blocked and no paid execution is authorized by this correction.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The current machine-readable state is `content-factory/reliability-qualification.json`.

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

Result:

- 13 accepted / 7 controlled fail-closed;
- Assessment Item 3/10 accepted;
- Marking Pack 10/10 accepted;
- known spend US$0.423906;
- no infrastructure incident.

Generic class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Durable evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

That class was corrected and requalified provider-free. The historical PASS record remains `content-factory/reliability-post-q7-assessment-item-requalification.json` and is not rewritten by later work.

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

The three failed Assessment Item samples occurred across essay/humanities and language/prescribed-text shapes. In each, `coverageEvidence[].requirementId` did not exactly reconcile with separately provider-authored subquestion `requirementIds`, and the mismatch remained after the single permitted targeted repair.

The first-Q7 omission class did not recur. Marking Pack remained 10/10. The second failure is therefore a new, narrower Assessment Item cross-reference class.

The append-only defect record for this class is `content-factory/reliability-q7-002-assessment-item-cross-reference-defect.json`. Because raw failed provider candidates were not retained, its executable replay is explicitly a synthetic reproduction rather than an exact-output claim.

## Second-Q7 correction

Q1 identified the defect as duplicated clerical authorship, not a need for broader model repair.

The corrected ownership boundary is:

- `coverageEvidence[].requirementId` and its exact learner-facing excerpt remain model-authored educational judgement, subject to strict deterministic validation and the existing bounded repair policy;
- `subquestions[].requirementIds` is no longer independently model-authored at the provider boundary;
- Revision deterministically derives `subquestions[].requirementIds` from the validated `coverageEvidence[].requirementId` values;
- duplicate coverage mappings, missing governed requirements, unknown requirements, malformed identifiers and non-exact evidence excerpts still fail closed;
- no additional retry or repair allowance has been introduced.

This removes the second-Q7 mismatch class by construction without inventing educational meaning or weakening validation.

The Assessment Item durable semantic boundary advances from `2+output-integrity-v3` to `2+output-integrity-v4`. Assessment Item outputs and genuine downstream dependants such as Marking Pack and independent review are invalidated; Learn and Practice remain reusable because they are outside the Assessment Item dependency closure.

## Provider-free Q1–Q6 PASS evidence

The current PASS record is `content-factory/reliability-post-q7-002-assessment-item-requalification.json`.

It covers:

- Q1 — explicit ownership transfer for the duplicated requirement-ID representation;
- Q2 — append-only synthetic reproduction of the second-Q7 class;
- Q3 — five governed subject shapes with conflicting duplicate IDs, reordering, duplicate mappings, missing/unknown requirements and non-exact excerpts;
- Q4 — deterministic full-pipeline composition through `expert_review_ready` with zero provider usage and no publication;
- Q5 — semantic-version advancement and genuine downstream dependency invalidation;
- Q6 — three repeated five-shape boundary runs plus three deterministic pipeline runs.

The corrected implementation head `271a6e97907329f16f228d50ec92e96d0a61f73f` passed Revision CI run `33300169063` / #1285, including typecheck, lint, unit tests, production build, responsive browser assurance, database/RLS assurance, protected service assurance and secret scanning.

This provider-free PASS does not prove live-provider behaviour and does not make Q7 pass.

## Current gate state

`content-factory/reliability-qualification.json` now records:

- Q1–Q6 `pass`;
- Q7 `pending`;
- `status: paused`;
- `providerFreeQualificationEvidence: content-factory/reliability-post-q7-002-assessment-item-requalification.json`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The corrected branch is therefore technically eligible to proceed toward a later bounded Q7 soak **only after** it is merged under explicit Founder approval. This PR does not authorize or trigger that paid execution. Any later Q7 attempt requires a separate governed request on corrected approved `main`.

## Cost position

The second Q7 run used US$0.455962, 9.11924% of the US$5 ceiling. Combined known spend across both completed Q7 attempts is US$0.879868.

The existing US$5 ceiling remains proportionate. The second failure is a contract-quality issue rather than a spend-ceiling issue, so no cost-authority change is required.

## Q8 and confirmation pilots

V2-F/Q8 remains blocked. No change may set `status: qualified` or `livePilotEligible: true` until Q1–Q7 all pass through governed evidence.

Pilot #19 must not run before Q8 merges.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 and the Bootstrap Cost Strategy already prescribe the reset, provider-free requalification and spend controls used here.

This technical harness, the V2-E record, machine-readable qualification evidence and assurance tests change with the implementation. Historical Pilot records, both Q7 failure evidence records, V2-D evidence and the prior post-Q7 provider-free PASS record remain unchanged as historical evidence.

The governed Q7 request file is deliberately untouched, so this correction cannot trigger another paid soak.

`INDEX.md` remains correct because this file is already the indexed technical reliability source.
