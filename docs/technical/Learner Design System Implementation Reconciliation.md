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
| Course Overview | REMOVE + FIX | implementation repeats a subject hero, full `Your path` status treatment and separate `Weak spots` panel alongside REV | Remove duplicate dashboard structures and rebuild as calm orientation/decision surface; preserve evidence and recommendation semantics |
| Learn | KEEP after PR #585 | reading-first learner experience now uses canonical headings, surface, radius, REV and focus roles; merged at `127439007325712bb088f467e1991db1f4c4616e` | Preserve its educational structure and previously approved visual baselines |
| Practice sustained `PracticeDialog` activity | REMOVE | active Practice still runs the sustained learner task inside a dialog | Replace with page-level focused Practice workspace; keep evidence/feedback behaviour |
| Practice task/feedback components | KEEP / FIX | flashcards, questions, calculations, written work and feedback are implemented and tested | Recompose into focused workspace rather than rewrite learning logic |
| Exam Prep | FIX | page remains a course section but existing exam experience still carries older focus/dialog assumptions | Keep preparation page in shell; focus only dedicated exam-performance activity |
| Exam Simulator / timed mock | FIX | existing full-paper implementation and persistence are useful | Move focused activity to canonical full working environment; preserve timing/persistence/evidence contracts |
| REV recommendation/conversation behaviour | KEEP | governed reasoning and contextual conversation implementation exist | Preserve behaviour; reconcile presentation to Deep Teal + Living E everywhere REV is genuinely present |
| Light/Dark semantic base | KEEP | central theme translation and integrity tests exist | Preserve |
| local/v2 theme roles | REMOVE (after migration) | `--rv-bg`, `--rv-surface`, etc. form a parallel theme generation | Migrate bounded consumers then delete |
| responsive breakpoints/canvas | KEEP after C2 | 1100 / 820 / 760 and 960 / 620 geometry remains; shell primitives now share ownership | Preserve |
| visual/browser/accessibility assurance | KEEP / FIX | Playwright theme, accessibility, overflow and visual-regression gates exist | Extend assertions to reconciled roles; update visual baselines only after explicit Founder visual approval |
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
5. Practice — combined page-level workspace composition and compatibility retirement;
6. Exam Prep / Exam Simulator / contextual REV;
7. Auth / first-use / onboarding learner entry surfaces.


The Home/Progress slice is complete and production-verified via PR #575 / merge `7d53e4747ee5f8780e153eb1bd5b3577fb3298cc`. It removed direct `--rv-*` consumption from `home-v2.css` and `progress-v2.css`, moved ordinary surfaces/borders/text/actions/focus/radii onto canonical semantic roles, and added centrally owned responsive learner H1/H2/H3 display roles plus inverse-feature secondary/accent text roles. Behavioural Home recommendation logic and governed Progress meaning were unchanged. The Founder explicitly approved the four Home visual baselines (phone/desktop × light/dark) from exact-head CI #2882 on 8 October 2026; post-merge CI #2888, production deployment #466, production smoke and `revision/path-to-live` all passed.

The Plan slice is complete and production-verified via PR #578 / merge `f974631b907452375963a490a24e85b490c23949`. It removed Plan's direct `--rv-*` consumption, moved Plan surfaces/text/actions/focus onto canonical roles, replaced historical 24px / 18px / 16px / 10px shape values with the canonical 12 / 14 / 20 / 28 / 999 family according to component job, and adopted the centrally owned learner display heading roles. Planner calculation, assessment setup, availability, session persistence, Day/Week/Month behaviour and recommendation semantics remained unchanged. The Founder approved the retained desktop light/dark captures; exact-head CI #2904 passed and the governed production workflow `37908725991` completed successfully.

The Courses / Course Overview slice is complete and production-verified via PR #583 / merge `9b8dfd7b288583f92456f6d19c49905e318bcd04`. It retired direct local `--rv-*` usage and superseded local radii from the Courses index and existing Course Overview presentation without changing membership, Add/Remove Course behaviour, navigation hierarchy, progress meaning or recommendation semantics. The Founder approved the tablet Courses light/dark visual baselines; exact-head CI #2911 passed, post-merge CI #2912 passed, and production workflow `37944287567` completed successfully. The known Course Overview composition debt — duplicate identity hero, full `Your path` treatment and separate `Weak spots` panel — remains deliberately deferred to C4. Shared `RevSuggestionCard` compatibility styling remains part of later shared/contextual REV retirement work.

The completed Learn slice keeps the Founder-approved reading-first route, hierarchy, teaching narrative, outer course-section frame, treatment semantics, contextual REV help, previous/next flow and Practice handoff unchanged. It moves the outer Learn frame and educational treatments onto canonical learner surface/radius roles, replaces Learn-local direct `--rv-*` REV aliases with inverse semantic roles, adopts canonical learner H2/H3 display roles, aligns Quick Check geometry, and uses the shared focus ring. The Founder reviewed and explicitly approved the desktop Learn light/dark captures on 9 October 2026. Exact-head CI #2917 on `862e0940f9bda8fa7e3a426dff86fb7c7af01b83` reproduced identical run/retry digests, and those approved baselines are pinned in `tests/e2e/interface-visual-regression.spec.ts`.

### Current bounded Practice implementation package (draft branch; unmerged)

Following the verified PR #585 Learn merge (`127439007325712bb088f467e1991db1f4c4616e`; CI #2928 and Pages #475 passed), Practice is the next package. `PlannerRuntime → CourseExperienceScreen → FocusedLearningWorkspace` is the canonical route owner. Sustained Practice work no longer uses `PracticeDialog` or its scrim/focus trap; only the Exam Prep mock still uses the legacy dialog until the Exam package while retaining the existing setup, question/deck/written task state, feedback, summary, evidence/save, retry and Learn-topic handoff. Practice CSS now uses canonical learner semantic, display, radius and focus roles rather than direct `--rv-*` values. This is a single governed composition-and-token change, not two passes or a learning-logic rewrite. Existing approved Practice screenshots must fail closed until newly captured Light/Dark responsive visuals are reviewed by the Founder; no baseline digests are re-pinned in this branch.

The remaining packages are Exam Prep/Simulator, Course Overview composition (including PR #582 supersession review), Auth/First Use/Onboarding plus shared REV and final compatibility retirement, then derived Design Lab reconciliation. Keep the obsolete compatibility namespace until **all** live consumers are proven migrated.

### C3 assurance execution rule

For each remaining C3 surface, reconcile only the tests that directly exercise that surface before implementation. Keep behavioural, persistence, accessibility, evidence, security and navigation contracts intact. Update or remove only assertions that clearly encode superseded visual implementation details such as retired local radii, fixed heading sizes, old theme colours or `--rv-*` roles. Do not start a repository-wide test-modernisation or opportunistic cleanup programme. Visual baselines continue to fail closed once per intentional appearance change and are re-pinned only after explicit Founder review.

Before deleting the `--rv-*` namespace, decouple the canonical `--learning-status-*` roles and any remaining shared semantic roles (including the shared Practice scrim) from `--rv-*` values without changing their governed learner-facing meaning. Auth, first-use and onboarding are included because they are live learner entry surfaces and still consume the compatibility namespace; their inclusion does not reopen public marketing or wider brand work. Delete an alias only when repository search and assurance prove no live consumer remains.

### Remaining page-composition corrections (combine with token retirement when they share a live surface)

Handle the material composition changes that are not token substitutions:

- Course Overview duplication removal;
- page-level focused Practice replacing sustained `PracticeDialog`;
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
