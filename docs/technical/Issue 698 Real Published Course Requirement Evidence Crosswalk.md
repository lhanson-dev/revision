# Issue #698 — real published Business/Psychology evidence-supply crosswalk

**State:** published supply crosswalk released in PR #721 and calculation-supply accounting released in PR #738. B1b exact-item calculation evidence is proposed separately in PR #739 (not released while this candidate is under review). None is independent educational sign-off. **Route:** the one canonical `/revision/app/` learner application. **Source of implemented content:** exactly the current available `content/**/index.ts` packs through `src/engine/content/content-registry.ts` → `createLearningContentAdapter` → `buildCatalogue`. **Authority:** Course Learning Blueprint, Claims and Progress Governance, #698, #703 and the AI Agent Constitution.

## Decision boundary: do not confuse evidence of existence with educational readiness

Issue #698 requires an *independently enumerated, exact user-uploaded 42-page AQA 7132 v2.0 and 38-page AQA 7182 v1.4* requirement universe. The previous structural Business 344 and Psychology 118 mappings have not been independently reconciled to the exact PDF bytes as part of this PR. Therefore **neither existing count is a trusted whole-exam denominator**, and structural files/course-pack questions are not evidence of adequate teaching, marking, evaluation, graph construction, quantitative workings or full exam preparation.

The new `src/app/published-requirement-assurance.ts` is a reusable **read-only source-to-live supply crosswalk** against the *actual* catalogued learner adapter, with explicit `sourceUniverseStatus: 'provisional-not-independently-enumerated'`. Each candidate records:

- the provisional requirement ID, course ID, topic and **unverified** PDF source locator;
- exact Learn pages selected by recorded source-section IDs or matching Foundation node IDs, **not generic text-keyword hits**;
- generic topic-scoped scored pack MCQs, **separately flagged as non-attributable to an individual skill**;
- the IDs of structured-bank questions tagged to that requirement, separating source-mapped **multiple-choice** items (which can persist single-target raw observations) from automatically checked **calculations** (whose authored single-target identity can be saved as a raw observation by B1b's proposed schema-v2 Practice integration, not an inferred mastery state);
- whether a second materially different authored calculation exists for the same exact target, as *potential recheck supply* only; there is no claim that the learner actually retested later or achieved mastery;
- an independently retrievable pair only when at least **two different published question stimuli** can be scored on the same mapped target; merely duplicating a stable ID or coaching a repeated prompt does not count;
- `teachingAdequacy: 'unverified'`, `practiceAdequacy: 'unverified'`, `sourcePdfVerified: false` on **every** row.

All course/qualifying source counts in this first report are **provisional and supply-only**. They must not be displayed in Plan, Progress, REV, investor metrics or public claims as percentages of the AQA examination specification.

## What the first real-source audit measures

**Business numerical accounting correction (30 October 2026):** the published §3.2.2 expected-value and net-gain questions in PR #734 are automatically marked final-number calculations; the earlier crosswalk only counted source-mapped MCQs, misleadingly grouping those calculations with unscored/other bank records. The revised report lists `singleTargetScoredCalculationIds` and `distinctCalculationStimulusPair` independently of `independentlyScoredMcqIds` and `independentRecheckPair`. It also provides an inclusive *single-target scored Practice supply* count, still explicitly provisional. Prior to B1b, calculation answers had **no per-item `itemMapping` in saved evidence**. PR #739 proposes the same bounded schema-v2 mapping as authored bank MCQs, permitting a **raw** specific-skill observation for one software-checked final value. These supply counts still cannot prove actual learner attempts, later rechecks or skill mastery. This is not a claim that numerical workings, diagram drawing or application have been validated.

**Business AQA 7132:** the first candidate universe is the set of *actual published, explicitly tagged* structured bank `target_item_ids`; it is **not** the complete AQA atomic requirement inventory. The bank’s 4 newly authored distinct alternatives (PR #717) are regression fixtures for the same-skill source-to-live retest capability, not proof of adequate treatment of all relevant calculation, graph, application, essay or AO demands.

**Psychology AQA 7182:** the first candidate universe is the repository's 118 provisional `psychologyCourseTruthTopics` records across 17 topics, distinguishing eight compulsory and nine selectable option topics. Each has a Learn page and an ordinary course-pack MCQ; those MCQs do not retain the exact requirement ID in software-scored evidence. The report therefore must **not** mark all 118 requirements as independently tested. The published numerical standard-deviation bank and Research Methods activities may improve practical skills but do not silently certify all 118 atomic requirements. Psychology’s 27 Paper 3 topic option combinations are separately governed; a complete future crosswalk must be option-specific.

**Readable/portable output:** the test `src/app/published-requirement-assurance.test.ts` prints a compact supply summary in normal CI. Optionally run:

```sh
node scripts/assurance/export-published-qualification-crosswalk.mjs
```

This writes `tmp/assurance/aqa-7132-7182-published-coverage-provisional.json`, containing **every** provisional row, exact asset IDs and evidence-type distinctions, with no learner identity or response data. The wrapper executes the real published-adapter Vitest test, extracts its one machine-readable record, fails closed on missing provisional/unverified labels, and writes the report using Node filesystem APIs **outside the frontend TypeScript project**. The file is an ephemeral analysis export, never source authority or a CI-generated statement of compliance. Recalculate after every governed course-content change rather than counting duplicate paper-pack copies as three independent attempts.

## Next corrective work, not a new feature programme

1. **Exact-version obligation universe (#698):** make the original user PDFs available to the approved source-intake worker with SHA-256 verification and independently enumerate *all* atomic curriculum, quantitative/diagram, response/assessment and Psychology option obligations with page locators and reviewer status. Reconcile the Business 344 structural items and Psychology 118 provisional records; report omissions, overaggregation and compound requirements separately.
2. **Asset adequacy (#698):** join that independently verified universe to this actual published source-to-live crosswalk, preserving explicit absences. Per requirement classify `adequate/inadequate/absent/incorrect/unverified` for Learn, valid Practice mode and Exam Prep; ensure independently marked outcomes are not confused with recall or exposure.
3. **Content correction (#698/#705):** prioritise sources with no reliable testing, mandatory applied skill gaps, Psychology compulsory/option-specific Research Methods and Business quantitative/diagram & synoptic A-level exam demand. Create original questions/examples and independently quality-check them; do not create arbitrary quizzes to inflate density.
4. **Learner acceptance (#703/#694):** prove actual signed-in course selection and Paper 3 option scope, missed specific skill → relevant Learn → distinct marked response → persisted evidence → Plan/REV/Progress update after reload and continuing schedule through papers. The live hosted confirmation email issue #693 remains separate.

## QA and documentation impact

The crosswalk's unit tests include the published §3.2.2 calculations and reject fictitious requirement credit. They measure content supply only. B1b has its own real-pack evidence contract and idempotent storage/reload tests in `src/app/scored-calculation-item-evidence.test.ts`; genuine authenticated learner-to-Plan acceptance remains separate.

Unit tests use the true published `listAvailableContentAdapters` and source objects (no duplicated synthetic site modules) and fail if the pinned 118 Psychology prototype-to-Learn relation vanishes, if extra topic questions are mislabelled specific-skill evidence, or if #717’s four verifiable Business retest pairs cease to be published. A fake requirement receives zero scored credit even if a generic MCQ exists in that topic. This prevents future regressions toward spurious 100% course coverage.

This is a **technical evidence/inventory change**, not a policy or new learner feature. INDEX is updated in the same PR. No database migration, learner data mutation, public availability or source-rights promotion. Historical audits remain historically true. The #698/#703 trackers stay open until the whole source-bound learner outcome is independently proven.
