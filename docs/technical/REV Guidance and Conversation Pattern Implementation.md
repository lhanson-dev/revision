# REV Guidance and Conversation Pattern Implementation

**Status:** current implementation description for the Course Overview pattern; Home follow-up tracked separately  
**Updated:** 2026-09-22

## Purpose

Describe how the Founder-approved `REV Guidance and Conversation Pattern` is implemented in the canonical learner runtime.

Normative authority is `20-brand-and-experience/REV Guidance and Conversation Pattern.md` together with `10-product-governance/Course Overview Progress Signals.md`, the existing Visual Brand System, Identity Asset Usage Rules, Global Learner Navigation and screen-specific product authorities.

## Canonical runtime

Learner runtime:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime`

Course Overview route family:

`/revision/app/#/courses/:courseId/overview` → `CourseExperienceScreen`

Contextual Ask REV remains owned by `PlannerRuntime`. The Course Overview input does not create a new conversation implementation.

## Course Overview implementation

`CourseExperienceScreen` treats the REV feature area as one coherent decision surface with two learner paths and a separate progress context.

### REV leads

The surface shows:

- feature-scale canonical `RevPresence` / Living E in Resting state;
- the governed `PoweredByRev` compact identity component;
- the existing deterministic course recommendation;
- an activity-explicit recommendation heading, for example `Let's refresh Marketing with flashcards` or `Let's practise Marketing with a quick check`;
- a concise plain-language reason that explains why REV selected that activity type from the available evidence; and
- the existing direct start action into Practice or Exam Prep according to the recommendation.

The recommendation logic remains owned by the existing readiness/recommendation engine. Topic Knowledge does not replace or silently alter that recommendation algorithm.

Course Overview deliberately does not render the engine's generic recommendation `limitation` sentence or a separate `Why this?` button. The recommendation itself must carry the useful explanation in plain language. The engine may retain its structured reason, evidence summary and limitation fields for other product/trust uses; removing the redundant visual controls does not remove those underlying truth safeguards.

The learner-facing explanation maps the deterministic recommendation to the educational reason for the format:

- **Flashcards** — check or strengthen underlying recall when recall is missing or is the weaker supported evidence family;
- **Quick check** — establish or strengthen application evidence where application is missing or weaker than recall; and
- **Exam question** — test transfer into exam-style performance once earlier evidence supports moving into that demand.

### Progress context

On desktop, a distinct right-hand progress panel sits alongside the recommendation. It shows:

- **next public exam date + countdown** at the top of the panel when a truthful learner assessment date is available;
- **Exam Readiness** — the existing readiness result, using `Building` until the governed readiness evidence threshold is met; and
- **Topic Knowledge** — a distribution of the same per-topic `Low / Medium / Good / Not enough evidence` states used by the Course Overview topic list.

The progress panel is deliberately secondary to the recommendation. It is separated visually by a restrained divider rather than being presented as a competing hero card.

Exam date context is read from the learner's existing `revision_assessments` planner data through `src/services/planning/course-exam-date-service.ts`. The Course Overview query is deliberately narrow: active, upcoming `public_exam` assessments only.

The next exam is associated to the current course using the strongest available identity in this order:

1. explicit `courseId` match;
2. explicit `moduleId` match where that module belongs to the course; or
3. subject-only legacy assessment data only when the learner has exactly one active course for that subject, so the match is unambiguous.

The first matching upcoming assessment is shown because the query is ordered by assessment date. If no truthful date is available, the panel says `Not set yet` and points the learner to Plan rather than fabricating a date. A read failure is shown as `Unavailable` rather than silently presenting stale or invented information.

The countdown is derived in the browser from the saved assessment date and the learner's current local calendar day, using plain copy such as `45 days to go`, `1 day to go`, or `Today`.

On tablet and phone the same progress context stacks below the recommendation and above the conversation route.

### The student leads

A visually separated `Got something else on your mind?` row provides an `Ask REV anything…` input.

Submitting the input calls the existing `PlannerRuntime.openRev(draft)` path. That method stores the draft in the existing `revision:rev-draft` session handoff and opens the governed contextual REV drawer. `PlannerRevScreen` consumes that draft through its existing contract.

This means the Course Overview field uses the same conversation layer, programme context and REV implementation as the persistent Ask REV control.

## Topic Knowledge v1

Topic Knowledge is implemented as a separate deterministic engine at:

`src/engine/knowledge/topic-knowledge.ts`

It is intentionally distinct from Exam Readiness. The learner-facing question is: **How well does the available performance evidence say I currently know and can use this topic?**

### Evidence input

The v1 engine consumes existing scored `LearningEvidence` only. Learn views, time spent, navigation and other passive activity do not enter the calculation.

For each topic, the engine:

1. filters to the requested module/topic and evidence items that produce a valid 0–100 percentage;
2. keeps only the latest usable result for each `contentId`, preventing repeated attempts of one content item from inflating breadth;
3. requires at least six distinct scored content items;
4. requires at least two evidence families and at least one family beyond recall/flashcards;
5. calculates a mean within each represented evidence family; and
6. averages the family means equally so a high volume of one activity family cannot dominate the judgement.

If the sufficiency gate is not met, the learner-facing state is **Not enough evidence**.

### First-pass bands

For sufficient evidence, the first calibration is:

- **Low** — score below 50;
- **Medium** — score from 50 to 74; and
- **Good** — score 75 or above.

These values are implementation calibration seeds, not exam grade boundaries and not permanent product constants. They may be recalibrated later provided the governed Topic Knowledge meaning and evidence safeguards remain intact.

### Course/subject roll-up

`ModuleLearningState` now carries a deterministic Topic Knowledge summary. The Course Overview presents a transparent distribution such as:

`6 Good · 3 Medium · 1 Low`

Topics without sufficient evidence remain visible rather than being silently excluded. No aggregate subject knowledge percentage is manufactured.

The Course Overview topic cards also show the same plain-language Topic Knowledge state so the summary and topic-level view cannot drift into competing measures.

### Known v1 limitation

The existing learner evidence schema records `moduleId`, `topicId`, `contentId`, source, timestamp and performance, but it does not carry the Content Factory's atomic curriculum-obligation IDs into retained learner evidence.

Accordingly, v1 breadth is based on distinct scored content items plus evidence-family diversity, not exact obligation-by-obligation learner coverage. A `Good` state must not be represented as proof that every curriculum requirement has been mastered or completed.

The stronger future model is to preserve governed knowledge/obligation lineage through learner activities and retained evidence so breadth can be judged directly against exact topic requirements.

No database migration is required for v1.

## Visual treatment

`src/app/course-overview-rev-feature.css` is a bounded fidelity layer loaded after the existing Home fidelity styles.

It deliberately reuses the established Home REV language:

- Deep Teal feature surface;
- feature-scale three-bar Living E;
- visible near-white/aqua halo core with restrained teal falloff;
- existing semantic Resting motion from `living-e.css`;
- governed `Powered by REV` treatment from `RevCompactWordmark.tsx` / Home fidelity styling;
- Primary Teal action treatment; and
- responsive Light/Dark-compatible role tokens.

The Course Overview does not copy Home's exact scale or composition. Home remains the larger learner-wide feature moment; Course Overview uses the same identity grammar at a smaller course-scoped scale.

## Responsive behaviour

Desktop uses:

`Living E | REV recommendation | exam date + progress panel`

followed by the full-width conversation route.

Tablet keeps Living E and recommendation together and moves the exam/progress panel below them.

Phone stacks the semantic order:

`Living E / Powered by REV → recommendation + reason + action → exam date + Exam Readiness + Topic Knowledge → Ask REV`

The persistent tablet/mobile Ask REV dock remains unchanged. The inline field is contextual to the decision surface rather than a second persistent action.

## Assurance

Deterministic Topic Knowledge unit assurance covers:

- insufficient evidence;
- Low / Medium / Good calibration boundaries;
- distinct-content deduplication;
- recall-only evidence failing the sufficiency gate;
- unusable/unscored evidence not increasing breadth;
- newer contradictory evidence moving a topic down; and
- course/subject distribution roll-up including insufficient-evidence topics.

The Course Overview browser assurance checks:

- feature-scale Living E presence;
- governed `Powered by REV` attribution;
- activity-explicit recommendation wording and a visible plain-language reason;
- absence of the retired `Why this?` control and redundant generic limitation sentence;
- next public exam date and a live countdown when truthful course-linked assessment data is available;
- the separate progress panel;
- Exam Readiness and Topic Knowledge labels;
- the truthful `Not enough evidence` empty state;
- desktop right-hand placement where desktop layout applies;
- `Got something else on your mind?` conversation route;
- draft handoff into the existing contextual Ask REV drawer; and
- existing Exam Prep dark-surface behaviour after the interaction.

Existing typecheck, lint, unit/build, accessibility, responsive browser, theme, identity and visual-regression assurance remain applicable.

## Measurement boundary

The deterministic state exposes the Topic Knowledge distribution and insufficient-evidence count needed for product measurement and assurance. This slice does not introduce a new analytics platform or duplicate event pipeline.

Recommendation-start and Ask REV usage remain on their existing interaction paths. Wider product analytics instrumentation is deliberately separate from this bounded Course Overview implementation and must not change the truth semantics of Topic Knowledge.

## Home follow-up boundary

The same normative pattern is approved for Returning Student Home with learner-wide recommendation scope. That implementation is deliberately not included in this Course Overview implementation and is tracked in Issue #365 so the PR remains bounded.

Until Issue #365 is implemented and released, the current Home implementation remains the live technical truth even though the normative authority defines the intended next refinement.

## Wider header rollout boundary

This implementation does not roll the compact conversation strip across every primary learner page. That wider rollout remains a separate bounded step under Issue #367 so Learn, Practice, Exam Prep and Progress do not become visually identical REV heroes.

## Documentation impact

This document records the current Course Overview implementation, Topic Knowledge v1 mechanics, recommendation-explanation fidelity, exam-date context, responsive hierarchy and accepted evidence-lineage limitation. It does not rewrite historical GJ-03 evidence or prior Home implementation records.

No normative authority change is required for the recommendation/exam-date fidelity correction: existing authority already requires REV to explain its recommendation credibly and the Course Overview blueprint already calls for upcoming assessment date/context where available. Historical design and proof evidence remain unchanged.

The active product/experience authority remains the source of what should be true. If future calibration changes Topic Knowledge thresholds without changing its governed meaning, this implementation record and assurance must be updated with the new current mechanics.
