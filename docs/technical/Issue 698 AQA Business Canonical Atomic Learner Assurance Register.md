# Issue #698 — AQA Business 7132 canonical provisional source-to-learner assurance register

**4 November 2026 — audit-only candidate PR, not merged or deployed.** Canonical learner route: `/revision/app/` → enrolled AQA A-level Business 7132 → Learn, Practice, Exam Prep. This work adds **one unified machine-readable register** under `scripts/assurance/data/aqa-business-7132-canonical-learner-assurance.json`; it does not add a second learner engine, a question, a new exam page, a marking capability or a learner-evidence record.

## Exact official source and permission boundary

The Founder-supplied **42-page AQA AS/A-level Business specification 7132, v2.0 dated 14 June 2023** was verified from the uploaded local PDF bytes in this audit execution. SHA-256: `3217d9dc75aedcf3be14fb95f3d11d536e0626cf10111bc058d9add8a5fce332`. The source was consulted directly (including rendered printed page 24, PDF page 24) for section 3.7.1, and its original source-table demand structure was compared to the existing candidate inventory. **AQA remains REFERENCE_ONLY**: no protected source prose, examiner answers or official questions are stored, reproduced or passed into independent content workers. The PDF bytes are not checked into the repository. Previous source-audit files' historical `founder_upload_*_verified:false` values remain historically accurate and are not rewritten.

This audit verifies that the specified **document bytes** match the recorded source fingerprint, not that the complete academic requirements of all 42 sections have been fully reconstructed or independently validated.

## One candidate register; no invented coverage fraction

Three already-present, separate provisional capability inventories are **reconciled by identity** in the unified register rather than added as competing published coverage numerators:
- §§3.1–3.2: 80 pre-existing source-first *candidate* items.
- §§3.3–3.6: 220 pre-existing *candidate* items.
- §§3.7–3.10: 201 pre-existing *candidate* items.

All **501** distinct historical candidate identities are preserved. Comparing source §3.7.1 against the printed official table identified **three missing separable competence candidates**, added as `BUS7132-ATOM-3.7.1-012` to `-014`. This produces **504 provisional candidate rows**, **not 504 proven complete AQA atomic requirements**. The 42 printed sections remain the source section structure; 194 coarse checkpoints, 344 old keyword matches, 501/504 provisional skills, 9 annex quantitative prompts, 4 assessment objectives, 3 exam demands and 7 synoptic/cross-cutting prompts are **not interchangeable denominators**. Annex/AO/exam/synoptic overlays remain separately flagged, without duplication or false integration into a verified full-course atom list.

For each candidate row the register explicitly retains the source locator, observable skill, prior identity/provenance, precise reviewed Learn/Practice/Exam supply candidates **where established**, educational status and independent reviewer/release/learner acceptance limits. Unreviewed rows carry empty evidence lists, not inferred links. **Every educational-adequacy and authentic learner acceptance status remains `unverified`**. There are no asserted adequate or absent whole-course totals and no claimed completion percentage.

## §3.7.1: bounded exact-source reconciliation and observed published supply

The existing 11 candidate checks described influences on mission, objectives and short-termism; alignment of corporate and functional objectives; strategy/tactics; functional decision effects; and the value of SWOT. The printed source also names *internal and external influences on functional objectives and decisions* explicitly, and a three-way mission→corporate-objective→strategy relationship. The old 11-candidate decomposition did not separately make all these observable. Three additions are now tracked:

| New candidate ID | Separately observable demand | Existing candidate Learn supply | Verified scored Practice for this exact demand |
| --- | --- | --- | --- |
| `...-012` | Analyse internal effects on functional decisions/objectives | `bus-str-001`, source blocks 1 and 4 | **Not demonstrated** |
| `...-013` | Analyse external effects on functional decisions/objectives | `bus-str-001`, source blocks 1 and 3 | **Not demonstrated** |
| `...-014` | Explain how corporate objectives guide strategic choice | `bus-str-001`, source blocks 0 and 3 | **Not demonstrated** |

The other **11 existing** §3.7.1 candidate identities are preserved and now have bounded exact Learn-block candidate locators. The three canonical Business ContentPacks expose the same course-level Learn pages and standard Practice bank. Relevant assets checked in this slice:
- Published Learn: `bus-fnd-005` (mission/objective links), `bus-str-001` (strategic objectives, strategy and tactics), `bus-str-003` (SWOT).
- Published structured Practice: `3.1-3.2:q31` (6-mark ownership/mission analysis), `3.7:q21` (one-mark corporate objective MCQ), `3.7:q22` and `q23` (mixed four-mark written responses), and `3.7:q31` (nine-mark SWOT evaluation).
- Published Exam Prep: original Paper 1 `p1-q07` identifies an **external SWOT category**; this does **not** assess the *value* of SWOT or independent evaluation.

**Important distinction:** the unscored prompts in the old Content Factory `learn-practice/*.json` source files are **not** automatically published by the Learn-to-Practice adapter. They remain `source_factory_prompt_candidates_not_verified_published` and are explicitly marked **not published / not independently scored**, unlike the actual `practiceBank` records. The register does not silently promote draft source prompts to available student tasks. Likewise, a tagged written response may exercise several abilities, but its learner self-mark/feedback is not proof of independent AO3/AO4 competence or any individual atom.

**Educational finding:** this slice has visible source-grounded teaching and some associated Practice, but the exact three newly separated competencies, higher-order SWOT judgement and mission/corporate/strategy linking **do not yet have verified independent skill-specific assessment**. Their teaching accuracy, actual student performance and Exam Prep adequacy are still **unverified**, pending independent educational source-content scrutiny. This is a material *assurance gap*, not an accusation that the current content is necessarily incorrect.

## Deterministic assurance and next executable work

The new `scripts/assurance/aqa-business-7132-canonical-learner-assurance.test.ts`:
1. Asserts all 42 source-section locators and all 501 older candidate identities/skills survive, with three distinct newly found §3.7.1 obligations and no false whole-course denominator.
2. Confirms all status fields remain `unverified` absent a genuine educational judgement, and retains the separate quantitative annex, four AOs, three paper types and synoptic overlays.
3. Reads **all three actual published AQA 7132 ContentPacks**, checking every reviewed §3.7.1 Learn page/block index and existing bank question/family identity, while preventing source-only draft prompts or narrow one-mark MCQs from becoming a full-competence pass.

**Next highest-value WS1 correction:** Independently review the §3.7.1 content and written marking against these 14 candidates, then add original *applied*, single-target mission/strategy/functional-driver assessment and feedback only to the **existing** bank/adapter where valid, without pretending that self-assessed AO3/AO4 produces independently scored mastery. The next source-first area is §3.7.2 financial ratio **method vs interpretation**; track actual worked-method and unfamiliar comparative data, not merely numeric answers. Continue through all 42 sections plus annex/paper/AO overlays before defining a full denominator.

**WS5 handoff:** true signed-in Learn → Practice → correction → independent recheck → saved evidence → Progress/REV/Plan acceptance remains owned by #703, not proved by this source ledger. Previous released #820 remains untouched. Scope has no new learner content and **no production/live acceptance claim**.

## Documentation impact

One audit-only candidate register + deterministic tests + this technical note + INDEX pointer in the same governed branch/PR. Existing historic inventories, published source/provenance and FAIL review receipts are not rewritten. No source-rights promotion, normative policy amendment, account/RLS change, learner data migration or public readiness claim. Keep #698 open and request a *separate* Founder merge approval only after exact-head CI.
