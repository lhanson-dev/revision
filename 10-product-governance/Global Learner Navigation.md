# Global Learner Navigation

**Status:** Active authority — v0.6  
**Owner:** Founder  
**Effective date:** 2026-08-21  
**Purpose:** Define the governed global learner navigation model and persistent REV access pattern across desktop, tablet and mobile.

## Authority relationship

This document is the specific product authority for global learner navigation and persistent access to REV.

Where the navigation sections of `Information Architecture.md`, `Adaptive Revision Planning.md`, `Core User Journeys.md` or the responsive-navigation wording in `20-brand-and-experience/Visual Brand System.md` conflict with this approved model, this document governs navigation behaviour. The Visual Brand System continues to govern Revision's palette, typography, spacing, radius, icon language, Living E treatment and other visual foundations.

This v0.6 model retains the v0.5 decision that explicitly superseded the earlier requirement for a five-item persistent tablet/mobile bottom navigation bar. That earlier treatment must not be implemented as the current learner navigation model.

This decision does not change the academic hierarchy, the contextual Learn / Practice / Exam Prep / Progress structure, or the requirement that REV preserves and uses relevant learner context.

## Core decision

REV is not primarily a peer navigation destination alongside Home, Plan, Progress and Subjects.

The learner-wide destinations are:

- **Home**
- **Plan**
- **Progress**
- **Subjects**

The persistent global action is:

- **Ask REV**

A full REV workspace may still exist for extended conversation, but ordinary access is contextual Ask REV rather than requiring the learner to navigate away from their current task.

## Desktop navigation

Desktop uses a persistent left navigation rail / sidebar.

### Top area

The top contains the REV identity and a visually prominent **Ask REV** action, followed by:

1. Home
2. Plan
3. Progress
4. Subjects

Ask REV receives the strongest branded emphasis. Ordinary destinations remain restrained and use a clear accessible active state.

### Bottom account control

The bottom of the desktop sidebar uses one compact authenticated account control showing:

- circular avatar/initial; and
- learner name.

Selecting it opens a compact account menu containing, for an ordinary learner:

- **Profile**;
- **Settings**;
- **Upgrade plan**, only when a governed plan-comparison or upgrade route is actually available; and
- **Log out**.

For a user with the database-governed administrator permission, the same menu additionally exposes **Admin**. Admin must not render for users without that permission. UI visibility is not the authorization boundary; protected Admin routes and services continue to enforce administrator permission independently.

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

Opening the top-left menu reveals a left-side drawer over the current screen. The drawer contains the learner-wide destinations:

1. Home
2. Plan
3. Progress
4. Subjects

The active destination is clearly indicated without relying on colour alone.

The lower part of the drawer uses the same progressive-disclosure principle as desktop account access. When the drawer first opens, account utilities are **collapsed by default**. Only one compact learner account control is shown, containing:

- learner avatar/initial; and
- learner name.

Selecting that learner account control expands the account utilities inline. Selecting it again collapses them. The resting learner control should remain compact and should not expose email or a stack of account links until the learner deliberately opens it.

The expanded account utilities contain:

- Profile;
- Settings;
- Admin only when the authenticated user has database-governed administrator permission;
- Upgrade plan when governed and available, or a truthful forthcoming/unavailable treatment before then; and
- Log out.

Ask REV is not duplicated as an ordinary drawer destination because its persistent bottom action already provides global access.

The drawer closes after navigation, on its close control, on Escape, or when the learner selects the backdrop. Reopening the drawer begins again with learner account utilities collapsed. Opening it must not create horizontal page scrolling or leave the underlying page as a competing interaction layer.

### Persistent Ask REV dock

Across ordinary tablet/mobile learner screens, Ask REV remains anchored near the bottom edge and above the device safe area.

The dock:

- is the **only persistent bottom learner action**;
- uses the Living E plus an explicit `Ask REV` label;
- remains reachable while the learner scrolls;
- must not obscure page actions or content, so learner screens reserve sufficient bottom space;
- opens the contextual REV conversation layer rather than forcing a page change; and
- disappears when the contextual REV layer itself is open or where the learner is already using the expanded REV workspace.

Admin is an operational surface rather than an ordinary learner screen, so the learner Ask REV dock is not required within Admin.

### Mobile Ask REV behaviour

On mobile, selecting the persistent Ask REV dock opens a near-full-screen or full-screen conversational layer appropriate to the available space while preserving a natural route back to the underlying activity.

### Tablet Ask REV behaviour

On tablet, Ask REV may use a side sheet, large overlay or equivalent responsive treatment. It remains the same contextual assistant relationship.

## Desktop Ask REV behaviour

Selecting Ask REV on desktop should not normally navigate the learner away from the current screen. It opens a substantial contextual REV conversation layer, preferably a right-hand panel or equivalent responsive overlay.

REV receives relevant approved context from the current screen, including where applicable learner-wide destination, subject, course/specification, paper/component, topic, Learn/Practice/Exam Prep/Progress context, current activity/feedback, plan context and learner evidence/progress context.

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
- ordinary destinations neutral with restrained active state;
- one compact learner identity/account row at the bottom;
- compact elevated account popover;
- centred Profile/Settings modal with no REV halo; and
- no unnecessary badges, nested menu complexity or contextual learning tools in the global rail.

### Tablet and mobile

- no five-item bottom navigation bar;
- two-line top-left menu control with a minimum 44×44px touch target;
- left-side drawer using approved surface, border, radius/elevation and focus treatments;
- Home, Plan, Progress and Subjects remain recognisable and flat inside the drawer;
- one compact learner account row at the bottom of the drawer, with account utilities hidden until that row is selected;
- persistent bottom Ask REV dock uses Living E with restrained halo/state treatment;
- the dock is visually prominent without becoming neon, sci-fi or decorative AI theatre;
- light and dark mode preserve the same structure; and
- drawer/dock controls remain touch, keyboard and assistive-technology usable.

## Light and dark mode

Light and dark modes are first-class versions of the same navigation system. Information architecture, ordering and interaction model remain the same. Dark mode uses approved Calm Teal dark surfaces and must not drift into neon styling.

## Guardrails

- Do not restore the five-item tablet/mobile bottom navigation without a new Founder-approved authority change.
- Do not turn the desktop rail or mobile drawer into a dumping ground for contextual learning tools.
- Learn, Practice and Exam Prep remain contextual to subject/course/paper/topic scope.
- Do not make REV a separate assistant relationship at different product levels.
- Do not require a learner to leave their current task merely to ask REV a contextual question.
- Do not duplicate Ask REV in the mobile drawer merely because the drawer has space.
- Do not expose the tablet/mobile account utility stack by default when the drawer first opens; use the compact learner account control as progressive disclosure.
- Do not duplicate Profile and Settings as permanent desktop rail rows.
- Do not attach Profile or Settings to the right screen edge as though they are Ask REV.
- Do not expose Admin unless the authenticated user has governed administrator permission.
- Do not make administrator classification editable from Profile or browser account controls.
- Preserve deep-linking/addressability for product destinations and contextual work independently of the Ask REV overlay.

## Documentation impact

This v0.6 model is aligned in the learner-shell technical documentation. `Information Architecture.md` already defines account utilities as secondary disclosure and therefore does not require a structural IA change for this refinement. Responsive implementation and browser assurance must remain aligned with this authority.
