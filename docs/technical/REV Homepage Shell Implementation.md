# REV Homepage Shell Implementation

**Status:** current implementation description  
**Updated:** 2026-08-21

## Purpose

Describe the governed React learner shell at `/app/`, including the REV-led Home, persistent contextual Ask REV access, adaptive Plan, catalogue-driven subject/course hierarchy, course-level shared learning, paper-specific Exam Prep and evidence-aware guidance.

## Canonical learner route and runtime

The governed learner product is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the canonical signed-in global learner shell and responsive navigation. It renders Home, Plan and the full REV workspace directly and delegates catalogue, subject, course/component, Progress and Admin content to `src/app/App.tsx` where required. When `App` is nested inside `PlannerRuntime`, its older embedded global navigation is suppressed so only one learner-wide navigation surface is presented.

The repository root `/revision/` remains a lightweight redirect into `/revision/app/` until a future public marketing/editorial site is introduced. GitHub Pages publishes the built Vite `dist/` artifact.

## Global learner navigation and Ask REV

Normative navigation authority is `10-product-governance/Global Learner Navigation.md`.

The learner-wide destinations are:

1. Home
2. Plan
3. Progress
4. Subjects

REV is a persistent global action rather than a peer destination that must be visited before a learner can ask for help.

### Desktop

Desktop uses a persistent left navigation rail. It contains:

- REV identity;
- a prominent **Ask REV** action;
- Home;
- Plan;
- Progress;
- Subjects; and
- the learner account area with Profile and Settings access at the bottom.

Selecting Ask REV opens a right-hand contextual conversation panel without replacing the current learner screen. The panel reuses `PlannerRevScreen` and can expand into the full `#/rev` workspace when a longer conversation benefits from more space.

The full `#/rev` route remains supported as the expanded REV workspace and compatibility destination. It is not part of the ordinary desktop primary navigation.

### Tablet and mobile

Widths up to 960px retain the persistent five-position bottom bar:

**Home | Plan | REV | Progress | Subjects**

The centre REV control is an **Ask REV action**, not a peer navigation destination. Selecting it opens a full-screen/near-full-screen contextual conversation layer. The Revision wordmark and account/burger control remain at the top.

The bottom-bar structure and ordering remain stable across learner screens. The REV centre action uses the Living E presence and receives restrained branded prominence without obscuring the other destinations.

## Home composition

Home remains the default signed-in destination and deliberately avoids a dense dashboard.

The first viewport is a calm REV-led composition:

1. Living E presence;
2. personalised `Hey {name}, what shall we do today?` greeting;
3. large `Ask REV anything…` input; then
4. the current REV recommendation and Today's plan.

The Home input and persistent Ask REV control intentionally coexist:

- the global action means REV is available from any learner screen;
- the Home input makes Home a natural place to start a conversation.

Submitting the Home input stores the draft in session storage and opens the contextual Ask REV layer. The prior helper line `REV is ready when you are` and the older feature-grid / wider-workspace marketing-style sections are not part of the current Home composition.

The recommendation card remains evidence/planner driven. It exposes the current top recommendation, the reason in plain language, a direct start action and a `Why this?` route into REV. Today's plan shows up to three current planner activities with direct start affordances and a route to the full Plan.

## Theme behaviour

Light and dark mode use the same information architecture and component hierarchy.

Theme roles come from `src/app/brand-tokens.css` and follow the approved Calm Teal system. Desktop rail, Home surfaces, contextual REV panel and mobile bottom navigation use role-based theme tokens rather than a separate dark visual language.

Dark mode uses the approved deep-teal surface hierarchy and does not introduce neon or sci-fi styling. The Living E may retain its governed soft halo; ordinary navigation items do not borrow it.

## Learner hierarchy

Subject Home groups published material by course/specification.

The shell distinguishes two academic shapes.

### Shared-syllabus course

When several paper/component packs expose the same learning content, Revision presents one course-level learning scope:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

Learn, general Practice and course/topic Progress appear once. Exam Prep contains the individual papers/components and their paper-specific written-question and timed/full-paper practice.

### Distinct-content component

If components genuinely expose different syllabus content, each component can retain its own Overview / Learn / Practice / Exam Prep / Progress context.

This behaviour implements `10-product-governance/Course Content and Assessment Component Placement.md`; storage boundaries do not determine the learner hierarchy.

## Catalogue and shared-learning detection

`src/engine/content/content-registry.ts` discovers validated `content/**/index.ts` packs using Vite `import.meta.glob`. Only `available` packs enter the current pilot catalogue.

`src/app/catalogue-model.ts` groups packs into subjects and courses using awarding body, qualification and specification identity.

For each course it compares the validated learning payload represented by:

- topics;
- formulas;
- topic links;
- flashcards;
- quick-check questions;
- case/application material; and
- quantitative/data drills.

Exam simulations and exam-technique records are not used to decide whether the underlying syllabus is shared.

If all current course packs have the same learning payload, the course is treated as a shared-learning course. A course with one published component is also presented at course level because the component pack does not make its syllabus component-owned by itself.

This inference is generic and contains no Business-specific route branch.

## Routes

GitHub Pages does not provide arbitrary SPA rewrites, so the learner hierarchy uses reloadable hash routes.

Course-level shared learning uses:

`#/subjects/:subjectId/courses/:courseId/:section`

For example:

- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/overview`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/learn`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/practice`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/exam-prep`
- `#/subjects/business/courses/aqa%3Aaqa-a-level%3A7132/progress`

Component routes remain available for genuinely distinct content:

`#/subjects/:subjectId/modules/:moduleId/:section`

Recent module URLs are preserved for compatibility. If such a module belongs to a shared-learning course, the screen resolves to that course-level experience rather than exposing a duplicate syllabus.

`#/rev` remains the expanded REV workspace route. Ordinary Ask REV access does not require a route change.

## REV and evidence behaviour

The learner shell still loads evidence by the existing persisted `module_id` because paper/component IDs remain useful for provenance and exam attempts.

For a shared-learning course, `createCourseLearningState`:

1. gathers evidence recorded under every published paper/component module ID in the course;
2. normalises those records to the course's canonical learning adapter for the readiness/recommendation calculation;
3. counts topic coverage once; and
4. returns one course-level recommendation/readiness state.

Global Progress and REV use these course-level states. Paper-specific exam attempts remain attributable to their paper module and feed back into the combined course evidence picture.

The contextual Ask REV layer receives the current product context by remaining mounted above the current learner screen rather than forcing navigation away. Existing planner/evidence context continues to be loaded by `PlannerRevScreen`. More granular activity-context handoff can be added as individual contextual screens expose richer context contracts; the global interaction pattern no longer blocks that evolution.

## Focused learning capabilities

`src/app/FocusedLearningWorkspace.tsx` remains adapter-driven.

### Learn

Course-level Learn presents shared topic explanations and topic links.

### Practice

For a shared-syllabus course, general Practice includes:

- flashcards;
- quick checks;
- guided case/application practice; and
- formulas/data drills.

Paper-specific written exam questions are intentionally excluded from general course Practice.

### Exam Prep

Exam Prep contains:

- shared exam technique where appropriate; and
- a paper/component selector.

Each published paper expands to expose its own `ExamSimulator`. The simulator supports both targeted single-question written practice with self-assessed AO evidence and the full timed simulation.

### Progress

Shared course Progress aggregates course/topic evidence once across paper module IDs. It does not multiply topic totals by the number of exam papers.

## Pilot catalogue boundary

There is still no persisted per-user course enrolment model. During the Jamie pilot all `available` packs are discoverable; `preview` and `planned` packs remain hidden.

Future enrolment should filter the published course catalogue rather than reintroducing subject-specific or paper-specific routing logic.

## Key implementation files

- `src/app/PlannerRuntime.tsx` — canonical signed-in shell, desktop rail, mobile/tablet bottom navigation, account utilities and contextual Ask REV layer.
- `src/app/PlannerHomeScreen.tsx` — calm REV-led Home hero, planner recommendation and Today's plan.
- `src/app/planner-runtime.css` — canonical shell/Home/Ask REV responsive layout and light/dark theme treatment.
- `src/app/brand-tokens.css` — canonical Calm Teal theme roles.
- `src/app/PlannerRevScreen.tsx` — shared REV planning conversation used by the contextual panel and full workspace.
- `src/app/App.tsx` — catalogue, Subject Home, course/component rendering, Progress and supporting compatibility shell implementation when nested.
- `src/app/catalogue-model.ts` — course grouping, shared-learning detection and course learning state.
- `src/app/navigation.ts` — global, course and component hash routes.
- `src/app/FocusedLearningWorkspace.tsx` — shared Learn/Practice and exam-technique activities.
- `src/app/ExamSimulator.tsx` — targeted question and timed paper practice.
- `tests/e2e/app-responsive.spec.ts` — responsive hierarchy, persistent Ask REV and global navigation assurance.

## Compatibility and competing surfaces

The canonical learner shell is `PlannerRuntime` on `/revision/app/`.

The older global navigation markup inside nested `App` is compatibility implementation only and is suppressed when `App` is hosted by `PlannerRuntime`. It must not be treated as the learner-wide source of truth merely because it still exists in code.

The full REV route is an expanded workspace/compatibility destination. The persistent contextual Ask REV action is the ordinary learner access pattern.

## Deployment and smoke evidence

GitHub Pages publishes the Vite `dist/` artifact. A production smoke for this change should verify on `/revision/app/`:

- desktop shows the left rail with Ask REV, Home, Plan, Progress, Subjects, Profile and Settings;
- desktop Ask REV opens a contextual right-hand panel without changing the current route;
- tablet/mobile retain the five-position bottom bar and centre REV action;
- Home contains the Living E, greeting, Ask REV field, recommendation and Today's plan without the removed helper/feature-grid content;
- light and dark themes preserve the same hierarchy and remain readable; and
- the subject/course hierarchy and focused learning routes remain reachable.

## Documentation and decision record

Normative navigation authority is `10-product-governance/Global Learner Navigation.md`, supported by `10-product-governance/Information Architecture.md` and `20-brand-and-experience/Visual Brand System.md`.

Normative placement authority remains `10-product-governance/Course Content and Assessment Component Placement.md`.

Architecture decision history for course-level learning remains `decisions/ADR-0012-course-level-learning-and-exam-paper-placement.md`.

Historical content assurance records are unchanged because this implementation changes learner navigation and composition rather than educational material.
