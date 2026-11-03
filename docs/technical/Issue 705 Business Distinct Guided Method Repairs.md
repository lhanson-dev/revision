# #705 — Business 7132 expected value versus net gain guided repair

**State:** governed candidate, **educational HOLD** until independent content review and exact-head release assurance; not merged or live.
**Source and scope:** AQA A-level Business 7132 v2.0 §3.2.2 (printed p.14); published Foundation page `bus-evi-004`; authentic course route `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7132/practice`. Original Revision method wording, not reproduced AQA copyright.

## Source-backed defect and decision

The existing published `bus-evi-004` already contains separately identified worked examples for **expected value** and **net gain**; the four published final-number Practice questions independently target these separate requirements. Existing #705 repair selection points both missed skills to the **same Foundation page**, so a shared Read button alone is not two different repairs. Inventing two Foundation node identities to make labels appear different would corrupt source mapping and old evidence.

This bounded correction *does not* split or fabricate Foundation nodes. After a **wrong, source-mapped, single-target software-scored Business calculation**, the ordinary Practice feedback now offers an additional **unscored, skill-specific guided method** before the existing exact Learn link and Next action:

- **Expected value:** multiply each signed possible outcome by its probability, including negative losses, then add weighted outcomes. Original existing Foundation example: 0.7 × £180,000 + 0.3 × −£100,000 = £96,000.
- **Net gain:** begin with an expected value, identify the separate *certain cost* not yet included, then subtract it once. Existing Foundation example: £96,000 − £60,000 = £36,000.

The student attempts a different unscored example and may reveal the worked steps. The methods, tasks and warnings differ. They are not simply renamed copies of one teaching message. These source-backed worked numbers appear in the already published `bus-evi-004` content and are distinct from the original wrong and fresh independent assessed practice cases.

**No new scoring or evidence state:** Opening, reading or revealing these steps never creates a scored result, clears a weakness or changes mastery's evidence threshold. A wrong final number alone identifies an observed *skill result*, **not** the specific mistaken step; do not label it a diagnosed misconception. The normal Plan independent recheck remains a **different scored question** selected by the existing FI-001 mechanisms, not by this feedback. For a separately scheduled **Learn repair**, the already-selected FI-001 `skillFocus` now travels only as optional display context in the canonical Learn URL (`repairSkill`); `LearnReadingWorkspace` checks the exact published `bus-evi-004` page and eligible spec item before displaying the corresponding same guided method inside `LearnPageLayout`. It does not create or re-rank planner tasks, and an arbitrary URL parameter is never treated as valid assessed evidence. Ordinary Learn bookmarks display the shared Foundation content without an inferred diagnosis.

## Safeguards and tests

- `practice-guided-repair.test.ts` uses the real published Business pack and checks exact Foundation page provenance, genuinely different expected-value/net-gain methods, stable treatment across the two question variants, and refusal for multi-target, untagged, changed-node and wrong-topic questions. `navigation.test.ts` and `today-recommendations.test.ts` verify the FI-001 Learn route retains the selected skill across reload while ordinary bookmarks stay unchanged and recheck tasks do not inherit repair context.
- Existing `learner-value-journey.spec.ts` real local GoTrue/PostgREST signed-in wrong Business calculation → Learn → different Plan recheck path now requires the focused guided method to be visible, revealed and labelled as **unscored**. It additionally loads canonical Learn URLs for both distinct skills and the generic page, verifies the appropriately different card appears only for the targeted routes, and proves this read-only navigation did not create or alter scored rows.
- Full type, lint, unit/build, real Auth/database, desktop/tablet/phone and security CI must pass on the integrated head; separate source/content adequacy review is still required before publication. **The existence of these tests or this PR is not a passing receipt.**

## Integration and educational truth boundary

The authored guided methods are not separate published Foundation nodes and do not diagnose which procedural step was misunderstood from one wrong final number. The Plan repair displays an exact skill-specific **method**, but completion of reading is still only exposure and the existing FI-001 source-backed independent question is still needed. This release candidate does not yet prove two learner-typed wrong calculations independently improve after both interventions, and Psychology complete parity is untested.

## Remaining #703 definition-of-done gaps

This is distinct **available treatment**, not proof the student learned or executed the method. Both still share a Foundation reading page; exact treatment-specific exposure tracking is not added. We still need two genuine browser-typed same-topic wrong answers followed by both different guided repairs and *different independent scored checks* with correct cross-screen evidence readback, a real Psychology full loop, ongoing 14-day programme changes and written-answer boundaries. #698 owns educational adequacy and the independent subject reviewer; #703 owns full authenticated acceptance. PR #804 separately fixed course-local/global FI-001 Progress; it was Founder-approved, merged at `cf4ecea1cf3ebc5ae035c7c473cb2332a7396f9d` and production-verified in run `41607325283`. Its completion does not satisfy #703's remaining educational and authenticated two-course outcomes. #703 was reopened after GitHub automatically closed it on PR #804's merge.

## Documentation impact

The existing Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance prescribe feedback that repairs learning without conferring unsupported mastery. This is an existing-approved-FI-001-Gate-B #705 bounded content/workspace implementation, not new normative authority. Add this technical note, INDEX and regression with code in the same governed PR; no schema migration, new planner, ADR or rewrite of previous acceptance audit. No merge without specific Founder approval after independent review.
