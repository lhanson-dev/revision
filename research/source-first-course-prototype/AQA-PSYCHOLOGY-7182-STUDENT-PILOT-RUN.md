# Prototype Run — AQA A-level Psychology 7182 → Restricted Student Pilot

**Prototype:** Source-First Course Prototype  
**Status:** Authorised continuation — proposed until governing PR is merged  
**Founder decision:** `iterate` via end-to-end Psychology completion  
**Decision date:** 2 October 2026  
**Exact course:** AQA A-level Psychology 7182, revised specification, first A-level exams summer 2027  
**Predecessor proof:** `AQA-PSYCHOLOGY-7182-RUN.md`

## Purpose

Prove whether the Source-First Course Prototype can take one exact course all the way from reusable, rights-clear subject knowledge to a **complete, restricted-pilot-ready Revision course that a student can actually use**.

This run deliberately does not move to a second subject yet. The immediate business question is no longer only whether reusable subject knowledge exists. It is:

> Can Revision turn that reusable knowledge into a complete, trustworthy learner course — Learn, Practice and Exam Prep — quickly enough and cheaply enough to support large-scale GCSE and A-level catalogue production?

## What this run inherits

The completed Psychology source proof established:

- 118 stable named AQA 7182 requirements across 17 topics;
- 118/118 requirements reviewed against reusable-source evidence;
- 56 source-covered candidates;
- 61 source-supported partials;
- 1 current source gap;
- 117/118 requirements with some commercial-compatible reusable subject evidence;
- representative structured Foundation slices for Social influence and Forensic Psychology;
- £0 paid AI/provider spend during that proof;
- £0 paid source/licence spend during that proof; and
- a clear finding that source discovery, rights verification, mapping and reconciliation are the main manual bottlenecks.

Those results remain historical evidence. They are not reclassified as a finished Course Foundation merely because this continuation has been authorised.

## Operating boundary

This run remains governed by `80-company-workflows/Source-First Course Prototype Experimental Exception.md`.

It is **not** required to follow the current Content Factory workflow, architecture, stage ceremony, provider routing or Business-specific pipeline compatibility.

It may selectively reuse current production schemas, learner-course infrastructure, assurance controls or Content Factory components where they materially improve speed, cost, simplicity, safety or reliability.

Repository-wide governance, source-rights, privacy, security, safeguarding, exact-head assurance and Founder merge approval still apply.

## Success criterion

The experiment succeeds at this stage only when the course is suitable for a **restricted real-student pilot inside the canonical Revision learner experience**.

The intended learner outcome is:

> A test student can add/open AQA A-level Psychology 7182 in Revision, learn the required course content, practise it, prepare for the real AQA assessment, have valid activity/evidence recorded, and receive useful Revision guidance without encountering a known material curriculum/content gap.

A high source-coverage percentage on its own is not completion.

## Completion contract

### 1. Complete Course Truth

Convert the complete 118-requirement course scope into a coherent source-traceable Psychology knowledge/skill model suitable for downstream learning production.

The completed Course Truth must:

- cover every in-scope named requirement for the intended pilot;
- close or explicitly resolve all current partial/gap cases needed for the pilot;
- preserve exact course/alignment provenance while keeping AQA material `REFERENCE_ONLY` where required;
- use only sources whose recorded rights permit the intended commercial AI-assisted use;
- record definitions, concepts, theories/models, named research/evidence, relationships, methods, quantitative/research-method skills, misconceptions, evaluation/limitations and other subject structures where educationally required;
- preserve dependencies and cross-topic relationships where they matter to understanding or assessment; and
- contain no unresolved material subject-truth or source-rights blocker.

The existing 56 covered / 61 partial / 1 gap source-review state is an input to this work, not the completion target.

### 2. Complete Exam Truth

Build the assessment model required to produce authentic Revision-owned Exam Prep and assessment assets for AQA 7182.

As applicable, record and verify:

- paper/component structure;
- duration and marks;
- assessment objectives and weighting/ranges;
- research-method and mathematical requirements;
- compulsory/optional relationships;
- command and cognitive-demand patterns;
- question/response families;
- source/data/scenario demands;
- extended-response expectations;
- timing and whole-paper constraints; and
- rules needed to create representative Revision-owned questions and mocks without copying protected awarding-body material.

Exam Truth may use official AQA material as structured alignment/reference authority but must respect its source-use classification.

### 3. Derive the Course Learning Blueprint

Apply the approved `10-product-governance/Course Learning Blueprint.md` model to the completed Course Truth and Exam Truth.

For every material knowledge/skill node, determine the learning treatment and valid evidence routes required across:

- Learn;
- Practice;
- Exam Prep; and
- learner-evidence mapping.

Do not impose arbitrary asset quotas. Asset volume and treatment type must emerge from educational need and exam demand.

### 4. Produce complete learner assets

Generate the learner-facing course required for the restricted pilot.

#### Learn

Provide comprehensive reading-first teaching that covers the intended course scope, including where justified:

- core explanations;
- definitions in context;
- examples/non-examples;
- comparison of theories or approaches;
- research evidence and interpretation;
- causal/relationship explanations;
- research methods and quantitative procedures;
- worked examples;
- misconceptions and repairs;
- evaluation/limitations where required;
- synoptic links; and
- purposeful visuals where they materially improve understanding.

#### Practice

Provide active Practice capable of validly testing the knowledge/skills represented by the course, including appropriate combinations of:

- retrieval;
- discrimination;
- short constructed response;
- application;
- research-method and quantitative practice;
- reasoning/analysis;
- evaluation/judgement;
- misconception diagnostics;
- mixed-topic work;
- repair items; and
- spaced rechecks where supported by the product.

#### Exam Prep

Provide enough authentic Revision-owned Exam Prep for the restricted pilot to prepare for AQA 7182 assessment, including where appropriate:

- paper orientation;
- command/demand guidance;
- question-family walkthroughs;
- source/data handling;
- modelled and guided responses;
- independent exam-style questions;
- timed work;
- mixed/synoptic sets; and
- representative full-paper/component simulations.

Do not represent Revision-authored assessment as official AQA material.

### 5. Build Marking Packs and evidence mappings

For written assessed items represented as eligible for governed assisted marking, create the applicable structured Marking Pack and calibration metadata required by the current assurance authority.

Every scored Practice/Exam Prep activity must map to the correct Psychology Course Truth node(s) and assessment demand so learner evidence does not overclaim what an activity demonstrated.

### 6. Run production-level assurance

Before restricted pilot publication, run all applicable controls from `80-company-workflows/Content Accuracy Assurance Gate.md` and the restricted-pilot boundary in `80-company-workflows/Content Pack Production and Assurance Workflow.md`.

This includes, where applicable:

- deterministic schema/reference/coverage validation;
- arithmetic and answer-key checks;
- paper/mark/duration/AO consistency;
- Marking Pack completeness and cross-reference checks;
- exact source-rights/provenance verification;
- fresh independent factual/educational challenge;
- fresh independent assessment/authenticity challenge; and
- targeted remediation plus affected-scope revalidation.

No unresolved `blocking` or `material` assurance finding may remain at restricted-pilot publication.

### 7. Integrate through the canonical learner architecture

Add Psychology through the ordinary published course/catalogue architecture rather than creating a Psychology-specific learner application fork.

The intended learner hierarchy is the approved course structure:

`Overview / Learn / Practice / Exam Prep / Progress`

Paper/component distinctions should sit in Exam Prep unless the exact AQA specification gives a genuine component-specific learning scope requiring the governed exception.

The course must be reachable through the canonical `/app/` learner runtime and course routes, and learner membership must use the existing course-membership mechanism.

### 8. Restricted student pilot verification

After deployment, verify with a real restricted test account that:

- Psychology appears correctly in the supported course catalogue;
- the course can be added to the learner's active programme;
- Overview, Learn, Practice, Exam Prep and Progress resolve correctly;
- required course/topic structure is present;
- Practice and Exam Prep evidence records against the correct academic IDs;
- Progress and REV consume the resulting evidence correctly;
- unsupported/empty capabilities are not implied;
- no material route or content integrity defect blocks normal study; and
- the learner can complete a representative end-to-end journey from learning through practice/exam preparation and feedback.

## Restricted pilot versus commercial benchmark

Passing this run authorises only the governed restricted-pilot state when the applicable publication authority permits it and the exact PR/commit has Founder approval.

It does **not** by itself make Psychology the commercial benchmark subject, prove qualified-expert equivalence, or replace the current Content Factory.

Before the pack is treated as a wider commercial teaching benchmark, the applicable qualified human subject-review gate still applies.

## Measurement contract

Instrumentation begins with this continuation rather than attempting to reconstruct the predecessor proof retrospectively.

Record at least:

- continuation start and completion timestamps;
- active elapsed working time where measurable;
- wall-clock elapsed time;
- AI/provider calls and spend;
- paid source/licence spend;
- manual interventions, grouped by cause;
- source discovery/rights-verification effort;
- reusable-source contribution to completed Course Truth;
- AI-created bridge/gap contribution;
- generated learner-asset counts by educational type only as supporting evidence, not as a success quota;
- deterministic assurance failures;
- independent-review findings by severity;
- remediation cycles and effort;
- total variable cost from continuation start to restricted-pilot readiness; and
- defects found during actual learner-pilot verification.

Headline commercial measures remain:

> **complete course coverage · elapsed time · total variable cost · manual intervention**

Reusable-source coverage and AI-created gap share remain important diagnostic measures beneath those headline outcomes.

## Stop / escalation conditions

Stop and surface the issue rather than silently weakening the course if any of the following occurs:

- a material course requirement cannot be supported by permitted evidence and cannot be independently authored safely from allowed subject truth;
- source rights remain materially ambiguous;
- AQA scope/assessment alignment cannot be established reliably;
- a material educational or assessment assurance finding cannot be resolved;
- the canonical learner architecture cannot represent the course without a material product/architecture change; or
- the remaining work indicates that the method is no longer economically plausible for catalogue-scale production.

A stop is evidence from the experiment, not permission to reduce the intended course scope without an explicit Founder decision.

## End condition and Founder decision after this run

When the restricted Psychology pilot is verified, report:

- what the complete course contains;
- what was sourced/reused versus newly bridged;
- actual production time and cost;
- manual intervention profile;
- assurance quality and remaining limitations;
- learner-pilot defects/observations; and
- whether the process appears reusable without rebuilding equivalent manual effort.

The Founder then chooses the next experimental/governance step, which may include:

- run a materially different second course using the now-measured method;
- automate specific bottlenecks exposed by the end-to-end Psychology run;
- promote a proven source-first successor production model through a separate governed authority change; or
- reject/redirect the method if the complete-course economics or quality are not strong enough.

No automatic promotion occurs.