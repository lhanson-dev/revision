# LF-04 — Relevant published Business case-study selection

**State:** Proposed implementation on `fix/765-lf04-relevant-business-case-selection`. Not merged, released or learner-accepted.

**Issue and scope:** #765 LF-04, coordinated with #698 (educational adequacy/complete syllabus audit). The source task is the existing learner application: `/revision/app/` → Courses → AQA 7132 Business → Practice topic → Case study warm-up. No new activity or renderer.

## Reproduction / classification

On approved `main` (2 November 2026), `src/app/FocusedLearningWorkspace.tsx` selected `adapter.listCaseStudies()[0]` regardless of the chosen Practice topic. The six already-published Business cases have distinct subject matter, but without topic relevance metadata the same *Northstar Meals plc* case is advertised even while practising Marketing, Finance or Strategic Position. The problem is **incorrect source selection**, not missing case text or an inability to render existing question context.

The generic question UI already receives and renders any `context`/data `table` attached to structured Practice questions. A source inspection of the retained 231-question Business fast-path bank found no referential stems in that tranche with both a missing context and no table; this is not an audit of every Business/Psychology question.

## Correction

- A backward-compatible optional `topicIds` field on the existing validated case-study schema, with metadata on six existing Business case objects only. This is authored relevance metadata, not new teaching, a new question or an assessment capability.
- The canonical Practice workspace calls `caseStudyForPractice(adapter.listCaseStudies(), topicId)` instead of taking the first case globally.
- For a fully tagged pack, select the first case that is explicitly relevant to the chosen topic; if none is tagged for the topic, omit the misleading Case study warm-up. For an older pack with **no tags at all**, preserve the pre-existing first-case fallback; do not silently disable its experience.
- Exact current Business route: Operations → Northstar; Human resources / Strategic methods → Willow; Marketing / Strategic direction → Kestrel; Strategic position → Pulse; Strategic change → Ember; Finance → Tide. **What is Business? / Leadership** currently have no appropriately tagged existing whole-case warm-up; do not claim they do. Independent subject-review of case relevance and missing-source cases remains an action for #698.
- Existing six case texts, questions, explanations and marks remain identical. Published case IDs, internal activity id `formulas-data` and evidence/save behaviour are unchanged; there is no schema database migration.

## Tests and learner acceptance

New Vitest checks preserve the six content objects in all three Business paper packs, ensure each tag names a real Business topic, verify exact eight existing topic matches and two honest empty states, and preserve the legacy all-untagged fallback. This proves selection logic and content provision, **not actual student comprehension, adequate syllabus-wide case coverage, or real learner acceptance**.

Before any merge: exact-head CI, responsive desktop/tablet/phone in canonical Practice (including no-case honest state), screen reader/keyboard and appearance checks, independent content judgement under #698, Founder approval. After merge: Pages production deployment and real signed-in learner confirmation, no historical-score or saving regression. All remain unverified at candidate stage.

**Documentation impact:** this technical note, INDEX and the active Defect Register updated with this code and regression suite. Existing Course Learning Blueprint (application-context demands), Product UX Principles and AI Agent Constitution already govern this correction. No normative authority change; original learner observation stays historical evidence.
