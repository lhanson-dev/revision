# Issue #698 — AQA Psychology 7182 applied Research Methods Practice

**Status:** Original restricted-pilot content candidate; not educationally approved or live until exact-head assurance and governed merge.

**Exact source:** the user-uploaded AQA Psychology A-level 7182, version 1.4 (1 September 2025), SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d` (verified with the binary on 29 October 2026). Source scope: A-level Paper 2 Research Methods, A-level mathematical/statistical skills and paper requirements. The PDF is **REFERENCE_ONLY**: no protected AQA wording, assessment item or mark-scheme prose is ingested or copied into published content.

## Actual learner-content correction

The existing Psychology shared Course Truth projects **118** requirements into **118** one-answer concept-choice questions and 12 Research Methods data drills. This already provides vocabulary recall but does not, by itself, demonstrate correct quantitative calculation, statistical selection or chart construction.

Through the **existing** `content/**/index.ts` ContentPack ingestion route and ordinary Practice interface, add:
- Four original **objectively scored** scenario/data MCQs: numerical mean; tied-pair sign test with n and smaller sign count; a two-tailed Spearman coefficient versus a **supplied** critical magnitude; unequal-width histogram frequency-density comparison. Each has one correct response and the full calculation/interpretation in feedback.
- Three original **on-paper self-check** data drills requiring the learner to calculate mean/median/mode/range, apply a sign-test procedure or plot histogram bar heights from unequal class widths. These are explicitly answer-reveal exercises; selecting or seeing the answer is **not** evidence of independent graph construction or full quantitative ability.
- Retain all previously published 118 question IDs, 12 data-drill IDs, 118 content truth obligations and 3 distinct 96-mark Exam Prep mocks without modification. New total is **122** ordinary course Practice questions and **15** self-check drills, shared across the three Psychology paper packs.

Numerical fixtures: scores [4,6,6,8,11] -> mean 7, median 6, mode 6, range 7; pairs [5/7,6/6,9/4,3/8,7/9] -> signs +/tie/−/+/+, effective n 4, smaller sign count 1; rho −0.62 compared with supplied two-tailed critical magnitude 0.587 is statistically significant under that stated rule, but not causal; histogram 0–10 (frequency 12) density 1.2 versus 10–15 (frequency 12) density 2.4, with equal frequency areas. These are original Revision exercises, **not AQA questions**.

## Educational and implementation limitations

This is a narrow Research Methods remediation **within a still-unfinished whole-course Psychology audit**. It does not satisfy the 25–30% Research Methods assessment weighting by question count, verify every atomic 7182 requirement, ensure all 27 optional Paper 3 combinations lead to appropriate **planner/progress** coverage, validate extended written response marking or establish independently graded constructed graphs. Existing Paper 3 structural tests already prove 27 valid mock option combinations but do not prove user-selected options govern the learner’s plan. No learner runtime or planner behaviour was changed by this PR.

## Assurance / documentation check

`scripts/assurance/issue-698-psychology-applied-rm.test.ts` checks exact reference fingerprint, re-computes data independently, asserts all seven original additions appear in each canonical Psychology ContentPack through existing Practice/self-check adapters, verifies the old 118 question IDs unchanged and the Paper 3 mock preserved. Re-run ordinary Revision CI, independent adversarial A3 review and appropriate private-pilot publication decision against exact head. Do not represent this technical evidence note as itself granting publication PASS.

This PR updates current learner-content implementation and technical assurance documentation only. It does **not** change the approved Content Factory architecture, source licence standard, Course Learning Blueprint or claims policy; historical Course Truth files and assessment-blueprint evidence remain unchanged. Record scoped changes in issue #698 and retain the broader unresolved gap list.

## Atomic source binding

`psychologyResearchMethodsAppliedRequirementBindings` maps each of the seven new assets to the exact approved Course Truth obligation identifiers, rather than relying on a topic-level keyword coincidence: mean/descriptive statistics to `PSY-07-26`, histogram construction/interpretation to `PSY-07-27`, Spearman/correlation/inferential test choice to `PSY-07-29`/`PSY-07-33`/`PSY-07-34`, and tied-pair sign test and significance decisions to `PSY-07-32`/`PSY-07-33`. The regression test checks all IDs exist in the actual 118-record approved Psychology Course Truth and that no new asset lacks at least one requirement. This is proof of *explicit mapping*, not independent cognitive-skill assessment or semantic examiner approval. The existing learner question/data-drill schemas have no native specification-item ID fields; these are sidecar source-to-asset evidence bindings until such schema change is separately governed.
