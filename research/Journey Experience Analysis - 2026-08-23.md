# Journey Experience Analysis — 23 August 2026

**Status:** Analysis / implementation input — not normative authority  
**Baseline:** current approved `main` at `31d844a9ec0a699e4de35af7cb6cbb7ff9ee0530`  
**Programme:** Issue #141 — journey-led full-site content and design review  
**Purpose:** Translate current approved product, journey, navigation, evidence, trust and experience authority into a practical content-and-screen blueprint for programme Tasks 2–12 before production redesign begins.

## Executive conclusion

The highest-value design problem is not “make every page look better”. It is to make each important journey feel obvious, fast and continuous.

Every material screen should make four things clear within seconds:

1. **Where am I?**
2. **What is this screen for?**
3. **What matters most now?**
4. **What useful thing should I do next?**

The shared Interface System should make Revision coherent, but composition must follow the user job. A Home launchpad, Learn reading canvas, Practice task, Plan decision workspace, Progress interpretation view, Exam Simulator and Admin console should not collapse into the same template.

The practical design rule for Tasks 2–12 is therefore:

> **Shared foundation. Distinct job. Explicit hierarchy. Obvious next action. Continuous journey.**

## Authority boundary

This document analyses and operationalises existing approved authority. It does not itself approve new product behaviour.

Where a later journey review identifies a genuine product change, that change must be promoted into the relevant normative authority before or with governed implementation. Where the issue is only implementation drift, the implementation PR should correct the runtime and technical documentation without inventing new product authority.

PR #138 separately proposes making the Founder’s “Don’t make me think” direction and the journey-led review workflow normative. Until that PR is approved and merged, this document remains analysis only.

## The content hierarchy contract

Before visual layout is discussed, every material screen should assign its content to four levels.

### Level 1 — orient and act

What the user must understand immediately and the strongest useful action they can take now.

This normally contains:

- current context/location;
- one clear screen purpose;
- the primary recommendation, task or decision;
- the primary CTA; and
- essential state needed to act safely.

### Level 2 — reason and evidence

The minimum explanation needed to trust or complete the Level 1 action.

Examples:

- why this work is recommended;
- what a progress signal means;
- the key evidence behind a readiness judgement;
- what the learner is aiming to achieve in a task; or
- why a piece of information is being requested.

### Level 3 — legitimate alternatives

Useful learner choice that should remain available but should not compete with the intended path.

Examples:

- choose another course;
- switch Learn / Practice / Exam Prep / Progress;
- adjust a plan;
- compare plans;
- ask REV;
- inspect another progress area.

### Level 4 — deeper detail on demand

Detail that is useful for confidence, transparency or advanced users but should not delay the primary task.

Examples:

- evidence history;
- detailed analytics;
- mark breakdowns;
- extended explanations;
- subscription detail;
- operational evidence;
- advanced settings.

### Hierarchy test

If Level 3 or Level 4 content is visually louder than the Level 1 action, the screen hierarchy has failed even if every component individually conforms to the design system.

## CTA contract

### Primary CTA

A control is primary because it is the most useful next action for the dominant user intent — not because it is commercially important or because the component library has a primary button style.

A material screen should normally have one dominant CTA at a time.

### Secondary actions

Secondary actions preserve autonomy and recovery. They remain visible where useful but visually subordinate.

### Navigation is not a CTA substitute

If Revision already knows the next useful destination, route the learner directly there. Do not make the learner navigate back up a hierarchy and rediscover the next step.

### Commercial CTA rule

Upgrade is primary only on a genuine commercial decision surface such as plan comparison. Inside ordinary learning, the learning action remains primary and commercial discovery stays contextual and proportionate.

## Experience archetypes

Use these as compositional starting points, not rigid templates.

| Surface | Dominant archetype | What should dominate | What to avoid |
| --- | --- | --- | --- |
| Authentication | Minimal gateway | quickest secure route into Revision | marketing page around the form |
| Home | Conversational launchpad | orientation, one useful recommendation/resume action, REV | dashboard of equal cards/metrics |
| Courses | Programme selector | learner’s saved courses, Add Course, direct entry | catalogue complexity before saved courses |
| Add Course | Guided selector | exact course identification with minimal decisions | whole catalogue dumped into one screen |
| Course Overview | Course launchpad | context + strongest next action + focused modes | repeating global dashboard information |
| Learn | Reading / explanation canvas | comprehension, examples and contextual help | nested-card chrome and competing controls |
| Practice | Task workspace | question/task, response, task state | activity-picker dominance after work starts |
| Feedback | Interpretation + next action | what happened, why, what next | score-only endpoint |
| Plan | Decision / commitment workspace | current programme, today’s executable work, realistic adjustment | planning controls without a start path |
| Progress | Evidence narrative | interpretation, uncertainty, priority and action | analytics dashboard requiring learner diagnosis |
| Exam Prep | Performance preparation hub | readiness, targeted exam work, practice choice | generic learning-card repetition |
| Exam Simulator | Focus workspace | exam content, time and exam controls | unrelated global actions or tutor access during timed work |
| REV | Contextual conversation | current context, explanation, recommendation, routing | detached generic chatbot |
| Account / Settings | Compact utility workspace | identity/preferences/account action | full product-dashboard treatment |
| Plan comparison / subscription | Commercial decision workspace | value differences, current state, clear purchase/manage path | anxiety, lock clutter, feature spreadsheet overload |
| Parent / supporter | Reassurance summary | engagement/progress direction and useful support | learner surveillance detail |
| Admin | Operational console | status, exceptions, actions, evidence | learner-style low-density cards everywhere |

# Programme Task 2 — New learner → first value

## Intended outcome

A new learner should reach a useful revision action before they are asked to understand or configure the whole product.

## Shortest credible path

Create/sign in → establish first saved course → receive a useful starting action → complete useful activity → receive feedback / next action.

If a governed baseline diagnostic exists, it may help choose the first action, but it must not become a long mandatory gate and must not create strong mastery/readiness claims from sparse evidence.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sign in | return securely | identify and authenticate | “Get back into Revision” | **Sign in / Continue with Google** | Forgot password, Create account | identity controls, clear error state | provider/account help | none or restrained | authenticated learner continues |
| Create account | start with minimum friction | create learner identity | “Create my Revision account” | **Create account / Continue with Google** | Sign in | first name, email/password where applicable | terms/privacy detail | none or restrained | authenticated learner continues |
| No-course state | tell Revision what the learner studies | establish programme context | “Add the course I study” | **Add Course** | concise explanation | why course context is required | what can be added later | may explain why context improves guidance | course selection opens |
| Add Course | identify exact supported course | resolve course identity safely | “Choose the exact course I’m taking” | **Add course** when unambiguous | Search, Back, Cancel | subject/level/board/specification required to distinguish | specification detail where needed | may explain differences; must not silently add | course membership saved |
| First-course success | move from setup to value | confirm context and start work | “Revision knows what I study — now start” | **Start revising** / strongest useful action | Add another course | saved course identity + starting recommendation | why this start was chosen | recommend fastest sensible first action | first work opens |
| First useful activity | create value and first evidence | make task itself dominant | “Do this short useful piece of revision” | **Start / Answer / Continue** | Ask REV where appropriate | task purpose + expected outcome | deeper explanation/help | explain task/context without replacing effort | useful completion |
| First feedback | convert first result into momentum | explain result without overclaiming | “Here’s what this tells us and what to do next” | **Recommended next action** | Review answer / choose another action | what happened + why + uncertainty | evidence mechanics | explain feedback | learner continues rather than returning to setup |

## Content hierarchy

1. **Do the minimum thing needed to start useful revision.**
2. Explain why course context or another required input matters.
3. Offer Add another course / alternative starting route.
4. Put account, catalogue and evidence detail behind progressive disclosure.

## Must not become

- a profile questionnaire;
- a long onboarding carousel;
- a forced tour of every feature;
- a diagnostic that claims proficiency from a handful of questions;
- a catalogue-navigation lesson.

## Material states to design deliberately

First social sign-in, email account creation, provider unavailable, auth error, recovery, no courses, one course, unsupported/no-match course search, duplicate course, add failure, first activity incomplete, low-evidence feedback.

# Programme Task 3 — Returning learner → Home → recommended action

## Intended outcome

The learner opens Revision and moves from “I should revise” to useful work with minimal interpretation.

## Home product job

**Home is not a dashboard. It is the fastest route from intent to useful revision.**

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home — actionable recommendation | know what to do now | orient across active courses and select one useful next action | “This is the best use of my time now” | **Start recommended work** | Ask REV, Courses, Plan | exact course/activity + concise reason | fuller evidence/reasoning | prominent learner-wide guide | work opens directly |
| Home — resumable work | continue momentum | surface unfinished meaningful work when appropriate | “I can pick up where I left off” | **Continue** | current recommendation, Courses | resume context + saved state | why another action may now be higher priority | explain trade-off if relevant | resumed activity |
| Home — low evidence | create useful evidence without pretending certainty | tell learner Revision is still learning | “Do this to improve Revision’s picture” | **Start useful evidence-building activity** | choose course / Ask REV | current uncertainty + useful next action | how evidence affects guidance | explain uncertainty plainly | evidence improves |
| Home — no active courses | recover missing programme context | fail safely | “Add a course before Revision can guide your programme” | **Add Course** | account/help | short reason | catalogue detail later | restrained | course flow |
| Recommendation explanation | provide enough confidence to act | explain why without blocking | “Why this matters” | **Start** | choose another area | one or two strongest reasons | detailed evidence | natural-language explanation | work starts |

## Home content hierarchy

1. Greeting/orientation + one recommendation or resume action.
2. Concise reason and only the most relevant today/plan context.
3. Ask REV, Plan and direct learner choice through Courses.
4. Wider progress, history and other detail only when requested.

## Home arbitration rule

The page must deliberately resolve the tension between **resume what I was doing** and **do what matters most now**. Both cannot simply become equal primary cards. The journey review should define which wins in each material state and how the alternative remains accessible.

## Must not become

- a grid of one card per feature;
- a miniature version of Progress;
- a miniature version of Plan;
- a course catalogue;
- a generic REV chat screen.

# Programme Task 4 — Courses → Course Overview → revision mode

## Intended outcome

A learner who wants control can deliberately choose an exact saved course and get directly to the appropriate type of revision.

## Shortest credible path

Courses → saved course → Overview → recommended or chosen Learn / Practice / Exam Prep / Progress → useful activity.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Courses index | choose what to work on | show the learner’s actual programme | “These are my courses” | **Open course** | Add Course, Remove Course | clear course identity | course-management detail | may recommend which course deserves attention | course Overview |
| Courses empty | establish programme | direct to Add Course | “You haven’t added a course yet” | **Add Course** | minimal help | one-sentence reason | catalogue detail later | restrained | Add Course |
| Course Overview | orient inside one exact course | turn course context into useful work | “Here’s where I am in this course and what I can do next” | **Strongest contextual next action** where evidence supports one | Learn, Practice, Exam Prep, Progress | course identity + relevant recommendation/state | deeper course evidence | course-scoped guidance | focused section |
| Learn landing | understand/revisit | start learning work | “Learn/revisit this course area” | **Continue / Start recommended topic** | choose topic / switch mode | useful topic priority | full topic tree | contextual explanation | Learn content |
| Practice landing | test/apply | start appropriate practice | “Test what I know” | **Start recommended practice** | activity/topic choice | task type + purpose | broader activity catalogue | contextual guidance | practice task |
| Exam Prep landing | improve real-exam performance | choose high-value exam work | “Prepare for the exam” | **Start recommended exam practice** | targeted/timed/full-paper options | readiness/need relevant to choice | detailed exam evidence | technique/readiness guidance | exam activity |
| Course Progress | understand course position | interpret evidence in context | “Here’s what needs attention in this course” | **Act on highest-priority signal** | inspect areas | key evidence signal | full drill-down | explain signal | Learn/Practice/Exam Prep |

## Course Overview content hierarchy

1. Exact course identity + one contextual recommendation where evidence justifies it.
2. The information required to trust that recommendation.
3. Clear route to the four focused modes.
4. Detailed evidence/course structure on demand.

## Mode presentation rule

Learn, Practice, Exam Prep and Progress may share system anatomy, but should not default to four identical equal-weight cards regardless of evidence or exam context. The hierarchy should reflect what matters now while preserving direct learner choice.

## Must not become

- Subject → Course → Paper → Topic navigation for its own sake;
- a second Home dashboard;
- an undifferentiated feature launcher;
- a long page mixing full Learn, Practice, Exam Prep and Progress content.

# Programme Task 5 — Learn → Practice → feedback loop

## Intended outcome

The learner understands something, tests whether it has stuck, receives useful feedback and moves naturally into the next useful action without losing topic/course context.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Learn topic | understand/revisit concept | provide calm explanation | “This is the idea I need to understand” | **Continue / Try practice** | Ask REV, nearby sections | explanation, examples, key points | deeper detail/resources | explain/reframe/example | practice or next learning step |
| Learn checkpoint | verify comprehension lightly | bridge into active retrieval | “Check whether that made sense” | **Answer / Continue** | revisit explanation | small purposeful check | deeper explanation | clarify after attempt | feedback/practice |
| Practice selection | choose appropriate task | make task type understandable | “Choose how to test this” | **Start recommended practice** | other appropriate types | purpose/difficulty/scope where relevant | full catalogue | explain trade-offs | task begins |
| Practice task | retrieve/apply | make question and response dominant | “This is what I need to answer” | **Submit / Check answer** | task navigation, Ask REV within assessment guardrails | question, response controls, task state | help/rules | contextual clarification; no inappropriate answer leakage | feedback |
| Feedback | learn from performance | interpret result | “What I got right/wrong, why, and what next” | **Recommended next action** | review answer, alternative next step | explanation + next action | marks/evidence detail | explain feedback | targeted follow-up |
| Follow-up weakness | improve exact gap | preserve context and momentum | “I’m fixing this specific weakness” | **Continue** | return to broader topic | concise link to prior evidence | evidence history | maintain context | new evidence |

## Learn content hierarchy

1. Explanation the learner is here to understand.
2. Worked example/key idea only where it helps comprehension.
3. Contextual next step into practice or continuation.
4. Extended notes/resources on demand.

Learn should read as a coherent canvas, not a stack of bordered modules. Visual separation should support comprehension without fragmenting every paragraph into a card.

## Practice content hierarchy

1. Current task/question and response.
2. Essential instructions/state.
3. Task navigation/help.
4. Activity catalogue and broader progress stay out of the way once work begins.

## Feedback content hierarchy

1. Meaning: what happened.
2. Explanation: why.
3. Action: what to do next.
4. Detailed scoring/evidence only after the learner can understand the result.

## Must not become

- passive reading without a useful next step;
- practice dominated by mode pickers;
- score-only feedback;
- a visual “card within card within card” reading experience.

# Programme Task 6 — Plan → activity

## Intended outcome

Revision turns exam context, realistic time and evidence into an understandable programme, but the learner can still start useful work rather than becoming a plan manager.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plan — ready | know what is planned | show today and wider adaptive programme | “Here’s what matters today and what’s coming” | **Start next planned activity** | adjust plan, inspect future | today’s work + enough future context | detailed future rationale | explain prioritisation/changes | activity starts |
| Plan — setup needed | create usable plan | collect only required constraints | “Revision needs this to plan realistically” | **Save / Build plan** | back/cancel | assessment + realistic availability inputs | advanced detail later | explain why input matters | usable plan |
| Planned item | execute scheduled work | turn plan entry into action | “This is what I’m doing now” | **Start activity** | change/skip deliberately | course/activity/time expectation | reason/evidence | explain priority | activity starts |
| Plan changed | understand adaptation | explain material change calmly | “The plan changed because…” | **Continue with updated next action** | inspect change | one clear reason + effect | detailed recalculation | explain consequence | learner acts |
| Missed work | recover without guilt | recalculate from reality | “What matters now has been updated” | **Start best current action** | adjust availability/priorities | revised recommendation | prior-plan history | coach without debt language | useful work resumes |
| Insufficient capacity | prioritise remaining time | enter calm priority mode | “There isn’t time for everything, so here’s what matters most” | **Start highest-value work** | adjust availability if useful | priorities + reason | fuller trade-offs | explain whole-programme consequences | learner makes useful progress |

## Plan content hierarchy

1. **Today / next executable work.**
2. Reason for material priority or change.
3. Near-future programme and adjustment controls.
4. Later-future detail, history and calculation transparency.

Precision should deliberately reduce further into the future. The interface should not imply that a flexible adaptive forecast is a fixed timetable.

## Must not become

- a traditional calendar by default;
- a backlog/debt ledger;
- a productivity system where organising work replaces doing it;
- an opaque AI-generated timetable.

# Programme Task 7 — Progress → insight → action

## Intended outcome

The learner understands how revision is going without having to diagnose charts themselves, and can move directly from insight to useful work.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Global Progress | understand wider programme | interpret strongest learner-wide signals | “Here’s how things are going and what needs attention” | **Work on highest-priority area** | open course, inspect evidence | overall direction + strongest useful signal | programme detail | explain evidence/uncertainty | focused action |
| Course Progress | understand one course | interpret course-specific evidence | “Here’s where this course is strong/weak/uncertain” | **Practice / Learn / Exam Prep highest-priority area** | drill down | key course signals | paper/topic detail | explain signal | useful work |
| Topic detail | understand one area | explain evidence and change | “This is what Revision currently knows about this topic” | **Do next evidence/improvement action** | inspect attempts | coverage/understanding/readiness distinction | history | explain why judgement exists | activity |
| Low-evidence state | build evidence | distinguish unknown from weak | “Revision doesn’t know enough yet” | **Do an activity to build evidence** | choose another area | what evidence is missing | methodology | explain uncertainty | stronger evidence |
| Readiness state | understand exam preparedness | interpret exam-relevant evidence | “This is what current exam evidence suggests” | **Start targeted Exam Prep** where justified | inspect evidence | readiness meaning + confidence | detailed evidence | explain claim | exam practice |

## Progress content hierarchy

1. Overall direction / most decision-relevant signal.
2. Evidence-backed weakness, gap or uncertainty that matters most.
3. Direct action to improve or strengthen evidence.
4. Detailed charts/history/evidence only as supporting transparency.

## Claim rule

Coverage, understanding/mastery and exam readiness must remain distinct. Low evidence must not be rendered as poor performance simply to populate the page. Stronger language requires stronger evidence, and material claims must explain meaning, evidence, confidence where relevant and next action.

## Must not become

- a wall of charts;
- a generic percentage score;
- a decorative “on track” label without a reference point;
- activity masquerading as learning evidence.

# Programme Task 8 — Exam Prep / Exam Simulator

## Intended outcome

The learner moves from readiness evidence into realistic exam-performance work, completes that work in a focused environment and receives useful post-exam interpretation.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Exam Prep | improve exam performance | choose highest-value exam work | “This is the exam work that will help most now” | **Start recommended exam practice** | targeted/timed/full-paper options | readiness need + activity purpose | full evidence | technique/readiness guidance | exam activity |
| Simulator setup | understand conditions | prepare for realistic attempt | “Here’s what this exam involves” | **Start exam** | cancel/back | duration, scope, key rules | detailed instructions | restrained; no distracting coaching | timed exam |
| Timed exam | perform under conditions | protect concentration and realism | “I’m in the exam” | exam answer/navigation controls | Pause / Stop | question, time, progress through paper | permitted reference/instructions only | not available as tutor during active timed work | submit/stop |
| Pause | interrupt safely | freeze and obscure exam state | “The exam is paused” | **Resume** | Stop | pause state | none | none | timed exam resumes |
| Stop confirmation | prevent accidental termination | confirm consequence | “Stopping ends this attempt” | **Confirm stop** | Resume/cancel | consequence | none | none | result/exit |
| Results | learn from attempt | interpret performance and mark derivation | “Here’s what the exam shows and what to do next” | **Targeted next action** | review answers / inspect marks | performance meaning + weak areas | mark breakdown | explain result after exam | Learn/Practice/Exam Prep |

## Exam Prep content hierarchy

1. Strongest justified performance recommendation.
2. Readiness evidence/reason.
3. Alternative exam-practice modes.
4. Detailed evidence/history.

## Timed Exam content hierarchy

1. Exam paper/question and required exam controls.
2. Time and navigation state.
3. Pause/stop controls.
4. Everything unrelated disappears, including persistent Ask REV.

## Results content hierarchy

1. What the performance means.
2. Where marks were won/lost and why at useful level.
3. Strongest next action.
4. Full mark/evidence breakdown.

## Must not become

- an ordinary learner page with global distractions;
- an analytics screen before interpretation;
- a tutor-assisted timed exam;
- a punitive score screen.

# Programme Task 9 — Ask REV across the journeys

## Intended outcome

REV feels like one continuous intelligent relationship whose context narrows naturally as the learner moves through Revision.

## Context contract

| Context | REV should already know | REV’s dominant job | Appropriate next action | REV should avoid |
| --- | --- | --- | --- | --- |
| Home | active courses, plan/progress priorities, recent state | orient/recommend | route to useful work | reciting the learner model |
| Courses | active programme and selected course where relevant | help choose/understand | open course/work | changing membership without governed action |
| Course Overview | exact course + wider programme | prioritise within course | route to focused section | forgetting wider competing priorities |
| Learn | selected course/topic/content | explain/reframe/example | continue/try practice | generic detached answers |
| Practice | task + attempt/feedback state | clarify concept/feedback within assessment guardrails | return to task/follow-up | giving away assessed answers inappropriately |
| Plan | programme, constraints, assessments, current plan | explain/negotiate priorities | apply governed change / start work | pretending LLM output is planner authority |
| Progress | evidence signal + uncertainty | explain what it means | route to useful action | overclaiming certainty |
| Exam Prep | course/exam/readiness context | technique/readiness guidance | exam practice | distracting from focused performance |
| Timed Exam | active timed state | **not available as tutor** | n/a | undermining exam realism |

## REV surface hierarchy

1. Current context cue and immediate conversational opportunity.
2. Useful answer/recommendation.
3. Suggested next action that preserves the underlying journey.
4. Longer conversation/history only when needed.

## Interaction rules

- Opening REV should not make the learner restate context Revision already knows.
- REV should normally preserve the underlying task on desktop/tablet and provide a natural route back on mobile.
- Suggested prompts can help but should not replace natural conversation.
- REV must not become a sales agent at entitlement boundaries.
- REV must disappear where the product requires realistic timed-exam conditions.

## Must not become

- a separate chatbot per screen;
- a peer navigation destination that the learner must visit for routine actions;
- an always-on overlay competing with the task;
- a mechanism that invents certainty or overrides deterministic planner/evidence logic.

# Programme Task 10 — Account / Settings / Subscription

## Intended outcome

Learners and adult payers can manage identity, preferences and commercial state without turning account administration into a competing product experience.

## Governance boundary

Authentication and the learner/payer/supporter role separation are already governed. FI-002 still contains unresolved Definition-of-Ready decisions around checkout/provider/relationship verification and exact commercial mechanics. This blueprint can define screen jobs and hierarchy but must not invent those unresolved mechanisms.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Account menu | reach utility job | expose compact utilities | “Manage my account/settings” | selected utility | Log out, Upgrade where real | identity + available utilities | none | none | utility opens |
| Profile | correct learner identity data | manage bounded profile | “This is the identity Revision uses” | **Save changes** | close | editable first name; read-only email until governed otherwise | account detail | none | saved/closed |
| Settings | change preferences | manage implemented preferences | “Change how Revision works for me” | **Save / apply preference** | close | current preference state | advanced preferences later | none | preference applied |
| Linked supporter transparency | understand data relationship | show who is linked and visibility boundary | “This person is linked and this is what they can see” | **Manage relationship** where governed | close/help | linked identity + plain-language visibility | policy detail | may explain but not obscure boundary | learner remains informed |
| Entitlement boundary in learning | understand stronger option without losing current task | explain additional value contextually | “This stronger capability is on another plan; my current work is safe” | **Compare plans** only when useful | **Continue with current plan experience** | benefit + current entitlement | plan detail | may explain value once | learner chooses freely |
| Plan comparison | choose whether a higher plan is worth it | compare value ladder clearly | “What changes if I upgrade?” | **Choose plan / continue purchase** where governed | stay on current plan | price/cadence + strongest meaningful differences | full feature/terms detail | restrained | purchase or return |
| Billing/subscription management | manage existing contract | show current commercial state and valid actions | “This is my subscription and what I can change” | **Manage subscription** action appropriate to state | invoices/help | current plan, renewal/cancel state | billing history | none | state changed/recovered |
| Adult payer entry | fund learner where appropriate | establish payer role without granting supporter access | “I can pay without automatically seeing learner data” | governed purchase/link action | sign in/back | payer role + relationship boundary | legal/detail | none | entitlement/link flow continues |

## Subscription content hierarchy

### In-product entitlement boundary

1. Preserve the learner’s current task and work.
2. Explain the additional learner benefit.
3. Show current entitlement state and route to compare plans.
4. Put full pricing/feature detail on the commercial surface.

### Plan comparison

1. Clear conceptual value difference between Free / Paid / Premium where commercially live.
2. Price and billing cadence.
3. The few capability differences that materially change the learner/supporter experience.
4. Detailed feature tables, terms and billing detail.

## Must not become

- a wall of padlocks across ordinary study;
- a conversion funnel driven by exam anxiety;
- a plan-name check embedded in educational truth;
- payment being treated as permission to learner data;
- profile/settings becoming global learner destinations.

# Programme Task 11 — Parent / supporter

## Intended outcome

A valid linked supporter can understand whether Revision is being used, whether progress broadly appears to be moving in the right direction, and what useful support may help — without receiving surveillance-style access to the learner.

## Governance boundary

Parent/supporter access depends on both valid relationship permission and the relevant entitlement. Payment alone is not supporter permission. Private REV conversations, individual answers, raw work and detailed activity surveillance remain outside the automatic parent-visible boundary.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Learner invite supporter | create relationship safely | initiate secure link | “Invite a parent/supporter without exposing my account publicly” | **Create/send secure invitation** | cancel | who/what is being linked + visibility summary | policy detail | none | invitation created |
| Adult invitation acceptance | accept legitimate relationship | authenticate and confirm relationship | “I’m linking to this learner with permission” | **Accept link** | decline | learner/link identity + role boundary | detailed permissions | none | relationship active/pending entitlement |
| Adult-led purchase/link | fund and link correctly | separate payer and supporter permissions | “Payment and learner-data access are separate” | governed purchase/invite action | back | payer role, learner invite requirement | legal/detail | none | learner accepts relationship |
| Parent/supporter dashboard — Paid | gain reassurance | summarise high-level engagement/progress | “Is Revision being used and broadly moving in the right direction?” | **View area needing useful support** where present | assessment overview / account | engagement direction, overall progress, simple course signal | trends/detail within boundary | not learner REV; optional support explanation only if governed | supporter understands situation |
| Parent/supporter dashboard — Premium | understand richer trends/support | interpret changes and suggest support | “Where is progress changing and how can I help?” | **View support suggestion / relevant trend** | broader overview | trend + interpretation + support guidance | deeper approved trends | bounded interpretation | supporter can act appropriately |
| No/low evidence | avoid false reassurance/alarm | explain uncertainty | “There isn’t enough evidence yet to judge this confidently” | **Understand what would improve the picture** | assessment dates/course overview | uncertainty | methodology | none | supporter informed without overclaim |
| Billing area for payer-supporter | manage payment separately | expose billing only where viewer is payer | “I can manage the subscription here” | **Manage subscription** | dashboard | billing status | invoices/detail | none | commercial state managed |

## Parent dashboard content hierarchy

1. **Plain-language overall reassurance / attention signal with uncertainty.**
2. Most useful course-level change or support need.
3. Upcoming assessment context and appropriate support suggestion.
4. Trends/details that remain inside the approved parent-visible boundary.

## Must not become

- click-by-click monitoring;
- access to private tutor conversations or submitted answers;
- a school-style attendance dashboard;
- a commercial reason to expand parent data access;
- an unexplained “on track” badge.

# Programme Task 12 — Admin / operational surfaces

## Intended outcome

Operational users can identify problems, understand evidence and take the correct bounded action quickly. Admin remains part of the same product system without being forced into learner-style composition.

## Screen-purpose blueprint

| Screen/state | User goal | Screen job | Immediate understanding | Primary CTA | Secondary actions | Essential content | Progressive detail | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Admin landing / health | know where attention is needed | summarise operational state | “What needs attention now?” | **Open highest-priority exception/work area** | other admin areas | critical statuses + evidence freshness | full service metrics | normally none | operator investigates |
| Founder Assurance | understand production confidence/evidence | expose evidence-based assurance | “What is known, unknown or needs attention?” | **Inspect attention item** | inspect healthy evidence | status + evidence source/freshness | detailed checks/history | none | evidence reviewed |
| Content Operations queue | process content work | show queue, state and next operation | “What content work is waiting and what can I do?” | **Open/process selected item** | filters/search | state, owner, blocking reason | full metadata | none | item advances safely |
| Operational table/list | find/manage entities efficiently | support scanning and selection | “Which rows need action?” | **Row-level governed action / inspect** | filter/sort/search | columns required for decision | extended metadata | none | correct item selected |
| Exception/detail | diagnose issue | show cause/evidence/action | “What happened, impact, and safe next step?” | **Take bounded recovery/action** | back/escalate | evidence, impact, current state | logs/history | none | issue resolved/escalated |
| Admin action confirmation | prevent destructive mistake | confirm consequence | “This action changes X” | **Confirm** | cancel | consequence + scope | detail where needed | none | action completes |
| Unknown/degraded state | avoid false confidence | state missing/stale evidence | “Revision cannot currently prove this state” | **Inspect evidence / recover** | other admin work | what is unknown and why | diagnostics | none | evidence restored/escalated |

## Admin content hierarchy

1. Operational state / exception requiring action.
2. Evidence needed to make the action safely.
3. Controls, filters and alternate work.
4. Detailed logs/history.

Admin may legitimately use denser tables, status collections and multi-column layouts. Shared design foundations should govern components, states, focus, typography and themes — not force spacious learner-card composition onto operational jobs.

## Must not become

- a learner dashboard with different labels;
- decorative health scores without evidence;
- uncontrolled local component forks;
- a page that hides unknown/stale evidence behind a reassuring colour.

# Cross-journey continuity rules

## 1. Preserve context through transitions

Course, paper/component, topic, activity, evidence and plan context should carry into the next screen where relevant. The learner should not have to reselect information Revision already knows.

## 2. Recommendation should terminate in work

A recommendation is incomplete if its CTA merely opens another navigation page that asks the learner to find the recommended activity again.

## 3. Feedback should terminate in a useful next action

Scores, readiness signals, plan changes and parent/supporter insights should not be endpoints. Each should identify the appropriate next state where action is justified.

## 4. Empty states are journey states

Empty/low-data screens should explain what is missing, why it matters and the best next action. They are not placeholders for generic illustration and copy.

## 5. Loading preserves expected hierarchy

Loading states should make it clear what is being prepared and avoid layout shifts that cause the learner to lose the intended primary action.

## 6. Error states protect work and momentum

Errors should state what happened, whether work is safe, what Revision is doing and whether the user needs to act. Recovery should return the user to the journey rather than a generic dead end.

## 7. Responsive design preserves priority, not just components

Phone/tablet/desktop adaptations must preserve the same Level 1–4 content priority. A mobile layout that pushes the primary action below secondary content has changed the product hierarchy, not merely the layout.

## 8. Accessibility preserves the same journey

Keyboard and assistive-technology users must reach the same primary action, understand the same state and complete the same journey. Modals/drawers must use deliberate focus management rather than only looking modal.

## 9. Light and Dark are the same product

Theme changes may alter surfaces/contrast but must not alter hierarchy, semantics or interaction priority.

# Review questions for every material screen

Before implementation of any Task 2–12 screen/state, answer:

1. What has the user just done?
2. What are they trying to achieve now?
3. What does Revision already know that must not be requested again?
4. What should be understood in the first few seconds?
5. What is the single strongest useful next action?
6. What content is Level 1, Level 2, Level 3 and Level 4?
7. What legitimate alternatives must remain available?
8. What does REV add here — and what should REV avoid?
9. What makes this composition appropriate to this job rather than a reused page template?
10. What happens on first use, no data, low evidence, loading, error, completed and recovery states?
11. What changes on phone, tablet and desktop without changing priority?
12. How is keyboard/focus/accessibility behaviour assured?
13. What evidence proves the user can complete the intended journey?
14. Does any conclusion require a normative product/UX authority change before implementation?

# Known questions to resolve during the programme

These are analysis questions, not approved changes.

## Task 2

- Whether an initial diagnostic is required, optional or recommendation-led once its feature authority is ready.
- What first useful activity creates enough value without front-loading assessment.

## Task 3

- The explicit arbitration rule between unfinished work and a newly higher-priority recommendation on Home.
- How much Today’s Plan belongs on Home before it begins duplicating Plan.

## Task 4

- How course Overview ranks its recommendation against direct mode choice.
- When paper/component selection appears before a focused mode because the academic structure genuinely requires it.

## Task 5

- Which learning content formats deserve first-class hierarchy by subject/topic rather than appearing as equal resource tiles.
- Assessment-help guardrails for REV during scored practice.

## Task 6

- Exact planner controls that belong in primary workflow versus progressive detail.
- Which plan changes deserve proactive explanation versus silent recalculation.

## Task 7

- Final learner-facing representation for coverage, understanding and readiness without false precision.
- When estimated grades are useful enough and evidence-strong enough to show.

## Task 8

- Exact result hierarchy for full-paper/timed exam evidence.
- How review-answer flow connects back to targeted Learn/Practice without turning results into a dense marking console.

## Task 9

- The boundary between contextual REV overlay and full REV workspace.
- Conversation continuity/history treatment without obscuring current task context.

## Task 10

- FI-002 unresolved checkout provider, payer verification, purchase mechanics and exact plan/allowance catalogue.
- Exact learner-facing wording for age-appropriate purchase routes after legal/privacy validation.

## Task 11

- FI-002 relationship verification, invitation expiry/recovery, unlinking safeguards and legal/consent implementation.
- Exact parent-visible evidence summaries and cadence once the underlying measurements are implemented.

## Task 12

- Final operational information architecture as Admin capabilities expand.
- Which recurring operational patterns should graduate into shared admin primitives without flattening legitimate domain-specific density.

# Recommended production review order after B7 foundation completion

1. Task 2 — New learner / first value.
2. Task 3 — Returning Home / recommendation.
3. Task 4 — Courses / Course Overview.
4. Task 5 — Learn → Practice → Feedback.
5. Task 6 — Plan → activity.
6. Task 7 — Progress → action.
7. Task 8 — Exam Prep / Simulator.
8. Task 9 — REV contextual behaviour across all preceding journeys.
9. Task 10 — Account / Settings / Subscription.
10. Task 11 — Parent / supporter.
11. Task 12 — Admin / operations.

This order follows user value and product dependency rather than code structure. Analysis may proceed ahead of implementation where it does not create production ambiguity.

# Definition of a ready journey brief

A Task 2–12 journey is ready to enter governed implementation only when its review has produced:

- end-to-end user intent and entry conditions;
- shortest credible path to value;
- material screen/state inventory;
- screen-purpose contract for each material state;
- Level 1–4 content hierarchy;
- primary and secondary CTA decisions;
- REV context/role decision;
- first-use/empty/low-evidence/loading/error/completion/recovery behaviour;
- responsive and accessibility expectations;
- explicit product-authority changes, if any, approved through the correct governance path;
- implementation boundary and canonical route/runtime identified;
- assurance evidence required to prove the journey; and
- documentation-impact check.

# Governance / documentation impact

This document remains research/analysis and does not amend current product, brand, evidence, trust or commercial authority.

The analysis is consistent with current approved `Core User Journeys`, `Information Architecture`, `Global Learner Navigation`, `Adaptive Revision Planning`, `Authentication Experience`, `Subscription Plans and Entitlements`, `Product UX Principles`, `Tone of Voice Framework`, `Emotional Experience Principles` and `Claims and Progress Governance`.

PR #138 is the proposed normative vehicle for the new journey-led review workflow and strengthened UX principle. If later journey reviews conclude that product behaviour should change, update the relevant normative authority in that journey’s governed PR before or with implementation. If a review identifies only implementation drift, correct implementation and technical documentation without rewriting historical audits.
