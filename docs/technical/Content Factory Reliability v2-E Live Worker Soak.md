# Content Factory Reliability v2-E Live Worker Soak

## Status

**Two bounded Q7 live-worker soaks have completed and neither passed. The second-run generic Assessment Item cross-reference class now has a provider-free correction under exact-head Q1–Q6 requalification. No further Q7 soak is eligible until that requalification is green, merged under Founder approval, and a separate governed Q7 request is deliberately created.**

The active authority remains `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0. The US$5 per-soak guardrail remains governed by `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

The Content Factory remains paused for full-course live execution. Q8 is blocked, `qualifiedEvidence` remains null and `livePilotEligible` remains false.

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

This is a **generic Assessment Item engineering/provider-contract class** because the same deterministic cross-reference failed repeatedly across two materially different governed subject shapes, survived the one permitted repair, and was not caused by infrastructure or a subject-specific educational finding.

The prior first-Q7 omission-before-repair class did **not** recur. All ten Marking Pack samples passed.

The raw failed provider candidates were not retained, so the permanent defect record `content-factory/reliability-q7-002-assessment-item-cross-reference-defect.json` truthfully labels its executable replay as a synthetic reproduction.

## Corrected ownership boundary

Q1 found that the failed contract asked the model to author the same mechanical requirement-ID relationship twice:

- once in `subquestions[].requirementIds`;
- once in `subquestions[].coverageEvidence[].requirementId`.

That design was brittle. A targeted repair cannot make duplicated clerical authorship reliable enough when one side can be compiled from the other without inventing educational meaning.

The corrected boundary therefore keeps the model responsible for the educational judgement: which governed requirement an exact learner-facing excerpt evidences. Revision then derives the duplicated `subquestions[].requirementIds` representation from those validated evidence mappings.

Strict checks remain in force for:

- exact governed requirement coverage;
- duplicate evidence mappings;
- unknown requirements;
- malformed identifiers;
- exact question excerpts;
- mark arithmetic;
- command/demand integrity;
- all other structured Assessment Item rules.

No second repair, broader retry loop or silent coercion has been added.

Assessment Item durable semantics advance to `2+output-integrity-v4`, invalidating Assessment Item and genuine downstream dependants while preserving unrelated Learn and Practice reuse.

## Provider-free Q1–Q6 requalification

The current record is `content-factory/reliability-post-q7-002-assessment-item-requalification.json`.

Provider-free evidence includes:

1. Q1 — explicit compiler/model/fail-closed ownership split;
2. Q2 — permanent synthetic replay of the second-Q7 signature;
3. Q3 — five-shape adversarial coverage for conflicting duplicate IDs, reordered evidence, duplicate/missing/unknown mappings and non-exact excerpts;
4. Q4 — deterministic full-pipeline composition to `expert_review_ready` with no provider usage or publication;
5. Q5 — `2+output-integrity-v4` dependency invalidation restricted to Assessment Item and genuine downstream closure;
6. Q6 — three repeated five-shape probes plus three deterministic pipeline runs.

Until exact-head CI completes successfully, these remain candidate-pass evidence. Q7 remains pending throughout.

## Cost position

Second-soak known usage was US$0.455962, or 9.11924% of the governed US$5 ceiling. Combined known spend across the two completed Q7 soaks is US$0.879868.

Decision: **retain the US$5 per-soak ceiling**. The failure is a contract-quality signal, not a budget-capacity signal. No cost-authority change is justified.

## Machine-readable position and next work

The active `content-factory/reliability-qualification.json` remains paused while exact-head Q1–Q6 assurance is incomplete. Q7 remains pending, `qualifiedEvidence` remains null and `livePilotEligible` remains false.

If and only if Q1–Q6 pass on the exact corrected head, this PR may record the provider-free PASS evidence. That still does not execute Q7. After merge, any later bounded Q7 soak must be authorized through a **separate governed request** against the corrected approved-main implementation.

Q8 and Pilot #19 remain blocked.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already governs return to Q1–Q6 after a new Q7 class, and the Bootstrap Cost Strategy already governs the spend response.

This implementation change updates this technical record, the Reliability Qualification Harness, machine-readable requalification evidence and assurance tests. Historical Pilot records, both Q7 live evidence records and the prior provider-free requalification record remain historically accurate and are not rewritten.

The governed Q7 request file is deliberately unchanged, so this PR cannot trigger another paid soak.

`INDEX.md` does not require a new entry because the existing Reliability Qualification Standard and Reliability Qualification Harness remain the canonical indexed sources.
