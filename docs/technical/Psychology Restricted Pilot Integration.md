# Psychology 7182 Restricted-Pilot Integration

## Status

Implementation in progress on `feat/psychology-restricted-pilot-shipping-2026-10-07`.

This document records the production integration boundary for AQA A-level Psychology 7182. It does not change the governing Source-First pilot authority or FI-007 product authority.

## Objective

Get the complete, trustworthy Psychology course into the canonical learner application as soon as the existing restricted-pilot assurance gate permits, without making reliable assisted written-answer marking a prerequisite for course availability.

The course still targets the full intended learner journey:

`Overview → Learn → Practice → Exam Prep → Progress`

The course is not considered finished when content first appears on the site. Assisted written-answer marking is the immediate second milestone.

## Phase 1 — trusted course on the site

The production content pack projects the completed Psychology Course Truth into the ordinary content registry.

It contains:

- 17 topics;
- 118 Course Truth requirements;
- one learner Learn page for every requirement;
- retrieval flashcards and objective checks across the 118 requirements;
- Research Methods data drills;
- Psychology exam-technique guidance;
- three 120-minute / 96-mark Revision-authored representative papers;
- the exact current Paper 3 option-group structure;
- a Psychology Exam Prep paper guide using AO1–AO3.

The three paper modules share one learner course so Course Truth is not duplicated across papers.

### Written-answer boundary in Phase 1

Written Exam Prep and mock questions remain available.

Until FI-007 Psychology marking is independently validated:

- written answers are not REV-marked;
- self-marked exam evidence must remain labelled `self_assessed`;
- self-assessed evidence must not create examiner-like certainty or high-confidence readiness by itself;
- no Psychology Marking Pack is represented as calibrated production marking truth.

This is a marking-capability boundary, not a content-depth reduction.

## Phase 2 — finish Psychology assisted marking

Phase 2 starts immediately after Phase 1 reaches the restricted learner site.

Do not start another subject in place of this work.

The next milestone is to take the existing Psychology Step 5 Marking Pack candidates through the FI-007 readiness path:

1. select the supported Psychology written-question catalogue;
2. remediate prompt/rubric semantic defects found by independent assurance;
3. build genuine calibration anchors from independently judged responses rather than fabricated anchors;
4. validate exact marks / ranges / abstention behaviour;
5. prove marker reproducibility and confidence controls;
6. connect the validated `WrittenAnswerMarker` implementation to Psychology Practice / Exam Prep;
7. enable evidence only at the confidence level authorised by Claims and Progress governance;
8. verify improve-and-resubmit and check-this-mark behaviour;
9. run restricted-pilot marking verification.

Phase 2 is complete only when Psychology written answers can be marked under FI-007 without false precision and the resulting evidence semantics are authorised.

## Publication gate

The production manifests remain `preview` while final whole-course educational and assessment assurance is outstanding.

Promotion to `available` requires the governed restricted-pilot gate:

- deterministic content/schema/coverage checks pass;
- rights and provenance remain clean;
- fresh whole-course educational challenge has zero unresolved BLOCKING or MATERIAL findings;
- fresh assessment/authenticity challenge for the learner-visible exam material has zero unresolved BLOCKING or MATERIAL findings;
- canonical learner routes are verified with a restricted test account;
- Founder explicitly approves the exact merge.

## Implementation notes

The learner runtime already supports the Phase 1 boundary:

- written Practice is only offered for REV marking when a real `WrittenAnswerMarker` is connected;
- the Exam Simulator supports self-marked written mocks and labels their evidence `self_assessed`;
- the content registry discovers normal `content/**/index.ts` packs automatically.

The only generic exam-runtime addition required for Psychology is support for a choice option containing several questions, needed for whole-topic Paper 3 option sections.

## Documentation impact

This is production technical documentation only.

No normative product or assurance authority is changed.

The governing pilot run remains `research/source-first-course-prototype/AQA-PSYCHOLOGY-7182-STUDENT-PILOT-RUN.md`, and FI-007 remains governed by `10-product-governance/Assisted Exam Answer Marking.md`.


## Production launch assurance implementation

After preview integration reached `main`, the launch gate was deliberately separated from FI-007 marking assurance.

The production launch assurance reviews exactly what a restricted-pilot learner will see:

- production Learn pages;
- flashcards;
- objective Practice checks;
- Research Methods data drills;
- topic-link learner guidance;
- Psychology Exam Prep coaching;
- all three exact production mocks.

The assurance reference is the already-approved Psychology Course Truth for educational content and the already-approved structured Exam Truth for assessment content.

It does **not** review or promote Step 5 Marking Packs. Those remain Phase 2 FI-007 inputs.

Implementation:

- `scripts/assurance/psychology-launch-assurance.ts`
- `scripts/assurance/psychology-launch-assurance.test.ts`
- `.github/workflows/psychology-production-launch-assurance.yml`

The live workflow:

1. binds to an exact current `main` SHA;
2. reruns deterministic Course Truth, Exam Truth, production-pack and launch-packet tests;
3. runs seven fresh educational review packets covering all 118 requirements exactly once;
4. runs three paper-specific A3 review packets;
5. retains a machine-readable issue register and receipt;
6. fails closed on any blocking/material finding or dimension;
7. enforces a hard US$5 provider-spend ceiling;
8. performs no provider work in ordinary pull-request CI.

### A3 preflight correction before paid review

The first integrated production mocks had a deterministic authenticity weakness: generic AO2 questions referred to an unfamiliar context without supplying one, and Paper 2 Section C allocated quantitative marks without sufficiently concrete quantitative tasks.

That is corrected before paid assurance:

- every AO2 mock question has a learner-visible stimulus;
- Paper 1 embedded Research Methods application includes an operationalisation demand;
- Paper 2 Section C now contains a concrete variables/operationalisation task, a descriptive-statistics dataset, a validity task, a sign-test dataset and an inferential-test/significance task;
- every quantitative answer used for self-marking is independently calculable from the supplied data;
- Paper 3 application questions now have concrete Revision-owned scenarios.

This correction does not enable automated marking. It improves only the learner-visible launch assessment material.


### Live assurance evidence-retention correction

The first live production launch-assurance run against `main` commit
`ce4d37d6798f2299f21a6f1a8d2129e77264d62b` completed the provider review and correctly returned `fail_hold` with 20 blocking/material findings and 20 blocking/material review dimensions.

However, the test harness then deleted the output directory in its unconditional `afterEach` cleanup before the workflow's artifact-upload step ran. The workflow log therefore retained only the aggregate failure counts, not the packet review JSON or final receipt.

The assurance verdict remains a hold: absence of retained details is not permission to treat the course as passed. A new live review is required before remediation can be evidence-led.

The retention fix changes the implementation so that:

- ordinary provider-free tests continue cleaning temporary assurance files;
- an explicitly enabled live run preserves all packet reviews and the final receipt after success or fail-hold;
- the workflow upload step fails if the live-review step executed but no evidence files exist;
- a deterministic regression test proves fail-hold evidence is written before the runner throws.

This is an assurance implementation correction only. It does not alter the content gate, the severity threshold, or the Psychology publication boundary.


### Production launch assurance run 2 remediation

The second live production launch assurance reviewed exact main commit `1d261bb08d0970e02f8bb0a7c7d4e5353dcd9481` in Actions run `37705620510`.

All 10 review packets completed and the retained receipt recorded `fail_hold` with 23 material findings. Provider spend was US$0.993998.

The remediation corrects the recurring production issues identified by that review: weak objective-practice distractors, incomplete flashcard coverage, the Research Methods range statement, a learner-facing scope label, and bounded Paper 1 to Paper 3 prompt, route and self-marking guidance defects. Regression coverage is added for those failure modes.

Psychology remains `preview`. This remediation does not authorise FI-007 assisted marking.

### Production launch assurance run 3 remediation

The third live production launch assurance reviewed exact `main` commit `4f48aa01eaa022b09cf9d8de03f649ea02f441be` in Actions run `37783260632`.

All 10 review packets completed, retained artifact `11553462171` was uploaded successfully, and the receipt returned `fail_hold` with 10 material findings. Provider spend was US$1.006576.

Compared with run 2, the remaining launch blockers are narrower:

- objective Practice still used title/evidence matching patterns and predictable answer-position structure rather than sufficiently discriminating concept checks;
- Paper 1 AO1/AO2-only self-mark guidance still exposed AO3-style evaluative material, and its operationalisation guidance overstated construct-validity implications;
- one Paper 2 12-mark validity item under-allocated AO3 relative to its discuss/refinement demand;
- six Paper 3 four-mark outline prompts prescribed too much content for the tariff;
- Paper 3 AO1-only outline guidance still exposed evaluative material; and
- one Relationships application stimulus remained too leading.

The run-3 remediation changes only those production patterns. Objective Practice is regenerated from Course Truth using evidence/relationship cues, same-topic conceptually closer distractors and non-cyclic deterministic option placement. Mock guidance becomes AO-aware, the operationalisation distinction is corrected, the Paper 2 validity item is rebalanced while preserving approved paper-level AO contribution ranges, Paper 3 four-mark prompts are narrowed, and the Relationships stimulus is made non-leading.

Psychology remains `preview`. A fresh exact-main launch-assurance run is required after this remediation merges. FI-007 assisted marking remains outside this gate.

### Production launch assurance run 4 root-cause remediation

The fourth live production launch assurance reviewed exact Psychology remediation commit `a7b7d0da264fd798a5f6814176c1c60578fc3454` in Actions run `37800997662`.

All 10 packets completed, retained artifact `11561302129` uploaded successfully, and the final receipt returned `fail_hold` with 21 material findings across 14 material review dimensions. Provider spend was US$1.016534.

The higher finding count exposed two systemic implementation defects rather than a new Course Truth failure:

- objective Practice generated stems from one Course Truth relationship/evidence statement while keying a different first-definition statement from the same requirement, so valid source material could still produce an invalid answer key;
- the representative mocks still relied on broad syllabus-summary prompts and unranked indicative-content banks, leaving section structure and learner self-marking insufficiently operational.

The run-4 remediation replaces those contracts rather than patching individual findings:

- every objective-Practice item is generated as a definition-cloze contract in which the stem and keyed concept come from the same approved Course Truth clause; distractors are distinct concept labels from the same topic and answer positions remain deterministic without a fixed cycle;
- mock prompts explicitly make broad syllabus lists selectable rather than cumulatively compulsory and narrow application questions to one identified focus;
- learner self-marking guidance now exposes AO allocations and question-type scoring rules, with explicit mark-by-mark criteria for Paper 2 Research Methods;
- optional section metadata is carried by exam questions and rendered by Exam Simulator so learner-facing Paper 1–3 section identity and marks are explicit;
- Paper 3 application stimuli use indirect behavioural/data cues rather than naming the target mechanism or theory.

Psychology remains `preview`. A fresh exact-main launch-assurance run is still required after this remediation merges. FI-007 remains outside the launch gate.

### Production launch assurance run 5 — educational pass, mock application-contract hold

The fifth live production launch assurance reviewed exact `main` commit `6c9ebd993c68e3c41b2f996b82ebe3291a03a00e` in Actions run `37826306408`.

Exact-main verification and deterministic prerequisites passed before provider review. All seven educational and three assessment packets completed, retained artifact `11572326256` uploaded successfully, and observed provider spend was US$0.866206.

All seven educational packets passed. The final decision remained `fail_hold` because the three assessment packets reported six material findings across five material dimensions. Every finding was confined to the representative mock q2 application items.

The retained evidence exposed one remaining generator contract defect: heterogeneous Course Truth requirements could use a narrow focus inferred from the first definition while the stimulus and indicative marking routes were still drawn from the wider multi-concept requirement. That allowed neighbouring theories or biological explanations to appear as creditworthy routes for a narrower named prompt.

The run-5 remediation adds explicit application-question contracts for the affected heterogeneous requirements. Each contract binds one declared focus, one supporting stimulus and the indicative AO1/AO2/AO3 routes used for self-marking. Deterministic regressions prohibit the off-prompt theories identified by run 5 from reappearing in those items.

Psychology remains `preview`. This remediation does not change Course Truth, learner Learn/Practice content, publication authority or FI-007 assisted marking. A fresh exact-main launch-assurance run is still required after the remediation merges.

### Production launch assurance run 6 — bounded remediation

Run 6 reviewed exact `main` commit `3dfd536923250ae0703794510f8b4826b6785e2a` in Actions run `37841718938`.

Exact-main verification and deterministic prerequisites passed. All ten packets completed, artifact `11577524362` was retained, and observed provider spend was US$0.913430.

The final decision remained `fail_hold` with three material findings across five material dimensions. The remaining issues were limited to Research Methods experiment classification wording, two overlapping objective-Practice answer labels, and incomplete self-marking coverage for several broad Paper 3 choice routes.

The remediation clarifies the qualification-specific experiment taxonomy, prevents the overlapping labels from competing as distractors, and makes self-marking guidance cover every Course Truth route expressly offered by generic outline, evaluation and discussion prompts. Two minor learner-facing issues from the same run are also corrected: objective-Practice grammar and command-word coaching.

Psychology remains `preview`. FI-007 remains outside this gate. A fresh exact-main launch-assurance run is still required after this remediation merges.
