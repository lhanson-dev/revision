# Issue #698 — Psychology AQA 7182 standard deviation scored calculation correction

**29 October 2026 · Proposed learner content correction for the canonical /revision/app/ learner application.** This is one bounded remediation under the active #698 programme, not a new Practice engine or a declaration of full course adequacy.

## Exact source and finding

- Source: AQA Psychology **7182**, v1.4 September 2025, original pinned PDF SHA `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. The official PDF's **section 7.2, printed page 36** lists calculation of standard deviation under A-level mathematical requirements (distinct from section 4.2.3.2, printed page 20, which mainly describes range calculation and standard deviation as an interpretive measure). A pre-2025 AQA FAQ saying students would not calculate SD predates the new 2025 specification and cannot override its current Annex.
- Existing published Research Methods Learn page `research-methods-psy0726` teaches the idea of standard deviation but previously had no explicit complete calculation worked method. The 131 concept/scenario MCQs and 16 reveal-only drills cannot on their own demonstrate a student has **calculated** SD by entering a numerical result.
- Rights: AQA source is REFERENCE_ONLY; new explanatory text, synthetic cases and rubrics are independently Revision-authored, not AQA questions.

## Actual changes

- Add five short original teaching paragraphs to the existing published Learn page for `PSY-07-26`: mean, subtract, square differences, sum, divide by **N** for the explicitly named population convention, square root, round and interpret. Preserve all existing Learn page IDs and published source-truth history.
- Add **four original single-value numeric calculation questions** through the already-approved generic `ContentPack.practiceBank` path (no subject-specific app import or new UI); every record has a stable `rev7182` namespace, topic `research-methods`, source truth link `PSY-07-26`, matching Learn page ID and a full reconstructed worked answer. Every question explicitly specifies the population formula and two decimal places, so there is no ambiguous sample divisor. Exactly one mark is awarded for a correct **typed final numerical value**; working is supplied after checking but is **not** independently marked.
- Existing Practice renders calculations through `FocusedLearningWorkspace`, uses `checkCalculation` for typed numeric answers and `createCalculationEvidence` for owner-scoped scored records. This PR reuses those existing paths and leaves student enrolment, persistence schema, planner, progress rules, mocks, all 131 MCQs and all 16 drills unchanged.

## QA and limits

New deterministic regression covers exact source fingerprint, all four original arithmetic cases, permitted-answer rounding, negative wrong-answer cases (including sample-divisor choices), the actual three published ContentPacks, usable Practice pool/input type, linked Learn page and stable question IDs. Existing CI remains the release gate. A pass proves typed final-answer Practice exists and is numerically keyed correctly, **not** that students wrote correct workings or can construct graphs, explain inferential choices in writing, or perform every exam skill.

**Programme status:** All three completion gates in #698 remain open for Business and Psychology: every source obligation independently verified as adequately taught, every skill validly practised, and real hosted signed-in learner acceptance. Qualified independent educational assurance remains a separate honesty boundary. The next correction is constructed graph/scattergram and written application/evaluation evidence, while full source-to-learner semantic checking continues.

**Documentation impact:** new targeted technical implementation/QA note only. Source-rights, Course Learning Blueprint, Content Factory ingestion and feature-Ready authority are unchanged. No prior audit or research evidence is rewritten. No new migration, marking engine, learner data transformation or additional right to copy AQA content is implied. PR-specific Founder approval is still required before merge.
