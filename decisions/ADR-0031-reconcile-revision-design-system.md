# ADR-0031 — Reconcile the Revision design system around one governed learner experience

**Status:** Founder-approved design direction; documentation reconciliation in progress; production implementation pending  
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

## Consequences

The current repository contains implementation and documentation that predate this reconciliation. Those conflicts are implementation/documentation debt, not permission to ignore this decision.

A later governed implementation phase must reconcile semantic tokens, shared UI components, navigation/runtime, Living E geometry and states, Design Lab, technical documentation and browser/visual assurance against the updated numbered authorities.

The implementation cleanup must preserve current educational/evidence semantics unless a separate product/governance decision changes them.

## Documentation impact

This ADR records the Founder decisions but does not replace normative authority. The same governed change updates the relevant numbered authority documents:

- Visual Brand System
- REV Guidance and Conversation Pattern
- Subject Accent Colour System
- Interactive Component Quality Standard
- Educational Treatment System
- Global Learner Navigation
- Learner Content Canvas Amendment
- Claims and Progress Governance

The historical 1 October 2026 learner-redesign decision remains historically true. Where its design direction conflicts with this 7 October reconciliation, this ADR records why the newer authority was changed; the numbered authority documents govern current behaviour.

## Implementation status

**Documentation first. Production UI cleanup is intentionally deferred until the design reconciliation is complete and Founder-approved in governance.**
