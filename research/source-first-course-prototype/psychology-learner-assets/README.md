# AQA A-level Psychology 7182 — source-first learner assets

**Status:** Experimental Step 4 candidate complete. Not learner-publication approved.

This directory records the learner-asset stage of the governed source-first Psychology pilot. It applies the completed Psychology Course Truth, Exam Truth and Course Learning Blueprint without changing those truth layers or the production learner runtime.

## Purpose

Step 4 must produce a complete candidate course across Learn, Practice and Exam Prep before Step 5 builds Marking Packs/evidence mappings and Step 6 runs production-level independent educational/assessment assurance.

The implementation is intentionally **derived rather than duplicated**. `scripts/content/derive-psychology-learner-assets.ts` reads the retained 17 Course Truth shards plus Exam Truth and the deterministic Blueprint projection, then assembles the learner corpus. This keeps academic truth single-source and makes regeneration deterministic if an upstream truth layer changes.

The resulting corpus contains:

- 17 reading-first Learn chapters;
- 118 traceable Learn requirement sections;
- one active Practice activity for each distinct Practice evidence mode selected by the Blueprint for each requirement;
- six course-level Exam Prep skill modules;
- 17 topic Exam Prep sets that cover the distinct question families and command/demand classes selected by the Blueprint; and
- three representative Revision-owned full-paper simulations using the current 96-mark / 120-minute paper structures, including valid Paper 3 option paths.

The exact Practice activity count is a deterministic consequence of the Blueprint. It is deliberately not a target quota.

## Learn

Each Learn chapter is a coherent topic container. Its requirement sections use only rights-safe Course Truth fields for learner teaching:

- definitions and core concepts;
- models, research relationships and interpretation;
- evaluation and limitations;
- misconception repairs;
- Blueprint-required worked reasoning;
- independently checkable quantitative worked examples where selected;
- purposeful visual specifications plus text alternatives where selected; and
- compact memory recaps after the reading-first explanation.

The AQA `boardAlignment.summary` and `officialSource` fields are **not** used as learner prose. They remain reference-only alignment metadata.

Learn exposure remains `reviewed_only`; reading a section is not treated as proof of readiness.

## Practice

Practice is built from `practiceEvidenceModes` already selected by the Course Learning Blueprint. The builder does not invent a fixed number of questions per topic.

Modes include, where selected:

- retrieval;
- short constructed response;
- recognition/discrimination;
- application;
- comparison/judgement;
- reasoning chains;
- calculation/data work;
- misconception diagnosis/repair; and
- mixed-topic retrieval.

Every activity retains its Course Truth requirement ID and Blueprint unit ID plus the evidence scope the Blueprint says that mode could eventually support.

However, **Step 4 activities are not scored or evidence-eligible**. Their `scoringStatus` is `marking_pack_pending_step_5`. This prevents learner evidence from getting ahead of the governed Marking Pack/evidence-mapping stage.

## Exam Prep

Exam Prep has three layers.

### Course-level skill modules

The six merged Blueprint exam-skill units are all represented:

1. paper orientation;
2. command/demand;
3. extended response;
4. research-method transfer;
5. data/maths; and
6. Paper 3 synoptic performance.

Guidance is Revision-authored from approved structured assessment facts. It does not copy AQA question or mark-scheme prose.

### Topic sets

Each of the 17 topics gets a set covering the distinct question families and command/demand classes linked by the Blueprint. Question volume therefore follows the academically selected demand coverage rather than a template quota.

### Representative paper simulations

The builder creates one representative simulation for each current paper:

- 7182/1 — 96 attempted marks, 120 minutes;
- 7182/2 — 96 attempted marks, 120 minutes; and
- 7182/3 — 96 attempted marks, 120 minutes, retaining Section A plus one topic from each of the three option groups.

The simulation prompts are Revision-authored. The deterministic tariff mix is only a valid practice construction; it is **not** asserted as a future AQA question-count/tariff invariant. Marking Packs remain a Step 5 dependency.

## Rights boundary

AQA assessment material stays `REFERENCE_ONLY`.

Permitted downstream use is limited to approved structured facts such as paper identity, duration, marks, section/option placement, AO constraints, question-family/demand metadata and other facts already retained in Exam Truth.

Learner teaching/feedback copy comes from rights-safe subject truth. Official AQA questions, mark schemes, protected explanatory prose and official-source URLs are not a learner-text corpus.

## Deterministic assurance

`scripts/assurance/psychology-learner-assets.test.ts` proves at minimum that:

- all 118 requirements appear exactly once in Learn;
- every Blueprint-selected Learn treatment is retained;
- every Blueprint-selected Practice mode has an active activity;
- misconception, worked-example, quantitative and visual obligations are present where selected;
- Practice/Exam Prep candidates remain ineligible for scored evidence before Step 5;
- all six exam-skill units and all 17 topic Exam Prep sets are represented;
- the three simulations reconcile to the current paper/section/option totals;
- all assessment prompts are labelled Revision-owned rather than official AQA; and
- official AQA URLs/reference fields do not leak into learner-facing copy.

This is structural/content-contract assurance, not fresh independent educational or assessment judgement. Those remain Step 6 gates.

## Documentation impact

This Step 4 work:

- adds experimental research evidence and deterministic derivation/assurance code;
- does not change normative authority;
- does not change production technical documentation;
- does not modify the canonical learner runtime; and
- does not rewrite historical Course Truth/Exam Truth/Blueprint evidence.

Step 7 remains the governed point for integration into the ordinary `Overview / Learn / Practice / Exam Prep / Progress` learner architecture.

## Economics

Recorded variable spend for this Step 4 derivation:

- paid AI/provider generation: **£0**;
- paid source/licence spend: **£0**.

The important experimental question now shifts from generation cost to quality: Step 6 must determine whether this deterministic treatment is educationally strong enough, and any remediation must be measured rather than hidden by weakening the intended course scope.

## Next governed step

After this candidate corpus is merged, proceed to **Step 5 — Marking Packs and evidence mappings**. Do not integrate into the learner runtime or publish to the restricted pilot before the remaining governed gates pass.
