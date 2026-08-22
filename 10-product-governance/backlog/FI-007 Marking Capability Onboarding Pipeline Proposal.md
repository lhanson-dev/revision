# FI-007 — Marking Capability Onboarding Pipeline Proposal

**Document type:** non-authoritative feature-analysis proposal  
**Status:** Proposed / under Analyse  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Owner:** Product / Founder  
**Date:** 2026-08-22

## Purpose

Define the reusable process Revision should use to add AI-assisted marking to additional papers, courses, specifications, awarding bodies and subjects after the 7131 AS Business Paper 2 pilot establishes a working pattern.

The 7131 pilot is the **reference implementation**, not a one-off exception. The objective is to discover the smallest reliable platform contract and assurance process that can be reused at scale without assuming that marking quality automatically transfers between academic contexts.

This proposal is non-authoritative. It does not approve implementation, a provider/model, or a release threshold.

## Governing fit

The marking-onboarding pipeline should compose with existing Revision workflows rather than create a parallel content-governance system:

- exact course/component identity comes from the Course and Assessment Component Classification Check;
- sources, coverage and educational provenance come from the Content Pack Production and Assurance Workflow;
- marking guidance and original assessment content are subject to the Content Accuracy Assurance Gate;
- learner-facing marking behaviour remains governed by Assisted Exam Answer Marking authority;
- human benchmark evidence and confidence calibration remain specific to the marking capability; and
- production changes still follow the normal governed implementation and release path.

## Core scaling principle

**Reuse platform architecture and process; revalidate academic marking claims.**

A successful Business Paper 2 marker may establish reusable infrastructure such as:

- marking-pack schema;
- model-routing interface;
- structured result schema;
- confidence/arbitration mechanism;
- attempt/evidence storage;
- entitlement metering;
- benchmark tooling;
- admin/assurance reporting; and
- learner result components.

It must not automatically establish that the same configuration marks another paper, qualification or subject accurately.

## Marking Capability Onboarding Pipeline

### Gate 0 — Candidate definition

Record:

- subject;
- qualification level;
- awarding body;
- specification code/version;
- paper/component/question class;
- exam series/cohort relevance;
- learner need and expected volume;
- whether the course is classification A, B or C under the existing component-classification workflow.

Output: **Marking Candidate Record**.

### Gate 1 — Assessment authority and marking-pack readiness

Confirm the candidate has governed access to everything required to mark a supported question:

- exact question identity/text;
- source/case/context where applicable;
- mark allocation;
- assessment objectives/weights where applicable;
- mark scheme or governed marking criteria;
- level descriptors;
- indicative content where applicable;
- examiner/assessment guidance needed to interpret the scheme;
- provenance/version/date checked; and
- explicit marking eligibility.

Apply existing source hierarchy and Content Accuracy Assurance controls.

Output: **Assured Marking Pack**.

If the academic marking basis is ambiguous or cannot be represented without invention, stop. Do not compensate with a more capable model.

### Gate 2 — Question-class taxonomy

Define the distinct marking behaviours inside the candidate scope, for example:

- short point-based responses;
- calculation/data responses;
- application/analysis responses;
- level-of-response evaluation essays;
- source/text interpretation;
- language writing/speaking; or
- subject-specific forms not yet represented.

Question classes are validated independently where their marking semantics differ materially.

Output: **Question-Class Matrix**.

### Gate 3 — Rapid feasibility pilot

Use a deliberately small, non-release set to answer whether the existing marking platform can plausibly support the new class.

Default starting rule after the first reference implementation:

- 10–20 representative answers per materially different new question class;
- trusted human reference marks;
- boundary and adversarial examples included;
- permitted to tune marking contract/model configuration;
- no production accuracy claim.

For a new paper within a previously validated subject/specification, a smaller delta set may be justified if the academic marking contract is demonstrably the same. The justification must be recorded.

Output: **Feasibility Result** — proceed / adapt architecture / hold.

### Gate 4 — Stage A architecture benchmark

Where the candidate passes feasibility, build the tuning/architecture benchmark.

Default baseline:

- approximately 60 answers for a substantial new marking scope;
- independent double human marking;
- moderation/adjudication of material disagreement;
- weak/middle/strong/boundary/adversarial cases;
- multiple questions and syllabus contexts;
- architecture/model comparison where required;
- human-human agreement measured alongside AI-human agreement.

The number is a baseline, not a ritual. Smaller or larger sets require evidence-based justification based on question-class complexity, transfer evidence and consequence of error.

Output: **Architecture & Confidence Recommendation**.

### Gate 5 — Held-out release benchmark

Create unbiased evidence for the exact classes intended for release.

Default baseline for a substantial new scope:

- approximately 180 previously unseen answers;
- double-marked/adjudicated reference results;
- deliberately strong boundary/adversarial representation;
- no tuning on the held-out set;
- zero fabricated assessment criteria;
- accuracy, bias, confidence, stability and feedback-usefulness gates applied.

A validated question class may proceed while another remains held.

Output: **Marking Validation Certificate** for the exact qualification/component/question classes and marking-pack/model-contract versions tested.

### Gate 6 — Commercial and operational validation

Measure:

- inference/caching cost;
- re-mark cost;
- arbitration frequency/cost;
- latency and P95;
- failure/retry rate;
- heavy-use distribution;
- entitlement impact; and
- operational review load.

Test against current AI/REV cost envelopes and customer-facing allowances without degrading truth quality.

Output: **Cost & Operations Fit**.

### Gate 7 — Controlled learner launch

Before wider exposure:

- exact supported scope is registered;
- unsupported question classes fail closed;
- learner-facing confidence behaviour matches benchmark evidence;
- marking is labelled accurately;
- attempts and marking versions are traceable;
- `Check this mark` arbitration exists where required;
- admin/Founder assurance can see quality/cost/failure signals;
- evidence/readiness integration respects independent versus assisted attempts.

Output: **Supported Marking Catalogue Entry**.

### Gate 8 — Live monitoring and revalidation

Monitor at minimum:

- disagreement/Check-this-mark rate;
- material correction rate;
- false-credit/false-penalty findings;
- unsupported/fabricated-criteria incidents;
- latency/failure rate;
- cost by marking class/route;
- learner feedback usefulness;
- drift after model/prompt/marking-pack changes.

Revalidation triggers include:

- awarding-body specification or mark-scheme change;
- material marking-pack change;
- model/provider/configuration change beyond validated tolerance;
- systemic marking defect;
- material confidence/arbitration change; or
- expansion to a materially new question class.

Historical validation evidence is retained; it is not rewritten.

## Reuse levels

To scale efficiently, every onboarding should classify how much proven evidence can be reused.

### Level R0 — New marking domain

New subject/assessment form with little trustworthy transfer evidence.

Use full pipeline.

### Level R1 — New course/specification in familiar subject

Some architecture/marking behaviours may transfer, but academic criteria differ.

Reuse platform components; run targeted feasibility plus appropriately sized Stage A/B evidence.

### Level R2 — New component/question class within a validated specification

If the marking semantics are substantially shared, reuse more infrastructure and benchmark evidence, but validate the new component/class explicitly.

### Level R3 — New governed questions inside an already validated class

No new model benchmark should be required merely because new questions are added, provided:

- marking-pack structure fits the validated contract;
- content/marking guidance passes normal educational assurance;
- no new marking semantics are introduced; and
- live sampling/revalidation controls remain healthy.

This is the scale target: once a question class is validated, adding ordinary assured questions should become a content-operation process rather than a fresh AI research project.

## Standard reusable artifacts

The 7131 pilot should deliberately produce templates/schemas for:

1. Marking Candidate Record;
2. Assured Marking Pack;
3. Question-Class Matrix;
4. Human Benchmark Answer Record;
5. Architecture Evaluation Record;
6. Confidence/Arbitration Report;
7. Cost & Latency Report;
8. Marking Validation Certificate;
9. Supported Marking Catalogue Entry; and
10. Revalidation/Incident Record.

Where practical these should become typed schemas and automated reports rather than free-form documents.

## Automation target

After the reference implementation is stable, the desired operator experience for adding a new marking scope is approximately:

`select course/component → ingest/confirm official sources → generate marking-pack candidate → assurance review → classify question types → attach/import benchmark answers + human marks → run benchmark suite automatically → receive quality/cost report → approve supported classes → publish`

The system should automate repeatable mechanics while keeping academic judgement and release approval explicit.

## Definition of success for the 7131 reference implementation

The 7131 AS Business Paper 2 pilot is not fully successful merely when it marks one learner's answers well.

It should also prove that Revision can extract a reusable:

- data contract;
- assurance contract;
- benchmark harness;
- confidence/arbitration method;
- release certificate;
- catalogue registration model; and
- revalidation process.

A future subject should not require redesigning the entire AI marking system.

## Documentation impact

If this process proves effective through 7131 and is Founder-approved for reuse, it should be promoted from FI-007 analysis into an appropriate company workflow under `80-company-workflows/`, linked from the content-production/assurance workflows and indexed in `INDEX.md`.

That promotion should occur after the pilot has exposed and corrected weak assumptions; do not freeze the first draft as permanent operating authority before empirical learning.