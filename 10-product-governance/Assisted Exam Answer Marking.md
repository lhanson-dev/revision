---
title: "Assisted Exam Answer Marking"
document_id: "revision-assisted-exam-answer-marking"
document_type: "domain-authority"
authority: "product-governance"
status: "active"
version: "0.3"
owner: "Founder"
effective_date: "2026-08-21"
last_reviewed: "2026-08-21"
review_cadence: "quarterly"
content_review_status: "reviewed"
source_of_truth_for: ["FI-007 approved product behaviour", "assisted exam-answer marking MVP", "learner marking experience", "FI-007 entitlement and allowance rules"]
depends_on: ["Subscription Plans and Entitlements", "Core User Journeys", "Product UX Principles", "Tone of Voice Framework", "Evidence Trust and Educational Integrity", "Claims and Progress Governance", "Pricing and Billing Policy"]
supersedes: null
---
# Assisted Exam Answer Marking

## Purpose

Define the Founder-approved product rules for FI-007 — Assisted / AI Exam-Answer Marking while the feature completes its governed Definition of Ready.

This authority records approved product behaviour. It does **not** move FI-007 from `Analyse` to `Ready` and does not authorise material implementation. Remaining Definition-of-Ready gates include validated marking quality, technical and economic feasibility, evidence weighting, confidence thresholds, measurement, assurance and the final explicit human `Analyse → Ready` decision.

## Product outcome

Revision should reduce the weakness in self-marked written exam practice by helping a learner understand:

- what their submitted answer demonstrated;
- where marks were earned;
- where marks were missed;
- what would make the answer stronger; and
- what useful action should follow.

The intended learning loop is:

`answer → governed assisted marking → feedback → improvement → reassessment → structured evidence → wider Revision guidance`

The feature must not create examiner-like certainty where the marking evidence or model reliability does not justify it.

## MVP boundary

The FI-007 MVP marks only **supported Revision exam-style written questions** for which Revision controls or has deliberately assured the assessment context required for reliable marking.

The MVP input is **typed text only**.

Each supported question must have, as applicable:

- exact question identity and wording;
- qualification, exam board, specification and assessment-component context;
- maximum mark;
- topic/specification mapping;
- assessment-objective mapping where relevant;
- governed marking guidance, rubric or mark scheme appropriate to that question;
- level descriptors or indicative content where required by the assessment model;
- approved provenance sufficient to trace the marking basis; and
- an explicit indication that the question is eligible for assisted marking.

The marking contract is conceptually:

`known question + known assessment context + governed marking pack + learner answer`

It is not a generic AI instruction to infer how an arbitrary answer should be marked.

The first implementation should prove the approach on a narrow assured catalogue. The expected starting point is the existing AQA Business pilot, subject to the remaining technical/content feasibility gate.

### Deliberate MVP exclusions

The FI-007 MVP does not include:

- handwritten-answer marking;
- photographs or OCR;
- learner-uploaded PDFs/documents;
- arbitrary pasted external questions;
- unrestricted past-paper ingestion;
- every board or subject at launch;
- whole-paper automated marking;
- automatic Exam Simulator full-paper marking;
- voice answers;
- handwriting-quality assessment;
- teacher/classroom marking workflows;
- learner ranking/comparison;
- predicted grades derived from one marked answer;
- a mandatory fully conversational marking session;
- default AI rewriting of the learner's complete answer; or
- numeric marking where Revision lacks a governed marking source and approved mark allocation.

These are MVP scope controls, not permanent prohibitions on separately governed future capabilities.

## Learner entry and submission

Assisted marking is embedded into supported written exam-question practice. It is not a separate generic `AI Marker` destination in the MVP.

The learner sees the supported question and mark allocation, writes a typed answer, and uses:

**Mark my answer**

Revision must preserve the academic context already established by the activity. The learner should not be required to re-select subject, board, specification or marking scheme.

When the learner submits an answer, Revision must preserve the submitted attempt before the marking operation begins. Later edits must not silently overwrite the first submitted attempt, and accidental duplicate submissions must not create misleading evidence.

Empty answers may be blocked with a simple inline prompt. Short, weak or incomplete answers should not be rejected merely because they are likely to score poorly.

## Independent versus assisted attempts

Where a first attempt is intended to contribute meaningful independent exam-performance evidence, governed marking guidance must not be revealed before submission.

If hints, marking guidance or REV assistance materially shape the answer before submission, Revision may still mark it, but the evidence record must represent the attempt as assisted rather than independent.

Revision should not withhold useful help merely to manufacture stronger-looking evidence. It should preserve truthful evidence semantics about how the answer was produced.

## Marking state and failure recovery

The default processing state should remain simple and truthful, for example:

**Marking your answer…**

Revision must not invent fake multi-stage AI progress or claim specific marking stages unless they correspond to real product behaviour.

The learner's submitted work must already be safe before marking begins.

If marking fails, the experience must state what happened, confirm that the answer is preserved and offer a clear retry path.

## Result hierarchy

For a reliable result, the first view should normally present:

1. provisional mark, for example `7 / 9`;
2. a short plain-language interpretation;
3. a small source label such as **Revision-assessed mark**;
4. **What you did well**;
5. **Where you missed marks**;
6. **Make it stronger** — normally one to three prioritised improvement actions;
7. a context-sensitive primary next action; and
8. secondary disclosure such as **See how this was marked**.

The primary result must not dump the full mark scheme or a long AI explanation onto the learner before giving the useful interpretation.

Deeper disclosure may reveal relevant assessment objectives, mark/level reasoning, governed criteria and the parts of the learner response supporting the judgement where the validated design can do so reliably.

## Confidence-controlled marking

Internal marking confidence must change product behaviour rather than forcing the learner to interpret a pseudo-precise AI-confidence percentage.

### Reliable result

Revision may show a numerical provisional mark and grounded feedback, clearly labelled as Revision-assessed rather than an official awarding-body mark.

### Borderline / qualified result

Where validation shows that a range is more honest than an exact mark, Revision may show a bounded result such as `Likely 6–7 / 9` with a short explanation that the answer sits near a marking boundary.

### Insufficient-confidence result

Revision must not provide a precise numerical mark when it cannot do so reliably. It should state plainly that a reliable mark cannot be given while still offering safe, grounded qualitative review and an appropriate route to marking guidance or review.

Exact confidence thresholds remain subject to the human benchmark and validation contract before FI-007 may become `Ready`.

## Check-this-mark route

The learner must have a simple route to dispute a result using language such as:

**Think this mark is wrong? → Check this mark**

The normal learner interaction should not use examiner-like `Appeal` language.

A review must be deliberately designed. It must not simply repeat the same unconstrained marking request and replace the original result with whichever number appears next.

If a checked mark changes materially, Revision must explain that the judgement changed and preserve the relevant history rather than silently overwriting the first result.

## Improve and resubmit

Where improvement is the useful next action, the learner may select:

**Improve my answer**

and then:

**Mark my improved answer**

The original attempt remains preserved.

The experience should help the learner understand:

`what I wrote → what I changed → why it became better`

A high-scoring feedback-assisted attempt is legitimate learning evidence but must not automatically be treated as equally strong independent exam-readiness evidence.

A complete model/full-mark answer should not be the default immediate response to an imperfect first attempt. The intended sequence is feedback first, learner improvement second, and a strong example answer only later where educationally useful.

## Context-sensitive next action and REV boundary

The primary next action should respond to the result rather than always forcing resubmission. Examples include:

- substantial improvement opportunity → **Improve my answer**;
- strong/full response → **Next question**;
- low marking confidence → **Check this mark** or **Review marking guidance**; and
- a clear knowledge gap → a governed route to review the relevant topic when the wider product model supports it.

REV may remain available in context to explain feedback, but the MVP marking flow must not automatically turn every result into open-ended chat.

FI-007 uses the same approved marking truth, confidence controls and feedback-quality standard across all tiers. Commercial differentiation may change the **quantity** of successful AI-marked questions available, but must not create a deliberately worse marker for lower tiers.

The broader site-wide Paid/Premium proposition is outside FI-007. It must be defined separately through FI-002 and the relevant feature definitions. FI-007 does not pre-approve FI-003 or any other Premium capability.

## Accessibility and mobile behaviour

The learner experience must work mobile-first and meet Revision's WCAG 2.2 AA target.

At minimum:

- result meaning must not depend on colour alone;
- the full interaction must support keyboard operation;
- asynchronous completion, errors and processing states must be exposed accessibly;
- long answers and feedback must remain readable at supported viewports;
- marks, headings, feedback and actions must use screen-reader-compatible structure; and
- narrow screens must stack or switch answer/feedback views rather than forcing cramped desktop-style parallel panes.

## Learning-evidence boundary

The AI marking component produces structured assessment evidence; it does not directly declare mastery, readiness, predicted grade or final topic state.

The evidence record should include, as applicable:

- question identity and academic context;
- learner answer / answer reference;
- attempt type;
- mark and maximum mark where a reliable mark exists;
- marking confidence;
- assessment-objective and topic/specification signals;
- marking-method/model/version metadata;
- marking-pack/version metadata; and
- material exception or review state.

Revision's governed learner-state/evidence logic determines what this event means in combination with other evidence.

Payment status must not change marking truth, mark semantics, confidence rules, evidence meaning, safety or accessibility.

# AI-marking entitlement policy

Founder decisions on 21 August 2026 establish that FI-007 access must be **explicit, predictable and knowable before use**.

Revision must not use a vague model in which a learner can use AI marking until an undisclosed limit is reached and only then discover that a higher tier is required.

## Customer-facing unit

For quantitative tiers, the primary quantity is expressed as:

**AI-marked exam questions per month**

A successful initial AI mark for one supported exam question includes **one improvement re-mark of that same question** within the same unit.

Internal implementation may use a marking-cycle concept if useful, but the learner/payer proposition must not require customers to decode internal metering terminology.

## Approved FI-007 tier model

The current Founder-approved FI-007 entitlement direction is:

| Tier | FI-007 AI marking |
|---|---|
| **Free** | **5 AI-marked exam questions per month** |
| **Paid** | **30 AI-marked exam questions per month** |
| **Premium** | **Unlimited AI marking for legitimate learner use** |

Each counted Free or Paid question includes one improvement re-mark of that same question.

This is the approved FI-007 marking proposition, not the complete site-wide plan matrix. Paid and Premium require a coherent wider product proposition under `Subscription Plans and Entitlements.md`; that broader feature matrix is a separate FI-002 task.

A future change to these values or to the meaning of `Unlimited` is a product-policy change requiring explicit Founder approval and a governed update; it is not an implementation tuning parameter.

## Quantitative reset and rollover

Free and Paid allowances reset **monthly on a clearly displayed date**, regardless of whether the associated subscription is billed monthly or annually.

Unused Free or Paid AI-marking allowance does **not** roll over in the MVP.

The learner should be able to understand the remaining quantity and reset date before relying on AI marking, for example:

**AI marking · 3 of 5 remaining this month**

or:

**AI marking · 6 of 30 remaining this month**

When no Free or Paid allowance remains, the learner must be told before relying on AI marking that the allowance is exhausted and when it resets. The learner must still be able to complete the supported exam question and use the governed non-AI/self-marking route available on their tier.

## Meaning of Unlimited

If Premium is described as **Unlimited AI marking**, ordinary legitimate learner use must not be subject to a hidden normal-use ceiling.

Reasonable technical controls against automation, attacks, account abuse, non-learner bulk extraction or other misuse remain permitted. Those controls must not be used to disguise a normal quantitative cap for a genuine learner revising heavily.

If technical/economic validation shows that genuine Unlimited use is not commercially sustainable at the approved Premium price, FI-007 must return to the Founder for an explicit packaging decision **before launch**. Revision must not market Unlimited and later quietly impose an undisclosed ordinary-use cap.

## What consumes quantitative allowance

A successful initial AI mark of a supported exam question consumes one Free or Paid `AI-marked exam question` unit.

The first improvement re-mark of that same question is included in that unit.

Further repeated re-marking after the included improvement pass may consume an additional unit if that behaviour remains in the final validated design and is made clear before use.

The following must not consume Free or Paid allowance:

- a technical marking failure;
- a request for which Revision cannot provide a sufficiently reliable mark and returns the governed low-confidence/non-mark state;
- **Check this mark** review/arbitration;
- an accidental duplicate request suppressed by the product; or
- an unsupported/configuration failure for which Revision was unable to deliver the promised AI-marking outcome.

Allowance represents successful learner value delivered, not raw model/API calls made by the system.

## Cross-tier truth rule

Free, Paid and Premium must use the same approved marking truth, confidence and evidence-integrity rules.

Revision must not make Free or Paid marking deliberately less accurate, less safe, less accessible or less evidence-grounded to create upgrade pressure.

# Relationship to the broader Premium proposition

FI-007 creates a concrete marking feature fence: **5/month → 30/month → Unlimited**.

That feature fence can contribute materially to upgrade value. It does **not** by itself redefine the existing subscription rule that Premium must have a coherent, genuinely stronger overall proposition rather than merely being `Paid with larger limits` across the product.

The complete Free / Paid / Premium feature matrix across Revision must therefore be resolved separately through FI-002 and the Definition-of-Ready work for the affected features. FI-007 should not invent or pre-approve unrelated Premium benefits merely to complete this marking analysis.

# Parent / payer boundary

A billing customer may be shown what AI-marking access their chosen plan provides, but payment does not grant access to the learner's individual submitted answers, detailed AI marking feedback or private marking interactions.

Any parent/supporter visibility remains governed by the separate linked-supporter permissions and parent-visible data boundary in `Subscription Plans and Entitlements.md`.

# Feasibility and sustainability gate

The approved entitlement direction does not remove FI-007's technical/economic readiness gate.

Before FI-007 may become `Ready`, analysis must establish that the proposed service can meet the required marking quality and remain commercially sustainable. It must consider at minimum:

- validated model/provider choice for the supported marking task;
- measured input/output token or equivalent inference cost per initial mark and included re-mark;
- retries, review/arbitration and failure overhead;
- realistic learner usage distributions, including heavy exam-season use rather than only averages;
- the approved £6.99 Paid monthly / £59.99 annual commercial envelope for a 30-question monthly allowance;
- the approved £12.99 Premium monthly / £109.99 annual commercial envelope for genuine Unlimited marking;
- payment, tax, infrastructure, support and other contribution-margin headroom; and
- abuse controls that protect commercial viability without redefining ordinary legitimate learner use.

The model/provider must not be selected solely because it is cheap. Marking reliability and evidence integrity are release gates.

If the validated quality/cost profile cannot sustain the approved 5 / 30 / Unlimited model, the feature must return to the Founder with evidence and a revised transparent proposition. It must not solve the problem with hidden limits or degraded marking quality.

# Relationship to FI-002

FI-002 supplies the reusable entitlement platform. FI-007 declares its approved 5 / 30 / Unlimited marking rules into that system rather than hard-coding plan names inside marking logic.

The entitlement system must enforce Free and Paid quantitative allowances at both learner UX and protected server/API boundaries while preserving educational evidence and learner work already created.

Premium Unlimited state should be represented as an entitlement state rather than by inventing a very large fake numeric allowance.

The complete cross-site tier matrix remains governed through FI-002 and must be decided separately; FI-007 is only the marking-specific entitlement source.

# Documentation and implementation boundary

This authority is the normative source for the FI-007 rules already approved by the Founder.

The FI-007 backlog analysis remains product-management evidence and Definition-of-Ready tracking but must not override this authority.

No material FI-007 production implementation may begin until the feature completes the full governed Definition of Ready and receives explicit human `Analyse → Ready` approval.