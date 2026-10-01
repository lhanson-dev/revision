# Learner redesign v2: data model proposal

**For:** Lee (Founder) · **Status:** proposal for decision, nothing built · **Date:** 1 October 2026
**PR:** 2 of the learner redesign (plan only, no code, no database changes)

## What this is

The v2 screens need some information the app does not store today. This document says, in plain English, what we already have, what is missing, what I propose to add, and what each choice costs. It is based on how the app actually works now (the Supabase database, the planner and readiness code, and the current Ask REV), not on the placeholder endpoints in the design handoff.

**Nothing here is built.** No feature that needs new data starts until you approve the matching part.

## The short version

1. **Most of what v2 needs already exists.** Exam dates, weekly study time, planning preferences, answers (as evidence), course membership and an activity log are all stored and protected per student.
2. **Eight things are genuinely new:** the subject catalogue in the database, "Coming soon" requests, accepted plan sessions, the retry queue, exam attempts with autosave, the theme preference, suggestion "Not now" events, and REV conversations.
3. **Real REV answers are the biggest piece.** Today Ask REV is not a language model. It is scripted replies built from planner data. v2 needs a real model behind a new server-side function. I recommend Claude Sonnet 5.5 at roughly **1 US cent per question**, with safety rules enforced by software, not just by the prompt.
4. **I recommend building in small steps.** Each screen PR can ship its honest empty state first, and gets its data only when you approve that part. Section 11 maps each screen to its data.

## 1. What exists today (verified in the repo)

| What | Where it lives | Notes |
| --- | --- | --- |
| Which courses a student has | `learner_courses` (student, course id, date added) plus an event log | Only courses we offer. No "Coming soon" |
| Answers and results | `learning_evidence`: one row per flashcard rating, multiple-choice answer, exam question (marks), or exam attempt (marks) | Stores marks and the option picked. It does **not** store written answer text |
| Exam and test dates | `revision_assessments` (title, date, type, importance, scope) | Already supports exam dates |
| Weekly study time | `revision_availability_profiles` (seven daily values, timezone) plus `revision_availability_exceptions` (a specific date) | Already supports "study time" |
| "Prefer this subject this week" | `revision_planning_preferences` | Used by the current Ask REV |
| What the student did with suggestions | `revision_activity_events` (offered, started, meaningfully engaged, completed, chose an alternative) | Partly covers suggestion history |
| The plan itself | **Not stored.** The planner rebuilds it every time from the above | A deliberate design (see the planner implementation doc) |
| Subjects, boards, levels, courses | **In code** (content packs under `content/`), not in the database | No hue or letter mark anywhere yet |
| Theme (light, dark, system) | The browser's local storage only | Not saved per student, lost on a new device |
| Exam answers while typing | In the page's memory only | A refresh loses them. No autosave |
| Onboarding progress | `account_experience_state` and `student_first_use_events` | Current onboarding order differs from v2 |
| Ask REV | Scripted text assembled in `PlannerRevScreen.tsx` from planner reason codes | **No model call anywhere in the app** |

Every learner table is protected so a student can only see their own rows. I will keep that rule for everything new.

## 2. Rules I will follow (from your existing standards)

- **Private by default.** REV conversations, individual answers and written work are private student data (Privacy and Student Data Principles §2). No parent, teacher or admin browsing.
- **No training on student data** by default (§3). Whichever AI provider we use must be configured and contracted for that.
- **Keep only what we need, for a stated reason** (§1, §7). I propose retention periods below; they need your decision and, per §12, legal checking.
- **Derived beats stored.** If something can be calculated from stored facts (the plan, the status labels), we calculate it. That is how the planner already works.
- **Additive, reversible changes.** New tables, not rewrites. Learner-data migrations are high risk and each needs your explicit approval (Supabase README).
- **No secrets in the browser.** The model key lives only on the server.

## 3. Subject catalogue (`hue`, `mark`, levels, boards)

**Today:** the list of subjects and courses lives in code. The new palette and letter marks are in a code table (`src/app/subject-palette.ts`) that I added in PR 1 as a starting point.

**Proposal:** add a small catalogue to the database, so a new course appears without a design or code change (decisions §4 "new courses appear without design changes").

- **Subjects:** name, the one hue, the one letter mark, optional parent (so Biology sits under Science with a variant hue). The database only accepts hues from the approved palette, so nobody can enter teal, yellow or coral.
- **Offerings:** a subject at a level (GCSE, A-level, AS) with an exam board, marked **live** or **coming soon**.
- **Courses stay linked by their existing course id.** Nothing about student progress changes.

Everyone can read the catalogue; only admins can change it.

**Choice:** (A) database catalogue now, or (B) keep the code table until a second subject launches.
**Recommendation: A**, but build it at the same time as onboarding (PR 13), since that is the first screen that needs boards and levels. Until then the code table is enough.

## 4. Enrolments and "Coming soon" requests

**Live courses:** `learner_courses` already works. No change.

**Coming soon:** when a student says they study something we do not offer, we save a **request**: who, which level, which subject and board (either picked from the catalogue's coming-soon list or typed as free text), and the date. These are never planned, tracked or counted as courses (decisions §4).

**Telling students when a course launches:**
- When an admin marks an offering **live**, the next time a student with a matching request opens the app, they see an in-app offer to add it. The request records that it was offered and whether they accepted.
- **No email at launch.** Emailing teenagers needs a consent and preferences design we do not have yet (Privacy §6, §10). **Recommendation: in-app only for now.**

Free text means we may store whatever a student types, so I would cap its length and never show it to other students.

## 5. Planned sessions and study time

**Study time and exam dates:** already stored (section 1). The Plan screen's study-time and exam-date controls need no new data.

**The plan** is rebuilt each time, which is good: it never goes stale. v2 adds two things that need a decision:

1. **Accepting a REV suggestion into a day** ("Add to Thursday", "Move it"). That is a student choice that must stay put, not be recalculated away.
2. **REV-added sessions** shown on Plan with a marker.

**Proposal:** one new table of **accepted sessions** only: student, date, course, topic, activity (learn, practice, exam prep), minutes, who added it (the student or a REV suggestion they accepted), and status (planned, done, skipped). The rest of the plan stays derived, and the planner treats an accepted session as already placed.

**Actual time studied:** I propose **not** to add a table. We record how long an activity ran when it completes, inside the existing activity events, and add the weekly totals up when needed. This keeps "study time" honest (real time, not guessed).

**Choice:** accepted-sessions table now, or keep Plan fully derived and drop "Add to Thursday" for launch.
**Recommendation:** add the table; the v2 Plan and REV card depend on it (F1, F4).

## 6. Answers and the retry queue

**Answers:** every answer already becomes an evidence row with marks or the option picked. That is enough for status labels and readiness. **I do not propose storing written answer text by default** (see section 7).

**Retry queue** ("This will come back later"): when a student gets a practice question wrong, it should return later. Proposal: one table with student, the question, when they first missed it, when it is next due, how many tries, and its state (waiting, due, cleared).
- Re-asks are scheduled by a simple spacing rule (for example the next day, then three days, then a week), written in code and tested, not chosen by a model.
- A retried answer is a real answer. It is saved as normal evidence. The queue only decides **when** a question returns.

**Honesty check:** "Just started" versus "Not started" (decisions §1) needs "has this student answered anything in this topic". That already comes from the evidence rows, so no new data.

## 7. Exam attempts, autosave and the examiner checklist

**Today:** a timed paper lives in the page. A refresh or a dropped connection loses the answers.

**Proposal:** two small tables.
- **Exam attempts:** student, paper, mode (practice or timed), when it started, the time limit, and state (in progress, submitted, abandoned).
- **Draft answers:** attempt, question, the text so far, last saved time. Saved automatically every few seconds while typing.

When the student submits, marks go into the existing evidence rows as now. The draft text is then **deleted after a short period** (I propose 30 days, so a student can look back at a recent paper; decision below). Written work is among the most sensitive data we hold, so the default is to keep it as briefly as is useful.

**Confirm-before-leaving** a running timed paper is a screen rule. The attempt record is what lets "stay" and "leave" both be safe.

**Examiner checklist:**
- The points come from the approved mark scheme content in the course content, **never from a model**.
- Deciding whether an answer covers a point needs judgement. Proposal: a model is asked, for each approved point, "does this answer cover it, and which words show it?" Software then **checks that the quoted words really appear in the student's answer**. That check is what makes "why this ticked" trustworthy and stops invented ticks.
- Ticks are calculated live and **not stored**. There is nothing new to keep.
- **Release gate:** a fixed set of real marked answers, kept in the repo as test files, is run against the checklist before it goes live. **You still need to say who supplies the marked answers** (open item 2).
- **The switch:** I recommend the checklist's on/off switch is a setting **in the code**, off by default, not a database setting. Turning it on then needs a PR, which needs your approval. That makes the release gate impossible to skip by accident.

## 8. Suggestion dismissals ("Not now")

**Today** the activity log can record "offered" and "chose an alternative".

**Proposal:** add two event types to the existing log, **dismissed until tomorrow** and **asked for something else**, rather than a new table. "Hide this suggestion until tomorrow" and "never the same topic twice in a day" then become simple questions against today's events. The log is also the history that "REV noticed" needs when it returns (decisions §2 "Deferred").

## 9. Theme preference

**Today** the choice is stored in the browser only.

**Proposal:** one small preferences table: student, theme (light, dark or system), default **system**. The browser still applies it instantly and remembers it locally for speed; the saved value wins once the student is signed in. I would keep it separate from the existing `profiles` table, which is used for admin and test-user flags.

## 10. Real REV answers

This is the part that most needs your decision. It also changes what the app is, so I have been specific.

### 10.1 What is true today

Ask REV does not call a model. It builds sentences from planner facts and can apply a short-term subject preference. Decisions §2 says "no canned replies anywhere", so real answers need new server-side machinery.

### 10.2 How it would work

A new **server-side function** (alongside the existing planner and admin functions):

1. The student's message goes to the function with their sign-in token. The function checks who they are and only reads that student's own data.
2. The function gathers **context** (10.4).
3. It sends the message and context to the model, with REV's rules (10.5).
4. It checks the reply against the safety rules in software (10.6), then returns it.
5. It records a log entry (10.8).

The model key exists only on the server, never in the browser.

### 10.3 Which model

Current prices (per million tokens, US dollars, from the Anthropic price list cached on 25 September 2026; I have not re-checked them today):

| Model | Input | Output | Fit for REV |
| --- | --- | --- | --- |
| Claude Haiku 4.5 | $1 | $5 | Cheapest. Weaker at patient explanation and following several rules at once |
| **Claude Sonnet 5.5** | $2 | $10 | **Recommended.** Strong tutoring and instruction-following at a low price |
| Claude Opus 5.5 | $4 | $20 | Strongest. Probably more than a revision question needs |

**Recommendation: Sonnet 5.5**, with thinking set low for ordinary chat (faster and cheaper) and kept in reserve for harder questions. We should include the provider's built-in fallback option for requests it declines, so a student is not left with nothing. I would test Haiku 4.5 against Sonnet on a fixed set of real questions before launch and only switch if it matches on the safeguarding and "don't answer the exam" tests.

**Important:** the only AI key configured today is OpenAI, used by the Content Factory. Using Claude for REV means adding an Anthropic key as a server secret. Alternatively we could stay with OpenAI. **I recommend one provider for REV that you have read the data terms for**, and I cannot verify those terms for you.

### 10.4 What REV is given

REV is only given what it needs for this question:

- **Where the student is:** the course, topic, and activity (for example "Learn, Break-even"), and the current question's id.
- **Approved course content for that topic**, so answers about the course come from approved material. Today the app's runtime content is the packs under `content/` (AQA Business). The newer Content Factory material is **not yet in the runtime**, so it needs a publishing step before REV can use it. That is a Content Factory job; I will not do it here.
- **The student's status per topic** (Got it, Nearly there and so on) and exam dates. Not their raw answers.
- **The last few messages** of the conversation.

For anything outside their courses, REV answers from general knowledge and says so when it is unsure (decisions §2).

### 10.5 REV's rules

The voice and rules in your decisions file go into a fixed instruction block (older student, never claims to be human, honest about uncertainty, suits a teenager). This block is the same for everyone, so it is cheap to reuse.

### 10.6 How the safety rules are enforced

A prompt alone is not enough for rules that matter. I propose layers:

**Never answer a scored or timed exam question**
- **During a timed paper:** Ask REV is not available (navigation is hidden in that mode anyway), and the function refuses requests from that screen.
- **Before the student has answered a scored practice question:** the function **does not send the answer, mark scheme or model answer to the model at all.** REV cannot leak what it was never given. It can still help the student work it out.
- **Assessed coursework:** an instruction, plus a test set of attempts to get REV to write it.

**Safeguarding** (a student says they are really struggling, or may be in danger)
1. Every message is checked two ways: a plain-text screen for known phrases, and a safety rating the model returns with its reply.
2. If either flags a concern, the reply is **assembled by software**: a short kind message, the suggestion to talk to a trusted adult, and a fixed list of UK support (Childline, Shout), then an offer to carry on revising. If there may be immediate danger, the reply leads with 999.
3. The support names and numbers are fixed text in our code, so the model can never get a number wrong. They must be checked by you or a safeguarding reviewer before launch; I have not verified them.
4. REV does not hold long wellbeing conversations. It returns to revision.
5. **No alerts to parents or schools.** Not in this design (decisions §2, open item 4).

**Fixed text is not a "canned reply" in the sense you ruled out** (fake answers to look helpful). It is a vetted safety message. **Please confirm that reading.** If you disagree, the model would write these replies and software would only check they contain the required support details.

### 10.7 If the model is down or refuses

REV says plainly that it cannot answer right now and the student can carry on revising. It never substitutes a made-up answer.

### 10.8 What is stored and logged

**Conversations (private to the student):** the messages, kept so a chat can continue and so "REV noticed" can return later. Only the student can read them. Admins cannot browse them. Proposal: keep for **12 months** from the last message, and let the student delete any conversation at any time. This is a starting position that needs legal review (Privacy §7, §12).

**Operational log (no message text):** when, which student, which screen, which model, token counts, time taken, estimated cost, whether the safeguarding rule or the exam rule fired, and any error. This lets us watch cost and quality without reading private chats.

**Safeguarding flags:** a record that a flag fired (student, time, level) is kept for safety review. **Decision needed:** whether to also keep the flagged message itself for review, and for how long. Keeping it helps spot failures but cuts against privacy.

**Never:** training an AI model on this data, sharing with parents or teachers, or putting message text in ordinary application logs (Security Standard).

### 10.9 Limits

A per-student daily cap (I suggest 60 questions), a maximum message length, and a monthly spending alarm. These stop accidents and abuse, and keep cost predictable.

### 10.10 Rough running cost

These are estimates from stated assumptions, to be replaced by measured numbers once it runs.

**Assumptions for one question:** about 6,100 tokens in (REV's rules about 1,500, the topic's course content about 3,000, the student's context about 500, recent chat about 1,000, the question about 100) and about 650 tokens out (a 350-token answer plus about 300 of low-effort thinking). The repeated parts are reusable at a tenth of the input price when requests come close together.

| | Per question | Per student per month at 90 questions (3 a day) |
| --- | --- | --- |
| Haiku 4.5 | about 0.6 to 0.9 US cents | about $0.55 to $0.85 |
| **Sonnet 5.5 (recommended)** | **about 1.1 to 1.9 US cents** | **about $1.00 to $1.70** |
| Opus 5.5 | about 2.0 to 3.7 US cents | about $1.80 to $3.40 |

| Students asking 3 a day (Sonnet 5.5) | Monthly model cost |
| --- | --- |
| 100 | about $100 to $170 |
| 1,000 | about $1,000 to $1,700 |
| 10,000 | about $10,000 to $17,000 |

A light user (one question a day) costs about a third of that; a heavy user (15 a day) about five times. Examiner-checklist checks add roughly half a US cent per submitted answer. Safeguarding ratings are part of the same call, so they add nothing. Server running costs for the function itself are small by comparison. **These figures matter for pricing:** the free tier needs a lower daily cap than paid plans (a Subscription Plans question, not decided here).

### 10.11 Test before launch

Like the examiner checklist, REV answers get a **release gate**: a fixed set of test conversations covering ordinary questions, off-topic questions, attempts to get an exam answer, attempts to write coursework, and a range of safeguarding messages. It must pass before real answers go live. Who writes and judges the safeguarding set is part of open item 4 and should involve someone qualified.

### 10.12 Things I cannot settle

- The provider's current data-retention and no-training terms (Privacy §3, §12).
- Whether students under 16 need parental consent for an AI feature. That is a legal question for professional advice, not a design one.
- The exact current UK support numbers.

## 11. Which screen needs which data

| PR | Screen | New data needed | Can ship first without it? |
| --- | --- | --- | --- |
| 4 | Shell and navigation | Theme preference | Yes: theme stays in the browser until the table exists |
| 5 | Home | Suggestion events; accepted sessions | Yes: REV card from the rules and existing data; "Not now" works for the session only until events exist |
| 6 | Plan | Accepted sessions | Partly: week view and study time work now; "Add to Thursday" needs the table |
| 7 | Courses and overview | Catalogue (hue, mark) | Yes: code table until the catalogue exists |
| 8 | Learn | None (Quick check is unscored; content block is PR 3) | Yes |
| 9 | Practice | Retry queue | Partly: feedback bar works; retry needs the table |
| 10 | Exam Prep | Exam attempts and drafts | Partly: papers and timer work; autosave needs the tables |
| 11 | Progress | None (engine mapping you still need to confirm) | Yes |
| 12 | Ask REV | REV function and conversations | No: this is the dependency |
| 13 | Onboarding | Catalogue; Coming-soon requests | Partly: catalogue from code |
| 14 | Empty states | None | Yes |

## 12. Everything proposed, with risk

| New thing | Kind | Risk | Notes |
| --- | --- | --- | --- |
| Catalogue tables | Read-mostly | Low | Admin-edited, public read |
| Coming-soon requests | Student-owned | Low to medium | Free text; cap length |
| Accepted sessions | Student-owned | Low | |
| Retry queue | Student-owned | Low | |
| Exam attempts and drafts | Student-owned | **Medium** | Written work; short retention |
| Theme preference | Student-owned | Low | |
| Two new activity event types | Change to an existing constraint | Low | Additive |
| REV conversations and messages | Student-owned, private | **High** | Most sensitive data we hold |
| REV operational log | Server-owned, no text | Medium | Cost and safety visibility |
| REV server function + model key | New server surface | **High** | New provider relationship |

Each migration would be its own PR, with the database assurance tests, and each needs your explicit approval before merging.

## 13. Decisions I need from you

1. **Catalogue in the database** (section 3): build it at onboarding time? *Recommend yes.*
2. **Coming-soon launch notices** (section 4): in-app only, no email at launch? *Recommend yes.*
3. **Accepted sessions** (section 5): add the table so "Add to Thursday" works? *Recommend yes.*
4. **Draft answer retention** (section 7): 30 days after submission? *Recommend yes, pending legal review.*
5. **Checklist switch** (section 7): a code setting, off by default, so turning it on needs your PR approval? *Recommend yes.*
6. **Model and provider for REV** (10.3): Claude Sonnet 5.5, with a Haiku comparison test first? Or stay with OpenAI? *Recommend Sonnet 5.5, once you have read the provider's data terms.*
7. **Safeguarding fixed text** (10.6): is a vetted fixed safety message acceptable under "no canned replies"? *Recommend yes.*
8. **Conversation retention** (10.8): 12 months from last message, student can delete any time? *Recommend yes, pending legal review.*
9. **Flagged messages** (10.8): keep only that a flag fired, or also the message for a short review period? *Recommend keep only that a flag fired, until a safeguarding reviewer says otherwise.*
10. **Daily question cap** (10.9): 60 a day to start? *Recommend yes, lower on the free tier once plans are decided.*

If you approve in a different order, tell me which and I will start with the one that unblocks the next screen. **My suggested order:** theme and suggestion events (small, low risk), then the catalogue, then accepted sessions and the retry queue, then exam attempts, with the REV function last because it carries the most risk and needs the longest testing.

## 14. What I did not check

- I did not inspect the live production database, only the migrations in the repo, so I am assuming production matches them.
- Model prices are from a price list cached on 25 September 2026.
- I have not looked at how many real students use the app, so the scenarios above are illustrations, not forecasts.
