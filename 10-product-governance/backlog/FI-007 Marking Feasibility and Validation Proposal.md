# FI-007 — Marking Feasibility and Validation Proposal

**Document type:** non-authoritative feature-analysis proposal  
**Status:** Proposed / under Analyse  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Owner:** Product / Founder  
**Date:** 2026-08-22  

## Purpose

Define the proposed feasibility and validation path needed before FI-007 can be considered for `Analyse → Ready`, while allowing a deliberately bounded early pilot to support a real learner preparing for AQA AS Business Paper 2.

This document does not approve a production model/provider, final release threshold or implementation. It records the recommended evaluation sequence for Founder review.

Detailed Layer-0 execution design is recorded in `FI-007 7131 Paper 2 Layer 0 Pilot Pack.md`. The scalable course-onboarding model is recorded in `FI-007 Marking Capability Onboarding Pipeline Proposal.md`.

## Governing constraints

Read with:

- `10-product-governance/Assisted Exam Answer Marking.md`;
- `40-evidence-and-trust/Evidence Trust and Educational Integrity.md`;
- `60-business-operations/AI Cost and Allowance Policy.md`;
- `60-business-operations/Pricing and Billing Policy.md`;
- `10-product-governance/Subscription Plans and Entitlements.md`; and
- `80-company-workflows/Feature Definition and Measurement Workflow.md`.

The evaluation must preserve the existing rules that marking quality and truth do not vary by tier, uncertainty must change product behaviour, fabricated marking criteria are unacceptable, and cost optimisation cannot justify weaker educational reliability.

---

## 1. Founder direction — 7131 AS Paper 2 first

The immediate FI-007 pilot target is **AQA AS Business 7131 Paper 2**.

The reason is practical and learner-led: the available pilot learner is preparing for an AS Paper 2 assessment in September, so this is the fastest route to testing a genuinely useful marking loop with a real learner rather than building first for a later exam need.

AQA's current 7131 specification defines Paper 2 as:

- all AS subject content;
- a 1 hour 30 minute written exam;
- 80 marks;
- 50% of AS; and
- one compulsory case study followed by approximately seven questions.

The scheme of assessment confirms that Paper 2 carries substantial AO3/AO4 judgement and ends with an extended response requiring a sustained, coherent, relevant and substantiated line of reasoning.

### Validation priority

Sequence FI-007 as:

1. **7131 AS Paper 2 rapid pilot**;
2. full 7131 Paper 2 validation;
3. extension to the wider 7131 question set where useful;
4. extension to 7132 A-level Business;
5. later separate validation for 7137/7138.

7132 and the replacement specifications remain important, but they should not delay proving the core marking experience against the September AS Paper 2 use case.

---

## 2. Hybrid marking principle

Do not assume every supported exam question should be sent through a generative marker.

The current governed 7131 Paper 2 simulation includes 3-, 4-, 9-, 16- and 20-mark question classes. The feasibility work should first classify each question class into the least-complex route that can meet the educational trust bar:

- deterministic calculation/checking;
- bounded rubric/criterion matching;
- generative AI judgement; or
- a hybrid route.

Generative AI should be reserved for question classes where semantic judgement materially improves the result. This is expected to reduce cost and avoid introducing probabilistic marking where deterministic logic is more reliable.

For the immediate Layer-0 pilot, the principal AI-marking focus is the 9-, 16- and 20-mark judgement-heavy responses, with lower-tariff questions used to prove routing rather than to justify AI usage.

This hybrid-routing proposal must be tested rather than assumed to be correct for every future subject.

---

## 3. Three-layer evidence model

Speed and educational trust should not be confused. The project should use three different evidence layers.

### Layer 0 — rapid pilot / engineering feasibility

Purpose: get a bounded marker working quickly enough to test the learner experience and expose obvious marking failures.

The detailed pilot design uses **18 reference-marked calibration responses** across the existing governed 9-, 16- and 20-mark Harbour Home question classes, with sanity checks on lower-tariff routing.

One trusted human reference mark is acceptable for this rapid pilot if obtaining two would materially delay learning, but any disputed or boundary result should receive a second human review.

This layer may be used aggressively to tune the marking contract and compare candidate architectures. It is **not release evidence** and must not be represented as proof that AI marking is production-accurate.

### Layer 1 — Stage A architecture benchmark

Purpose: choose a credible marking architecture after the rapid pilot.

Recommended set:

- **60 7131 Paper 2 learner answers**;
- multiple case studies/questions;
- representative low-, medium- and high-tariff written responses;
- strong coverage of extended responses and judgement-heavy marking;
- balanced weak / middle / strong / boundary cases; and
- adversarial cases such as fluent-but-wrong reasoning, unusual-but-valid analysis, irrelevant material and terse-but-creditworthy answers.

All 60 should be independently marked by two competent humans. Material disagreement should be moderated/adjudicated.

Stage A may be used to select/tune the architecture, so it is not the final unbiased release set.

### Layer 2 — Stage B held-out release benchmark

Purpose: provide evidence for `Ready`/release decisions.

Recommended starting size:

- **180 previously unseen 7131 Paper 2 answers**;
- representative coverage across supported Paper 2 question classes and topics;
- deliberate over-representation of boundaries, unusual-but-valid answers and plausible-but-wrong answers; and
- independent double marking with moderation/adjudication where required.

The held-out set must not be used for prompt/model tuning. Once an item is used to tune a configuration, it ceases to be unbiased release evidence for that configuration.

---

## 4. September learner pilot

The first working prototype should support only governed 7131 Paper 2 questions for which Revision has:

- exact question identity and wording;
- case-study/context material;
- mark allocation;
- relevant AO treatment;
- official/assured mark scheme, levels and indicative content as applicable; and
- explicit marking eligibility.

The learner experience remains the already-approved FI-007 loop:

`supported question → typed answer → Mark my answer → saved attempt → provisional result → strengths → missed marks → improve → re-mark`

For the rapid pilot:

- label marks clearly as **Revision-assessed / pilot** rather than implying examiner certainty;
- preserve the learner's original answer before marking;
- allow `Check this mark` where the learner or reviewer doubts the result;
- do not feed pilot results into strong readiness/mastery claims until the validation gate passes; and
- record mark, model/method version, marking-pack version, latency and any review disagreement so pilot usage becomes useful evidence.

The pilot learner provides usability and learning-loop evidence. One learner does not establish general marking accuracy.

---

## 5. Governed marking contract

Every tested architecture should receive materially equivalent inputs:

1. qualification/specification identity — AQA AS Business 7131;
2. component — Paper 2;
3. exact question text;
4. case/context supplied with the question;
5. maximum mark;
6. applicable AOs/weights;
7. level descriptors / marking criteria;
8. approved indicative content where applicable;
9. explicit instruction not to invent criteria outside the marking pack;
10. learner answer; and
11. required structured output schema.

Candidate output should include at minimum:

- provisional mark or permitted range;
- level/band where applicable;
- AO judgements where supported;
- evidence from the learner answer supporting credit;
- missed/underdeveloped elements;
- 1–3 prioritised improvement actions;
- internal confidence/review-required state;
- unsupported-criterion flag; and
- marking-contract/model/version metadata.

The learner-facing experience can remain simple even if the internal evaluation record is richer.

---

## 6. Architectures to compare

Benchmark architectures, not provider brands alone.

### A. Single strong marker

One capable model returns the complete structured mark and feedback. Use as the simplest baseline and possible quality ceiling.

### B. Cost-efficient primary marker + selective arbitration

A validated lower-cost route handles routine marks; stronger independent marking is triggered for defined risk states such as low confidence, level boundaries, evidence-score inconsistency or `Check this mark`.

This remains the leading commercial hypothesis, not an approved production architecture.

### C. Independent dual marker + adjudication

Two independent passes produce separate judgements; deterministic agreement rules accept close agreement and escalate material disagreement.

### D. Criteria-first decomposition

First identify creditworthy evidence against governed criteria/AOs, then score that evidence in a separate step.

Layer 0 may initially compare A, B and D for speed; Stage A should include enough alternatives to avoid locking into the first plausible model.

---

## 7. Metrics

Report by question tariff/class as well as overall.

### Mark accuracy

- exact-mark agreement;
- within ±1 mark;
- within ±2 where educationally appropriate on high-tariff responses;
- mean absolute error;
- systematic over/under-marking bias;
- maximum material error; and
- full error distribution.

### Level/AO accuracy

- exact/adjacent level agreement;
- multi-level disagreement;
- boundary performance;
- AO agreement;
- false-credit rate; and
- false-penalty rate.

### Trust/integrity

Track:

- fabricated/unsupported marking criteria;
- credit for content not present in the answer;
- failure to recognise unusual-but-valid reasoning;
- contradictory feedback versus mark;
- inappropriate certainty on disputed cases; and
- benchmark/provenance leakage.

**Fabricated assessment criteria remain a zero-tolerance release class.**

### Stability and usefulness

Re-run a stratified subset and assess mark/level stability, material feedback drift, confidence stability and whether feedback is grounded, prioritised and actionable.

---

## 8. Human reference-marking contract

For formal Stage A/B evidence record:

- exact 7131 Paper 2 question/context;
- mark allocation;
- marking-pack/mark-scheme version;
- first human mark and reasoning;
- second human mark and reasoning;
- disagreement magnitude;
- moderated/adjudicated result where required;
- AO/level judgement where relevant;
- boundary-case flag;
- accepted unusual reasoning where relevant; and
- answer provenance/permission.

Human-human agreement must be reported alongside AI-human agreement. Where competent humans reasonably differ, Revision should not pretend that a perfectly objective exact mark always exists.

---

## 9. Confidence and release-gate design

Exact numeric release thresholds should be proposed after Stage A shows realistic human-human agreement on 7131 Paper 2.

The eventual release structure must include:

- zero fabricated assessment criteria in held-out evidence;
- no material systematic over/under-marking;
- confidence behaviour that suppresses false precision on material disagreement cases;
- independently designed `Check this mark` arbitration;
- no lower-tier quality degradation;
- applicable privacy/security/safeguarding controls; and
- numeric accuracy thresholds calibrated to human agreement and educational consequence.

Question classes may pass progressively. If some Paper 2 classes are reliable and others are not, launch only the validated classes rather than lowering the trust bar.

Self-reported model confidence alone is not sufficient; confidence must be calibrated against observed errors.

---

## 10. Cost and latency validation

For every evaluated route measure:

- input/context use;
- caching;
- output use;
- model calls;
- initial mark cost;
- improvement re-mark cost;
- arbitration/review cost;
- retry/failure overhead;
- median and P95 latency; and
- provider/model route.

Model cost against the approved FI-007 ladder:

- Free — 5/month;
- Paid — 30/month;
- Premium — Unlimited legitimate learner use;

and the wider approved average AI/REV cost envelopes:

- Free ≤ £0.10 per active learner-month;
- Paid ≤ £0.60;
- Premium ≤ £1.85.

Quality remains the first gate. A cheap unreliable marker is not viable.

---

## 11. Decision sequence

### After Layer 0 rapid pilot

Return with:

- working 7131 Paper 2 marking contract;
- examples of accurate and inaccurate marks;
- main failure classes;
- learner usability findings;
- candidate architecture recommendation for Stage A;
- observed latency/cost;
- effectiveness of deterministic-vs-AI routing; and
- any content/marking-pack gaps blocking expansion.

### After Stage A

Return with:

- human-human agreement;
- architecture/model comparison;
- confidence/arbitration performance;
- cost/latency distribution;
- proposed Stage B thresholds; and
- supported 7131 Paper 2 question classes recommended to continue.

No production implementation should begin merely because the rapid pilot looks convincing.

---

## 12. Expansion and repeatable onboarding

Once 7131 Paper 2 is validated, use the Marking Capability Onboarding Pipeline to assess:

1. wider 7131 support;
2. 7132 A-level Business;
3. 7137/7138 under their new assessment design; and
4. other subjects only through their own governed marking packs and validation evidence.

Reuse the platform/process; revalidate the academic marking claim.

The intended reuse classes are:

- R0 — new marking domain: broad validation;
- R1 — related course/specification: targeted validation;
- R2 — new question class: class-specific validation; and
- R3 — new question inside an already validated class: normal governed content onboarding unless revalidation is triggered.

Empirical quality claims do not automatically transfer between specifications or subjects.

---

## 13. Documentation impact check

This remains a **non-authoritative analysis proposal**.

It records the Founder direction to prioritise **7131 AS Paper 2** for the immediate September pilot, the bounded rapid-pilot layer before full Stage A/Stage B validation, the hybrid deterministic/AI marking hypothesis, and the requirement to produce reusable onboarding artifacts.

No provider/model, production architecture, release threshold or implementation is approved by this document. If these directions are approved as enduring FI-007 product/process rules, the active FI-007 authority and applicable company workflow should be aligned through the governed documentation process before `Ready`.
