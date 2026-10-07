# ADR-0031 — Reconcile the Revision design system around one governed learner experience

**Status:** Founder-approved design direction; Phase A completeness review complete; documentation reconciliation pending; production implementation pending  
**Date:** 7 October 2026  
**Decision owner:** Founder  
**Scope:** Revision learner visual/interaction system, responsive navigation, course identity, REV presentation, educational interaction and progress visualisation

## Context

Revision accumulated overlapping visual generations, compatibility styling and partial design-system migrations. The product had strong foundations but no single clean expression of what should now govern the learner experience.

This decision deliberately consolidates the approved direction before implementation cleanup. It does not itself claim that production already matches the decisions below.

Current implementation evidence remains implementation truth only. The numbered governance authorities remain normative truth.

## Decision

Revision will evolve the original Calm Teal system rather than replace it with another visual generation. The product will use one semantic token/component system, one governed responsive shell and one consistent educational interaction language.

The Founder approved the following design decisions in this reconciliation.

### 1. Calm Teal remains the foundation

Keep the original Calm Teal brand foundation. Retain later improvements that have proved useful: Bricolage learner headings, Living E, subject accents, clearer learning status, current responsive navigation and accessibility improvements. Do not adopt a competing base palette, blanket pill treatment, blanket 24px cards, heavy body weights or a no-elevation rule.

### 2. One semantic colour system

Colour has five distinct jobs: Brand, Neutral/surfaces, Learning status, Functional status and Subject identity. These roles must not be swapped.

Primary Teal remains the ordinary action/brand accent. Deep Teal plus Living E identifies REV. Subject hues identify subjects. Learning-status hues identify learner evidence states. Functional Success/Warning/Error/Information retain product-feedback semantics.

### 3. Typography roles

Bricolage Grotesque 800 is the learner display face for H1/H2/H3, important numbers and subject marks. Manrope remains the reading and UI face.

Learner body text remains at least 16px and normally 400/500 weight. Labels/buttons normally use 600. Sentence case is the default; uppercase is limited to controlled eyebrow treatment. Display tracking is approximately -0.025em.

### 4. Shape and interaction sizing

Canonical radii are 12px compact, 14px controls, 20px standard surfaces, 28px feature/REV surfaces and 999px only for genuine pills/chips/badges/toggles.

Standard learner actions are 48px high, major CTAs 52px, icon-only targets at least 44px and preferably 48px for primary touch-first use, segmented/tab targets at least 44px and preferably 48px, fields 48px, compact controls 36px only where appropriate.

### 5. Controlled depth

Ordinary surfaces are flat by default. Raised treatment is reserved for genuinely interactive/prioritised surfaces. Floating treatment is for menus/popovers and overlay treatment for dialogs/sheets.

Dark mode relies more on surface steps and borders than shadows. Subject importance comes from hue/mark, not shadow. REV prominence comes from identity, not excessive effects.

### 6. Action hierarchy

Primary Teal is the principal useful contextual action. Secondary and tertiary variants express lower emphasis. Destructive styling is reserved for genuinely destructive/irreversible action.

There should normally be one primary action per decision context. Labels should describe consequences where useful. Deep Teal is not a general stronger learner CTA colour where doing so would blur REV identity.

### 7. REV identity

Where the learner sees genuine REV support, suggestions or conversation, use **Deep Teal + unmistakable Living E**.

The Living E must remain distinguishable from the two-line navigation menu even without colour or motion. At small sizes it must read as E geometry rather than three equal bars. The learner app uses four states: Waiting/Resting, Listening, Thinking and Responding. Completed is not a learner-app state.

The Resting state may use a subtle halo breathe. Listening/Thinking/Responding only appear when the underlying state is genuine. Reduced motion uses a recognisable static state plus text.

Ordinary UI must not borrow the Living E, halo or Deep Teal REV identity merely to appear important.

### 8. Graduated subject identity

Use a consistent subject-accented identity across Overview, Learn, Practice, Exam Prep and Progress. Use stronger solid subject treatment for course cards and Plan blocks; use neutral working surfaces beneath.

Subject identity always combines mark + name + hue. Subject colours never replace action, REV, learning-status or functional colours.

### 9. Stable learner canvas and responsive shell

Use one 1100px learner canvas with narrower internal reading (~760px) and focused-task (~820px) measures where appropriate.

Use the 4px spacing rhythm: 4/8/12/16/20/24/32/40/48/64/80/96.

Responsive gutters are 40px desktop, 28px intermediate desktop, 24px tablet and 20px phone. Desktop uses the 248px sidebar; tablet uses the 84px rail; phone uses bottom navigation. Tablet and phone retain a separate two-line menu that opens the full contextual left navigation/drawer.

Bottom navigation is for frequent top-level movement. The two-line drawer is for hierarchy, context and account. In-page navigation is for the current task. Ordinary pages must not create horizontal page scrolling at supported widths from 320px.

### 10. Canonical course identity and breadcrumbs

Every course page uses a compact persistent academic identity at the top of the shared canvas: subject mark/name plus qualification/course and exam board/specification context.

This is stable orientation even when the left navigation also carries course context.

Every navigable course page also has a breadcrumb at the top of the shared canvas. Breadcrumbs represent real learner-facing navigable levels, not internal/database hierarchy. Previous levels are links and the current page is identified accessibly.

Deep breadcrumbs collapse intelligently on constrained screens and never create page-level horizontal scrolling.

The three jobs remain distinct: breadcrumb = where can I go back to; course identity = what am I studying; page title/local context = what am I doing here.

### 11. One icon language

Use one central rounded-line product icon family: 24px default, 20px compact, 16px inline, approximately 1.75–2px stroke with rounded caps/joins and currentColor.

Navigation uses conventional recognisable symbols plus visible labels. The Living E is identity, not an icon. Subject marks and semantic status marks are separate governed systems. The two-line menu is protected and must not be confused with the Living E. No mixed page-local icon families or emoji controls.

### 12. Light and dark are one system

Light and Dark are equal expressions of one Revision design system. System is the default appearance preference, with explicit Light and Dark options.

Components keep the same meaning, hierarchy and geometry across themes; theme translation happens through semantic tokens. Subject identities remain recognisable in both themes. Primary Teal remains action colour. REV remains Deep Teal + Living E in both themes.

### 13. One canonical form system

Use persistent visible labels, 48px learner fields, 14px control radius and 16px input text. Helper, focus, error, disabled and loading states are shared.

Choose controls by their job: standard fields, text areas, selects, segmented/radio/checkbox/toggle controls, specialist assessment controls where appropriate. Segmented controls are not a substitute for navigation. Form controls do not inherit subject colours.

### 14. Truthful feedback, empty and loading states

Functional Success/Warning/Error/Information remain separate from learning status.

Feedback should be local, truthful and proportional. Important warnings/errors persist where action is required. Routine success should not create celebration overload.

Empty states explain the real condition and useful next step without inventing data. Loading preserves layout where practical and uses meaningful local progress treatment. Ordinary product loading must not borrow REV semantic animation unless REV is genuinely active.

### 15. Purposeful motion and engaging learning interaction

Ordinary interface motion is restrained and functional: approximately 160–200ms for common states and approximately 200–320ms for spatial drawers/modals where movement explains origin or hierarchy. Ordinary route changes are effectively immediate. Motion must not cause avoidable layout shift or delay useful work.

Learning exercises may use more tactile motion where it directly supports the mechanic. Flashcards use a governed front/back card flip. Practice questions may use responsive answer, feedback and progression transitions. Mock exams remain focused and authentic; motion is limited to useful navigation and state changes.

Reduced-motion alternatives preserve all meaning. No routine confetti, bouncing rewards, shaking wrong answers, pulsing CTAs or game-show effects.

### 16. Layered surfaces have distinct jobs

Popover/menu = compact contextual choice. Modal = bounded focused task or consequential decision. Drawer = hierarchical navigation. REV panel = contextual assistance.

Tablet/phone two-line menu opens the left navigation drawer. Ask REV uses a substantial contextual panel on larger screens and a full-screen conversational layer on phone where necessary.

Avoid unnecessary overlay stacking. Shared shells own focus containment, Escape handling where safe, background inertness, scroll locking and return focus.

Use the consolidated radius family for layered surfaces: 12px compact menus/popovers, 20px ordinary modal/dialog surfaces, 28px major REV conversational surfaces; full-screen phone surfaces do not need decorative viewport-edge radii.

### 17. Evidence-led progress visualisation

Data visualisation explains evidence rather than decorating dashboards.

Topics covered uses a simple subject-hued bounded progress bar plus x-of-y. Understanding uses governed learning-status colours with explicit labels/counts. Exam readiness is shown only when the evidence model supports it; otherwise show a legitimate “Not enough evidence yet” state and explain what would improve the evidence.

Use line/bar/stacked charts only when the data job warrants them. Trends may legitimately move down when new evidence changes the picture. Never collapse coverage, understanding and exam readiness into one blended mastery percentage or decorative gauge.

Progress pages begin with a plain-English interpretation and useful next action before detailed numbers.

### 18. One educational-treatment language

The same educational meaning uses the same governed treatment family across subjects. Subject hue may parameterise a restrained recognition cue but does not redefine treatment semantics.

Ordinary teaching remains open/editorial. Key ideas, examples, worked examples, relationship/process visuals, comparisons, quantitative treatments, misconceptions, quick checks and recaps appear only when their educational job warrants them.

Diagrams, tables and progressive worked interactions are used where they improve understanding rather than decorate the page. Quick checks remain unscored. REV explanations remain visually separate through Deep Teal + Living E.

### 19. Accessibility and design-quality gate

A Revision design is not complete because it looks good in one screenshot. It is complete only when the intended hierarchy, meaning and interaction survive different themes, screen sizes, input methods and accessibility settings.

Reusable components and materially redesigned learner journeys must:

- work in Light and Dark from the same component structure with tested contrast;
- preserve hierarchy and capability across phone, tablet and desktop;
- remain usable from 320px without ordinary page-level horizontal scrolling;
- work with touch, mouse and keyboard, with obvious logical focus and no essential hover-only behaviour;
- remain readable and operable under text enlargement/zoom rather than clipping into fixed-height layouts;
- provide reduced-motion alternatives that preserve state and meaning, including tactile learning interactions such as flashcard flips and Practice transitions;
- never use colour as the only carrier of subject identity, learning status, functional feedback, selection or chart meaning;
- deliberately handle loading, empty, error, disabled and saving states;
- preserve the approved minimum touch targets;
- give modals, drawers and overlays correct initial focus, focus containment, safe Escape behaviour, inert background, scroll locking and focus return; and
- provide accessible text/data equivalents for charts and educational visuals where the graphic alone is insufficient.

Revision continues to target WCAG 2.2 AA for learner-facing experiences, but automated accessibility compliance alone is not the quality definition. A technically conformant interface may still fail if it is confusing, cramped, cognitively exhausting or visually incoherent.

The acceptance standard is therefore:

**accessible + understandable + responsive + visually coherent + correct for the journey**

Automated visual assurance should use a bounded representative set rather than freeze every page. Representative coverage should include Light/Dark, desktop/tablet/phone, core navigation, REV, forms, overlays, Learn treatments, Practice interaction, Progress, Exam Prep/Simulator and important empty/loading/error states.

The Design Lab remains an inspection surface, not design authority. It should expose canonical shared components and recurring patterns in relevant interactive, theme, responsive and reduced-motion states, while real production journeys still require journey-level review.

### 20. Practice is a focused activity workspace

Practice uses a focused activity workspace rather than treating sustained exercises as pop-up dialogs. Once an activity begins, the task becomes the dominant surface until the learner finishes, exits or moves to the next activity.

The core Practice rhythm is:

`choose what to practise → focused activity → respond/reveal → useful feedback → next item → short session summary`

The normal course identity and route context remain available, but selectors, setup controls and competing panels must not surround the learner while they are actively practising.

#### Flashcards

Flashcards use one substantial card as the dominant interaction rather than a small card nested inside another panel or modal.

The front presents the term/question. Tap, click or keyboard activation flips to the back. The flip is part of the learning mechanic and should feel crisp and tactile rather than decorative. Reduced motion uses an instant reveal or short crossfade.

After reveal, the learner gives the relevant knowledge/confidence response before moving on. Session position such as `4 of 12` remains visible but quiet.

#### Questions and feedback

Multiple-choice, short-response and other question interactions present one clear question as the dominant task.

After the learner responds and, where governed, records confidence, feedback appears in place and preserves the relationship to the learner's answer.

Feedback should answer:

1. Was I right?
2. Why?
3. What should I learn from this?
4. What should I do next?

Wrong answers are educational correction, not software failure. Do not use shaking controls, buzzer-style motion, punitive red theatrics or other game-show feedback.

#### Calculations, data, case studies and written Practice

The focused shell adapts to the learning job.

Formula recall may use reveal mechanics. Calculation tasks preserve working and then reveal/check the method. Graphs, tables and source material may use more of the shared learner canvas where needed.

Longer case-study and written work may use side-by-side source/response composition on larger screens when this reduces unnecessary scrolling; tablet and phone reflow into task order.

REV-assisted marking or feedback uses the governed Deep Teal + Living E treatment only when REV is genuinely doing the work.

#### Session progress and completion

During Practice, progress is useful but quiet, for example `Question 3 of 8` or an equivalent restrained indicator. Practice must not use XP, streaks, flying scores or decorative completion dashboards.

At the end of a session, provide a concise useful summary answering how the learner performed, what changed in the evidence, what still needs work and what the most useful next action is.

If the evidence model does not justify a status or progress change, do not manufacture one merely to make the session feel rewarding.

#### Increasing restraint toward authentic exam conditions

The more exam-authentic the activity becomes, the more restrained the visual interaction becomes:

- flashcards may be the most tactile;
- Practice questions remain interactive and responsive;
- exam-style Practice becomes more focused and restrained; and
- full timed mocks use an authentic focused exam environment with no mid-attempt learning feedback.

The current implementation's sustained Practice-in-`PracticeDialog` presentation is therefore implementation debt to be superseded during the later rollout. Dialogs remain appropriate for bounded decisions or short interruptions, not as the default container for a multi-question learning session.

### 21. Course Overview is an orientation and decision surface

Course Overview is a calm orientation and decision surface, not a dashboard and not a miniature copy of Learn, Practice and Progress.

Its primary job is to answer three questions quickly:

1. What course am I in?
2. What is the most useful thing to do next?
3. How am I doing overall?

The canonical course header owns subject/course/exam identity. Overview must not follow that header with a second large identity hero that repeats the same subject, qualification, exam-board or specification information simply because a template has room for it.

#### Primary decision area

The main Overview decision area gives one evidence-backed course-level REV recommendation with a direct action.

On larger screens, the preferred hierarchy is:

`REV recommendation + reason + direct start action | concise Progress measures`

with the contextual Ask REV route beneath.

On constrained screens, the same hierarchy stacks without losing meaning:

`REV recommendation → concise Progress measures → Ask REV`

REV uses the governed Deep Teal + Living E identity. The recommendation must come from governed course-level evidence/recommendation logic and route to the exact useful activity where that activity can be identified safely.

#### Progress on Overview

Overview uses the governed three-measure model only as concise orientation:

- Topics covered;
- Understanding; and
- Exam readiness.

Detailed topic-by-topic evidence interpretation belongs in Progress.

Overview must not become a second Progress page by repeating full topic-status distributions, dense evidence tables or other detailed learner-performance analysis.

#### Course structure

Overview may show a restrained course/chapter/topic structure below the decision area so the learner can understand the shape of the course and navigate directly into useful Learn or other relevant work.

The structure answers `What does this course contain and where can I go?`, not `How am I performing on every topic?`.

Status may appear where it materially improves orientation, but a full status row for every topic should not be duplicated when dedicated Progress already owns that job.

#### Weak areas and duplication

Do not show a permanent separate `Weak spots` panel merely to repeat evidence already used by REV and Progress.

If a weak area is currently the most useful thing to address, the REV recommendation should explain that directly and provide the next action.

Do not add a second row of large destination cards for Learn, Practice, Exam Prep and Progress merely to duplicate the course navigation. Contextual links remain appropriate where they serve the current decision.

#### Little or no evidence

A new or low-evidence course must still feel complete and useful.

REV may recommend a short starting Practice activity to establish an initial evidence picture. Progress measures must truthfully show insufficient evidence where appropriate. The course structure remains available so the learner can choose to explore Learn or other supported sections.

The current implementation's repeated subject hero, full topic-status `Your path` treatment and separate `Weak spots` panel are therefore implementation debt to be reconciled during the later learner-product rollout.

### 22. Exam Prep stays in the learner shell; focus mode begins with the focused exam activity

Exam Prep itself is an ordinary navigable course section and remains inside the normal learner shell.

The Exam Prep page therefore uses the canonical course-page orientation:

`breadcrumb → compact course identity → Exam Prep title/context → page content`

It retains the governed course navigation and contextual REV access because its job is preparation, orientation, choice and guidance.

Focus mode begins only when the learner enters a dedicated exam-performance activity where global navigation would distract from, interrupt or compromise the work, especially a timed mock/full paper.

During an active focused exam session:

- global learner navigation is hidden;
- Ask REV is unavailable;
- the exam activity occupies the full working environment rather than appearing as a modal over the page;
- the interface becomes progressively more restrained and exam-authentic;
- leaving/stopping follows the governed exam-session persistence and confirmation contract; and
- completion/results return the learner to the normal course context.

This changes the older Global Learner Navigation rule that hid all navigation throughout the entire Exam Prep section. That conflict is deliberate and must be reconciled during the later authority-update phase.

This decision does not change marking, evidence, persistence or readiness semantics. Those remain governed by their existing product/evidence authorities unless separately changed.

## Deferred follow-on — full-site expression after learner-product completion

The Founder confirmed on 7 October 2026 that Revision should ultimately use one coherent design system across the wider company/product surface, including authentication/onboarding, public marketing, pricing/upgrade and Admin, with expression adapting to the job rather than creating local design-system forks.

That wider cross-channel reconciliation is **deliberately deferred**.

The current priority is to finish the learner product first. The present design-reconciliation exercise therefore remains scoped to the learner experience and the shared foundations needed to make that learner experience coherent. Cross-channel expression, wider marketing imagery/illustration and non-learner surface cleanup will be picked up as a later governed decision and rollout after the learner product is finished.

This deferred item must not expand or delay the current learner-product completion work.

## Phase A completeness review — 7 October 2026

The complete Choices 1–21 were reviewed together against the learner-product surface rather than as isolated styling decisions.

The review explicitly covered:

- learner shell, global navigation, course-context navigation and account access;
- Home and Plan;
- learner-wide and course-level Progress;
- Courses and Course Overview;
- Learn;
- Practice, including flashcards, questions, calculations/data, longer responses, feedback and session completion;
- Exam Prep and increasingly authentic exam-style work, including full-paper / Exam Simulator focus;
- contextual and persistent REV presence;
- Profile, Settings and the governed modal/drawer/popover/REV-panel jobs;
- Light, Dark and System appearance;
- phone, tablet and desktop;
- loading, empty, error, warning, saving, disabled and insufficient-evidence states; and
- keyboard, touch, zoom/text enlargement, reduced motion and WCAG 2.2 AA quality expectations.

### Phase A conclusion

The learner design direction is sufficiently complete to move into documentation reconciliation. No additional design-system choice is required merely to lengthen the decision set.

Existing specialist product authorities continue to own page and journey behaviour that ADR-0031 does not deliberately redefine. Phase B must reconcile any stale visual, responsive or interaction wording in those authorities against this completed design direction and the responsibility hierarchy, using one canonical learner-design rule plus specialist references rather than duplicating the rule across documents.

Known examples of reconciliation debt include older 32px feature-radius wording versus the approved 28px major-surface role, older five-state learner REV wording versus the approved four-state learner model, and superseded tablet/mobile navigation wording that still survives in less-specific documents. Those conflicts are documentation debt to resolve; they are not new Founder design choices.

This Phase A completion does not authorise production UI changes. Numbered authority reconciliation must be approved before the new authority model is treated as canonical for implementation.

## Consequences

The current repository contains implementation and documentation that predate this reconciliation. Those conflicts are implementation/documentation debt, not permission to ignore this decision.

A later governed implementation phase must reconcile semantic tokens, shared UI components, navigation/runtime, Living E geometry and states, Design Lab, technical documentation and browser/visual assurance against the updated numbered authorities.

The implementation cleanup must preserve current educational/evidence semantics unless a separate product/governance decision changes them.

## Documentation impact

This ADR is the single working record for the current Founder design-reconciliation exercise while the decision set is still being completed. No numbered authority document is changed during this decision-capture phase.

Once the full design direction has been reviewed and approved as a whole, rollout will be handled as a separate governed programme. That rollout will reconcile the relevant numbered authorities, implementation, Design Lab, technical documentation and assurance together so that approved design, documented authority and the live site converge without leaving competing sources of truth.

The historical 1 October 2026 learner-redesign decision remains historically true. Where its design direction conflicts with this 7 October reconciliation, the completed reconciliation will govern the later authority update; historical evidence will not be rewritten.

## Implementation status

**Decision capture first. Production UI and authority cleanup are intentionally deferred until the design reconciliation is complete and approved as a whole.**
