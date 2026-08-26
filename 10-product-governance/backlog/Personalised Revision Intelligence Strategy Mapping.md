---
title: "Personalised Revision Intelligence Strategy Mapping"
document_id: "personalised-revision-intelligence-strategy-mapping"
document_type: "product-management-strategy-mapping"
authority: "non-authoritative product-management"
status: "active"
version: "1.0"
owner: "Product"
last_reviewed: "2026-08-26"
depends_on: ["00-company-foundation/Product Strategy.md", "10-product-governance/backlog/Product Feature Backlog.md"]
---
# Personalised Revision Intelligence Strategy Mapping

## Purpose

Keep the Founder-approved **Personalised Revision Intelligence** strategy visibly connected to the canonical product feature backlog without creating duplicate features or allowing a strategy document to bypass the governed feature lifecycle.

The governing strategic thesis lives in `00-company-foundation/Product Strategy.md`.

The canonical inventory, lifecycle state and Definition-of-Ready progression for individual capabilities remains `Product Feature Backlog.md`.

This mapping is deliberately non-authoritative product-management state. It explains how existing features contribute to the adopted strategy; it does not promote any feature to `Ready`, change an entitlement, or approve implementation scope.

## Strategy headline

> **Revision should know the student better after every useful interaction.**

The product should use that growing, evidence-aware understanding to make teaching, practice, feedback, exam preparation and recommendations more useful over time.

The connected flywheel is:

**REV recommends → learner learns → learner practises → Revision observes evidence → feedback explains meaning → learner improves → learner model updates → REV makes a better recommendation.**

## Front-and-centre strategic priorities

The highest-priority product system is not a list of competitor-parity tools. It is the connected learner-intelligence loop below.

| Strategic priority | Canonical feature ownership | Current lifecycle | Strategic role |
|---|---|---|---|
| Adaptive next-best-action planning | **FI-001 — Intelligent Exam Calendar / Adaptive Revision Planner** | Live | Planning intelligence: turns evidence, exam context and realistic time into the next useful action. |
| Full contextual REV | **FI-003 — Full REV Intelligent AI Tutor** | To Do | Conversational/proactive interface to curriculum intelligence, structured learner state, feedback and planning context. |
| Initial useful learner signal | **FI-006 — Initial Course Starting Check / Periodic Knowledge Check-in** | Ready | Provides deliberately low-strength directional evidence when Revision knows little about a new course. |
| Evidence-linked exam marking | **FI-007 — Assisted / AI Exam-Answer Marking** | Analyse | Turns written exam work into useful feedback, evidence, readiness context and next actions rather than a mark alone. |
| Curriculum scale | **FI-008 — Assured Subject / Qualification Catalogue Expansion** | New | Expands addressable learner value using assured content and reusable product surfaces rather than subject-specific forks. |
| Adaptive recall / forgetting intelligence | **FI-009 — Adaptive Retrieval / Spaced Repetition** | New | Resurfaces knowledge when evidence is stale or checking again is a high-value use of limited revision time. |
| Weakness Repair — targeted practice | **FI-010 — Weakness-Driven Targeted Tests** | New | Selects useful practice from current evidence gaps, stale evidence or readiness needs. |
| Weakness Repair — misconception recovery | **FI-011 — Misconception Recovery / Wrong-Answer Mode** | New | Explains, retries and re-evidences recurring misconceptions or meaningful mistakes without punitive mistake lists. |
| Exam-soon prioritisation | **FI-012 — Exam-Soon Focused Review Mode** | New | Applies the same evidence-aware system under constrained remaining time rather than introducing panic-driven cramming. |
| Selective richer learning formats | **FI-014 — Selective Video and Audio Learning** | To Do | Adds formats only where they materially improve understanding, accessibility or engagement and connect back into practice. |
| Sustainable commercial layer | **FI-002 — Subscription Plans / Feature Entitlements and Upgrade Journey** | Analyse | Enables Free/Paid/Premium packaging while preserving educational truth and the genuinely useful Free loop. |
| Later teacher distribution | **FI-018 — Teacher / Classroom Tools** | Parked | Potential acquisition/distribution channel only if it strengthens the learner system without becoming an LMS. |

## FI-003 strategic mandate — structured learner memory

**Do not create a separate generic “AI memory” feature merely to claim that REV remembers things.**

FI-003 already owns the fuller context-aware tutor and explicitly requires structured learner context rather than unbounded conversational history. During FI-003 analysis, its Definition of Ready should make the structured learner-memory contract explicit enough to answer:

- what learner state REV may use;
- which state is educational evidence versus planning context or preference;
- how provenance, recency and confidence are preserved;
- how recurring misconception patterns are established without overreacting to one error;
- how stale/uncertain evidence becomes available to adaptive recall;
- what conversational information may persist and under what permission/privacy rule;
- how learner state is summarised/retrieved without replaying unlimited history; and
- how the learner can receive truthful explanations when REV lacks enough context or confidence.

The strategic objective is a **structured educational memory**, not chat-history accumulation.

## Weakness Repair is one product loop, not two disconnected modes

FI-010 and FI-011 should be analysed separately where implementation ownership or evidence requirements differ, but their learner experience should ultimately support one coherent strategic behaviour:

**detect → explain → repair → retest → update the evidence → decide what matters next.**

A useful weakness-repair experience may therefore combine:

1. a meaningful weakness or misconception identified from sufficient evidence;
2. a plain-language explanation of what matters;
3. an appropriate repair step — explanation, example, recall, targeted practice or exam technique;
4. a retry or related test that produces new evidence;
5. a cautious interpretation of whether the evidence improved; and
6. an updated recommendation or return to the wider plan.

Viewing an explanation must not itself clear a weakness. One correct retry must not automatically establish durable mastery. Existing evidence and claims authority remains controlling.

## Adaptive recall is not “build flashcards”

FI-009 should remain centred on the **decision to resurface knowledge**, not on building a large generic flashcard product.

The strongest learner experience is closer to:

> These are the things worth checking again now.

than:

> Choose a deck to revise.

The feature should integrate with the wider adaptive planner and use evidence recency/confidence, previous recall, exam proximity, curriculum importance and competing priorities where validated. It should not create a second task scheduler or endless repetition debt.

## Exam marking is an improvement engine

FI-007 should be evaluated against the full loop:

**answer → marking/feedback → understand why → identify pattern or gap → improve → retry/practise → readiness/evidence updates → better next action.**

A marking feature that only returns a number is strategically incomplete even if the mark itself is accurate.

## Bootstrap priority test

When choosing between these candidates, product sequencing should favour the capability that most improves the compounding learner loop for the least founder, engineering, content and variable-AI burden.

Competitor parity alone does not move a feature up the queue.

Particularly challenge investments that:

- create a new destination without strengthening learner evidence or guidance;
- require extensive content/operations work but create little reusable system value;
- use generative AI for deterministic work;
- add a second planner, scheduler or progress model;
- create engagement metrics without educational usefulness; or
- pull Revision toward an LMS, social network or general homework platform.

## Deliberate lower-priority / later candidates

The following existing backlog areas remain useful to preserve, but the adopted strategy does not make them near-term priorities merely because competitors offer them:

- **FI-015 — Learner Uploads → Personal Study Materials**: convenience value, but weaker strategic fit and significant provenance/privacy complexity;
- **FI-016 — Offline / Downloadable Study**: useful resilience/convenience, low differentiation relative to the core intelligence loop;
- **FI-017 — Native Mobile Applications**: revisit when responsive web evidence demonstrates a meaningful platform limitation;
- **FI-018 — Teacher / Classroom Tools**: remain Parked until the direct learner proposition is proven and scope can avoid LMS expansion;
- broad community/social, leaderboard, multiplayer or generic AI-toolbox concepts should not be introduced without a fresh strategic case.

## Backlog maintenance rule

When any mapped feature enters active analysis:

1. read `00-company-foundation/Product Strategy.md` alongside its feature entry;
2. explicitly state how the proposed scope strengthens the learner-intelligence loop;
3. define what reliable learner evidence or context it consumes and produces;
4. define how its output affects later recommendation/support, if at all;
5. challenge whether deterministic logic can replace unnecessary AI calls;
6. map Free / Paid / Premium behaviour where commercially relevant;
7. include the bootstrap opportunity-cost assessment; and
8. update this mapping if ownership or sequencing materially changes.

No mapping entry bypasses the feature lifecycle. `New → To Do` and `Analyse → Ready` retain their required human approval boundaries.
