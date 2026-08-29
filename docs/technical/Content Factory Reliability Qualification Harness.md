# Content Factory Reliability Qualification Harness

## Status

The Content Factory remains **paused for full-course live execution**.

Reliability v2 has progressed through:

- V2-A — compiler-first Marking Pack hardening and complete diagnostics;
- V2-B — historical failure replay corpus;
- V2-C — adversarial provider-free mutation matrix;
- V2-D — initial provider-free Q1–Q6 qualification;
- V2-E — bounded Q7 live-worker soak, Q7 defect correction and post-Q7 provider-free requalification.

The first completed Q7 live soak ran on approved `main` `69d7abb7d3236616b687cbed480e7584ceb69fc9` as workflow run `33265434110` / run number `16`. It executed all 20 governed samples and exposed one new generic Assessment Item provider-contract class. Q7 therefore did not pass.

Durable Q7 failure evidence remains:

- `content-factory/reliability-v2-e-q7-live-soak-evidence.json`

The post-Q7 correction now preserves educational ownership of subquestion `maxMark`, `requirementIds` and `coverageEvidence`, but allows omission of those fields to cross only the first provider-candidate boundary so the existing complete diagnostics and one bounded targeted repair can operate. Strict whole-item validation still decides acceptance, and Revision does not invent missing educational structure.

Provider-free Q1–Q6 are requalified against that corrected boundary through:

- `content-factory/reliability-v2-e-assessment-item-contract-repair.json`;
- `content-factory/reliability-v2-e-q7-assessment-item-contract-replay.json`;
- `content-factory/reliability-v2-e-q7-assessment-item-adversarial-matrix.json`;
- `content-factory/reliability-v2-e-post-q7-provider-free-requalification.json`.

Current machine-readable candidate state restores Q1–Q6 to `pass`, keeps Q7 `pending`, keeps `status: paused`, keeps `qualifiedEvidence: null` and keeps `livePilotEligible: false`. The final PR head must pass exact-head Revision CI before that state may merge.

The active governing authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. Q8 remains unavailable until a later Q7 PASS.

## Historical trigger and evidence preservation

Confirmation Pilot #18 remains the historical trigger for Reliability v2 and is not rewritten:

- approved content head: `ed3bd4c4a50dd723da38952a41ff9bad084ad68d`;
- workflow run: `33239396439` / run number `18`;
- durable job: Issue `#234`;
- failure class: generic Marking Pack operational-rubric provider-contract weakness after targeted repair;
- cumulative provider spend: `US$1.253632`;
- nothing was published.

V2-D remains historical evidence that Q1–Q6 passed on its then-current implementation. The first Q7 live result did not rewrite that history; it exposed a new live-provider class that required a fresh provider-free qualification against the corrected Assessment Item boundary.

Historical V2-B, V2-C and V2-D records are unchanged. The Q7 class is carried as supplemental evidence rather than inserted retrospectively into earlier records.

## Reliability v2 objective

The factory should behave like a compiler boundary around variable model output:

`model educational judgement → compiler-owned structure → complete deterministic diagnostics → at most one targeted repair → whole-artifact revalidation → valid artifact or fail closed`

The target is not perfect first-pass model output. Expected model variability should not require an engineer to change TypeScript, schemas or prompts between ordinary courses.

## Post-Q7 Assessment Item correction

### Ownership decision

Top-level governed Assessment Item target fields remain compiler-owned where a policy exists:

- `componentId`;
- `questionFamilyId`;
- `requirementIds`;
- `maxMark`;
- `format`.

The Q7 omissions occurred inside generated subquestions. The post-Q7 Q1 review classifies:

- `subquestions[].maxMark` as `generative_judgement` because the mark split between educational subquestions carries assessment meaning;
- `subquestions[].requirementIds` as `bounded_locator_reference` because the provider may select only governed requirement IDs and Revision can validate exact coverage;
- `subquestions[].coverageEvidence` as `bounded_locator_reference` because the provider identifies exact learner-facing evidence excerpts and Revision can verify their binding.

All three are `targeted_repair_eligible` when missing. Compiler defaulting is prohibited because silently inventing them could change educational meaning.

### Production boundary

The corrected production chain adds:

- `src/content-factory/openai-assessment-item-contract-boundary.ts`.

That boundary relaxes only **presence** of the three Q7 fields at the first provider-candidate parse. Supplied values retain their normal type constraints. The candidate then reaches the existing:

- `src/content-factory/openai-assessment-integrity-compiler.ts`.

That compiler performs complete strict diagnostics, may make exactly one targeted repair, and revalidates the complete Assessment Item. If the repair remains incomplete or invalid, the item fails closed.

The Assessment Item durable semantic boundary advances from `2+output-integrity-v2` to `2+output-integrity-v3`. This invalidates Assessment Item and genuine downstream Marking Pack/review/remediation outputs while leaving Learn and Practice reusable.

## Qualification sequence

### Q1 — compiler/worker ownership inventory — PASS candidate

Evidence combines the historical V2-D ownership consolidation with the post-Q7 Assessment Item ownership decision. The correction does not transfer educational subquestion meaning to deterministic defaults.

### Q2 — historical failure replay corpus — PASS candidate

The V2-B corpus retains its 19 historical defect classes unchanged. Q7 adds one supplemental class:

`assessment_item_subquestion_structure_provider_contract`

The live artifact retained sample-level failure signatures but not raw provider candidates, so the permanent replay is explicitly a **synthetic reproduction** of the observed omission class rather than falsely described as exact historical output.

Combined known classes: 20.

### Q3 — adversarial provider-free subject matrix — PASS candidate

The existing V2-C matrix remains unchanged: 12 mutation classes × five governed subject shapes = 60 historical cases per repetition.

The post-Q7 supplement adds four Assessment Item omission classes across all five shapes:

- missing subquestion `maxMark`;
- missing subquestion `requirementIds`;
- missing subquestion `coverageEvidence`;
- simultaneous omission of all three.

That adds 20 mutation cases per repetition, plus five valid/no-repair controls and five fail-closed-after-one-repair controls. The regression is `src/content-factory/openai-assessment-item-contract-boundary.test.ts`.

### Q4 — deterministic full-pipeline simulation — PASS candidate

The existing deterministic full-pipeline simulation remains green with zero provider calls. The corrected Assessment Item boundary is independently proved through valid, repaired and fail-closed paths so the pipeline result is not obtained by bypassing the changed boundary.

### Q5 — restart/reuse dependency invalidation — PASS candidate

Current Assessment Item semantic version:

`2+output-integrity-v3`

Affected outputs are Assessment Item and genuine downstream dependants:

- `generateAssessmentItem`;
- `generateMarkingPack`;
- `independentReview`;
- `remediate`.

Learn and Practice remain reusable because they do not depend on Assessment Item generation.

### Q6 — repeated provider-free stability — PASS candidate

The affected provider-free suite, including the supplemental Q7 replay and five-shape omission matrix, is rerun under three governed shuffle seeds:

- `17`;
- `73`;
- `149`.

The durable record is `content-factory/reliability-v2-e-post-q7-provider-free-requalification.json`. Final exact-head CI is the required assurance for the merged PASS claim.

### Q7 — bounded live worker soak — pending

The first Q7 run remains a recorded failure, not converted into a pass by the provider-free correction.

Canonical Q7 runtime remains:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`.

A fresh bounded live-worker soak may be requested only after this provider-free correction is approved and merged to `main`. PR #245 itself does not change `content-factory/reliability-v2-e-live-worker-soak-request.json`, so it does not trigger a paid soak.

### Q8 — eligibility transition — blocked

Q8 remains a separate governed transition. Only after a later Q7 PASS may a separate PR restore:

- `status: qualified`;
- `livePilotEligible: true`;
- exact full Reliability v2 evidence binding;
- next paid run class `confirmation_pilot`.

Pilot #19 must not run before Q8 merges.

## First Q7 live-soak result

The governed run was workflow `33265434110`, artifact `9718558827`, provider/model `openai` / `gpt-5.6-terra`.

Sample envelope:

- 20/20 planned samples executed;
- all five subject shapes;
- 10 Assessment Item samples;
- 10 Marking Pack samples;
- production worker/compiler/validator/repair code;
- transport retries disabled;
- no full-course assembly;
- no learner publication.

Observed result:

- 13 accepted;
- 7 controlled fail-closed;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- 9 targeted repairs observed;
- Assessment Item: 3/10 accepted;
- Marking Pack: 10/10 accepted;
- known measured cost: US$0.423906;
- unpriced sample count: 0.

The seven Assessment Item failures crossed all five subject shapes and repeatedly omitted subquestion-level `maxMark`, `requirementIds` and/or `coverageEvidence` before the then-current provider schema could reach the targeted-repair stage.

## Cost review after first completed v2 soak

The Bootstrap Cost Strategy requires a review after the first completed v2 live-worker soak.

Observed:

- ceiling: US$5;
- known measured usage: US$0.423906;
- utilisation: 8.47812%;
- sample coverage: 20/20;
- unpriced sample count: 0.

Decision: **retain the US$5 Q7 ceiling**. No normative cost-authority change is required.

## Current machine-readable state

`content-factory/reliability-qualification.json` on the correction branch is prepared as:

- `status: paused`;
- Q1–Q6: `pass` through the new post-Q7 provider-free evidence;
- Q7: `pending`;
- `q7FailureEvidence: content-factory/reliability-v2-e-q7-live-soak-evidence.json` retained;
- `providerFreeQualificationEvidence: content-factory/reliability-v2-e-post-q7-provider-free-requalification.json`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

This state is not merge-authoritative until the final PR head passes exact-head Revision CI and receives explicit Founder approval.

## Next work after merge

If PR #245 merges with exact-head assurance, the next governed task is a **new bounded Q7 live-worker soak** using the same safety envelope:

- five subject shapes;
- at least 20 live outputs;
- Assessment Item and Marking Pack boundaries;
- production compiler/validator/bounded repair;
- US$5 hard ceiling;
- no course assembly;
- no learner publication.

A new generic engineering contract class would fail Q7 and reopen the affected provider-free gates again. Genuine educational fail-closed findings must be classified under the Reliability Standard rather than automatically treated as engineering failure.

## Documentation impact

No normative authority change is required. The Reliability Qualification Standard v2.0 and Bootstrap Cost Strategy already define the response to the Q7 finding.

Implementation changes are documented here and in the V2-E live-worker-soak technical record. Historical Pilot #1–#18 and V2-A–V2-D evidence remain unchanged. `INDEX.md` does not require a new entry because this remains the indexed technical source for Content Factory reliability qualification.

There is no learner-facing product change in this correction.
