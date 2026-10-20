# FI-001 — Original Business 7132 exam-assessment assurance queue

**Recorded:** 19 October 2026  
**PR / scope:** [#637](https://github.com/lhanson-dev/revision/pull/637), original authored 7132 Paper 1/2/3 simulations and their existing `ExamSimulator` self-assessment interaction  
**Prior exact-head engineering baseline:** `5fbf3d819a2367cedfe43e6f4b42316f2b0648af` (green Revision CI and thirteen-scenario comparison)  
**This document's review status:** **INTERNAL MECHANICAL SCREEN / INDEPENDENT A3 + A4 SUBJECT REVIEW NOT EXECUTED — HOLD**  
**Governed route:** authenticated `/revision/app/` → Courses → Exam Prep; supported Home, Plan and REV recommendations route to one exact original question  
**Source:** approved AQA 7132 Board Alignment / Exam Truth in `content/business/aqa-a-level/shared/exam-papers.ts`, bounded provenance in `content/business/aqa-a-level/SOURCE_AND_COVERAGE.md`, and original Revision-authored `paper-{1,2,3}/exam.ts`.

## Inventory subject to independent challenge

| Original Revision-owned simulation | Printed / attempted | Format/demand | Critical A3/A4 checks |
|---|---:|---|---|
| Paper 1 — Business 1 | 26 question entries; 150 / 100 marks | 15 one-mark four-option MCQs, seven short responses totalling 35, two explicitly A/B 25-mark essay groups | 15 correct letters and all distractors; finance/break-even/decision math; both distinct essay alternatives per group; sustained AO3/AO4 evaluation and credible rubric for both A and B |
| Paper 2 — Business 2 | 12 compulsory parts; 100 / 100 marks | Three data-response sections (33, 33, 34 attempted marks), three distinct Revision case businesses in the one simulator stimulus field | Case-derived operating margin, gearing and decision expected value/net gain; each short answer grounded in the correct case; 14-mark judgement levels, mark guidance and plausible counterarguments |
| Paper 3 — Business 3 | Six compulsory items; 100 / 100 marks | One integrated Cedar Mobility case; quantitative interpretation, investment appraisal, strategic choice/change | Four independently recalculated financial ratios, coherent case data, source-stated payback/ARR/NPV (not independently derived from cash flows), and 16–24-mark judgement/anchor validity |

**Total:** 44 printed original question entries, of which 42 are attempted in a complete three-paper run (24 Paper 1, 12 Paper 2, six Paper 3). The identical ten required Business syllabus areas are shared across papers. Question-option counts must not be interpreted as full-paper learner answer counts or as independent assessment of educational quality.

## Deterministic checks prepared in PR #637

- Each question's declared assessment-objective marks equal its own marks; section attempted totals match approved 15/35/25/25, 33/33/34 and 100. The Paper 1 essay choices preserve 150 printed, 100 attempted, and original content IDs are not recycled.
- An explicit `paper-alternative` choice group must represent exactly two distinct, uniformly typed options in the same published section, with an explicit full printed-marks total. A single essay disguised as "one from two", cross-section mixture or mixed syllabus/paper option must fail structural validation. Legacy Psychology syllabus-choice semantics are separate and unchanged.
- The original MCQ answer letters are present and match one of the displayed four answer options; the checking system **does not** independently determine which letter is substantively correct.
- Using the **actual authored prompt and case source numbers**, calculate and compare the stored guidance: Paper 1 contribution/break-even, ROCE, expected value/net gain; Paper 2 operating profit margin, gearing, expected value/net gain; Paper 3 profit margin, ROCE, current ratio, gearing. The test should fail after editing source scenario numbers without corresponding numeric guidance changes.
- The existing timed/focused original exam simulator, selected-only A/B essay answer/marking, source-safe exact Start, Psychology option non-regression and learner-evidence boundaries remain part of full CI. A source-mapped question is *not* a professionally marked or examiner-assured question.

**Mechanical assertion scope:** arithmetic, ID/scope integrity, totals and deterministic rendering only. It does not judge fairness, authenticity, ambiguous wording, mark-band calibration, alternative legitimate reasoning or the impact of self-assessment bias.

## Independent A3 review — requires a different fresh context and retained issues

1. Independently read the *exact candidate revision* of the 44 original questions with permitted 7132 specification and Exam Truth **without treating this document's assessments as an answer key**. Validate every MCQ letter, uniqueness/quality of distractors, accuracy and relevance of each original question, source-relevance, data assumptions and calculations. Any incorrect, ambiguous or misleading answer is a material HOLD.
2. Challenge the Paper 1 Section C/D four separate essays for suitability as two genuine alternative 25-mark options per section, balanced demand, appropriate AO emphasis, clarity and plausible alternative conclusions.
3. Challenge Paper 2's three separately named case scenarios and Paper 3's single integrated case for contradictions, impossible business assumptions, use of the right source data and paper-specific answer technique. Compare paper format/marks with approved Exam Truth; don't invent official AQA per-question mark allocations.
4. Report findings by question ID, precise source/version, observation, severity, suggested remediation, and independently corroborated evidence/reference. Remediation invalidates affected review results until the changed exact content has been rechecked.

## Independent A4 marking/assessment reliability — not fulfilled by current learner UI

1. For written questions, qualified reviewer to check what would earn full/partial/no marks, acceptable alternative approaches, levels/descriptors for sustained evaluation, and risks of the current brief `markingGuidance` encouraging an incorrect answer or mark award.
2. Review the 25-mark essay alternatives, 14-mark Paper 2 evaluations and 16/20/24-mark Paper 3 judgements as high-impact items. Current on-screen guidance is not a calibrated externally validated Marking Pack with independent anchor responses.
3. Evaluate explicit **self-assessed** marks versus actual evidence weight. A student marking their own essay does not demonstrate independent examiner-grade competence; do not promote such observations to a stronger evidence claim without governed evidence-model assurance.
4. Deliver an exact-version portable review package with permitted full original questions, stable item IDs, permissible AQA reference links, issue ledger, source/rights records, AO and section contracts and clear human sign-off decisions. No blanket "approved" state may be inferred.

## Open blocking work and decision record

| Gate | Current result | Needed evidence |
|---|---|---|
| Source rights / owned text provenance | Revision-owned content with approved Exam Truth structure; no official AQA past paper claimed | Check exact source/licence register remains valid for the exported reviewer package |
| Structural validation / arithmetic | Candidate executable tests; confirm at exact PR head | Green CI with negative-choice regression and source-number-based answer calculations |
| Independent fresh-context A3 adversarial assessment review | **NOT DONE / HOLD** | Retained issue report, independent context identity and material findings resolved |
| A4 marking / anchor calibration | **NOT DONE / HOLD** | Structured Marking Pack, representative anchors, disagreement/rubric checks, appropriate independent review |
| Qualified human subject review / benchmark approval | **NOT DONE / HOLD** | Named qualified subject specialist, exact-version verdict and documented resolution of blocking defects |
| Educational SV-01..SV-13 learner-value verdict | **HOLD** | Full five-view pedagogical and student-comprehension acceptance, separate from CI |
| Founder merge approval for PR #637 | **NOT GIVEN** | Exact PR-specific explicit Founder approval after a plain-English summary and completed gates |

**No independent review was performed in this execution.** This is an actionable handoff register and deterministic-test scope, not an `expert_review_ready` claim, a final content judgement, a publication approval or a claim that the full Course Learning Blueprint is pedagogically assured.

## E-16 — Blank-answer scoring and learning-evidence correction (19 October 2026; PR #637 candidate)

At `20484719`, blank or whitespace-only responses could receive positive self-awarded AO marks and persist spurious question-level learning evidence. After guidance was shown, an untimed response could also be erased and saved. This is a P1 educational evidence-integrity defect in `DEF-2026-009`.

Draft-only correction: AO controls cannot be used for blank responses, no manually awarded blank marks contribute to timed totals, individual omitted questions produce no topic-level evidence rows, and an entirely blank timed paper produces no scored evidence. Unanswered questions still count zero toward a **partially attempted** full-paper result; actually answered questions remain self-assessed and confidence limited. Targeted practice cannot save a response cleared after guidance.

Assertions added for whitespace, retained genuine responses and actual authored Paper 1 UI/network evidence writes. Exact-head CI **not yet verified**. A3 question accuracy, A4 calibrated marking, 13 student-value cases and student comprehension remain **HOLD**.
