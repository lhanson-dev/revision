# Issue #703 — Browser-entered Business mistake to independent Plan reassessment

**Date:** 1 November 2026. **Status:** Candidate, unmerged. Corrected test's source-head CI #41325542499 passed all nine required jobs, including 6/6 isolated real-Auth browser/database tests on their first attempt. Exact current-main CI was red (#41340092786); async Plan launch race under investigation and corrected-test rerun pending. No runtime change proposed.

## Tested acceptance slice

Canonical learner: `/revision/app/` → AQA Business 7132 → Practice / Plan / Progress. AQA 7132 v2.0 §3.2.2 printed p14 expects decision-tree *expected value* (distinct from *net gain*). The existing authored bank supplies two independently phrased exact-item numerical checks (`rev7132-3.2.2-expected-value-01` and `rev7132-3.2.2-expected-value-02`). These software-scored final numbers are not evidence of all method steps, constructed trees, financial judgement or durable mastery.

The new test appended to the **already CI-invoked** `tests/e2e/learner-value-journey.spec.ts` extends approved PR #757, whose first wrong calculation had been service-seeded. This test instead:

1. Refuses hosted services; creates an isolated ordinary confirmed student using local Auth / PostgREST and checks owner-bound data.
2. Sets up Business enrolment, future exam and realistic capacity through existing learner services; marks the exact authorised Learn page as **previously reviewed** through the owner-scoped service. Prior review is exposure, not scored competence.
3. Signs in through the actual browser, selects Leadership and Calculations using the existing Practice start UI, begins a genuine session, types an **incorrect** number for the published expected-value question and chooses **Certain**.
4. Requires the wrong-answer feedback, plus a verified persisted incorrect, confident observation bound to the exact expected-value AQA item. No service-seeded scored mistake or fake Plan item is permitted.
5. Closes the unfinished Practice activity and uses the real **Discard saved session and start again** control to discard its unfinished checkpoint, while independently verifying the original incorrect scored result remains saved. Then enters the normal Day Plan and requires a **different** published expected-value question derived from that retained observation.
6. Types a correct new number through the Plan interface, requires saving, re-reads separate existing and fresh evidence and verifies the immediate same-skill recheck need withdraws, then reloads and visits Progress.

A UI that does not allow a real wrong number, loses the prior answer on discard, cannot launch the different exact skill after the learner has exited the unfinished session, or fails the save/readback check must fail this acceptance test. Do not weaken assertions just to achieve green CI. The precise Practice question order and Plan date are validated against the source-backed live content; no hidden test-mode route or manually forced Home task is used.

## Scope and limitations

- The previous Learn reading is saved through the ordinary learner service; this does **not** prove a browser learner can complete the targeted Learn repair in this scenario.
- This is one specific *expected-value* calculation, **not both expected-value and net-gain** and not the two distinct Marketing growth misconceptions covered by separate PR #755.
- Plan and Progress navigation do not alone prove Home and REV changed their reasoning or prioritised the same evidence. Those visible reactions remain explicit tests to add.
- One correctly scored final number is evidence of that result, not examiner-grade reasoning or overall course competence. The full #703 and #698 readiness/audit scopes remain open.
- No product code, source banks, normative policy, backend migration, learner-scoring decision or visual experience changes are required by this test-only package.

## Documentation impact

The new regression, this same-branch technical note and the `INDEX.md` pointer form the complete scoped change. Educational scope already follows the Course Learning Blueprint and the Claims & Progress Governance/Adaptive Revision Planning authorities. No new ADR or normative authority edit is warranted; prior evidence remains historically accurate. An independent CI run against the current merge candidate is mandatory before claiming pass or asking the Founder to approve its merge.

## First CI failure and checkpoint-lifecycle correction

The original draft PR #763 CI #41315240160 failed only the new real-Auth test (all other eight jobs succeeded): the browser-entered incorrect final number was saved with its exact source identity, but the demanded recheck did not open from today's Plan. Playwright retried and the same Plan assertion failed again. That test had deliberately **left the five-question Practice session unfinished**. A user should be able to complete or explicitly discard unfinished Practice before demanding an independent Plan reassessment; the original test had mixed that in-progress-session state with the standalone reassessment acceptance. The revised test now exercises the real Back to practice → Discard saved session control, independently confirms the wrong scored observation is still owner-readable and that the exact expected-value recheck opportunity survives, then demands the real Plan launch and second browser-entered result. This does not assume the correction fixes the integration; **revised exact-head CI is pending**. The separate user journey for leaving a session unfinished and returning to resume remains covered elsewhere and must not be confused with completed repair/retesting. No runtime code or assessment/scoring logic changed.

## Corrected test first successful run and current-main reconciliation

The original scenario failed in CI #41315240160 because its real browser-entered wrong answer was saved but a new recheck did not open while its five-question Practice checkpoint was unfinished. This is **not** evidence the planner was broken; the test conflated unfinished-session recovery with standalone reassessment. The corrected test exercises the real Back to practice → Discard saved session control, independently verifies scored evidence and source-backed recheck eligibility survive, and then requires launching a different published Plan item. On its corrected head, CI #41325542499 passed **all nine** required jobs, with **6/6** local real-auth browser tests passing first time and no Playwright retries. The branch is being brought forward onto approved main `ff9609880b898f37f8f4799fabb50d387cd6db7e`, preserving all intervening work; the exact integrated-head CI is a separate release gate. No production code or authority changes; the earlier failure remains in the historical record.

## 1 November late CI failure — async Plan launch classification and approved-main refresh

Exact integrated head `3906e286aee9ad14cac1df1138493925837501b9` failed CI #41340092786 only in the added authenticated browser test. The wrong Practice final number, owner-scoped saving, explicit discard and preservation of exact skill recheck opportunity succeeded. The failure was the **same UI assertion** that today's Plan lacked an opened 'Calculation recheck', both first attempt and retry. The previous corrected CI #41325542499 was green, so the evidence is **intermittent**, not reliable full acceptance. Code inspection identified an unawaited asynchronous launch: `handleStartSuggested` awaits recording a planner activity event before mounting `HomeFocusedActivity`. The test had used `isVisible()` immediately after `click()`, which does **not** wait for async React state change. The test now awaits the actual 'Back to Plan' control (proof that focused activity opened) before classifying that row. It also reports actual clicked rows on failure, without weakening the demanded exact new question or saved result. This is a **candidate diagnosis**, not proof of the only cause; if next CI fails, investigate real scheduling/selected item under the preserved evidence. No runtime or score changes.

In parallel Founder-approved PR #755 landed on main, so PR #763 is mechanically reconciled onto new canonical main, retaining #755's Marketing test, same-branch technical documentation and INDEX references. A fresh exact-head 9-job CI is obligatory before requesting approval. No historical evidence is rewritten.
