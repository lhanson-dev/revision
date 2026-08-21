# Global Learner Navigation

**Status:** Active authority — v0.4  
**Owner:** Founder  
**Effective date:** 2026-08-21  
**Purpose:** Define the governed global learner navigation model and persistent REV access pattern across desktop, tablet and mobile.

## Authority relationship

This document is the specific product authority for global learner navigation and persistent access to REV.

Where the navigation sections of `Information Architecture.md`, `Adaptive Revision Planning.md`, `Core User Journeys.md` or current implementation documentation conflict with this approved model, this document governs the navigation-specific behaviour until those sources are brought back into alignment.

This decision does not change the academic hierarchy, the contextual Learn / Practice / Exam Prep / Progress structure, or the underlying requirement that REV preserves and uses relevant learner context.

## Core decision

REV is not primarily a peer navigation destination alongside Home, Plan, Progress and Subjects.

REV is a persistent global learner action that should be available from any learner screen.

The learner-wide destinations are:

- **Home**
- **Plan**
- **Progress**
- **Subjects**

The persistent global action is:

- **Ask REV**

A full REV workspace may still exist for extended conversation, but the ordinary access pattern is contextual Ask REV rather than requiring the learner to navigate away from their current task.

## Desktop navigation

Desktop uses a persistent left navigation rail / sidebar.

The sidebar should remain deliberately simple and calm rather than becoming a dense SaaS navigation surface.

### Top area

The top of the sidebar contains the REV identity and a visually prominent **Ask REV** action.

The primary learner destinations appear beneath it in this order:

1. Home
2. Plan
3. Progress
4. Subjects

The Ask REV action should receive the strongest branded emphasis in the navigation. Ordinary destinations should use restrained neutral styling with a clear active state.

### Bottom account control

The bottom of the desktop sidebar uses one compact authenticated account control rather than separate persistent Profile and Settings navigation rows.

The resting control should show:

- a circular avatar/initial treatment; and
- the learner's name.

Selecting the account control opens a compact account menu anchored to the sidebar. For an ordinary learner the menu should contain:

- **Profile**;
- **Settings**;
- **Upgrade plan**, when a governed plan-comparison or upgrade route is actually available; and
- **Log out**.

Where the authenticated user has the database-governed administrator permission, the same compact account menu additionally exposes **Admin**. The Admin item must not be rendered for a user without that permission.

Admin is an operational utility rather than learner profile information. Admin controls must not be placed inside the Profile modal simply because the user is an administrator. UI visibility is not the authorization boundary: protected Admin routes and services must continue to enforce administrator permission independently of whether a menu item is shown.

The menu is an account utility surface, not another primary navigation section. It should use the approved Calm Teal surface, border, typography and focus treatments while remaining visually quieter than Ask REV.

`Upgrade plan` must not masquerade as a working purchase control before the governed subscription/upgrade capability exists. While FI-002 remains before `Ready`, any visible preview of this menu item must be clearly marked unavailable or forthcoming and must not initiate an unapproved purchase journey. Once the governed upgrade route exists, the item should become the direct route into plan comparison/change rather than requiring a redesign of the account menu.

The compact account menu should close naturally after a selection, on Escape, or when the learner clicks/taps outside it.

### Profile and Settings modal behaviour

Profile and Settings use one shared **centred account modal workspace** rather than a right-edge drawer or a new full-page destination.

Selecting either Profile or Settings should:

- keep the underlying learner screen in place;
- dim the background with a restrained modal backdrop;
- open an elevated account window positioned near the centre of the viewport rather than attached to the right edge;
- open directly to the section the learner selected; and
- allow the learner to switch between Profile and Settings inside the same modal without returning to the sidebar account menu.

On desktop and larger tablets, the modal should use a simple two-area composition inspired by familiar modern application settings patterns:

- a compact internal section rail for **Profile** and **Settings**; and
- a larger content area for the selected section.

The interaction pattern may take usability cues from established products such as ChatGPT, but Revision must use its own approved Calm Teal visual system, Manrope typography, spacing, radius, focus treatment and surface hierarchy rather than copying another product's visual identity.

The modal should close via its close control, Escape or the modal backdrop. Focus behaviour must remain accessible and the underlying page must not become a second active interaction layer while the modal is open.

On mobile, the same account workspace should adapt to a near-full-screen modal with compact section switching rather than becoming a narrow desktop-style side drawer.

Profile owns authenticated learner identity/account information. The learner must be able to correct the first name Revision uses for personalisation from Profile. The edit should update the authenticated user's own identity metadata and must not make database-owned classification such as administrator permission client-editable. Email may remain read-only until a separately governed email-change/reverification journey exists.

Settings owns implemented learner preferences such as appearance. Future account settings may extend this modal only when separately governed; the modal must not become an unstructured dumping ground for unrelated product functions.

Administrator tools do not appear inside Profile. Authorised users reach the operational Admin experience through the permission-gated account-menu item.

### Desktop Ask REV behaviour

Selecting Ask REV should not normally navigate the learner away from the current screen.

It should open a substantial contextual REV conversation layer, preferably as a right-hand panel or equivalent responsive overlay that preserves the current learner screen where space allows.

REV should receive relevant approved context from the screen the learner is currently using, including where applicable:

- current learner-wide destination;
- subject;
- course/specification;
- paper/component;
- topic/specification area;
- current Learn, Practice, Exam Prep or Progress context;
- current activity or feedback context;
- relevant plan context; and
- relevant learner progress/evidence context.

The learner should not have to restate information the product already knows simply because Ask REV was opened.

The conversational layer should provide a route to expand into a larger/full REV workspace where a longer or more complex conversation benefits from additional space.

## Tablet and mobile navigation

Tablet and mobile retain the persistent bottom navigation pattern.

The visible destinations/actions remain:

**Home | Plan | REV | Progress | Subjects**

The centre REV treatment is a persistent **Ask REV action**, not merely a peer page destination.

It should remain visually prominent, accessible and consistently placed so a learner can ask REV from any primary learner screen.

### Mobile Ask REV behaviour

On mobile, selecting the centre REV action should open a near-full-screen or full-screen conversational sheet/layer appropriate to the available space while preserving enough context to return naturally to the underlying activity.

### Tablet Ask REV behaviour

On tablet, selecting REV should use a side sheet, large overlay or equivalent treatment appropriate to the available width. The interaction should preserve the same conceptual model as desktop and mobile: contextual Ask REV without forcing unnecessary navigation away from the current task.

### Tablet/mobile account behaviour

Tablet and mobile continue to use the secondary account/menu control in the top bar rather than reproducing the desktop left-rail account control. The same account jobs should remain available there as they become implemented, while preserving the fixed bottom bar for learner-wide navigation and Ask REV.

Selecting Profile or Settings from the tablet/mobile account menu should open the same governed account modal workspace, responsively adapted to the smaller viewport.

Where the authenticated user has administrator permission, the tablet/mobile account menu may expose the same **Admin** utility. It must remain absent for ordinary learners and must not bypass the protected Admin authorization boundary.

## Home-specific REV input

Home may additionally present a large, prominent `Ask REV anything...` input as part of its calm REV-led hero composition.

This is not redundant with the persistent Ask REV navigation action.

- the persistent action means **REV is available anywhere**;
- the Home input means **Home is a natural place to start a conversation**.

The Home hero should remain spacious and uncluttered. The learner-wide recommendation and Today's plan should follow below the hero rather than competing with it.

## Visual treatment

The navigation must use the approved Revision Brand System.

### Desktop

- use a quiet left-rail surface rather than a visually heavy enterprise sidebar;
- keep the REV identity and Ask REV action prominent;
- use Primary Teal and approved pale/dark surface tokens for branded emphasis;
- keep ordinary destinations neutral with restrained active-state treatment;
- use a single compact learner identity/account row at the bottom rather than duplicate Profile/Settings rows;
- render the account menu as a compact elevated surface within/adjacent to the rail, not a second navigation column;
- render Profile/Settings as a centred elevated modal with restrained backdrop, clear internal section navigation and no REV halo;
- do not apply the REV halo to ordinary navigation or account items; and
- do not add unnecessary section headings, badges, nested menus or secondary product features to the global rail.

### Tablet and mobile

- retain the approved persistent bottom bar;
- keep REV in the centre position;
- use the Living E identity for REV;
- preserve clear labels for Home, Plan, REV, Progress and Subjects;
- ensure active state is not communicated by colour alone; and
- keep touch targets and focus treatment accessible.

## Light and dark mode

Light and dark modes are first-class versions of the same navigation system.

The information architecture, spacing, ordering and interaction model should remain the same across themes.

Dark mode must use the approved Calm Teal dark-theme surfaces and must not drift into neon or sci-fi styling. REV may retain its subtle soft halo; ordinary navigation, account controls and account modal surfaces should not.

## Guardrails

- Do not turn the desktop rail into a dumping ground for contextual learning tools.
- Learn, Practice and Exam Prep remain contextual to subject/course/paper/topic scope.
- Do not make REV a separate assistant relationship at different product levels.
- Do not require a learner to leave their current task merely to ask REV a contextual question.
- Do not duplicate navigation destinations simply because desktop has more space.
- Do not duplicate Profile and Settings as both persistent rail rows and account-menu actions.
- Do not attach Profile or Settings to the right screen edge as though they are the same interaction as Ask REV; account management uses the centred account modal pattern.
- Do not expose Admin in learner account menus unless the user has the governed administrator permission.
- Do not make administrator classification editable from Profile or other browser account controls.
- Keep the learner-wide navigation flat and recognisable.
- Preserve deep-linking/addressability for product destinations and contextual work independently of the Ask REV overlay.

## Documentation impact

Implementation of this model requires the current learner-shell technical documentation and responsive navigation implementation to remain aligned.

`Information Architecture.md` remains compatible because it defines Profile, Settings and Admin as secondary account/operational utilities without prescribing a screen-edge treatment. Technical documentation and responsive assurance must explicitly reflect the centred account modal behaviour, permission-gated Admin entry and learner first-name correction.
