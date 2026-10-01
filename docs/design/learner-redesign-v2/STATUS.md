# Learner redesign v2: status tracker

**Updated:** 1 October 2026 (PR 1, design-system v2.1). Every later redesign PR updates this file.
**Decisions:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. **Start here:** `00-START-HERE.md`.

How to read it: **Foundations** means the design values, building blocks and checks exist but no screen uses them yet. **Not started** means nothing is built. Nothing is "done" until a PR is merged by Lee.

## Features

| Feature | What it is | Built so far | PR | What is left | Decisions pending |
| --- | --- | --- | --- | --- | --- |
| F1 | REV suggests (with a reason, chosen by rules) | REV card component (existing `RevSuggestionCard`, also exported as `RevCard`) | PR 1 | Suggestion rules in code; Home wiring | The 14-day and 7-day windows (tune after testing). How the new four-step order sits beside the current planner logic |
| F2 | Guided session (Learn, Practice, Exam Prep) | Step list inside the REV card | PR 1 | Session flow on Home | None |
| F3 | "REV noticed" patterns | Deferred for launch. Session and answer history to be kept | n/a | Comes back later | When it returns and its evidence bar (open item 5) |
| F4 | Smarter Plan | Not started | PR 6 | Week first, Day/Week/Month, REV-added sessions, study time, exam dates | Planned sessions and study time need new data (PR 2 proposal) |
| F5 | Practice feedback bar and retry queue | Answer option styling (inside Quick check) | PR 9 | Feedback bar, retry queue | Retry queue needs new data (PR 2 proposal) |
| F6 | Exam Prep focus mode and examiner checklist | Examiner guide component; shell has a focus mode that hides navigation | PR 10 | Papers, timer, confirm before leaving a running paper, checklist behind a switch that stays off until the release gate passes | Who supplies marked answers for the release gate (open item 2) |
| F7 | Progress: three measures | Status labels, understanding bar, three-measure component | PR 11 | Course and global Progress screens; engine mapping to the five labels | Exam readiness format (open item 1) |
| F8 | Ask REV with real answers (pop-up; full screen on phone) | REV mark with four states and text for every state | PR 12 | Real model answers, prompt chips, safeguarding | The model (test Claude Sonnet 5.5), cost and logging, in the PR 2 proposal |
| F9 | Onboarding | Not started | PR 13 | Level, subjects, board, dates, time, first plan | Coming-soon requests need new data (PR 2 proposal) |
| F10 | Empty states | Not started | PR 14 | Per-screen sweep | None |
| F11 | Subject colours and letter marks | Palette tokens, central subject map, letter-mark badge | PR 1 | Use them on course cards and Plan blocks | Catalogue columns `hue` and `mark` (PR 2 proposal) |
| F12 | Light, dark or system theme | Tokens for both themes; Appearance control now Light / Dark / System (System default) in Settings | PR 4 | Theme control, saved per student so it is the same on every device, system as default | Saving per student needs the preferences table (PR 2 proposal, agreed; awaiting its approval) |
| F13 | Quick check (Learn, Not scored) | Quick check component | PR 3, PR 8 | Content schema block (PR 3), Learn wiring (PR 8) | Lee to say go for PR 3 (Content Factory work) |
| F14 | Living E states | Four states, 1.4s thinking loop, text for every state; Living E in the sidebar Ask REV button, the rail and the raised tab-bar control (PR 4) | PR 4, PR 12 | Ask REV states in the conversation (PR 12) | None |

## Screens

| Screen | Branch | Built so far | PR | What is left |
| --- | --- | --- | --- | --- |
| Shell and navigation | `design/shell-navigation` | Built in PR 4 (open, awaiting review): sidebar 248px, icon rail on tablet, bottom tab bar with REV raised on phone, two-line menu still opens the left navigation with the account at the bottom, Ask REV pop-up (full screen on phone), Exam Prep focus mode with Leave Exam Prep, Appearance now Light / Dark / System | PR 4 | Account placement unchanged by design. Screens still to adopt the shared `AppShell` wrapper; saving the theme per student needs the preferences table (agreed, own PR). Doc: `docs/features/shell-navigation.md` |
| Home | `design/home` | Not started | PR 5 | Everything |
| Plan | `design/plan` | Not started | PR 6 | Everything |
| Courses and Course Overview | `design/courses-overview` | Not started | PR 7 | Everything. Also fix the known 320px sideways scroll on Course overview |
| Learn | `design/learn` | Not started | PR 8 | Everything |
| Practice | `design/practice` | Not started | PR 9 | Everything |
| Exam Prep | `design/exam-prep` | Not started | PR 10 | Everything |
| Progress | `design/progress` | Not started | PR 11 | Everything |
| Ask REV | `design/ask-rev` | Not started | PR 12 | Everything: pop-up shell, full screen on phone, real answers via the "ladder" in the PR 2 proposal |
| Sign-in and onboarding | `design/onboarding` | Not started | PR 13 | Everything |
| Empty-state sweep | `design/empty-states` | Not started | PR 14 | Everything |

## Phase 1 PRs

| PR | Branch | What | State |
| --- | --- | --- | --- |
| PR 1 | `claude/revision-v2-learner-redesign-3rigil` (asked for as `design-system-v2.1`) | Standards, tokens, building blocks, guardrails, docs | Open, awaiting Lee's review |
| PR 2 | `docs/learner-v2-data-model` | Data model proposal (plan only, no code) | Not started |
| PR 3 | Content Factory | Quick-check block in the Learn content schema | Waiting for Lee to say go |

## Known issues found by the new checks

| Where | Issue | Fixed in |
| --- | --- | --- |
| Course overview at 320px | Page is 336px wide in a 320px window (sideways scroll). Listed in `tests/e2e/horizontal-scroll.spec.ts` as known | PR 7 |
| ~~Phone and tablet navigation~~ | ~~Earlier tab bar on tablet~~ Resolved in PR 4: tablet now has the icon rail, phone the tab bar with REV raised | PR 4 |
| 15 existing files | 225 raw colour codes outside the token file. Listed in `scripts/design-guardrails/no-raw-colours.test.mjs`; they cannot grow, and each screen PR removes its own | PRs 4 to 14 |

## Decisions pending (Lee)

1. ~~Ask REV: a page, an overlay, or both?~~ **Decided 1 Oct:** a pop-up over the page; full screen on phones; no separate page.
2. ~~Engine to label mapping.~~ **Confirmed 1 Oct.** Mapping: good topic knowledge is Got it; medium is Nearly there; low is Needs work; not enough evidence is Just started if the student has answered anything in the topic, otherwise Not started. 
3. Open items 1 to 5 from the decisions file (readiness format, marked answers for the checklist, suggestion windows, safeguarding review before any parent or school alerts, "REV noticed" evidence bar).

## Decision log (design work)

Design decisions are logged here, not in the Content Factory run log, which is for factory work.

| Date | Item | What | Why |
| --- | --- | --- | --- |
| 2026-10-01 | Learner redesign v2 | Lee approved the decisions record and authorised updating the brand, navigation and behaviour standards to match | Founder decision, effective on merge of PR 1 |
| 2026-10-01 | Run log | Design decisions are logged in this file, not `content-factory/RUN_LOG.md`; a single `HANDOVER` line goes in the run log only if work stops part-way | Lee approved, 1 Oct 2026 |
| 2026-10-01 | Living E thinking loop | 1.4s (was 1.8s in code) | Founder decision; inside the 1.4 to 2.2s standard range |
| 2026-10-01 | Branch | PR 1 uses the session branch `claude/revision-v2-learner-redesign-3rigil` | Session setup; Lee approved |
| 2026-10-01 | Ask REV | Pop-up conversation over the page; full screen on phones; no separate page; real model used efficiently (answer from data and approved content first); safeguarding may use vetted fixed text; conversations kept 12 months, student can delete | Lee, later on 1 Oct. Standards and decision record updated |
| 2026-10-01 | Exam answers | Keep submitted answers and per-point feedback so progress and "what you got wrong" can use them | Lee; detail in the PR 2 proposal (awaiting its approval) |
| 2026-10-01 | Status-label mapping and data model | Lee confirmed the engine-to-label mapping, agreed all PR 2 recommendations, and agreed the theme is saved per student | Lee, 1 Oct. Standards and decision record updated |
| 2026-10-01 | Slide-out left navigation | Stays on tablet and phone, opened by the two-line menu; account (avatar, Profile, Settings, Log out) stays at its bottom; course tree stays inside it | Lee, 1 Oct: "keep the same". Navigation standard updated in PR 4 |
| 2026-10-01 | Exam Prep focus mode | All navigation hidden in Exam Prep; a slim Leave Exam Prep bar returns to the course overview; a running timed paper keeps its own Stop exam confirmation | Decisions file §1; the exit bar is my addition so students are never trapped (to be refined in PR 10) |
