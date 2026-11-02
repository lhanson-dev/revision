# LF-04 — Relevant published Business case-study selection

**State:** Proposed implementation on `fix/765-lf04-relevant-business-case-selection`. Not merged, released or learner-accepted.

**Issue and scope:** #765 LF-04, coordinated with #698 (educational adequacy/complete syllabus audit). The source task is the existing learner application: `/revision/app/` → Courses → AQA 7132 Business → Practice topic → Case study warm-up. No new activity or renderer.

## Reproduction / classification

On approved `main` (2 November 2026), `src/app/FocusedLearningWorkspace.tsx` selected `adapter.listCaseStudies()[0]` regardless of the chosen Practice topic. The six already-published Business cases have distinct subject matter, but without topic relevance metadata the same *Northstar Meals plc* case is advertised even while practising Marketing, Finance or Strategic Position. The problem is **incorrect source selection**, not missing case text or an inability to render existing question context.

The generic question UI already receives and renders any `context`/data `table` attached to structured Practice questions. A source inspection of the retained 231-question Business fast-path bank found no referential stems in that tranche with both a missing context and no table; this is not an audit of every Business/Psychology question.

## Correction

- A backward-compatible optional `topicIds` field on the existing validated case-study schema, with relevance metadata on five of the six existing Business cases, while retaining the sixth case without a misleading tag. This is authored relevance metadata, not new teaching, a new question or an assessment capability.
- The canonical Practice workspace calls `caseStudyForPractice(adapter.listCaseStudies(), topicId)` instead of taking the first case globally.
- When the pack contains relevance tags, select the first case that is explicitly relevant to the chosen topic; if none is tagged for the topic, omit the misleading Case study warm-up. For an older pack with **no tags at all**, preserve the pre-existing first-case fallback; do not silently disable its experience.
- Exact candidate Business route: Operations → Northstar; Human resources / Strategic methods → Willow; Strategic direction → Kestrel; Strategic position → Pulse; Strategic change → Ember. **What is Business? / Leadership / Financial management / Marketing management** currently have no appropriately tagged existing whole-case warm-up; do not claim they do. The sixth original case, Tide Renewables, stays published in the pack but is not shown as a Finance topic case until a correctly aligned case or appropriate topic-scoped question selection is available. Independent subject-review of case relevance and missing-source cases remains an action for #698.
- Existing six case texts, questions, explanations and marks remain identical. Published case IDs, internal activity id `case-study` and evidence/save behaviour are unchanged; there is no schema database migration.


## Source-first AQA 7132 case relevance check (2 November 2026, bounded internal review)

**Additional source correction:** Original Kestrel Bikes questions focus on differentiation/focus strategic direction and licensing/international entry methods, aligning primarily with AQA §§3.8–3.9, not §3.3 Marketing Management's marketing objectives, research, segmentation/targeting/positioning and marketing mix. The earlier `marketing` candidate tag was removed; the exact case remains usable for `strategic-direction`. This does **not** claim there are no Marketing questions in Revision overall. It records that none of these six existing whole-case warm-ups is sufficiently §3.3-targeted. Complete coverage stays with #698.


Authoritative source: Founder-supplied **AQA A-level Business 7132, v2.0, 14 June 2023** (reference-only PDF); published Section 3.3 Marketing Management, 3.4 Operational Management, 3.5 Financial Management, 3.6 Human Resource Management, 3.7 Analysing the Strategic Position, 3.8 Choosing Strategic Direction, 3.9 Strategic Methods and 3.10 Managing Strategic Change. This was a direct source-text check, **not a fresh independent A3 review, full item-level audit or human specialist approval**.

A material classification error was found and corrected before release: *Tide Renewables* question 1 teaches **investment appraisal** (payback, ARR and NPV) under **§3.7.8**, and question 3 teaches **network analysis** under **§3.10.3**. Neither is an exact match for **§3.5 Financial Management**, whose published requirements focus on objectives/cash flow/profit, budgets, cash-flow forecasts, break-even, profitability, finance sources and improving cash flow/profit. A superficial money-related similarity is not enough to claim a Finance warm-up. The candidate Finance tag was therefore removed while keeping the six existing case texts, IDs, five-question sets and answers unmodified. Existing topic-matching behaviour now honestly gives no case for Finance. This is an educational **accuracy correction**, not proof that Finance already has adequate applied case practice. Record missing Finance case coverage for #698.

Remaining case-level labels are plausible cross-functional links to the AQA sections, not certification that **every** one of a case's five questions independently tests the selected topic. In particular, Willow mixes Human Resources with Strategic Methods, Kestrel covers Strategic Direction and international Strategic Methods (its older Marketing candidate tag was removed because it did not practise the distinct §3.3 Marketing Management requirements), Pulse mixes Strategic Position with digital methods and culture, and Ember mixes Strategic Change with SWOT/Triple Bottom Line. The broader missing-context and question-by-question adequacy review stays with #698/#765 LF-04; do not treat a matching case title as proof of a valid assessment source for each item.

## Tests and learner acceptance

New Vitest checks preserve the six content objects in all three Business paper packs, ensure each tag names a real Business topic, verify exact six existing topic matches and four honest empty states, and preserve the legacy all-untagged fallback. Added canonical learner-route Playwright tests use the published Business course: Strategic Position opens Pulse rather than the first case, Operations opens Northstar with its original stimulus, and §3.5 Finance hides the mismatched Tide warm-up while still offering scored questions. The tests verify no accidental saved evidence is created from opening these unscored examples and run across the existing responsive project matrix. This proves selection logic and content provision, **not actual student comprehension, adequate syllabus-wide case coverage, or real learner acceptance**.

Before any merge: exact-head CI, responsive desktop/tablet/phone in canonical Practice (including no-case honest state), screen reader/keyboard and appearance checks, independent content judgement under #698, Founder approval. After merge: Pages production deployment and real signed-in learner confirmation, no historical-score or saving regression. All remain unverified at candidate stage.

**Documentation impact:** this technical note, INDEX and the active Defect Register updated with this code and regression suite. Existing Course Learning Blueprint (application-context demands), Product UX Principles and AI Agent Constitution already govern this correction. No normative authority change; original learner observation stays historical evidence.
