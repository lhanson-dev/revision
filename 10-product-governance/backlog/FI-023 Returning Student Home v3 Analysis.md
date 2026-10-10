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

### 4. Experience and simplicity — PASS with implementation-state verification pending

The five-part layout and its priorities are fixed: REV → Today's Plan / Exams → Progress → Courses → What do you want to do? The latter is explanatory, not another primary navigation. Desktop may place Plan and Exams side by side; phones stack them in the same order. Defined new/returning, no course, loading, completed Plan, no dates, only mocks, only official exams, insufficient evidence, no recommendation and recoverable failures.

**Important:** The handoff's distinct inline REV answer-preview UI has **not** been approved as new functionality; Home Ask REV will open the existing shared contextual conversation layer with the submitted question. Its prototype should not imply new model endpoints.

### 5. Evidence/intelligence model — PASS for reuse; **verification required** for completion aggregation

Read existing saved courses, `RevisionAssessment` (`assessmentType` differentiates mock/public exam), planner snapshot/accepted sessions and stored educational evidence. Progress uses the current global Progress computation (`progressMeasuresFor`, `readinessAcross`) and shared three measures. No new schema or learner-grade estimator.

**Known integrity boundary:** `PlannedSession.status = done/planned/skipped` exists, while inferred planner `today` items are not automatically equivalent to durable completed sessions. Confirm which rows can truthfully show "Done" and what status source drives the proposed progress bar; never derive Done from suggestion, clicks or completed animations.

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

### 10. Measurement contract — PASS conceptually; confirm instrumentation owner before Ready

**Primary:** proportion of eligible returning Home sessions leading to a useful activity start or a clear self-chosen section within the visit. **Supporting:** Home view, REV recommended task start, Plan route, Course Overview, Learn/Practice/Exam Prep chooser, Progress route, exam-date edit route; relevant denominator is returning active Students with an accessible Home. **Value:** time/hops to first action, successful task completion/evidence write through existing events, qualitative "understood what to do" tester measure. **Guardrails:** no non-member course route, no false plan tag, no misleading readiness, no duplicated completion event, no increase in Home failure or excessive load time. **Cost:** no new per-view model calls; measure database reads/error rate and contextual Ask REV invocation separately. Instrumentation should reuse existing planner/activity/router telemetry when present; any additional event must be minimal, consent/privacy compatible and defined in implementation records, not fabricated by click counts.

### 11. Founder/Admin assurance — PASS as an assurance contract

Existing journey/availability signals and ordinary issue/CI/production smoke reports should show Home route health, primary-action start success, failed Home-section loads, course mismatch, and direct activity persistence. The Home redesign does not require a new Admin analytics panel in its MVP; if current Admin cannot display an indicator, capture repeatable test evidence and record a coverage gap rather than pretend it is visible.

### 12. Risk, trust, safeguarding, privacy and accessibility — PASS with test guardrails

Major hazards: misleading readiness, invented dates/plan completion, AI-generated priority changes, route to unsupported paper, stale learner programme identity, hidden focus in course chooser, high-contrast/radius drift, broken mobile shell. Controls: existing progress engine/assessment types, deterministic REV logic, exact route validation, no invented AI answers, keyboard/Escape/focus return, 44px targets, reduced motion, clear non-colour status labels, approved Light/Dark semantic tokens, WCAG 2.2 AA and test-user data isolation.

### 13. Technical feasibility and dependencies — **OPEN (bounded verification)**

The canonical React runtime and main service contracts are present. Before Ready, verify explicitly:

1. The accepted/planner `today` output can be composed into ordered rows with truthful stable completion and total-minute semantics. If not, define a compliant, non-fabricated reduced summary; do not silently add a new persistence model.
2. Whether Home can pass a typed prompt to `PlannerRuntime.openRev(draft?)`, and whether Plan's Manage Exams can be opened through existing routing without duplicating ownership.
3. How the short course chooser determines section availability per saved course and uses only shared shell routes.
4. Independent error boundaries for Progress versus Plan/Exams, since some current Home loads are in one `Promise.all` and a failure can blank unrelated data.
5. Size of the compositional change in `PlannerHomeScreen`/styles and impact on Home exact screenshot-digest tests.
6. Inspect any subsequent merged learner design/first-use PR at implementation start. No reliance on unmerged PR code.

These are bounded feasibility checks, not permission to implement a new planner or change content governance during analysis. The requested missing handoff gallery can be replaced by independent browser renders of the frozen prototype or annotated captures before visual acceptance.

### 14. Test/assurance — PASS as a planned contract

Risk level **medium/high learner-journey** due route changes and cross-section evidence. Unit test deterministic matching, count aggregation and date-grouping; integration test against plan/assessment/evidence stores; browser test correct Home route, recommendation Start and persistence, section buttons, focus and chooser, one course/many courses/no course, Plan complete/empty, date kinds, partial failures, REV overlay, 320px/no overflow/zoom, phone/tablet/desktop Light/Dark and reduced motion. Protect existing GJ-01 and Progress checks. Continue fail-closed Home baseline review: do not re-pin SHA-256 digests without exact Founder screenshot approval. Do not rewrite other page snapshots.

### 15. Documentation/authority impact — PASS identified, **not yet promoted**

- **Proposed authority:** v1.3 `Returning Student Home Experience.md`, submitted as a **separate candidate** while v1.2 stays active on main.
- **Normative adjacent sources:** specialist REV, learner design, navigation, claims and planning remain intact unless a genuine new contract conflict is proven.
- **On implementation:** update `docs/technical/Returning Student Home Implementation.md` (some sections still describe older composition and outdated subject palette), `docs/features/home.md`, `docs/technical/Learner Design System Implementation Reconciliation.md`, tests/visual digests/assurance register.
- **Decision record/indexes:** add an ADR or decision register entry only if a material new architecture/evidence contract is introduced, not merely for approved page composition. Track FI-023 in the canonical backlog.
- Historical Claude design and prior screenshots remain historical evidence, not active policy.

### 16. Blocking decisions — no new Founder design choice; bounded technical confirmation open

The Founder selected the page hierarchy and identity treatment. Product analysis recommends the shared contextual Ask REV layer, no additional exam data schema and exact-match Plan labelling rather than two independent competing recommendation narratives. The technical checks in criterion 13 and measurement owner in criterion 10 still need validation to prove an honest product can be implemented without altering those decisions.

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

Perform the five bounded technical confirmations above, update this assessment with evidence, prepare the proposed Home v1.3 authority for human approval, and present the Definition-of-Ready decision. Until then FI-023 stays **Analyse**; no production implementation or merge is authorised.
