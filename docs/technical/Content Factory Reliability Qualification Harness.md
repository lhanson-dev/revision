# Content Factory Reliability Qualification Harness

## Status

The Content Factory has completed the post-Confirmation-Pilot #21 Reliability v2.0 qualification sequence through Q8 on this governed branch.

- Post-Pilot #21 Q1–Q6 provider-free requalification: **PASS**.
- Post-Pilot #21 Q7 candidate-aware bounded live-worker soak attempt 007: **PASS**.
- Q8 confirmation-pilot eligibility: **restored by this separate governed repository-state transition once merged**.
- Machine state after Q8: **`qualified`**.
- `livePilotEligible` after Q8: **`true`**.
- Next paid run class: **`confirmation_pilot`**.
- The next paid execution is a **resume of Pilot #21**, not a new course.
- Q8 itself performs **no provider call, content generation, course assembly or learner publication**.
- Content Factory maturity remains **not achieved**.

Active authority: `80-company-workflows/Content Factory Reliability Qualification Standard.md` v2.0.

Cost authority: `60-business-operations/Content Factory Bootstrap Cost Strategy.md`.

Current machine-readable state: `content-factory/reliability-qualification.json`.

Current Q8 evidence: `content-factory/reliability-v2-f-q8-eligibility-004.json`.

Current Q7 PASS evidence: `content-factory/reliability-v2-e-q7-live-soak-evidence-007.json`.

Current provider-free Q1–Q6 evidence: `content-factory/reliability-post-pilot21-q1-q6-requalification.json`.

Pilot #21 defect classification: `content-factory/reliability-pilot21-question-wording-ownership-defect.json`.

Pilot #21 implementation note: `docs/technical/Content Factory Pilot 21 Question Wording Ownership Remediation.md`.

Candidate-recovery architecture decision: `decisions/ADR-0019-content-factory-candidate-recovery.md`.

No educational assurance requirement is lowered by Q8. `80-company-workflows/Content Accuracy Assurance Gate.md` remains the authority for trusted learner content.

## Reliability objective

The reliability target is not provider first-pass perfection. A generated output is a candidate until it passes the governed compiler, deterministic checks and educational controls.

The production target remains:

`deterministic production slot → generated candidate → complete diagnostics → accept or reject → bounded automatic recovery → freeze accepted artifact → dependent generation/assurance → expert_review_ready`

Two invariants remain hard requirements:

1. **Reject candidates, not required curriculum slots.** A rejected candidate cannot satisfy required coverage.
2. **Preserve accepted work.** A downstream or changed-contract invalidation must not regenerate unrelated valid artifacts merely because the implementation head changed.

Qualification establishes permission to execute the next governed paid run. It does not establish educational correctness, expert approval, publication readiness or maturity.

## Historical reliability sequence

Historical records are append-only and remain unchanged.

### Confirmation Pilot #19

Pilot #19 exposed the generic Assessment Item contract class:

`assessment_mcq_cognitive_demand_lexical_overconstraint`

The factory returned to `paused`, corrected the affected generic boundary, repeated the required Reliability v2 qualification, and later restored eligibility through a separate Q8 transition.

### Confirmation Pilot #20

Pilot #20 exposed the generic candidate-recovery architecture class:

`assessment_candidate_recovery_and_complete_diagnostic_architecture_failure`

The run demonstrated that a rejectable Assessment Item candidate could become a course-level blocker before the production path had complete diagnostics and durable bounded candidate recovery.

ADR-0019 records the resulting architecture. The production path subsequently gained complete diagnostics, bounded Assessment Item recovery, durable Assessment Item slot/candidate state, durable Marking Pack recovery and required-coverage reconciliation before course-pack acceptance.

Post-Pilot #20 Q1–Q7 and Q8 evidence remains historical truth, including:

- `content-factory/reliability-post-pilot20-q1-q6-consolidation.json`;
- `content-factory/reliability-v2-e-q7-live-soak-evidence-006.json`;
- `content-factory/reliability-v2-f-q8-eligibility-003.json`.

Those records are no longer the current qualification lineage after Pilot #21.

## Confirmation Pilot #21 trigger

Confirmation Pilot #21 ran from approved `main`:

`c6d7e7b200be7886a3d9fb4cda530bbc604fb254`

Workflow run:

`33563478174`

Durable job:

Issue `#281`.

Workflow artifact:

- artifact ID `9822561947`;
- digest `sha256:57160072211ef18fcbd72f1b7eb6532743088c5f69eac8f02fa0f92291f8f618`.

Known course spend before the fail-closed stop was **US$0.7454**.

The run completed and banked:

- 13 Learn artifacts;
- 13 Practice artifacts.

It then stopped at the Assessment Item generation boundary and did not reach `expert_review_ready`.

### Generic defect class

Pilot #21 exposed:

`assessment_question_wording_duplicate_provider_authorship`

The effective provider contract required the model to author both:

- educational wording in `subquestions[].wording`; and
- a second top-level `questionWording` representation.

The compiler then required exact mechanical agreement between the two provider-authored representations. That duplicated clerical authorship was a generic engineering defect rather than an educational finding.

### Corrected ownership

The corrected Assessment Item boundary keeps educational subquestion wording as provider generative judgement but makes top-level `questionWording` deterministic compiler ownership.

Provider contract v9 therefore no longer asks the provider to author top-level `questionWording`. After validation, Revision composes that field from the validated subquestions in governed order with a stable blank-line separator while preserving each subquestion wording verbatim.

The correction did not weaken validation, increase the candidate ceiling, add retries, change source-rights policy or change the US$20 full-course spend ceiling.

The durable Assessment semantic boundary advanced to `output-integrity-v7`, invalidating Assessment Item outputs and genuine downstream dependants while leaving unrelated Learn and Practice artifacts valid.

## Post-Pilot #21 Q1–Q6 provider-free requalification

Canonical evidence:

`content-factory/reliability-post-pilot21-q1-q6-requalification.json`

The affected Reliability v2 gates are PASS:

- Q1 — compiler/worker ownership inventory;
- Q2 — historical failure replay, including Pilot #21;
- Q3 — adversarial provider-free subject matrix;
- Q4 — deterministic full-pipeline simulation;
- Q5 — restart/reuse/dependency invalidation;
- Q6 — repeated provider-free stability.

This evidence uses no paid provider calls and rewrites no historical record.

The Q5 evidence binds the durable Pilot #21 resume target to:

- job Issue `#281`;
- 13 completed Learn artifacts reusable;
- 13 completed Practice artifacts reusable;
- restart boundary `assessment_item_generation`;
- invalidated downstream work: Assessment Items, Marking Packs, independent review and remediation as required by the changed dependency closure.

A changed implementation head alone is not sufficient reason to regenerate the already accepted Learn or Practice artifacts.

## Q7 — bounded live-worker soak attempt 007

Q7 attempt 007 is the current decisive live qualification record.

Workflow evidence:

- workflow run `33672670696` / run number `22`;
- approved `main` `d8978f52c1069e25e543e8e6a142834a827ce36c`;
- artifact ID `9863319922`;
- digest `sha256:9069d0ea0c0b70abd78d9d97b686ff5cdd66c498caaa0b54481796a0a1cdff80`.

Outcome:

- 20 planned samples;
- 20 executed;
- 20 accepted;
- all five governed subject shapes covered;
- 10 Assessment Item samples accepted;
- 10 Marking Pack samples accepted;
- 10 bounded targeted repairs observed;
- 0 fresh candidate resamples required;
- 0 controlled fail-closed samples;
- 0 infrastructure incidents;
- 0 engineering-boundary breaches;
- complete provider-call classification;
- no full-course assembly;
- no learner publication.

Classification:

`q7_pass_no_new_generic_engineering_contract_class`

Known attempt-007 spend was **US$0.369562** against the governed US$5 soak ceiling.

Cumulative known Q7 spend through attempt 007 is **US$2.865858**.

Q7 itself correctly retained `livePilotEligible: false`; the Reliability Standard requires the separate Q8 state transition before another paid course execution may occur.

## Q8 — separate confirmation-pilot eligibility transition

Current record:

`content-factory/reliability-v2-f-q8-eligibility-004.json`

Q8 binds the post-Pilot #21 Q1–Q6 evidence and exact Q7 attempt-007 evidence to the current machine state:

- `status: qualified`;
- `livePilotEligible: true`;
- Q1–Q7 all `pass`;
- `qualifiedEvidence` points to Q8-004 and Q7-007;
- next paid run class `confirmation_pilot`.

Q8 is repository-state governance only. This transition:

- uses no provider call;
- does not dispatch the live-pilot workflow;
- does not resume Pilot #21;
- does not start a new course;
- does not assemble a course;
- does not publish learner content;
- does not rewrite historical evidence.

The paid live-pilot workflow remains explicit `workflow_dispatch` on `main`, and the reliability qualification preflight remains ahead of paid provider execution with no bypass.

## Next paid execution — resume Pilot #21

After Q8 is merged with explicit Founder approval, the next governed paid execution is the continuation of Pilot #21, not another new-course pilot.

The durable resume must use Issue `#281` and reuse the existing course lineage:

- existing source package;
- existing course model;
- existing blueprints;
- 13 banked Learn outputs;
- 13 banked Practice outputs.

The resume starts at the invalidated Assessment boundary.

Expected sequence:

1. replay and verify dependency fingerprints and recover the existing durable job;
2. reuse valid Learn and Practice artifacts without provider regeneration;
3. generate required Assessment Items under the corrected v9 wording-ownership contract;
4. generate Marking Packs from accepted frozen Assessment Items;
5. run A1–A4 independent educational assurance;
6. remediate educational findings where the governed remediation policy permits;
7. reconcile required coverage and reach `expert_review_ready`, or fail closed with explicit evidence.

No new course should be created for this confirmation run.

## Educational assurance boundary

Q8 and Reliability v2 answer an engineering question: whether another bounded paid production execution is permitted.

They do not answer whether the resulting course content is educationally correct or suitable for learners.

Pilot #21 must still satisfy the active Content Accuracy Assurance Gate. Independent A1–A4 review and any governed remediation occur before the course can reach `expert_review_ready`.

Human subject review remains a separate later approval boundary. Reaching `expert_review_ready` means the real course is ready for qualified human educational inspection; it does not mean publication is approved.

## Maturity and stop-loss

Content Factory maturity remains unachieved.

The active standard still requires three consecutive materially different real courses to reach `expert_review_ready` without engineering or worker-contract correction between runs.

If resumed Pilot #21 exposes a new generic engineering contract class, global qualification returns to `paused` and the affected Reliability v2 gates must be repeated. The course must not be manually rescued around a generic engineering failure merely to force a successful pilot result.

Educational findings are handled through the educational assurance/remediation path and must not be misclassified as generic engineering failures merely to avoid expert review.

## Cost position

Q8 changes no cost authority.

- Q7 attempt-007 known spend: **US$0.369562 / US$5**.
- cumulative known Q7 spend through attempt 007: **US$2.865858**.
- Pilot #21 known spend before its earlier stop: **US$0.7454**.
- full-course ceiling remains **US$20 per course**.

The resumed Pilot #21 execution remains subject to normal spend logging and stop-loss controls.

## Documentation impact

No normative authority, ADR or index change is required for Q8.

The active Reliability Qualification Standard already defines the separate Q8 eligibility transition after Q1–Q7 PASS. ADR-0019 already governs candidate recovery and mechanical compiler ownership. The Pilot #21 remediation applied those existing rules rather than changing them.

This Q8 change therefore:

- appends `content-factory/reliability-v2-f-q8-eligibility-004.json`;
- updates `content-factory/reliability-qualification.json` from paused to qualified;
- binds qualification to current post-Pilot #21 Q1–Q6 evidence and Q7 attempt 007;
- updates executable assurance to distinguish current state from immutable historical evidence;
- updates this technical harness to the current Q1–Q8 lineage;
- preserves historical evidence records unchanged;
- changes no worker/compiler runtime logic;
- triggers no provider call or content generation.

The next repository/process state change after Founder-approved Q8 merge is a separately initiated resume of Pilot #21 from its Assessment boundary.