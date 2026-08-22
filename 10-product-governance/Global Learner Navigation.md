# Global Learner Navigation

**Status:** Active authority — v0.8 proposal pending governed merge  
**Owner:** Founder  
**Founder direction approved:** 2026-08-22  
**Purpose:** Define the governed global learner navigation model, learner-course contextual expansion and persistent REV access pattern across desktop, tablet and mobile.

## Authority relationship

This document is the specific product authority for global learner navigation, contextual academic expansion and persistent access to REV.

Where the navigation sections of `Information Architecture.md`, `Adaptive Revision Planning.md`, `Core User Journeys.md` or responsive-navigation wording in `20-brand-and-experience/Visual Brand System.md` conflict with this approved model, this document governs navigation behaviour. The Visual Brand System continues to govern Revision's palette, typography, spacing, radius, icon language, Living E treatment and other visual foundations.

This v0.8 direction retains the v0.5 decision that retired the five-item persistent tablet/mobile bottom navigation bar, the v0.6 progressive disclosure of account utilities and the v0.7 decision that the active academic branch may expand contextually.

It changes the learner-facing academic entry point from **Subjects** to **Courses**. Subject remains valid academic metadata and a useful way to organise course discovery, but it is no longer a required everyday navigation hop for a learner opening a course they already study.

## Core decision

REV is not primarily a peer navigation destination alongside the learner-wide destinations.

The learner-wide destinations are:

- **Home**
- **Plan**
- **Progress**
- **Courses**

The persistent global action is:

- **Ask REV**

Courses represents the authenticated learner's active/saved course set, not the complete published Revision catalogue.

The global destinations remain recognisable and simple at rest. When the learner moves into a course branch, navigation may expand only the currently relevant branch so the learner can understand where they are and move to nearby course sections without returning to an index page first.

A full REV workspace may still exist for extended conversation, but ordinary access is contextual Ask REV rather than requiring the learner to navigate away from the current task.

## Learner-course hierarchy

The learner-facing navigation projection is:

```text
Courses
├── learner course
│   ├── Overview
│   ├── Learn
│   ├── Practice where available
│   ├── Exam Prep where available
│   └── Progress
├── learner course
└── learner course
```

Where a qualification genuinely has component-specific learning rather than one shared course-level learning scope, the selected course may additionally expose the relevant paper/component grouping before its applicable focused sections.

Subject remains part of the underlying governed academic/content hierarchy and course identity. It may be used to organise Add Course discovery and to provide context such as `Business · AQA · AS Level`, but the learner does not need to navigate through Subject Home to reach a saved course.

### Expansion rules

- On Home, Plan, global Progress and Admin, global navigation remains flat.
- On **Courses**, Courses expands to show the learner's current saved courses.
- On a saved **course/specification**, Courses remains expanded and the selected course exposes the focused sections that genuinely exist for that course.
- On a component-specific route, the same principle applies using the applicable course/component path.
- Only the selected course branch expands into focused sections. Other learner courses remain collapsed.
- The exact current page receives an accessible active state; parent context remains visually clear but must not falsely claim `aria-current="page"`.
- Contextual child navigation is route/catalogue driven rather than hard-coded to one subject, qualification or exam board.
- A published course that the learner has not added must not appear as though it belongs to their active programme.

## Courses index and course management

Selecting **Courses** opens the learner's course index.

The Courses page:

- shows the learner's saved/active courses;
- identifies each course clearly enough to distinguish subject, level, exam board and specification where needed;
- opens a selected course directly;
- exposes a clear **Add Course** action; and
- provides a calm empty state with Add Course as the obvious next step when the learner has no active courses.

### Add Course

Add Course opens a bounded course-selection experience over or from the Courses page. It exposes only published/supported Revision courses and may organise discovery by subject, qualification/level, exam board and specification.

Adding a course must:

- require an explicit authenticated learner action;
- persist membership to that learner;
- prevent duplicate active membership;
- update the Courses page and contextual navigation promptly; and
- make the course available to learner-wide Plan, Progress, Home/REV recommendation scope and REV context.

### Remove Course

The learner must be able to correct their course set. A secondary **Remove course** action is therefore part of the same programme-management model.

Removing a course:

- removes it from the learner's active programme;
- stops it influencing new learner-wide recommendations/planning;
- does **not** delete historic learning evidence, attempts or activity;
- allows later re-addition without pretending the historical evidence never existed; and
- safely returns the learner to Courses if they remove the course currently being viewed.

Course membership is learner programme context, not evidence of understanding, coverage, mastery, readiness or confidence.

### Existing learners and catalogue integrity

The pre-FI-020 runtime temporarily treated the full published learner catalogue as the programme because no persisted learner-course set existed. Migration to persisted course membership must not make existing learners appear to lose course access they were already using.

A bounded compatibility transition may seed the current production course set for existing learners. This is not a future rule that every newly published course is automatically added to every learner.

If a saved course identifier no longer resolves to a published course, Revision must not silently map it to another course. Preserve historical data, exclude the unavailable course from new study/recommendation actions and surface the integrity exception operationally.

## Desktop navigation

Desktop uses a persistent left navigation rail/sidebar.

### Top area

The top contains the REV identity and a visually prominent **Ask REV** action, followed by:

1. Home
2. Plan
3. Progress
4. Courses

Ask REV receives the strongest branded emphasis. Ordinary destinations remain restrained and use a clear accessible active state.

When Courses is active, the learner's saved course list appears immediately beneath it. The selected course may then expose its focused sections. Child items use progressively quieter indentation and hierarchy rather than competing visually with the four global destinations.

## Bottom account control

The bottom of the desktop sidebar uses one compact authenticated account control showing:

- circular avatar/initial; and
- learner name.

Selecting it opens a compact account menu containing, for an ordinary learner:

- **Profile**;
- **Settings**;
- **Upgrade plan**, only when a governed plan-comparison or upgrade route is actually available; and
- **Log out**.

For a user with database-governed administrator permission, the same menu additionally exposes **Admin**. Admin must not render for users without that permission. UI visibility is not the authorization boundary; protected Admin routes and services continue to enforce administrator permission independently.

While FI-002 remains before `Ready`, any visible Upgrade plan item must be clearly unavailable/forthcoming and must not imitate a functioning purchase journey.

The compact account menu closes after selection, on Escape, or when the learner clicks/taps outside it.

## Profile and Settings modal behaviour

Profile and Settings use one shared **centred account modal workspace** rather than a right-edge drawer or new full-page destination.

Selecting either keeps the underlying learner screen in place, dims the background, opens near the viewport centre, opens directly to the chosen section, and allows switching between Profile and Settings inside the same modal.

On desktop/larger tablets the modal uses a compact section rail plus larger content area. On smaller screens it adapts to a near-full-screen modal with compact section switching.

The modal closes via its close control, Escape or backdrop. Focus behaviour must remain accessible.

Profile owns authenticated learner identity information. The learner may correct the first name Revision uses for personalisation. That edit updates the authenticated user's own identity metadata and must not make database-owned classification such as administrator permission client-editable. Email remains read-only until a separately governed email-change/reverification journey exists.

Settings owns implemented learner preferences such as appearance. Administrator tools do not appear inside Profile.

## Tablet and mobile navigation

Tablet and mobile do **not** use a persistent multi-item bottom navigation bar.

Instead they use a compact application-shell pattern based on familiar modern conversational products while retaining Revision's own brand system:

- a **two-line menu control at the top left**;
- a compact REV identity treatment beside it in the top bar;
- a left-side navigation drawer opened by the menu control; and
- **Ask REV anchored persistently near the bottom of learner screens as the only persistent bottom action**.

The interaction may take usability cues from products such as ChatGPT, but it must not copy another product's visual identity. Revision uses Calm Teal, Manrope, its own rounded-line icons, Living E and approved light/dark surfaces.

### Tablet/mobile drawer

Opening the top-left menu reveals a left-side drawer over the current screen. The drawer always keeps the learner-wide destinations recognisable:

1. Home
2. Plan
3. Progress
4. Courses

When the current route belongs to Courses, the same saved-course branch used on desktop appears beneath Courses. This is **route-scoped progressive disclosure**, not an always-open site tree: the learner's courses are visible within the active Courses branch and only the selected course expands into focused sections.

Selecting a contextual child page navigates to that page and closes the drawer. Reopening the drawer reconstructs the hierarchy from the new current route so orientation is preserved.

The active destination/page is clearly indicated without relying on colour alone.

The lower part of the drawer uses the same progressive-disclosure principle as desktop account access. When the drawer first opens, account utilities are **collapsed by default**. Only one compact learner account control is shown, containing:

- learner avatar/initial; and
- learner name.

Selecting that learner account control expands the account utilities inline. Selecting it again collapses them. The resting learner control remains compact and must not expose email or a stack of account links until the learner deliberately opens it.

The expanded account utilities contain:

- Profile;
- Settings;
- Admin only when the authenticated user has database-governed administrator permission;
- Upgrade plan when governed and available, or a truthful forthcoming/unavailable treatment before then; and
- Log out.

Ask REV is not duplicated as an ordinary drawer destination because its persistent bottom action already provides global access.

The drawer closes after navigation, on its close control, on Escape, or when the learner selects the backdrop. Reopening the drawer begins again with learner account utilities collapsed. Opening it must not create horizontal page scrolling or leave the underlying page as a competing interaction layer.

## Persistent Ask REV dock

Across ordinary tablet/mobile learner screens, Ask REV remains anchored near the bottom edge and above the device safe area.

The dock:

- is the **only persistent bottom learner action**;
- uses the Living E plus an explicit `Ask REV` label;
- remains reachable while the learner scrolls;
- must not obscure page actions or content, so learner screens reserve sufficient bottom space;
- opens the contextual REV conversation layer rather than forcing a page change; and
- disappears when the contextual REV layer itself is open or where the learner is already using the expanded REV workspace.

Admin is an operational surface rather than an ordinary learner screen, so the learner Ask REV dock is not required within Admin.

On mobile, selecting Ask REV opens a near-full-screen or full-screen conversational layer appropriate to the available space while preserving a natural route back to the underlying activity. On tablet, Ask REV may use a side sheet, large overlay or equivalent responsive treatment.

## Desktop Ask REV behaviour

Selecting Ask REV on desktop should not normally navigate the learner away from the current screen. It opens a substantial contextual REV conversation layer, preferably a right-hand panel or equivalent responsive overlay.

REV receives relevant approved context from the current screen, including where applicable learner-wide destination, subject metadata, active course/specification, paper/component, topic, Learn/Practice/Exam Prep/Progress context, current activity/feedback, plan context and learner evidence/progress context.

At learner-wide scope, REV must use the learner's active course set rather than treating every published course as the learner's programme.

The learner should not need to restate information Revision already knows. The conversation layer may provide a route to the expanded REV workspace for longer work.

## Home-specific REV input

Home may additionally present a prominent `Ask REV anything...` input as part of its calm REV-led hero.

This is not redundant:

- persistent Ask REV means **REV is available anywhere**;
- the Home input means **Home is a natural place to begin a conversation**.

The Home hero remains spacious; recommendation and Today's plan follow without competing with the opening conversation/search treatment.

## Visual treatment

All navigation uses the approved Revision Brand System.

### Desktop

- quiet left-rail surface;
- REV identity and Ask REV prominent;
- Primary Teal / approved surfaces for branded emphasis;
- ordinary global destinations neutral with restrained active state;
- saved-course/contextual children smaller, indented and visually subordinate to their parent;
- only the selected course expands into focused sections;
- one compact learner identity/account row at the bottom;
- compact elevated account popover;
- centred Profile/Settings modal with no REV halo; and
- no badges or unrelated contextual tools added to the global rail.

### Tablet and mobile

- no five-item bottom navigation bar;
- two-line top-left menu control with a minimum 44×44px touch target;
- left-side drawer using approved surface, border, radius/elevation and focus treatments;
- Home, Plan, Progress and Courses remain recognisable as global destinations;
- the active Courses branch may expose saved courses and the selected course's focused sections using the same hierarchy as desktop;
- one compact learner account row at the bottom of the drawer, with account utilities hidden until that row is selected;
- persistent bottom Ask REV dock uses Living E with restrained halo/state treatment;
- the dock is visually prominent without becoming neon, sci-fi or decorative AI theatre;
- light and dark mode preserve the same structure; and
- drawer/dock controls remain touch, keyboard and assistive-technology usable.

## Light and dark mode

Light and dark modes are first-class versions of the same navigation system. Information architecture, ordering and interaction model remain the same. Dark mode uses approved Calm Teal dark surfaces and must not drift into neon styling.

## Guardrails

- Do not restore the five-item tablet/mobile bottom navigation without a new Founder-approved authority change.
- Do not add Subjects back as a fifth peer destination alongside Courses without a new Founder-approved authority change.
- Do not present the full published catalogue as though every course belongs to the learner.
- Do not turn the desktop rail or mobile drawer into an always-expanded sitemap or dumping ground for unrelated tools.
- Expand only the selected course into its focused sections; do not expand every course simultaneously.
- Learn, Practice, Exam Prep and contextual Progress appear in navigation only within the selected course/component context; they do not become new learner-wide destinations.
- Preserve subject, course/specification and paper/component identities in the academic/content model even though Subject is no longer a required learner navigation hop.
- Do not hard-code navigation around a single subject, qualification or exam board.
- Do not delete historic learning evidence merely because a learner removes a course from the active programme.
- Do not make REV a separate assistant relationship at different product levels.
- Do not require a learner to leave their current task merely to ask REV a contextual question.
- Do not duplicate Ask REV in the mobile drawer merely because the drawer has space.
- Do not expose the tablet/mobile account utility stack by default when the drawer first opens; use the compact learner account control as progressive disclosure.
- Do not duplicate Profile and Settings as permanent desktop rail rows.
- Do not attach Profile or Settings to the right screen edge as though they are Ask REV.
- Do not expose Admin unless the authenticated user has governed administrator permission.
- Do not make administrator classification editable from Profile or browser account controls.
- Preserve deep-linking/addressability for product destinations and contextual work independently of the Ask REV overlay.

## FI-020 implementation boundary

FI-020 completed the governed Definition of Ready and received explicit Founder `Analyse → Ready` approval on 2026-08-22.

Material production implementation may begin only after this approved v0.8 authority change is integrated into current `main`, and must then follow the Governed Implementation Workflow. Implementation must establish persisted authenticated learner-course membership, a truthful Add/Remove Course experience, programme-scope filtering and safe compatibility for legacy subject-first deep links before Courses can be treated as fully delivered.

## Documentation impact

This v0.8 direction requires the Courses hierarchy to remain aligned across `Information Architecture.md`, applicable planning/journey authority, the canonical learner-shell technical documentation, route/catalogue implementation, persistence/RLS implementation and responsive browser assurance. Historical Design Acceptance evidence remains historically true and should be appended/superseded rather than rewritten.
