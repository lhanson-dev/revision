# Issue #698 — Business 7132 §§3.1–3.2 source-first atom-to-published candidate review
**30 October 2026; governed audit candidate, not released or educationally approved.** This is a partial independent decomposition of six published AQA Business 7132 official v2.0 subject-content subsections (3.1.1 through 3.2.3), **not an all-42-section atomic census**. This deliberate bounded package advances the course source denominator before further isolated new-question packages.

## Official source and provenance boundary
Consulted the AQA 42-page AS/A-level Business **version 2.0, 14 June 2023**, official PDF: https://www.aqa.org.uk/files/faf787aa-3753-423d-b4fa-55f2374d4441/5c265ac92b9358f142c2b69483df78f811d52739.pdf . Source is **REFERENCE_ONLY**. Original review obligations are independently paraphrased; no protected exam questions/marks or large blocks of specification prose are reproduced. Issue #698 records Founder-supplied PDF SHA `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`; **its bytes could not be retrieved or hash-compared**, so parity remains *unverified*. The public PDF matched the named v2.0 edition and source-section layout, not a proven byte-for-byte user upload.

## New independently decomposed candidate register
`scripts/assurance/data/aqa-business-7132-sections-31-32-atomic-review.json` records **80 finer-grained, original, source-informed candidate obligations** spread over six sections, each with printed page, applicable response skill, a *provisional* old 344-candidate target (or explicit `null`), possible Learn page and a parent from the older 194-checkpoint baseline where available. It deliberately **does not** replace the 194 or 344 datasets or claim their counts are interchangeable.

Examples of important splits now explicit:
- Business objectives split into profit, growth, survival, cash flow, social and ethical aims, rather than a single keyword hit.
- Financial skill separates calculating revenue, total costs, profit and **explaining the importance of profit**. The historical 344 item lacks a dedicated profit-importance ID even though newer Learn content exists.
- Business form and shareholding requirements separate shareholder interests, valuation and why quoted share-price movements matter. Ownership's effect on mission was absent as a standalone old 194 checkpoint, so its parent checkpoint is **null**, not invented.
- External environment separates **cost versus demand** mechanisms for each named factor including fair trade; seven selected-response cases do not independently prove all fourteen written causal abilities.
- Leadership styles are separately observable, and decision trees are split into reading/interpretation, expected value, net gain, limits and decision context.
- Stakeholder mapping splits power and interest; stakeholder management distinguishes communication and consultation.

## Actual learner implementation cross-check
The test imports the **three currently published** `content/business/aqa-a-level/paper-{1,2,3}/index.ts` packs, uses their Learn pages and real validated structured bank, and checks direct target IDs rather than string or topic-only matches. It emits an 80-row candidate table containing published page existence, exact tagged question IDs and *one-target, software-scored* MCQ/calculation IDs where they exist. It explicitly does not infer written method, AO evaluation, valid exam scoring or independent recheck from a correct option/number. A candidate page, bank tag or unit test **is not adequate teaching or actual learner mastery**.

Reproduce with:
`node scripts/assurance/export-aqa-business-7132-31-32-review.mjs`.
The exporter rejects any promotion of the 80 rows to a complete source universe, verified uploaded PDF parity, independently adequate teaching/examination or real signed-in learner acceptance. Rows with missing candidate links are review priorities, not automatically proven missing lessons.

## Remaining approval gates
1. Verify original user-upload binary SHA with a sanctioned source intake, and conduct another independent educational review of each of the 80 paraphrased atoms and its appropriate measurable performance.
2. Finish source-led atomisation of **the remaining 36 sections**, all quantitative Annex demands, AO1–AO4, paper shapes, and cross-cutting contextual/synoptic requirements. Preserve page/source provenance and distinguish AS-only and A-level-only scope.
3. Resolve every final atom to exact published Learn block, valid scored/observed Practice and Exam Prep rubric or documented `absent`/`unsupported`. Repair genuine gaps, with qualified assessment review where needed.
4. Prove a signed-in learner saving, reloading, repairing and independently rechecking real different skills and Plan/Progress adaptation. #698/#703 remain OPEN.

**Documentation impact:** This technical note and INDEX pointer, source-derived review data, reproducible export and three-real-pack unit regression live in one PR. No product authority, learner-facing content, database, migration, ID, algorithm or UI change. No ADR or normative change; historic records remain untouched.
