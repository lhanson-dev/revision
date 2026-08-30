# Content Factory Reliability v2-E Live Worker Soak

## Status

**Two bounded Q7 live-worker soaks have now completed. Neither passed. The second run exposed a different generic Assessment Item engineering contract class, so Q1–Q6 are reopened and no further Q7 soak is eligible until the affected provider-free gates pass again.**

The active authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The US$5 per-soak guardrail remains governed by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

The Content Factory remains paused for full-course live execution. Q8 is blocked, `qualifiedEvidence` remains null and `livePilotEligible` remains false.

## Canonical runtime

Q7 uses:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`;
- production `createOpenAIModelAssistedWorkers` Assessment Item and Marking Pack boundaries;
- the governed request file `content-factory/reliability-v2-e-live-worker-soak-request.json` for approved-main push execution.

Each soak is limited to 20 rights-safe synthetic worker samples across all five governed subject shapes, uses the production compiler/validator/repair code, performs no full-course assembly or learner publication, and is capped at US$5.

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

The first run exposed:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Live Assessment Item candidates across all five shapes omitted required subquestion `maxMark`, `requirementIds` and/or `coverageEvidence` structure before the then-existing repair boundary could inspect them. That reusable defect was corrected provider-free and Q1–Q6 were subsequently requalified.

Historical first-run evidence remains unchanged.

### Attempt 2 — run 33282967568 / run #17

Approved `main`: `f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9`.

Artifact:

- ID `9723581809`;
- name `content-factory-live-worker-soak-f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9`;
- digest `sha256:b351f24be35d23b8dbecc78ba0cbf0228cac314cd20adfab2bf38dd19199d21b`.

Durable repository evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-002.json`.

Observed:

- 20/20 planned samples executed;
- 17 accepted;
- 3 controlled fail-closed;
- Assessment Item 7/10 accepted;
- Marking Pack 10/10 accepted;
- 15 targeted repairs observed;
- 0 infrastructure incidents;
- 0 escaped engineering-boundary exceptions;
- provider/model `openai` / `gpt-5.6-terra`;
- known provider cost US$0.455962;
- unpriced samples 0;
- full-course assembly false;
- learner publication false.

Normal repository CI and deployment passed on the same approved `main`; the failure was confined to the governed live reliability soak.

## Second-run defect classification

The second run exposed:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

Three live Assessment Item samples failed closed:

- `essay_humanities-assessment_item_generation-1`;
- `essay_humanities-assessment_item_generation-2`;
- `language_prescribed_text-assessment_item_generation-1`.

In each sample, the subquestion declared `requirementIds` whose set did not exactly match the `requirementId` values represented in `coverageEvidence`. The deterministic structured-assessment validator detected the mismatch on the initial candidate, sent it through the single permitted complete-diagnostic targeted repair, and detected the same mismatch again after repair.

This is classified as a **new generic Assessment Item engineering/provider-contract class** because:

- the same deterministic cross-reference contract failed repeatedly;
- it occurred across two materially different governed subject shapes;
- it survived the one permitted repair;
- there was no infrastructure incident;
- it is not a subject-specific educational judgement that happened to be rejected correctly.

The prior first-Q7 omission-before-repair class did **not** recur. The v4 Assessment Item boundary successfully admitted candidates to complete diagnostics and exercised bounded repair. This second failure therefore narrows the next reliability problem rather than invalidating the earlier correction.

All ten Marking Pack samples passed, so no new Marking Pack contract class was exposed.

## Ownership implication for the next correction

The second failure concerns a duplicated cross-reference between two model-authored structures: subquestion `requirementIds` and `coverageEvidence[].requirementId`.

The Reliability Standard requires Q1 to challenge whether mechanically provable references can move to compiler ownership. The next provider-free correction must therefore determine the smallest reusable representation that preserves the model's genuine educational judgement about **which requirement an excerpt evidences** while removing unnecessary duplicated clerical authorship where possible.

This evidence/reset change does not pre-decide that implementation. It records the defect and reopens Q1–Q6 so ownership, replay, mutation, composition, dependency and repeated-stability evidence are all re-established before another live soak.

Because the raw provider candidates were not retained in the soak artifact, Q2 must use a clearly labelled **synthetic reproduction** of the durable mismatch signature rather than claim exact historical replay.

## Cost position

Second-soak known usage was US$0.455962, or 9.11924% of the governed US$5 ceiling. Combined known spend across the two completed Q7 soaks is US$0.879868.

Decision: **retain the US$5 per-soak ceiling**. The failure is a contract-quality signal, not a budget-capacity signal. No cost-authority change is justified.

## Current machine-readable position

`content-factory/reliability-qualification.json` now records:

- Q1–Q6 `pending`;
- Q7 `pending`;
- `status: paused`;
- `providerFreeQualificationEvidence: null`;
- the previous provider-free PASS record retained as `lastProviderFreeQualificationEvidence`;
- the second Q7 evidence as the current `q7FailureEvidence`;
- both Q7 failure records in `q7FailureEvidenceHistory`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

This state blocks both another Q7 soak and any full-course live pilot until the governed prerequisites are deliberately restored.

## Next work

The next reliability work is provider-free:

1. Q1 — review Assessment Item requirement/evidence ownership and remove unnecessary duplicated mechanical authorship where educational meaning can be preserved;
2. Q2 — add a labelled synthetic reproduction of the second Q7 mismatch class;
3. Q3 — add five-shape adversarial and simultaneous cross-reference mutations;
4. Q4 — prove the corrected Assessment Item boundary composes with the deterministic full pipeline;
5. Q5 — prove dependency-aware invalidation for the semantic change;
6. Q6 — repeat the corrected provider-free qualification under varied governed ordering;
7. only after those gates PASS on approved `main`, use a separate governed request for any later Q7 live soak.

Q8 and Pilot #19 remain blocked.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already requires a return to affected Q1–Q6 gates when Q7 exposes a new generic contract class, and the Bootstrap Cost Strategy already governs the spend response.

This technical record, the Reliability Qualification Harness, the live-soak plan, the machine-readable qualification state and assurance tests are updated because current implementation/evidence state changed materially. Historical Pilot records, first-Q7 evidence and the prior provider-free requalification record remain historically accurate and are not rewritten.

`INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and Reliability Qualification Harness remain the canonical indexed sources.
