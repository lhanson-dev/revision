# FI-007 — Assisted / AI Exam-Answer Marking Analysis

**Document type:** product feature analysis  
**Authority:** non-authoritative product-management analysis; approved product behaviour is promoted into `10-product-governance/Assisted Exam Answer Marking.md`  
**Status:** Analyse  
**Owner:** Product / Founder  
**Feature:** FI-007 — Assisted / AI Exam-Answer Marking  
**Last updated:** 2026-08-21  

## Purpose

Track the remaining Definition-of-Ready work for FI-007 without allowing backlog analysis to compete with approved product authority.

FI-007 remains `Analyse`. No material production implementation is authorised until every applicable Definition-of-Ready criterion is satisfied and the Founder explicitly approves `Analyse → Ready`.

## Current product problem

Revision already supports exam-style written questions and marking guidance, but self-marking asks the learner to make the hardest judgement themselves: whether their answer actually earned the marks.

FI-007 should close that gap by helping a learner understand:

- what their answer demonstrated;
- where marks were earned;
- where marks were missed;
- how to improve the answer; and
- what useful revision action should follow.

The strategic loop is:

`answer → marking/feedback evidence → learner state → readiness/planner/REV → next action`

The feature must not create false examiner-like certainty where evidence or model reliability is insufficient.

---

## Founder-approved MVP boundary — 21 August 2026

The MVP is deliberately bounded:

- supported Revision-authored/assured exam-style written questions only;
- typed answers only;
- exact governed question and marking-pack context;
- confidence-controlled provisional marking;
- grounded explanation of earned and missed marks;
- prioritised improvement guidance;
- learner improve/resubmit loop;
- independent versus feedback-assisted attempts kept distinct in evidence;
- AI marking produces structured evidence but does not directly declare mastery/readiness; and
- initial narrow catalogue, expected to begin with the AQA Business pilot subject to feasibility confirmation.

The marking contract is conceptually:

`known question + known assessment context + governed marking pack + learner answer`

It is not generic marking of arbitrary uploaded or pasted material.

### MVP exclusions

The MVP excludes:

- handwriting/photo/OCR marking;
- document/PDF uploads;
- arbitrary external questions;
- unrestricted past-paper ingestion;
- every board/subject at launch;
- whole-paper automatic marking;
- automatic Exam Simulator full-paper marking;
- teacher/classroom marking workflows;
- voice answers;
- learner ranking;
- single-answer predicted grades;
- default complete-answer rewriting; and
- numeric marks where Revision lacks governed marking criteria and an approved mark allocation.

---

## Founder-approved learner experience — 21 August 2026

Assisted marking is embedded inside supported Practice / later Exam Prep questions rather than exposed as a generic standalone `AI Marker`.

The approved flow is:

`supported question → independent or truthfully assisted typed answer → Mark my answer → saved attempt → simple marking state → confidence-controlled result → concise explanation → improve/resubmit or appropriate next action → structured evidence → wider Revision loop`

Key rules:

- the first independent attempt is preserved before marking starts;
- pre-submission hints/REV help may be offered, but materially assisted answers must be represented as assisted evidence;
- processing should say simply **Marking your answer…** rather than invent fake AI stages;
- failures confirm that the learner's answer is saved;
- results are scannable first: mark, interpretation, strengths, missed marks, improvement actions and next action;
- deeper marking detail is progressively disclosed;
- low confidence changes the outcome rather than being hidden behind a pseudo-precise confidence percentage;
- borderline answers may use a justified range where validation supports it;
- insufficient-confidence cases receive no fake numerical precision;
- learners can use **Check this mark** to dispute a result;
- improve/resubmit is inside MVP and preserves the original answer;
- a complete model answer is not shown immediately by default; and
- the mobile-first interaction must meet Revision's WCAG 2.2 AA target.

**Experience and simplicity is therefore PASS for the approved MVP direction.**

---

## Founder-approved FI-007 packaging direction — 21 August 2026

The Founder approved a clear, know-before-use entitlement model and then refined the marking ladder so FI-007 itself provides a visible upgrade benefit while the complete site-wide Free / Paid / Premium matrix is defined separately through FI-002.

### Current approved marking proposition

| Tier | FI-007 AI marking |
|---|---|
| **Free** | **5 AI-marked exam questions per month** |
| **Paid** | **30 AI-marked exam questions per month** |
| **Premium** | **Unlimited AI marking for legitimate learner use** |

Each counted Free or Paid question includes **one improvement re-mark of the same question**.

### Why this ladder is clearer

The learner can understand the feature fence before purchase and before use:

- Free proves the complete mark → feedback → improve → re-mark loop;
- Paid provides a substantial serious-revision allowance of roughly one new AI-marked question per day across a month; and
- Premium removes the marking-volume constraint for intensive legitimate revision use.

The marking capability itself must not become less accurate, less safe, less evidence-grounded or less accessible on lower tiers. The commercial difference is quantity, not truth quality.

### Transparency rules

- Free and Paid learners must be able to see how many AI-marked questions remain and when the allowance resets before relying on AI marking.
- Free and Paid reset monthly with no rollover for MVP.
- Premium should show `Unlimited` rather than an artificial very-large counter.
- if Premium is marketed as Unlimited, legitimate ordinary learner use cannot be subject to a hidden normal-use ceiling;
- abuse, automation and attack controls remain legitimate but cannot disguise a normal learner cap; and
- technical failures, low-confidence non-marks, suppressed duplicates and **Check this mark** do not consume a Free or Paid allowance unit.

### Scope boundary: FI-007 is not the whole Premium proposition

The 5 / 30 / Unlimited ladder is approved **for marking analysis**.

It contributes a concrete and understandable upgrade benefit, but it does not define the full site-wide Paid/Premium proposition. Current subscription authority still requires Premium to be a coherent, genuinely stronger overall plan rather than merely `Paid with larger limits` across the product.

The complete Free / Paid / Premium feature matrix across Revision must therefore be handled as a separate FI-002 packaging task. FI-007 must not invent unrelated Premium features or pre-approve FI-003 merely to make this feature decision look complete.

### Review rule

The 5 / 30 / Unlimited model is the current Founder-approved FI-007 product direction, not an immutable claim.

Technical and economic analysis must test whether:

- 30 Paid questions per month is sustainable within the approved £6.99/month / £59.99/year commercial envelope; and
- genuine Unlimited Premium marking is sustainable within the approved £12.99/month / £109.99/year commercial envelope,

while both tiers continue to meet the same required marking-quality bar.

If evidence shows the approved ladder is not sustainable, FI-007 must return to the Founder with a transparent revised proposition before launch. The product must not quietly solve the problem with hidden caps or degraded marking quality.

**Free / Paid / Premium packaging is therefore PASS for FI-007 product direction, with technical/economic feasibility still blocking `Ready`.**

---

## Evidence and intelligence boundary

AI marking creates structured assessment evidence. It does not directly decide mastery, readiness, predicted grade or final topic state.

The marking evidence record should include, where applicable:

- question identity and academic context;
- answer/attempt reference;
- independent/assisted attempt type;
- mark/max where reliable;
- marking confidence;
- AO/topic/specification signals;
- model/method/version;
- marking-pack/version; and
- review/exception state.

Revision's deterministic evidence/readiness system decides what the event means alongside other evidence.

One AI-marked answer must not automatically redefine the learner's overall state.

Repeated feedback-assisted rewrites must not mechanically inflate independent exam readiness.

---

## Validation objective

The core validation question remains:

**Can Revision mark bounded supported exam answers closely enough to trusted human marking that the resulting feedback is safe and useful for learners?**

Before production trust is established, FI-007 needs a human-marked benchmark spanning:

- weak, average and strong answers;
- incomplete answers;
- borderline level/band answers;
- unusual but valid answers; and
- plausible but incorrect answers.

Candidate quality measures include:

- exact-mark agreement;
- acceptable mark tolerance;
- level/band agreement;
- AO agreement;
- false-credit and false-penalty rates;
- fabricated/unsupported criterion rate;
- confidence calibration;
- repeatability/stability;
- material disagreement/review rate; and
- feedback usefulness/actionability.

Fabricated assessment criteria remain a zero-tolerance class of failure.

Exact quantitative release thresholds remain unresolved.

---

## Technical and economic feasibility now required

No model/provider is yet approved for FI-007.

The next feasibility work must determine:

1. which model/provider configurations can meet the required human-benchmark quality;
2. the governed prompt/marking-pack structure;
3. measured input/output usage per initial mark and included re-mark;
4. latency and retry characteristics;
5. how low-confidence detection and **Check this mark** arbitration should work;
6. likely normal and heavy exam-season learner usage;
7. monthly cost-to-serve distributions, not merely averages;
8. whether a cost-efficient primary marker plus stronger arbitration path is more reliable/economic than using one expensive model for every answer;
9. caching/reuse opportunities for stable marking-pack context;
10. whether the 30-question Paid allowance has sufficient commercial margin headroom; and
11. whether genuine Unlimited Premium use remains sustainable at its approved price.

Cost cannot override marking reliability. A cheap unreliable marker is not an acceptable way to make the feature economical.

---

## Relationship to adjacent features

### FI-003 — Full REV Intelligent AI Tutor

FI-007 is viable without full REV. REV may explain marking feedback in context, but the MVP marking flow does not require a full conversational tutor.

The separate site-wide tier-definition task may later decide how an approved FI-003 contributes to Paid or Premium. FI-007 does not make that decision.

### FI-002 — Subscription Plans / Feature Entitlements

FI-002 provides the reusable entitlement platform. FI-007 should declare its Free 5/month, Paid 30/month and Premium Unlimited states into that system rather than hard-code plan names in marking logic.

The broader site-wide Paid/Premium capability matrix remains separate FI-002 work.

### FI-020 — AI Case-Study Feedback and Coaching

Unscored guided case-study work remains coaching rather than formal marking unless it becomes a governed exam-style question with approved marks and marking criteria.

### Exam Simulator

Whole-paper automated marking remains outside FI-007 MVP. Question-level reliability must be proven first.

---

## Current Definition-of-Ready position

- Student problem and target user — **PASS for MVP direction**; learner practising supported written exam questions is clear.
- Strategic case — **PARTIAL**; strong fit established, opportunity-cost case still to close.
- User-value hypothesis — **PARTIAL**; core hypothesis is clear but falsifiable product success measures remain.
- Experience and simplicity — **PASS for MVP direction**; Founder-approved end-to-end journey recorded.
- Evidence / intelligence model — **PARTIAL**; evidence boundary agreed, weighting and confidence thresholds unresolved.
- REV role — **PASS for FI-007 MVP boundary**; contextual explanation is allowed but full REV is not required.
- MVP boundary — **PASS**; Founder approved 2026-08-21.
- Free / Paid / Premium — **PASS for FI-007 product direction**; Free 5/month, Paid 30/month, Premium Unlimited, subject to feasibility review before `Ready`.
- Upgrade / conversion hypothesis — **PARTIAL**; the FI-007 feature fence is clear, while the complete site-wide tier proposition and final purchaser journey remain FI-002 work.
- Measurement contract — **PARTIAL**; quality dimensions identified, product/usage thresholds unresolved.
- Admin / Founder assurance — **BLOCKED**; concrete operational visibility and thresholds unresolved.
- Risk / trust / accessibility — **PARTIAL**; important learner-facing controls are defined, remaining technical/control assurance unresolved.
- Technical feasibility and dependencies — **BLOCKED**; model/provider, marking architecture, latency and cost validation required.
- Test and assurance approach — **PARTIAL**; human benchmark principle agreed, full assurance design and release thresholds unresolved.
- Documentation / authority impact — **IN PROGRESS**; proposed normative FI-007 authority is included in the current governed PR and must merge before it becomes main-branch authority.
- Blocking decisions — **REMAIN**.
- Human Definition-of-Ready approval — **NOT REQUESTED / NOT GRANTED**.

FI-007 remains correctly in `Analyse`.

---

## Next FI-007 analysis decision

The next FI-007 increment should resolve **marking architecture, model/provider feasibility and release-quality economics together**, because product trust and the approved tier allowances depend on the same evidence.

The next recommendation should include:

- benchmark design and human reference-marking approach;
- candidate model/routing strategy;
- confidence and arbitration mechanism;
- measured or conservatively modelled cost per successful question cycle;
- Paid 30/month and Premium heavy-use sustainability scenarios; and
- proposed quality/cost gates required before FI-007 can progress toward `Ready`.

## Separate follow-on task — FI-002 site-wide feature matrix

After this FI-007 marking decision is recorded, a separate FI-002 task should define the **complete Free / Paid / Premium feature matrix across Revision** using the approved pricing/upgrade principles rather than solving commercial packaging one feature at a time.

That separate task should determine, across the full product:

- the core customer job and one-sentence value proposition for each tier;
- which capabilities are Free, Paid or Premium;
- which limits are quantitative versus capability-based;
- the small set of hero differences shown on pricing surfaces;
- contextual upgrade triggers across the learner journey;
- how parent/supporter benefits differ by tier;
- how higher-cost AI/REV capabilities contribute to the ladder; and
- whether the complete Premium bundle justifies its approved price independently of any one feature.

This is deliberately not folded into FI-007.

---

## Documentation impact check

The approved FI-007 product behaviour and 5 / 30 / Unlimited marking rules are promoted into `10-product-governance/Assisted Exam Answer Marking.md` in the current governed PR, and `INDEX.md` points to that authority.

This analysis update keeps the non-authoritative Definition-of-Ready record aligned while explicitly deferring the broader site-wide tier matrix to FI-002.

No production code or technical implementation documentation changes are authorised by this analysis increment.