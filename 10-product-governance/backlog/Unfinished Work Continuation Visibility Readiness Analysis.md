# Unfinished Work Continuation Visibility — Home and Course Overview

**Issue:** #727  
**Lifecycle:** Analyse — Founder concept direction given 30 October 2026; Definition of Ready / permission to implement **not yet approved**.  
**Canonical experience:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → `PlannerHomeScreen` or `CourseExperienceScreen`.  
**Governed reference:** `80-company-workflows/Feature Definition and Measurement Workflow.md`. This is backlog analysis, **not active product authority**.

## Student problem, strategy and testable hypothesis

A student can leave an unfinished Practice session, later revisit Home or Course Overview and mistake ordinary navigation for evidence that the work has disappeared. Even when a durable checkpoint exists, its continuation action may only appear after opening Practice. Timed exam attempts have a separate saved-attempt path. A calm, truthful continuation affordance reduces rediscovery effort without replacing REV's plan-derived recommendation.

**Hypothesis:** A student with a valid saved Practice checkpoint can recognise it on Home and Overview and reach the exact saved session without navigating through unrelated fresh-question choices. The feature must not increase false progress, duplicate evidence or displace the one REV recommendation.

Alternative of doing nothing: current PR #726 makes return to Practice itself obvious, but requires the learner to find the right course/topic first. A blanket additional next-work hero would be simpler to build but would contradict the approved REV/Plan priority source, so it is rejected.

## Proposed experience; distinct screen jobs

### Home

Keep the existing dominant REV hero, factual reason, single Start and Suggest something else, unchanged. Directly **below** the hero and **above** Today's Plan, optionally present a slim **Continue where you left off** strip only when an active saved activity has been verified. Label with course identity, Practice topic or exam paper, exact answered count if confirmed and **Continue practice** or phase-appropriate exam action. No countdown, invented urgency, guilt, second REV identity or priority ranking.

If several valid activities exist, display the most recently changed verified activity. Provide a quiet **Other saved work** way into the relevant course's section where appropriate; no permanent lists on Home. If no verified activity, omit strip. A failed load cannot become a claimed empty/zero state or invented activity.

### Course Overview

Keep REV primary and existing compact Topics covered / Understanding / Exam readiness. Beneath the decision area, show a restrained group of **Learn / Practice / Exam Prep / Progress** spotlights with a one-sentence functional purpose and one relevant factual status. Where Practice has a valid checkpoint, emphasise it and provide an exact route. Where a timed mock draft is saved, emphasise Exam Prep and use a truthful status appropriate to phase. Learn may show **Last reviewed** if the reviewed-page evidence proves it; do not claim an unfinished reading session. Progress is a review/reporting destination, not an in-progress activity; do not reproduce topic analytics. This creates useful entry context, not four independent recommendations or a generic decorative card grid.

The original shared course header/navigation remains unchanged. No extra user action is required when no checkpoint is present, and no completion is awarded for opening an item. Direct section access remains available.

## Evidence/technical sources and explicit exclusions

- `learner_practice_checkpoints` is owner-scoped, 14-day and versioned. The scored checkpoint includes exact course, module, topic and question state, pending evidence reconciliation and content fingerprint. Only confirmed saved answers count. The browser's last-topic local hint cannot substitute for durable server truth or cross-device routing.
- `learner_exam_attempts` owns timed draft persistence; `writing`/`marking`/`submitting` may need recoverable actions. `submitted` is not unfinished. A saved draft's retained raw answer content must not be surfaced in Home metadata, analytics or logs.
- An open Learn page or a reviewed-page exposure is **not** a resumable session. Unpersisted flashcards, typed-but-unsubmitted answers and untimed mocks likewise cannot claim a persisted continuation.
- A booked/planned session that is not completed is not the same as an unfinished Practice question set. No planner booking status or REV priority may be silently changed.
- Do not create a new learner progress measure, algorithm, AI cost, broad session-tracking database table or subscription limit.
- Eligibility: only authenticated, active saved courses with published content. Exclude removed or unresolved courses, expired/invalid snapshots and completed attempts. Revalidate exact owner/content/phase when opening the activity; if the read fails, fail closed or direct to the existing recovery screen with explicit wording, not false success.
- Cross-device Practice continuation must include exact course/module/topic in canonical route rather than depend on localStorage. A timed exam requires existing correct-paper selection or a governed exact exam route; don't label a generic Exam Prep landing as direct resume.

## REV role and Free / Paid / Premium

REV continues promoting **one** deterministic programme recommendation from the planner. It does not rank saved checkpoints, create an unrelated "best next" choice, change Today's Plan or describe an unfinished attempt as a weakness. Saved work is a learner-controlled navigation fact.

**Free:** complete basic saved-work visibility, recovery and truthful progress. **Paid / Premium:** exactly the same capability; no artificial value withholding. Upgrade hypothesis: not applicable — this is a baseline continuity/trust capability, not a conversion intervention. Incremental cost limited to bounded authenticated database reads and UI; no model inference.

## Measurement, Admin/Founder assurance

Primary validation is a behavioural task, not a speculative KPI: start ten scored questions, save several, navigate away, identify continuation from Home, enter the correct topic and confirm the next unanswered position with no duplicate evidence. Measure automated successful/false-resume cases plus targeted family usability observations ("Could you find the unfinished work?" and "Did you think REV was recommending it?"). Do not add retained analytics merely to measure this change. Founder assurance: browser/contract tests, actual route screenshots, database ownership, documentation and exact-head CI; visible read/retry failure cases. Monitor additional backend query overhead and never claim completion from exposure alone.

## Risks and controls

- **Competing actions:** secondary visual treatment and no extra REV card; contextual rather than duplicated recommendation.
- **Privacy:** owner-only RLS, server-scoped course set, only safe labels/counts on shared screens; raw learner answers remain in their recovery service.
- **False continuation:** validate expiry, content/identity, paused/finalised phases; distinguish failure/unknown states. No inferred progress.
- **Wrong target:** exact deep links to Practice topic and mock identity when supported; ensure inaccessible/detached routes fail safely.
- **Multi-tab / slow reads:** optimistic version checks remain owned by the checkpoint service; don't rely on the Home snapshot to authorise a write.
- **Accessibility:** semantic status/copy, distinguishable actions, focus management, 320px no overflow, light/dark, no time-pressure cues.
- **Educational integrity:** no spurious mastery, graded outcome, Plan completion or exam-readiness effect; preserve user freedom to choose other work.

## Implementation feasibility, dependencies and order

1. Implement a **read-only, bounded, owner-scoped saved-work summary** for current active courses from existing `learner_practice_checkpoints` and `learner_exam_attempts`. Project safe descriptors only. Validate expiry and current published content; handle partial read failure independently from the Home planner/progress hero.
2. Reuse exact canonical navigation in `PlannerRuntime`; Course Overview route can specify the Practice topic directly; Home may require a new typed callback. Verify course-level and component-specific cases. For timed exams, reuse `ExamPrepSection` recovery controls or implement a separately assured exact mock route; never imply direct one-click resume if it is actually two-step.
3. Add one shared status model/formatting helper so Home and Overview use identical saved-work truth and safe multiple/zero/error rules. Render in existing UI system/token/style conventions.
4. Preserve the existing REV/Home tests, add practice reload + cross-device no-browser-hint recovery, mock state, no false "in progress" labels, RLS and responsive accessibility checks. Run risk-based CI and production smoke.
5. Update technical docs, INDEX and critical journey assurance in the implementation PR. No historical audits are rewritten.

**Complexity:** moderate learner-facing front-end/service integration; existing tables are reusable; no planned schema change. Exact mock launch navigation and content-fingerprint verification at summary time are the two implementation details requiring a focused design check before Ready, and may be staged behind truthful labels.

## Latest-main technical feasibility verification — 30 October 2026

Inspected `src/app/navigation.ts`, `PlannerRuntime.tsx`, `CourseExperienceScreen.tsx`, `FocusedLearningWorkspace.tsx`, `ExamPrepSection.tsx`, `supabase/migrations/20261022131141_add_learner_practice_checkpoints.sql`, `20261022160000_add_learner_exam_attempts.sql`, and `20261025120000_standard_learner_exam_attempt_access.sql` on current approved `main`.

- Both checkpoint tables already carry `updated_at` and `expires_at`. The proposed recent-first overview can therefore use actual saved timestamps without inventing recency from history/navigation; use deterministic secondary tie-break, bound the scan to active saved courses and do not expose raw answer JSON.
- Practice already supports exact course/topic deep links (`#/courses/:courseId/practice/:topicId`), plus exact module-specific paths for legacy component courses. Entry to the owner `FocusedLearningWorkspace` revalidates current-content fingerprint and expires/ownership; the overview read itself is **discovery, not a guarantee** the resume will work. For invalid/expired content, show the existing recovery error/discard experience without asserting 'ready to continue'.
- The current default Practice entry displays a **Continue saved session** control; route navigation alone does not invoke that action. A promise of **one-click resume directly into the unanswered question** therefore requires a deliberate, verified auto-resume handoff in `FocusedLearningWorkspace` that preserves recovery reconciliation, feedback and focus. Otherwise use **Open saved Practice** (two-step workflow) and do not claim direct resume. Recommended first implementation: route to the exact saved topic, retain explicit safe Continue on that page; do not auto-submit or jump before checkpoint validation.
- Exam Prep has saved mock controls keyed by exam ID, but `src/app/navigation.ts` has **no exam-id deep-link route**. Direct one-click Continue on Home is not currently supported for timed mocks. For first release, a truthful **Open saved Exam Prep** link can navigate to the course's Exam Prep saved-mock controls, where the learner chooses the exact saved attempt. A later optional typed route/intent may enable exact mock launch after separate assurance; do not falsely promise direct activation.
- Exam saved `submitted` phase is complete, while `submitting` is a finalisation/recovery state, not an active writing session. Practice pending evidence also needs reconciliation. Owner-only RLS, expiry, immutable retention, and separate authentication semantics remain unchanged. Updated-at ordering must never supersede those gates.
- `Learner Design System.md` advanced on `main` with **Plan Today/selected calendar highlights (v1.1)** after this branch was created. The Issue #727 Overview proposal concerns §19 only; retain all v1.1 calendar rules and the latest INDEX content during integration.

**Acceptance language correction:** Home and Overview must identify a saved session and take the learner to its **verified recovery entry point**, with a single further Continue click where the owner requires it; no promise of immediate question restoration until an implementation proves it. The exact resumed question and no duplicate evidence must still be proven.

## Governing conflict and documentation impact

Current `20-brand-and-experience/Learner Design System.md` §19 discourages a permanent extra destination-card grid; `10-product-governance/Returning Student Home Experience.md` prescribes four content groups and no separate saved-work strip. The Founder proposed an exception. The branch contains **proposed** conditional authority amendments that retain the existing REV/Plan contract and explain when the additional orientation is useful; neither is active until Founder-approved merge. `Course Learning Blueprint.md` already supports Overview direct routes and need not change. `Claims and Progress Governance.md` and `REV Guidance and Conversation Pattern.md` retain unchanged evidence and recommendation authority.

The implementation PR must include actual code, tests, documentation, and any necessary assurance register update with the authority amendment; no authority change is silently promoted from this analysis.

## Readiness summary — requires explicit human approval

1. Student problem — PASS.
2. Strategic case / alternative — PASS.
3. Hypothesis — PASS.
4. Experience and empty/error/mobile states — PASS as proposed, pending visual validation.
5. Evidence/intelligence semantics — PASS, with mock direct-route and Practice fingerprint validation detail to verify.
6. REV role — PASS, unchanged.
7. MVP boundary — PASS; partial non-durable modes explicitly excluded.
8. Free/Paid/Premium — PASS, baseline universal capability.
9. Upgrade hypothesis — N/A, baseline trust feature.
10. Measurement — PASS, behavioural/assurance rather than unnecessary telemetry.
11. Founder/Admin assurance — PASS, exact behavioural tests/production verification.
12. Privacy/security/accessibility — PASS at design level, tests required before release.
13. Technical feasibility — PASS at architecture level, subject to exact route/summary validation.
14. Test approach — PASS, scoped acceptance listed.
15. Documentation and authority — PROPOSED on branch; pending Founder-reviewed governed merge.
16. Blocking experience choices — recommendation is single most recent on Home, four subordinate Overview spotlights, no fake Learn/Progress in-progress status; no further scope expansion.
17. **Founder Definition-of-Ready approval — NOT YET GRANTED.**

**Recommendation:** approve this constrained design as Ready after Founder reviews this definition and its proposed authority amendments. Do not start material implementation until approval. Founder must also separately approve the eventual specific implementation PR merge under current repository governance.
