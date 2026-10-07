# Learner redesign v2: decisions and behaviour rules

**Approved by:** Lee (Founder) · **Date:** 1 October 2026 · **Status:** historical decision record — superseded for current learner-design authority by ADR-0031 and `20-brand-and-experience/Learner Design System.md`

This file records what Lee decided for the v2 learner redesign, and the behaviour rules the app must follow. It sits alongside the Revision Design System (from Claude Design), which holds the visual values: tokens, components, palette and layout.

## Current authority relationship

This file preserves the 1 October learner-redesign decisions as history. It is no longer a competing current design authority.

For current work:

1. learner visual/interaction design starts with `20-brand-and-experience/Learner Design System.md`;
2. specialist product/evidence behaviour comes from the relevant numbered authority;
3. `decisions/ADR-0031-reconcile-revision-design-system.md` records the 7 October reconciliation decision history; and
4. the design package, mockups and screenshots below are reference/evidence only unless their rule has been promoted into active numbered authority.

The body below is intentionally preserved as the historical 1 October record and is not rewritten to pretend the later reconciliation existed at that time.

---

## 1. Visual decisions

- **Teal is Revision's colour.** It's for the brand, REV, primary actions, links and focus only. No subject uses it.
- **Three colour roles never mix.** Brand teal; status (teal, yellow, coral, neutral, always icon + text); subjects (their own palette).
- **Status labels**, mapped from the readiness engine's states (`src/engine/readiness/readiness.ts`). Don't invent new thresholds.

| Label | Engine state | Colour |
| --- | --- | --- |
| Got it | secure | Teal |
| Nearly there | developing | Yellow |
| Needs work | needs work | Coral ("look at this", never error red) |
| Just started | not enough evidence, but at least one answer in the topic | Neutral |
| Not started | no answers in the topic | Neutral |

- Yellow means **Nearly there** only. Dates and "coming up" are neutral text with a clock icon.
- **Subject palette:** adopt the design system's palette (10 hues plus family variants). One hue per top-level subject, fixed for everyone and stored in the catalogue (`subjects.hue`). Every course inherits it, so GCSE and A-level Business are both blue. GCSE Combined Science uses the parent violet. Split subjects (Biology, Chemistry, Physics; English Language, Literature) use subtle variations of the parent hue. Subjects never use teal, yellow or coral.
- **Solid subject colours** on course card panels and Plan session blocks: adopted.
- **Letter marks** are the subject icons (B, Bi, Ch, Ps…), stored in the catalogue (`subjects.mark`). Always shown with the subject name.
- **Typefaces:** Bricolage Grotesque 800 for headings and big numbers; Manrope for everything else. Always with a system fallback.
- **The Living E** is REV's signature and is always gently moving. Four states: Waiting (slow breathing), Listening (the student is typing), Thinking, Responding (settles as the answer appears, then back to Waiting). **Thinking loop: 1.4s** (within the live standard's 1.4–2.2s). With reduced motion it stays still and shows a text label ("REV is thinking"). Every state is also given as text for screen readers.
- **Layout and breakpoints:** as `guidelines/RESPONSIVE.md` (sidebar above 960px, icon rail 621–960, bottom tab bar with REV raised in the centre at 620 and below, one 1100px canvas). The page scrolls down, never sideways.
- **Exam Prep:** navigation is hidden throughout (focus mode). Leaving a running timed paper asks for confirmation first.
- **No game mechanics:** no XP, streaks, levels, badges, leaderboards, trophies or confetti.
- **Theme:** light, dark or system, saved per student, with system as the default.

## 2. REV

REV has three jobs: suggest what to do next based on the student's progress (always saying why), answer questions whenever the student asks, and act as a positive, motivating coach.

### Who REV is
- REV feels like an older student who got top marks in these subjects, not a teacher.
- Relatable, not try-hard: everyday words, contractions, short sentences. No slang that dates quickly.
- Encouraging and honest: celebrates real progress with specifics, never gives empty praise, and frames weak areas as the next thing to sort.
- Shares the shortcuts: memory tricks, what examiners look for, how to structure answers.
- Calm about exams.
- **Never pretends to be human.** It never claims to have sat exams, been to school or had personal experiences.

| A teacher would say | REV says |
| --- | --- |
| You should revise break-even before your examination. | Break-even's on Paper 1 and it's worth nailing. Want to do 10 minutes on it now? |
| Your answer lacked sufficient evaluation. | Good analysis. To get the top marks, finish with a judgement: which factor matters most, and why? |
| Well done on completing the task. | That's your best score on finance yet. You're getting this. |

### Suggestions
- Every REV card includes a reason taken from real data. No reason, no card: show the empty state instead.
- **The topic is chosen by rules, not a language model.** A model may only reword the reason.
- Priority order, using the engine's states:
  1. An exam within 14 days covers a topic marked Needs work.
  2. A topic marked Needs work, then Nearly there.
  3. A topic with an exam coming that hasn't been studied for 7+ days.
  4. The next unstarted topic in course order.
- The 14-day and 7-day windows are starting values, to be tuned after testing.
- "Suggest something else" moves to the next candidate. "Not now" hides that suggestion until tomorrow. The same topic isn't suggested twice in a day unless the student asks.

### Answering questions
- REV answers questions for real from launch. **No canned or fake replies anywhere.**
- REV helps with anything the student asks, not only their courses. Questions about their courses are answered from the approved course content, using the context of what the student is reading or practising.
- REV never answers a scored or timed exam question for the student, and never writes assessed coursework. It helps them work it out.
- When REV isn't sure, it says so rather than guessing.
- Answers suit a teenage audience.

### Safeguarding (launch rule)
- If a student says they're really struggling, REV replies kindly and briefly, suggests talking to a teacher, parent or another trusted adult, points to UK support such as Childline and Shout, then offers to carry on with their revision.
- REV is not a support service. It doesn't counsel or hold long conversations about wellbeing.
- If a student may be in immediate danger, REV gives emergency help (999) straight away.
- Alerting a parent or school is **not** part of launch. It needs a full safeguarding review first.

### Deferred
- "REV noticed" pattern cards are out for launch. Keep the session and answer history so they can come back later with a higher evidence bar than five data points.

## 3. Progress

- Three separate measures, never one blended percentage: **Topics covered** (x of y), **Understanding** (a stacked bar with text labels, e.g. "1 got it · 2 nearly there · 1 needs work · 6 not started") and **Exam readiness**.
- Exam readiness is only ever an engine-produced value or "Not enough evidence yet" plus what would unlock it. **No predicted grade** (e.g. "Grade 6–7") until Lee decides the format and the engine supports it.
- Every progress screen opens with a plain summary sentence and one next action, before any numbers.
- Course Progress and the global Progress page use the same measures and names.
- "How this is worked out" is an optional disclosure of no more than three plain sentences.

## 4. Onboarding

Order: **Level** (GCSE or A-level; both allowed; AS sits under A-level) → **subjects** at that level → **exam board** for each subject (and AS or full A-level where both exist) → exam dates → weekly study time → first plan.

- Subjects and boards come from the catalogue, so new courses appear without design changes.
- A student can add subjects or boards Revision doesn't offer yet. These are saved on their profile as "Coming soon" and aren't planned or tracked.
- When a course launches, students who said they study it are offered it.

## 5. Exam Prep: examiner checklist

- Points tick automatically as the student's answer covers each one.
- Labelled as a guide to what examiners look for, never a mark or predicted grade.
- Practice mode only; hidden during timed mock papers.
- Points come from the approved mark scheme content, never invented by the model.
- Students can see why each point ticked.
- **Release gate:** before it goes live, it's tested against a set of real marked answers to check it ticks the right points.

## 6. Learn: Quick check

- An unscored check inside Learn, labelled "Not scored". Instant feedback that explains why; another try allowed.
- It never changes status, Topics covered or readiness.
- It needs a quick-check block in the Learn content schema, added through the Content Factory process (approved).

## 7. Practice

- After each answer, a feedback bar explains why, using the content's own explanation. Correct uses teal; wrong uses coral, never error red.
- Wrong answers go into a retry queue and come back later ("This will come back later").

## 8. Empty states

- Each screen shows its set-up empty state until **that screen** has real data to show, then switches to the real view. There's no global "3 sessions" rule.

## 9. Honest data (every screen)

- No number, date, name or topic is hard-coded from mockups or sample content.
- Coverage, understanding and readiness stay separate.
- Empty states read well for a brand-new student with one course and no answers.

---

## Overrides of `NEW_FEATURES.md`

| NEW_FEATURES says | Follow instead |
| --- | --- |
| F1: pick topics by "mastery < 60%" and "quiz score < 50%" | Engine states (section 2) |
| F7: readiness as a grade range | Engine value or "Not enough evidence yet" (section 3) |
| F10: empty state until 3 completed sessions | Per screen (section 8) |
| F6: checklist shows covered or not | Also show why each point ticked; release gate (section 5) |
| "Data REV needs": mastery % per topic | Not used. Use engine states and answer history |
| Endpoint and table names | Placeholders. The data model is proposed to Lee first |

## Open items (ask Lee when reached)

1. Exam readiness format (predicted grade or not), once the engine can support it.
2. Who supplies the marked answers for testing the examiner checklist.
3. Tuning the 14-day and 7-day suggestion windows after testing.
4. Safeguarding review before any parent or school alerts.
5. "REV noticed" evidence bar, when patterns come back.

---

## Addendum, 1 October 2026 (later the same day, from Lee)

Recorded as given. These add to the decisions above and do not change them.

1. **Ask REV is a pop-up conversation** over the page the student is on, so it does not take them away from it. On a phone, where there is no room, it takes over the whole screen. It does not need its own page.
2. **Ask REV is a real model used cleverly.** If a message can be answered from understanding the content, it should not need a paid call. It should be a really efficient coach that can answer anything to do with the subject content.
3. **Exam answers should be kept and used.** The app needs to understand how the student did on exam questions, include it in progress data, and help them with what they got wrong.
4. **Model:** still to decide; happy to test with Claude Sonnet 5.5.
5. **REV safeguarding replies may use vetted fixed text** (this is not a "canned reply").
6. **REV conversations are kept for 12 months from the last message**, and the student can delete them at any time.
7. **Status-label mapping confirmed:** good topic knowledge is Got it; medium is Nearly there; low is Needs work; not-enough-evidence is Just started if the student has answered anything in the topic, otherwise Not started.
8. **Data model recommendations agreed** (all items in the PR 2 proposal, including the theme being saved per student so it is the same on every device). Detail: `docs/design/learner-redesign-v2/data-model-proposal.md`.
