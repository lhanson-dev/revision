# Content Factory Reliability v2-E Live Worker Soak

## Status

**Live execution completed on approved `main`; Q7 did not pass because the soak exposed a new generic Assessment Item provider-contract class.**

V2-D established provider-free Q1–Q6 PASS before the soak. V2-E then exercised the distinct Q7 live-provider sampling path required by `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

The durable classified evidence is:

- `content-factory/reliability-v2-e-q7-live-soak-evidence.json`

The completed live run was:

- workflow: `Content Factory Live Worker Soak`;
- run ID: `33265434110` / run number `16`;
- approved `main`: `69d7abb7d3236616b687cbed480e7584ceb69fc9`;
- artifact ID: `9718558827`;
- provider/model: `openai` / `gpt-5.6-terra`;
- configured ceiling: US$5;
- known measured usage: US$0.423906;
- full-course assembly: false;
- learner publication: false.

Q7 therefore remains unpassed. The full-course Content Factory remains paused and the separate Q8 eligibility transition is not available.

## Execution history

The Q7 runner merged to approved `main` in PR #240 at `ba9d5e5fee0ae33bfac22f393f50faad4e8cb4f7`.

GitHub initially registered the workflow without exposing the expected manual `Run workflow` control. PR #241 added a narrowly scoped governed request-file push fallback and merged at `ef2b72bf83d31b66c15bee5480e33c21acfa580b`.

The first fallback trigger created workflow run `33264051185`, but GitHub rejected the workflow definition before scheduling any job because the inline Node checks were not expressed as multiline YAML `run: |` blocks. That run contained zero jobs, made zero provider calls and incurred zero provider spend.

PR #242 corrected the YAML and retriggered the same governed request. Its merge at `69d7abb7d3236616b687cbed480e7584ceb69fc9` created run `33265434110`, which executed the actual 20-sample Q7 soak and uploaded the evidence artifact.

## Canonical runtime and entry point

Q7 uses:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`.

Supported trigger modes remain:

- manual `workflow_dispatch`; and
- a push to approved `main` that changes only the dedicated governed request path `content-factory/reliability-v2-e-live-worker-soak-request.json` within the workflow path filter.

The workflow is deliberately separate from `.github/workflows/content-factory-live-pilot.yml`. The full-course workflow remains fail closed unless the machine-readable reliability state is later restored to `qualified` through the separate Q8 transition.

## Governed safety envelope

For a push-triggered soak, the workflow validates before any provider call that the request declares:

- gate `Q7`;
- run class `bounded_live_worker_soak`;
- status `requested`;
- maximum spend exactly US$5;
- `fullCourseAssembly: false`; and
- `learnerPublication: false`.

The live run also verified before provider execution that Q1–Q6 were PASS on the then-current qualification record, Q7 was `pending`, global qualification was `paused`, `qualifiedEvidence` was null and `livePilotEligible` was false.

After classification of the completed soak, Q1–Q6 are intentionally reopened to `pending` so another Q7 run is blocked until the Assessment Item defect is corrected and provider-free qualification is repeated.

## Sample design and result

The governed sample set was exactly 20 independent live worker outputs across all five required subject shapes:

| Subject shape | Assessment Item | Marking Pack | Total |
| --- | ---: | ---: | ---: |
| quantitative / business / economics | 2 | 2 | 4 |
| mathematics | 2 | 2 | 4 |
| science | 2 | 2 | 4 |
| essay / humanities | 2 | 2 | 4 |
| language / prescribed text | 2 | 2 | 4 |
| **Total** | **10** | **10** | **20** |

Observed outcome:

- 20/20 planned samples executed;
- 13 accepted;
- 7 controlled fail-closed;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- 9 targeted repairs observed across accepted samples;
- Assessment Item: 3 accepted / 7 controlled fail-closed;
- Marking Pack: 10 accepted / 0 controlled fail-closed.

Marking Pack samples used deterministic rights-safe synthetic assessment inputs rather than depending on live Assessment Item success, so the 10/10 Marking Pack result is independent evidence for that worker boundary.

## Generic Assessment Item defect classification

The seven controlled failures are classified as one reusable engineering contract class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Across all five governed subject shapes, live Assessment Item candidates omitted one or more required subquestion-level values:

- `subquestions[].maxMark`;
- `subquestions[].requirementIds`;
- `subquestions[].coverageEvidence` or its required locator fields.

This is not the same as the compiler-owned top-level target fields. At the base provider adapter, Revision already omits top-level `componentId`, `questionFamilyId`, `requirementIds`, `format` and `maxMark` from the provider contract when a governed assessment policy exists, then injects those top-level values deterministically after provider validation.

The failing values are subquestion-level educational structure. The current production provider schema requires them before the later structured-assessment compiler can inspect the complete item. When they are absent, the structured provider parse fails before the existing validator-directed Assessment Item repair can run.

The repeated cross-shape pattern therefore demonstrates a generic provider-contract weakness rather than seven independent subject-specific educational findings.

All ten Marking Pack samples were accepted. The soak did not expose a new generic Marking Pack contract class.

## Q1–Q6 requalification impact

Under the Reliability Qualification Standard, a new generic Q7 contract defect requires a return through the affected provider-free gates before another live soak.

The durable status therefore reopens Q1–Q6:

- **Q1** — revisit Assessment Item ownership, especially whether any subquestion mechanical representation should move to compiler ownership and where bounded repair should begin;
- **Q2** — add a permanent replay regression for this defect. The soak artifact did not retain the raw provider candidate, so this must be a clearly labelled synthetic reproduction rather than falsely described as exact historical output;
- **Q3** — add omitted and simultaneous subquestion-structure mutations across all five subject shapes;
- **Q4** — prove the corrected Assessment Item boundary through the deterministic full-pipeline simulation;
- **Q5** — prove the Assessment Item contract/compiler semantic change invalidates only the genuine assessment and downstream dependency set;
- **Q6** — repeat the complete corrected provider-free qualification under varied governed seeds/order.

Only after those gates pass again may another bounded Q7 live soak run.

## Spend review

The first completed v2 live-worker soak triggers the cost review required by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

Observed evidence:

- configured ceiling: US$5;
- known usage cost: US$0.423906;
- unpriced sample count: 0;
- ceiling utilisation: 8.47812%.

Decision: **retain the existing US$5 Q7 ceiling**. The completed 20-sample exercise was well inside the ceiling and provides no evidence that a higher limit is necessary. This is a review outcome, not a change to the normative cost authority.

## Rights and publication position

Every sample used invented subject-shape facts and `Synthetic Reliability Board` identity. The harness supplied no awarding-body source prose, past-paper wording, prescribed-text excerpts or real learner course.

The run performed:

- no full-course assembly;
- no learner publication;
- no educational benchmark approval;
- no Q8 eligibility transition.

## Evidence retention

The workflow artifact contained per-sample:

- subject shape;
- worker boundary;
- provider/model;
- contract version;
- provider-call count;
- repair count;
- retry count;
- observed usage cost;
- result/disposition;
- failure diagnostics where applicable.

Those sample records, the workflow/head/artifact binding, aggregate counts, cost review and classification decision are now persisted in `content-factory/reliability-v2-e-q7-live-soak-evidence.json` so the qualification evidence does not depend on the temporary GitHub artifact retention window.

## Documentation impact

No normative authority change is required. The observed failure is handled by the existing Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy.

This record and the indexed `Content Factory Reliability Qualification Harness.md` are updated because implementation/evidence state changed materially. `content-factory/reliability-qualification.json` is reset fail closed. Historical Pilot #1–#18 records and V2-A–V2-D evidence remain unchanged; V2-D remains historical evidence of the earlier provider-free PASS rather than current qualification evidence.

`INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and Reliability Qualification Harness remain the canonical indexed locations.

## Next work

The next governed implementation change must correct the generic Assessment Item boundary, add the required Q2/Q3 regression evidence and rerun Q1–Q6. It must not trigger another paid Q7 soak as part of the correction PR.

After corrected Q1–Q6 evidence is merged, a fresh bounded Q7 soak may be requested. Only a later Q7 PASS can lead to the separate V2-F / Q8 eligibility transition and then a full-course confirmation pilot.
