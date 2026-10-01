# Learner redesign v2: status tracker

**Updated:** 1 October 2026 (PR 6, Plan). Every later redesign PR updates this file.
**Decisions:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. **Start here:** `00-START-HERE.md`.

**Merged to `main` with Lee's approval:** PR 1 (#480, foundations), PR 2 (#482, data model proposal), PR 4 (#486, shell and navigation). PR 5 (#487, Home). PR 3 (Content Factory) is waiting for Lee's go.

How to read it: **Foundations** means the design values, building blocks and checks exist but no screen uses them yet. **Not started** means nothing is built. Nothing is "done" until a PR is merged by Lee.

## Features

| Feature | What it is | Built so far | PR | What is left | Decisions pending |
| --- | --- | --- | --- | --- | --- |
| F1 | REV suggests (with a reason, chosen by rules) | REV card component; the four-step rules in `src/app/rev-suggestions.ts`; Home shows the rules' choice with its reason, "Suggest something else" and "Not now" (PR 5, merged) | PR 1, PR 5 | "Not now" is kept for the browser session only until the suggestion-events table exists. REV-added sessions and "Add to plan" come with Plan (PR 6) | The 14-day and 7-day windows (tune after testing). Home's card now follows the four rules, not the planner: Lee to confirm that is right (see PR 5) |
| F2 | Guided session (Learn, Practice, Exam Prep) | Step list inside the REV card | PR 1 | Session flow on Home | None |
| F3 | "REV noticed" patterns | Deferred for launch. Session and answer history to be kept | n/a | Comes back later | When it returns and its evidence bar (open item 5) |
| F4 | Smarter Plan | Week first, Day / Week / Month, today highlighted, solid subject colours and letter marks, study time and exam dates (PR 6, open) | PR 6 | REV-added sessions with REV PICK, "Add to" and "Move it", done sessions faded | Accepted sessions need new data (PR 2 proposal, own migration PR) |
| F5 | Practice feedback bar and retry queue | Answer option styling (inside Quick check) | PR 9 | Feedback bar, retry queue | Retry queue needs new data (PR 2 proposal) |
| F6 | Exam Prep focus mode and examiner checklist | Examiner guide component; shell has a focus mode that hides navigation | PR 10 | Papers, timer, confirm before leaving a running paper, checklist behind a switch that stays off until the release gate passes | Who supplies marked answers for the release gate (open item 2) |
| F7 | Progress: three measures | Status labels, understanding bar, three-measure component; engine band to label mapping in `src/app/topic-status.ts`; Home course tiles show Topics covered and Understanding (PR 5) | PR 11 | Course and global Progress screens; engine mapping to the five labels | Exam readiness format (open item 1) |
| F8 | Ask REV with real answers (pop-up; full screen on phone) | REV mark with four states and text for every state | PR 12 | Real model answers, prompt chips, safeguarding | The model (test Claude Sonnet 5.5), cost and logging, in the PR 2 proposal |
| F9 | Onboarding | Not started | PR 13 | Level, subjects, board, dates, time, first plan | Coming-soon requests need new data (PR 2 proposal) |
| F10 | Empty states | Not started | PR 14 | Per-screen sweep | None |
| F11 | Subject colours and letter marks | Palette tokens, central subject map, letter-mark badge; used on Home course cards (PR 5) | PR 1, PR 5 | Plan blocks, Courses, Progress | Catalogue columns `hue` and `mark` (PR 2 proposal) |
| F12 | Light, dark or system theme | Tokens for both themes; Appearance control now Light / Dark / System (System default) in Settings | PR 4 | Theme control, saved per student so it is the same on every device, system as default | Saving per student needs the preferences table (PR 2 proposal, agreed; awaiting its approval) |
| F13 | Quick check (Learn, Not scored) | Quick check component | PR 3, PR 8 | Content schema block (PR 3), Learn wiring (PR 8) | Lee to say go for PR 3 (Content Factory work) |
| F14 | Living E states | Four states, 1.4s thinking loop, text for every state; Living E in the sidebar Ask REV button, the rail and the raised tab-bar control (PR 4) | PR 4, PR 12 | Ask REV states in the conversation (PR 12) | None |

## Screens

| Screen | Branch | Built so far | PR | What is left |
| --- | --- | --- | --- | --- |
| Shell and navigation | `design/shell-navigation` | Merged in PR 4: sidebar 248px, icon rail on tablet, bottom tab bar with REV raised on phone, two-line menu still opens the left navigation with the account at the bottom, Ask REV pop-up (full screen on phone), Exam Prep focus mode with Leave Exam Prep, Appearance now Light / Dark / System | PR 4 | Account placement unchanged by design. Screens still to adopt the shared `AppShell` wrapper; saving the theme per student needs the preferences table (agreed, own PR). Doc: `docs/features/shell-navigation.md` |
| Home | `claude/friendly-clarke-gp8bca` (merged) | Merged in PR 5 (#487): the REV card chosen by the four rules with its reason, "Suggest something else", "Not now"; honest rest state when everything is put aside; course cards in subject colours with Topics covered and Understanding (no single percentage); next exam as neutral text with a clock; set-up empty state unchanged | PR 5 | Suggestion events table for "Not now" across devices; guided session steps; accepted sessions. Doc: `docs/features/home.md` |
| Plan | `design/plan` | Built in PR 6 (open, draft): week first with Day / Week / Month, today highlighted, sessions in solid subject colours with letter marks (were brand teal), next exam as neutral text with a clock, 48px study-time buttons, week becomes a day list on phone and tablet | PR 6 | "Add to Thursday", REV PICK label and faded done sessions need the accepted-sessions table (own migration PR). Free-slot picking does not apply: the plan works in days. Doc: `docs/features/plan.md` |
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
| PR 1 (#480) | `claude/revision-v2-learner-redesign-3rigil` | Standards, tokens, building blocks, guardrails, docs | Merged, Lee approved |
| PR 2 (#482) | `docs/learner-v2-data-model` | Data model proposal (plan only, no code) | Merged (#482), Lee approved. Lee agreed all its recommendations on 1 Oct. Each migration it describes is a separate PR needing its own approval |
| PR 3 | Content Factory | Quick-check block in the Learn content schema | Waiting for Lee to say go |
| PR 4 (#486) | `design/shell-navigation` | Shell and navigation | Merged, Lee approved |
| PR 6 | `design/plan` | Plan | Open as a draft |
| PR 5 (#487) | `claude/friendly-clarke-gp8bca` | Home | Merged, Lee approved |

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
| 2026-10-01 | PR 4 visual baselines | Lee approved the before/after screenshots and asked for the baselines to be updated; 14 digests and the two admin snapshot images re-pinned from the PR 4 CI run | Lee, 1 Oct ("approve the screenshots, update the baselines") |
| 2026-10-01 | Status correction | PR 1, PR 2 and PR 4 recorded as merged (they were still listed as open) | Housekeeping in PR 5 |
| 2026-10-01 | Home suggestion | Home's REV card follows the four suggestion rules (decisions file section 2) using engine states, with a reason from the student's data. It no longer takes its topic from the planner's task list; the planner still feeds "Your plan". "Not now" is browser-session only until the suggestion-events table exists | Decisions file: topic chosen by rules, not a model; data model proposal section 8 |
| 2026-10-01 | PR 5 baselines | Four Home visual digests re-pinned from the PR 5 CI run after Lee said OK to the before/after screenshots | Lee, 1 Oct |
| 2026-10-01 | Approval process | Claude does all development and GitHub work and reports exactly what changed. Lee replies "approved" in the chat for a named PR; Claude then posts the `revision-founder-approval:v1` comment on the exact green commit and merges. Per PR and per commit; Lee can revoke it any time. PR 5 was merged this way. Written into `CLAUDE.md` and `AUTHORITY_HIERARCHY.md` | Lee, 1 Oct: "you ask me for approval and tell me what has changed... I then say approved in the chat. You then register that comment and merge it" |
| 2026-10-01 | Plan sessions | Sessions use the subject's solid colour and letter mark (they were brand teal, which breaks the colour roles). Study-time buttons raised from 32px to 48px | Decisions file section 1; accessibility rule |
