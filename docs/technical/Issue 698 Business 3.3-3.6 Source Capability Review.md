# Issue #698 — AQA Business §§3.3–3.6, source-led capability and published-supply candidate audit

**30 October 2026 — unmerged governed candidate.** Canonical learner runtime `/revision/app/`; actual paper packs `content/business/aqa-a-level/paper-{1,2,3}/index.ts`, through the existing validated content adapter. This is a **non-publishing audit-only change**: no user interface, content, marking engine, question IDs, account, Plan/Progress/REV, storage or learner migration changes.

## Source, rights and denominator boundary

Official AQA AS/A-level Business specification **v2.0 dated 14 June 2023**, 42 pages, [official document](https://www.aqa.org.uk/files/faf787aa-3753-423d-b4fa-55f2374d4441/5c265ac92b9358f142c2b69483df78f811d52739.pdf), §§3.3–3.6, printed pp.14–24. This is **REFERENCE_ONLY**: original practical skill descriptions, not copied examination questions or passages from the protected source. The exact Founder-uploaded PDF is **not byte/hash verified** against the separately recorded Issue #698 SHA `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`.

The new `scripts/assurance/data/aqa-business-7132-sections-33-36-atomic-review.json` records **220 candidate skill-level observations** across exactly **18 subsections**, covering marketing (3.3), operations (3.4), finance (3.5) and HR (3.6). These are *source-informed independent review candidates*, not a qualified sign-off, exhaustive legal/source reproduction, or a final A-level atom denominator. Context-dependent analysis, synoptic demands, methods/terminology and further named facets may still require splitting. Their separate counts must not be added to or presented as the 194-checkpoint whole-course baseline or old 344 keyword matching set.

The review *deliberately* splits:
- interpreting elasticity values **without imposing a calculation requirement**, versus applying price/income changes to revenue;
- calculating operational and HR indicators versus interpreting their meaning;
- preparing a budget/cash-flow forecast or **drawing a break-even graph** versus a one-mark numerical result and reading a graph;
- different segmentation criteria, the 7Ps, motivation theories and the individual financial and non-financial techniques.

## Candidate evidence on the actual learner content

`scripts/assurance/aqa-business-7132-33-36-source-review.test.ts` loads **all three actual published Business paper ContentPacks**. It exposes section-level historical keyword rows, source-tagged bank question IDs, candidate published Learn node IDs and the distinction between software-scoreable *single-target* selected-option/final-number questions and other/multi-target/written content. It also independently checks that the existing budgeting and cash-flow **construction DataDrills** are present. Those are answer-reveal self-check activities and **cannot be counted as software-marked constructed-table competence**.

**Critically, the review does not yet attribute question answers or educational adequacy to any individual one of the 220 atoms.** Every atom's teaching, Practice, Exam Prep, byte-parity and authenticated learner acceptance remain **unverified**. Even when a tag or lesson exists for its source section, that is **supply-only evidence**, not an educational pass. A general MCQ, final-number response, observed construction example and judged extended answer are not interchangeable.

Reproduce the bounded evidence export with:

```bash
node scripts/assurance/export-aqa-business-7132-33-36-review.mjs
```

It writes `tmp/assurance/aqa-business-7132-33-36-source-CANDIDATE.json` and refuses to export if the input is presented as source-complete or assessment-adequate.

## Follow-through and documentation impact

This package advances **18 distinct sections**, alongside separate open PR #741 for §§3.1–3.2. The remaining A-level-only sections §§3.7–3.10 must undergo their own source-first review (plus completeness reconciliation across the whole document, introductory/synoptic demands, quantitative Annex 6, AO and paper structure, upload hash and educational review). **Do not declare 24/42 certified:** #741 is a separate unmerged candidate, and both have known incompleteness.

Next gate is **one per-atom quality/evidence review** against actual Learn blocks, question stimuli, response/marking expectations and Exam Prep with explicit `adequate/inadequate/absent/incorrect/unverified` based on evidence, not keyword confidence. Then prioritise authentic graph/forecast construction, applied written analysis/evaluation and skill-specific diagnosis where published scoring cannot meet the skill. Validate real signed-in students, persistence, recheck and planning before claiming acceptance.

Documentation: original candidate data, test, export script, this indexed technical note and INDEX move together on this PR. No normative authority is being amended; historical 344 keyword and 194 baseline records remain unchanged. Issue #698 and #703 checkpoints stay open until proven.
