# FI-023 — Returning Student Home v3 — analysis and Definition-of-Ready assessment

**Document type:** non-authoritative product-management analysis / implementation readiness assessment  
**Lifecycle:** Analyse — **not Ready, not In Progress, not Live**  
**Prepared:** 2026-10-10  
**Canonical baseline assessed:** approved `main` `4a746a2cfcc6223841b554074f673b0a7803e7c0`  
**Owner:** Product / Founder  
**Proposed product contract:** [FI-023 Home v3 Proposed Authority.md](FI-023%20Home%20v3%20Proposed%20Authority.md) (not active)  
**Live authority until approval:** `10-product-governance/Returning Student Home Experience.md` v1.2  
**Visual evidence:** Founder-selected Claude Home v3 at version `v1791470408875449`; uploaded `design_handoff_home_v3/README.md` and `HomeV3.frozen.dc.html`, with the accompanying Founder-viewed desktop Light and Dark images in the conversation. The separate H1–H8/S1–S4 gallery is not present in the supplied ZIP; do not assert its screenshots were inspected.

## Lifecycle and authority

The Founder selected the Home v3 visual direction and explicitly approved proceeding with **preparation and readiness** on 2026-10-10. This establishes that the material Home expansion belongs in the product and authorises this Analyse work. It **does not** approve `Analyse → Ready`, production-code implementation, or any PR merge.

Do not infer that the material change is just design-token alignment: it expands the currently approved Home contract (which ends after Today's Plan) into five information/navigation areas. `REV Guidance and Conversation Pattern.md` v2.1 already supersedes the older requirement to place the promoted task as a separate Plan element; the proposed Home authority incorporates that precedence explicitly rather than claiming code or prototype authority.

`Learner Design System.md` v1.0, `Subject Accent Colour System.md`, `Identity Asset Usage Rules.md`, `Global Learner Navigation.md` and `Claims and Progress Governance.md` continue to govern their specialist responsibilities. Claude's visual source is **reference**, not a second design or code system.

## Canonical route, runtime, implementation evidence

- **Target:** signed-in learner Home, `/revision/app/#/home` (relative GitHub Pages installation); canonical route helper emits `#/home`.
- **Runtime:** `app/index.html → src/main.tsx → AuthGate → FirstUseBoundary → PlannerRuntime → PlannerHomeScreen`.
- **Relevant implementations:** `src/app/PlannerHomeScreen.tsx`, `home-v2.css`, `home-task.ts`, `home-view.ts`, `rev-suggestions.ts`, `progress-summary.ts`, `PlanScreen.tsx`, `planned-session-service.ts`, `src/app/ui/`, shared learner shell and routes.
- `src/app/App.tsx` old Home-like/REV path is **compatibility**, not the target.
- The merged Home/Progress C3 migration (PR #575) already removed direct `--rv-*` use. Later merged Plan (PR #578), Courses (PR #583), Learn (PR #585), Practice (PR #589), Exam Prep/Simulator (PR #591), Course Overview (PR #592) and learner-entry (PR #593) work provide the modern visual foundation. Do not resurrect prior visual layers.
- Parallel draft PR #590 on first-use/lifecycle may adjust optional exam-date onboarding: inspect and integrate its approved outcome when relevant; FI-023 does not independently reorder onboarding.

## Definition of Ready — criterion-by-criterion

### 1. Student problem and target user — PASS

An established returning learner needs a credible recommended activity without losing control of their own learning. The earlier Home surface focuses on recommendation and limited Plan context but does not expose a concise view of upcoming assessments, learner-wide Progress, active courses and the available learning modes. It therefore forces repeated navigation and discovery for ordinary return visits. FI-023 is a coherent *learner-wide orientation* surface, not a new standalone learning mode.

### 2. Strategic case and opportunity cost — PASS

Strengthens the connected loop: learner course membership, exam timing, planned sessions and evidenced performance inform a useful recommendation; action flows into Learn/Practice/Exam Prep and returns evidence to Progress/planning. A simpler alternative is to keep v1.2 Home and rely entirely on shell navigation. That avoids implementation cost but does not meet the Founder's selected "guided and independent learner" Home job. Scope is bounded to existing data and shared components; no new learning algorithm or AI service.

### 3. Falsifiable user-value hypothesis — PASS

Compared with current Home, an established learner should reach the next useful activity or independently find Plan, Progress, an exam or a course section with fewer navigation hops and less hesitation, while seeing no fabricated performance information. Evaluate through route-success metrics, targeted moderated testing and journey assertions. Fails if learners cannot distinguish recommendation from schedule, search fruitlessly for sections, or misunderstand low-evidence readiness.

### 4. Experience and simplicity — PASS

The five-part layout and its priorities are fixed: REV → Today's Plan / Exams → Progress → Courses → What do you want to do? The latter is explanatory, not another primary navigation. Desktop may place Plan and Exams side by side; phones stack them in the same order. Defined new/returning, no course, loading, completed Plan, no dates, only mocks, only official exams, insufficient evidence, no recommendation and recoverable failures.

**Important:** The handoff's distinct inline REV answer-preview UI has **not** been approved as new functionality; Home Ask REV will open the existing shared contextual conversation layer with the submitted question. Its prototype should not imply new model endpoints.

### 5. Evidence/intelligence model — PASS

Read existing saved courses, `RevisionAssessment` (`assessmentType` differentiates mock/public exam), planner snapshot/accepted sessions and stored educational evidence. Progress uses the current global Progress computation (`progressMeasuresFor`, `readinessAcross`) and shared three measures. No new schema or learner-grade estimator.

**Verified integrity boundary:** `src/app/plan-model.ts` already defines `createPlanDayBuilder` and `PlanDay` with `plannedMinutes`, `doneMinutes`, `studyCount`, `doneCount`, and `allDone`, deriving Done only from accepted `PlannedSession.status === 'done'`. Derived suggested items are not persisted Done. Reuse this exact Plan mapping and its contract for Home. Do not count “started” as completed, or imply all derived suggestions were done when no matching durable completion is recorded.

### 6. REV role — PASS

REV remains deterministic, context-aware, one recommendation plus factual reason and a real contextual conversation entry. `rankSuggestions` presently excludes already accepted planned topics via `plannedTopicKeys`. The prototype shows the same task in both sections. Match only exact course/topic/activity identities, and show truthful Plan membership. Do **not** change recommendation ranking or insert phantom Plan entries to match the screenshot. "Not now" and "Suggest something else" continue their governed rules even if visually subordinate.

### 7. MVP boundary — PASS

**Include:** revised Home composition; accurate Plan and assessment summary; aggregated three-measure Progress; saved-course shortcuts; short six-mode explanation band with eligible-course chooser; shared contextual Ask REV; truthful loading/errors/empty/completed states; responsive fidelity.

**Exclude:** new planner model, global new AI chat mode, new content, paper inference, extra official-exam fields, database migrations, Admin redesign, course-level analytics redesign, public marketing and entitlement/product-packaging changes. Keep launch feature within active signed-in learner Home.

### 8. Free / Paid / Premium — PASS (same capability across tiers)

- **Free:** full Home orientation, recommendation, useful Today summary, exam dates, three evidence measures and active-course navigation.
- **Paid:** exactly the same Home capabilities in this slice, reflecting currently live all-access foundations; future higher-value features may surface here only when separately approved.
- **Premium:** exactly the same Home capabilities in this slice; no artificial countdown/metric masking or paywall.
- **Limits/allowances:** none introduced; Home itself creates no new premium inference or token cost beyond existing contextual Ask REV.
- **Sustainability:** shared current Supabase reads and UI calculations; implementation should reuse loaded evidence rather than fetching redundant per-card data. Instrument and watch read failures/performance. Commercial packaging remains FI-002's responsibility.

### 9. Upgrade/conversion hypothesis — N/A in this bounded package

No differentiated feature or new upgrade messaging; fake urgency would be counterproductive around exam dates. Deferred commercial expansion requires separate authority and cannot piggyback on FI-023.

### 10. Measurement contract — PASS

**Primary:** proportion of eligible returning Home sessions leading to a useful activity start or a clear self-chosen section within the visit. **Supporting:** Home view, REV recommended task start, Plan route, Course Overview, Learn/Practice/Exam Prep chooser, Progress route, exam-date edit route; relevant denominator is returning active Students with an accessible Home. **Value:** time/hops to first action, successful task completion/evidence write through existing events, qualitative "understood what to do" tester measure. **Guardrails:** no non-member course route, no false plan tag, no misleading readiness, no duplicated completion event, no increase in Home failure or excessive load time. **Cost:** no new per-view model calls; measure database reads/error rate and contextual Ask REV invocation separately. Instrumentation owner: use `PlannerHomeScreen.recordTaskStart` / `recordPlannerActivityEvent` and the existing course-open telemetry in `PlannerRuntime.openCourse` where the user actually starts/chooses; add only bounded Home route/action events through the existing product analytics boundary if a gap is proven during implementation. All measured conversion denominators and route outcomes must be defined from real visits/events, not assumed from prototype UI. Implementation tests must verify events where changed.

### 11. Founder/Admin assurance — PASS as an assurance contract

Existing journey/availability signals and ordinary issue/CI/production smoke reports should show Home route health, primary-action start success, failed Home-section loads, course mismatch, and direct activity persistence. The Home redesign does not require a new Admin analytics panel in its MVP; if current Admin cannot display an indicator, capture repeatable test evidence and record a coverage gap rather than pretend it is visible.

### 12. Risk, trust, safeguarding, privacy and accessibility — PASS with test guardrails

Major hazards: misleading readiness, invented dates/plan completion, AI-generated priority changes, route to unsupported paper, stale learner programme identity, hidden focus in course chooser, high-contrast/radius drift, broken mobile shell. Controls: existing progress engine/assessment types, deterministic REV logic, exact route validation, no invented AI answers, keyboard/Escape/focus return, 44px targets, reduced motion, clear non-colour status labels, approved Light/Dark semantic tokens, WCAG 2.2 AA and test-user data isolation.

### 13. Technical feasibility and dependencies — PASS (implementation work bounded)

Code inspection against the approved baseline established each required integration boundary:

1. **Plan completeness:** `src/app/plan-model.ts` already builds an ordered day with accepted sessions, derived suggestions, `plannedMinutes`, `doneMinutes`, `studyCount` and `doneCount`. `PlanScreen` uses `createPlanDayBuilder` and `buildPlannerSnapshot`; `PlannedSession.status` supplies real Done. Home should consume the same model and not create a new completion calculation. Derived suggestions are not durable completed sessions; that constraint remains visible rather than being guessed away.
2. **Ask REV:** `PlannerRuntime.openRev(draft?: string)` already accepts the user's draft and displays the shared contextual conversation panel; `PlannerRevScreen` reads the draft. Home's prop needs only a bounded forwarder and keyboard-safe form. **Sending automatically versus opening with a populated draft** must follow the real shared chat submit contract; do not fake a submitted answer or create an inline preview.
3. **Exam management:** `PlanScreen` already owns Manage Exams as `examsOpen` local modal state, with `assessmentType` preserved on `RevisionAssessment`. Add a small addressable Plan `manage-exams` navigation intent or equivalent shared Plan-owned activation rather than a Home exam editor or new schema. Direct Edit dates should open that existing manager, not strand the learner on Plan without identifying the action.
4. **Course chooser:** `availableCourseSections(course)` in `catalogue-model.ts` is already consumed by `CourseExperienceScreen` to validate supported sections. Filter only saved eligible `LearnerProgrammeCourse` entries by that same helper and use canonical `learnerCourseRoute` to navigate. No new course registry.
5. **Partial failure:** `PlannerHomeScreen` currently combines planner setup and learning evidence in a single `Promise.all`, so a single rejection loses both. Refactor the Home composition into independently resolved section results with explicit retry/fallback, preserving existing programme/evidence and Planner services. This is UI data orchestration, not a new database or recommendation model.
6. **Visual assurance and integration:** `home-v2.css` is already on semantic tokens after merged PR #575; other learner surfaces have been migrated by PRs #578/#583/#585/#589/#591/#592/#593. Build from current `main` with page composition and shared components. Existing fail-closed Home visual hashes demand Founder review of the new captures.

Scope/effort estimate: **medium** frontend/product-integration change (one Home page composition plus small Plan-owned navigation intent and targeted view-model/tests), with **no database migration or new AI model**. The outstanding design-gallery file can be replaced by independently captured browser screenshots at the handoff's sizes for final fidelity acceptance. These are implementation tasks and acceptance checks, not fundamental unresolved product decisions.

### 14. Test/assurance — PASS as a planned contract

Risk level **medium/high learner-journey** due route changes and cross-section evidence. Unit test deterministic matching, count aggregation and date-grouping; integration test against plan/assessment/evidence stores; browser test correct Home route, recommendation Start and persistence, section buttons, focus and chooser, one course/many courses/no course, Plan complete/empty, date kinds, partial failures, REV overlay, 320px/no overflow/zoom, phone/tablet/desktop Light/Dark and reduced motion. Protect existing GJ-01 and Progress checks. Continue fail-closed Home baseline review: do not re-pin SHA-256 digests without exact Founder screenshot approval. Do not rewrite other page snapshots.

### 15. Documentation/authority impact — PASS identified, **not yet promoted**

- **Proposed authority:** v1.3 `Returning Student Home Experience.md`, submitted as a **separate candidate** while v1.2 stays active on main.
- **Normative adjacent sources:** specialist REV, learner design, navigation, claims and planning remain intact unless a genuine new contract conflict is proven.
- **On implementation:** update `docs/technical/Returning Student Home Implementation.md` (some sections still describe older composition and outdated subject palette), `docs/features/home.md`, `docs/technical/Learner Design System Implementation Reconciliation.md`, tests/visual digests/assurance register.
- **Decision record/indexes:** add an ADR or decision register entry only if a material new architecture/evidence contract is introduced, not merely for approved page composition. Track FI-023 in the canonical backlog.
- Historical Claude design and prior screenshots remain historical evidence, not active policy.

### 16. Blocking decisions — NONE outstanding beyond explicit Ready and authority approval

The Founder selected the page hierarchy and identity treatment. Product analysis recommends the shared contextual Ask REV layer, no additional exam data schema and exact-match Plan labelling rather than two independent competing recommendation narratives. Criterion 13 feasibility checks now confirm the existing components and required bounded adjustments; criterion 10 identifies the existing telemetry owner and guardrail. No additional Founder behaviour/commercial/evidence choice is needed before requesting Ready.

### 17. Human Ready approval — BLOCKED by definition

**Not given.** "Approved to go forward" in this thread authorised this preparation, not `Ready` and not any merge. Present a final complete criterion assessment and proposed authority before asking the Founder to explicitly approve FI-023 Ready.

## Dependency/implementation boundary

| Capability | Current source | FI-023 approach |
| --- | --- | --- |
| REV next step | `rev-suggestions.ts`, `home-task.ts`, `PlannerHomeScreen.tsx` | Reuse governed candidates/Start; truthful Plan tag |
| Today | `planner-model.ts`, `accepted-sessions.ts`, `planned-session-service.ts` | Reuse; verify completion status before "Done" and minutes bar |
| Exams | `RevisionAssessment.assessmentType/title/date`, Plan manager | Reuse existing kind/label; no migration |
| Progress | `progress-summary.ts`, `ProgressMeasures` | Reuse global aggregate semantics |
| Course choices | `LearnerProgrammeCourse`, navigation helpers | Filter active eligible courses and sections |
| Ask REV | `PlannerRuntime.openRev(draft?)`, shared REV overlay | Reuse; no inline answer preview |
| Styling | merged canonical tokens/components and shell | Local page layout only; no parallel `--rv-*` system |
| First-use | GJ-01/FirstUseBoundary and PR #590 if later merged | Keep untouched |

## Recommended next action

Present the proposed Home v1.3 authority together with the **complete** Ready assessment and request explicit `Approve FI-023 Ready`. If granted, promote the approved Home v1.3 into the numbered active authority and update FI-023 to Ready on the governed PR, then seek separate explicit approval for that specific PR merge. Only after the approved Ready authority is integrated may a production-implementation branch/PR begin. Until then FI-023 stays **Analyse**; no production implementation or merge is authorised.

## Design handoff provenance (non-authoritative)

Frozen Claude handoff: version `v1791470408875449`; uploaded ZIP `Revision Design SystemV2.zip` SHA-256 `8935b1d036257d340d96da3e6353057e387da6b422b10148589871fa8d90149c`; contained `design_handoff_home_v3/README.md` SHA-256 `55713f2086feb9ba0ff1ea881ce257e2b89190799326731d3b2f7a6e1929964e` and `HomeV3.frozen.dc.html` SHA-256 `ae0447efe4dc18152fa03557bc4fefddc2c2eb0e147cec1ab92128316c09cf5a`. The separate layout/state gallery is not in the ZIP; the text specification and screenshots already reviewed by the Founder are retained as inputs. Do not treat prototype code as shared implementation.
