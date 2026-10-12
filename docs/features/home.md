# Returning Student Home — Home v3

**Status:** Live — PR #601 merged 2026-10-12, governed production deployment and smoke verified  
**Authority:** `10-product-governance/Returning Student Home Experience.md` v1.3, `20-brand-and-experience/Learner Design System.md` v1.0 and `REV Guidance and Conversation Pattern.md` v2.1.  
**Handoff:** Founder-selected Claude Home v3 frozen `v1791470408875449`. The prototype supplies visual intent but not a new production design system.

## What the returning Student sees

The ordered experience is a personal REV feature with one credible next activity and the full-width Ask REV question field; Today's Plan and upcoming mock/official exams; learner-wide Progress (Topics covered, Understanding, Exam readiness); active saved Courses; and quiet introductions to Learn, Practice, Exam Prep, Plan, Progress and Courses.

Plan and exams share a row only when the responsive shell gives enough room. On phone they stack in the same order. Home never adds a second site navigation tree, a second REV assistant or a new evidence/readiness score. The first-use/GJ-01 journey remains the owner of student signup and initial course choice.

## REV and Today's Plan

REV's four existing deterministic priority rules and Not now / Suggest something else state remain in `src/app/rev-suggestions.ts`. Home Start launches the suggested exact supported focused session. Exam-question tasks route to the saved course's Exam Prep without inventing paper identity.

Today is constructed using Plan's `createPlanDayBuilder`, so saved/done sessions and derived planner items have the same meanings on Home and Plan. A task is explicitly marked On today's plan only with a verified match: course/topic/activity for derived items, or an exact saved REV recommendation identity where session format is coarser. An unrelated row must not be shown as REV's pick. No completed count is inferred from suggestion or mere start.

Plan's own Manage Exams overlay handles Add/Edit dates, using a reloadable Plan navigation intent; Home has no date editing logic. Only real stored mock and public-exam records from active saved courses are shown.

## Progress and navigation

Home uses the same `progressMeasuresFor`, `readinessAcross`, `ProgressMeasures`, `SubjectBadge` and course identity filters as global Progress and Courses. There is no global blended readiness percentage or predicted grade. A card opens the saved course Overview. Activity introductions list only courses with the selected Learn/Practice/Exam Prep section and use a single keyboard-operable chooser (or a direct action for one eligible course).

Home Ask REV opens the shared contextual conversation and submits the typed question once using its existing question rules, safeguards and learner context. The Home hero has no inline artificial answer preview. Generic loading never impersonates REV Thinking.

## Data, accessibility and resilience

The three existing read groups—evidence, planner setup and accepted sessions—resolve independently, so a failure cannot wipe every Home section. When a Plan source is unavailable, Home does not claim zero sessions or schedule completion. Supported empty states include no course, no Plan, no exams, no evidence, no recommended task and a completed real plan.

The interface uses the canonical consolidated semantic tokens, Living E, typography, subject accents, light/dark themes, keyboard focus and reduced-motion contract, with no `--rv-*` compatibility tokens or page-local semantic status palette.

## Tests / release gate

Domain tests: `src/app/home-v3-model.test.ts`, navigation contract `src/app/navigation.test.ts`, existing REV/Plan/Progress unit and learner browser suites. The Founder explicitly approved the four Home v3 Light/Dark phone/desktop visual captures on 12 October 2026; only these four hashes were re-pinned (CI #38214052147, artifact `11732295608`). Final PR #601 head `e517b420ee3920df0797f2bc5376ccebb8a6aece` passed Revision CI #38251769839. After specific Founder approval and successful exact-head approval gate, merge commit `b405f52b21e61517e4ff16786b2513d93aef617b` passed production deployment #38254172559 and `revision/path-to-live = success`, establishing Live. The production smoke checks canonical React delivery and release integrity; controlled browser tests provide the learner-interaction evidence.

## Deliberate exclusions

No new database assessment kind/paper columns, new AI backend, changed planner scoring, new course evidence semantics, additional Admin dashboard, pricing or entitlement limitations. No retired historic prototype is rewritten as new evidence.
