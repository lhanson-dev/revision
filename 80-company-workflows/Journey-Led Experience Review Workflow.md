# Journey-Led Experience Review Workflow

**Status:** Proposed — Founder direction received 2026-08-23; active after governed merge  
**Owner:** Founder  
**Purpose:** Govern the systematic review and improvement of Revision's end-to-end user experience by user journey rather than by isolated page or stylesheet.

## Operating principle

Revision is reviewed as a sequence of user intentions, decisions and outcomes — not as a collection of pages that merely need to look consistent.

A technically correct or design-system-conformant page is not complete if the learner must stop and work out what the page is for, where they are, or what useful action to take next.

The guiding Founder principle is **"Don't make me think"**:

- orient the learner within seconds;
- make the screen's main job obvious;
- make the primary useful action visually and verbally obvious;
- remove unnecessary decisions before value;
- keep secondary detail available without competing with the main path; and
- minimise the number of steps between intent and useful work.

This does not mean making every page visually identical or stripping away useful depth. Revision should be coherent without becoming monotonous.

## Journey before page

Experience work begins with the user's goal and the end-to-end path required to achieve it.

For each material journey, identify:

1. user intent and entry condition;
2. the shortest credible path to useful value;
3. every material screen and state on that path;
4. the job each screen must perform;
5. what the learner must understand immediately;
6. the primary call to action;
7. legitimate secondary actions and progressive disclosure;
8. REV's role and context at that point;
9. the transition into the next useful state;
10. completion/success evidence;
11. responsive, accessibility, empty, loading, error and recovery states; and
12. measurement or assurance needed to prove the journey works.

A screen may participate in more than one journey. Its design must support those intents without becoming an undifferentiated dashboard.

## Screen-purpose contract

Before content or visual redesign of a material screen, record a concise screen-purpose contract:

- **User goal:** what the user came here to achieve.
- **Screen job:** the single dominant job this screen performs in the journey.
- **Immediate understanding:** what should be clear within seconds.
- **Primary CTA:** the most useful next action for the dominant intent.
- **Secondary actions:** useful but visually subordinate alternatives.
- **Essential content:** information required to decide or act now.
- **Progressive detail:** information available on demand but not competing with the main path.
- **REV role:** what REV should know, explain, recommend or avoid doing here.
- **Success condition:** what counts as the screen having done its job.
- **Next state:** where the user should naturally go next.

If a screen has several unrelated "primary" actions, the hierarchy is unresolved and the design is not ready.

## Consistency without sameness

The Interface System provides one coherent visual and interaction language. It must not turn Revision into a sequence of interchangeable card grids.

Page composition should express the job of the experience:

- Home should orient and start momentum quickly;
- Learn should prioritise reading, explanation and comprehension;
- Practice should prioritise the task, response and feedback loop;
- Plan should prioritise decisions and commitments;
- Progress should prioritise interpretation and next action rather than raw analytics;
- Exam Prep and Exam Simulator should feel focused and performance-oriented;
- REV should feel contextually present rather than bolted on;
- Admin may use higher information density while retaining shared foundations.

Shared tokens, components, icon language, typography and accessibility create coherence. Composition, information density and visual rhythm may differ when the user job differs.

## Content and design are reviewed together

Do not conduct a cosmetic design pass over content that has not earned its place.

For each screen/state review:

- remove content that does not help orientation, decision or action;
- use headings and labels that state the job in plain language;
- place the most decision-relevant information closest to the action it informs;
- avoid introductory copy that delays useful work;
- avoid repeating the same explanation across several adjacent surfaces;
- preserve necessary educational depth through progressive disclosure; and
- ensure visual hierarchy matches content priority.

A visually polished page with unclear content priority fails review.

## Short-PR delivery rule

The experience programme is delivered through short-lived, bounded PRs.

- Each PR has one clear user or system outcome.
- Do not keep an omnibus "full redesign" PR open while unrelated areas evolve around it.
- A task may use several small PRs where risk or ownership boundaries justify it.
- Dependent work starts from current approved `main` after the prior increment is merged, unless it can progress safely in parallel without creating integration ambiguity.
- A stale branch must not be rescued merely because work already exists on it; preserve useful evidence and reapply the still-valid change from current `main`.
- Every PR includes its documentation-impact check and the assurance appropriate to the affected journey.

## Programme sequence

The current experience programme is:

1. **Foundation cleanup / B7** — remove obsolete visual/compatibility ownership and prove the approved Interface System is the only live foundation.
2. **New learner → first value** — account/setup/course selection/baseline/first useful action.
3. **Returning learner → Home → recommended action** — immediate orientation, priority and start-work path.
4. **Courses → course Overview → revision mode** — saved course selection, orientation and direct route to Learn/Practice/Exam Prep/Progress.
5. **Learn → Practice → feedback loop** — understand, retrieve/apply, receive useful feedback, move to the next action.
6. **Plan → activity** — turn revision intention and constraints into an obvious executable next step.
7. **Progress → insight → action** — understand current position without decoding a dashboard and move directly to useful work.
8. **Exam Prep / Exam Simulator** — move from readiness signal into realistic performance practice and useful post-exam action.
9. **Ask REV across the above journeys** — prove REV is contextual, continuous and useful without disrupting the underlying task.
10. **Account / Settings / Subscription** — keep identity, preferences and commercial actions clear and subordinate to learning.
11. **Parent / supporter** — provide reassurance and useful support within the governed privacy boundary.
12. **Admin / operational surfaces** — complete the lower-frequency operational journey review without weakening the shared design foundation.

Journey analysis for later items may progress while an earlier implementation increment is being completed, but production redesign should follow the programme order unless a defect or dependency justifies reprioritisation.

## Foundation gate before journey redesign

Task 1 must establish a clean approved foundation before broad page redesign proceeds.

Completion requires evidence that:

- the canonical runtime no longer depends on obsolete visual implementations merely hidden by later overrides;
- legacy/compatibility CSS and copied component anatomy are removed or explicitly classified with a proven live dependency;
- reusable typography, colours, spacing, radii, controls, icons, identity assets and theme behaviour come from approved shared sources;
- the temporary theme-integrity bridge is removed or reduced only to deliberately retained compatibility needs;
- canonical states remain correct in Light/Dark and across supported phone/tablet/desktop layouts;
- high-value visual regression coverage protects composition as well as token semantics; and
- technical documentation describes the resulting implementation truth.

B7 is not complete simply because files or selectors were deleted.

## Journey review output

Each journey review should produce a concise journey map and screen-purpose matrix before implementation begins.

The matrix should make at least these fields explicit:

| Screen/state | User intent | Screen job | Immediate understanding | Primary CTA | Secondary actions | REV role | Success / next state |
| --- | --- | --- | --- | --- | --- | --- | --- |

The implementation PR then references that agreed journey/screen contract rather than inventing page hierarchy during coding.

## Acceptance questions

Before a journey increment is considered complete, ask:

- Can the intended user tell what to do within seconds?
- Can they reach useful value without unnecessary navigation or configuration?
- Is one action clearly primary where the journey needs one?
- Does the page look and behave like Revision without looking interchangeable with every other page?
- Does content hierarchy match user priority?
- Does REV add contextually useful intelligence rather than noise?
- Are all material states intentional, including first-use, empty, loading, error, completed and recovery states?
- Does the same priority survive phone, tablet, desktop, Light and Dark?
- Can keyboard and assistive-technology users complete the same journey?
- Does the next action preserve momentum rather than returning the user to navigation or interpretation work?

## Documentation impact

This workflow operationalises `10-product-governance/Core User Journeys.md`, `20-brand-and-experience/Product UX Principles.md`, the approved Visual Brand System and the Interface System operating standard.

When a journey review discovers that the product should behave differently, amend the relevant normative authority in the same governed change before or with implementation. When only implementation is being aligned to existing authority, update code, assurance and technical documentation without rewriting historical audit evidence.
