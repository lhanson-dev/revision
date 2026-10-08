# Learner Design System Implementation Reconciliation

**Status:** Phase C implementation audit and rollout plan  
**Baseline:** Phase C2 merged to `main` at `e0cfa16336b679e117f6d2dcebf2e30b032d25e2`  
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
| `--rv-*` v2 token namespace | REMOVE (after migration) | parallel colour/radius generation still drives Plan, Course Overview, Practice, Exam, learner entry surfaces and other retained v2 styles; Home and learner-wide Progress are migrated in C3.1 | Continue bounded migrations, then delete aliases proven unused |
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
| Home visual roles | KEEP after C3.1 | canonical Home behaviour remains intact and `home-v2.css` no longer consumes `--rv-*`; canonical semantic colours, display roles, focus and radii now own its presentation | Preserve current behaviour; later composition work only where separately governed |
| Plan | FIX | product behaviour is coherent but v2/local visual roles remain | Migrate visual roles without altering adaptive-plan semantics |
| learner-wide Progress | KEEP after C3.1 | governed three measures remain unchanged and `progress-v2.css` no longer consumes `--rv-*`; presentation now uses canonical semantic/type/radius roles | Preserve evidence semantics and canonical visual ownership |
| Courses | FIX | current responsive course UI works but carries v2/local visual layer | Reconcile visual system and canonical subject identity |
| Course Overview | REMOVE + FIX | implementation repeats a subject hero, full `Your path` status treatment and separate `Weak spots` panel alongside REV | Remove duplicate dashboard structures and rebuild as calm orientation/decision surface; preserve evidence and recommendation semantics |
| Learn | KEEP / FIX | reading-first workspace and shared educational treatments are sound; some local 24px/v2 styling survives | Preserve educational structure; migrate visual values and course identity |
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

Merged via PR #566 / `e0cfa16336b679e117f6d2dcebf2e30b032d25e2`. The C2 implementation moves the canonical runtime desktop sidebar onto the shared `Sidebar` primitive, retires the duplicate `.ui-sidebar` styling, preserves governed cross-device destination ordering, changes shell REV controls to Deep Teal + Living E, and introduces one reusable `CourseIdentity` pattern using the central subject mark/hue map. No route or account semantics change.

### C3 — v2 compatibility retirement by bounded surface family

**C3.1 Home / learner-wide Progress — implementation candidate**

- `home-v2.css` and `progress-v2.css` no longer consume `--rv-*`;
- canonical learner H1/H2/H3/hero display-size roles are centrally owned in `brand-tokens.css`;
- governed learning-status colours keep their existing learner semantics/values but no longer depend on the compatibility namespace;
- shared Practice scrim and compatibility focus-border helpers no longer depend on `--rv-*`;
- Home/Progress behaviour, planner logic and evidence semantics are unchanged;
- visual changes are expected where old 24px cards, v2 surfaces and focus rings move to the canonical 20px/semantic roles; Home exact digests remain fail-closed and C3.1 adds new fail-closed desktop Light/Dark Progress digests so both surfaces require explicit Founder visual review.

Remaining groups:

1. Plan;
2. Courses / Course Overview;
3. Learn / educational working surfaces;
4. Practice;
5. Exam Prep / Exam Simulator / contextual REV;
6. Auth / first-use / onboarding learner entry surfaces.

The Home/Progress and Plan migrations are deliberately separate. Home/Progress are primarily semantic surface/text/action migrations, while Plan also carries extensive local 24px / 18px / 16px / 10px shape debt that needs its own visual review against the canonical 12 / 14 / 20 / 28 / 999 family.

C3.1 decouples the canonical `--learning-status-*` roles, shared Practice scrim and compatibility focus-border helper from `--rv-*` without changing their governed learner-facing meaning. Before deleting the namespace, prove that no other shared semantic role still depends on it. Auth, first-use and onboarding are included because they are live learner entry surfaces and still consume the compatibility namespace; their inclusion does not reopen public marketing or wider brand work. Delete an alias only when repository search and assurance prove no live consumer remains.

### C4 — page-composition debts required by authority

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
