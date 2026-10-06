# Revision Product Reconciliation Audit — 7 October 2026

**Status:** point-in-time audit  
**Baseline:** approved `main` at `ea74fc064eb5c3398807a97bb8c285d6ccbc87cd`  
**Production lineage:** `revision/path-to-live = success` on the baseline commit  
**Purpose:** establish whether the current learner product can deliver Revision's intended compounding learning loop, identify contradictions and duplicate responsibilities, and provide evidence for a controlled reconciliation before further learner-feature development.

## Scope and method

The canonical learner journey reviewed is:

`sign up → choose AQA A-level Business 7132 → Learn → Practice → feedback → Progress → Plan → REV explanation → Exam Prep → mock → evidence update → next recommendation`

For each stage this audit compares:

1. current product authority;
2. the canonical production runtime served from `src/main.tsx → FirstUseBoundary → PlannerRuntime`;
3. current learner/data services and the production-backed data contracts represented on `main`;
4. current automated browser/domain/database assurance; and
5. open PRs that overlap the same responsibilities.

This is primarily a repository/system audit. It uses existing browser-assurance evidence rather than claiming that a fresh signed-in production browser session was manually completed during this audit.

## Executive conclusion

Revision does **not** require a rebuild. The core architecture is recoverable and several important foundations are genuinely strong:

- exact learner-course membership;
- separate directional starting-check evidence;
- append-only scored learning evidence;
- owner-scoped production persistence;
- a deterministic adaptive planner;
- accepted learner-planned sessions;
- evidence-aware topic understanding/readiness;
- a strong current Practice loop;
- governed Course Truth / Exam Truth / Content Factory foundations.

The product is nevertheless **not yet coherent enough to continue broad feature development safely**.

The primary failure mode is not one broken feature. It is divergence between product authority, learner-facing claims, data semantics and overlapping implementations. In several places the interface implies one connected REV-led system while the runtime contains separate rule engines, partial memory, duplicated activity renderers or transitional exam implementations.

The correct response is reconciliation, not replacement.

## Journey reality matrix

| Journey stage | What should happen | Current reality on baseline | Data written/read | REV / Planner / Progress consequence | Verdict |
| --- | --- | --- | --- | --- | --- |
| Sign in / first use | New learner reaches a useful first activity without fake certainty | First-use boundary distinguishes new vs established accounts; new Student flow is resumable | `account_experience_state`, `student_first_use_events` | Starting context retained without contaminating learning evidence | **KEEP** |
| Choose AQA Business | Exact board / qualification / spec becomes programme truth | `learner_courses` stores exact course identity; catalogue resolves AQA A-level Business 7132 | course membership + course events | Planner and learner screens use active programme, not full catalogue | **KEEP** |
| Starting check | Weak directional signal improves first recommendation only | Separate `starting_check_evidence`; normal learning evidence starts only after useful revision | directional evidence + onboarding state | Does not create coverage/mastery/readiness | **KEEP** |
| Home recommendation | One coherent system decides the best next action and launches it directly | Home displays `rankSuggestions()` four-rule ranking while Plan uses the separate adaptive planner. Home then renders its own mini Practice surface for flashcards/MCQs | reads evidence, assessments, sessions; local Not-now in session storage | Home and Plan can legitimately prioritise different topics; visible Home suggestion does not normally carry a planner-item lifecycle link | **FIX** |
| Learn | Teach approved course content; record meaningful exposure only; REV can explain current material | Learn content and navigation work, but reading/finishing a Learn page writes no learner state. “Ask REV” only preloads text into the current limited REV panel | no durable Learn-exposure write | REV cannot know what Learn content was meaningfully reviewed; Progress coverage does not reflect Learn | **FIX** |
| Practice | Scored work produces structured evidence; feedback repairs weakness; retries add new evidence | MCQ, calculations and flashcards persist evidence; confidence and retry logic are real; written REV marking correctly remains switched off pending FI-007 | `learning_evidence` | Understanding/readiness and later recommendation can change | **KEEP core / FIX integration** |
| Feedback → repair | Feedback should lead directly to explanation/retry and then recalculate learner state | Practice has useful feedback and summary links, but site-wide weakness-repair is not a unified state machine and contextual REV cannot yet explain arbitrary content/feedback | evidence persists; some repair state is session-local | learner model updates, but repair journey can terminate at a local screen | **FIX** |
| Progress | Coverage, Understanding and Exam readiness remain separate and truthful | Understanding/readiness derive from evidence. “Topics covered” currently equals topics with any scored evidence | reads `learning_evidence` only | A learner can read a whole topic and remain “not covered”; answering one item can make it “covered” | **FIX — semantic defect** |
| Plan | Deterministic planner combines exams, time, evidence and preferences; Start opens exact work; completion reconciles automatically | Planner inputs and derived schedule are real. Start on a derived suggestion opens generic course overview. Accepted Practice session opens generic Practice section without its stored topic. Manual Done is separate from evidence reconciliation | assessments, availability, preferences, activity events, planned sessions, evidence | Plan priority is real but task execution/completion loop is incomplete | **FIX** |
| REV | Persistent contextual coach: suggest, answer, coach; use deterministic/data/content routes first and model only when needed | Current REV reads programme/evidence/planner and handles “today”, progress, exams, limited preference changes and fixed safeguarding. Other questions return “cannot answer yet”. Chat is not persisted. Screen context is not structured | reads planner/evidence; writes planning preference; no conversation store | cannot fulfil Learn “explain another way”, broader coaching or 12-month conversation decision | **FIX — but FI-003 is only To Do and must reach Ready before material implementation** |
| Exam Prep orientation | One canonical course-level place explains verified exam truth and leads to authentic practice | New course-level Exam Prep exists, but it mixes retained Content Factory mocks with legacy per-paper simulations. Some learner-facing exam guidance is deliberately `needs_check` | reads course content + evidence + exam dates | topic coverage chips inherit current coverage semantic defect | **FIX / DECIDE** |
| Mock attempt | Safe timed/untimed attempt survives refresh, records exact question/paper state and produces trusted evidence | Current `ExamSimulator` keeps in-progress answers/timer/flags in React memory. No server draft/attempt store. Current baseline can lose a long attempt on refresh/closure | evidence only at saved result stage | incomplete attempts are invisible to durable learner state | **FIX** |
| Mock evidence | Per-question evidence informs topics; whole-paper evidence informs exam readiness without corrupting a topic | Per-question self-assessed evidence is topic mapped. Whole `exam_attempt` is assigned to the first question's topic | `learning_evidence` | whole-paper simulation can distort one arbitrary topic's knowledge/readiness | **FIX — evidence defect** |
| Next recommendation | New evidence should produce one consistent next priority everywhere | Course recommendation, Home ranking, adaptive planner and Progress action use related but distinct ranking paths | all read overlapping evidence | Home, Plan, Progress and REV can disagree about “what next” | **FIX — unify priority contract** |

## Findings by classification

### KEEP — sound foundations

**RPR-K01 — Course identity and first-use boundary.**  
Exact learner course membership and the first-use flow preserve the right distinction between programme context, directional starting evidence and ordinary learning evidence. Existing browser assurance proves the synthetic end-to-end first-use journey and persistence boundaries.

**RPR-K02 — Learning-evidence spine.**  
`learning_evidence` and the evidence schemas provide a useful typed spine for recall, application, exam-question and simulation evidence. Learner evidence is separated from planning context and starting-check evidence.

**RPR-K03 — Understanding/readiness engines.**  
The current topic-knowledge and readiness engines are cautious, evidence-family aware and do not create a readiness result from mere page completion. They should be retained and improved through evidence semantics rather than replaced.

**RPR-K04 — Practice v2 core.**  
MCQ, calculation, flashcard, confidence, retry and feedback behaviour is the strongest complete learner loop on the site. Written assisted marking remains correctly fail-closed.

**RPR-K05 — Planner foundation.**  
Assessments, seven-day availability, exceptions, bounded preferences and accepted sessions form a credible deterministic planning base. The defect is execution/reconciliation and priority consistency, not the existence of the planner.

**RPR-K06 — Content Factory / retained mock assets.**  
The retained AQA 7132 mock assets and Content Factory provenance should be the long-term exam-content source. Reconciliation should remove competing runtime material, not recreate the content pipeline.

### FIX — architecture is sound, implementation contract is incomplete or wrong

**RPR-F01 — Topics covered has the wrong implementation semantics.**  
Authority defines Topics covered / Reviewed as meaningful content encounter. Runtime currently implements it as “topic has at least one answer”. Learn pages create no coverage state. This must be corrected without turning Learn completion into mastery/readiness.

**RPR-F02 — Home and Plan have competing recommendation engines.**  
Home uses `rev-suggestions.ts`; Plan uses `planner-model.ts` / the planning engine. Progress and course recommendation add further selection logic. One deterministic priority contract must serve all surfaces, with surface-specific presentation rather than separate truth.

**RPR-F03 — Home duplicates Practice.**  
`HomeFocusedActivity` renders its own one-card / one-question evidence experience. This bypasses the richer current Practice session/feedback system and makes Home a second Practice implementation. Home should launch the canonical exact activity instead.

**RPR-F04 — Plan does not launch exact work.**  
Derived Plan suggestions know course, topic and activity but Start opens generic course overview. Accepted Practice sessions store a topic but Start opens generic Practice. The canonical activity route must carry the exact topic/activity/paper identity.

**RPR-F05 — Planned-session completion is not reconciled from real activity.**  
Accepted sessions can be marked Done manually while evidence completion is tracked separately. Recommendation activity events have a best-effort reconciler, but accepted-session status is not automatically reconciled from the exact completed activity.

**RPR-F06 — REV capability is materially below its learner-facing promise.**  
Current deterministic/data answers are useful and should be retained as a cheap first tier, but they are not the approved full contextual tutor. The interface says “Ask REV anything” and Learn offers explanation requests that the runtime cannot fulfil.

**RPR-F07 — REV lacks structured current-screen context and durable conversation state.**  
Learn currently passes a draft sentence through session storage rather than a structured course/topic/page/activity context. Chat state disappears on close despite the Founder-approved 12-month conversation direction.

**RPR-F08 — Exam Prep has duplicate content/runtime responsibility.**  
Course-level Exam Prep aggregates the retained Content Factory mock and legacy `paper.listExams()` simulations. Module/component Exam Prep still exposes the older `FocusedLearningWorkspace + ExamSimulator` path. One canonical course-level Exam Prep/mock responsibility is required.

**RPR-F09 — In-progress mocks are not durably safe.**  
Current timed answers, choices, flags and timer state are in page memory. A long attempt needs a server-owned attempt/draft lifecycle before Revision can invite real students to rely on full mocks.

**RPR-F10 — Whole-paper evidence is attributed to an arbitrary topic.**  
`ExamSimulator` stores `exam_attempt.topicId` as the first question's topic. Whole-paper simulation evidence must be represented at paper/course scope, while question evidence supplies topic-level signals.

**RPR-F11 — “Practise untimed” is not consistently what its label says.**  
On legacy mocks, `autoStart="untimed"` enters single-question practice rather than an untimed whole mock. Retained pilot mocks disable it. Canonical Exam Prep must define and implement one truthful meaning.

**RPR-F12 — Important learner choices are browser-local.**  
Home “Not now” is session storage even though the product model says meaningful choices should improve future guidance. It should become bounded planning/context data, not mastery evidence.

**RPR-F13 — Current-state documentation/registers are stale.**  
The Assurance Coverage Register still describes a 27 September candidate baseline. The Defect Register still carries Recovery 5 open while later release evidence is green and a stale closure PR remains open. Current-state sources must be reconciled before they can coordinate multiple agents safely.

**RPR-F14 — No end-to-end compounding-loop assurance exists.**  
There are strong slice tests, but no repeatable journey proves: exact course → Learn exposure → Practice evidence → Progress semantics → Plan change → contextual REV explanation → mock persistence/evidence → next recommendation.

### REMOVE — duplicate, obsolete or misleading implementation after replacement is proven

**RPR-R01 — Legacy monolithic learner runtime.**  
`src/main.tsx` serves `PlannerRuntime`, while `src/app/App.tsx` still contains an older parallel learner/recommendation/exam implementation. Once dependency/search assurance proves it is unreachable, remove it and related dead compatibility code rather than maintaining two conceptual apps.

**RPR-R02 — Bespoke Home activity renderer.**  
After exact activity routing exists, remove `HomeFocusedActivity` and launch the canonical Practice/Exam Prep activity from Home.

**RPR-R03 — Legacy AQA per-paper mock simulations from canonical course Exam Prep.**  
Once retained Content Factory mocks have the complete safe runtime, remove competing legacy simulation rows from the learner-facing mock list. Historical source may remain only where required for provenance/tests until deliberately retired.

**RPR-R04 — Duplicate component-level Exam Prep responsibility for a shared-learning course.**  
For AQA 7132 the learner should have one canonical Exam Prep route. Component compatibility links should redirect to or narrow the canonical course experience rather than expose a second simulator product.

**RPR-R05 — Stale overlapping learner-design PRs.**  
Old design PRs that target superseded surfaces should be closed after a final unique-delta check rather than continually rebased into the reconciled runtime.

### DECIDE — Founder decision is genuinely required

**RPR-D01 — May unverified exam advice be shown to students?**  
Current main displays `needs_check` guidance with “Being checked”, including a statement whose own source says it is likely wrong (“Answer every question” for a paper with one-from-two essay choices). A 6 October Founder instruction asked to keep useful unapproved items visible but flagged. That conflicts with the stronger product-integrity recommendation from this audit.

**Recommendation:** keep unverified items in the review inventory/Admin evidence, but do **not** show them to learners until approved. Known-wrong wording should never be learner-facing. This is an authority change and must not be applied silently.

**RPR-D02 — Permanent multi-AI operating model.**  
The current repo assumes AI tools can be interchanged through repository state. Current drift shows the handover discipline has not been sufficient for overlapping implementation.

**Recommendation:** during reconciliation use one execution owner, with other AI tools restricted to independent review. If this becomes the permanent model, update AI/workflow authority in a separate Founder-approved governance change.

The exact REV model/provider is **not** treated as a decision needed to begin reconciliation. FI-003 should first reach a full Definition of Ready with provider-neutral architecture/evaluation criteria; provider selection then follows evidence.

## Assurance reality

The current Assurance Coverage Register already acknowledges two of the largest gaps:

- **JRN-03 Learn = Partial** because a complete Learn interaction is not proved.
- **JRN-05 Exam Prep = only navigation/start covered**; full save/result lifecycle remains unproved.

Existing browser tests give strong evidence for:

- new-student onboarding;
- exact course persistence;
- first useful activity;
- Practice evidence creation;
- responsive navigation;
- Progress reconstruction from evidence;
- Plan setup and deterministic planning slices;
- accessibility/horizontal-scroll constraints.

They do not prove the complete compounding product loop.

A new system-level journey must become a release gate before reconciliation is declared complete.

## Open PR disposition at audit time

### Learner/runtime PRs

- **#561 — FREEZE / DO NOT MERGE.** It introduces another mock runtime and browser-only autosave while explicitly leaving the old paper simulator alive. Reuse good UI work later, but rebuild/rebase only after the canonical exam-attempt and route contract is fixed.
- **#560 — FOLD INTO AUTHORITY RECONCILIATION.** It records the already-implemented Exam Prep navigation decision, but current authority and implementation must be reconciled together rather than merging a stale isolated doc branch.
- **#552 — CANDIDATE SUPERSEDED.** Current main already contains the retained AQA 7132 mock adapter and course-level integration. Verify no unique required delta, then close rather than resurrecting the branch.
- **#539 — FOLD INTO CURRENT-STATE CLEANUP.** Recovery evidence should be reflected in the live registers from current main; do not carry a stale register-only PR indefinitely.
- **#441, #440, #432, #410, #408 — CANDIDATE STALE/SUPERSEDED.** Review for any unique still-valid decision/evidence, preserve history where required, then close instead of reconciling obsolete learner surfaces.

### Content Factory PRs

Content-only/research/assurance work is a separate workstream and is not automatically invalidated by this product reconciliation. It may continue only where it does not modify or assume the learner runtime. Learner-facing integration waits for the reconciled contracts.

### Older governance/backlog PRs

Do not bulk-close them solely because they are old. They require a separate unique-delta/current-authority check. Age is evidence of repository hygiene debt, not proof of invalidity.

## Product fitness judgement

| Dimension | Audit judgement |
| --- | --- |
| Core architecture | **Fit to retain** |
| Evidence foundation | **Fit to retain with semantic corrections** |
| Practice core | **Fit to retain** |
| Planner foundation | **Fit to retain** |
| Learn → learner memory | **Not fit yet** |
| REV promised capability | **Not fit yet** |
| Plan → exact activity → completion | **Not fit yet** |
| Full mock reliability | **Not fit yet** |
| Whole-product coherence | **Below release standard** |
| Need to restart | **No** |
| Continue broad feature development before reconciliation | **No** |

## Documentation impact

This audit changes no product authority and no learner behaviour. It is historical evidence of the 7 October 2026 baseline.

The corrective programme must update normative authority when product behaviour is changed, technical documentation when implementation changes, and current-state registers when assurance/defect state changes. Historical evidence must remain unchanged.
