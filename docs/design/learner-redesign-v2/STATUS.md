# Learner redesign v2: status tracker

**Updated:** 1 October 2026 (PR 10, Exam Prep timed paper). Every later redesign PR updates this file.
**Decisions:** `docs/design/decisions/2026-10-01-learner-redesign-v2.md`. **Start here:** `00-START-HERE.md`.

**Merged to `main` with Lee's approval:** PR 1 (#480, foundations), PR 2 (#482, data model proposal), PR 4 (#486, shell and navigation). PR 5 (#487, Home), PR 6 (#490, Plan), PR 7 (#492, Courses and Course Overview), accepted-sessions migration (#494, merged but not applied to production), PR 8 (#495, Plan and Home accepted sessions), PR 9 (#496, Practice). PR 3 (Content Factory) is waiting for Lee's go.

How to read it: **Foundations** means the design values, building blocks and checks exist but no screen uses them yet. **Not started** means nothing is built. Nothing is "done" until a PR is merged by Lee.

## Features

| Feature | What it is | Built so far | PR | What is left | Decisions pending |
| --- | --- | --- | --- | --- | --- |
| F1 | REV suggests (with a reason, chosen by rules) | REV card component; the four-step rules in `src/app/rev-suggestions.ts`; Home shows the rules' choice with its reason, "Suggest something else" and "Not now" (PR 5, merged) | PR 1, PR 5 | "Not now" is kept for the browser session only until the suggestion-events table exists. REV-added sessions and "Add to plan" come with Plan (PR 6) | The 14-day and 7-day windows (tune after testing). Home's card now follows the four rules, not the planner: Lee to confirm that is right (see PR 5) |
| F2 | Guided session (Learn, Practice, Exam Prep) | Step list inside the REV card | PR 1 | Session flow on Home | None |
| F3 | "REV noticed" patterns | Deferred for launch. Session and answer history to be kept | n/a | Comes back later | When it returns and its evidence bar (open item 5) |
| F4 | Smarter Plan | Week first, Day / Week / Month, today highlighted, solid subject colours and letter marks, study time and exam dates (PR 6, merged); accepted sessions with REV pick, Done, Move it, Skip, Remove and "Add to Thursday" from REV's card (PR 8, merged) | PR 6, PR 8 | Needs the sessions table applied to the database before students see it (runbook prepared, not yet applied) | Accepted sessions need new data (PR 2 proposal, own migration PR) |
| F5 | Practice feedback bar and retry queue | Feedback bar component; answer option styling; in-session retry (a missed question returns after 3 others) (PR 9, merged) | PR 9 | Carrying missed questions to another day | Needs the retry-queue table (PR 2 proposal, own migration PR) |
| F6 | Exam Prep focus mode and examiner checklist | Examiner guide component; shell has a focus mode that hides navigation; question grid, flag for review and a coral low-time timer (PR 10, merged) | PR 10 | Papers, timer, confirm before leaving a running paper, checklist behind a switch that stays off until the release gate passes | Who supplies marked answers for the release gate (open item 2) |
| F7 | Progress: three measures | Status labels, understanding bar, three-measure component; engine band to label mapping in `src/app/topic-status.ts`; Home course tiles show Topics covered and Understanding (PR 5) | PR 11 | Course, paper and global Progress screens built: summary sentence, one next action with reason, three measures, topic statuses | Exam readiness format (open item 1) |
| F8 | Ask REV with real answers (pop-up; full screen on phone) | REV mark with four states and text for every state | PR 12 | Pop-up conversation, answers from the student's own data, prompt chips and fixed safeguarding text built (PR 12). Real model answers still to do | The model (test Claude Sonnet 5.5), cost and logging, in the PR 2 proposal |
| F9 | Onboarding | Not started | PR 13 | Level, subjects (several), exam board per subject built (PR 13). Exam dates and weekly time built as steps 4 and 5 (optional; editable any time on Plan) | Coming-soon requests need new data (PR 2 proposal) |
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
| Plan | `design/plan` | Merged in PR 6 (#490): week first with Day / Week / Month, today highlighted, sessions in solid subject colours with letter marks (were brand teal), next exam as neutral text with a clock, 48px study-time buttons, week becomes a day list on phone and tablet | PR 6 | "Add to Thursday", REV PICK label and faded done sessions need the accepted-sessions table (own migration PR). Free-slot picking does not apply: the plan works in days. Doc: `docs/features/plan.md` |
| Courses and Course Overview | `design/courses-overview` | Merged in PR 7 (#492): subject-colour cards with letter marks, three separate progress measures on the overview (Topics covered, Understanding, Exam readiness: engine value or "Not enough evidence yet"), status badges on every topic, weak spots without percentages, course tabs wrap on phones, 320px sideways scroll fixed | PR 7 | Topics covered and Understanding on the Courses list cards (needs the list to load answers). Doc: `docs/features/courses.md` |
| Learn | `design/learn` | Not started | PR 8 | Everything |
| Practice | `design/practice` | Merged in PR 9 (#496): feedback bar (teal right, coral wrong, content's explanation, icon and words), a missed question comes back after 3 others in the session, retries saved as real answers | PR 9 | Carrying missed questions to another day needs the retry-queue table (own migration PR). Doc: `docs/features/practice.md` |
| Exam Prep | `design/exam-prep` | Merged in PR 10 (#497): question grid (answered, flagged, current in words and icons; wraps, no sideways scroll), flag for review, "Before you finish" note, low-time timer in coral with icon and words, clock no longer read out every second | PR 10 | Autosave, server-side timer, saved answers and feedback, and the examiner checklist all need the exam tables and the release gate (own PRs). Doc: `docs/features/exam-prep.md` |
| Progress | `design/progress` | Merged in PR 11 (#498): summary sentence, one next action with reason, three measures, topic statuses | PR 11 | Founder review; predicted grade not built (open item 1) |
| Ask REV | `design/ask-rev` | Merged in PR 12 (#500) | PR 12 | Model answers, approved-content answers, saved conversations (each needs its own approval) |
| Sign-in and onboarding | `design/onboarding` | Draft PR open | PR 13 | Founder review; "Coming soon" requests (need the requests table) |
| Empty-state sweep | `design/empty-states` | Not started | PR 14 | Everything |

## Phase 1 PRs

| PR | Branch | What | State |
| --- | --- | --- | --- |
| PR 1 (#480) | `claude/revision-v2-learner-redesign-3rigil` | Standards, tokens, building blocks, guardrails, docs | Merged, Lee approved |
| PR 2 (#482) | `docs/learner-v2-data-model` | Data model proposal (plan only, no code) | Merged (#482), Lee approved. Lee agreed all its recommendations on 1 Oct. Each migration it describes is a separate PR needing its own approval |
| PR 3 | Content Factory | Quick-check block in the Learn content schema | Waiting for Lee to say go |
| PR 4 (#486) | `design/shell-navigation` | Shell and navigation | Merged, Lee approved |
| PR 10 | `design/exam-prep` | Exam Prep timed paper: question grid, flag for review, calmer timer | Open as a draft |
| PR 9 (#496) | `design/practice` | Practice feedback bar and in-session retry | Merged, Lee approved |
| PR 8 (#495) | `design/plan-home-sessions` | Plan and Home accepted sessions ("Add to Thursday", REV pick, done, move, skip, remove) | Merged, Lee approved |
| PR 7 (#492) | `design/courses-overview` | Courses and Course Overview | Merged, Lee approved |
| PR 6 (#490) | `design/plan` | Plan | Merged, Lee approved |
| PR 5 (#487) | `claude/friendly-clarke-gp8bca` | Home | Merged, Lee approved |

## Known issues found by the new checks

| Where | Issue | Fixed in |
| --- | --- | --- |
| ~~Course overview at 320px~~ | ~~Page is 336px wide in a 320px window~~ Fixed in PR 7; the exception is removed from `tests/e2e/horizontal-scroll.spec.ts` | PR 7 |
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
| 2026-10-01 | Course Overview | Readiness shows the engine value or "Not enough evidence yet" with what unlocks it (was "Building"); topics use the five status labels; per-topic percentages removed; rows no longer dimmed (contrast) | Decisions file sections 1 and 3 |
| 2026-10-02 | Accepted sessions | Migration PR for the `learner_planned_sessions` table (student's own accepted sessions; the plan itself stays derived), with RLS, database tests and a service layer. No screen uses it yet; Plan and Home wiring is the next PR | Data model proposal section 5, agreed by Lee 1 Oct; Lee asked to start it 2 Oct |
| 2026-10-02 | Plan and Home sessions | "Add to Thursday" on REV's card; accepted sessions on Plan with REV pick, Done, Move it, Skip, Remove; the plan works around them; both screens stay quiet if the table cannot be read. Found and fixed a contrast problem from PR 6 (text on solid session colours was faded to 90%) | Data model proposal section 5; Lee asked for it 2 Oct |
| 2026-10-02 | Practice feedback | Wrong answers use coral (the old block was a solid orange panel with Try again); a missed question is queued and returns after at least 3 others, in the session only, and the wording says so. Retried answers are saved as normal evidence (data model proposal section 6) | Decisions file section 7; Lee asked for PR 9 |
| 2026-10-02 | Exam Prep timer | Low time is coral with a clock icon and the words "Under 10 min" (was yellow with no words); screen readers get notices at 10, 5 and 1 minutes instead of the clock every second | Decisions file section 1 (yellow means Nearly there only; status always icon plus text) |
| 2026-10-02 | Progress screens | Global, course and paper Progress share one layout: plain sentence, one rule-chosen next action with its reason, Topics covered, Understanding, Exam readiness (never averaged across courses), optional 3-sentence note. Removed "Scored activities" and the averaged readiness %. Course cards use the subject hue and letter mark | Decisions file section 3 |
| 2026-10-02 | Ask REV | Pop-up only: "Expand" removed and `#/rev` opens the pop-up over Home. REV answers three questions from the student's own data (what to do today, how am I doing, when are my exams), keeps the confirm-first plan change, and says "I can't answer that one yet" to everything else (no model, no made-up replies). Safeguarding messages get fixed vetted text (999, Childline, Shout) with no model; numbers need Lee's check before launch. Chat is not saved | Decisions file section 2; data model proposal 10.3 steps 1, 10.7, 10.8 |
| 2026-10-02 | Onboarding course choice | The first-course screen is now three steps, one question each: Level (only levels with a live course; AS sits under A-level), then subjects at that level (several allowed, with subject colour and letter mark), then the exam board for each subject (AS or full A-level where both exist). The first course chosen drives the starting check as before; the others are added too. Then optional exam dates and weekly study time (Lee, 2 Oct: move them into onboarding; editable any time on Plan, which recalculates itself). "Coming soon" requests are not built (no table yet) | Decisions file section 4 |
| 2026-10-02 | Accepted sessions in production | Prepared a runbook and read-only before/after checks for applying the `learner_planned_sessions` table to production (`docs/technical/Learner Planned Sessions Production Runbook.md`, `supabase/tests/learner-planned-sessions-verification.sql`). Nothing applied; applying needs Lee's explicit instruction in the chat | Merging a migration does not apply it (`supabase/README.md`); the table is new and empty, so risk is low, and the screens work without it |
