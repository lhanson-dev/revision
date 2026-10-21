# Recovery R2 — focused evidence and activity confirmation integrity

**21 October 2026 · Candidate on governed branch, not released or educationally accepted.**
**Canonical runtime:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → Home/Plan/REV → `HomeFocusedActivity`; Courses → `CourseExperienceScreen` → `FocusedLearningWorkspace`. The legacy `src/app/App.tsx` is not the target.

## Scoped correction

- A focused Quick Check or Flashcards session writes each answered item before moving on. After the final answer, the Plan completion event is a **separate** save. If it fails, the learner sees a recoverable pending-confirmation state and retries the completion event without answering or scoring the final item again. Never show an unconfirmed Plan completion as confirmed.
- Existing evidence IDs are stable on uncertain retries. A database primary-key collision is accepted only after reading the *same learner's* saved fact and comparing the full validated payload. A different or unreadable record is a failure, not proof of a successful save.
- Planner reconciliation excludes partial Quick Check, Flashcards and Learn starts, refuses exam-question completion from unrelated question formats, and checks module identity when it is present. Whole-paper attempts remain excluded from topic-scoped reconciliation.
- No new inferred teaching exposure or marks are created; a performed action and a confirmed Plan session remain distinguishable from longer manually accepted bookings. Source-backed availability and restricted pilot policy are unchanged.

## Limitations and gates

This is an **initial bounded engineering correction** within R2, not R2 closure. The independent Practice in-progress state is not durable on refresh; a full exam attempt is still not durably resumable. Focused completion event retries are now idempotent during the active component lifetime using a stable UUID plus owner-scoped event verification; recovery after refresh still requires durable session state. Home/Plan/REV still recalculate separate snapshots; their decisions have not been proven identical. Learn exposure introduces a new separate table but does not migrate or rewrite scored student evidence.

Targeted unit contracts are in `learning-evidence-service.test.ts` and `recovery-evidence-scope.test.ts`. **Status: source tests authored, not executed locally; require exact-head CI and fresh browser, RLS/data, network-failure and recovery assurance** on Business 7132 and Psychology 7182 before asking for merge approval. A source inspection and a GitHub green check are not an independent student educational verdict. Maintain `REC-03/04/05/07/08/10` and `JRN-03` as Partial until proven by the required layers. Do not close `DEF-2026-010` or `DEF-2026-011` merely on this candidate.

## Documentation impact

No normative rule changed: the corrections implement existing Learning Blueprint, Evidence Trust, Claims and Progress, and Recovery Control Plan constraints. Code/tests and this current implementation note are updated together; historical dated audits are not rewritten. No new specialist FI-009–012 feature is self-authorised.

## Candidate R2 Learn exposure and coverage extension — 21 October 2026

**Governed scope:** The approved Claims and Progress authority permits meaningful Learn exposure to contribute only to coverage, never understanding or readiness. The approved Learn reading experience remains page-first. No normative authority change is proposed.

- Added `learner_learn_exposures` as a separate, append-only learner-owned table with a composite identity keyed by exact user, course, module and Learn page. Only SELECT/INSERT owner-scoped RLS is available to authenticated clients; anonymous and service roles have no standing grant. Historical scored evidence remains untouched.
- An explicit `I have read this page` action at the end of the canonical Learn page records a factual learner declaration after content reading. Opening a page, looking at a quick check or selecting a different screen **does not** create exposure. The UI shows an error and permits retry if persistence fails; the reader can still navigate and no scored progress is invented.
- Projection tests for the actual published AQA Business 7132 and Psychology 7182 assets require **all applicable current Learn pages** for a topic before reviewed-only activity counts the whole topic as covered. Exact course/module/topic/page identity is checked against published content; unrelated or obsolete exposure cannot count. Legitimate scored evidence still counts a topic as encountered. Neither Understanding nor Exam Readiness receives exposure as scored input.
- Home, Plan, REV, Course Overview and global Progress now read and project the same Learn exposure facts alongside the existing immutable scored evidence. A read error is not silently translated into an empty reviewed history; exact backend availability must be proven before deployment.

**Migration/deployment prerequisite:** `supabase/migrations/20261021120000_add_learner_learn_exposures.sql` must pass isolated database/RLS and real backend readiness assurance **before** the learner application begins reading it. A green frontend CI without production migration readiness is not permission to merge/release. Browser stubs and real-user journey recovery remain to be validated on exact head. Any production backend change must obey the separately governed path-to-live and must preserve all learner data.

**Outstanding R2 gaps remain:** durable interrupted Practice, resumable whole-paper attempts, idempotent planner completion acknowledgements after ambiguous network timeouts, independent student comprehension/content review and one immutable programme decision across Home/Plan/REV. This candidate is **not** R2 acceptance. Regression tests and the date-specific assurance register are updated in the same branch; historical audits remain historical truth.

## Focused completion retry and unavailable-evidence corrections — 21 October 2026

- A focused session uses one client-generated UUID for its completed planner event across in-component retries. A duplicate key can be treated as success only after owner-scoped lookup proves **all** identifying event fields and metadata match, regardless of JSONB key order. Permission failure, missing row, mismatched scope and conflicting metadata stay errors. Legacy event callers may continue to let the database generate IDs. This is **not** persistent session restoration after refresh.
- Course Overview/Practice/Exam Prep and global Progress now suppress zero-coverage/readiness projections if combined scored-evidence plus Learn-exposure loading fails. The student sees a retry option instead; canonical Learn reading is still accessible.
- `src/services/planning/planner-activity-retry.test.ts` covers owner/module/topic/metadata agreement, failed writes and unreadable collisions. The Learn browser journey tests verify unavailable backend loads cannot be reported as zero progress. The existing separate Learning Evidence integrity tests continue to apply.
- **Gate:** Only same-commit exact-head CI plus real browser/database acceptance can support PR closure. R2 durable in-progress Practice state, assessed question work on refresh, independently reviewed content and a shared planner transaction remain outstanding. No additional normative decision or historical audit alteration is made.

## Production path-to-live contract — required R2 release dependency

The previous `planner-week-v1` contract does **not** establish that the new Learn exposure table is available. Candidate migration `supabase/migrations/20261021121000_add_r2_learn_exposure_release_readiness.sql` advances `revision_release_readiness()` to `r2-learn-exposure-v1`. The public, SECURITY INVOKER, non-sensitive RPC checks the existing planner requirements plus Learn exposure table presence, RLS and least-privilege SELECT/INSERT grants. `.github/workflows/deploy-pages.yml` requires that exact new contract before serving the new frontend. The refreshed database assurance covers it.

**Release ordering requirement:** do not merge PR #655 and trigger Pages deployment until the two R2 migrations have been successfully applied to the canonical production Supabase project **and independently verified**, under the governed migration procedure. Otherwise the intentionally stricter Pages readiness gate will fail closed. Isolated CI schema replay alone does not deploy production migrations. Historical production rows must not be rewritten. Existing app remains compatible with this additive schema until the PR is explicitly merged. No production database change has been performed from this PR.

## Final browser-fixture convergence — candidate checkpoint

The PR's canonical Learn exposure read created a new data dependency in browser journeys previously seeded with only scored learning evidence. The shared synthetic returning-student and planner fixtures now intercept `learner_learn_exposures` as an empty, owner-scoped synthetic response; standalone accessibility, navigation and first-use fixtures were aligned as appropriate. Dedicated error/retry tests override that fixture with explicit failure and persisted-fact scenarios. This fixes test setup without relaxing real application failure handling or RLS. Avoid treating old branch CI failures as evidence about the final candidate: exact-head browser and isolated SQL verification are still mandatory.

**Production precondition remains unchanged:** the additive reviewed-page and updated backend-readiness SQL migrations are absent from the approved production backend; do not merge or deploy the dependent frontend before their governed application, independent verification and the exact-head merge approval gate.
