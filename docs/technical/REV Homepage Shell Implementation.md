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
- a prominent **Ask REV** action;
- Home;
- Plan;
- Progress;
- Subjects; and
- one compact learner account control at the bottom.

The account control shows a Calm Teal circular initial/avatar plus the learner's current first name. Profile and Settings are not duplicated as permanent navigation rows.

Selecting the account control opens a compact elevated menu anchored above the control. The ordinary learner menu contains:

- Profile;
- Settings;
- Upgrade plan, currently a clearly unavailable `Coming soon` item while FI-002 remains before `Ready`; and
- Log out.

For an authenticated user whose own `public.profiles.is_admin` value is `true`, the menu also contains **Admin**. The Admin item is not rendered for ordinary learners. This is only a discovery control: protected Admin routes/services retain their own authorization enforcement.

The account menu closes after a selection, on Escape, when the learner clicks outside the account area, or when another learner-wide action opens/navigates.

### Centred Profile / Settings modal

Profile and Settings use `src/app/AccountModal.tsx` as one centred account workspace over the existing learner screen rather than a right-edge drawer or separate full-page route.

Desktop/larger-tablet behaviour includes:

- restrained modal backdrop;
- centred elevated account window;
- compact Profile/Settings section rail;
- larger content area for the selected section;
- close control, Escape dismissal and backdrop dismissal;
- keyboard focus containment and focus return; and
- Calm Teal role tokens with no REV halo.

On small screens the same modal becomes a near-full-screen surface with Profile/Settings switching across the top.

### Profile

Profile displays the learner's current identity information and allows the learner to edit the **first name** Revision uses for personalisation.

The save path is:

`AccountModal` → `PlannerRuntime.updateLearnerFirstName` → `supabase.auth.updateUser({ data: { first_name } })`

The returned Auth user replaces the learner-shell user state so the Home greeting, account-menu name and avatar initial update immediately.

The editable first name is stored in the signed-in identity's `user_metadata.first_name`. It is deliberately **not** stored through client mutation of `public.profiles`, because `profiles` contains database-owned classification such as `is_test_user` and `is_admin` and remains non-client-editable.

Email is displayed read-only. Revision does not currently expose an email-change control because changing the authentication email requires a separately designed verification/recovery flow.

Admin controls do not appear inside Profile. Authorised users enter the operational experience from the permission-gated Admin item in the account menu.

### Settings

Settings currently exposes Appearance using explicit Light and Dark choices and writes through the existing `revision:theme` preference.

The Profile and Settings sections share the same modal; the learner may switch between them without closing it.

### Tablet and mobile account behaviour

Widths up to 960px retain the top-bar account/burger control and persistent bottom navigation:

**Home | Plan | REV | Progress | Subjects**

The burger opens the secondary account/additional-links menu. Profile and Settings hand off into the same responsive `AccountModal` used on desktop. Admin is included in this secondary menu only for users with administrator permission. There is no separate Planner-assurance shortcut in the account menu; operational sub-tools belong inside the Admin experience.

`Upgrade plan` remains deliberately unavailable until the FI-002 upgrade journey is governed and implemented.

## Admin route behaviour

Admin is a secondary operational route reached from the permission-gated account menu.

`PlannerRuntime` owns the browser-side discovery check against the signed-in user's `public.profiles.is_admin` value. The route behaves fail-closed:

- while the permission check is unresolved, the runtime shows a neutral `Checking Admin access…` state;
- when the user is authorised, the canonical Admin surface is rendered directly without mounting the legacy compatibility Home/REV shell;
- `#/admin/planner` renders `PlannerAdminScreen` directly;
- the general Admin route renders `ContentOperations` directly; and
- when the permission check resolves false or errors, the runtime shows an explicit unavailable state rather than substituting learner Home.

This browser check controls discovery/presentation only. Protected Admin data and operations continue to enforce administrator authorization independently at their server/database boundaries.

## Ask REV behaviour

Selecting Ask REV opens a contextual conversation layer without replacing the current learner screen. On desktop this is a right-hand panel; tablet/mobile use the responsive overlay treatment. The panel reuses `PlannerRevScreen` and can expand into the full `#/rev` workspace.

The full `#/rev` route remains supported as the expanded REV workspace/compatibility destination rather than ordinary primary navigation.

## Home composition

Home is the default signed-in destination and remains deliberately calmer than a conventional dashboard.

The opening composition is:

1. Living E presence;
2. personalised `Hey {name}, what shall we do today?` greeting;
3. large `Ask REV anything…` input;
4. current REV recommendation; and
5. Today's plan.

Submitting the Home input stores the draft in session storage and opens the contextual Ask REV layer. The recommendation and Today's plan remain planner/evidence driven.

## Theme behaviour

Light and dark mode use the same information architecture and component hierarchy.

Theme roles come from `src/app/brand-tokens.css` and follow the approved Calm Teal system. Desktop rail, account popover, account modal, Home surfaces, contextual REV panel and mobile bottom navigation use role-based theme tokens rather than a separate dark visual language.

The learner canvas is flat in both themes; the REV halo is owned by `RevPresence` rather than a page-level decorative gradient.

## Learner hierarchy

Subject Home groups published material by course/specification.

For shared-syllabus courses, Revision presents one course-level learning scope:

- Overview
- Learn
- Practice
- Exam Prep
- Progress

Learn, general Practice and course/topic Progress appear once. Exam Prep contains the individual papers/components and their paper-specific written-question and timed/full-paper practice.

If components genuinely expose different syllabus content, each component may retain its own Overview / Learn / Practice / Exam Prep / Progress context.

`src/app/catalogue-model.ts` determines shared-learning course structure from validated content packs rather than route-specific subject branches.

## Routes

GitHub Pages does not provide arbitrary SPA rewrites, so learner hierarchy uses reloadable hash routes.

Course-level shared learning:

`#/subjects/:subjectId/courses/:courseId/:section`

Component routes remain available for genuinely distinct content:

`#/subjects/:subjectId/modules/:moduleId/:section`

`#/rev` remains the expanded REV workspace route.

There is no production Profile or Settings hash route; those utilities are modal sections. Admin remains a protected operational route rendered by the canonical `PlannerRuntime`. Upgrade Plan remains deliberately non-interactive until its governed route exists.

## Evidence behaviour

The learner shell loads persisted evidence under existing module/paper identifiers so provenance and exam-attempt attribution remain intact.

For shared-learning courses, course-level state aggregates applicable module evidence once for recommendation/readiness calculations while paper-specific exam attempts remain attributable to the paper that generated them.

Global Progress and REV use the same combined evidence model.

## Key implementation files

- `src/app/PlannerRuntime.tsx` — canonical signed-in shell, navigation, account-menu permission gating, first-name Auth update, responsive account entry, contextual Ask REV layer and direct Admin route rendering.
- `src/app/AccountModal.tsx` — shared centred Profile/Settings workspace and first-name edit form.
- `src/app/account-modal.css` — modal positioning and responsive layout.
- `src/app/profile-edit.css` — editable Profile field, save and feedback styling.
- `src/app/sidebar-account-menu.css` — desktop learner identity trigger and compact account popover.
- `src/app/PlannerHomeScreen.tsx` — REV-led Home hero, recommendation and Today's plan.
- `src/app/planner-runtime.css` — canonical shell/Home/Ask REV responsive layout.
- `src/app/brand-tokens.css` — Calm Teal theme roles.
- `src/app/PlannerRevScreen.tsx` — shared REV planning conversation.
- `src/app/ContentOperations.tsx` — general protected Admin content rendered directly by the canonical runtime for authorised users.
- `src/app/PlannerAdminScreen.tsx` — planner-specific Admin assurance content rendered directly for authorised users.
- `src/app/App.tsx` — catalogue, Subject Home, course/component and Progress compatibility content when nested; it still contains older Home/REV compatibility rendering but does not own canonical Home, REV or Admin presentation.
- `src/app/catalogue-model.ts` — course grouping, shared-learning detection and course learning state.
- `src/app/navigation.ts` — global, course and component hash routes.
- `tests/e2e/app-responsive.spec.ts` — responsive hierarchy, account/profile/Admin permission behaviour and global navigation assurance.
- `tests/e2e/admin-entry-transition.spec.ts` — regression assurance that Admin entry never mounts the legacy `.rev-hero` compatibility Home treatment.

## Compatibility and competing surfaces

The canonical learner shell is `PlannerRuntime` on `/revision/app/`.

The older global navigation and older Home/REV renderers inside `App` are compatibility implementation only. They are not the learner-wide source of truth. When `App` is hosted by `PlannerRuntime`, its older embedded global navigation is suppressed.

The compatibility Home/REV implementation must never be used as an authorization fallback. In particular, Admin entry must remain within `PlannerRuntime` and must not mount `App.renderHome()` while permission state is unresolved or denied.

A future bounded refactor may retire the remaining compatibility Home/REV code once `App` has been fully separated into contextual catalogue/progress content. That cleanup is not required to correct the canonical Admin journey and should not be confused with the live product surface.

## Deployment and smoke evidence

GitHub Pages publishes the Vite `dist/` artifact. Production smoke should continue to verify the canonical React app and legacy retirement. Responsive CI additionally verifies the account behaviour before merge.

For the account/Admin refinement, browser assurance should prove:

- ordinary learners do not see Admin in the account menu;
- authorised users do see Admin in the account menu;
- Admin does not appear inside Profile;
- Profile permits an authenticated user to update their own first name;
- the updated name is reflected in learner-facing shell personalisation;
- database-owned administrator classification is not part of the profile edit payload;
- Profile/Settings modal accessibility and responsive behaviour remain intact;
- Admin remains protected independently of menu visibility; and
- entering Admin does not mount the legacy blue `.rev-hero` Home treatment at any point in the transition.

## Documentation and authority

Normative navigation/account-placement authority is `10-product-governance/Global Learner Navigation.md`, supported by `10-product-governance/Information Architecture.md`, `10-product-governance/Authentication Experience.md`, `40-evidence-and-trust/Privacy and Student Data Principles.md` and the engineering Security Standard.

Authentication metadata behaviour is described in `docs/technical/Authentication Implementation.md`.

Historical audits and decision records remain unchanged because this is a current account-shell refinement, not a rewrite of historical evidence.
