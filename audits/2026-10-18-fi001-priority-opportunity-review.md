# FI-001 — Scarce-Time Priority and Opportunity Review

**Date:** 18 October 2026  
**Status:** Internal deterministic decision-evidence review — NOT qualified educational or student acceptance  
**Scope:** Draft [PR #637](https://github.com/lhanson-dev/revision/pull/637), candidate `96828fcbe52e8c308652924b1e9f5815ee54e2ef`  
**Baseline:** Previously approved `fd8565838db8fc27cbf359fc86d846e9ab11fda5`  
**Executed evidence:** [Frozen-baseline run #39163994720](https://github.com/lhanson-dev/revision/actions/runs/39163994720), `candidate.json`, `baseline.json`, `comparison.json` and exact matching scenario-input hashes.

## Acceptance rule

The mandatory [FI-001 Student-Value Scenarios](../10-product-governance/backlog/FI-001%20Programme%20Value%20Scenarios.md) require a real exam-backwards strategy, not a list of feasible tasks. A scenario cannot receive educational PASS merely because it has a programme, a paper-linked question, an intact Start route, or zero capacity violations. The intended allocation among prerequisite learning, retrieval, gap repair, specific paper-answer technique and competing courses needs qualified judgement for the particular student evidence and time. This document supplies traceable counterfactual observations, **not** a claim that the allocations are optimal or pedagogically validated.

## High-priority controlled cases

| Case and change | Actual programme objective mix | Exact supported paper-response allocation | Important omitted opportunities |
|---|---|---|---|
| SV-03, after first Business paper has passed and Psychology remains imminent | 2 Learn objectives; 0 exam-practice; 30 minutes total | 0 of 4 verified Psychology paper-response sections receive a scheduled opportunity | 10 candidate objectives unallocated |
| SV-05, one 30-minute weekly opportunity and saved day-off exception | 10 Learn, 10 Check, 16 exam-practice; 830 minutes across the full exam horizon | 6 of 8 verified cross-course sections allocated | 14 objectives unallocated |
| SV-05, additional Wednesday availability | 14 Learn, 14 Check, 22 exam-practice; 1,150 minutes | 8 of 8 allocated | 0 objectives unallocated |
| SV-06, Business and Psychology starting weeks before exams; 30-minute weekly opportunity | 4 Learn, 1 repair, 1 Check, 1 exam-practice; 130 minutes | 1 of 8 verified sections allocated | 41 objectives unallocated |
| SV-06, further reduced availability | 3 Learn, 1 repair, 1 Check, 0 exam-practice; 85 minutes | 0 of 8 verified sections allocated | 43 objectives unallocated |
| SV-12, zero availability despite imminent exams | 0 allocations; 0 minutes | 0 of 8 verified sections | 50 objectives unallocated |
| SV-12, added 30-minute Wednesday opportunity | 4 Learn, 2 Check, 0 exam-practice; 100 minutes across the remaining window | 0 of 8 verified sections allocated | 44 objectives unallocated |

**Interpretation limits:** these figures reflect *supported candidate opportunities*, not full syllabus demand or actual exam mastery. A 25-mark essay may be an inappropriate first action for a student with no verified topic knowledge or too little continuous time; however, selecting only introductory Learn tasks just before a real paper also needs explicit justification. The number of covered sections is an opportunity count, **not** demonstrated performance or student readiness. Other scenarios remain covered by the full deterministic comparison; they do not automatically receive a pedagogical PASS.

## Decisions the educational reviewer must resolve

1. **SV-06:** Does the planner make the most beneficial attainable trade-off among foundational learning, demonstrated weaknesses and valid exam-answer formats under the *actual contiguous available minutes*, for each course and impending paper? If exam practice does not fit, is the stated reason exact and is a feasible alternative selected? No arbitrary mandatory essay or invented grade target.
2. **SV-12:** When capacity changes from zero to a single recurring work opportunity, is prioritising introductory explanation over exam-style opportunities defensible given the observed evidence and paper dates? Are omissions and course-share trade-offs comprehensible in Month, Week and REV?
3. **SV-03:** In the final days before Psychology's paper, the model allocates two Learn activities and no response-section practice. Is that appropriate given sparse mixed evidence and exam-format demands? What would a qualified teacher recommend instead, and why?
4. **Across all 13 cases:** Can the learner identify the reason for the next task, the named paper it helps, what Revision cannot yet know and which relevant opportunity has been omitted? After genuine scored work, missed time or moved dates, do Month, Week, Day, Home and REV provide a coherent same-decision story?

## Exact-head assurance added

The existing dedicated comparator now emits a bounded programme-decision review queue with per-variant first task, treatment mix, two-course allocation, exact paper-response sections, unallocated supported opportunities and explicitly labelled review signals. Hard, mechanically provable deadline/capacity/data fabrication violations fail the comparison. The review flags **never** auto-fail a legitimate educational choice or automatically PASS one. This is an evidence-quality and assurance improvement within already approved FI-001; no planner ranking weights, source content, UI or normative policy are changed.

## Open gates and next action

**Educational verdict: HOLD.** Independent assessment-content review under the Content Accuracy Assurance Gate; qualified subject-specific priority and AO/response-skill judgement; authentic persisted completion/evidence/replanning journeys; and accessible actual-student comprehension remain unverified. Next: review the exact-head `educational-review.json/md` evidence with the qualified educational acceptance rubric before any merge recommendation. No historical audit records have been rewritten and no Founder merge approval has been inferred.

## Exact-head comparator reporter correction — 18 October 2026

[Workflow #39166483803](https://github.com/lhanson-dev/revision/actions/runs/39166483803) successfully ran the same frozen baseline and candidate probes but failed in the newly added reporting step with `ReferenceError: result is not defined`. The reporter uses `report` as the actual comparison accumulator. The single incorrect variable reference has been corrected; no scenario inputs, observed programme decisions, educational constraints, tests or reported findings have changed. New exact-head execution is necessary before its expanded safety assertions and reviewer outputs may be called validated.
