# Shell and navigation

**Status:** built in PR 4 (`design/shell-navigation`), merged to `main` (#486) with Founder approval, 1 October 2026.
**Authority:** `10-product-governance/Global Learner Navigation.md` (v0.11), `docs/design-system/RESPONSIVE.md`, `docs/design/decisions/2026-10-01-learner-redesign-v2.md`.

## What the student sees

| Width | Navigation |
| --- | --- |
| Above 960px (desktop, laptop) | The 248px left sidebar: wordmark, Ask REV, Home, Plan, Progress, Courses (with the saved-course branch), and the avatar, name and account menu at the bottom left |
| 621 to 960px (tablet) | The 84px icon rail: a two-line menu button at the top, then Ask REV, Home, Plan, Courses, Progress as icons. The menu button opens the full left navigation |
| 620px and below (phone) | A slim top bar with the two-line menu button and the wordmark, and a bottom tab bar: Home, Plan, **REV raised in the centre**, Courses, Progress |

- **The two-line menu** opens the same left navigation on tablet and phone as the desktop sidebar: the course list and the active section's contents, with the avatar, Profile, Settings, Admin (administrators only), Upgrade plan (coming soon) and Log out at the bottom.
- **Ask REV** opens as a pop-up over the page. On desktop and tablet it is a panel on the right; on a phone it takes the whole screen, and closing it returns to the same place. There is no floating Ask REV button any more.
- **Exam Prep opens in the normal shell** (Exam Prep v2.2, PR 1): the sidebar, rail or tab bar, the course header and the section tabs all stay, with Exam Prep selected. The old focus mode and its "Leave Exam Prep" bar are gone. Only a mock exam opens as a pop-up over the faded page (the Practice pop-up shell). See `docs/features/exam-prep.md`.
- **Appearance** (Settings): Light, Dark or **System** (the default). System follows the device and changes live.

## Rules as built

- The current destination carries `aria-current="page"`; the tab bar and rail controls are real buttons with accessible names; controls are at least 48px; the raised REV control is labelled "Ask REV".
- Only one of sidebar, rail and tab bar exists in the page at a time (chosen by width), so assistive technology never sees duplicate navigation.
- The page never scrolls sideways. Screens reserve space for the tab bar and respect the device safe area.
- Reduced motion: the Living E in the rail and tab bar stays still.

## Data used

None new. Navigation reads the student's saved courses and role as before. The theme choice is still stored in the browser. Saving it on the student's account so it follows them between devices needs the preferences table in the data model proposal (agreed, awaiting its own approval and migration PR).

## Tests that cover it

- `tests/e2e/mobile-tabbar.spec.ts`: sidebar, icon rail and tab bar by width; REV raised in the centre; Ask REV full screen on a phone.
- `tests/e2e/b7-final-acceptance.spec.ts`: tab bar never covers content; Exam Prep opens in the normal shell.
- `tests/e2e/ask-rev-cta.spec.ts`, `app-responsive.spec.ts`, `overlay-focus.spec.ts`, `accessibility.spec.ts`: Ask REV controls at every width, menu and overlay focus, axe checks.
- `tests/e2e/horizontal-scroll.spec.ts`: no sideways scroll at 1440, 1160, 960, 768, 620, 390 and 320px.
- `src/app/ui/learner-v2-components.test.tsx`: the shell components.

## Screenshots

Before and after, taken from `main` and from this branch on the same data, in `docs/design/learner-redesign-v2/screenshots/pr-04/` (`before-*.png`, `after-*.png`): desktop, tablet and phone Home, phone dark, Ask REV on a phone, the slide-out menu on phone and tablet, and Exam Prep on desktop and phone.

## Not done here

- Living E in the sidebar: the sidebar's Ask REV button already carries it; the full state set (listening, thinking) belongs to the Ask REV PR.
- The "Expand" link in the Ask REV panel (to the old full page) is still there; the Ask REV PR decides its fate.
- Old floating-button styles remain in `ask-rev-cta.css` and `mobile-navigation.css` as unused rules; they are removed with the Ask REV PR.
- The shared `AppShell` component is not used by the app yet: the existing runtime owns the course tree and account menu, so this PR adopts the shared `Rail` and `TabBar` and leaves the wrapper for screens that need it.
