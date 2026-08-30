# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 has completed two bounded Q7 live-worker soak attempts. Both exposed generic Assessment Item contract classes. The second defect has now been corrected provider-free and Q1–Q6 have been requalified on the current Assessment Item boundary. Q7 remains `pending`; Q8 and full-course confirmation remain blocked.

The active governing authority is `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The current machine-readable state is `content-factory/reliability-qualification.json`.

Current provider-free evidence is:

- `content-factory/reliability-post-q7-second-assessment-item-requalification.json`;
- `content-factory/reliability-q7-assessment-item-coverage-pointer-defect.json`.

Historical first-Q7 provider-free evidence remains:

- `content-factory/reliability-post-q7-assessment-item-requalification.json`;
- `content-factory/reliability-q7-assessment-item-contract-defect.json`.

## Reliability objective

The factory target remains:

`model educational judgement → compiler-owned structure/bounded references → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is not perfect first-pass model output. The target is that expected provider variability is converted into valid durable artifacts or truthful fail-closed results without engineering changes between ordinary courses.

## Q7 history

### Attempt 1

Workflow run `33265434110` / run #16 on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` executed all 20 samples.

Observed:

- 13 accepted / 7 controlled fail-closed;
- Assessment Item 3/10 accepted;
- Marking Pack 10/10 accepted;
- known spend US$0.423906;
- no infrastructure incident.

Generic class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

The Assessment Item provider schema rejected missing subquestion `maxMark`, `requirementIds` and/or `coverageEvidence` structure before the one permitted repair could run. The subsequent correction admitted that bounded omission class to complete diagnostics and one targeted repair. Historical evidence remains `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

### Attempt 2

Workflow run `33282967568` / run #17 on approved `main` `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9` again executed all 20 samples.

Observed:

- 17 accepted / 3 controlled fail-closed;
- Assessment Item 7/10 accepted;
- Marking Pack 10/10 accepted;
- 15 targeted repairs observed;
- known spend US$0.455962;
- no unpriced samples or infrastructure incidents;
- no full-course assembly or learner publication.

Artifact ID `9723581809`, digest `sha256:b351f24be35d23b8dbecc78ba0cbf0228cac314cd20adfab2bf38dd19199d21b`.

Generic class:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

Three Assessment Item samples across essay/humanities and language/prescribed-text shapes declared `coverageEvidence[].requirementId` values whose set did not exactly reconcile with the owning subquestion `requirementIds`. The mismatch remained after the single permitted targeted repair. Historical evidence remains `content-factory/reliability-v2-e-q7-live-soak-evidence-002.json`.

The first-Q7 omission class did not recur. Marking Pack remained 10/10.

## Second-Q7 ownership correction

Q1 identified that the failed representation duplicated one model-authored cross-reference unnecessarily.

The educational meaning remains provider-authored where required:

- `subquestions[].requirementIds` remains targeted-repair eligible because assigning governed requirements to a subquestion can encode educational judgement;
- `subquestions[].coverageEvidence[].evidence` remains generative subject to deterministic exact-excerpt validation.

The clerical pointer no longer remains duplicated model authorship:

- provider contract v5 returns `subquestions[].coverageEvidence[].requirementPosition`, a one-based bounded locator into the owning subquestion `requirementIds`;
- Revision verifies that every declared requirement position is evidenced exactly once;
- Revision resolves the final durable `coverageEvidence[].requirementId` itself from that bounded position;
- the durable Assessment Item schema remains unchanged for downstream consumers.

Missing, duplicate, out-of-range or unevidenced positions enter the complete actionable diagnostic set. The artifact may receive at most one targeted repair. Any remaining defect fails closed.

This is a course-agnostic compiler-first correction. The shared provider client is not weakened, and the compiler does not invent the educational requirement allocation or evidence excerpt.

Assessment Item provider contract provenance advances to `5`. Durable Assessment Item semantics advance to `2+output-integrity-v4` so existing Assessment Items and genuine downstream dependants are invalidated while unrelated Learn/Practice artifacts remain reusable.

## Provider-free Q1–Q6 requalification

Current evidence is `content-factory/reliability-post-q7-second-assessment-item-requalification.json`.

The corrected boundary records:

- **Q1 PASS** — educational requirement allocation and evidence excerpts remain judgement-bearing; the duplicated final requirement-ID pointer moves to bounded-locator/compiler ownership;
- **Q2 PASS** — the second-Q7 class is retained as a clearly labelled synthetic reproduction because the raw provider candidate was not retained; first-Q7 history remains covered and unchanged;
- **Q3 PASS** — all five governed shapes exercise valid bounded locators, legacy provider-authored ID representation, missing/duplicate/out-of-range/unevidenced locators, simultaneous defects, bounded repair and fail-closed outcomes;
- **Q4 PASS** — the corrected durable Assessment Item composes with the deterministic provider-free pipeline through `expert_review_ready` with no publication;
- **Q5 PASS** — Assessment Item semantics advance to `2+output-integrity-v4`; only Assessment Item and genuine downstream dependants are invalidated, while Learn/Practice remain reusable;
- **Q6 PASS** — the five-shape replay/adversarial boundary and deterministic pipeline are repeated three times under varied governed ordering.

The candidate implementation passed exact-head Revision CI run `33298339862` on head `7ad812013c7bc95aa8aaa15606f5b86a1e0155c4`, including typecheck, lint, unit tests, production build, responsive browser assurance, database/RLS and protected-service assurance. The final PR head must also pass exact-head CI after the evidence/documentation state is complete.

No provider calls or paid reliability spend are used by this correction/requalification.

## Current machine-readable state

`content-factory/reliability-qualification.json` records:

- Q1–Q6 `pass` on the second post-Q7 provider-free requalification;
- Q7 `pending`;
- `status: paused`;
- current `providerFreeQualificationEvidence: content-factory/reliability-post-q7-second-assessment-item-requalification.json`;
- previous provider-free PASS retained as `lastProviderFreeQualificationEvidence`;
- both failed Q7 attempts retained in `q7FailureEvidenceHistory`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

This state is sufficient only for a **future separately governed bounded Q7 soak** after the correction is merged to approved `main`. It does not authorize Q8 or a full-course pilot.

## Cost position

The two completed Q7 soaks used:

- attempt 1: US$0.423906;
- attempt 2: US$0.455962;
- cumulative known Q7 spend: US$0.879868.

The existing US$5 per-soak ceiling remains proportionate. Neither failure is a spend-capacity problem, so no cost-authority change is required.

## Next work

After this correction and Q1–Q6 requalification merge to approved `main`, the next reliability action is a **separate governed Q7 request** using the existing 20-sample, five-shape, US$5 safety envelope.

If that later soak exposes another generic engineering contract class, the affected provider-free gates reopen again. If Q7 passes, Q7 PASS must be recorded through governed evidence before a separate Q8 eligibility transition can be proposed.

Pilot #19 must not run before Q8 merges.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already requires compiler-first ownership, bounded references, historical replay, adversarial provider-free requalification and a return through Q1–Q6 after a Q7 generic contract failure.

This technical harness and `Content Factory Reliability v2-E Live Worker Soak.md` are updated because implementation/evidence state changed materially. Historical pilot/Q7 evidence is not rewritten. `INDEX.md` remains correct because this file is already the indexed technical reliability source.
