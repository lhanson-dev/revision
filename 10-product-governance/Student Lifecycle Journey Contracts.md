---
title: "Student Lifecycle Journey Contracts"
document_id: "revision-student-lifecycle-journey-contracts"
document_type: "domain-authority"
authority: "product-governance"
status: "active"
version: "1.0"
owner: "Founder"
proposed_date: "2026-10-10"
content_review_status: "founder-direction-received; active after approved merge"
depends_on: ["Core User Journeys", "Authentication Experience", "Returning Student Home Experience", "Adaptive Revision Planning", "Information Architecture", "Claims and Progress Governance", "Product UX Principles", "Learner Design System"]
---

# Student Lifecycle Journey Contracts — Founder review draft

## 1. Purpose, status and authority boundary

Define one reviewable, testable student lifecycle specification covering **new student**, **returning student with incomplete setup**, and **established returning student**. The objective is clarity about the student's intent, the screen's job, the data/evidence boundary and the next useful action, so experience review and repeatable tests can work from the same contract.

**Approval boundary:** This document is proposed **by draft PR #590**, and its `active` metadata takes effect **only if the Founder explicitly approves merging that exact PR into `main`**. Until then, current `main` retains authority. After merger, this contract specialises `Core User Journeys.md` for the three lifecycle states; existing `Authentication Experience.md`, `Returning Student Home Experience.md`, `Adaptive Revision Planning.md` and evidence/UX/design authorities continue to control their specific domains. It does **not** authorise application, planner, design-system, learning-evidence or test changes without a separately governed implementation task.

This is **WP1: journey contracts** only. WP2 audits current behaviour and coverage against the approved contracts; WP3 delivers bounded corrections with appropriate approval. The visual design rollout is separately governed; these contracts must not create a competing design system.

### Student-centred definition of value

- **First value:** an authenticated new Student has completed a *real, supported* learning activity, its normal evidence was saved, feedback was understood and a credible next action is available. Account creation, course selection, a diagnostic result or Home entry alone is insufficient.
- **Repeat value:** a returning Student can identify what matters now, select an appropriate task and enter useful work with minimal friction; incomplete context must be acknowledged, not fabricated.
- **Learning value:** a learning or assessment result produces an evidence-appropriate explanation and useful next action; the system adapts only from legitimate learning and planning inputs.

Use Student as the canonical product term, not a parallel Learner persona. Relevant existing technical identifiers need not be renamed during WP1.

## 2. Lifecycle/state decision table

| Contract | Entry condition | Dominant student question | Exit/success |
| --- | --- | --- | --- |
| **SL-01 New Student → first value** | Successfully authenticated new account without completed Student first-use state | "I'm new. Can Revision help me start?" | First supported activity saved; cautious feedback shown; first-use marked complete; useful Home/next step |
| **SL-02 Returning with incomplete context** | (a) Interrupted first-use onboarding **or** (b) established Student with missing planning inputs; also covers established no-course state | "Can I carry on without having to set everything up again?" | Resumed at correct first-use step, **or** started useful revision and can complete missing Plan inputs separately |
| **SL-03 Established returning Student** | Authenticated Student with completed first use and at least one saved active course | "What is the best use of my time today?" | Correct priority and reason understood; exact useful activity reached; feedback/evidence reconciled; next action available |

These are **lifecycle conditions**, not separate experiences or user roles. A Student may move from SL-02 to SL-03 after supplying plan data; they need not complete plan setup to have finished first-use onboarding.

## 3. SL-01 — New Student from account creation to first value

### Student intention and promise

"I don't want to configure a revision system. Help me start on the right course, show me something useful and tell me what to do next."

**Primary path prescribed by existing GJ-01:**

`Successful account creation/authentication → select Student → save one exact supported course → optionally capture known exam dates → course-ready confirmation → offer brief starting check → cautious recommendation → start exact Learn/Practice activity → save normal evidence → explain feedback → mark first use complete → meaningful Student Home → optionally set weekly study time through Plan`.

The Founder has clarified **D-01 (10 October 2026): after a supported course has been saved, the Student may enter known exam dates during onboarding, before any starting check.** Dates are optional, independently saveable and not contingent on answering even one starting-check question. A Student who does not know dates can skip them, take or skip the check independently, and add/edit dates later in Plan. A date is planning context, never diagnostic or learning evidence.

If the starting check is skipped, interrupted or unavailable, use the deterministic supported starter path, **not** a generic Home or a guessed weakness. First value does not require a full planner configuration.

### SL-01 screen-purpose matrix

| Screen/state | Student intent; dominant screen job | Immediate understanding / essential content | Primary action; next state | Secondary / REV role | Pass condition |
| --- | --- | --- | --- | --- | --- |
| Account entry | Create or access an account securely | Sign in and Create account distinct; Google only if enabled; minimum needed profile fields | Create account/continue with enabled provider → Student choice | Recover account; no forced provider | Auth identity created/accessed, no unsupported option |
| Primary experience | Indicate use as a Student | Student is enabled; Parent/Teacher visible **Coming soon** and unavailable | Select Student → course selection | No persona questionnaire; do not grant supporter/payer permissions | Student experience durably persisted |
| First course selection | Tell Revision exactly what I study | Qualifications, subject, board/specification disambiguated; only assured published choices; previous choices preserved | Add course → course-ready path | Back; no parallel catalogue or membership identity | One exact active course ID saved, reload-safe |
| Optional exam dates (**D-01 Founder direction**) | Save exam dates I already know, without a diagnostic or full plan | After exact course selection, show known applicable paper identities; unknown dates are fine | Save known date(s) **or Skip for now** → course-ready | Dates can be added/edited later in Plan; starting check is independent | No starting-check prerequisite, no invented dates, no required fields, correct course/paper persistence |
| Weekly study-time setup (**D-01b Founder direction, after first value**) | Decide how much time I can realistically revise | After first completed useful activity and feedback, Plan can collect an optional Monday–Sunday capacity pattern; never a compulsory onboarding gate | Open Plan when ready → save realistic weekly time or continue revision | Home must remain useful without weekly availability; REV explains why a fuller plan benefits | Revision first value and onboarding completion independent of weekly availability; saving weekly time does not create learning evidence |
| Course-ready | Know the course was added and what comes next | Exact qualification/board/specification identity, clear confirmation, short check's purpose | Find my starting point → check | Skip → starter recommendation | Correct course identity retained |
| Starting check | Provide a small directional signal | Short, low-stakes, not a course-wide diagnosis; answers do not prove mastery/readiness | Answer/finish → cautious recommendation | Skip/partial/recover safely | Observed responses persist without fabricated missing answers |
| Starting recommendation | Know where and why to start | Exact saved course/topic; reason is provisional and proportionate to evidence | Start revision → **exact supported activity**, not generic overview | Choose another supported topic; REV explains rather than invents | Supported course/topic/activity target persists before transition |
| First focused activity | Do actual revision | One achievable flashcard/quick check or other assured starter activity; instructions clear | Answer/self-rate → persisted evidence and feedback | Retry on save failure without losing answer | **Normal learning evidence written once and linked to correct course/topic** |
| Feedback | Understand this result and what comes next | What happened; where more practice may help; limited confidence appropriate to one item | Continue → first-use completion and Home | Explanation/repair if supported | Normal evidence saved **before** completion; no unsupported grade/readiness |
| First meaningful Home | Start a credible next action | REV presence; current recommendation/Today's plan or truthful fallback | Start first useful task → exact activity | Plan, Courses, Ask REV | First-use complete persists; no repeat on sign-in |

**Data contract:** Auth identity/first name and Student routing state are separate from learner-owned `learner_courses`; starting-check evidence is separate from ordinary learning evidence; exam dates/availability are planning context only. Completion is not permitted until the first normal learning result is durably written and feedback has been reached. Operational funnel events contain no raw answers.

### SL-01 acceptance examples (for WP2 test mapping)

- **SL01-A1:** Email/password and enabled Google paths enter the same Student first-use model; disabled provider options are hidden, Parent/Teacher cannot enter Student as fallback.
- **SL01-A2:** The exact supported AQA A-level Business 7132 course is saved under the Student's account, survives reload and is not silently substituted; only one course is *required* for first value.
- **SL01-A2D:** After choosing the exact saved course, a Student can enter **some, all or none** of the dates they know **before taking any starting check**; saved exam dates retain the correct course/paper context, survive reload, and require no diagnostic answers. Skipping dates does not prevent the starting check, skipping the check does not invalidate saved dates, and dates can later be added/edited via Plan.
- **SL01-A2T:** Weekly study-time setup is **not** shown before the first useful revision activity/feedback. After completion, the Student can access Plan to supply it without losing saved dates, evidence or Home access. No weekly-time requirement blocks starting or completing onboarding.
- **SL01-A3:** Completing a starting check creates directional data but **zero** coverage, mastery or readiness progress by itself; skipped/partially completed checks also lead to useful work.
- **SL01-A4:** Starting the recommended activity enters the exact resolved topic and supported activity; a completed response is persisted as ordinary learning evidence and an informative feedback state follows.
- **SL01-A5:** Failed evidence save does not mark onboarding complete, discard the current answer or claim success; successful completion persists and returns the Student to meaningful Home on later sign-in.
- **SL01-A6:** Browser reload, interruption, account switching and an unavailable saved-course/activity state recover safely without another user's data or invented evidence.

## 4. SL-02 — Returning Student with incomplete setup/context

### Two distinct cases — do not collapse them

**SL-02a: first-use incomplete.** The Student was interrupted before completing the first learning activity/feedback. Resume the correct first-use stage, retaining membership, answered starting-check items and exact starter task where valid. Do **not** bypass incomplete first value and show normal Home merely because they signed in again.

**SL-02b: first-use complete but planning inputs incomplete.** The Student has completed onboarding and owns an active supported course but exam dates and/or seven-day realistic availability are missing. They should reach normal Home and may receive a **deterministic learning-state fallback recommendation** instead of a fully calculated schedule. **This is the expected state immediately after first value when the Student has not yet configured weekly availability.** Plan should explain only the missing inputs and offer a bounded path to fill them in. Do **not** send them through Student experience selection or the first-use check again.

**SL-02c: established account with no active courses.** Show an honest empty state and make **Add Course** the primary action. Do not recommend an arbitrary published course or derive learner-wide progress from the catalogue.

### SL-02 screen-purpose matrix

| Screen/state | Student intent; screen job | Immediate understanding | Primary action; next state | Secondary / REV role | Pass condition |
| --- | --- | --- | --- | --- | --- |
| Returning account/session | Continue rather than start again | Identity and saved state are recognised | Route to actual incomplete step **or** Home | Recovery if state unreadable | No duplicate role/course/check forced |
| First-use resume (02a) | Finish what I began | What was saved and the next outstanding step | Continue selected check/starter → activity/feedback | Skip check where governed | No erased completed stages or duplicate evidence |
| Home with incomplete Plan (02b) | Revise now despite missing dates/time | Today's useful fallback clearly distinguished from a fully planned schedule | Start supported recommendation directly | Open Plan; Ask REV explains limits | No dead-end setup gate, false timetable or readiness claim |
| Plan missing-input state (02b) | Make a more realistic programme | Which **specific** exam-date/weekly-capacity information is absent and why it helps | Add missing exams or study time → updated Plan | Return Home/study without artificial blocker | Existing supplied inputs retained; deterministic recalculation |
| No-course state (02c) | Establish what I study | No saved active course; no invented priorities | Add Course → first usable course view | Account/navigation available as appropriate | Exact membership saved; course-only planning can begin |
| Activity and feedback (02b) | Keep moving | Evidence-appropriate result and next useful action | Complete → evidence saved → next recommendation | Choose alternative task | New result survives reload and does not masquerade as plan configuration |

### SL-02 acceptance examples

- **SL02-A1:** Interrupt a starting check midway; return and resume with only real answered questions; skip remains available.
- **SL02-A2:** Established Student with no exam dates, no weekly availability or either one missing can reach Home and start supported work; Plan asks only for missing information.
- **SL02-A3:** Saving assessment dates/availability changes planning context; alone it never increases understanding, coverage or exam readiness.
- **SL02-A4:** A saved course removed from the active programme disappears from new learner-wide recommendations without deleting historical learning evidence; no-course state does not invent a programme.
- **SL02-A5:** Missing/stale course identifiers and load/save failures disclose a bounded recovery path; no arbitrary course mapping, silent resets or false "complete" state.

## 5. SL-03 — Established returning Student

### Student intention and promise

"I've opened Revision. Show me what matters today, why it matters, and take me straight into useful work; let me choose otherwise."

**Primary path:** `Return/login → Home → REV hero + Today's revision plan → promoted first task with concise reason → Start exact supported activity → complete and receive feedback → persist evidence → update future recommendation/Progress as warranted`.

This respects the *specific* approved `Returning Student Home Experience.md` authority. Do **not** revert to the older generic "open course then choose a mode" Home path or a detached recommendation card.

### SL-03 screen-purpose matrix

| Screen/state | Student intent; screen job | Immediate understanding / essential content | Primary action; next state | Secondary / REV role | Pass condition |
| --- | --- | --- | --- | --- | --- |
| Returning Home | Decide what to revise right now | Personal REV hero and Ask REV; Today's revision plan; one promoted task; remaining tasks subordinate; honest reason and duration | Start first task → resolved useful activity | Ask REV, open full Plan, choose Courses | First action apparent and directly operable; no dashboard decoding |
| Focused task | Study the specified course/topic | Clear course identity, activity and task instructions | Complete supported Learn/Practice/Exam Prep activity | Exit/return where safe | Correct academic context, no bogus cross-course substitution |
| Feedback / repair | Understand results and improve | Relevant feedback; evidence strength; what to revisit or retest | Next useful action | REV explanation where available | Persisted evidence drives legitimate subsequent changes |
| Full Plan | Look ahead or revise capacity/exams | Adaptive Day/Week/Month forecast, Week default; no immutable timetable or debt | Start a recommended activity | Manage exams, Plan settings, bounded preference discussion with REV | Deterministic forecast; no mastery change from plan preference |
| Courses/self-directed path | Study something else | Exact saved course and available Learn/Practice/Exam Prep/Progress sections | Open chosen topic/activity | REV may note competing priorities without locking path | Student agency retained; active-course context correct |
| Progress review | Understand improvement | Topics covered, Understanding and Exam readiness remain distinct with evidence explanations | Relevant follow-up Learn/Practice/Exam Prep action | REV explains uncertainty | No false readiness/grade from passive behaviour |
| Contextual Ask REV | Ask why or get unstuck | One conversation with appropriate current course/topic/task and learner-wide context | Useful explanation or navigation guidance | Close to unchanged underlying task; unavailable in focused timed exam | No displaced work, false academic claim or autonomous priority override |

### SL-03 acceptance examples

- **SL03-A1:** Returning completed Student bypasses onboarding and reaches approved Home; promoted first activity is visible and starts the actual supported task in one action.
- **SL03-A2:** Where multiple courses are saved, recommendation, explanation, direct route and evidence use the correct *exact course*; published-but-unsaved courses cannot appear as priorities.
- **SL03-A3:** Feedback creates appropriate evidence; future Home/Plan/Progress may change for defensible reasons; isolated low-quality responses are not exaggerated into mastery or grade claims.
- **SL03-A4:** Learner can go via Courses to a different topic; Plan and REV do not force the promoted task or silently manufacture evidence for changing priorities.
- **SL03-A5:** Missed work does not create an overdue-debt list; revision plan recalculates from current state and realistic availability.
- **SL03-A6:** Ask REV inherits the relevant context and returns to the same task; timed exam-performance focus maintains its protected interaction rules.

### Known WP2 audit boundary (not a new product decision)

The current Home implementation routes some planner `exam-question` tasks to the course Exam Prep surface because the planner item does not carry a paper/module identity. WP2 must check whether each promoted task genuinely meets the approved *exact supported activity* requirement and record any mismatch; do **not** mark this complete merely because navigation occurs.

## 6. Cross-journey experience and trust invariants

1. A screen has **one dominant job**, clearly understood within seconds, with a primary useful action and subordinate alternatives.
2. No one is required to configure a full plan, know exam dates or complete a large diagnostic before first useful revision. **D-01** permits optional exam dates during onboarding **independently of the starting check**; **D-01b** requires weekly-availability collection to be deferred until *after* first useful activity/feedback, through Plan. Missing weekly availability must not gate Home or further revision.
3. Active saved course membership determines learner-wide scope; removing membership preserves historical learning evidence; unresolved course IDs fail safely.
4. Starting-check signals remain directional only; learning results create normal evidence only after validated saving; dates, time, preferences and passive views do **not** create mastery/readiness.
5. Strong progress, readiness, predicted-grade and "on track" wording is justified only by sufficient relevant evidence and explicit limitations.
6. REV explains and guides contextual choices; deterministic planning logic remains the source of priority order.
7. A skipped/failed/interrupted step supports truthful continuation; the system never invents results, silently marks success or discards saved work.
8. The Free student experience still reaches coherent first and repeat value without a paywall or upgrade interruption.
9. Product composition follows the approved learner shell, identity, semantic tokens, visual authority and current-specific Home contract; do not revive old Home/REV variants.
10. Cover phone, tablet and desktop, Light/Dark, keyboard/screen reader, focus, reduced motion, loading/empty/error/recovery states at **appropriate risk-based layers**. WCAG 2.2 AA is the learner UX baseline.
11. Timed full-exam focus retains its special navigation, persistence, submission and REV-unavailable boundaries.
12. One underlying learning/evidence model serves first-use activity, ongoing Practice, Progress and planner interpretation; don't duplicate the student model.

## 7. Repeatable acceptance and evidence design — proposed WP2 mapping

These are **candidate assertions to map against existing evidence**, not a claim that every test has passed or that new tests are required.

| Journey contract | Reuse/check first | Required proof / likely gap to inspect in WP2 |
| --- | --- | --- |
| SL-01 / SL01-A1–A6, A2D, A2T | `tests/e2e/student-first-use.spec.ts`, `tests/e2e/auth-entry.spec.ts`, `tests/e2e/database-persistence.spec.ts`; register `JRN-08`, `AUTH-01`, `DATA-07` | Verify dates can be saved *before and without* any starting check, including partial dates; weekly availability is **not** prompted before first value and is offered later via Plan; date save/skip is independent of starting-check save/skip; real registration path is **not** established by production smoke; prove direct activity/evidence and interruption |
| SL-02 / SL02-A1–A5 | First-use browser/recovery tests, Plan/learner-programme tests; `JRN-01`, `JRN-02`, `JRN-07`, `DATA-04`, `DATA-05` | Establish separate fixtures for unfinished first use, incomplete Plan and empty active course set |
| SL-03 / SL03-A1–A6 | Home, responsive and persistence suites; `JRN-01`, `JRN-03`, `JRN-04`, `JRN-05`, `JRN-06`, `JRN-07` | Check direct Home task targeting, complete Learn interaction, exam submission/result lifecycle and evidence-driven next decision |

For every declared scenario, WP2 should record: **contract ID → present test/evidence → assurance layer → current status (Covered/Partial/Uncovered/Unknown) → exact missing assertion → owner/action**. Follow `50-engineering-standards/Testing & Assurance Standard.md` and update `90-governance-registers/Assurance Coverage Register.md` **only when coverage is actually verified or changed**.

Automation should prove navigation, functional completion, correct persisted data and a useful next action. Deterministic unit/integration/database tests carry algorithmic and security guarantees; targeted Playwright tests carry cross-screen behaviour; visual checks should protect approved appearance separately. Do not rewrite valid behavioural/security tests due to new visual presentation.

### Test data personas / fixture states

- New authenticated Student, no account experience/membership/evidence.
- New Student with one exact Business course, partial starting check and saved starter activity.
- Completed Student with Business course, ordinary evidence, **no** exams/availability; then each missing individually.
- Completed Student with full planner inputs, evidence and **multiple exact saved courses**.
- Completed Student with zero active courses or unresolved saved ID.
- Two different accounts proving ownership isolation and no evidence bleed.

### User-observation measures (baselines before numerical targets)

Capture account-to-first-saved-learning-result time and completion rate, returning-Home-to-start time, successful direct-task starts, failed/resumed first-use stages, and the *reason* students hesitate. Do not equate clicks, time-on-page, answered starting-check questions or visual regression pass with educational success. Set numeric targets only after observing a reliable baseline and obtaining Founder agreement.

## 8. Decisions and open questions for Founder review

| ID | Issue | Existing approved/current position | Recommendation / approval boundary |
| --- | --- | --- | --- |
| **D-01 — Founder direction received, pending governed authority promotion** | **May known exam dates be saved during onboarding before a starting check?** | Current `OnboardingPlanSetup` already offers optional exam dates **after exact course selection and before the starting check**. GJ-01 protects first useful revision; `Adaptive Revision Planning.md` treats dates as planning context. | **Yes.** Keep date entry **optional**, course/paper-specific, independently saveable, skippable and editable later. No check answer, check completion, readiness score or normal learning evidence is a prerequisite for saving exam dates. This is a clarified Founder product direction for WP1, **not permission to merge or silently change active authority**. WP2 should verify current implementation and test coverage before proposing any code change. |
| **D-01b — Founder direction received, pending governed implementation** | **When should weekly study-time availability be collected?** | Current `OnboardingPlanSetup` includes a second optional/skippable weekly-capacity screen **before** first useful revision; this is implementation drift from the newly agreed journey target, not a defect in saved availability data. | **Move weekly study-time collection to Plan after first activity and feedback**, retaining its optional nature and realistic Monday–Sunday model. First-use completion and Home access must not depend on it. Requires a separate scoped implementation PR and targeted update of onboarding/Plan browser assertions, technical documentation and any affected visual baselines. Do **not** change implementation in WP1. |
| **D-02** | **What if Home cannot launch the exact task it names?** | The specialist Home authority requires a direct exact supported activity. Current Home code has a course-level Exam Prep redirect for some `exam-question` tasks lacking paper identity. | **WP2 evidence task**, not permission to weaken the Home contract. Classify any mismatch Keep/Fix/Remove/Decide, and raise a Founder decision only if current authority cannot be met without a material product trade-off. |
| **D-03** | **What numerical activation/usability targets count as good enough?** | The repo mandates useful first value and risk-based assurance but does not approve a numerical activation target here. | Baseline with analytics and a small observed student trial, then seek separate target approval. No invented 30-second or percentage threshold. |

No new Parent/Teacher experience, payments, public marketing, course content production, revised planner algorithm, REV model capability or design-system fork is proposed.

## 9. Handoff and documentation impact

- **WP1 (this PR):** Founder-reviewed lifecycle/intent contracts and screen-purpose matrices, acceptance examples, product authority alignment for onboarding/Plan and discovery link in `INDEX.md`. **No production code or tests are changed.**
- **Founder gate:** D-01 and D-01b directions have both been supplied on 10 October 2026. Their **product** direction is settled; the Founder still must approve merging exact PR #590 for these contracts/authority edits to become active on `main`. Do not interpret 'continue' as merge approval.
- **WP2 (separate governed task):** compare exact canonical runtime `/app/ → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime`, current Home/Plan/Courses, accepted design baselines and existing tests. Create a small Keep/Fix/Remove/Decide matrix and evidence-backed assurance gap list.
- **WP3 (separate, bounded PRs after readiness/approval where applicable):** only correct observed/approved mismatches; preserve current technical and normative ownership; update code, technical docs, affected authorities, assurance evidence and any necessary register entries together.
- Do not modify historic decision/audit evidence. Do not reopen ongoing C3/C4 design rollout through this document, or confuse presentation baselines with learning behaviour.

**Promotion note:** This branch contains the proposed **active-on-merge** contract and reconciled product authorities; the Founder has clarified **optional exam dates independently of the starting check (D-01)** and **weekly availability after first value (D-01b)**. The current approved `main` is unchanged until an exact PR-specific Founder merge approval is received and the governed merge completes.
