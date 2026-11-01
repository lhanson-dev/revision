# Course Overview exploration visual refresh — 1 November 2026

**Target:** canonical learner app `/revision/app/#/courses/:courseId/overview`, including the equivalent module Overview section where the shared spotlight component appears.

**Owner:** `src/app/CourseExperienceScreen.tsx` renders the page and `CourseSectionSpotlights`; `src/app/course-overview-v2.css` owns this composition; reusable `Icon` and `Button` come from `src/app/ui/`. The global Ask REV entry remains in the shared learner shell. Legacy `#/subjects/...` hashes are compatibility routes, not a separate screen to edit.

## Design-only change

- Remove the separate lower “Ask REV about this course” panel from shared-course Overview. The existing REV recommendation at the top and persistent global Ask REV access remain.
- Keep the four existing destinations Learn, Practice, Exam Prep and Progress but replace generic neutral boxes with a controlled responsive family: rounded-line shared icons, coherent brand-tinted icon backgrounds, stronger headings, short learner-focused explanations and a quiet accent rule. Layout stays two columns where space allows and one column on phone.
- Preserve saved Practice and exam entry semantics, including genuine “In progress” emphasis, correct route owners, exact saved-work checks, and the absence of false Learn/Progress unfinished states. Preserve no-change to recommendation, evidence, progress, exam timing, service reads, database and subscription gating.
- Course-specific subject hue and REV Living E are deliberately not used as activity icons/decoration: icons designate **activity type**, not subject or learning status.

## Verification and release boundary

Test all four sections in the AQA course Overview, saved vs ordinary states, Light and Dark, desktop/tablet/phone down to 320px, keyboard focus, touch targets and reduced-motion settings. Confirm four accessible labels/icons, existing links, absence of the lower Ask REV CTA, no horizontal overflow and correct single-column stacking. The Founder approved the redesigned Course Overview visual captures on 1 November 2026 after reviewing CI #4067 Light/Dark desktop and phone evidence. The two desktop C4 screenshot digests are scoped to that approval, documented in `audits/2026-11-01-pr754-course-overview-visual-approval.md`; phone and unrelated Home/Learn hashes must remain unchanged. Existing Home/Learn baselines must remain unaffected.

This entry records an implementation candidate with a visual-only approval; the CI and merge gates remain separate. No change is merged, deployed or live until checks and Founder-specific PR approval pass. The normative composition update is in `20-brand-and-experience/Learner Design System.md` §19. No ADR, source/assessment assurance or historical audit rewrite is required for this scoped visual refinement.
