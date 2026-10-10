# Revision Product Reconciliation Plan

**Status:** implementation plan for Founder review  
**Baseline audit:** `audits/2026-10-07-revision-product-reconciliation.md`  
**Workstream owner:** one execution owner for the duration of reconciliation; other AI tools may review but should not independently implement overlapping learner-runtime changes  
**Production baseline:** approved `main` at the audit baseline; refresh against current `main` before every merge  
**Goal:** restore one coherent learner product before broad feature development resumes.

## Non-negotiable outcome

The reconciled product must prove this loop:

`exact course → Learn exposure → Practice evidence → feedback/repair → Progress interpretation → adaptive Plan → contextual REV explanation → Exam Prep/mock → new evidence → recalculated next action`

Every visible action must have one truthful contract:

- what the learner thinks it does;
- what state/data it changes;
- what REV can know from it;
- what the planner may use;
- what Progress may claim;
- how it persists across reload/device where applicable; and
- how automated assurance proves it.

## Freeze rule during reconciliation

Until this plan reaches the system-level acceptance gate:

- do not merge broad learner redesign or feature PRs that add another route, state model, recommendation engine, exam runtime or persistence workaround;
- content production may continue where it does not change learner runtime contracts;
- bug/security/release-critical fixes may proceed in narrowly scoped governed PRs;
- good work in frozen PRs should be harvested selectively after its target contract is reconciled rather than discarded automatically.

This is a temporary workstream rule. A permanent multi-AI operating-model change requires its own governance decision.

## Reconciliation principles

1. **One canonical runtime responsibility.** One Home recommendation contract, one Practice runtime, one Exam Prep/mock runtime, one learner-state model.
2. **Derived state stays derived.** Do not create a second stored plan, readiness score or mastery state when it can be reconstructed from facts/evidence.
3. **State classes remain separate.** Content exposure, learning evidence, exam-performance evidence, planning context, preferences and conversation context must not contaminate one another.
4. **Exact routing.** A recommendation that says “do X” must launch X, not a generic page.
5. **Completion from reality.** Revision should infer completion from the actual activity where possible rather than asking the learner to maintain a parallel to-do list.
6. **No fake REV.** Deterministic/data/content answers are valid; unsupported conversational capability is not.
7. **No duplicate learner-facing exam truth.** Content Factory / approved Exam Truth is the canonical source for exam content and retained mocks.
8. **Fail closed on trust.** Unverified learner-facing exam claims, unsupported marking and unsafe persistence must not masquerade as complete features.
9. **Delete after replacement proof.** Retire dead/compatibility code only after search/tests show the canonical replacement is complete.
10. **System acceptance, not local green tests, closes reconciliation.**

## Delivery sequence

### R0 — Stabilise the knowledge and branch state

**Purpose:** make repository state reliable enough for one execution owner to work without rediscovering contradictions.

Actions:

- merge this audit/plan only after Founder approval;
- reconcile current-state registers against current production evidence;
- identify stale learner-runtime/design PRs and close those with no unique required delta;
- preserve historical decisions/evidence rather than rewriting them;
- refresh `CLAUDE.md` current-state section so it describes current `main`, not 1 October state;
- create one reconciliation tracker in technical documentation rather than adding competing feature briefs.

Exit criteria:

- current-state registers match current production;
- open learner-runtime PRs are classified as active, frozen, superseded or historical;
- no stale PR is treated as an integration candidate without deliberate revalidation.

### R1 — Lock canonical learner-state semantics

**Purpose:** define the data contract before touching UI.

#### R1.1 Topics covered / Reviewed

Implement a separate content-exposure state that can represent meaningful Learn review without affecting Understanding or Exam readiness.

Required properties:

- course/topic/page identity;
- timestamp / latest meaningful review;
- learner-owned;
- not scored;
- never contributes directly to mastery/readiness;
- stronger valid evidence may make unreviewed Learn irrelevant to recommendations (“no completion tax”).

Decide the minimum meaningful-review event mechanically (for example explicit page completion / end-of-page action rather than mere route open or scroll position). Avoid pretending passive dwell time proves engagement.

#### R1.2 Whole-paper evidence scope

Remove the requirement that `exam_attempt` belongs to a topic.

Preferred model:

- paper/course attempt record at paper/course scope;
- question-level evidence keeps exact topic/node mapping;
- readiness can use paper-level simulation evidence without injecting it into one arbitrary topic.

If the existing `learning_evidence` schema cannot express a non-topic event cleanly, create a dedicated exam-attempt record and project only valid question-level signals into topic knowledge.

#### R1.3 Activity identity

Define one stable activity identity sufficient to link:

`recommendation → planned session → route → activity start → completion → evidence`

At minimum it must preserve exact course, topic/node, activity family and paper/mock identity where relevant.

Exit criteria:

- semantics documented in product/evidence authority where normative;
- migrations/data contracts approved where needed;
- engine unit tests prove separation of coverage, understanding and exam evidence.

### R2 — Unify priority/recommendation truth

**Purpose:** stop Home, Plan, Progress and REV disagreeing about what matters most.

Create one deterministic priority service/contract that receives:

- active programme;
- learner evidence/state;
- content exposure state;
- upcoming assessments and scope;
- available time;
- accepted sessions;
- bounded learner preferences;
- recent meaningful activity / recency.

It returns ranked candidate actions with:

- exact activity identity;
- reason codes;
- evidence limitations;
- estimated duration;
- priority context.

Surface behaviour:

- **Home:** best useful action now;
- **Plan:** allocate ranked candidates across available days;
- **Progress:** best next improvement action in current course context;
- **Course Overview:** best course-scoped next action;
- **REV:** explain/compare the same reasons; may not invent a different priority.

The same service need not force identical output across contexts. Context/scoping may differ, but priority semantics and reason codes must be shared.

Exit criteria:

- no separate Home-only ranking engine remains;
- fixture tests show consistent priority reasoning across Home/Plan/Progress/REV;
- “Suggest something else” and “Not now” operate on persisted bounded context events, not browser session state.

### R3 — Make every recommendation launch the canonical activity

**Purpose:** remove generic routing and duplicate task renderers.

Actions:

- extend canonical routes with exact activity identity where necessary;
- Plan derived suggestion Start opens exact topic/activity;
- accepted planned sessions open their stored topic/activity;
- Home launches the canonical Practice/Exam Prep activity rather than `HomeFocusedActivity`;
- recommendation/activity event linkage survives navigation/reload;
- when canonical completion occurs, activity lifecycle is reconciled automatically;
- manual “Done” remains only for legitimate external/manual sessions and is clearly planning state, not learning evidence.

Then remove `HomeFocusedActivity` after replacement tests are green.

Exit criteria:

- one Practice experience for the same activity regardless of entry surface;
- exact-route browser tests from Home and Plan;
- completion creates the same evidence and feedback irrespective of entry surface;
- planned/recommended lifecycle reaches completed from the real activity without manual duplication.

### R4 — Complete Learn as a first-class part of learner memory

**Purpose:** make Learn useful to REV without corrupting evidence.

Actions:

- persist meaningful Learn exposure using R1 semantics;
- display Topics covered from exposure + valid stronger evidence according to the governed coverage rule;
- let Practice summary/recommendations deep-link to the exact Learn page;
- structured Ask REV context includes course, topic, Learn page/node and current relevant learner state;
- reading/quick-check in Learn never changes Understanding/Exam readiness unless an interaction is explicitly governed as scored Practice.

Exit criteria:

- read/complete a Learn page → Topics covered changes;
- Understanding/readiness do not change;
- reload preserves coverage;
- REV receives exact page context;
- assurance register moves JRN-03 from Partial only after the complete interaction is proved.

### R5 — Reconcile Exam Prep before extending it

**Purpose:** establish one course-level exam product.

#### R5.1 Canonical content

For AQA 7132:

- retained Content Factory mock papers are canonical full mocks;
- course-level Exam Prep is the canonical learner route;
- old per-paper simulations are not shown as competing learner mocks once the retained runtime is complete;
- component-level Exam Prep compatibility routes redirect/narrow into the canonical course route rather than owning another simulator.

#### R5.2 Unverified exam guidance

Founder decision required from audit item RPR-D01.

Audit recommendation:

- keep `needs_check` items in review/admin evidence;
- learner-facing screen shows only approved/verified exam guidance;
- known-wrong wording is never shown.

Do not implement this recommendation until the Founder explicitly resolves the conflict with the 6 October instruction to keep flagged items visible.

#### R5.3 Mock semantics

Define exactly:

- timed full mock;
- untimed full mock;
- targeted question practice.

Do not label targeted single-question practice as “Practise untimed” for a full mock.

Exit criteria:

- one mock list per course;
- one runtime contract per mock mode;
- no competing legacy paper simulation exposed in learner navigation;
- content provenance is explicit and tested.

### R6 — Add durable exam-attempt lifecycle

**Purpose:** make full mocks safe enough for real learners.

Required server-owned model:

- attempt identity;
- learner/course/paper/mock identity;
- mode and time limit;
- started/submitted/abandoned state;
- durable elapsed/timing semantics;
- selected choices;
- answer drafts/checkpoints;
- flags;
- per-question submitted answer and marking state;
- linkage to resulting evidence.

Rules:

- autosave must survive refresh/device interruption as designed;
- duplicate submissions are idempotent;
- timed validity is explicit;
- leaving a timed attempt has one governed consequence;
- submitted answer history is preserved where product/privacy authority requires it;
- drafts and submitted answers follow retention/privacy rules.

Exit criteria:

- refresh/reopen resumes safely;
- browser crash does not destroy material work;
- full result lifecycle is integration-tested;
- JRN-05 becomes genuinely covered rather than navigation/start-only.

### R7 — Correct exam evidence and result feedback

**Purpose:** make mock results useful to the learner model.

Actions:

- remove arbitrary first-topic attribution for whole-paper evidence;
- preserve question-level topic/node/AO evidence;
- treat self-assessed marks with the existing confidence cap;
- feed valid paper-level simulation evidence into exam-readiness logic at the correct scope;
- Progress and REV can explain what the result changed and where confidence remains limited;
- result next action comes from the canonical priority service, not local hard-coded AO advice alone.

Assisted/AI marking remains outside this step unless FI-007 reaches explicit Founder-approved Ready.

Exit criteria:

- one full mock changes the right course/paper readiness state without contaminating an unrelated topic;
- explanation shows evidence method/limitations;
- tests cover retake/supersession/idempotency.

### R8 — Bring REV to the approved product boundary

**Purpose:** make “Ask REV” truthful while preserving cost/safety controls.

This is material FI-003 implementation. **Do not start until FI-003 completes the governed Definition of Ready and receives explicit human Analyse → Ready approval.**

Keep the current deterministic/data-answer layer as tier 1.

Definition of Ready must resolve:

- server orchestration boundary;
- approved-course retrieval contract;
- structured current-screen context;
- conversation persistence/delete/retention;
- safety/safeguarding;
- under-18 privacy/provider handling;
- model evaluation/hallucination thresholds;
- cost/latency budgets;
- model routing/fallback;
- observability/versioning;
- exam-integrity behaviour.

After Ready:

1. deterministic answers from student data;
2. direct retrieval from approved content when sufficient;
3. model only for explanation/reasoning/coaching;
4. strong contextual grounding;
5. conversation persistence per approved retention;
6. no model-owned planning calculation.

Exit criteria:

- “explain this another way” from Learn genuinely works;
- “why did my plan change?” explains the same priority reasons;
- “what did I get wrong?” can use stored governed exam feedback where available;
- model evaluation release gate passes;
- no fake “anything” claim remains.

### R9 — Remove duplicate/dead runtime

Only after R1–R8 replacements are proven:

- remove unreachable `src/app/App.tsx` and old dependent surfaces not used by `src/main.tsx`;
- remove `HomeFocusedActivity`;
- remove/redirect legacy component Exam Prep simulator responsibility;
- remove obsolete CSS/routes/components exposed only by superseded learner surfaces;
- remove stale compatibility paths only when production/bookmark policy permits.

Use static dependency search plus browser/navigation regression to prove removal safety.

### R10 — System-level acceptance gate

Create one repeatable reconciliation journey using a controlled synthetic learner with real service contracts/mocked network only where production-safe:

1. new Student chooses AQA Business;
2. completes first useful revision;
3. opens a Learn page and records exposure;
4. completes scored Practice;
5. verifies Progress changes appropriately;
6. verifies Plan priority/reason changes;
7. asks REV why and receives the same underlying reason;
8. launches the exact planned activity;
9. starts a mock, refreshes, resumes and completes it;
10. verifies question/paper evidence and Progress;
11. verifies Home/Plan/Progress/REV converge on the new next action;
12. reload/sign-out/sign-in reconstructs durable state.

Required variants:

- no exam date;
- no availability;
- low evidence;
- wrong confident answer;
- interrupted mock;
- self-assessed mock;
- phone/tablet/desktop;
- light/dark/system where material;
- keyboard/WCAG checks;
- fail-closed backend/data errors.

Reconciliation is complete only when this gate is green and the current-state registers describe the same system.

## PR strategy

Do not create one giant reconciliation PR.

Recommended governed sequence:

1. **PR-A — Audit + reconciliation plan** (documentation only).
2. **PR-B — Current-state/register/open-PR cleanup**.
3. **PR-C — Coverage/evidence/activity identity authority + data contract**.
4. **PR-D — Unified priority service**.
5. **PR-E — Exact activity routing + lifecycle reconciliation + remove Home duplicate**.
6. **PR-F — Learn exposure integration**.
7. **PR-G — Exam Prep canonicalisation and legacy exposure cleanup**.
8. **PR-H — Durable exam attempt persistence**.
9. **PR-I — Correct mock evidence/result integration**.
10. **FI-003 Ready decision**, then REV implementation PR(s).
11. **PR-J — Dead runtime removal**.
12. **PR-K — System-level reconciliation acceptance gate + register closure**.

Each PR must rebase/revalidate against then-current `main`; the letters are sequencing labels, not permanent IDs.

## Open PR handling

Immediately after PR-A is approved:

- keep #561 frozen;
- inspect #552 for unique delta and close if fully superseded by main;
- fold #560 into the authority reconciliation rather than merging it unchanged;
- fold #539 into current-state cleanup;
- triage stale learner-design PRs (#441, #440, #432, #410, #408 and any similar branches) for unique still-valid content, then close or supersede deliberately;
- do not bulk-close Content Factory assurance/history PRs without a separate review.

## Product-release boundary during reconciliation

The existing site may remain available for internal/restricted testing, but this plan does **not** certify it as ready for broad learner acquisition.

Before broad external acquisition, at minimum the following must be true:

- no known-wrong learner-facing exam guidance;
- Learn coverage semantics are truthful;
- exact recommendation-to-activity routing works;
- full mock persistence is safe;
- mock evidence scope is correct;
- REV learner-facing claims match actual capability;
- the full reconciliation acceptance gate passes.

## Documentation impact

This plan is implementation guidance, not new product authority.

Where a reconciliation PR changes what Revision should do, update the numbered authority in that same PR. Where it only corrects implementation to existing authority, update code and relevant technical documentation. Current-state registers must be updated when their evidence changes. Historical audits remain unchanged.
