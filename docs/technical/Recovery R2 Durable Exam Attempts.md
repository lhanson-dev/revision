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

## Approved Founder decisions — 22 October 2026

The Founder accepted both proposed rules for REC-10. New governing candidate: `10-product-governance/Exam Session Recovery.md`; privacy addendum in `40-evidence-and-trust/Privacy and Student Data Principles.md`. Production still requires independent privacy/legal checks and governed PR merge authorization.

1. **14-day draft limit:** raw answers are retained for at most 14 days from initial creation, not reset on resume; hourly automatic deletion is prepared using pg_cron and a 14-day database insertion constraint. Submitted checkpoints strip raw answers, marks and options after evidence commits. Frozen scored payloads contain no raw answers.
2. **Pause on interruption:** active exam duration comes from confirmed heartbeat checkpoints; unverified background, network, sleep, close and browser crash intervals do not count. On return, the exam is paused, and continuing needs learner action. An interruption is flagged and the resulting paper is labelled not equivalent to uninterrupted timed conditions. The bounded interval currently uses 5-second heartbeat and 15-second gap cap; this needs browser/network fault assurance.

## Previously unresolved decisions (historical candidate analysis)
**These were holds at the initial candidate checkpoint; Founder decisions above resolve the product-policy alternatives, not the technical/privacy/release validation:**
1. **Written answer retention:** Approved privacy principles call for a purpose and deliberately chosen period after legal/privacy review but do not specify a period for raw mock answers. The 14-day limit is now Founder-approved but its legal treatment and automated deletion still require verification; expiry metadata alone does not delete stored data. Approval must specify deletion schedule, user deletion/export behaviour and whether a submitted frozen batch retains raw answers and for how long. Do not enable persistent storage of raw drafts without this decision.
2. **Timer while unavailable:** Today's simulator explicitly permits pausing, yet has no governed rule for browser close, device sleep or connection loss. Decide whether timed mocks count wall-clock time while absent or are treated as paused on interruption; both have educational tradeoffs. No hidden reset or invented duration permitted. The runtime integration must consistently enforce the approved pause-on-interruption rule, including a two-tab conflict, and explain it in student language.
3. **Finalisation:** Existing evidence writes are separate owner-verified rows and not a multi-row database transaction. A persisted frozen batch plus idempotent replay avoids conflicting marks but is **not** an atomic evidence transaction; acceptance must explicitly distinguish this from single-transaction commit.
4. **Pilot limits:** Keep existing FI-001/AQA 7132 and Psychology 7182 paper and option restrictions. No widening of restricted content or educational acceptance by implementing storage.

## Delivery, dependencies and acceptance
Treat schema/service scaffolding as **non-deployable until governed decisions**. Follow on the same REC-10 candidate branch with canonical app integration, refresh/leave/re-entry recovery UI, visible confirmed-save and error states, deliberate discard, timing enforcement, finalisation, SQL owner-versus-other-user/anon/privileged tests, Playwright interruption/multi-tab/browser responsiveness, and full exact-head CI.

Prior PRs #651/#652 remain separate planner changes; neither directly changes ExamSimulator or the exam draft persistence domain. Do not merge them as an incidental dependency.

Do not apply the draft migration or change the production readiness contract until complete CI, privacy/legal verification and governed backend-ahead release authorization. For a release candidate, extend `revision_release_readiness()` from `r2-practice-checkpoint-v1` to an exam-attempt capability contract, update `.github/workflows/deploy-pages.yml`, prove isolated DB/RLS, then apply backend ahead only through the governed release procedure before frontend deployment.

## Documentation impact
New implementation truth belongs here and in SQL/services/tests, linked from INDEX. Change approved normative privacy/timer authority only following a Founder decision; do not misrepresent this technical contract as approved policy. Update assurance/defect registers as acceptance evidence matures. Historical audits and previously issued releases remain unchanged.

## REC-10 timing and visual-assurance correction — 22 October 2026

The browser's prior 81-minute `page.clock.runFor` jump represented an unconfirmed sleeping tab under the Founder-approved rule; treating it as continuous work contradicted `Exam Session Recovery.md`. The focused timer visual test now supplies a **synthetic server-confirmed 81-minute active-time checkpoint**. An independent unit case verifies 972 successive five-second heartbeats accumulate 81 minutes, and a long gap causes pause with no extra time. This is not a bypass in production timing.

The visual snapshot fixture now mocks the actual owner-scoped exam-attempt API and must settle its recovery query before capturing. For a learner with **no saved answers**, Exam Prep keeps its existing visual layout; the saved-work recovery notice and resume action appear only if applicable. The initial timed-exam viewport likewise omits extra saved-work controls until the learner has work or a non-confirmed save state. Recovery controls remain available once there is work to preserve. Approved historical image digests and human approvals are unchanged. CI must confirm that snapshots match rather than repinning hashes automatically.

These corrections are **not release acceptance**. Investigate any unresolved exact-head CI discrepancies and preserve the Founder-specific merge boundary.

### Learner-owned save notice

When a timed paper has working answers, a flag, an option selection or an unconfirmed save, the examination header communicates save status. Once safely saved, it also explains that the private raw draft expires within 14 days. On narrow screens, this essential recovery status is not hidden with the decorative answered count. The fresh, empty examination view stays visually unchanged; recovered/edited work surfaces the new status as an intentional functional state. A safe Save and return action is available after there is work to preserve.

## REC-10 pre-release database/retention assurance correction (22 October 2026)

**Verified production read-only baseline:** Supabase project Revision, eu-west-1, `public.revision_release_readiness()` returns `r2-practice-checkpoint-v1` / `ready: true`; production includes Practice migration ledger `20261022131141` and `20261022131156`, but not the REC-10 exam schema. `pg_cron` 1.6.4 is available but is **not installed** in production. Nothing has been applied during REC-10 readiness inspection.

**Two genuine, pre-release gaps corrected on this candidate branch:**

1. A database trigger protected `submitting` rows from user deletion but would also block the hourly expiry DELETE; any one expired submitting row could roll back deletion of *all* expired attempts. The trigger now preserves the block for a live submission but allows retention cleanup after the attempt expires. A pgTAP regression explicitly verifies the active and expired conditions against a synthetic pending submission alongside an expired writing draft.
2. The previous CI SQL job replayed migrations but never executed `supabase/tests/exam-attempt-assurance.test.sql`. It is now explicitly listed in `.github/workflows/ci.yml`. A previous green migration job alone was insufficient to prove those test cases.

**Additional fail-closed hardening:** authenticated SELECT/UPDATE excludes expired drafts before the hourly physical purge; created-at is assigned by the database instead of accepting learner-supplied creation timestamps; max expiry is 14 days from server creation without grace extension. `revision_release_readiness()` also checks that the `pg_cron` extension is installed and emits `examCleanupScheduler`, but does **not** claim scheduled-job success. Verify the job separately before and after backend-ahead enablement.

**Backend-ahead operations (NOT EXECUTED):** apply only under approved release procedure, in exact version order: `20261022160000` exam table/RLS/trigger, `20261022160100` readiness function, `20261022160200` scheduler. Preflight must capture schema ledger, extension availability, `pg_cron` config privilege/capacity, Security/Performance Advisors and baseline contract. Postflight must confirm these exact ledger versions, owner/anon/service-role access, `cron.job` entry with expected command and hourly schedule, `cron.job_run_details` success at the first scheduled execution and readiness contract `r2-exam-attempt-v1` / `ready: true`. Confirm real expired row deletion in an isolated database, **not** by inserting fake learner answers in production. If cleanup doesn't execute, block frontend deployment; don't call the backend ready solely because extension is installed.

**Privacy/legal readiness is not self-certified by engineering.** The Founder’s 14-day product rule does not settle data-subject export/deletion flows, lawful basis, age-appropriate notice, retention in provider backups, supplier processing or safeguarding exceptions. Record the evidence and sign-off required under `40-evidence-and-trust/Privacy and Student Data Principles.md` before production reliance. See ICO UK GDPR storage-limitation guidance, including backup handling: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/ . No real exam draft data has been migrated or processed during this readiness review.

## Default-deny REC-10 cohort integration — release correction (22 October 2026)

**Canonical entry:** `src/main.tsx` → `PlannerRuntime` → `CourseExperienceScreen` → `ExamPrepSection` / `ExamSimulator` at `/revision/app/`. The last release review revealed that earlier owner-only RLS still enabled every authenticated learner to store raw exam responses. This contradicted the delegated conditional pilot limit. The proposed schema policies now additionally require the **signed** server-administered Auth `app_metadata.revision_rec10_pilot` claim for all owner CRUD operations. `PlannerRuntime` obtains the exact user from `supabase.auth.getUser()`; `CourseExperienceScreen` supplies the checkpoint context only for verified cohort members. Missing, false, user-editable or separate FI-001 pilot metadata never qualifies. The ordinary nonpilot timed exam remains transient and is not represented as durable.

QA fixtures use `VITE_REC10_ASSURANCE_MODE=1` only in the test bundle; production-equivalent browser tests explicitly use `VITE_REC10_ASSURANCE_MODE=0`. The production Pages workflow never sets an assurance override. SQL pgTAP tests verify signed eligible owner, cross-owner denial, same-owner without marker and attempted write under an unapproved marker. Because server RLS is authoritative, forged client UI flags cannot bypass it. Auth tokens may retain old claims until refreshed; the operator must arrange token refresh and validate revocation before taking a pilot user out of scope. **Do not enrol users or activate the backend ahead of the documented pilot data-protection go/no-go.** No real student account is enrolled by this code change.

### Auth eligibility timing race

A timed mock started before the server responds to Auth `getUser()` must remain an **ephemeral** attempt even when the delayed response verifies a REC-10 cohort flag. `ExamPrepSection` now captures the optional checkpoint context when Start timed is activated and reuses that fixed decision for the whole running simulation, so a late verification does not hydrate over newly typed answers. Existing attempts remain subject to SQL permission checks if an operator removes eligibility; the student is never promised an unconfirmed save. Production Pages explicitly pins `VITE_REC10_ASSURANCE_MODE=0`, and the production-mode browser contract checks allowed/denied identities and this delayed-verification race.
