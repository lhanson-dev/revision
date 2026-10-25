# Stage 5 — original market diagrams and graph-skill evidence experiment (24 October 2026)

**Programme:** #661, scoped follow-up #675. **Status:** non-publishing research and deterministic prototype assurance. This does not change the student app, create a Foundation node, approve Pearson course content, clear licensing or permit learner evidence publication.

## Purpose and exact source inputs

This package uses only the Revision-owned synthetic case `REV-SD-CASE-01` in `research/content-production-repeatability/edexcel-9bs0-shared-market-node-draft.json` (original Git blob `2fe25c0da25cecbeca386371e50df472f481a319`) to create three **new original SVG diagrams**. The effective 81-node Business v0.8 candidate remains unchanged, its snapshot fingerprint is `0f9a9423102cfa26b11dad1ed4d99eb5594c7b8a26d4d84fd8a42d2994dd0241` and it has not been approved for Edexcel reuse.

No Pearson specification prose, published question, teaching diagram or third-party textbook graphic appears in these SVGs. The market-model factual source checks are separately recorded in `edexcel-9bs0-market-source-factual-challenge.md`; LOUIS Microeconomics source permissions for a *new* commercial content operation still require an operation-specific rights record, and its separately credited third-party media is excluded. A diagram's being mathematically original does not by itself approve its source chain.

## Original diagrams / independent mathematical invariants

All diagrams have price **vertically** (GBP per pack), quantity **horizontally** (packs per week), line IDs, equilibrium markers, before/after comparison where relevant, textual accessible titles/descriptions and no remote images/scripts. Equations use `Qd=120−4P`; baseline `Qs=20+P`.

| Figure (research path within `market-graph-exemplars/`) | Supply and demand | Equilibrium(s) | Meaning |
| --- | --- | --- | --- |
| `edexcel-9bs0-market-baseline.svg` | D0, S0 | E0 P20/Q40 | Baseline market equilibrium |
| `edexcel-9bs0-market-supply-left.svg` | D0, S0, S1, where S1=10+P | E0 P20/Q40, E1 P22/Q32 | Costs increase; supply shifts left; price rises and quantity falls; D0 stays the same |
| `edexcel-9bs0-market-demand-right.svg` | D0, D1, S0, where D1=130−4P | E0 P20/Q40, E1 P22/Q42 | Preference increases; demand shifts right; both price and quantity rise; S0 stays the same |

The standalone `scripts/assurance/edexcel-9bs0-market-graph-preflight.mjs` verifies the **actual committed SVG geometry** against equations, including curve endpoints and equilibrium pixels (E0 x=240/y=180, cost E1 x=212/y=160, preference E1 x=247/y=160). It refuses distorted curves, swapped axes, wrong readings, missing text descriptions and external/active graphic markup. Its negative Vitest tests mutate those items and must fail as expected. It reports `foundation_change:false`, `evidence_promotion_allowed:false`, and `review_state:HOLD` even if every deterministic graph check passes.

## Assessment capability and current real learner implementation

The canonical learner journey is `/revision/app/#/courses/<course-id>/practice` under the single React app, **not** a new Edexcel-specific page. The currently implemented evidence schemas in `src/engine/evidence/evidence.ts` support recall, multiple choice, calculation and exam-question evidence; there is **no native graph-construction evidence event**, authenticated graph capture, curve-stroke assessor or explicit graph-drawing UI. It would be false to say that showing an SVG and accepting a correct multiple-choice answer demonstrates that a student can draw a supply-and-demand graph.

Two **independent skill targets** require separate assessment design:

1. **EDX-9BS0-MKT-14A — construct a labelled graph.** Proposed observable requirements: correct axis orientation and units; two correctly positioned and separately labelled baseline curves; consistent E0 price/quantity intersection. The prototype accepts a synthetic *structured coordinate submission* only to test its mathematical rubric; it does not observe a student's graphical strokes and cannot be persisted as learning evidence.
2. **EDX-9BS0-MKT-14B — interpret a graph.** Proposed observable requirements: identify which curve shifted, the price and quantity at E1, the two directions of change, and distinguish movement along an unchanged curve from shifting it. The prototype accepts structured fields for two original scenarios, but makes no student-mastery claim.

**Implementation decision required:** either (A) add a governed accessible diagram-construction learner interaction (which is a material learner feature and needs full Definition-of-Ready/Founder approval) with a reviewed marking and evidence schema, or (B) retain graph drawing as unverified/demonstrated only through separate teacher-reviewed work until an appropriately assured capture method is built. Plain interpretation tasks may use existing question modes if they genuinely test graph reading and are independently assessed; that is not a substitute for a drawing requirement. This project does not choose or self-approve a new feature.

## Explicit gates remaining

- Fixed-checklist fresh-context independent review (MKT-R1–R8) against the exact original draft and figures, with <=2 rounds and evidenced/material-only blockers.
- Qualified Business subject and assessment review: axes, curve ordering, shift/movement distinctions, A-level depth, accessible visual comprehension and correct marking expectations.
- Operation-specific source/attribution rights; do not treat a source-register entry or test green as a new licence decision.
- Approved source-universe/cohort and requirement reconciliation; exact Course/Exam Truth and AQA dependency analysis before new shared Foundation fingerprint.
- Any learner interaction must pass its own governed product-feature Ready gate and correctly designed durable/evidence boundaries before code is promoted to runtime.
- Controlled internal generation only after exact course `ai_assured` and production eligibility rules; public learner release remains independently gated.

**Proven here:** original figure geometry, simple algebra/curve stability and fail-closed prototype evidence boundary. **Not proven:** any student's skill, quality of published teaching, exam suitability, professional rights sign-off or current Foundation acceptance. **Provider calls/spend:** zero for this deterministic package.
