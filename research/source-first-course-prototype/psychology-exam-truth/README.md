# AQA A-level Psychology 7182 — Exam Truth

**Status:** Experimental Exam Truth complete candidate  
**Prototype:** Source-First Course Prototype  
**Course:** AQA A-level Psychology 7182, revised specification, first A-level exams Summer 2027  
**Checked:** 4 October 2026

## Purpose

This directory records the structured assessment truth needed to derive Psychology learning treatments and later create authentic Revision-owned Exam Prep without copying protected AQA assessment material.

It is step 2 of the active end-to-end Psychology student-pilot run. Course Truth is already complete at 118/118. This layer records how those course requirements are assessed.

## What is established

The assessment model records:

- three written papers;
- 120 minutes and 96 raw marks per paper;
- approximately one third of the A-level weighting per paper;
- the exact primary topic ownership of Papers 1 and 2;
- Paper 3 compulsory Issues and Debates plus one topic from each of three option groups;
- AO1, AO2 and AO3 overall ranges and paper-contribution ranges;
- the 25–30% overall research-method assessment requirement;
- the at-least-10% mathematical-skills requirement;
- the dedicated 48-mark Research Methods section on Paper 2 while preserving the fact that research-method and mathematical skills can also be assessed on all three papers;
- multiple-choice, short-answer, scenario/application, extended-writing, research-method/practical and data/mathematical response families;
- the current AQA Psychology command-word vocabulary grouped into Revision demand classes; and
- rights-safe rules for producing independent Revision questions, marking packs and later simulations.

## Invariants versus calibration

Current specification facts are treated as assessment invariants only where AQA currently publishes them as such: paper count, duration, marks, weighting, section totals, content/option structure, AO ranges and the whole-course research-method/mathematical constraints.

Older AQA assessment guidance is retained only as calibration where the current specification does not promise an exact future-paper pattern. AQA has explicitly stated that the 2025 subject-content revision did not change assessment, question types or paper structure, so older assessment guidance remains useful for understanding the assessment approach. It is still not promoted into a rule such as “every paper must contain N sixteen-mark essays”.

In particular:

- extended writing can use different tariffs and 16 marks is the A-level maximum identified by AQA guidance;
- there is no fixed invariant count of maximum-tariff essays per paper;
- historical paper layouts, exact command sequences, topic placements within a section and datasets are calibration evidence, not future-paper guarantees; and
- later mock planning must satisfy the current whole-paper constraints rather than imitate one historical paper.

## Source-rights boundary

All AQA sources in this Exam Truth are `REFERENCE_ONLY`.

The downstream production boundary is deliberately narrow:

1. consult current official AQA material to verify assessment facts;
2. retain only approved structured alignment facts;
3. do not provide substantial protected AQA prose, questions or mark schemes as a reusable generation corpus;
4. independently author Revision contexts, questions, datasets, model responses, rubrics and feedback from permitted Psychology Course Truth plus the structured assessment facts; and
5. label Revision assessment as Revision-owned AQA-style/aligned practice, never as official AQA material.

## Component-placement finding

Psychology 7182 has genuine component-specific content. Papers 1, 2 and 3 are not merely different formats over one shared syllabus: AQA assigns named topic groups to specific papers, with Paper 3 containing compulsory Issues and Debates plus three option choices.

That triggers the `genuine component-specific content` classification under `10-product-governance/Course Content and Assessment Component Placement.md`.

This does **not** mean Revision should duplicate Course Truth. The knowledge nodes remain single-source. Paper identity is attached as assessment scope and should inform the Course Learning Blueprint, Exam Prep, evidence mapping and any learner grouping that is educationally justified.

## Completion boundary

`examTruthComplete=true` means the prototype now has enough verified assessment structure to derive the Course Learning Blueprint.

It does **not** mean:

- learner assets are complete;
- a representative mock has been generated or assured;
- fresh independent assessment/authenticity assurance has passed;
- Psychology is ready for learner publication; or
- the Source-First prototype has replaced the Content Factory.

Fresh independent educational and assessment assurance remains a later production-level gate before restricted-pilot publication.

## Next governed step

Derive the Psychology **Course Learning Blueprint** from:

- `research/source-first-course-prototype/psychology-course-truth/`; and
- `research/source-first-course-prototype/psychology-exam-truth/assessment-blueprint.json`.

The Blueprint should decide the educationally justified Learn, Practice, Exam Prep and learner-evidence treatment for every material knowledge/skill node. It must not impose arbitrary asset quotas.

## Documentation impact

This is experimental research evidence under the already-approved Source-First exception. It does not change normative product/company authority or production technical documentation. The active student-pilot run remains the governing continuation contract.
