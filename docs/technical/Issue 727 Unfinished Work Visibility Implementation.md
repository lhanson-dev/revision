# Issue #727 — Unfinished activity orientation on Home and Course Overview

**Status:** Candidate on draft PR #728; no production or merge claim.  
**Canonical owner:** `PlannerRuntime` → `PlannerHomeScreen` / `CourseExperienceScreen` → `FocusedLearningWorkspace` / `ExamPrepSection`.  
**Design authority (proposed):** `10-product-governance/Returning Student Home Experience.md` and `20-brand-and-experience/Learner Design System.md` §19. The draft authority changes are not operative until Founder-approved merge.

## Scope and implementation

The one plan-owned REV recommendation and Today's Plan are unchanged. Home renders an optional, subordinate saved-work strip *below* REV. Course Overview uses a small set of distinct Learn, Practice, Exam Prep and Progress section spotlights. Only Practice and timed mocks with a valid saved checkpoint are labelled **In progress**; a Learn review count is not a resumable Learn session and Progress is not an activity.

`src/app/saved-work.ts` reads only the authenticated learner's saved Practice/timed mock records for current **active saved courses**, using the existing RLS-protected `learner_practice_checkpoints` and `learner_exam_attempts` tables. The source reads are independent, with a bounded failure state. It does not create evidence, a completion event, new membership, additional planner recommendations, AI calls, or a new database schema. The read checks expiry, canonical course/module/topic or published mock identity, snapshot phase/shape, current content fingerprints, and owner/course matching. Practice counts only confirmed first-pass (non-retry) answers, never selected-but-not-submitted answers. A pending answer save is explicitly reported as requiring verification. Exam `submitted` means complete and is excluded. Saved work is ordered by actual `updated_at` descending, with deterministic tie-breaking; one latest valid entry is promoted on Home and section-matched items are shown on Overview.

`src/app/course-mock-catalogue.ts` supplies the **same** available mock identities to `ExamPrepSection` and the saved-work reader, including retained AQA 7132 mocks; no unsupported paper is promoted. The course-level or component-specific route opens the existing owner. For Practice the exact topic appears in the canonical route and the learner selects **Continue saved session** after the checkpoint service verifies the state. For timed mocks, existing Exam Prep recovery presents the saved paper and phase-specific action; there is no exact exam-id deep link today, so the entry is labelled **Open saved Exam Prep**, not a promise of one-click resume.

The reminder is a navigation projection only. The actual content fingerprint and saved state must be checked **again** by the existing service when entry occurs. A stale or concurrent session cannot be used merely because the reminder appeared earlier. A failed read may display a recovery retry but never fabricates an empty saved-work count or a second next task.

## Assurance contract

1. Unit coverage: exact owner/course filter, valid checkpoint, expired/wrong-content/unknown-topic suppression, completed vs submitting timed exam phase, one-table outage and both-table failure. The paper fingerprint must use the exact existing Exam Prep source.
2. Browser journey: answer one question, navigate to Home (with no localStorage topic hint), see course/topic and confirmed answer count, open saved Practice, go to Overview, see section **In progress**, open the exact topic, refresh, resume Question 2 and prove no duplicate scored evidence. Keep the existing ambiguous-write recovery test.
3. Preserve the unaffected REV recommendation and planner order; verify no continuation strip when no saved checkpoint, and no false in-progress status for Learn, Progress, flashcards or submitted exam.
4. Verify desktop/tablet/phone including Light/Dark, no horizontal overflow, semantic titles, keyboard controls and focus, and independently scoped failure states. Deployment requires usual exact-head CI, Founder PR approval, release lineage, backend-readiness and production smoke; a passing code review is not proof of live activation.

## Documentation impact

This is a proposed change to normative Home hierarchy and Overview composition, represented in this PR rather than silently changing the approved system. Source code, test code, this technical note and INDEX are included in the same branch. Claims/Progress, REC-10 raw-answer retention, all exam assessment rules, and active REV/Plan selection logic are intentionally unchanged. No historical evidence is rewritten. Issue #727 is the programme item; PR #726 was the earlier Practice entry-point correction.
