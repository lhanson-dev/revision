# Content Factory Reliability v2-E Live Worker Soak

## Status

**Four bounded Q7 live-worker soaks are now durably recorded.**

Attempts 1 and 2 exposed generic Assessment Item engineering contract classes and were corrected through the governed Q1–Q6 reset path. Attempt 3 then passed after four controlled educational/semantic fail-closed samples were classified as correctly rejected rather than new engineering classes.

After Confirmation Pilot #19 later exposed the separate `assessment_mcq_cognitive_demand_lexical_overconstraint` class, Revision repeated Q1–Q6 and ran a new post-Pilot #19 Q7 soak.

**Attempt 4 accepted all 20 governed samples. Post-Pilot #19 Q7 is PASS.**

The Content Factory remains **paused for paid full-course confirmation execution**. Q7 PASS does not restore production eligibility: V2-F/Q8 remains a separate governed eligibility transition.

Active authority:

`80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0

Cost authority:

`60-business-operations/Content Factory Bootstrap Cost Strategy.md`

## Canonical runtime

Q7 uses:

- `.github/workflows/content-factory-live-worker-soak.yml`;
- `src/content-factory/live-worker-soak.integration.test.ts`;
- production `createOpenAIModelAssistedWorkers` Assessment Item and Marking Pack boundaries;
- governed request file `content-factory/reliability-v2-e-live-worker-soak-request.json`.

Each soak is:

- limited to 20 live worker samples;
- spread across all five governed subject shapes;
- 10 Assessment Item + 10 Marking Pack samples;
- based on synthetic/rights-safe structured inputs;
- executed through the production compiler/validator/bounded-repair path;
- run with provider retries disabled;
- capped at US$5;
- prohibited from full-course assembly and learner publication.

Marking Pack samples use deterministic synthetic valid assessment inputs so Marking Pack reliability coverage does not depend on a preceding live Assessment Item sample succeeding.

## Execution history

### Attempt 1 — run `33265434110` / #16

Approved main:

`69d7abb7d3236616b687cbed480e7584ceb69fc9`

Observed:

- 20/20 executed;
- 13 accepted;
- 7 controlled fail-closed;
- 9 targeted repairs;
- known provider cost US$0.423906.

Generic engineering class:

`assessment_subquestion_required_structure_omission_before_targeted_repair`

Result: **FAIL**. The reusable class was corrected and Q1–Q6 were requalified provider-free.

Historical attempt-1 evidence remains unchanged.

### Attempt 2 — run `33282967568` / #17

Approved main:

`f0554a7cc8d4fa5f4a7abaf2224c56ee1d553ac9`

Observed:

- 20/20 executed;
- 17 accepted;
- 3 controlled fail-closed;
- 15 targeted repairs;
- known provider cost US$0.455962.

Generic engineering class:

`assessment_subquestion_coverage_requirement_cross_reference_mismatch_after_targeted_repair`

Result: **FAIL**. Revision removed duplicated provider ownership of subquestion requirement IDs, derived the final relationship from validated coverage evidence, and requalified Q1–Q6.

Historical attempt-2 evidence remains unchanged.

### Attempt 3 — run `33364521121` / #18

Approved main:

`9755c7a40d5e61b76a49e51480e7c5403642e593`

Artifact:

- ID `9747914357`;
- digest `sha256:1a09cb3242faa1ace9816187ce3b2895bd191c1f9801e846047cd3ba57146d96`.

Observed:

- 20/20 executed;
- 16 accepted;
- 4 controlled fail-closed;
- Assessment Item 8/10 accepted;
- Marking Pack 8/10 accepted;
- 12 targeted repairs;
- zero infrastructure incidents;
- zero engineering-boundary breaches;
- known provider cost US$0.432952.

The four controlled fail-closed samples were classified against the Q1 ownership inventory as genuine educational/semantic failures handled by the intended deterministic boundary. No new generic engineering class had appeared.

Result: **historical PASS**.

Durable evidence:

`content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`

That PASS remains historically true. Pilot #19 subsequently exposed a different class and required a new qualification cycle.

### Attempt 4 — post-Pilot #19 run `33395187056` / #19

Approved main:

`02fbccbd1979460b63f3e0ee7f85ee2d1fede3c9`

Artifact:

- ID `9759214890`;
- name `content-factory-live-worker-soak-02fbccbd1979460b63f3e0ee7f85ee2d1fede3c9`;
- digest `sha256:bae4232a51535614ba6ad7bd7e7d4a85b177f7aa5d45136c0b3026e8ad08178e`;
- recorded at `2026-08-31T13:12:42.573Z`.

Observed:

- 20/20 planned samples executed;
- **20 accepted**;
- **0 controlled fail-closed**;
- Assessment Item **10/10 accepted**;
- Marking Pack **10/10 accepted**;
- 8 targeted repairs observed;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- provider/model `openai` / `gpt-5.6-terra`;
- Assessment Item contract version 5;
- Marking Pack contract version 4;
- known provider cost **US$0.384316**;
- unpriced samples 0;
- full-course assembly false;
- learner publication false.

### Attempt-4 shape coverage

Assessment Item coverage explicitly included:

- quantitative/business/economics: `knowledge_mcq`;
- quantitative/business/economics: `application_mcq`;
- mathematics: calculation;
- science: analysis;
- science: interpretation;
- essay/humanities: evaluation;
- language/prescribed-text: analysis.

All five shapes also included two independent Marking Pack samples.

This is the live-provider coverage deliberately added after Pilot #19.

## Attempt-4 repair evidence

Eight samples exercised the production single-targeted-repair path.

Because provider retries were disabled, an additional provider call represents the bounded validator-directed repair path rather than an infrastructure retry.

Every repaired artifact then passed whole-artifact revalidation.

No sample required a second repair, no sample escaped an engineering boundary, and no controlled fail-closed classification was required.

This demonstrates the intended Reliability v2 objective under live provider variability:

`valid artifact or truthful fail closed without engineering intervention`

In attempt 4 every sampled artifact reached the valid-artifact outcome.

## Q7 decision

Attempt 4 exposed:

- no recurrence of the first Q7 omission-before-repair class;
- no recurrence of the second Q7 requirement cross-reference class;
- no recurrence of the Pilot #19 MCQ cognitive-demand lexical-overconstraint class;
- no new generic engineering/provider-contract class;
- no infrastructure incident;
- no engineering-boundary breach;
- correct use of the single bounded repair;
- successful whole-artifact revalidation;
- all 20 governed samples accepted.

The artifact itself reported:

- `automaticQ7PassCandidate: true`;
- `requiresEngineeringVsEducationalClassification: false`.

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

**Q7 PASS.**

No Q1–Q6 reset is required from attempt 4.

## Cost position

Known spend by Q7 attempt:

- attempt 1: US$0.423906;
- attempt 2: US$0.455962;
- attempt 3: US$0.432952;
- attempt 4: US$0.384316.

Cumulative known Q7 spend:

**US$1.697136**

Attempt 4 used **7.68632%** of the governed US$5 ceiling.

Decision: **retain the US$5 per-soak ceiling**.

## Machine-readable position and next work

`content-factory/reliability-qualification.json` now records:

- Q1–Q7 `pass`;
- `status: paused`;
- current `q7PassEvidence: content-factory/reliability-v2-e-q7-live-soak-evidence-004.json`;
- historical previous Q7 PASS retained in `q7PassEvidenceHistory`;
- `qualifiedEvidence: null`;
- `livePilotEligible: false`.

The next reliability step is **V2-F/Q8 — the separate governed eligibility transition**.

Q8 may restore `qualified` / `livePilotEligible` only through its own exact-head-assured, Founder-approved PR.

This Q7 evidence PR:

- makes no provider call;
- does not modify the governed Q7 request file;
- cannot trigger another paid soak;
- does not assemble a course;
- does not publish learner content;
- does not restore Q8.

## Evidence

Current attempt-4 durable repository evidence:

`content-factory/reliability-v2-e-q7-live-soak-evidence-004.json`

Historical attempt-3 PASS evidence remains:

`content-factory/reliability-v2-e-q7-live-soak-evidence-003.json`

Attempts 1 and 2 remain preserved as historical failure evidence.

## Documentation impact

No normative authority change is required. Reliability Standard v2.0 already defines:

- the Q7 bounded live worker soak;
- the distinction between educational rejection and a new engineering contract class;
- the US$5 bounded execution envelope;
- the requirement for a separate Q8 eligibility transition.

This update adds append-only attempt-4 evidence and updates the current Q7 technical record, machine-readable qualification state and executable assurance.

Historical Q7 evidence, Pilot #19 evidence and earlier Q8 evidence are not rewritten.

`INDEX.md` remains correct because the Reliability Qualification Standard and Reliability Qualification Harness are already the indexed canonical sources.
