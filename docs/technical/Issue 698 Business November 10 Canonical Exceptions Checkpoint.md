# Issue #698 — Business 7132 source denominator and canonical exceptions checkpoint

**10 November 2026. Audit-only proposal. Not a course assurance pass or an independently verified full-course source denominator.**

## Grounded baseline

- Current approved-main baseline inspected: `e5555706504dabb571131a44ef93e4c0c8982fa9`. Canonical signed-in learner route is `/revision/app/`, enrolled AQA A-level Business 7132.
- Exact Founder-supplied AQA Business PDF: version 2.0 dated 14 June 2023; 42 PDF pages; SHA-256 `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`, independently rehashed from the original local upload during this checkpoint. Source is `REFERENCE_ONLY`.
- The **existing single canonical machine-readable register** is `scripts/assurance/data/aqa-business-7132-canonical-learner-assurance.json`. This PR adds its `exceptions_register` section; **do not create a competing list of exceptions in this document**. The earlier historical inventories remain intact.
- 42/42 source sections structurally listed; each section still marked `whole_section_atomic_review: incomplete`. 504 candidate identities, not an independently proven complete atomic denominator. Annex quantitative skills (9), assessment objectives (4), paper formats (3) and synoptic overlays (7) are *not yet* reconciled against each distinct source-derived capability.
- Exactly **504 of 504** candidates remain `unverified` in each of five fields: Learn teaching, Practice, Exam Prep, independent skill assessment and authenticated learner acceptance. This is an **assurance-state count**, not evidence that all 504 capabilities are missing, or that no released learning materials exist.
- Only §3.7.1 has bounded exact Learn/Practice/Exam candidate locators in this consolidated register, and none are certified educational passes. Existing separate detailed source, lesson and practice evidence in earlier #698 documents must be independently inspected and reconciled into the canonical register rather than assumed adequate.

## Exceptions and priorities

The six open exception identities and their precise closure criteria live **only** in the canonical JSON:
`BUS-698-EX-001` full source denominator; `002` §3.7.1 distinct skill-specific assessment; `003` §3.7.2 pending A2/A3 review; `004` §3.10.3 authentic network diagram amendment; `005` cross-cutting AO3/AO4 extended writing; `006` signed-in learner-loop acceptance.

Prioritise **genuine educational failures and invalid evidence attribution** over producing new metadata or duplicating content. For every candidate inspect the actual published Learn page/block, scored or appropriately self-assessed Practice item and feedback, actual Paper 1/2/3 exam question and rubric, then classify `adequate / inadequate / absent / incorrect / unverified` with a source locator and a concrete evidence reason. An unverified item is not automatically absent. Preserve published identifiers and saved learner attempts. Document required student capability and separate what the current UI cannot authentically evidence.

## Review sequencing and release boundary

- **PR #837**, reviewer infrastructure, was mechanically refreshed against approved main at exact head `fb18f8e12ff687ceb22be3d27bf6d2a5d8e94d88`; zero behind main at that checkpoint, same five change paths. Former CI on the **old head** passed, but **fresh current-head CI was not observed** after this refresh. It remains a draft, unmerged; only the Founder may specifically approve its separate merge.
- **PR #836**, learner ratio corrections, was mechanically refreshed against the same approved main at exact head `c0aae31620679ff92488f02b7ddc7e502cccf760`; zero behind main at that checkpoint, same 11 changed paths. It remains draft, unmerged, original independent A2/A3 HOLD; a green previous head is not a replacement for fresh CI or educational review.
- Upon a separately approved and verified #837 merge, use the protected owner/exact-head reviewer trigger for #836. Keep historic review failures; fix material findings and rerun current-head assurance. **A review trigger does not approve a merge.**
- The proposed 12 original one-mark final-number questions and six-ratio Learn method page are **not released**. The real §3.7.2 demand extends to financial-statement analysis and meaningful over-time / competitor comparison, which these final-number items alone do not establish.
- Current #698 and #703/#706 responsibilities remain separate. No production learner acceptance, human examiner calibration or whole-course coverage claim is justified at this checkpoint.

## Documentation-impact decision

This audit-only work changes the single canonical **evidence** register, adds a deterministic consistency test and this dated technical pointer. It changes no active normative product authority, learner behaviour, database contract or past audit history. New educational corrections must update relevant implementation and technical documentation in their respective governed PRs; the source denominator is not silently altered until independently proven.
