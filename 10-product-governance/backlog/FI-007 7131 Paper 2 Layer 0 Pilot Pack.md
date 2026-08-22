# FI-007 — 7131 Paper 2 Layer 0 Pilot Pack

**Document type:** non-authoritative feasibility-analysis working pack  
**Status:** Proposed / under `Analyse`  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Pilot:** AQA AS Business 7131 — Paper 2  
**Date:** 2026-08-22

## Purpose

Define the smallest repeatable pilot pack needed to get a bounded 7131 Paper 2 marker working quickly while producing evidence and reusable artifacts for future course onboarding.

This is not release evidence and does not approve a production model/provider, architecture or implementation. It is a controlled Layer-0 feasibility pack.

## Governing principle

The first pilot must create two outputs at the same time:

1. a useful 7131 Paper 2 marking experience that can be exercised by the pilot learner; and
2. the first reusable instance of Revision's Marking Capability Onboarding Pipeline.

The pilot must therefore avoid one-off prompt engineering that cannot be reproduced for another paper, qualification or subject.

---

## 1. Reuse the governed 7131 Paper 2 content pack

The repository already contains an assured AQA AS Business 7131 Paper 2 pack and an original 80-mark Paper 2 simulation.

The existing `Harbour Home Ltd` simulation contains these question classes:

| Question | Marks | Primary demand | Initial marking route hypothesis |
|---|---:|---|---|
| HH-Q1 | 3 | quantitative calculation | deterministic-first |
| HH-Q2 | 3 | quantitative calculation | deterministic-first |
| HH-Q3 | 4 | short contextual explanation | deterministic/rubric-first, AI optional |
| HH-Q4 | 9 | contextual analysis | AI marking candidate |
| HH-Q5 | 9 | contextual analysis | AI marking candidate |
| HH-Q6 | 16 | analysis + evaluation/judgement | AI marking candidate |
| HH-Q7 | 16 | comparative evaluation/judgement | AI marking candidate |
| HH-Q8 | 20 | synoptic evaluation | AI marking candidate |

### Hybrid marking principle

Do not force every exam response through generative AI.

For each new question class, first decide whether reliable marking can be achieved through:

- deterministic calculation/checking;
- bounded rubric/criterion matching;
- generative AI judgement; or
- a hybrid of those approaches.

Generative AI should be used where semantic judgement materially improves marking. Deterministic logic should be preferred where the mark can be established more reliably and cheaply without generative interpretation.

This routing classification is intended to become part of the repeatable onboarding process for every future course.

---

## 2. Layer-0 pilot scope

The rapid pilot should concentrate on the judgement-heavy classes rather than dilute effort across the whole paper.

### Core pilot classes

- 9-mark analysis — HH-Q4 and HH-Q5;
- 16-mark evaluation — HH-Q6 and HH-Q7;
- 20-mark synoptic evaluation — HH-Q8.

### Sanity-check classes

- one 3-mark calculation example;
- one 4-mark explanation example.

These are included to prove that the routing layer can choose a non-generative or lighter marking path where appropriate.

---

## 3. External examiner-marked anchor set

AQA publishes an official `AS Business 7131 Paper 2 Answers and Commentaries` resource containing marked student answers from different performance levels and examiner commentary.

The resource provides a valuable external calibration anchor because it covers the same three judgement-heavy tariffs selected for the pilot:

| AQA sample question | Marks available | Published exemplar marks | Performance spread |
|---|---:|---|---|
| Question 4 | 9 | **8, 5, 2** | strong / middle / weak |
| Question 6 | 16 | **15, 12, 6** | strong / upper-middle / lower-middle |
| Question 8 | 20 | **18, 14, 6** | strong / good / incomplete-low |

This gives **nine externally examiner-marked anchor cases** before Revision has created its own internal calibration set.

### Use of the anchor resource

The anchor set should be used to:

- verify that the marking contract understands AQA's level-of-response semantics;
- test whether a candidate architecture can distinguish strong, middle and weak responses;
- test whether feedback identifies the same material strengths/limitations highlighted by examiner commentary;
- check whether 9-, 16- and 20-mark question classes require materially different prompting/scoring logic; and
- inform the design of Revision's internal calibration cases.

### Copyright/licensing constraint

Do **not** copy the full AQA student scripts or substantial mark-scheme text into the Revision repository merely to create a benchmark dataset.

Keep source metadata and links/provenance records. Before full scripts are persistently stored, redistributed, or systematically sent to third-party model providers as a reusable dataset, confirm that the intended use is permitted under applicable AQA copyright/licensing terms and Revision's provider/data-processing controls.

If that reuse is not clearly permitted, use the AQA resource as human calibration/reference evidence and construct Revision-owned calibration answers against the governed marking principles instead.

---

## 4. Initial 18-item Layer-0 calibration design

Use a two-part calibration set rather than requiring 18 newly human-marked answers before the first useful test.

### Part A — nine AQA examiner-marked anchors

Where permitted for the evaluation method, use the nine published exemplar outcomes above as external anchors. At minimum, use their examiner-awarded mark/level/commentary patterns to calibrate the expected performance classes.

### Part B — nine Revision-controlled transfer cases

Create or collect **nine** answers against the governed Harbour Home questions to test whether the architecture transfers from official exemplar patterns to Revision-authored supported practice.

| Question class | Harbour Home questions | Transfer cases | Required spread |
|---|---|---:|---|
| 9-mark analysis | HH-Q4 / HH-Q5 | 3 | weak, middle/boundary, strong or plausible-wrong |
| 16-mark evaluation | HH-Q6 / HH-Q7 | 3 | weak/middle, boundary, strong |
| 20-mark synoptic evaluation | HH-Q8 | 3 | incomplete/weak, middle/boundary, strong/unusual-valid |
| **Total** |  | **9** |  |

The nine Revision-controlled cases must collectively include:

- at least one materially incomplete answer;
- at least one correct-knowledge/weak-application answer;
- at least one fluent but incorrect/unsupported chain of reasoning;
- at least two boundary-quality cases;
- one unusual-but-valid argument that is not a phrase match to the marking guidance; and
- one response containing relevant and irrelevant material.

Every Revision-controlled case used for AI accuracy comparison must receive a trusted human reference mark before its mark is revealed to the evaluated marker.

### Why 9 + 9 is preferable for Layer 0

This structure gives immediate examiner-grounded calibration while keeping the amount of newly human-marked material small enough for rapid iteration.

It is still only Layer-0 feasibility evidence. Stage A remains the first systematic double-marked architecture benchmark.

---

## 5. Reference-marking record

Every calibration answer receives a `reference_mark_record` containing:

```text
answer_id
qualification_id
component_id
question_id
question_marks
question_class
answer_text_or_secure_source_reference
reference_mark
reference_level_or_band (where applicable)
reference_ao_judgements (where practical)
reference_reasoning_summary
boundary_case: yes/no
unusual_valid_reasoning: yes/no
second_review_required: yes/no
second_review_mark (if used)
adjudicated_mark (if used)
reference_marker_type
marking_pack_version
provenance_or_permission
reuse_constraints
```

### Layer-0 human-reference rule

For Revision-controlled cases, for speed:

- one competent trusted human reference mark may be used initially;
- boundary, disputed, unusual-valid or high-impact disagreement cases receive a second independent review;
- the marker being tested must not see the reference mark/reasoning before producing its result; and
- the reference record is immutable for that evaluation run.

Published AQA examiner-marked anchors retain AQA as the external reference authority; Revision must not rewrite the published mark/commentary.

Stage A later upgrades Revision's formal benchmark evidence to independent double marking for all benchmark items.

---

## 6. Marking-pack payload

Every evaluated AI route receives the same logical marking contract.

### Stable context

- awarding organisation;
- qualification/specification code;
- component/paper identity;
- question ID and wording;
- case-study/context material;
- maximum mark;
- question class / command demand;
- applicable assessment objectives and allocations;
- levels/descriptors where applicable;
- assured marking guidance / indicative content;
- explicit instruction that indicative content is not exhaustive where the marking model allows valid alternatives;
- explicit prohibition on inventing assessment criteria.

### Variable context

- learner answer;
- attempt type (independent / assisted where relevant);
- marking request ID.

### Required machine-readable output

```text
provisional_mark
maximum_mark
level_or_band
mark_range (nullable)
ao_judgements
credited_evidence[]
missed_or_underdeveloped[]
improvement_priorities[]
confidence_state
review_required
unsupported_criterion_detected
rationale_summary
model_provider
model_id
model_version_or_snapshot
marking_contract_version
marking_pack_version
latency_ms
usage_input
usage_output
estimated_cost
```

The learner UI does not expose this full record. It is the evaluation and audit contract.

---

## 7. Confidence states for the pilot

Layer 0 should test only four externally meaningful states:

### `normal`
The route is sufficiently confident to return a provisional exact mark.

### `borderline`
A plausible boundary/disagreement exists. Return a bounded range only if the architecture and calibration evidence support doing so.

### `insufficient`
Do not return a precise numerical mark. Return grounded qualitative feedback and request review/retry through the governed path.

### `review-required`
A conflict, unsupported criterion, missing context, internal inconsistency or `Check this mark` event requires independent arbitration.

Model self-reported confidence alone does not determine these states.

---

## 8. Candidate architecture comparison in Layer 0

For speed, Layer 0 should compare a limited but informative set rather than every theoretical architecture.

### Route S — strong single marker

Use one strong model to establish a simple quality/latency/cost baseline.

### Route R — cost-efficient primary + stronger arbitration

Use a cheaper candidate primary marker, escalating selected risk states to the strong route.

### Route E — criteria-first evidence decomposition

Extract creditworthy evidence/AO performance first, then assign the mark in a separate scoring step.

The dual-independent-marker architecture can be deferred to Stage A unless Layer-0 disagreement suggests it is necessary earlier.

### Evaluation rule

Do not select an architecture because its prose sounds examiner-like. Select based on reference-mark agreement, failure behaviour, explainability, cost and confidence calibration.

---

## 9. Layer-0 scorecard

For each architecture calculate:

- exact-mark agreement count/rate;
- within ±1 mark count/rate;
- within ±2 on 16/20-mark questions;
- mean absolute error;
- largest error;
- direction of marking bias;
- false-credit cases;
- false-penalty cases;
- fabricated/unsupported criterion cases;
- boundary-case handling;
- unusual-valid recognition;
- exact-mark repeatability on reruns;
- feedback-grounding defects;
- median/P95 latency for the pilot sample;
- cost per initial mark;
- cost per mark + included improvement re-mark; and
- arbitration frequency/cost where applicable.

### Absolute pilot defect

Any fabricated assessment criterion is a blocking architecture defect requiring correction before that configuration continues.

---

## 10. Learner-pilot route

The learner pilot is narrower than commercial FI-007.

For governed 7131 Paper 2 questions:

`question → typed answer → save immutable attempt → Mark my answer → route selected → provisional/pilot result → strengths → missed marks → 1–3 improvement priorities → Improve my answer → re-mark`

During Layer 0:

- label the result `Revision-assessed — pilot`;
- do not use the mark to assert mastery, readiness or predicted grade;
- retain the original answer;
- retain route/model/marking-pack/version evidence;
- allow a reviewer to compare AI mark with a human mark after submission; and
- record whether the learner found the feedback useful and whether the re-marked answer genuinely improved.

This pilot behaviour must not silently become the production trust claim.

---

## 11. Repeatable onboarding artifacts produced by this pilot

Layer 0 must leave behind reusable templates rather than only test results.

### A. `marking-capability-manifest`

Defines:

- subject;
- qualification;
- awarding organisation;
- specification;
- component;
- supported question classes;
- routing class for each question class;
- marking-pack versions;
- validation state;
- supported confidence behaviour;
- current production eligibility.

### B. `question-class-definition`

Defines the reusable marking class, for example:

`business_contextual_analysis_9_mark`

including:

- expected assessment demand;
- AO pattern;
- level/mark semantics;
- required context;
- deterministic checks;
- AI judgement requirements; and
- validation certificate reference.

### C. `benchmark-item-record`

Standard schema for a question, answer and independent reference mark.

### D. `evaluation-run-record`

Standard schema for model/architecture configuration, output, cost, latency and comparison with reference.

### E. `marking-validation-certificate`

Eventually states which question classes have passed which evidence layer and what limitations/revalidation triggers remain.

### F. `live-marking-monitoring-profile`

Eventually defines disagreement, low-confidence, retry, cost and complaint monitoring after release.

These artifact types should be reusable across subjects rather than named after Business in the platform design.

---

## 12. Onboarding classification for future courses

When a future marking capability is added, classify it before deciding the validation workload.

### R0 — new marking domain

Example: moving from Business extended prose to Maths multi-step workings or a language-writing assessment.

Reuse platform mechanics but require broad new validation.

### R1 — related qualification/specification

Example: 7131 → 7132.

Reuse platform and likely some question-class architecture, but run targeted empirical validation against the new course/component.

### R2 — new question class inside a validated specification

Example: a previously unsupported tariff or assessment demand.

Run class-specific calibration and held-out validation.

### R3 — new question inside an already validated class

Normal content onboarding plus marking-pack assurance should be sufficient unless a revalidation trigger exists.

The target operating state is to move routine expansion work toward R3 wherever evidence genuinely supports it.

---

## 13. Layer-0 exit criteria

The rapid pilot is complete when Revision has:

1. the nine AQA examiner-marked anchor cases recorded by source/reference and the nine Revision-controlled transfer cases reference-marked;
2. a versioned marking-pack payload;
3. at least two credible architecture results, including the strong baseline;
4. recorded errors/failure classes rather than only average accuracy;
5. an initial confidence/arbitration rule grounded in observed disagreement;
6. cost and latency measurements;
7. a learner-pilot feedback record;
8. reusable onboarding artifacts/templates drafted from the exercise; and
9. a clear recommendation for Stage A.

Layer 0 does **not** itself authorise production release or `Analyse → Ready`.

---

## 14. Stage-A recommendation gate

After Layer 0, return to the Founder with one of:

### `PROCEED`
At least one architecture is credible enough to justify the 60-answer double-marked Stage A benchmark.

### `REWORK`
The approach looks viable, but specific marking-contract, confidence or content-pack defects must be corrected before Stage A.

### `STOP / REFRAME`
No evaluated approach is sufficiently reliable or economically plausible to justify further investment in the current form.

The recommendation must show actual marked examples and failure cases, not only aggregate metrics.

---

## 15. Documentation impact check

This document is non-authoritative analysis evidence on the FI-007 Analyse branch.

If the Founder approves the hybrid routing principle, reusable onboarding artifact model or Layer-0 exit criteria as enduring product/process rules, promote them into the applicable normative FI-007/workflow authority through the governed PR process.

No production implementation or provider/model choice is authorised by this working pack.
