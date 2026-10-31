# Issue #698 — Psychology 7182 sign-test assessed calculation correction

**Status:** Candidate governed branch, not merged or live. **Source:** Founder-supplied AQA A-level Psychology 7182 version 1.4 (1 September 2025), printed p21 §4.2.3.3; mathematical annex pp35–37 §7.2. Source is **REFERENCE_ONLY**. No AQA text, past questions or mark schemes have been reproduced.

## Verified gap and correction
The current shared Psychology content contains a sign-test worked DataDrill and an automatically scored recognition MCQ. Those do not establish that a learner can *independently enter* the calculated sign-test statistic. Two new original paired-score problems, `rev7182-4.2.3-sign-test-01` and `rev7182-4.2.3-sign-test-02`, supply different data, include tied values, and independently compute the smaller sign count S (2 and 1). The source-linked single target is the independently observable calculation atom `PSY-SRC-4233-IT03` (parent prototype `PSY-07-32`); each case has worked feedback.

Both use the existing automatically checked one-mark numerical Practice adapter and existing Psychology Research Methods topic. Source `content/psychology/aqa-a-level/shared/sign-test-practice.ts` is shared across the three already published paper packs; Learn, exams, planner, schema, database and stable existing content identities are unchanged. The runtime remains `/revision/app/`.

## Assurance and limitations
Arithmetic is executable in `sign-test-practice.test.ts` with independent reconstruction of plus, minus and tied counts, exact per-question source mapping and conversion to real paper-pack Practice. A saved final-number observation must **not** be treated as written method evidence, test-selection reasoning, significance interpretation, durable mastery, actual later retest or confirmed signed-in student acceptance. Cross-question identity permits later rechecking, but full #704/#705 repair and progress integration remains open.

This bounded correction is not the entire Psychology course audit. The provisional 118 Course Truth records remain unverified as a complete atomic requirement denominator. Independent specialist subject/assessment judgement and student-site acceptance are still outstanding.

**Documentation impact:** Technical implementation note and INDEX pointer added alongside content and tests. Existing approved Course Learning Blueprint, Claims and Progress Governance and source-licensing authority are not changed. Historical audits remain unchanged. The programme remains under #698 and #703; no feature-ready decision, new schema, licensing decision, ADR or migration is required.

## 31 October correction: discrete scoring, table accessibility and A3 independent-review gate

The original typed-answer checker allowed a half-unit tolerance for integer final answers; that can incorrectly credit a **fractional** answer (for example 1.6 against sign-test S = 2), even though a count of signs is discrete. The new items therefore opt in to `answer_rule: 'exact-integer'`; `FocusedLearningWorkspace` passes that authored rule to the calculation checker. Existing Business and other numerical calculations retain their existing rounding tolerance. Source tables use participant-labelled Before/After rows rather than a long inline sequence. Tests assert item source binding, table numeric parity, valid and invalid entries and the unchanged generic default.

This correction touches the **shared** canonical Practice adapter and learner workspace as well as the three existing Psychology packs. Its substantive risk is bounded by the opt-in field. New tests must pass TypeScript, lint, unit/build, database/RLS, signup, browser desktop/tablet/phone, security and current-main integration before merge recommendation; no historical score correction or database migration is performed.

The indexed JSON reviewer handoff at `docs/technical/Issue 698 Psychology Sign Test A3 Independent Review Handoff.json` records both original questions, exact source identity, independently recomputable expected sign counts, authoring-context findings and the explicit `NOT_RUN` separate A3 reviewer status. These internal checks and green engineering CI are **not** a fresh-context independent educational review. The active Content Accuracy Assurance Gate requires the separate reviewer issue register (and remediation of all blocking/material issues) before presenting these new student-facing items as assured for publication. Until then this PR remains educational **HOLD**, notwithstanding passing deterministic tests. Qualified human course sign-off and real learner acceptance remain open gates for the full Psychology programme.

## Atomic scoring protection

Merged source-first PR #747 separates sign-test **selection** (`PSY-SRC-4233-IT02`) from **calculation** (`PSY-SRC-4233-IT03`). This PR deliberately persists only `PSY-SRC-4233-IT03` as a single-target software-scored final-number observation; the parent Course Truth requirement `PSY-07-32` still supplies the Learn page `research-methods-psy0732`, but cannot be credited wholesale as demonstrated. The atom is a provisional source-first candidate and retains unverified educational sufficiency/independent reviewer status. Do not infer test-choice, significance, method or durable mastery.
