# REV Homepage Shell Implementation

**Status:** current implementation description  
**Updated:** 2026-08-21

## Purpose

Describe the governed React learner shell at `/app/`, including the REV-led Home, persistent contextual Ask REV access, responsive global navigation, compact account utilities, centred Profile/Settings modal, adaptive Plan, catalogue-driven subject/course hierarchy, paper-specific Exam Prep and evidence-aware guidance.

## Canonical learner route and runtime

The governed learner product is:

`/revision/app/` → `app/index.html` → `src/main.tsx` → `src/app/AuthGate.tsx` → `src/app/PlannerRuntime.tsx`

`PlannerRuntime` owns the canonical signed-in global learner shell and responsive navigation. It renders Home, Plan, the full REV workspace and Admin directly. Catalogue, subject, course/component and Progress content continue to be delegated to `src/app/App.tsx` where required. When `App` is nested inside `PlannerRuntime`, its older embedded global navigation is suppressed so only one learner-wide navigation surface is presented.

Admin must not enter the nested compatibility `App` simply to reuse `ContentOperations`. `PlannerRuntime` owns the administrator-permission check and renders `ContentOperations` or `PlannerAdminScreen` directly once that check resolves. This prevents compatibility Home/REV UI from appearing while Admin permission is being established.

The repository root `/revision/` remains a lightweight redirect into `/revision/app/`. GitHub Pages publishes the built Vite `dist/` artifact.

## Global learner navigation and Ask REV

Normative navigation authority is `10-product-governance/Global Learner Navigation.md`.

The learner-wide destinations are:

1. Home
2. Plan
3. Progress
4. Subjects

REV is a persistent global action rather than a peer destination that must be visited before the learner can ask for help.

### Desktop

Desktop uses a persistent left navigation rail containing:

- REV identity;
- prominent **Ask REV**;
- Home;
- Plan;
- Progress;
- Subjects; and
- one compact learner account control at the bottom.

The account control shows a Calm Teal circular initial/avatar plus the learner's current first name. Profile and Settings are not duplicated as permanent navigation rows.

Selecting the account control opens a compact elevated menu anchored above the control. The ordinary learner menu contains Profile, Settings, Upgrade plan as a clearly unavailable `Coming soon` item while FI-002 remains before `Ready`, and Log out. Users whose own `public.profiles.is_admin` is `true` additionally see Admin.

The account menu closes after selection, on Escape, when the learner clicks outside the account area, or when another learner-wide action opens/navigates.

### Tablet and mobile

Widths up to 960px do not render the previous five-item fixed bottom navigation.

The canonical responsive shell contains:

- a compact sticky top bar;
- a **two-line menu button on the top left**;
- REV wordmark beside the menu button;
- a left-side modal navigation drawer; and
- a persistent bottom **Ask REV** dock on ordinary learner screens.

The drawer contains Home, Plan, Progress and Subjects as the learner-wide destinations. Its lower account area now mirrors the desktop progressive-disclosure model: when the drawer first opens, it shows only one compact learner row with avatar/initial and first name. Profile, Settings, permission-gated Admin, forthcoming Upgrade plan and Log out are hidden until that learner row is selected.

`PlannerRuntime` tracks this with `mobileAccountOpen`. The learner trigger exposes `aria-expanded` and `aria-controls`, and the utility group remains in the DOM with the `hidden` attribute while collapsed. Reopening the navigation drawer resets the account section to collapsed. The resting mobile account trigger intentionally does not expose the learner email, matching the compact desktop identity treatment.

The drawer is rendered only while open. It uses a modal backdrop, closes on navigation, backdrop, explicit close or Escape, resets the learner-account disclosure when it closes, and temporarily locks body scrolling while open. The active learner destination uses `aria-current="page"` and an accessible non-colour active marker.

The previous `runtime-bottom-nav` is removed from the canonical `PlannerRuntime` markup. Responsive tests assert that it is absent.

### Persistent mobile/tablet Ask REV dock

`PlannerRuntime` renders `runtime-mobile-ask-rev-dock` for learner routes other than Admin and the expanded REV workspace, provided the contextual REV layer is not already open.

The dock:

- is fixed above `env(safe-area-inset-bottom)`;
- uses Living E `RevPresence` plus the explicit `Ask REV` label;
- is centred with a bounded width on phone/tablet;
- uses Calm Teal role tokens and restrained elevation;
- opens the existing contextual REV conversation layer; and
- receives reserved bottom page space so it does not obscure learner content/actions.

When the contextual REV layer opens, the dock disappears. The expanded `#/rev` workspace already supplies its own REV interaction and therefore does not show a second dock. Admin does not show the learner dock.

## Centred Profile / Settings modal

Profile and Settings use `src/app/AccountModal.tsx` as one centred account workspace over the existing learner screen rather than a right-edge drawer or separate full-page route.

Desktop/larger-tablet behaviour includes restrained backdrop, centred elevated window, compact Profile/Settings rail, larger content area, close/Escape/backdrop dismissal, keyboard focus containment/return and Calm Teal surfaces with no REV halo.

On small screens the same modal becomes a near-full-screen surface with Profile/Settings switching across the top.

### Profile

Profile displays the learner's current identity information and allows the learner to edit the **first name** Revision uses for personalisation.

The save path is:

`AccountModal` → `PlannerRuntime.updateLearnerFirstName` → `supabase.auth.updateUser({ data: { first_name } })`

The returned Auth user replaces learner-shell user state so the Home greeting, account-menu/drawer name and avatar initial update immediately.

The first name is stored in the signed-in identity's `user_metadata.first_name`. It is deliberately not stored through client mutation of `public.profiles`, because `profiles` contains database-owned classification such as `is_test_user` and `is_admin` and remains non-client-editable.

Email remains read-only until a separately governed email-change/reverification flow exists. Admin controls do not appear inside Profile.

### Settings

Settings currently exposes Appearance using explicit Light and Dark choices and writes through the existing `revision:theme` preference.

## Admin route behaviour

Admin is a secondary operational route reached from the permission-gated account menu/drawer.

`PlannerRuntime` owns the browser-side discovery check against the signed-in user's `public.profiles.is_admin` value. The route behaves fail-closed:

- unresolved permission shows neutral `Checking Admin access…`;
- authorised general Admin renders `ContentOperations` directly;
- authorised `#/admin/planner` renders `PlannerAdminScreen` directly; and
- denied/error permission shows an explicit unavailable state rather than learner Home.

On tablet/mobile, Admin is only discoverable after the learner expands the collapsed account section. The browser check controls discovery/presentation only. Protected Admin data and operations continue to authorize independently at server/database boundaries.

## Ask REV behaviour

Selecting Ask REV opens a contextual conversation layer without replacing the current learner screen. Desktop uses a right-hand panel. Tablet/mobile use the existing full/near-full-screen responsive overlay treatment. The panel reuses `PlannerRevScreen` and can expand into the full `#/rev` workspace.

The full `#/rev` route remains supported as the expanded REV workspace/compatibility destination rather than ordinary primary navigation.

## Home composition

Home is the default signed-in destination and remains deliberately calmer than a conventional dashboard.

The opening composition is:

1. Living E presence;
2. personalised `Hey {name}, what shall we do today?` greeting;
3. large `Ask REV anything…` input;
4. current REV recommendation; and
5. Today's plan.

Submitting the Home input stores the draft in session storage and opens the contextual Ask REV layer. Recommendation and Today's plan remain planner/evidence driven.

## Theme behaviour

Light and dark mode use the same information architecture and component hierarchy.

Theme roles come from `src/app/brand-tokens.css`. Desktop rail, account popover, account modal, responsive drawer, mobile/tablet REV dock, Home surfaces and contextual REV panel use role-based Calm Teal theme tokens.

The learner canvas is flat in both themes; the REV halo is owned by `RevPresence` rather than a page-level decorative gradient.

## Learner hierarchy

Subject Home groups published material by course/specification.

For shared-syllabus courses, Revision presents one course-level learning scope:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

Learn, general Practice and course/topic Progress appear once. Exam Prep contains individual papers/components and their paper-specific written-question and timed/full-paper practice.

If components genuinely expose different syllabus content, each component may retain its own Overview / Learn / Practice / Exam Prep / Progress context.

`src/app/catalogue-model.ts` determines shared-learning course structure from validated content packs rather than route-specific subject branches.

## Routes

GitHub Pages does not provide arbitrary SPA rewrites, so learner hierarchy uses reloadable hash routes.

Course-level shared learning:

`#/subjects/:subjectId/courses/:courseId/:section`

Component routes:

`#/subjects/:subjectId/modules/:moduleId/:section`

`#/rev` remains the expanded REV workspace route.

There is no production Profile or Settings hash route; those utilities are modal sections. Admin remains a protected operational route rendered by canonical `PlannerRuntime`. Upgrade Plan remains deliberately non-interactive until its governed route exists.

## Evidence behaviour

The learner shell loads persisted evidence under existing module/paper identifiers so provenance and exam-attempt attribution remain intact.

For shared-learning courses, course-level state aggregates applicable module evidence once for recommendation/readiness calculations while paper-specific exam attempts remain attributable to the paper that generated them.

Global Progress and REV use the same combined evidence model.

## Key implementation files

- `src/app/PlannerRuntime.tsx` — canonical signed-in shell, desktop navigation, mobile/tablet drawer, collapsed mobile learner-account disclosure, persistent Ask REV dock, account permission gating, first-name Auth update, contextual REV layer and direct Admin route rendering.
- `src/app/mobile-navigation.css` — top-left two-line menu, responsive left drawer, collapsible mobile account area and fixed Ask REV dock treatment.
- `src/app/AccountModal.tsx` — shared centred Profile/Settings workspace and first-name edit form.
- `src/app/account-modal.css` — modal positioning and responsive layout.
- `src/app/profile-edit.css` — editable Profile field, save and feedback styling.
- `src/app/sidebar-account-menu.css` — desktop learner identity trigger and compact account popover.
- `src/app/PlannerHomeScreen.tsx` — REV-led Home hero, recommendation and Today's plan.
- `src/app/planner-runtime.css` — canonical shell/Home/Ask REV responsive foundations.
- `src/app/brand-tokens.css` — Calm Teal theme roles.
- `src/app/PlannerRevScreen.tsx` — shared REV planning conversation.
- `src/app/ContentOperations.tsx` — general protected Admin content rendered directly by canonical runtime.
- `src/app/PlannerAdminScreen.tsx` — planner-specific Admin assurance content.
- `src/app/App.tsx` — catalogue, Subject Home, course/component and Progress compatibility content when nested; older Home/REV compatibility rendering remains non-canonical.
- `tests/e2e/app-responsive.spec.ts` — responsive hierarchy, drawer/account disclosure, REV dock, account/profile/Admin permission behaviour and global-navigation assurance.
- `tests/e2e/admin-entry-transition.spec.ts` — regression assurance that Admin entry never mounts the legacy `.rev-hero` compatibility Home treatment.

## Compatibility and competing surfaces

The canonical learner shell is `PlannerRuntime` on `/revision/app/`.

Older global navigation and Home/REV renderers inside `App` are compatibility implementation only. They are not learner-wide source of truth. When nested in `PlannerRuntime`, their embedded global navigation is suppressed.

The compatibility Home/REV implementation must never be used as an authorization fallback.

## Deployment and smoke evidence

GitHub Pages publishes the Vite `dist/` artifact. Production smoke continues to verify canonical React app and legacy retirement. Responsive CI verifies the changed navigation before merge.

Responsive browser assurance for this navigation model should prove:

- desktop retains four learner destinations plus persistent Ask REV in the left rail;
- tablet/mobile no longer render `runtime-bottom-nav`;
- the top-left menu button contains the intended two-line treatment;
- opening the responsive drawer exposes Home, Plan, Progress and Subjects;
- tablet/mobile learner account utilities are collapsed when the drawer first opens;
- selecting the learner account row exposes Profile, Settings, forthcoming Upgrade, Log out and Admin only for authorised users;
- closing and reopening the drawer returns learner account utilities to the collapsed state;
- the bottom Ask REV dock remains fixed and opens contextual REV;
- Profile/Settings modal behaviour remains intact;
- updated learner name propagates to learner-shell identity;
- no horizontal page overflow is introduced; and
- Admin remains independently protected.

## Documentation and authority

Normative navigation/account-placement authority is `10-product-governance/Global Learner Navigation.md`, supported by `10-product-governance/Information Architecture.md`, `10-product-governance/Authentication Experience.md`, `40-evidence-and-trust/Privacy and Student Data Principles.md` and the engineering Security Standard.

The v0.6 Global Learner Navigation model retains the v0.5 retirement of the five-item tablet/mobile bottom navigation and adds collapsed learner-account disclosure within the responsive drawer. Visual tokens and Living E styling remain governed by the Visual Brand System.

Historical audits and decision records remain unchanged because this is a current learner-shell/navigation refinement rather than a rewrite of historical evidence.
