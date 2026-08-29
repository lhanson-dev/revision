# Content Factory Reliability v2-E Live Worker Soak

## Status

**The first live Q7 soak completed and did not pass. Its generic Assessment Item contract defect has now been corrected and Q1–Q6 have been requalified provider-free. Q7 remains pending until a fresh bounded live soak runs on the corrected approved-main implementation.**

The durable first-run evidence remains:

- `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

The current post-Q7 provider-free evidence is:

- `content-factory/reliability-post-q7-assessment-item-requalification.json`;
- `content-factory/reliability-q7-assessment-item-contract-defect.json`.

The first completed live run was:

- workflow: `Content Factory Live Worker Soak`;
- run ID: `33265434110` / run number `16`;
- approved `main`: `69d7abb7d3236616b687cbed480e7584ceb69fc9`;
- artifact ID: `9718558827`;
- provider/model: `openai` / `gpt-5.6-terra`;
- configured ceiling: US$5;
- known measured usage: US$0.423906;
- full-course assembly: false;
- learner publication: false.

The full-course Content Factory remains paused. Q8 is not available until a later Q7 PASS is recorded through governed evidence.

## Execution history

The Q7 runner merged to approved `main` in PR #240 at `ba9d5e5fee0ae33bfac22f393f50faad4e8cb4f7`.

GitHub initially registered the workflow without exposing the expected manual `Run workflow` control. PR #241 added a narrowly scoped governed request-file push fallback and merged at `ef2b72bf83d31b66c15bee5480e33c21acfa580b`.

The first fallback trigger created workflow run `33264051185`, but GitHub rejected the workflow definition before scheduling any job because the inline Node checks were not expressed as multiline YAML `run: |` blocks. That run contained zero jobs, made zero provider calls and incurred zero provider spend.

PR #242 corrected the YAML and retriggered the same governed request. Its merge at `69d7abb7d3236616b687cbed480e7584ceb69fc9` created run `33265434110`, which executed the actual 20-sample Q7 soak and uploaded the evidence artifact.

The first Q7 soak then exposed a new generic Assessment Item provider-contract class. Under the Reliability Qualification Standard, that correctly reopened Q1–Q6 before another live soak could be attempted.

The subsequent Assessment Item correction is deliberately provider-free. It does not alter the first-run evidence and does not trigger another live Q7 run. Instead it repairs the reusable boundary and restores Q1–Q6 PASS so that a fresh Q7 request may be made separately after merge to approved `main`.

## Canonical runtime and entry point

Q7 continues to use:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`.

Supported trigger modes remain:

- manual `workflow_dispatch`; and
- a push to approved `main` that changes the dedicated governed request path `content-factory/reliability-v2-e-live-worker-soak-request.json` within the workflow path filter.

The workflow is deliberately separate from `.github/workflows/content-factory-live-pilot.yml`. The full-course workflow remains fail closed unless the machine-readable reliability state is later restored to `qualified` through the separate Q8 transition.

## Governed safety envelope

For a push-triggered soak, the workflow validates before any provider call that the request declares:

- gate `Q7`;
- run class `bounded_live_worker_soak`;
- status `requested`;
- maximum spend exactly US$5;
- `fullCourseAssembly: false`; and
- `learnerPublication: false`.

The live workflow also verifies before provider execution that:

- Q1–Q6 are PASS in `content-factory/reliability-qualification.json`;
- Q7 is `pending`;
- global qualification remains `paused`;
- `qualifiedEvidence` remains null; and
- `livePilotEligible` remains false.

The post-Q7 correction restores that provider-free gate state but deliberately does not change the request file. Therefore merging the correction cannot itself start paid provider execution.

## First-run sample design and result

The governed first-run sample set was exactly 20 independent live worker outputs across all five required subject shapes:

| Subject shape | Assessment Item | Marking Pack | Total |
| --- | ---: | ---: | ---: |
| quantitative / business / economics | 2 | 2 | 4 |
| mathematics | 2 | 2 | 4 |
| science | 2 | 2 | 4 |
| essay / humanities | 2 | 2 | 4 |
| language / prescribed text | 2 | 2 | 4 |
| **Total** | **10** | **10** | **20** |

Observed first-run outcome:

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

The seven controlled failures remain historically classified as one reusable engineering contract class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Across all five governed subject shapes, live Assessment Item candidates omitted one or more required subquestion-level values:

- `subquestions[].maxMark`;
- `subquestions[].requirementIds`;
- `subquestions[].coverageEvidence` or its required locator fields.

This was not the same as the compiler-owned top-level target fields. Revision already derives top-level `componentId`, `questionFamilyId`, `requirementIds`, `format` and `maxMark` from governed Assessment Item policy inputs.

The first-run weakness was that the provider schema required all subquestion educational structure before the later Assessment Item validation/repair layer could inspect it. Omitted fields therefore failed too early for complete diagnostics and the single targeted repair.

The repeated cross-shape pattern demonstrated a generic provider-contract weakness rather than seven independent subject-specific educational findings.

All ten Marking Pack samples were accepted. The soak did not expose a new generic Marking Pack class.

## Post-Q7 Assessment Item correction

The corrected Assessment Item boundary follows the same compiler-first reliability model without inventing educational judgement.

The implementation now:

1. uses an Assessment Item-specific parseable provider candidate schema that admits only the bounded repairable omission class and semantically empty optional units;
2. normalizes only semantically empty optional units;
3. collects complete diagnostics for missing subquestion `maxMark`, `requirementIds` and `coverageEvidence` structure;
4. permits at most one validator-directed repair;
5. strictly recompiles the whole item, including deterministic top-level target fields;
6. applies the existing command/demand and output-integrity guards;
7. fails closed if any required structure or educational contract defect remains.

Subquestion mark allocation, requirement mapping and evidence mapping remain targeted-repair eligible because those values can encode educational meaning. The compiler does not fabricate them merely to satisfy schema shape.

The shared OpenAI structured-worker client is not weakened for other workers. Marking Pack continues to use its existing compiler-first v2 boundary.

Durable Assessment Item semantics advance to `2+output-integrity-v3`, invalidating Assessment Item output and genuine downstream dependants while preserving unrelated Learn/Practice reuse.

## Provider-free Q1–Q6 requalification

Current evidence is `content-factory/reliability-post-q7-assessment-item-requalification.json`.

The corrected boundary records:

- Q1 PASS — ownership deliberately separates deterministic top-level target fields from repair-eligible subquestion educational structure;
- Q2 PASS — the Q7 omission class is retained as a clearly labelled synthetic reproduction because raw provider output was not durably retained;
- Q3 PASS — omitted and simultaneous subquestion structure is exercised across all five governed subject shapes, including successful repair and fail-closed repair failure;
- Q4 PASS — the corrected boundary composes with the full deterministic provider-free pipeline through `expert_review_ready` with no publication;
- Q5 PASS — only Assessment Item and genuine downstream dependencies are semantically invalidated;
- Q6 PASS — the corrected five-shape boundary and deterministic pipeline are repeated three times provider-free with varied governed ordering.

No provider calls or paid reliability spend are used by this requalification.

## Spend review

The first completed v2 live-worker soak triggered the review required by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

Observed first-run evidence:

- configured ceiling: US$5;
- known usage cost: US$0.423906;
- unpriced sample count: 0;
- ceiling utilisation: 8.47812%.

Decision: **retain the existing US$5 Q7 ceiling**. The 20-sample exercise was well inside the ceiling and provides no evidence that a higher limit is necessary. This is a review outcome, not a change to normative cost authority.

## Rights and publication position

Every Q7 sample uses invented subject-shape facts and `Synthetic Reliability Board` identity. The harness supplies no awarding-body source prose, past-paper wording, prescribed-text excerpts or real learner course.

The first run performed:

- no full-course assembly;
- no learner publication;
- no educational benchmark approval;
- no Q8 eligibility transition.

The post-Q7 correction likewise performs no paid provider execution, course assembly or publication.

## Evidence retention

The first Q7 workflow artifact contained per-sample:

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

Those sample records, the workflow/head/artifact binding, aggregate counts, cost review and first-run classification remain persisted in `content-factory/reliability-v2-e-q7-live-soak-evidence.json`.

The reusable Q7 Assessment Item defect is separately retained in `content-factory/reliability-q7-assessment-item-contract-defect.json`, including the explicit statement that its provider-free replay is a synthetic reproduction rather than verbatim historical output.

## Current machine-readable position

After the post-Q7 correction:

- Q1–Q6 are `pass`;
- Q7 is `pending`;
- `status` remains `paused`;
- `qualifiedEvidence` remains null;
- `livePilotEligible` remains false;
- current provider-free qualification evidence points to `content-factory/reliability-post-q7-assessment-item-requalification.json`;
- first-run Q7 failure evidence remains retained for history.

This state is intentionally sufficient for a **future bounded Q7 soak only** once present on approved `main`. It does not authorize Q8 or a full-course pilot.

## Next work

The next reliability action is a separate governed request for a fresh bounded Q7 soak on the corrected approved-main implementation.

That soak must retain the existing safety envelope and sample breadth. If it exposes a new generic engineering contract class, the affected provider-free gates reopen again. If it passes, a short evidence PR may record Q7 PASS while keeping overall status paused and `livePilotEligible:false`.

Only after Q7 PASS may the separate V2-F/Q8 eligibility transition be proposed. Pilot #19 must not run before Q8 merges.

## Documentation impact

No normative authority change is required. The observed first-run failure and the post-Q7 correction are both handled by the active Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy.

This record and the indexed `Content Factory Reliability Qualification Harness.md` are updated because current implementation/evidence state changed materially. `content-factory/reliability-qualification.json` and its tests are updated in the same governed change.

Historical Pilot #1–#18 records, original V2-D qualification evidence and first-Q7 live evidence remain unchanged and historically accurate. `INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and Reliability Qualification Harness remain the canonical indexed locations.
