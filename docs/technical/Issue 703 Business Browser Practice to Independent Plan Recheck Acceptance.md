# Issue #703 — Browser-entered Business mistake to independent Plan reassessment

**Date:** 1 November 2026. **Status:** Candidate, unmerged; CI evidence pending. No runtime change proposed.

## Tested acceptance slice

Canonical learner: `/revision/app/` → AQA Business 7132 → Practice / Plan / Progress. AQA 7132 v2.0 §3.2.2 printed p14 expects decision-tree *expected value* (distinct from *net gain*). The existing authored bank supplies two independently phrased exact-item numerical checks (`rev7132-3.2.2-expected-value-01` and `rev7132-3.2.2-expected-value-02`). These software-scored final numbers are not evidence of all method steps, constructed trees, financial judgement or durable mastery.

The new test appended to the **already CI-invoked** `tests/e2e/learner-value-journey.spec.ts` extends approved PR #757, whose first wrong calculation had been service-seeded. This test instead:

1. Refuses hosted services; creates an isolated ordinary confirmed student using local Auth / PostgREST and checks owner-bound data.
2. Sets up Business enrolment, future exam and realistic capacity through existing learner services; marks the exact authorised Learn page as **previously reviewed** through the owner-scoped service. Prior review is exposure, not scored competence.
3. Signs in through the actual browser, selects Leadership and Calculations using the existing Practice start UI, begins a genuine session, types an **incorrect** number for the published expected-value question and chooses **Certain**.
4. Requires the wrong-answer feedback, plus a verified persisted incorrect, confident observation bound to the exact expected-value AQA item. No service-seeded scored mistake or fake Plan item is permitted.
5. Leaves the unfinished Practice session saved, enters the normal Day Plan and launches a **different** published expected-value question derived from that observation.
6. Types a correct new number through the Plan interface, requires saving, re-reads separate existing and fresh evidence and verifies the immediate same-skill recheck need withdraws, then reloads and visits Progress.

A UI that does not allow a real wrong number, loses the prior answer or the unfinished session, cannot launch the different exact skill, or fails the save/readback check must fail this acceptance test. Do not weaken assertions just to achieve green CI. The precise Practice question order and Plan date are validated against the source-backed live content; no hidden test-mode route or manually forced Home task is used.

## Scope and limitations

- The previous Learn reading is saved through the ordinary learner service; this does **not** prove a browser learner can complete the targeted Learn repair in this scenario.
- This is one specific *expected-value* calculation, **not both expected-value and net-gain** and not the two distinct Marketing growth misconceptions covered by separate PR #755.
- Plan and Progress navigation do not alone prove Home and REV changed their reasoning or prioritised the same evidence. Those visible reactions remain explicit tests to add.
- One correctly scored final number is evidence of that result, not examiner-grade reasoning or overall course competence. The full #703 and #698 readiness/audit scopes remain open.
- No product code, source banks, normative policy, backend migration, learner-scoring decision or visual experience changes are required by this test-only package.

## Documentation impact

The new regression, this same-branch technical note and the `INDEX.md` pointer form the complete scoped change. Educational scope already follows the Course Learning Blueprint and the Claims & Progress Governance/Adaptive Revision Planning authorities. No new ADR or normative authority edit is warranted; prior evidence remains historically accurate. An independent CI run against the current merge candidate is mandatory before claiming pass or asking the Founder to approve its merge.
