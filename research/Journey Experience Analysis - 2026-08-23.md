# Journey Experience Analysis — 23 August 2026

**Status:** Analysis / implementation input — not normative authority  
**Baseline:** current approved `main` at `31d844a9ec0a699e4de35af7cb6cbb7ff9ee0530`  
**Purpose:** Translate the current user-journey authority into a practical screen-priority model for the journey-led content/design review programme.

## Executive conclusion

The highest-value design problem is not "make every page look better". It is to make each important journey feel obvious, fast and continuous.

The review should optimise for three questions a learner should answer within seconds:

1. **Where am I?**
2. **What matters here?**
3. **What useful thing can I do next?**

The design system should make Revision coherent, but the screen composition should change with the job. A Home launchpad, a Learn reading workspace, a Practice task, a Progress interpretation view and an Exam Simulator should not collapse into the same visual template.

## Priority model

### Priority A — core learner value loop

These journeys directly determine whether Revision feels useful:

1. new learner → first useful action;
2. returning learner → Home → recommended action;
3. Courses → selected course → revision mode;
4. Learn → Practice → feedback;
5. Plan → activity;
6. Progress → insight → action;
7. Exam Prep → Exam Simulator → result/next action; and
8. Ask REV across the above journeys.

### Priority B — enabling / commercial journeys

9. Account / Settings / Subscription.
10. Parent / supporter.

### Priority C — operational journeys

11. Admin / operational surfaces.

The foundation cleanup remains programme Task 1 and precedes broad production redesign. This analysis can be completed in parallel because it does not change production behaviour.

## Experience archetypes

Use these as compositional starting points, not rigid templates.

| Surface | Dominant archetype | What should dominate | What to avoid |
| --- | --- | --- | --- |
| Home | Conversational launchpad | orientation, one useful recommendation, start action, REV | dashboard of equal cards/metrics |
| Courses | Programme selector | learner's saved courses, Add Course, direct entry | catalogue complexity before saved courses |
| Course Overview | Course launchpad | orientation + clear Learn/Practice/Exam Prep/Progress choices | repeating global dashboard information |
| Learn | Reading / explanation canvas | content comprehension and contextual help | nested card chrome and competing controls |
| Practice | Task workspace | question/task, response, feedback | activity-picker dominance |
| Feedback | Interpretation + next action | what happened, why, what next | score-only endpoint |
| Plan | Decision / commitment workspace | what to revise and when, clear executable plan | planning controls without a start path |
| Progress | Evidence narrative | what is strong/weak/uncertain and what to do next | analytics dashboard requiring interpretation |
| Exam Prep | Performance preparation hub | readiness, targeted practice, exam action | generic learning-card repetition |
| Exam Simulator | Focus workspace | exam content, time/control state | global distractions/tutor controls during timed work |
| REV | Contextual conversation | current context, useful explanation/recommendation | separate chatbot detached from task |
| Account / Settings | Compact utility workspace | identity/preferences/account action | full product-dashboard treatment |
| Parent / supporter | Reassurance summary | engagement/progress/support signal | learner surveillance detail |
| Admin | Operational console | status, exceptions, actions, evidence | learner-style low-density cards everywhere |

## Journey 1 — New learner → first useful action

### User intent
Get Revision set up quickly enough to start useful revision without having to understand the whole product.

### Design risk
The biggest failure would be over-configuration: asking the learner to complete a long profile/setup flow before they experience value.

### Screen-purpose matrix

| Screen/state | Screen job | Immediate understanding | Primary CTA | Secondary actions | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- |
| Sign in / create account | establish identity with minimum friction | "I can get into Revision quickly" | Create account / Continue | Sign in / recovery | none or very restrained | authenticated learner enters programme setup/Home |
| Courses empty state | explain that Revision needs the learner's actual course set | "Add the course I study" | **Add Course** | minimal explanation | may explain why course context matters | course selector opens |
| Add Course | identify a supported exact course | "Choose subject/level/board/specification" | **Add course** once identity is unambiguous | search/back/cancel | may help explain course differences but should not silently add | course is saved |
| First course confirmation / course entry | confirm successful setup and move toward value | "Revision knows what I study" | **Start revising** / equivalent direct useful action | Add another course | can recommend the fastest useful starting point | learner enters first useful learning/practice action |
| First useful activity | generate value/evidence without overclaiming proficiency | "Do this short useful task" | **Start / Answer / Continue** | Ask REV | explain task/context | completed work produces feedback/next action |

### Important boundary
If an initial diagnostic/baseline check is governed and available, it should be short and framed as helping Revision choose a starting point. It must not become a long gate before value and must not imply mastery from sparse evidence.

## Journey 2 — Returning learner → Home → useful action

### User intent
Open Revision and immediately know what deserves attention and how to start.

### Home screen job
**Home is not a dashboard. It is the fastest route from "I should revise" to "I am revising".**

### Screen-purpose matrix

| Screen/state | Screen job | Immediate understanding | Primary CTA | Secondary actions | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- |
| Home | orient across active courses and recommend one useful next action | "This is what I should do next and why" | **Start recommended work** | Ask REV, Courses, Plan | prominent; explain/reason across learner evidence | chosen course/activity opens directly |
| Recommendation explanation | provide enough confidence to act | "Why this is worth my time" | **Start** | choose another area | explain priority concisely | focused work begins |
| Target course/section | preserve context rather than making learner re-navigate | "I'm in the right course and mode" | **Continue into activity** | nearby focused sections | narrow context automatically | activity starts |

### Content hierarchy
Home should prioritise:

1. greeting/orientation;
2. one strong next-step recommendation or resume action;
3. clear reason where useful;
4. Today's relevant plan/context;
5. secondary exploration.

Do not give every course, metric and feature equal visual weight.

## Journey 3 — Courses → course Overview → revision mode

### User intent
Choose a course deliberately and get to the kind of revision they want.

### Screen-purpose matrix

| Screen/state | Screen job | Immediate understanding | Primary CTA | Secondary actions | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- |
| Courses index | show the learner's actual programme | "These are my courses" | **Open course** | Add Course, Remove Course | may help choose where to work | selected course Overview |
| Course Overview | orient within one exact course and expose meaningful modes | "What can I do for this course?" | contextual strongest next action if evidence supports one | Learn / Practice / Exam Prep / Progress | course-context recommendation | focused section opens |
| Focused section landing | start the intended type of work | "This section is for X" | section-specific action | switch section | contextual support | activity/topic begins |

### Design differentiation
The four course modes should not look like four identical feature cards with equal importance regardless of context. Their presentation may be structurally related, but readiness/recommendation/context should influence hierarchy.

## Journey 4 — Learn → Practice → feedback

### User intent
Understand something, then test whether it has stuck, then know what to do next.

### Learn screen job
Create a calm explanation/reading environment.

Primary CTA should usually be contextual progression such as **Try a practice question**, **Continue**, or a relevant next learning section — not a persistent wall of controls.

### Practice screen job
Make the task dominant. Activity type selection should become secondary once work begins.

### Feedback screen job
Turn performance into learning and momentum.

| State | Immediate understanding | Primary CTA | REV role |
| --- | --- | --- | --- |
| Learn content | "This is the idea I need to understand" | Continue / Try practice | explain selected material |
| Practice task | "This is what I need to answer" | Submit / Check answer | contextual clarification without giving away assessed answer where inappropriate |
| Feedback | "This is what I got right/wrong and why" | **Do the recommended next thing** | explain feedback and alternatives |
| Follow-up | "I'm improving this exact weakness" | Continue | maintain topic/course context |

### Anti-pattern
Do not wrap every paragraph, example and section in bordered cards. Visual separation should support reading rather than fragment it.

## Journey 5 — Plan → activity

### User intent
Turn available revision time into a sensible plan and actually start work.

### Screen job
Plan should reduce decisions, not create a planning-management hobby.

| Screen/state | Screen job | Immediate understanding | Primary CTA |
| --- | --- | --- | --- |
| Plan overview | show what is planned / needs decision | "Here is my revision plan" | **Start next planned activity** when one is ready |
| Availability/setup | capture only information needed to build a useful plan | "Revision needs this to schedule sensibly" | Save / Build plan |
| Planned activity | make the scheduled work executable | "This is what I'm doing now" | **Start activity** |
| Missed/changed plan state | help recover without guilt | "Adjust the plan; don't fail the learner" | Reschedule / Continue with best next action |

## Journey 6 — Progress → insight → action

### User intent
Understand how revision is going and what should change.

### Screen job
Progress must interpret evidence, not simply display it.

### Hierarchy

1. overall direction / confidence of interpretation;
2. strongest useful signal;
3. weak/under-covered areas;
4. explanation of what signals mean;
5. direct action.

| Screen/state | Primary CTA examples |
| --- | --- |
| Global Progress | **Work on highest-priority area** / open relevant course |
| Course Progress | **Practice weak area** / **Learn this area** |
| Readiness signal | **Start targeted Exam Prep** where justified |
| Low-evidence state | **Do an activity to build evidence** rather than implying poor performance |

### Anti-pattern
A learner should not need to interpret five charts before discovering what to do next.

## Journey 7 — Exam Prep → Exam Simulator → next action

### User intent
Prepare for real exam performance, practise realistically and learn from the result.

| Screen/state | Screen job | Primary CTA | Key design treatment |
| --- | --- | --- | --- |
| Exam Prep | select the most useful performance work | **Start recommended exam practice** | focused/performance-oriented hub |
| Simulator setup | make conditions/expectations explicit | **Start exam** | short setup, no decorative distractions |
| Timed exam | protect concentration and realism | answer/navigation controls | dedicated focus workspace; suppress unrelated persistent actions |
| Pause/stop | safely interrupt without ambiguity | Resume / confirm stop | true modal/focus behaviour |
| Results | explain performance, mark derivation and next action | **Review weak area / targeted practice** | interpretation before analytics |

## Journey 8 — Ask REV across the product

### User intent
Get contextual help without starting over or explaining information Revision already knows.

### Core rule
REV is a continuous relationship with changing context, not a separate chatbot embedded on every page.

| Context | REV should immediately know | Good next action |
| --- | --- | --- |
| Home | active courses, broad plan/progress priorities | recommend/route to useful work |
| Course Overview | exact course and wider learner context | explain priority within course |
| Learn | selected content/topic | explain/reframe/example |
| Practice | task and relevant feedback state | explain concept/feedback within assessment guardrails |
| Progress | evidence signal and uncertainty | explain what signal means and route to action |
| Plan | planned work and constraints | explain/reprioritise where governed |
| Exam Prep | exam/course context | technique/readiness guidance |

The persistent Ask REV control should remain visually recognisable but must not obscure content, compete with the dominant task, or remain present where realistic timed-exam conditions require it to disappear.

## Journey 9 — Account / Settings / Subscription

### User intent
Fix identity/preferences or understand/manage plan without being pulled away from revision unnecessarily.

### Screen job
Compact utility, not a destination that competes with learning.

Primary CTA depends on context: **Save changes**, **Compare plans**, or **Manage subscription** only where the capability is real and governed.

Upgrade prompts belong at relevant value boundaries, not as general visual noise.

## Journey 10 — Parent / supporter

### User intent
Understand whether revision is happening and whether useful support is needed.

### Screen job
Reassurance and guidance, not surveillance.

The most important output is an interpretable summary such as engagement/progress direction and a useful support prompt. Detailed learner work, private conversations and raw surveillance-style activity should not become the hierarchy.

## Journey 11 — Admin / operations

### User intent
Identify system/content/user operational conditions and take the right administrative action quickly.

### Screen job
Operational efficiency and evidence.

Admin should keep higher information density, tables and status views where appropriate. Shared design foundations should not force learner-style spacious card composition onto operational tasks.

## Cross-journey screen-priority rules

### Rule 1 — primary CTA is earned by the user's intent
A button is not primary because it is commercially important or because the design system has a primary variant. It is primary because it is the most useful next action for the dominant screen job.

### Rule 2 — navigation is not a substitute for a next action
When Revision knows the next useful state, route the learner there rather than making them navigate back up a hierarchy.

### Rule 3 — repeated components do not imply repeated composition
Use shared controls/surfaces/icons, but vary composition to fit reading, decision, task, interpretation and performance work.

### Rule 4 — low evidence must look different from poor performance
Do not turn uncertainty into a red/weak state merely to fill a Progress page.

### Rule 5 — recommendation requires explanation proportional to consequence
A low-stakes recommendation may need one sentence. A strong readiness or plan change may need more evidence/context. Do not front-load every explanation equally.

### Rule 6 — secondary actions stay available but quiet
Learner autonomy matters. The answer is not to hide alternatives; it is to stop them visually competing with the intended path.

## Recommended production review order after foundation cleanup

1. New learner / first value.
2. Returning Home / recommendation.
3. Courses / course Overview.
4. Learn → Practice → feedback.
5. Plan → activity.
6. Progress → action.
7. Exam Prep / Simulator.
8. REV contextual behaviour across all preceding journeys.
9. Account / Settings / Subscription.
10. Parent / supporter.
11. Admin / operations.

This order deliberately follows user value and dependency rather than implementation file structure.

## Questions to resolve during each journey review

For every screen/state, answer before implementation:

- What has the user just done?
- What are they trying to achieve now?
- What does Revision already know that should not be asked again?
- What must be understood in the first few seconds?
- What is the one strongest useful next action?
- What can be secondary or progressively disclosed?
- What does REV add here?
- What makes this screen composition distinct from adjacent jobs?
- What happens on first use / no data / loading / error / completion?
- What does the journey look like on phone, tablet and desktop?
- What evidence proves the user can complete the intended task?

## Governance / documentation impact

This document is analysis only. It does not amend current product, brand or UX authority and should not be treated as implementation permission for a new feature.

If a journey review concludes that existing product behaviour should change, that decision must be promoted into the relevant normative authority before or with governed implementation. If the review only identifies implementation drift, use a bounded implementation PR and update technical documentation accordingly.
