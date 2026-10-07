---
title: "Learner Design System"
document_id: "revision-learner-design-system"
document_type: "domain-authority"
authority: "brand-and-experience"
status: "active"
version: "1.0"
owner: "Founder"
effective_date: "2026-10-07"
last_reviewed: "2026-10-07"
review_cadence: "quarterly"
content_review_status: "founder-approved-direction-pending-merge"
source_of_truth_for: ["learner visual foundations", "learner semantic colour roles", "learner typography", "learner spacing and radii", "learner depth and surfaces", "learner action hierarchy", "learner REV visual presence", "learner responsive shell geometry", "learner content canvas", "learner course orientation pattern", "learner icon language", "learner light and dark themes", "learner forms and system states", "learner motion", "learner layered-surface design", "learner progress visualisation", "learner educational-treatment visual language", "learner Practice composition principles", "learner Course Overview composition principles", "learner Exam Prep and focused exam visual boundary", "learner design accessibility and quality gate"]
depends_on: ["Founder Doctrine", "Product UX Principles", "Visual Brand System", "Global Learner Navigation", "Claims and Progress Governance"]
supersedes: ["learner-specific visual and interaction rules in Visual Brand System where they overlap this document", "Learner Content Canvas Amendment as a standalone active authority", "learner-design values in docs/design/decisions/2026-10-01-learner-redesign-v2.md", "normative interpretation of docs/design-system/RESPONSIVE.md"]
---
# Learner Design System

## Purpose

Define the single current visual and interaction-design authority for the Revision learner product.

This document turns the Founder-approved reconciliation in `decisions/ADR-0031-reconcile-revision-design-system.md` into active numbered authority. It is intentionally learner-product first. It does not redesign or reconcile public marketing, pricing/upgrade surfaces, wider company brand expression or Admin. Those remain outside this programme until the learner product is finished.

The system exists to prevent local design drift. A learner page may have its own composition because its job is different, but it may not invent a competing palette, type scale, radius family, icon language, control family, REV identity, responsive shell or evidence-visualisation grammar.

## Authority model

Start here for learner design.

This document owns the shared learner visual/interaction system. Specialist authorities continue to own the meaning and behaviour of their domains:

| Job | Governing specialist |
| --- | --- |
| learner navigation hierarchy, course-tree behaviour and account routes | `10-product-governance/Global Learner Navigation.md` |
| learner experience principles and journey-quality expectations | `20-brand-and-experience/Product UX Principles.md` |
| ordinary button/action interaction quality | `20-brand-and-experience/Interactive Component Quality Standard.md` |
| REV recommendation/conversation behaviour and voice | `20-brand-and-experience/REV Guidance and Conversation Pattern.md` |
| exact Living E / wordmark asset geometry and safe use | `20-brand-and-experience/Identity Asset Usage Rules.md` |
| subject hue/mark mapping | `20-brand-and-experience/Subject Accent Colour System.md` |
| educational-treatment meaning and anatomy | `20-brand-and-experience/Educational Treatment System.md` |
| progress/evidence meaning and claim strength | `40-evidence-and-trust/Claims and Progress Governance.md` |
| Home, Plan, Learn and other page behaviour | the relevant `10-product-governance/` authority |
| current implementation | code and `docs/technical/` |

Where a specialist document repeats an older learner visual value that conflicts with this document, this document governs the visual value while the specialist document retains ownership of its product/evidence behaviour.

The Design Lab and `docs/design-system/` are derived reference surfaces. They are never normative authority.

## 1. Foundation: evolved Calm Teal

Revision retains the original Calm Teal foundation and evolves it rather than replacing it with another visual generation.

Core brand colours used by the learner product are:

- Deep Teal Ink — `#0F2F36`;
- Primary Teal — `#2BB6A3`;
- Soft Aqua Accent — `#E6FBF4`;
- Canvas Off-White — `#FAFCFB`;
- Soft Surface Tint — `#F1FAF8`;
- Graphite Ink — `#132026`.

The learner product must not introduce a competing base palette, blanket pill treatment, blanket high-radius card system, blanket flatness/no-elevation rule or dense adult-SaaS visual language.

## 2. Semantic colour roles

Colour has five separate jobs:

1. **Brand / action** — Revision identity, ordinary actions, links and focus.
2. **Neutral / surfaces** — backgrounds, borders, text and hierarchy.
3. **Learning status** — Got it, Nearly there, Needs work, Just started, Not started.
4. **Functional status** — Success, Warning, Error, Information.
5. **Subject identity** — the governed subject palette plus subject mark/name.

These roles never substitute for one another.

Primary Teal is the ordinary learner action colour. Deep Teal plus the Living E is reserved for genuine REV presence. Subject colours do not become buttons, evidence states or REV. Functional Error is not used to represent a learner getting a question wrong. Learning status uses its governed label/icon as well as colour.

The exact learning-state meaning remains governed by Claims and Progress Governance. The exact subject hues/marks remain governed by Subject Accent Colour System.

### Theme surface roles

Light:

- background `#FAFCFB`;
- surface `#FFFFFF`;
- border `#E6ECEB`;
- primary text `#132026`;
- secondary text `#5B686C`;
- primary action `#2BB6A3` with Graphite Ink text.

Dark:

- background `#0F2024`;
- surface `#13272B`;
- elevated surface `#173136`;
- border `#24434A`;
- primary text `#E6F2EF`;
- secondary text `#A8BCC0`;
- primary action remains `#2BB6A3`.

## 3. Typography

Learner headings and important large numbers use **Bricolage Grotesque 800**. Reading text, labels, controls and ordinary UI use **Manrope**.

Use role-based typography rather than page-local scales. The current learner display roles are:

- H1: `clamp(34px, 2.4vw + 18px, 46px)`;
- H2: `clamp(26px, 1.2vw + 18px, 32px)`;
- H3: Bricolage 800 at the shared compact-heading role;
- hero/important number: `clamp(40px, 3vw + 18px, 56px)`;
- ordinary learner body copy: 16px minimum.

Display tracking is restrained, approximately `-0.02em` to `-0.03em`. The Revision wordmark is not rebuilt in Bricolage; identity assets remain governed separately.

## 4. Spacing, shape and depth

Use the 4px spacing rhythm:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96`.

The learner radius family is:

- compact: **12px**;
- control: **14px**;
- ordinary surface: **20px**;
- major feature / REV conversational surface: **28px**;
- pill/circle: **999px**.

There is no active 32px learner feature radius.

Depth is controlled rather than blanket-flat or blanket-shadowed. Use surface hierarchy, borders and whitespace first. Raised/floating/overlay depth exists only where hierarchy or spatial layering needs it. Ordinary content does not gain shadow merely to look interactive.

## 5. Action hierarchy and controls

Ordinary actions use the shared hierarchy:

- Primary — Primary Teal;
- Strong / inverse — Deep Teal with tested light foreground;
- Secondary — neutral/surface treatment with border;
- Tertiary — lower-emphasis action without permanent container;
- Destructive — functional Error semantics.

Detailed button sizing, loading, pressed, disabled and action-language rules remain in Interactive Component Quality Standard. Ordinary learner actions use the shared component implementation rather than local button families.

Subject colour is not an action hierarchy.

## 6. REV visual identity

REV is visually distinct from ordinary UI.

A genuine REV surface uses **Deep Teal + the Living E**. Ordinary product cards, generic loading states and ordinary actions must not borrow the Living E, REV halo or Deep Teal REV treatment simply to look important.

The learner app has four REV states:

1. Waiting / Resting;
2. Listening;
3. Thinking;
4. Responding.

Completed is not a learner REV state.

Waiting may use a subtle halo breathe. Listening, Thinking and Responding appear only when the underlying state is genuine. Reduced motion uses a recognisable static Living E plus accessible text/state.

Exact identity geometry, clear space and compact/inverse asset treatment remain governed by Identity Asset Usage Rules. REV voice, recommendation logic and conversational behaviour remain governed by REV Guidance and Conversation Pattern.

## 7. Subject identity

Subject identity is graduated:

- **strong solid treatment** where fast subject distinction is the job, such as course cards and selected planning/exam identity;
- **restrained mark/name/hue cues** inside working surfaces;
- **neutral working surfaces** for sustained reading, practice and exam work.

Subject identity always uses **mark + subject name + hue**. Colour alone is insufficient.

The exact mapping lives only in Subject Accent Colour System and the central implementation map. Subject hues never replace action, REV, learning-status or functional colours.

## 8. Learner canvas and responsive shell

Ordinary learner screens use one stable outer canvas:

- learner content max width: **1100px**;
- reading measure inside that canvas: approximately **760px**;
- focused-task measure inside that canvas: approximately **820px**.

The reading/focused measures are internal composition widths, not alternate page canvases.

Responsive page gutters:

- desktop: **40px**;
- intermediate/laptop: **28px**;
- tablet: **24px**;
- phone: **20px**.

Navigation geometry:

- above 960px: **248px desktop sidebar**;
- 621–960px: **84px tablet rail**, with the two-line menu opening the contextual left drawer;
- 620px and below: **phone bottom navigation** with the raised REV control, plus the two-line menu for contextual hierarchy/account.

The exact navigation hierarchy and disclosure behaviour belong to Global Learner Navigation.

Ordinary pages must not create page-level horizontal scrolling from **320px** upward. Responsive design reflows the same hierarchy; it does not create independent phone/tablet design systems.

## 9. Course orientation and breadcrumbs

Every navigable course page uses one compact persistent course identity in the shared canvas:

**subject mark/name + qualification/course + exam board/specification context**.

Every navigable course page also uses a breadcrumb representing real learner-facing navigable levels.

The three jobs are distinct:

- breadcrumb — where can I go back to;
- course identity — what am I studying;
- page title/local context — what am I doing here.

Do not repeat course identity as a second decorative hero simply because space is available. Breadcrumbs collapse intelligently on constrained screens and never create page-level horizontal scrolling.

## 10. Icon language

Use one central rounded-line product icon language:

- 24px default;
- 20px compact;
- 16px inline;
- approximately 1.75–2px stroke;
- rounded caps/joins;
- `currentColor`.

Navigation uses conventional symbols plus visible/accessibly available labels. No emoji controls or page-local mixed icon families.

The Living E is identity, not a generic icon. Subject marks and semantic status marks are separate systems. The protected two-line menu must remain visually distinct from the Living E.

## 11. Light and Dark

Light and Dark are equal expressions of one learner system. **System** is the default preference, with explicit Light and Dark choices.

Component meaning, hierarchy and geometry remain the same across themes. Theme translation happens through semantic tokens. Subject identities remain recognisable in both themes. Primary Teal remains the ordinary action colour; REV remains Deep Teal + Living E.

Do not create page-local dark palettes.

## 12. Forms

Learner forms use one canonical system:

- persistent visible label;
- 48px standard field;
- 14px control radius;
- 16px input text;
- shared helper, focus, error, disabled and loading treatment.

Choose the control by its actual job. Segmented controls are not navigation substitutes. Form controls do not inherit subject colours.

Specialist exam/learning controls may have different anatomy only where their interaction job genuinely differs, while still meeting the same accessibility and state-quality bar.

## 13. Feedback and system states

Functional Success/Warning/Error/Information remain separate from learning status.

Feedback is local, truthful and proportional. Important warnings/errors persist while action is required. Routine success does not need celebration theatre.

Empty states explain the real condition and useful next step without inventing data. Loading preserves layout where practical. Saving/processing visibly acknowledges the action and protects entered work. Disabled controls communicate genuine unavailability.

Ordinary product loading does not use REV semantic animation unless REV is actually active.

## 14. Motion

Ordinary interface motion is restrained and functional:

- common state transitions: approximately **160–200ms**;
- drawers/modals/spatial movement: approximately **200–320ms** where movement explains origin or hierarchy;
- ordinary route changes: effectively immediate.

Learning interactions may be more tactile when the mechanic benefits. Flashcards may use a governed front/back flip; Practice may use responsive answer/feedback/progression transitions.

The more exam-authentic the activity, the more restrained the motion.

Reduced-motion alternatives preserve all meaning. No routine confetti, bouncing rewards, shaking wrong answers, pulsing CTAs or game-show effects.

## 15. Layered surfaces

Layered jobs are distinct:

- popover/menu — compact contextual choice;
- modal — bounded focused task or consequential decision;
- drawer — hierarchical navigation;
- REV panel — contextual assistance.

Ask REV uses a substantial contextual layer on larger screens and may take over the full phone screen. The two-line menu opens the contextual learner drawer on tablet/phone.

Avoid unnecessary overlay stacking. Shared shells own focus containment, safe Escape handling, background inertness, scroll locking and focus return.

Layered radii follow the learner family: 12px compact menus/popovers, 20px ordinary modal surfaces and 28px major REV conversational surfaces. Full-screen phone layers do not need decorative viewport-edge radii.

## 16. Progress visualisation

Progress graphics explain evidence; they do not decorate dashboards.

Use the three governed measures without blending them:

- Topics covered — bounded progress plus x-of-y;
- Understanding — governed learning-status distribution with explicit labels/counts;
- Exam readiness — only when the evidence model supports it; otherwise show the governed insufficient-evidence state.

Detailed semantic meaning, thresholds and claim rules are owned by Claims and Progress Governance.

Use line/bar/stacked charts only when the data job warrants them. Never create one decorative mastery gauge that collapses coverage, understanding and readiness.

Progress pages begin with plain-English interpretation and a useful next action before detailed numbers.

## 17. Educational treatments

The same educational meaning uses the same treatment family across subjects. Subject hue may parameterise a restrained cue but does not redesign the treatment.

Ordinary teaching remains editorial/open rather than a stack of cards. Key ideas, examples, worked examples, purposeful visuals, comparisons, quantitative treatments, misconceptions, quick checks and recaps appear only where their educational job warrants them.

Educational Treatment System owns the treatment meanings and detailed anatomy. This design system owns the rule that those treatments share the same learner visual grammar and cannot be locally restyled into subject-specific mini design systems.

REV explanation remains visually separate through Deep Teal + Living E.

## 18. Practice composition

Practice is a **focused activity workspace**, not sustained work inside a dialog.

The normal rhythm is:

`choose what to practise → focused activity → respond/reveal → useful feedback → next item → short session summary`.

During active Practice, the task dominates. Selectors, setup controls and competing panels do not surround the learner.

Flashcards use one substantial card. Questions present one clear dominant task. Feedback stays spatially connected to the learner's answer and answers: was I right, why, what should I learn, what next?

Calculation/data/case/written tasks adapt the workspace to their job. Larger screens may use side-by-side source/response composition where it genuinely reduces cognitive load; smaller screens reflow into task order.

Progress during a session is useful but quiet. No XP, streaks, flying scores or decorative completion dashboards.

REV-assisted marking/feedback uses REV visual identity only when REV is genuinely doing the work. Evidence and marking semantics remain governed elsewhere.

## 19. Course Overview composition

Course Overview is a calm **orientation and decision surface**, not a dashboard and not a miniature copy of Learn, Practice and Progress.

It should answer:

1. What course am I in?
2. What is the most useful thing to do next?
3. How am I doing overall?

The canonical course header owns identity; Overview does not add a second large identity hero.

The preferred large-screen hierarchy is:

`REV recommendation + reason + direct action | concise progress measures`

with contextual Ask REV beneath.

Constrained screens stack:

`REV recommendation → concise progress measures → Ask REV`.

Detailed topic evidence belongs in Progress. A permanent separate Weak spots panel or destination-card grid must not merely duplicate REV, Progress or navigation.

Low-evidence/new-course states remain complete and honest rather than filling space with invented progress.

## 20. Exam Prep and focused exam activity

**Exam Prep itself remains in the normal learner shell.**

The Exam Prep page uses the canonical course-page orientation and normal course navigation because its job is preparation, orientation, choice and guidance.

Focus mode begins only when the learner enters a dedicated exam-performance activity where global navigation would distract from or compromise the work, especially a timed mock/full paper.

During the focused exam activity:

- global learner navigation is hidden;
- Ask REV is unavailable;
- the activity owns the full working environment rather than appearing as a modal;
- visual interaction becomes progressively more restrained and exam-authentic;
- leaving follows the governed persistence/confirmation contract;
- completion/results return the learner to normal course context.

This design boundary does not alter exam evidence, marking, timing or persistence semantics.

## 21. Accessibility and design-quality gate

Revision targets **WCAG 2.2 AA**, but technical conformance alone is not the quality definition.

Reusable components and materially redesigned learner journeys must:

- work in Light and Dark from the same component structure;
- preserve hierarchy/capability across phone, tablet and desktop;
- remain usable from 320px without ordinary page-level horizontal scrolling;
- work with touch, mouse and keyboard;
- have obvious logical focus and no essential hover-only behaviour;
- remain readable/operable under text enlargement and zoom;
- provide reduced-motion equivalents;
- never use colour as the only carrier of identity/status/selection/chart meaning;
- deliberately handle loading, empty, error, disabled and saving states;
- preserve minimum touch targets;
- implement correct modal/drawer/overlay focus behaviour; and
- provide accessible text/data equivalents for charts and educational visuals where needed.

Acceptance is:

**accessible + understandable + responsive + visually coherent + correct for the journey**.

## 22. Implementation ownership

The production implementation should express this system in this order:

`approved learner design authority → semantic tokens → shared primitives/components → specialist reusable patterns → page composition`.

Page-local CSS must not be used to mask a system-level defect.

The Design Lab is a visual projection of the production system, not authority. Its specimens should use production tokens/components and expose gaps honestly.

A new reusable pattern must be promoted into the shared component/pattern layer with appropriate documentation and assurance rather than copied page by page.

## Documentation relationship

The following remain active specialist authorities and should be read when their domain is relevant:

- `Product UX Principles.md`;
- `Interactive Component Quality Standard.md`;
- `REV Guidance and Conversation Pattern.md`;
- `Educational Treatment System.md`;
- `Subject Accent Colour System.md`;
- `Identity Asset Usage Rules.md`;
- relevant `10-product-governance/` page/journey authorities; and
- `Claims and Progress Governance.md`.

The following are not competing learner-design authority:

- `decisions/ADR-0031-reconcile-revision-design-system.md` — approved decision history that produced this authority;
- `10-product-governance/Learner Content Canvas Amendment.md` — historical corrective authority superseded by the canvas rule here;
- `docs/design/decisions/2026-10-01-learner-redesign-v2.md` — earlier design decision history;
- `docs/design-system/RESPONSIVE.md` — derived implementation/reference guidance;
- Design Lab — visual inspection surface.

## Documentation impact

Version 1.0 promotes the completed Founder-approved ADR-0031 learner design reconciliation into one canonical learner-design authority. It deliberately does not reconcile public marketing, pricing/upgrade, wider company brand expression or Admin design.

No learner evidence meaning, educational truth, planning/recommendation logic, marking semantics or exam rules are changed by this document except the already Founder-approved visual/composition boundary that Exam Prep remains in the ordinary learner shell until a focused exam activity begins.
