# Core screens design review (30 Sep 2026)

> **SUPERSEDED on 1 October 2026.** This 30 September 2026 design review is replaced by the learner redesign v2.1: decisions in `docs/design/decisions/2026-10-01-learner-redesign-v2.md`, design values and tracker in `docs/design/learner-redesign-v2/`. Its findings stay here as historical evidence. Do not build from it. Where it conflicts with the v2.1 decisions (for example the navigation drawer, Ask REV dock, pale subject accents and Manrope-only typography), follow the v2.1 decisions.


Reviewed Home, Plan, REV, Progress and Courses on `main` (commit ab0c3b3), desktop 1440px and phone 390px, light and dark. Checked against the Visual Brand System, Global Learner Navigation v0.10, Product UX Principles, Tone of Voice, Emotional Experience Principles and the Interactive Component Quality Standard.

Clickable mockup: https://claude.ai/artifact/6ataiym6cGxdxBx6CokSpT

## Home

Right idea, heavy execution. The REV-first hero follows the Brand System, but the greeting is oversized, the only task below it is explained in system language, and the side panel is almost empty. Rating: needs polish.

- **High: Greeting overpowers the page.** The heading renders at roughly 64px and wraps to three lines on desktop and five on phone, squeezed beside the Living E. The Brand System sets the Home greeting at Display L (44px desktop, 34px mobile). Copy also says "Hi" where the approved line is "Hey {first name}, what shall we do today?". _(Visual Brand System · Typography, Learner Home)_
- **High: Missing quick actions and "continue where you left off".** The approved Home order is greeting, REV input, a small set of quick actions, then recent context. Only the input and one task exist, so a returning student has no fast route back into what they were doing. _(Visual Brand System · Learner Home)_
- **Medium: Recommendation explains itself in system terms.** "Revision cannot tell whether it is strong or weak… establish an application baseline" asks the student to decode how the recommendation works. It should say what to do and why in plain words. _(Tone of Voice · Rules)_
- **Medium: Empty "Today" panel.** The right-hand card holds one sentence in a 390px-tall box. It reads unfinished and pushes the real task into a narrower column. _(Product UX · cards group a clear job)_
- **Medium: The subject name competes with the greeting.** "Business" is set at about 56px inside the card, while what matters (activity, topic, time, why) is small body text. _(Visual Brand System · hierarchy)_
- **Low: Three wordmarks in one view.** Revision, Ask REV and a "Powered by REV" pill all sit in the first viewport. The pill adds nothing on a REV-first page. _(Identity Asset Usage Rules)_
- **Low: Phone hero is cramped.** The Living E and heading sit side by side on a 390px screen. Stacking them gives the greeting the full width. _(Visual Brand System · responsive layout)_
- **Keep: Keep: dark Feature hero and one clear primary action.** The Deep Teal feature surface, 48px controls and single "Start" action are on-brand. The mockup keeps them. _(Visual Brand System · Surface families)_

**Mockup changes:**

- Greeting set at Display L with the approved "Hey Alex…" copy, Living E and REV state above it.
- Composer (52px+) with four quick actions. Try them: REV answers inline.
- "Up next" card says what, how long and why in one plain sentence, with a clear Start button.
- The empty panel becomes a real "Today" list tied to the plan, plus "Continue where you left off".
- Phone: stacked hero, wordmark in the top bar, Ask REV dock with bottom clearance.

## Plan

Useful setup, wrong order. A new student meets a four-line explanation and two forms, and the plan itself is a placeholder at the bottom. There is also a visible layout bug in the daily time controls. Rating: needs rework.

- **High: Bug: daily time controls truncate to "N..".** At 1440px the seven day controls are too narrow for "No time set", so every day reads "N..". Students can't see what they have entered. _(Interactive Component Quality Standard)_
- **High: The plan comes last.** The page opens with an explanation panel, then Step 1 and Step 2 forms, then "Your plan will appear here". The student's question ("what am I doing this week?") is answered last or not at all. _(Product UX Principles · next action first)_
- **Medium: Setting weekly time takes at least 14 taps.** Each day needs separate taps, then a separate Save. Presets such as "30 min on weekdays" would cover most students in one tap. _(Product UX · reduce effort)_
- **Medium: A second "Ask REV anything" box.** The Plan header repeats the REV input, although REV is already one persistent global action in the rail and dock. _(Global Learner Navigation · Ask REV)_
- **Medium: Explanation copy is long and abstract.** "Revision uses your exam dates, the time you realistically have available and evidence…" is 60 words before any action. Put it behind a short "How your plan works". _(Tone of Voice · write for scanning)_
- **Low: Phone page is about 3,200px long.** Seven stacked day cards dominate the page on mobile. A compact list of days keeps the same control in a third of the height. _(Visual Brand System · responsive)_

**Mockup changes:**

- Opens on this week: seven days with sessions labelled Learn, Practice or Exam Prep (text, not colour alone). Today's sessions can be ticked off.
- Study time is one compact row of working steppers with presets. Weekly total updates live.
- Exam dates for Papers 1–3 as simple labelled date fields, with an honest "add dates for a sharper plan" prompt.
- "How your plan works" becomes a short disclosure.
- Duplicate REV input removed. Ask REV stays in the rail and dock.

## REV

The weakest page. It doesn't yet feel like a place to talk to REV: one input, a duplicated question, a limitation stated in internal terms, and a Living E that is disconnected from the message. Rating: needs rework.

- **High: "How can I help?" appears twice, then leads with a limitation.** The heading and the first line of the message repeat each other. The message then says REV "needs an assessment attached to one of your active courses… before I can properly negotiate the wider plan", which is internal language. _(REV Guidance and Conversation Pattern · Tone of Voice)_
- **High: No conversation space or visible REV state.** There is no thread, no suggested prompts and no sign of the governed states (Resting, Listening, Thinking, Responding, Completed). The page reads as a form, not a conversation. _(Visual Brand System · REV motion system)_
- **Medium: Living E floats alone.** The halo sits at the far right, away from the words REV is "saying", and a "REV" pill repeats the page title. _(Identity Asset Usage Rules)_
- **Medium: Intro and footnote are technical.** "REV reasons across your active saved courses, not the full published catalogue" and a 12px footnote about evidence explain the system, not the benefit. _(Tone of Voice · technical complexity stays behind the product)_
- **Low: Composer is out of proportion.** On desktop the Send button is half the width of the input. It should be one 52px+ unit with an icon send button inside. _(Visual Brand System · Controls)_

**Mockup changes:**

- A real conversation thread with REV's Living E next to its messages and a visible state label (Ready → Thinking → Answered). Try the suggested prompts.
- REV opens by saying what it can see and offering useful prompts, not by listing what it lacks.
- The right column shows "What I'm using" in plain words, including what's missing (exam dates) with a direct fix.
- One composer with a visible label and a 44px send button.

## Progress

Honest evidence model, cold presentation. It correctly keeps coverage, scored work and readiness separate, but it leads with caveats and bare numbers and never tells the student what to do next. Rating: needs rework.

- **High: Leads with system caveats, not meaning.** "Course membership itself is not progress evidence" is a rule for the product team, not a student. Progress should explain what the evidence means and give a direct next action. _(Visual Brand System · Focused section: Progress)_
- **High: Bare numbers with jargon labels.** Tiles read "0 / 6", "0" and "0 / 1" under "Evidence coverage" and "Readiness available". A new student gets nothing to act on, and the empty state has no first step. _(Tone of Voice · required learner questions)_
- **Medium: No per-topic picture.** The global page can't show which topics are secure and which need work without opening each course. _(Product UX · next action)_
- **Medium: Stretched button.** "Open course progress" stretches to about 700px, far wider than its job. _(Visual Brand System · Button family)_
- **Keep: Keep: separate measures.** Coverage, understanding and exam readiness are kept apart and not collapsed into one percentage. That matches the data-visualisation rules, and the mockup keeps it. _(Visual Brand System · Data visualisation)_

**Mockup changes:**

- Opens with "Your biggest gain right now" and a direct Start action.
- Three separate measures with plain names: Topics covered, Understanding, Exam readiness. Readiness says honestly when there isn't enough evidence yet.
- By-topic list for all ten AQA 7132 areas, with status shown by icon and text as well as colour. The filters work.
- Status colours use the semantic set, and neutral progress uses Data Teal, not Success green.

## Courses

Functional but unfinished. There are visible spacing defects, and a destructive action sits at the same weight as the main one. The card also shows catalogue metadata instead of what a student needs. Rating: needs rework.

- **High: "Remove course" sits next to "Open course".** A destructive action at equal prominence, right beside the primary action. (Correction: a confirmation dialog does exist; its copy is system-worded.) _(Visual Brand System · Destructive buttons)_
- **High: Layout defects.** "Add course" floats mid-header and wraps onto two lines. The course card has about 100px of empty padding above and below its content, with a large empty gap above it. _(Visual Brand System · Spacing)_
- **Medium: The card doesn't show what a student cares about.** "6 syllabus topics · 1 exam paper/component" is catalogue data. There's no next step, no progress and no route straight into Learn, Practice or Exam Prep. _(Global Learner Navigation · course sections)_
- **Medium: Internal language.** "learner-wide REV guidance" and "Specification 7131" as the lead identity. _(Tone of Voice)_
- **Low: Weak course identity.** The course relies on a text chip. The subject accent system asks for name + icon + optional accent tile. _(Subject Accent Colour System)_

**Mockup changes:**

- A tidy header with a single-line "Add a course" button.
- The course card shows exam year, coverage, the next step and direct links to Overview, Learn, Practice, Exam Prep and Progress.
- Remove moves into a "Manage" menu with a plain confirmation that says your work is kept. Try it.
- Subject icon tile on a Warm Sand accent, with no fixed subject-to-colour mapping implied.

## Across the site

- **Medium: No wordmark on the phone top bar.** On mobile the top bar shows only the menu control, so the brand appears only in the Ask REV dock. _(Visual Brand System · Global navigation)_
- **Medium: Uppercase eyebrows on every page.** "YOUR ADAPTIVE REVISION PROGRAMME", "YOUR EVIDENCE PICTURE" and similar add noise and use internal framing. Use eyebrows only where they help orientation. _(Tone of Voice)_
- **Low: Prose runs too wide.** Intro paragraphs on Plan and REV run to 110+ characters per line. Hold explanatory text at 680–760px. _(Visual Brand System · Width guidance)_
- **Low: Inconsistent rail weights.** "Ask REV" is set at regular weight while nav labels are bold, so the strongest action looks weakest. _(Visual Brand System · Global navigation)_
- **Keep: Strong foundations.** Tokens, 48px controls, radius families and a well-translated dark theme largely follow the Brand System. The rail plus Ask REV dock matches Global Learner Navigation v0.10. _(Visual Brand System · Global Learner Navigation)_


## Part 2: inside a course and the first visit

Reviewed on `main` 30 Sep 2026. Designs added to the same canvas and saved as images in the Revision folder under "Design mockups".

### New student (first visit)

A new student meets a full "what shall we do today?" hero and a "Today's revision plan" heading for a plan that can't exist yet. The one thing they need to do (add a course) comes third. Rating: needs rework.

- **High: The first step is buried.** "Add a course" sits below the hero, the REV input and an empty plan heading. The Emotional Experience Principles ask for one clear, manageable next step. _(Emotional Experience Principles)_
- **Medium: REV is offered before it can help.** The main REV input invites questions before REV knows the student's courses, dates or time. _(REV Guidance and Conversation Pattern)_
- **Medium: Defensive system copy.** "Revision only plans from the courses you actually study. It will not invent work from the wider catalogue." _(Tone of Voice)_
- **Low: "View full plan" leads to an empty page.** A link to a plan that doesn't exist yet. _(Product UX)_

**Mockup changes:**

- A welcome that says exactly what happens next and how long it takes.
- A three-step set-up: add your course, add exam dates, set weekly time. Try clicking through it.
- "What you'll get" shows the value honestly, with no invented numbers.
- REV is offered as "Ask how Revision works", not as a blank box.

### Course Overview

A second Home page inside the course. The Overview repeats the dark REV hero, a "Powered by REV" pill and another Ask REV box. The topic grid gives six identical "Not enough evidence" labels, so there's nothing to act on. Rating: needs rework.

- **High: Duplicates Home instead of orienting.** A second dark feature hero and second Ask REV input push the course content below the fold. The Brand System says Overview is a "calm orientation hub… not a duplicate of all other sections", and Feature surfaces should stay scarce. _(Visual Brand System · Focused section: Overview)_
- **High: The topic grid tells the student nothing.** All six tiles read "Topic knowledge · Not enough evidence". They don't show progress, what's next, or where each tile goes. _(Product UX · next action)_
- **Medium: System wording in the hero.** "REV has no scored evidence for this topic yet" and the uppercase "YOUR PROGRESS" panel explain the model rather than the next step. _(Tone of Voice)_
- **Medium: The course leads with the exam board.** The title is "AQA AS Business" under an "AQA · SPECIFICATION 7131" eyebrow. Students think "Business". The board and code belong in the metadata line. _(Subject Accent Colour System · name + icon)_
- **Low: The exam date is a dead end.** "Not set yet — Add a public exam date in Plan" isn't a link. _(Product UX)_

**Mockup changes:**

- A compact course header: subject icon, "Business", then the board, level, code and exam year on one line.
- A light "Up next" card with a plain reason replaces the second dark hero. REV stays in the rail and dock.
- All ten AQA 7132 areas with a status, a progress bar and direct Learn and Practise links.
- "Your papers" shows all three papers, with an "Add date" link that works.

### Learn

The strongest course page: a good reading width, a clear active trail and useful next steps. It's let down by a tall header and plain paragraphs that don't use the approved teaching treatments. Rating: needs polish.

- **Medium: About 400px of header before any teaching.** Breadcrumb, eyebrow, course H1, a system intro, section tabs and a second breadcrumb all appear before the first sentence of the lesson. _(Visual Brand System · Learn prioritises sustained reading)_
- **Medium: Teaching treatments aren't used.** Formulas, definitions and examples are plain sentences ("Profit = revenue − total costs…"). The approved Key Idea, Worked Example, Misconception, Quick check and Recap treatments exist for exactly this. _(Educational Treatment System)_
- **Medium: The intro repeats a system note on every tab.** "Paper-specific formats, techniques and full simulations sit inside Exam Prep" appears above Learn, Practice and Progress. _(Tone of Voice)_
- **Low: Filler subtitle.** "Understand the key ideas in purpose, objectives & profit and how they connect to the wider topic" is a template line that adds nothing. _(Tone of Voice)_
- **Keep: Keep: reading measure, active trail and next steps.** Prose is held near 760px, the rail shows where you are, and "Next" and "Practice this topic" close the page well. _(Global Learner Navigation v0.10)_

**Mockup changes:**

- A one-line course header, so the lesson starts high on the page.
- The page uses Key idea, Formulas, a four-step Worked example, a Common mix-up, an unscored Quick check (try it) and What to remember.
- "On this page" contents with page progress sits beside the text.
- Contextual Ask REV ("Explain this another way") uses the page's own context.

### Practice

The task is buried. Five lines of evidence caveats come before any question, and two different activities compete: the recommended Quick check, and a flashcard already open below it. Rating: needs rework.

- **High: Two activities compete.** "Start recommended activity" (Quick check) sits above an open flashcard ("Card 1 of 16"). The student can't tell which one they're meant to be doing. _(Visual Brand System · Practice: current task dominates)_
- **High: Caveats before the task.** "Evidence used: 0 scored activities across 0 evidence types…" and "Confidence limitation: this is a coverage recommendation…" are for the product team, not the student. _(Tone of Voice)_
- **Medium: Activity tabs are cut off on phone.** Only "Flashcards" and "Quick check" are visible at 390px. Case study and Formulas & data are hidden off-screen. _(Visual Brand System · no hidden overflow)_
- **Medium: A system note sits above the question.** "Scored evidence — Your self-rating is recorded and contributes to the evidence picture" sits between the student and the question. _(Tone of Voice)_
- **Low: Repeated title.** "Practice · AQA AS Business" repeats the course name directly under the course header. _(Visual Brand System · hierarchy)_

**Mockup changes:**

- One task fills the page: question, answer choices, Check answer, then feedback that explains why. Try picking a wrong answer.
- The question number and a progress bar show where you are. "Why this activity" is one line in the side panel.
- Other ways to practise (Flashcards, Case study, Formulas) move below as secondary choices.
- Wrong answers get a specific explanation, for example "you divided by the price, not the contribution".

### Exam Prep

Useful technique content in the wrong order. About 1,300px of technique cards come before "Choose a paper", and the only way to practise under exam conditions is collapsed at the very bottom. Rating: needs rework.

- **High: The papers are at the bottom.** Timed practice, the main job of Exam Prep, is the last thing on the page, collapsed. The Brand System wants Exam Prep to make timing, marks and exam conditions more prominent. _(Visual Brand System · Focused section: Exam Prep)_
- **Medium: Acronyms without explanation.** "BLT — build analysis" and "MOPS — earn evaluation" arrive as headings. The steps help, but the terms need a plain name first. _(Tone of Voice · explain specialist terms)_
- **Medium: Controls that do nothing.** A "Topic" dropdown and a single "Exam technique" tab sit above content that doesn't change. _(Interactive Component Quality Standard)_
- **Low: System note.** "Reading this guidance does not count as scored evidence" is for the product team, not the student. _(Tone of Voice)_
- **Keep: Keep: the technique content.** The exam-habit callouts are specific and useful. The mockup keeps the same content in a compact list. _(Educational Treatment System)_

**Mockup changes:**

- "Your papers" leads: all three AQA 7132 papers with length, marks, format, status, and "Timed paper" or "One question".
- A single recommended next step: one timed question on finance.
- Technique becomes an open-and-close list with plain names first ("Build analysis (BLT)"). Try opening the items.
- The orphan dropdown and single tab are removed.

### Course Progress

Honest but cold, and inconsistent with the main Progress page. It explains how evidence is counted, then shows six identical "No scored evidence yet" tiles with no way forward. Rating: needs rework.

- **High: Explains the model, not the student's position.** "Shared syllabus coverage is counted once at course level. Exam attempts from individual papers still contribute…" answers a question no student asked. _(Tone of Voice · never make a learner decode how a score works)_
- **High: No next action.** Six topic tiles say "No scored evidence yet", none links anywhere, and there's no route to start. _(Visual Brand System · Progress gives direct next actions)_
- **Medium: "Building" looks like a result.** "Course readiness: Building" is set in large bold type, like a score, when it actually means "not enough evidence yet". _(Claims and Progress Governance)_
- **Medium: Different labels from the main Progress page.** "Evidence coverage" and "Course readiness" here, versus different names on the main page. The two should share wording. _(Visual Brand System · shared evidence semantics)_

**Mockup changes:**

- One plain summary sentence with the next biggest gain and a Start button.
- The same three measures and names as the main Progress page.
- Every AQA 7132 area expands to show its subsections (3.2.1, 3.2.2…) with status and a Practise link. Try opening them.
- "How this is worked out" is a short disclosure for anyone who wants it.

## Status

- 30 Sep 2026: quick fixes (Plan stepper bug, Remove course placement and copy, Courses header/spacing, learner copy rewrites, "Hey {name}" greeting) committed on branch `fix/learner-quick-fixes-review` (commit 6cea6b9). Push blocked: the repo needs adding to the Cowork session sources. Patch saved as learner-quick-fixes.patch.
- 30 Sep 2026: push still blocked (Cowork projects cannot add code repos). Route: apply the patch via a claude.ai/code session with lhanson-dev/revision selected.
