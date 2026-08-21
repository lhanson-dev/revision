# Global Learner Navigation

**Status:** Active authority — v0.1  
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

### Bottom area

The bottom of the sidebar contains account utilities, normally:

- Profile
- Settings

`Log out` is an account action rather than a destination and should normally live within the authenticated account/profile controls rather than occupying equal persistent navigation prominence.

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
- do not apply the REV halo to ordinary navigation items; and
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

Dark mode must use the approved Calm Teal dark-theme surfaces and must not drift into neon or sci-fi styling. REV may retain its subtle soft halo; ordinary navigation should not.

## Guardrails

- Do not turn the desktop rail into a dumping ground for contextual learning tools.
- Learn, Practice and Exam Prep remain contextual to subject/course/paper/topic scope.
- Do not make REV a separate assistant relationship at different product levels.
- Do not require a learner to leave their current task merely to ask REV a contextual question.
- Do not duplicate navigation destinations simply because desktop has more space.
- Keep the learner-wide navigation flat and recognisable.
- Preserve deep-linking/addressability for product destinations and contextual work independently of the Ask REV overlay.

## Documentation impact

Implementation of this model requires the current learner-shell technical documentation and responsive navigation implementation to be updated when development begins.

The existing `Information Architecture.md`, `Adaptive Revision Planning.md` and any other general authority describing REV as a peer primary destination should be aligned with this specific navigation authority during the next governed documentation-alignment change. Until then, this document governs navigation-specific conflicts.
