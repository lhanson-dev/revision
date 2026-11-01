# Issue #698 — AQA Psychology 7182 Section 4 source-bullet to published Learn crosswalk

**State: PROVISIONAL EXACT-PDF PARENT-BULLET CHECKPOINT INVENTORY; educational sufficiency and signed-in learner acceptance NOT PROVEN.** This is a bounded audit evidence package, not a learner-facing feature, new syllabus interpretation or course completion claim.

## Reference and observed source structure

- The exact Founder-supplied **AQA A-level Psychology 7182 v1.4 (1 September 2025)**, 38-page PDF, SHA-256 `db561ba9c36a9109830bcb03bb16d138b85907f068620cce01eff70fdee6ad4d`. This is the same source identity pinned by existing source-first and mathematics annex records. Rights classification **REFERENCE_ONLY**; no extended protected AQA prose is committed.
- Section **4** content, printed **pp17–24**, has **17 topic headings**: **eight compulsory** and **nine optional**, the latter organised into three groups of three. Student choice is one option from each of those groups.
- Direct reading of the PDF's **top-level content bullet boundaries** gives **117 parent-bullet checkpoints** across **20 numbered source subsections** (Research Methods has its main list and subsections 4.2.3.1, 4.2.3.2 and 4.2.3.3). This is **not** 117 atomic skills or an official AQA assessment denominator.
- The existing published source-first prototype contains **118 original requirement records**. Exactly **one source content bullet** has been represented as **two** Learn records: the first **4.2.1 Approaches** bullet separates behaviourism from social learning theory (`PSY-05-01` and `PSY-05-02`). The other parent bullets map to one prototype record apiece, giving 117 source checkpoints ↔ 118 prototype requirement IDs.
- General introductory Paper 1/2/3 application, analysis, evaluation and practical research obligations and Section 5 assessment and Section 7.2 maths annex are **outside this Section 4 bullet count**; they must be audited and are **not** silently waived.

## Published learner crosswalk: what has and has not been proved

Machine-readable proposed crosswalk: `scripts/assurance/data/aqa-psychology-7182-source-bullet-to-learn-crosswalk.json`.

Each row records: exact source section, original content-bullet ordinal, printed source page, compulsory/optional group, candidate existing topic, all mapped existing `PSY-xx-xx` prototype IDs, and actual deterministic Learn page candidate IDs. It deliberately carries no AQA paragraph text. Source bullet boundaries and page transitions are fixed from the supplied PDF, not generated from the published course's prose.

The paired regression test `scripts/assurance/aqa-psychology-7182-source-bullet-to-learn-crosswalk.test.ts` asserts: correct source fingerprint, 117 unique checkpoints, 20 section counts, all 118 distinct prototype requirement IDs, exact `4.2.1` one-to-two split, the existence and sourceSectionId identity of **all** linked Learn pages in **each of the three actual available content packs**; and an honest 8+3+3+3 topic partition.

This is **source locator → production Learn page presence**, not a source-atom educational-adequacy pass. **Zero** parent checkpoints are marked proven as adequately taught, independently practised, covered by Exam Prep, or accepted through a real signed-in learner. A generic topic question is deliberately **not** attributed to every requirement in that topic; self-marked work and one-mark answer recognition must be kept separate from independent method or extended-response capability.

## Next work without building another audit framework

1. **Decompose each compound source bullet into its genuinely separate named obligations**, including models, researchers, procedures and methods. Preserve source-checkpoint parent IDs and page numbers; link Section 4's across-topic practical requirements and Section 5's AO/paper structure and Annex 7.2. This remains the largest source-universe gap.
2. **Read and judge** each published Learn page against the smaller obligations for accuracy, teaching depth, worked examples, misconceptions, application and evaluation. Record adequate/inadequate/absent/incorrect/unverified rather than checking for keyword presence.
3. Check each already-published Practice stimulus and Exam Prep question for what the response can **actually** demonstrate, scoring robustness and source attribution. Independently scored, self-assessed and unavailable activities remain distinct.
4. Create only bounded original corrections where evidence shows genuine defects. Do not regenerate valid lessons or create irrelevant quiz quotas. Validate each release through source-first, fresh independent subject/assessment review, current-main exact-head CI and real learner acceptance.
5. Exercise genuine signed-in **Paper 3 option choice, saved evidence, Progress and planner** including all 27 combinations with deterministic proofs and adequate actual student journeys. Coordinate the learner-system integration with #703/#704/#705; do not invent a parallel learner app or planning engine.

## Risks, historical evidence, and documentation impact

Existing `scripts/assurance/data/aqa-psychology-7182-source-first-review.json` (17 topic headings, separately reviewed 17 inferential capability candidates) and `scripts/assurance/data/aqa-psychology-7182-maths-annex-source-review.json` (32 provisional maths capability checks) are **unchanged historical/source-scope evidence**. The released #759 statistical-table and scatter activities are not reclassified as full course or independently verified graphical skills.

**Source-rights:** official AQA PDF is authoritative for curriculum and exam demand but remains REFERENCE_ONLY and is not included as protected prose in the repo. **No normative authority change**, no schema, migration, learner-content or production experience change. This technical note, JSON evidence, regression test and INDEX pointer belong to one governed PR and require specific Founder merge approval. After approval, the new JSON would be the next prospective audit basis, **not** a retroactive alteration of historical snapshots.

**Issue #698 closure remains prohibited** until every applicable named obligation is assessed, justified exceptions are recorded, all corrections are live, and final real-learner/qualified-review boundaries and costs are reported.
