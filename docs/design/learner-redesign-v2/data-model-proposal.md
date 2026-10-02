# Learner redesign v2: data model proposal

**For:** Lee (Founder) · **Status:** proposal for decision, nothing built · **Date:** 1 October 2026 · **Revised** after Lee's feedback the same day; Lee agreed all recommendations (section 13)
**PR:** 2 of the learner redesign (plan only, no code, no database changes)

## What this is

The v2 screens need some information the app does not store today. This document says, in plain English, what we already have, what is missing, what I propose to add, and what each choice costs. It is based on how the app actually works now (the Supabase database, the planner and readiness code, and the current Ask REV), not on the placeholder endpoints in the design handoff.

**Nothing here is built.** No feature that needs new data starts until you approve the matching part.

## What changed after your feedback

Lee's comments of 1 October changed this document as follows.

1. **Ask REV is a pop-up, not a page.** It opens over whatever the student is doing. On a phone, where there is no room, it takes over the whole screen and closes back to the same place. No separate Ask REV page. (Section 10.2.)
2. **Ask REV should be efficient and use the model cleverly.** A real model sits behind it, but many questions are answered without a paid call: from what the app already knows, or straight from approved course content. The model is used when it is actually needed. (Section 10.3.)
3. **Exam answers should be kept and used.** I had proposed deleting written answers after 30 days. That was wrong for what you want: progress data and "here is what you got wrong" both need the submitted answer and the feedback on it. Section 7 is rewritten.
4. **Theme wording explained** in plain English (section 9).
5. **Your answers recorded:** test Claude Sonnet 5.5 (final model still open); a vetted fixed safeguarding message is acceptable; keep REV conversations for 12 months with delete-any-time. (Section 13.)

## The short version

1. **Most of what v2 needs already exists.** Exam dates, weekly study time, planning preferences, answers (as evidence), course membership and an activity log are all stored and protected per student.
2. **Genuinely new:** the subject catalogue in the database, "Coming soon" requests, accepted plan sessions, the retry queue, saved exam answers with feedback, the theme preference, suggestion "Not now" events, and REV conversations.
3. **Real REV answers are the biggest piece.** Today Ask REV is not a language model; it is scripted replies built from planner data. v2 needs a real model behind a new server-side function, used cleverly so many questions need no paid call. I recommend testing Claude Sonnet 5.5 for the hard questions, with safety rules enforced by software.
4. **I recommend building in small steps.** Each screen PR can ship its honest empty state first and get its data only when you approve that part. Section 11 maps each screen to its data.

## 1. What exists today (verified in the repo)

| What | Where it lives | Notes |
| --- | --- | --- |
| Which courses a student has | `learner_courses` (student, course id, date added) plus an event log | Only courses we offer. No "Coming soon" |
| Answers and results | `learning_evidence`: one row per flashcard rating, multiple-choice answer, exam question (marks), or exam attempt (marks) | **The marks ARE stored**, and they already feed readiness and progress. What is not stored is the written answer text, or which marking points were missed |
| Exam and test dates | `revision_assessments` (title, date, type, importance, scope) | Already supports exam dates |
| Weekly study time | `revision_availability_profiles` (seven daily values, timezone) plus `revision_availability_exceptions` (a specific date) | Already supports "study time" |
| "Prefer this subject this week" | `revision_planning_preferences` | Used by the current Ask REV |
| What the student did with suggestions | `revision_activity_events` (offered, started, meaningfully engaged, completed, chose an alternative) | Partly covers suggestion history |
| The plan itself | **Not stored.** The planner rebuilds it every time from the above | A deliberate design (see the planner implementation doc) |
| Subjects, boards, levels, courses | **In code** (content packs under `content/`), not in the database | No hue or letter mark anywhere yet |
| Theme (light, dark, system) | The browser's local storage only | Remembered on that one device and browser, not on the student's account (see section 9) |
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

**Build status (2 October 2026):** the table, `learner_planned_sessions`, is in its own migration PR (`supabase/migrations/20261002060000_add_learner_planned_sessions.sql`), with database assurance in `supabase/tests/learner-planned-sessions-assurance.test.sql` and a service layer in `src/services/planning/planned-session-service.ts`. No screen uses it yet. Minutes are limited to 5 to 240, the activity is learn, practice or exam prep, and the same topic and activity cannot be planned twice on one day. Wiring it into Plan and Home ("Add to Thursday", "Move it", the REV PICK label, faded done sessions, the planner treating an accepted session as already placed) is the next PR.

## 6. Answers and the retry queue

**Marks and results are already saved.** Every answer becomes an evidence row with the marks or the option picked, and that already feeds the status labels and readiness. So "how did the student do" is already in the progress data for marks. What is missing is the next level down: **which points they got and which they missed**, and the answer itself. Section 7 adds those.

**Retry queue** ("This will come back later"): when a student gets a practice question wrong, it should return later. Proposal: one table with student, the question, when they first missed it, when it is next due, how many tries, and its state (waiting, due, cleared).
- Re-asks are scheduled by a simple spacing rule (for example the next day, then three days, then a week), written in code and tested, not chosen by a model.
- A retried answer is a real answer. It is saved as normal evidence. The queue only decides **when** a question returns.

**Honesty check:** "Just started" versus "Not started" (decisions §1) needs "has this student answered anything in this topic". That already comes from the evidence rows, so no new data.

## 7. Exam answers, feedback, autosave and the examiner checklist

**Today:** a written answer exists only in the page while the student types. A refresh loses it. After submission only the marks are kept (as evidence), so the app cannot show "here is what you missed" later, or learn from it.

**What you asked for:** understand how the student did on exam questions, include it in progress, and help them with what they got wrong. Your existing, already-approved standard for this is **Assisted Exam Answer Marking** (a "Mark my answer" button, feedback on where marks were earned and missed, and the rule that the first submitted attempt is preserved and never silently overwritten). This proposal supplies the data that standard needs.

**Proposal: keep four things, all private to the student.**
1. **Exam attempts:** student, paper, mode (practice or timed), start time, time limit, state (in progress, submitted, abandoned).
2. **Drafts (autosave):** the text so far, saved every few seconds, so a refresh or dropped connection loses nothing. Drafts are temporary: deleted 30 days after the attempt ends.
3. **Submitted answers:** the answer exactly as submitted. It cannot be edited afterwards. A resubmission after improving is a new attempt linked to the first, so students can see improvement.
4. **Feedback on each answer:** for each approved mark-scheme point, covered or missed (and the words that showed it, where covered); the marks awarded and available; how the marking was done (the student marked it themselves, the examiner checklist, or assisted marking); a plain-English "what would make it stronger"; and which version of the marking basis was used.

**How this feeds progress:**
- Marks keep going into the existing evidence rows, so readiness and status labels work as now.
- The **missed points** let the app say, for example, "you keep missing the evaluation point in finance questions", and REV can use it to suggest the next thing to do. It would also let Progress show which skills are weak, not just which topics.
- **Honesty about weight:** the readiness engine already limits how confident it can be when written answers are self-marked (it cannot reach "high" confidence without independently marked evidence). Feedback from the examiner checklist or assisted marking is only as reliable as its testing, so each record says how it was marked and readiness keeps treating them differently until the release gates pass.

**How long we keep it:**
- Submitted answers and their feedback: kept **for as long as the student has the account**, because progress and review depend on them. The student can delete an answer's text at any time; the marks and the progress they produced remain (removing the words, not the result). This replaces my earlier 30-day proposal.
- Drafts: 30 days.
- Written work is some of the most sensitive data we hold, so it is private by default: no parent, teacher or admin browsing, and never used to train a model (Privacy §2, §3). Retention periods still need the legal review in Privacy §7 and §12.

**Confirm-before-leaving** a running timed paper is a screen rule; the saved attempt is what makes both "stay" and "leave" safe.

**Examiner checklist** (the "what examiners look for" guide):
- The points come from the approved mark scheme content, **never from a model**.
- Deciding whether an answer covers a point needs judgement. Proposal: a model is asked, for each approved point, "does this answer cover it, and which words show it?" Software then **checks that the quoted words really appear in the student's answer**. That check is what makes "why this ticked" trustworthy and stops invented ticks.
- In practice mode ticks show live as the student writes; the final result is saved as the feedback record above when they submit.
- **Release gate:** a fixed set of real marked answers, kept in the repo as test files, is run against the checklist before it goes live. **You still need to say who supplies the marked answers** (open item 2).
- **The switch:** I recommend the checklist's on/off switch is a setting **in the code**, off by default, not a database setting. Turning it on then needs a PR, which needs your approval, so the release gate cannot be skipped by accident.

## 8. Suggestion dismissals ("Not now")

**Today** the activity log can record "offered" and "chose an alternative".

**Proposal:** add two event types to the existing log, **dismissed until tomorrow** and **asked for something else**, rather than a new table. "Hide this suggestion until tomorrow" and "never the same topic twice in a day" then become simple questions against today's events. The log is also the history that "REV noticed" needs when it returns (decisions §2 "Deferred").

## 9. Theme preference

**What "theme" means:** the look of the app: light, dark, or "follow my device". 

**What I meant by "isn't saved per student":** today, when a student picks dark mode, the app remembers it only inside that one web browser on that one device. If they sign in on their phone, on a school computer, or after clearing their browser, the app forgets and goes back to the default. "Saved per student" means we store the choice on their account, so it follows them to every device they sign in on.

**Proposal:** one small preferences table: student, theme (light, dark or system), default **system**. The browser still applies the choice instantly and remembers it locally for speed; the saved value wins once the student is signed in. I would keep it separate from the existing `profiles` table, which is used for admin and test-user flags. It is a tiny, low-risk change and not urgent.

## 10. Real REV answers

This is the part that most needs your decision. It also changes what the app is, so I have been specific.

### 10.1 What is true today

Ask REV does not call a model. It builds sentences from planner facts and can apply a short-term subject preference. Decisions §2 says "no canned replies anywhere", so real answers need new server-side machinery.

### 10.2 How Ask REV appears (decided)

Ask REV is a **pop-up conversation** that opens over the page the student is on, so it never takes them away from what they are doing. It is there to help, not to be a destination.
- **Desktop and tablet:** a panel or window over the page. The page behind stays where it was.
- **Phone:** there is not room for a pop-up, so it takes over the whole screen, with a clear close button that returns to exactly where they were.
- **No separate Ask REV page.** The design system's Ask REV screen becomes the content of the pop-up. The current app has an "Expand" link to a full page; PR 12 decides whether to retire it.
- It opens from the sidebar, rail or tab-bar REV button, and from "Stuck? Ask REV" inside Learn and Practice, carrying where the student is.
- It is not available during a timed paper.

Behind it, a **server-side function** (alongside the existing planner and admin functions):
1. The student's message goes to the function with their sign-in token. The function checks who they are and only reads that student's own data.
2. It runs the safety screen (10.7).
3. It chooses the cheapest route that can answer well (10.3).
4. If a model is used, it gathers the context (10.5) and calls the model with REV's rules (10.6).
5. It checks the reply against the safety rules in software, then returns it.
6. It records a log entry (10.9).

The model key exists only on the server, never in the browser.

### 10.3 Answering cleverly: not every question needs a paid call

You want REV to be a really efficient coach that can answer anything to do with the subject content, without paying a model for questions the content already answers. I propose a ladder. The app tries the cheapest route that can answer well and only moves up when it has to.

| Step | What it handles | Paid? | How |
| --- | --- | --- | --- |
| 1. What the app already knows | "What should I do today?", "How am I doing in finance?", "When is my exam?", "What did I get wrong last time?" | No | Built by software from the student's real data (plan, status labels, exam dates, feedback records) in REV's voice |
| 2. Approved course content | "What is break-even?", "What's the formula for ROCE?", "What are the types of ...?" | No | Software searches the approved Learn content (definitions, key ideas, worked examples, common mix-ups). If one passage clearly answers it, REV shows that passage with a short lead-in and an "Open in Learn" link |
| 3. A small, cheap model | Simple content questions that need a little explaining, rewording or a quick example, using the passage found in step 2 | Yes, cheapest model | For example Claude Haiku 4.5 |
| 4. A stronger model | "I don't get it", step-by-step help, working out an answer together, exam technique, explaining what the student got wrong, anything unusual, anything the app is unsure about | Yes | Claude Sonnet 5.5 |

Rules that keep this safe and honest:
- **When in doubt, go up.** A step only answers when its match is clearly strong, with a threshold we test and tune. A wrong or irrelevant free answer is worse than a paid right one.
- **"That's not what I meant"** is always offered on a free answer and sends the question up a step.
- **The safety rules apply at every step** (10.7). Any message that looks like distress, or that the app cannot confidently match, goes straight to the model path rather than being answered from content.
- **Nothing is invented at the free steps.** They only show or arrange approved content and the student's own data. The sentences around them are the only words the app writes, and I would keep that small and varied so it does not feel samey.
- **Reusing earlier model answers for other students** (a shared cache) could save more, but it needs rules about privacy, checking quality and expiring answers when content changes. Student questions are private data, so using them to build something shared needs its own governance (Privacy §3). **I recommend leaving this out at launch** and revisiting it with real usage data.
- **We measure it.** The log (10.9) records which step answered each question and how often students pressed "not what I meant", so we can tune the thresholds. The free-step share is something we find out in testing; I cannot promise a number yet (10.11 gives an illustration).

Today, only the content under `content/` is in the app's runtime. The newer Content Factory material is not yet published there, so steps 2 to 4 can use it only after a publishing step, which is a Content Factory job and not part of this proposal.

### 10.4 Which model

Current prices (per million tokens, US dollars, from the Anthropic price list cached on 25 September 2026; I have not re-checked them today):

| Model | Input | Output | Fit for REV |
| --- | --- | --- | --- |
| Claude Haiku 4.5 | $1 | $5 | Cheapest. Weaker at patient explanation and following several rules at once |
| **Claude Sonnet 5.5** | $2 | $10 | **Recommended.** Strong tutoring and instruction-following at a low price |
| Claude Opus 5.5 | $4 | $20 | Strongest. Probably more than a revision question needs |

**Where we are (Lee, 1 October):** the final choice is still open, and Lee is happy to **test with Claude Sonnet 5.5**. So the plan is: build and test with Sonnet 5.5 for the stronger step of the ladder (step 4) and try Haiku 4.5 for the cheap step (step 3), on a fixed set of real questions, before deciding. Thinking is set low for ordinary chat (faster and cheaper) and kept in reserve for harder questions. We should include the provider's built-in fallback option for requests it declines, so a student is not left with nothing. Haiku only takes a step if it matches Sonnet on the safeguarding and "don't answer the exam" tests.

**Important:** the only AI key configured today is OpenAI, used by the Content Factory. Using Claude for REV means adding an Anthropic key as a server secret. Alternatively we could stay with OpenAI. **I recommend one provider for REV that you have read the data terms for**, and I cannot verify those terms for you.

### 10.5 What REV is given

REV is only given what it needs for this question:

- **Where the student is:** the course, topic, and activity (for example "Learn, Break-even"), and the current question's id.
- **Approved course content for that topic**, so answers about the course come from approved material. Today the app's runtime content is the packs under `content/` (AQA Business). The newer Content Factory material is **not yet in the runtime**, so it needs a publishing step before REV can use it. That is a Content Factory job; I will not do it here.
- **The student's status per topic** (Got it, Nearly there and so on) and exam dates. Not their raw answers.
- **The last few messages** of the conversation.

For anything outside their courses, REV answers from general knowledge and says so when it is unsure (decisions §2).

### 10.6 REV's rules

The voice and rules in your decisions file go into a fixed instruction block (older student, never claims to be human, honest about uncertainty, suits a teenager). This block is the same for everyone, so it is cheap to reuse.

### 10.7 How the safety rules are enforced

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

### 10.8 If the model is down or refuses

REV says plainly that it cannot answer right now and the student can carry on revising. It never substitutes a made-up answer.

### 10.9 What is stored and logged

**Conversations (private to the student):** the messages, kept so a chat can continue and so "REV noticed" can return later. Only the student can read them. Admins cannot browse them. Proposal: keep for **12 months** from the last message, and let the student delete any conversation at any time. This is a starting position that needs legal review (Privacy §7, §12).

**Operational log (no message text):** when, which student, which screen, which model, token counts, time taken, estimated cost, whether the safeguarding rule or the exam rule fired, and any error. This lets us watch cost and quality without reading private chats.

**Safeguarding flags:** a record that a flag fired (student, time, level) is kept for safety review. **Decision needed:** whether to also keep the flagged message itself for review, and for how long. Keeping it helps spot failures but cuts against privacy.

**Never:** training an AI model on this data, sharing with parents or teachers, or putting message text in ordinary application logs (Security Standard).

### 10.10 Limits

A per-student daily cap (I suggest 60 questions), a maximum message length, and a monthly spending alarm. These stop accidents and abuse, and keep cost predictable.

### 10.11 Rough running cost

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

**With the ladder (section 10.3).** The table above assumes every question goes to a model. With the ladder, many do not. As an *illustration only* (the real split is found in testing): if 40% of questions are answered free from the app's data and approved content, 20% by the cheap model and 40% by Sonnet 5.5, the cost per student at 90 questions a month falls to about **$0.50 to $0.85**, roughly half. If only 20% are free the saving is smaller; if 60% are free it is larger. The saving depends on how good the content search is and how cautious the thresholds are, so please treat it as a target to measure, not a promise.

A light user (one question a day) costs about a third of that; a heavy user (15 a day) about five times. Examiner-checklist and answer-feedback checks add roughly half a US cent to one US cent per submitted answer (they read the answer and the mark scheme points, so they are bigger than a chat question). Safeguarding ratings are part of the same call, so they add nothing. Server running costs for the function itself are small by comparison. **These figures matter for pricing:** the free tier needs a lower daily cap than paid plans (a Subscription Plans question, not decided here).

### 10.12 Test before launch

Like the examiner checklist, REV answers get a **release gate**: a fixed set of test conversations covering ordinary questions, off-topic questions, attempts to get an exam answer, attempts to write coursework, and a range of safeguarding messages. It must also test the ladder: questions that should be answered free must be answered correctly and not wrongly matched, and questions that should go to a model must not be answered from content. It must pass before real answers go live. Who writes and judges the safeguarding set is part of open item 4 and should involve someone qualified.

### 10.13 Things I cannot settle

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
| 10 | Exam Prep | Exam attempts, drafts, submitted answers and feedback | Partly: papers and timer work; autosave, saved answers and "what you missed" need the tables |
| 11 | Progress | None for the three measures (engine mapping you still need to confirm); missed-point skill insights need the feedback records from PR 10 | Yes for the three measures |
| 12 | Ask REV (pop-up; full screen on phone) | REV function and conversations. The free steps of the ladder (what the app knows, approved content) can ship first | Partly: steps 1 and 2 need no model; steps 3 and 4 need the function and key |
| 13 | Onboarding | Catalogue; Coming-soon requests | Partly: catalogue from code |
| 14 | Empty states | None | Yes |

## 12. Everything proposed, with risk

| New thing | Kind | Risk | Notes |
| --- | --- | --- | --- |
| Catalogue tables | Read-mostly | Low | Admin-edited, public read |
| Coming-soon requests | Student-owned | Low to medium | Free text; cap length |
| Accepted sessions | Student-owned | Low | |
| Retry queue | Student-owned | Low | |
| Exam attempts, drafts, submitted answers and feedback | Student-owned, private | **Medium to high** | Written work. Drafts 30 days; submitted answers kept while the account exists, deletable by the student |
| Theme preference | Student-owned | Low | |
| Two new activity event types | Change to an existing constraint | Low | Additive |
| REV conversations and messages | Student-owned, private | **High** | Most sensitive data we hold |
| REV operational log | Server-owned, no text | Medium | Cost and safety visibility |
| REV server function + model key | New server surface | **High** | New provider relationship |

Each migration would be its own PR, with the database assurance tests, and each needs your explicit approval before merging.

## 13. Decisions

### Decided by Lee on 1 October 2026

- **Ask REV is a pop-up conversation** over the current page; full-screen takeover on phones; no separate page (section 10.2).
- **Ask REV is a real model used cleverly**, answering from the app's data and approved content where it can and paying for a model only when needed (section 10.3).
- **Model:** the final choice is open; test with Claude Sonnet 5.5 (section 10.4).
- **Vetted fixed safeguarding text** is acceptable and is not a "canned reply" in the sense ruled out (section 10.7).
- **REV conversations are kept for 12 months from the last message**, and the student can delete any conversation at any time. Still subject to the legal review in Privacy §12 (section 10.9).
- **Exam answers and feedback are kept** so progress and "what you got wrong" can use them (section 7).

### Also decided by Lee on 1 October 2026 ("agree with all")

Lee agreed with the recommendations for all nine items previously open, and with saving the theme per student. In summary:

1. **Catalogue in the database**, built at onboarding time (section 3).
2. **Coming-soon launch notices** in-app only, no email at launch (section 4).
3. **Accepted sessions table**, so "Add to Thursday" works (section 5).
4. **Exam answers and feedback kept** while the account exists, the student can delete the text, drafts deleted after 30 days; subject to legal review (section 7).
5. **Examiner-checklist switch** is a code setting, off by default, so turning it on needs a PR approval (section 7).
6. **Provider:** decided after the Sonnet 5.5 test, once the provider's data terms have been read (section 10.4).
7. **Flagged messages:** keep only that a flag fired, until a safeguarding reviewer says otherwise (section 10.9).
8. **Daily question cap:** 60 a day to start, lower on the free tier once plans are decided (section 10.10).
9. **No shared answer cache at launch** (section 10.3).
10. **Theme is saved per student**, so it is the same on every device they sign in on (section 9).

### Still open

- The provider choice itself (item 6), after the test.
- Legal review of retention periods (Privacy §7, §12), the provider's data terms, whether students under 16 need parental consent for an AI feature, and checking the UK support numbers.
- Nothing is built until Lee approves the specific migration PR.

If you approve in a different order, tell me which and I will start with the one that unblocks the next screen. **My suggested order:** theme and suggestion events (small, low risk), then the catalogue, then accepted sessions and the retry queue, then exam attempts and feedback, with the REV function last because it carries the most risk and needs the longest testing. The free steps of the ladder (what the app knows, approved content) can ship before the model does.

## 14. What I did not check

- I did not inspect the live production database, only the migrations in the repo, so I am assuming production matches them.
- Model prices are from a price list cached on 25 September 2026.
- I have not looked at how many real students use the app, so the scenarios above are illustrations, not forecasts.
