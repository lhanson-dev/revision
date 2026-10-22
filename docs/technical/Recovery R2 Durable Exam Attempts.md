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
