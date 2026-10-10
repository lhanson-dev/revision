# Learner Design System Implementation Reconciliation

**Status:** Phase C implementation audit and rollout plan  
**Baseline:** Phase C1 merged to `main` at `292d455135e720c4819f0ac2aad1b77c2717f45f`  
**Authority:** `20-brand-and-experience/Learner Design System.md` plus the relevant specialist numbered authority  
**Scope:** learner product only; public marketing, pricing and Admin redesign remain outside this programme

## Purpose

Record the production implementation state against the reconciled learner design authority before page-by-page visual work resumes.

This is implementation truth, not normative authority. It classifies current code as:

- **KEEP** — coherent and fit for the approved system;
- **FIX** — correct ownership or useful implementation, but inconsistent/incomplete against current authority;
- **REMOVE** — duplicate, obsolete or compatibility-only implementation that should be retired once its live consumers are migrated; or
- **DECIDE** — genuine product/design ambiguity requiring Founder input.

No current Phase C item requires a new Founder design decision. Existing authority is sufficient.

## Current classification

| Area | Classification | Current evidence | Required action |
| --- | --- | --- | --- |
| `src/app/brand-tokens.css` semantic Brand/Neutral/Functional roles | KEEP | Calm Teal, semantic themes, spacing, controls and learner canvas already central | Preserve as canonical implementation owner |
| canonical learner radii / overlay roles | FIX | feature 32px, modal 24px and menu 16px predate the 7 Oct authority | Align shared roles to 28 / 20 / 12 and keep REV major conversational layer at 28 |
| `--rv-*` v2 token namespace | REMOVE (after migration) | parallel colour/radius generation remains in Course Overview shared dependencies, Exam and other later C3 surfaces; Home, learner-wide Progress and Plan no longer consume it directly | Migrate consumers to canonical semantic roles in bounded PRs, then delete aliases proven unused |
| shared `Button`, fields, status, overlay shells and focus contract | KEEP | central `src/app/ui/` ownership with established accessibility assurance | Reuse; only adjust shared visual roles where authority changed |
| `RevMark` four-state learner model | KEEP | Waiting/Listening/Thinking/Responding map to one Living E implementation | Preserve |
| `RevPresence` Completed state + motion | REMOVE | fifth state survives only as legacy runtime/design-lab capability | Remove and assure four-state contract |
| subject palette / `SubjectBadge` | KEEP | central hue/mark mapping and mark component exist | Preserve |
| canonical course identity | KEEP after C2 | shared `CourseIdentity` consumes the central subject hue/mark map and is used by the page header and contextual course branch | Preserve one reusable mark + name + qualification/exam-board/specification pattern |
| shared icon registry | KEEP | recurring UI/navigation glyph ownership is central | Preserve; add only proven reusable jobs |
| learner desktop shell | KEEP after C2 | canonical `PlannerRuntime` consumes shared `Sidebar`, `Rail` and `TabBar` shell primitives | Preserve shared ownership and route semantics |
| `AppShell` shell abstraction | KEEP as shared composition helper after C2 | desktop `Sidebar` anatomy is the same component consumed by canonical `PlannerRuntime`; Rail/TabBar remain shared | Do not reintroduce a separate desktop sidebar implementation |
| contextual drawer / account overlay infrastructure | KEEP / FIX | shared focus shells are correct; visual radii still use old roles | Preserve interaction ownership; align geometry |
| persistent REV access | KEEP after C2 | desktop Sidebar, tablet Rail and phone TabBar all use the Living E with Deep Teal REV treatment | Preserve; ordinary actions remain Primary Teal |
| Home composition | FIX | current REV/Home implementation mixes older fidelity/v2 layers | Recompose later against current Home authority using shared system; retain truthful recommendation logic |
| Plan | KEEP after C3 slice 2 | product behaviour is unchanged and the canonical Plan stylesheet now consumes learner semantic/display/radius roles with no direct `--rv-*` dependency | Preserve adaptive-plan semantics and canonical presentation |
| learner-wide Progress | KEEP after C3 slice 1 | governed three measures are implemented and the learner-wide route now consumes canonical semantic roles with no direct `--rv-*` dependency | Preserve evidence semantics and canonical presentation; course-level Progress remains separately scoped |
| Courses | KEEP after C3 slice 3 | responsive course UI uses canonical learner semantic/display/radius roles with governed subject identity; PR #583 is production-verified | Preserve course membership/navigation behaviour and canonical presentation |
| Course Overview | KEEP after PR #592 merge | canonical orientation composition merged to `main` and production deployment/smoke verified, with no changed recommendation/evidence meaning | Preserve the governed C4 REV-and-Progress hierarchy and four approved visual captures |
| Learn | KEEP after PR #585 | reading-first learner experience now uses canonical headings, surface, radius, REV and focus roles; merged at `127439007325712bb088f467e1991db1f4c4616e` | Preserve its educational structure and previously approved visual baselines |
| Practice activity workspace | KEEP after PR #589 | live Practice now uses page-level `PracticeActivityWorkspace`; approved six visual baselines and evidence contracts are production-verified | Preserve the page-level composition and scoped task semantics |
| Practice task/feedback components | KEEP after PR #589 | flashcards, questions, calculations, written work, feedback and evidence are retained in the canonical workspace | Preserve established learning, retry, evidence and feedback contracts |
| Exam Prep | FIX — active Exam reconciliation package | page remains a course section but existing exam experience still carries older focus/dialog assumptions | Keep preparation page in shell; focus only dedicated exam-performance activity |
| Exam Simulator / timed mock | FIX — active Exam reconciliation package | existing full-paper implementation and persistence are useful | Move focused activity to canonical full working environment; preserve timing/persistence/evidence contracts |
| REV recommendation/conversation behaviour | KEEP | governed reasoning and contextual conversation implementation exist | Preserve behaviour; reconcile presentation to Deep Teal + Living E everywhere REV is genuinely present |
| Light/Dark semantic base | KEEP | central theme translation and integrity tests exist | Preserve |
| local/v2 theme roles | REMOVE (after migration) | `--rv-bg`, `--rv-surface`, etc. form a parallel theme generation | Migrate bounded consumers then delete |
| responsive breakpoints/canvas | KEEP after C2 | 1100 / 820 / 760 and 960 / 620 geometry remains; shell primitives now share ownership | Preserve |
| visual/browser/accessibility assurance | KEEP / FIX | Playwright theme, accessibility, overflow and visual-regression gates exist | Extend assertions to reconciled roles; update visual baselines only after explicit Founder visual approval |
| Auth / First Use / Onboarding | FIX — active C3 learner-entry presentation slice | live `AuthGate → FirstUseBoundary → FirstUseGate` keeps three isolated `auth-v2.css`, `first-use-v2.css`, `onboarding-v2.css` compatibility role consumers | Retire direct `--rv-*` roles in entry presentation only; preserve all account, selection, course, exam-date, availability, first-activity and evidence contracts |
| Design Lab | FIX (Phase D) | live reference surface uses real components but still contains stale specimens/gaps | Keep as derived production projection and comprehensively reconcile in Phase D |

## Phase C rollout order

### C1 — shared learner foundations — complete

Merged via PR #565. Central learner radius/overlay roles now match authority and the obsolete REV Completed state is removed.

### C2 — shell, identity and course orientation — complete

Merged via PR #566 and production-verified. The canonical runtime desktop sidebar now uses the shared `Sidebar` primitive, duplicate `.ui-sidebar` styling is retired, governed cross-device destination ordering is preserved, shell REV controls use Deep Teal + Living E, and `CourseIdentity` provides one reusable subject mark/name/hue pattern. No route or account semantics changed.

### C3 — v2 compatibility retirement by bounded surface family

Migrate retained `--rv-*` and hard-coded legacy learner values in small groups:

1. Home / learner-wide Progress — complete and production-verified via PR #575;
2. Plan — complete and production-verified via PR #578;
3. Courses / Course Overview — complete and production-verified via PR #583;
4. Learn / educational working surfaces — complete and production-verified via PR #585;
5. Practice — complete and production-verified via PR #589;
6. Exam Prep / Exam Simulator — active combined composition and compatibility slice; contextual REV retirement follows with shared entry work;
7. Auth / first-use / onboarding learner entry surfaces — active scoped visual-role migration; journey changes remain separate under draft PR #590.


The Home/Progress slice is complete and production-verified via PR #575 / merge `7d53e4747ee5f8780e153eb1bd5b3577fb3298cc`. It removed direct `--rv-*` consumption from `home-v2.css` and `progress-v2.css`, moved ordinary surfaces/borders/text/actions/focus/radii onto canonical semantic roles, and added centrally owned responsive learner H1/H2/H3 display roles plus inverse-feature secondary/accent text roles. Behavioural Home recommendation logic and governed Progress meaning were unchanged. The Founder explicitly approved the four Home visual baselines (phone/desktop × light/dark) from exact-head CI #2882 on 8 October 2026; post-merge CI #2888, production deployment #466, production smoke and `revision/path-to-live` all passed.

The Plan slice is complete and production-verified via PR #578 / merge `f974631b907452375963a490a24e85b490c23949`. It removed Plan's direct `--rv-*` consumption, moved Plan surfaces/text/actions/focus onto canonical roles, replaced historical 24px / 18px / 16px / 10px shape values with the canonical 12 / 14 / 20 / 28 / 999 family according to component job, and adopted the centrally owned learner display heading roles. Planner calculation, assessment setup, availability, session persistence, Day/Week/Month behaviour and recommendation semantics remained unchanged. The Founder approved the retained desktop light/dark captures; exact-head CI #2904 passed and the governed production workflow `37908725991` completed successfully.

The Courses / Course Overview slice is complete and production-verified via PR #583 / merge `9b8dfd7b288583f92456f6d19c49905e318bcd04`. It retired direct local `--rv-*` usage and superseded local radii from the Courses index and existing Course Overview presentation without changing membership, Add/Remove Course behaviour, navigation hierarchy, progress meaning or recommendation semantics. The Founder approved the tablet Courses light/dark visual baselines; exact-head CI #2911 passed, post-merge CI #2912 passed, and production workflow `37944287567` completed successfully. The known Course Overview composition debt — duplicate identity hero, full `Your path` treatment and separate `Weak spots` panel — remains deliberately deferred to C4. Shared `RevSuggestionCard` compatibility styling remains part of later shared/contextual REV retirement work.

The completed Learn slice keeps the Founder-approved reading-first route, hierarchy, teaching narrative, outer course-section frame, treatment semantics, contextual REV help, previous/next flow and Practice handoff unchanged. It moves the outer Learn frame and educational treatments onto canonical learner surface/radius roles, replaces Learn-local direct `--rv-*` REV aliases with inverse semantic roles, adopts canonical learner H2/H3 display roles, aligns Quick Check geometry, and uses the shared focus ring. The Founder reviewed and explicitly approved the desktop Learn light/dark captures on 9 October 2026. Exact-head CI #2917 on `862e0940f9bda8fa7e3a426dff86fb7c7af01b83` reproduced identical run/retry digests, and those approved baselines are pinned in `tests/e2e/interface-visual-regression.spec.ts`.

### Completed bounded Practice package (PR #589)

After PR #589 merged, Practice is no longer an active package. `PlannerRuntime → CourseExperienceScreen → FocusedLearningWorkspace` is the canonical route owner. Sustained Practice work no longer uses `PracticeDialog` or its scrim/focus trap; the separate Exam package now retires the final Exam mock dialog consumer while retaining the existing setup, question/deck/written task state, feedback, summary, evidence/save, retry and Learn-topic handoff. Practice CSS now uses canonical learner semantic, display, radius and focus roles rather than direct `--rv-*` values. This is a single governed composition-and-token change, not two passes or a learning-logic rewrite. The Founder-approved Practice screenshots are pinned and exact-head CI #2939, post-merge CI #2941, Pages #476 and path-to-live have passed.

After production-verified Exam Prep/Simulator PR #591, Course Overview C4 was merged via PR #592 at `16b58d077154cb34e5dfae1344849508c56193d5`, with production workflow #478 successful; post-merge CI is a separate in-progress gate at branch creation. The active remaining C3 package is learner-entry visual compatibility retirement. The separate Courses/Course Overview token-migration draft PR #582 is stale and superseded in intent by merged PR #583; it must not be merged into the new baseline. Auth/First Use/Onboarding, shared REV/compatibility cleanup, and derived Design Lab reconciliation follow independently. Keep the obsolete compatibility namespace until **all** live consumers are proven migrated.

### Practice visual baseline approval — 10 October 2026 (PR #589, merged)

The Founder explicitly approved the six Practice visual captures presented for PR #589: the phone start screen in Light and Dark, and focused active Practice on phone and desktop in Light and Dark. The reviewed source is CI #2936, commit `dffe1cac8c1199d798bc764c60351cdc727cc7be`, retained artifact `interface-visual-regression-38034719673` (ID `11663751219`). All 430 non-visual browser tests, 1,307 unit tests, typecheck, lint, production build, security scan and database assurance passed on that head; the six failures were exclusively unapproved visual baselines.

The two existing Practice start-screen SHA-256 digests and four focused-activity SHA-256 digests are pinned to those exact captures, with the active screenshots attached to each future test execution. The original 18-state B7 acceptance matrix and other page baselines remain unchanged. The Founder later approved the exact PR #589 merge, and the merge/deployment assurance subsequently completed successfully. No normative design authority changes were introduced.

### Practice screenshot determinism (CI #2938 follow-up)

The approved phone screenshot mismatch in CI #2938 was limited to animated Living E pixels in the global bottom dock (pixel-by-pixel analysis: no changed pixels elsewhere); the prior viewport-scroll diagnosis was not sufficient. The focused Practice screenshot assertion hashes decoded pixels from the Founder-reviewed CI #2936 images, excluding only the animated glyph square (64 × 64 at phone size) while retaining the unmasked native PNG evidence. Everything else, including all desktop pixels, remains exact-pixel fail-closed. No additional design approval, normative change or unrelated test cleanup is implied.

### Exam Prep / Simulator current bounded package (draft, unmerged)

PR #589 merged the canonical page-level Practice workspace to `main` as `7e722d895f6dd49e9ba00ffb072bb2d9f775a20f`; post-merge CI #2941 and Pages #476 passed. The remaining `PracticeDialog` live consumer is the mock entry in `ExamPrepSection`. The Exam package removes the legacy dialog wrapper and styles, keeps `ExamPrepPage` in the ordinary learner shell, displays untimed question work in-page, and gives timed full papers their existing dedicated full-viewport simulator. It migrates Exam Prep/Simulator direct `--rv-*` consumer CSS together. The rest of the timer, pause/stop, written-answer, self-marking, evidence and persistence engine remains unchanged. This resolves a superseded composition and its styling debt together instead of polishing an obsolete dialog.

Exam Prep and timed mock tablet Light/Dark screenshot differences were held fail closed in CI #2948; the Founder subsequently approved those four captures on 10 October 2026 and only those B7 hashes are re-pinned. Any future change remains fail closed. Fresh exact-head CI and independent PR #591 merge approval are still required. Current normative `Learner Design System.md` §20 already requires this boundary, so the B5 implementation record is updated without creating competing design authority.

### PR #591 Exam Prep visual baseline approval — 10 October 2026 (draft; unmerged)

Founder response “Approve PR #591” is interpreted as approval of the four screenshots explicitly requested in the preceding visual review, **not** a merge instruction. The four tablet Light/Dark captures from CI #2948, SHA-256 reproducible across initial run/retry and retained as artifact `11666565708`, are pinned without touching other B7 states. CI #2948 had 433 browser passes and only four anticipated visual mismatches; all non-visual job gates were green. Subsequent exact-head CI and separate explicit `Approve merge PR #591` remain mandatory.

### C4 Course Overview orientation package — draft, unmerged (10 October 2026)

Canonical signed-in route: `PlannerRuntime → CourseExperienceScreen`, with the existing `CourseHeader` owning course identity/board/qualification and course-section navigation. Current approved `Learner Design System.md` §19 requires one next action plus reason, three truthful overall Progress measures and a quiet contextual Ask REV beneath, not a second hero or a topic dashboard. The bounded C4 implementation removes the duplicate subject identity hero, the full-topic `Your path` status list, and permanent `Weak spots` side panel. It keeps REV's existing `recommendationHeading`/`recommendationCopy`, next-section routing, and `ProgressMeasures` `progressSummary`/readiness evidence meaning intact, with a restrained exam-date line showing loading/error/not-set honestly. Detailed topic status and actionable explanations remain available through canonical Course Progress. This is a visual/composition correction, not a new recommendation or content engine.

CI #2959 reached browser assurance with 436/441 passing. The four C4 visual screenshots failed closed exactly as intended; the remaining Psychology restricted-pilot journey assertion still targeted the removed redundant `Psychology · 17 topics` hero. The Psychology test now confirms canonical CourseHeader identity, specification 7182 and the new REV next-step heading while retaining its existing Learn/Practice/Exam Prep/Progress traversal and 17-topic Progress count. The initial CI #2959 screenshots also exposed unhelpful vertical stretching of the REV panel and oversized aggregate Progress cards on desktop. The page-owned C4 CSS now top-aligns the REV recommendation, compresses the three evidence cards, and applies the canonical 20px ordinary surface radius without altering shared Progress primitives or numeric values. Fresh screenshot review must use the later exact-head CI captures, not the pre-adjustment CI #2959 captures. The existing `scripts/assurance/c3-courses-token-migration.test.mjs` stylesheet contract is narrowed only where C4 removed the obsolete topic status/pill rows; it still enforces canonical semantic roles and zero direct `--rv-*` consumption. The no-24px-radii guarantee stays intact. Existing `RevSuggestionCard`, `CourseHeader`, `ProgressMeasures` and `Button` are reused; the scoped `course-overview-v2.css` replaces obsolete page-owned legacy classes rather than adding another compatibility layer. The active learner authority is unchanged; only this technical reconciliation document and directly affected browser contracts need updating. The C4 visual review adds four **separate additive** fail-closed desktop/phone Light/Dark screenshot checks in the visual test file, without widening the fixed 18-state B7 matrix. Exact CI PNG captures are retained for Founder approval; all 18 established B7 baseline states are unchanged. CI #2958 identified the 18-state invariant, so the C4 captures were moved out of the core matrix rather than weakening the governing test. No unrelated historical PR, site-wide style, Admin, marketing or course-content changes belong to this slice. **Do not merge until a specific Founder approval for the exact C4 PR.**

### C4 Course Overview visual-baseline approval — 10 October 2026 (PR #592, not merge approval)

The Founder replied **"Approve PR #592"** to the explicit **"Approve PR #592 Course Overview visual baselines"** request, after reviewing desktop and phone Light/Dark comparisons. This authorises only the four Course Overview visual hashes shown in those reviewed captures. Source is CI #2961 on exact head `88ccc7aac1a68bb70304a7666044545d17c76b22`, retained `interface-visual-regression-38057084252` artifact **11671549345**. The screenshots were independently SHA-256 matched to browser output. Of 441 browser checks, **437 passed** and the only four failures were the deliberate C4 `PENDING_FOUNDER_APPROVAL` holds. All **1,307 unit tests**, typecheck, lint, build, secret scan and database/RLS assurance passed. This approval pins only the four C4 captures (desktop and phone, Light and Dark); **all 18 existing B7 visual states and digests remain unmodified**. New exact-head CI must pass before considering merge. This is **not merge authority**: PR #592 stays draft and unmerged until separate explicit `Approve merge PR #592`.

### C3 learner entry visual-role migration — draft, unmerged (10 October 2026)

Canonical signed-in/unauthenticated entry is `/app/ → src/main.tsx → AuthGate → FirstUseBoundary → FirstUseGate → PlannerRuntime`. This bounded slice replaces direct retired `--rv-*` values in the three late-loaded entry stylesheets `auth-v2.css`, `first-use-v2.css`, and `onboarding-v2.css` with already-owned semantic learner colour, surface, control, display, focus and radius roles. Desktop sign-in retains its genuine REV inverse panel. Capability-description chips use restrained inverse colours instead of treating decorative product labels as learning statuses or subject hues. First-use cards, course choices, exam-date controls and weekly availability steppers inherit the same canonical shape and focus grammar. Behaviour, labels, state machines, form submissions, persistence, role permissions, evidence, onboarding step order and which settings are optional are explicitly unchanged.

This slice does **not** implement the separate draft [PR #590](https://github.com/lhanson-dev/revision/pull/590) Student lifecycle authority: optional exam-date ordering and deferral of weekly study-time collection remain governed separately when that authority is merged/ready. Avoid concurrent work on `OnboardingPlanSetup` behaviour here. Existing `auth-entry.spec.ts` and `student-first-use.spec.ts` journey/security checks remain intact. Add only a narrow stylesheet-ownership contract and four explicit fail-closed desktop sign-in / phone experience-selection Light/Dark visual-review slots; B7's original 18-state matrix stays unchanged. Pin only after specific Founder screenshot review; merge requires separate Founder approval.

Documentation impact: implementation truth updated here and in `Authentication Implementation.md` and `Student First-Use Onboarding Implementation.md`. Canonical normative learner design and current auth/journey authority are unchanged, so no new normative decision or ADR is implied.

### C3 assurance execution rule

For each remaining C3 surface, reconcile only the tests that directly exercise that surface before implementation. Keep behavioural, persistence, accessibility, evidence, security and navigation contracts intact. Update or remove only assertions that clearly encode superseded visual implementation details such as retired local radii, fixed heading sizes, old theme colours or `--rv-*` roles. Do not start a repository-wide test-modernisation or opportunistic cleanup programme. Visual baselines continue to fail closed once per intentional appearance change and are re-pinned only after explicit Founder review.

Before deleting the `--rv-*` namespace, decouple the canonical `--learning-status-*` roles and any remaining shared semantic roles (including the shared Practice scrim) from `--rv-*` values without changing their governed learner-facing meaning. Auth, first-use and onboarding are included because they are live learner entry surfaces and still consume the compatibility namespace; their inclusion does not reopen public marketing or wider brand work. Delete an alias only when repository search and assurance prove no live consumer remains.

### Remaining page-composition corrections (combine with token retirement when they share a live surface)

Handle the material composition changes that are not token substitutions:

- Course Overview duplication removal;
- continued retirement of superseded learner dialogs only where live consumers are proven migrated;
- Exam Prep versus focused exam-activity boundary;
- any reusable REV/Progress/course-orientation pattern exposed by those changes.

These remain separate visual PRs with before/after evidence and Founder approval.

## Guardrails

Phase C must not change:

- learner evidence meaning;
- educational truth or course content;
- adaptive planning/recommendation logic;
- progress/readiness semantics;
- marking rules;
- exam timing/persistence rules; or
- entitlement behaviour

unless a genuine authority conflict is separately surfaced.

A design-system defect is fixed at the highest correct owner:

`authority → tokens → shared primitive/component → specialist pattern → page composition`.

Do not patch a page to conceal a system-level defect.

## Documentation impact

This document records current implementation debt and rollout order only. It does not create design authority.

Each Phase C PR must update this record and the relevant existing technical documentation when implementation ownership changes. Historical B1–B7 evidence remains historical and is not rewritten.
