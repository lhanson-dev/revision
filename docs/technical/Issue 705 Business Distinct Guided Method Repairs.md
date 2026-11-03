# #705 — Business 7132 expected value versus net gain guided repair

**State:** governed candidate, **educational HOLD** until independent content review and exact-head release assurance; not merged or live.
**Source and scope:** AQA A-level Business 7132 v2.0 §3.2.2 (printed p.14); published Foundation page `bus-evi-004`; authentic course route `/revision/app/#/courses/aqa%3Aaqa-a-level%3A7132/practice`. Original Revision method wording, not reproduced AQA copyright.

## Source-backed defect and decision

The existing published `bus-evi-004` already contains separately identified worked examples for **expected value** and **net gain**; the four published final-number Practice questions independently target these separate requirements. Existing #705 repair selection points both missed skills to the **same Foundation page**, so a shared Read button alone is not two different repairs. Inventing two Foundation node identities to make labels appear different would corrupt source mapping and old evidence.

This bounded correction *does not* split or fabricate Foundation nodes. After a **wrong, source-mapped, single-target software-scored Business calculation**, the ordinary Practice feedback now offers an additional **unscored, skill-specific guided method** before the existing exact Learn link and Next action:

- **Expected value:** multiply each signed possible outcome by its probability, including negative losses, then add weighted outcomes. Original existing Foundation example: 0.7 × £180,000 + 0.3 × −£100,000 = £96,000.
- **Net gain:** begin with an expected value, identify the separate *certain cost* not yet included, then subtract it once. Existing Foundation example: £96,000 − £60,000 = £36,000.

The student attempts a different unscored example and may reveal the worked steps. The methods, tasks and warnings differ. They are not simply renamed copies of one teaching message. These source-backed worked numbers appear in the already published `bus-evi-004` content and are distinct from the original wrong and fresh independent assessed practice cases.

**No new scoring or evidence state:** Opening, reading or revealing these steps never creates a scored result, clears a weakness or changes mastery's evidence threshold. A wrong final number alone identifies an observed *skill result*, **not** the specific mistaken step; do not label it a diagnosed misconception. The normal Plan independent recheck remains a **different scored question** selected by the existing FI-001 mechanisms, not by this feedback. For a separately scheduled **Learn repair**, authenticated Home and Plan pass the real FI-001 selected `HomeTask` to `PlannerRuntime` at the Start event. `guidedRepairForStartedPlannerTask` requires exact agreement among the planner recommendation ID, course, topic, `learnTarget`, `skillFocus` and the published `bus-evi-004` page. The runtime temporarily binds that unscored method to the signed-in learner and exact Learn destination. The ordinary Learn URL is a page locator only, never a treatment identifier. `parseRoute` discards any forged `repairSkill` query, and a reload or deep link fails closed to general Foundation teaching without losing persisted scored evidence. No planner, scoring or RLS system is changed.

## Safeguards and tests

- `practice-guided-repair.test.ts` uses the real published Business pack and checks exact Foundation page provenance, genuinely different expected-value/net-gain methods, stable treatment across the two question variants, and refusal for multi-target, untagged, changed-node and wrong-topic questions. `navigation.test.ts` rejects forged Learn query parameters. `today-recommendations.test.ts` requires exact FI-001 planner-item identity, course, topic, page and skill matching, and rejects fallback, accepted session and mismatched treatments.
- Existing `learner-value-journey.spec.ts` real local GoTrue/PostgREST signed-in wrong Business calculation → Learn → different Plan recheck path now requires the focused guided method to be visible, revealed and labelled as **unscored**. It additionally uses the real signed-in Plan Start action to display the exact expected-value guided method, then checks that reload and forged expected-value/net-gain URLs cannot select a treatment and that no scored evidence is created or altered.
- Full type, lint, unit/build, real Auth/database, desktop/tablet/phone and security CI must pass on the integrated head; separate source/content adequacy review is still required before publication. **The existence of these tests or this PR is not a passing receipt.**

## Integration and educational truth boundary

The authored guided methods are not separate published Foundation nodes and do not diagnose which procedural step was misunderstood from one wrong final number. The Plan repair displays an exact skill-specific **method**, but completion of reading is still only exposure and the existing FI-001 source-backed independent question is still needed. This release candidate does not yet prove two learner-typed wrong calculations independently improve after both interventions, and Psychology complete parity is untested.

## First independent review receipt and correction

The trusted isolated A2/A3 review [#41686181933](https://github.com/lhanson-dev/revision/actions/runs/41686181933), exact head `5696520d8e63b2e2e8d8a83bc54a97d7598d5601`, returned **FAIL/HOLD**, retaining its machine-readable evidence artifact. Five of seven dimensions passed (arithmetic, educational differentiation, original practice validity, source rights and claim boundaries). Two dimensions reflected one material issue: the old `?repairSkill=` Learn URL allowed a learner to switch the displayed repair without any verified FI-001 selection. No grades or mastery were issued, but the treatment provenance was unsound. That historical receipt remains untouched.

The subsequent correction removes URL-selected treatments, binding guidance to the genuine authenticated FI-001 Home/Plan Start action instead. Reload or a forged deep link deliberately returns to ordinary Foundation teaching while preserving stored marks and future planning. **A fresh exact-head CI result and independent re-review are required**; this note does not promote the previously held candidate to educational PASS.

## Remaining #703 definition-of-done gaps

This is distinct **available treatment**, not proof the student learned or executed the method. Both still share a Foundation reading page; exact treatment-specific exposure tracking is not added. We still need two genuine browser-typed same-topic wrong answers followed by both different guided repairs and *different independent scored checks* with correct cross-screen evidence readback, a real Psychology full loop, ongoing 14-day programme changes and written-answer boundaries. #698 owns educational adequacy and the independent subject reviewer; #703 owns full authenticated acceptance. PR #804 separately fixed course-local/global FI-001 Progress; it was Founder-approved, merged at `cf4ecea1cf3ebc5ae035c7c473cb2332a7396f9d` and production-verified in run `41607325283`. Its completion does not satisfy #703's remaining educational and authenticated two-course outcomes. #703 was reopened after GitHub automatically closed it on PR #804's merge.

## Documentation impact

The existing Course Learning Blueprint, Adaptive Revision Planning and Claims and Progress Governance prescribe feedback that repairs learning without conferring unsupported mastery. This is an existing-approved-FI-001-Gate-B #705 bounded content/workspace implementation, not new normative authority. Add this technical note, INDEX and regression with code in the same governed PR; no schema migration, new planner, ADR or rewrite of previous acceptance audit. No merge without specific Founder approval after independent review.
