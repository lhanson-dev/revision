# Recovery R2 — focused evidence and activity confirmation integrity

**21 October 2026 · Candidate on governed branch, not released or educationally accepted.**
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → Home/Plan/REV → `HomeFocusedActivity`; Courses → `CourseExperienceScreen` → `FocusedLearningWorkspace`. The legacy `src/app/App.tsx` is not the target.

## Scoped correction

- A focused Quick Check or Flashcards session writes each answered item before moving on. After the final answer, the Plan completion event is a **separate** save. If it fails, the learner sees a recoverable pending-confirmation state and retries the completion event without answering or scoring the final item again. Never show an unconfirmed Plan completion as confirmed.
- Existing evidence IDs are stable on uncertain retries. A database primary-key collision is accepted only after reading the *same learner's* saved fact and comparing the full validated payload. A different or unreadable record is a failure, not proof of a successful save.
- Planner reconciliation excludes partial Quick Check, Flashcards and Learn starts, refuses exam-question completion from unrelated question formats, and checks module identity when it is present. Whole-paper attempts remain excluded from topic-scoped reconciliation.
- No new inferred teaching exposure or marks are created; a performed action and a confirmed Plan session remain distinguishable from longer manually accepted bookings. Source-backed availability and restricted pilot policy are unchanged.

## Limitations and gates

This is an **initial bounded engineering correction** within R2, not R2 closure. Learn page exposure is not yet recorded as a distinct persisted type; the independent Practice in-progress state is not durable on refresh; a full exam attempt is still not durably resumable. The existing `recordPlannerActivityEvent` completed write is not yet deduplicated server-side and a network-uncertain write remains an additional reconciliation risk. Home/Plan/REV still recalculate separate snapshots; their decisions have not been proven identical. No schema/data migration is proposed.

Targeted unit contracts are in `learning-evidence-service.test.ts` and `recovery-evidence-scope.test.ts`. **Status: source tests authored, not executed locally; require exact-head CI and fresh browser, RLS/data, network-failure and recovery assurance** on Business 7132 and Psychology 7182 before asking for merge approval. A source inspection and a GitHub green check are not an independent student educational verdict. Maintain `REC-03/04/05/07/08/10` and `JRN-03` as Partial until proven by the required layers. Do not close `DEF-2026-010` or `DEF-2026-011` merely on this candidate.

## Documentation impact

No normative rule changed: the corrections implement existing Learning Blueprint, Evidence Trust, Claims and Progress, and Recovery Control Plan constraints. Code/tests and this current implementation note are updated together; historical dated audits are not rewritten. No new specialist FI-009–012 feature is self-authorised.
