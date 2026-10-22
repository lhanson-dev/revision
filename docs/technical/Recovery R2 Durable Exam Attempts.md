# REC-10 — durable full-exam attempt implementation contract

**Status:** In progress; technical candidate, NOT released, NOT approved for migration or merge. Baseline: main `df1adc5b7fd49d52a78f8c5651977a1077ebf118` (22 October 2026).  
**Canonical learner path:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → `CourseExperienceScreen` → `ExamPrepSection` → `ExamSimulator`. Do not edit `src/app/App.tsx`.

## Verified failure
ExamSimulator currently owns answers, selected section alternatives, flags, position, timer, self-marking progress and its frozen submission batch only in component state. PR #656 protects in-component partial-save retries, not refresh. PR #657's `learner_practice_checkpoints` deliberately excludes whole exam attempts and raw written answers. Therefore a 90-minute learner paper can be lost after refresh or exit. Neither an unsubmitted draft nor opening an exam is valid learning evidence.

## Smallest safe architecture
One **separate** authenticated, learner-owned `learner_exam_attempts` table, not a parallel scored evidence system. Key exact learner/course/module/exam, immutable attempt ID, content fingerprint, optimistic revision, bounded versioned JSON state, lifecycle, expiry. Store only authored content references/fingerprint, not the whole assessment content. Draft answers (including written responses), section choices, flags, position, marking AO inputs and timing metadata are personal data, not scored progress.

- Restore only after both the exact authenticated course scope and entire current exam fingerprint are verified. Changed questions, keys, options, rules or invalid checkpoint: fail closed, explain, allow explicit discard; never silently replace work.
- Save transitions using revision compare-and-swap; a changed concurrent tab is a conflict rather than a permitted overwrite. Ambiguous acknowledgements can be accepted only after a scoped read proves the *exact* intended state.
- Before writing **any** scored evidence, persist a frozen submission, including stable question and whole-paper evidence IDs, identical timestamps, marks and final summary. On interrupted submission, replay only those immutable facts through the existing owner-scoped evidence writer (which checks duplicate payload equality), then mark the attempt submitted. Never retry by generating new scored facts.
- After final committed state, block editing/restarting the same attempt and restore its recorded result. Unsubmitted/marking/submitting state never counts toward Topics covered, Understanding, Exam readiness or plan completion.
- An empty paper creates no scored evidence. Objective keyed answers are scored from the key; blank questions have no question evidence and no self-awarded marks; whole-paper results retain their distinct scope.

## Explicit unresolved Founder/product and privacy choices
**HOLD before production backend migration, frontend enablement or merge approval:**
1. **Written answer retention:** Approved privacy principles call for a purpose and deliberately chosen period after legal/privacy review but do not specify a period for raw mock answers. A **14-day expiry proposal** is shown for development parity with Practice, *not approval*; expiry metadata alone does not delete stored data. Approval must specify deletion schedule, user deletion/export behaviour and whether a submitted frozen batch retains raw answers and for how long. Do not enable persistent storage of raw drafts without this decision.
2. **Timer while unavailable:** Today's simulator explicitly permits pausing, yet has no governed rule for browser close, device sleep or connection loss. Decide whether timed mocks count wall-clock time while absent or are treated as paused on interruption; both have educational tradeoffs. No hidden reset or invented duration permitted. The runtime integration must consistently enforce the chosen rule, including a two-tab conflict, and explain it in student language.
3. **Finalisation:** Existing evidence writes are separate owner-verified rows and not a multi-row database transaction. A persisted frozen batch plus idempotent replay avoids conflicting marks but is **not** an atomic evidence transaction; acceptance must explicitly distinguish this from single-transaction commit.
4. **Pilot limits:** Keep existing FI-001/AQA 7132 and Psychology 7182 paper and option restrictions. No widening of restricted content or educational acceptance by implementing storage.

## Delivery, dependencies and acceptance
Treat schema/service scaffolding as **non-deployable until governed decisions**. Follow on the same REC-10 candidate branch with canonical app integration, refresh/leave/re-entry recovery UI, visible confirmed-save and error states, deliberate discard, timing enforcement, finalisation, SQL owner-versus-other-user/anon/privileged tests, Playwright interruption/multi-tab/browser responsiveness, and full exact-head CI.

Prior PRs #651/#652 remain separate planner changes; neither directly changes ExamSimulator or the exam draft persistence domain. Do not merge them as an incidental dependency.

Do not apply the draft migration or change the production readiness contract until this feature is approved and fully tested. For a release candidate, extend `revision_release_readiness()` from `r2-practice-checkpoint-v1` to an exam-attempt capability contract, update `.github/workflows/deploy-pages.yml`, prove isolated DB/RLS, then apply backend ahead only through the governed release procedure before frontend deployment.

## Documentation impact
New implementation truth belongs here and in SQL/services/tests, linked from INDEX. Change approved normative privacy/timer authority only following a Founder decision; do not misrepresent this technical contract as approved policy. Update assurance/defect registers as acceptance evidence matures. Historical audits and previously issued releases remain unchanged.
