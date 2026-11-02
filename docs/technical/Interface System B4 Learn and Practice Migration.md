# Interface System B4 — Learn and Practice Migration

**Status:** B4 original migration and reading-first Learn live; page-level Practice reconciliation proposed in a governed draft PR  
**Authority:** `10-product-governance/Learn MVP Experience.md`, `20-brand-and-experience/Educational Treatment System.md`, `20-brand-and-experience/Visual Brand System.md`, `20-brand-and-experience/Product UX Principles.md`  
**Canonical runtime:** `/revision/app/` → `app/index.html` → `src/main.tsx` → `AuthGate` → `FirstUseBoundary` → `PlannerRuntime` → `CourseExperienceScreen`

## Purpose

Record the Interface System implementation boundary for the learner-facing Learn and Practice experiences.

The original B4 migration moved the combined `FocusedLearningWorkspace` onto the approved Interface System without changing educational/evidence behaviour. Issue #381 now evolves **Learn only** to the Founder-approved comprehensive, reading-first experience while preserving the B4 Practice task/feedback model.

## Current responsibility split

### Learn

Canonical Learn now uses `LearnReadingWorkspace` inside `CourseExperienceScreen`.

The reading-first implementation:

- begins directly beneath existing course identity/navigation;
- uses the learner hierarchy `chapter/topic → group → teaching page`;
- keeps ordinary prose as the dominant surface;
- renders selective shared educational treatments where content requires them;
- provides contextual REV help without creating a second assistant surface;
- treats previous/next teaching-page navigation as the natural continuation;
- keeps contextual Practice clearly available as a secondary handoff;
- carries the exact active teaching page in the route; and
- uses the existing learner rail/drawer for nested Learn contents rather than adding another navigation system.

The legacy Learn-specific workspace heading, local topic selector, `Topic notes / Link topics` switch and generic `Learning activity` framing are no longer the target Learn composition.

The completed C3 design-system reconciliation was visual-only for Learn: it preserves this responsibility split and aligns the existing course-section frame, educational treatments, REV end-card roles, heading roles and Quick Check surface with the canonical learner token/radius/focus system. Practice behaviour and styling are not changed by this Learn slice.

### Practice

`FocusedLearningWorkspace` remains the canonical Practice implementation.

Practice continues to own the same educational responsibilities after replacing the sustained dialog with a page-level focused activity region (no backdrop, modal focus trap or locked viewport):

- topic selection/context;
- activity-mode selection;
- flashcards;
- quick checks;
- case-study work;
- formulas/data practice;
- written practice;
- task feedback;
- evidence recording; and
- recommendation continuity.

The Practice composition slice does not change scoring, evidence meaning, readiness calculation or activity contracts. A Learn → Practice handoff may provide the exact topic in the URL so Practice opens in the intended academic context.

## Learn content and adapter boundary

`content/learn-schema.ts` defines the semantic learner-facing Learn contract. Initial block families are:

- explanation;
- key idea / definition;
- example;
- worked example;
- relationship visual;
- comparison;
- quantitative visual;
- misconception; and
- recap.

`LearningContentAdapter` exposes the complete Learn hierarchy and individual teaching pages.

For migration safety, every existing topic/section can be projected into a deterministic reading-page fallback. Richer authored/generated Learn pages can replace the appropriate sections while uncovered sections remain available. This prevents course-coverage loss during migration but does not claim that historical section bullets equal the final comprehensive Content Factory teaching standard.

## Shared educational treatments

`src/app/ui/EducationalTreatment.tsx` is the shared Interface System wrapper for recurring educational semantics.

The component owns stable treatment anatomy and allows the governed subject accent to parameterise restrained recognition cues. It does not make every page a card stack and does not repurpose Warning/Error colours for ordinary misconceptions.

Normal explanation remains ordinary article typography/whitespace rather than an `EducationalTreatment` surface.

## Native educational visuals

Issue #381 introduces structured native Learn visuals rather than defaulting to baked image assets:

- relationship/process chains;
- responsive comparison layouts; and
- quantitative charts rendered from structured series/point data.

The same educational information remains available in semantic HTML/text form where required. Responsive layouts recompose instead of shrinking labels to unreadable sizes.

## Responsive behaviour

The existing learner shell retains ownership of desktop rail and tablet/mobile drawer behaviour.

Learn-specific presentation uses:

- restrained long-form reading width (approximately 760px);
- single-column teaching hierarchy;
- horizontally arranged relationship/comparison treatments only where width permits;
- vertical relationship chains and stacked comparisons on narrow screens;
- stackable contextual REV, Practice and previous/next controls; and
- no ordinary-content horizontal scrolling requirement.

Practice uses the same task-led component and evidence contracts in the normal page flow. Active work replaces the setup controls in place; the activity bar, task and feedback stay together across phone, tablet and desktop. Returning to setup retains an unfinished session and saved evidence.

## Navigation and route continuity

Course Learn routes may carry a teaching-page ID:

`#/courses/:courseId/learn/:pageId`

Practice routes may carry a topic ID:

`#/courses/:courseId/practice/:topicId`

Equivalent component routes exist where learning is component-specific.

`ContextualLearnerNavigation` expands only the active Learn branch. Chapters remain visible, the active chapter reveals groups/pages and the exact page receives current-page state. Tablet/mobile use the same hierarchy in the existing drawer.

## Evidence and Content Factory boundary

Learn rendering does not change claims/progress semantics:

- viewing Learn does not prove mastery, Topic Knowledge or Exam Readiness;
- Practice/Exam Prep evidence remains the scored-performance boundary; and
- publication of retained Content Factory learner assets remains blocked until the existing assurance and Foundation approval gates pass.

The static Business representative pages included with Issue #381 prove treatment/rendering behaviour. They do not replace the retained Content Factory asset-assurance workflow.

## Original B4 history

PR #119 merged the original Learn/Practice Interface System migration as commit `41a61d3e276df8635c41f57c4e57329cc39725d7`. That increment established token-driven focused-work presentation, light/dark parity, responsive behaviour and progressive Practice task/feedback states without changing educational logic.

Those historical facts remain true. Issue #381 supersedes only the current Learn presentation boundary; it does not rewrite the earlier migration evidence.

## Assurance

The Issue #381 implementation is required to pass the repository exact-head CI, including the normal `npm run validate` chain:

`typecheck → lint → unit tests → production build`

Targeted coverage includes:

- Learn-page and Practice-topic URL round-tripping;
- complete adapter-produced Learn hierarchy;
- preservation of richer authored treatment pages and uncovered source sections;
- canonical route integration;
- nested navigation/current-page state;
- responsive treatment behaviour;
- Light/Dark and keyboard/focus behaviour; and
- existing Practice/evidence regressions.

## Documentation impact

The focused current implementation record is `docs/technical/Learn Reading Experience Implementation.md`.

Issue #381 updates this migration record and the Interface System component registry because Learn now has a reusable `EducationalTreatment` component and structured visual treatment contracts. Normative Learn/treatment authority already exists; the implementation does not redefine educational truth, evidence semantics or Content Factory release gates.

## Practice page-level implementation update (10 October 2026, draft/unmerged)

The canonical Practice route remains `PlannerRuntime → CourseExperienceScreen → FocusedLearningWorkspace`; no alternate route/runtime is introduced. `PracticeActivityWorkspace` replaces `PracticeDialog` on the Practice route as the presentation shell: it is an in-page named region with a keyboard-focused back action and focus return to the triggering setup control. The session/flashcard/written/calculation state and persisted evidence remain in `FocusedLearningWorkspace`. No modal or background scroll locking applies to an ordinary learner Practice task. `ExamPrepSection` remains a live consumer of `PracticeDialog`; its compatibility shell and CSS have been retained temporarily and relocated to Exam styling until the separate Exam Prep/Simulator package can retire it safely.

`src/app/ui/practice/practice.css` consumes central semantic/theme, display-heading, radius and focus roles. Deep Teal is reserved for actual REV-assisted written marking. Direct Practice `--rv-*` compatibility consumption is retired; aliases stay globally until the final zero-consumer audit. Only Practice presentation/browser assertions that assumed the superseded modal are updated; evidence, marking, question and accessibility contracts remain. Light/Dark visual approvals and exact-head CI are release gates, not presumed successes.

**Documentation-impact check:** current `Learner Design System.md` §18 already requires this composition. No normative authority change or new ADR is required; this record, the implementation reconciliation and component registry record the technical change. Historical PR #119 and Issue #381 evidence remains intact.

The 18-state historical B7 visual acceptance matrix remains unchanged. A separate `tests/e2e/practice-activity-visual.spec.ts` captures the new focused activity on phone and desktop in both themes and intentionally fails closed until Founder-approved images are pinned; existing Practice start-screen baselines remain governed independently.

### Practice browser assurance correction

After the page-level cutover, the shared Practice browser fixture and the critical-journey accessibility test must target the named activity region instead of the removed dialog; otherwise they fail before reaching the unchanged question, evidence and feedback checks. Written Practice uses the same in-page metadata class as other activity formats. The REV marking panel uses inverse text roles for legible not-awarded labels on Deep Teal and permits its header to wrap at 320px. These are bounded interface/accessibility corrections; no evidence, scoring or marking logic is modified.

### Founder visual baseline approval for Practice (10 October 2026)

The Founder reviewed and approved all six Practice review images sourced from CI #2936 (commit `dffe1cac8c1199d798bc764c60351cdc727cc7be`, artifact `11663751219`). The phone Practice start-screen baselines in the historic 18-state visual contract are updated only for those two states; the four page-level active workspace screenshots use exact SHA-256 captured-image baselines in the separate Practice visual spec, with native PNG test attachments. Every future visual difference continues to fail closed. The approval is **not** a PR merge authorisation: exact-head CI, any refresh against main and explicit PR #589 merge approval are separate gates.

### Nondeterministic REV dock pixel exclusion — CI #2938 follow-up

The CI #2938 screenshot failure was isolated by comparing the retained native CI #2936 Founder-approved and CI #2938 PNG pixels. The phone Practice Light and Dark images were identical outside a **54 × 54 pixel** region belonging to the animated Living E at the centre of the persistent global bottom dock; scrolling/layout were not the cause. The dedicated Practice screenshot contract now hashes decoded RGBA pixels and neutralises only a 64 × 64 pixel region covering that animated glyph, derived from the original approved captures. The **full unmasked PNGs remain retained as test attachments**, and all other phone pixels plus every desktop pixel must still match the Founder-approved images exactly. The old 18-state B7 matrix and its two approved start-screen digests are untouched. This is test determinism, not a change to approved design authority or an expansion of visual approval; separate REV dock behaviour/motion assurance remains in force.

### LF-09 / LF-10 — focused Practice wording and mark prominence (2 November 2026 candidate review; now released)

Issue #765 includes learner reports of overly mechanical Practice copy and marks that were hard to notice. On the canonical `/revision/app/` course Practice route, `PracticeStart` described a capped session as “so that is what you will get” while `QuestionHead` rendered available marks as a generic 12px chip behind the level chip. Both are source-confirmed presentation issues; exact reporting-learner device/zoom is not reproduced.

The small branch `fix/765-lf09-lf10-practice-copy-marks` now replaces the capped-session line with grammatical, count-accurate wording. It places the available marks ahead of the level in the same metadata row as a semantic `strong` element with an explicit assistive label, 17px text, existing token-based surface/border styling and normal wrapping. All questions (MCQ, calculations and written) already use the shared `QuestionHead`; the supplied scenarios and tables are unchanged. New static-render tests cover one/multiple questions, numeric mark labels and unchanged stimulus/table rendering. No new action, layout system, evidence contract, saved data, service, database or migration; the current Tone of Voice and Learner Design System already govern this correction. At the time of this candidate review, exact-head CI, desktop/tablet/phone and learner visual acceptance remained prerequisites. The later release receipt below supersedes that proposed-release status; genuine original-learner acceptance remains open. Keep the separate general flashcard-length/Data Drill checks under #765 open.

### LF-07 — “Data drill” naming and zero-formula warm-up clarity

The same issue #765 Practice experience review found that `FocusedLearningWorkspace` labelled the `formulas-data` warm-up “Formulas” even when `formulas.length === 0` and the content contained only self-check `dataDrills`. The existing “Data drill” label also gave no indication that these are **unmarked exercises with a revealed model answer**, not necessarily numerical drills. The generic content adapter already returns the correct activities; this is a misleading presentation label, not an absent module or an assessment-engine defect.

The PR scopes one count-derived `guidedExerciseWarmup` label helper to the existing Practice start screen; introduces “Guided exercises” when no formulas exist and “Formulas and guided exercises” when both exist; labels the activity “Exercise” and “Next exercise”; and adds one short instruction to attempt before revealing the answer. Existing `formulas-data` activity ID and navigation are unchanged. No saved learner data, evidence score, published teaching content or content type is changed, and the exercises remain unscored. Unit assertions cover zero-formula/one-formula/mixed inventory; responsive/accessible production learner checks remain a release hold. The existing Tone of Voice/UX rules govern this correction without new normative authority.

### PR #780 Founder visual direction approval — 2 November 2026

**Explicit Founder instruction:** “Approve the visual direction for PR #780, covering the larger marks display on phone and desktop in light and dark modes. This is visual approval only, not permission to merge.” The instruction is recorded on the [PR #780 conversation](https://github.com/lhanson-dev/revision/pull/780) against reviewed exact-head commit `1f32a0d28f4a10665cee31e0e65182466564afbf`. The Founder reviewed a composite of the actual Practice activity screenshots for all four requested states. The approved scope is **mark visibility only**; no other interface, scoring or workflow change receives visual acceptance through this instruction.

The approval evidence is [Revision CI run 41500300206](https://github.com/lhanson-dev/revision/actions/runs/41500300206), [phone native PNG/trace artifact 13167514743](https://github.com/lhanson-dev/revision/actions/runs/41500300206/artifacts/13167514743), and [desktop native PNG/trace artifact 13167889595](https://github.com/lhanson-dev/revision/actions/runs/41500300206/artifacts/13167889595). Each new digest was stable over initial and retry captures; old and new SHA-256 values are:

| Practice screenshot | Previously approved SHA-256 | Founder-approved candidate SHA-256 |
|---|---|---|
| Phone light | `5bf11bece88b8b726337ad22e957a31bf654776ea4b2c03c971a4eb4b88c50a0` | `9c78f928c7fb0be57278a8e1e0916d747271830359817a193c1f381619fcdb89` |
| Phone dark | `738fad8f44753dfacb0a7422e6cb3a6b22970336a76f84e381a8b2d7c14f7f4b` | `b071b8ea37d4aa5df8d33c7df56a5b089958091489d672fe51af8339d639db4a` |
| Desktop light | `ebf1eae802610e9154b4e11b95f6ce5b1547ce4d77a8f70ceb1dea06c3346add` | `c76e0074741b04732725e8cc1e2310437523f664d589918dc90e41faa26e9906` |
| Desktop dark | `bbeb6868999be29a721de6380d8af81e80f1e982199c174ee38be6d48a2b32b0` | `4ff48ab96b498c070667f8cd7fea54c8bd563f4afca9cfa6db21c19bc6daafc4` |

**Change implementation:** Update exactly the four `sha256` expectations in `tests/e2e/practice-activity-visual.spec.ts` while retaining the SHA-256 comparison algorithm, full-PNG trace attachments, 64×64 phone animation exclusion, responsive framing and historic B7 start-screen visual baseline matrix unchanged. Source review found no obvious clipping in the four actual frames, but that does not establish a complete 200%-zoom, screen-reader or real signed-in learner acceptance. The previous failed screenshot test runs remain valid historical evidence of the intentional delta.

**Release gates remain independent:** Fresh exact-head CI after baseline updates, preservation of saved answers and marks, production deployment after **separate explicit Founder approval for merging PR #780**, and actual learner acceptance. Do not infer permission to merge, deploy or close issue #765 from visual approval.

**Documentation-impact check:** This is a previously governed presentation repair under existing UX/Tone and Learner Design System authority. Only this implementation record and the four protected screenshot checks change; no new normative standard, ADR, educational content or historical evidence modification is needed.


### PR #780 — completed merge and production-release receipt (2 November 2026)

The Founder explicitly approved merge **PR #780** after the separately recorded mark-display visual approval. The exact two-line `revision-founder-approval:v1` marker was posted by configured Founder account `lhanson-dev` in [comment #6587656442](https://github.com/lhanson-dev/revision/pull/780#issuecomment-6587656442) against approved head `8bc2a9f6570c208d7e836b88861410621ac55dad`, after [full latest-head CI #41517870563](https://github.com/lhanson-dev/revision/actions/runs/41517870563) passed all 9 jobs. The trusted `revision/founder-approval = success` check and current-main integration (`c389867771c735eb53bfd06ea8e381b910844ccb`, zero behind, no conflicts) were confirmed before merge. The approved PR was squash-merged as `b8444d6c0ec14f0fc1679265dc2c7cf1c759f054`.

[Production release #41519356283](https://github.com/lhanson-dev/revision/actions/runs/41519356283) completed **success** across release lineage, production backend readiness, build, GitHub Pages deploy, production smoke and final status publishing. Exact merge-commit `revision/path-to-live = success` was separately verified. [Post-merge CI #41519356281](https://github.com/lhanson-dev/revision/actions/runs/41519356281) is additional regression evidence; its outcome must be read from the live workflow record rather than inferred from production deployment.

**Student-visible release effect:** stronger available-marks text, clearer capped-session wording, and honestly named unscored guided exercises. The published question texts, mark values, save/evidence contracts, active course context and adaptive planner were not changed by this PR. No schema or data migration, new normative authority or ADR.

**Open acceptance:** the original signed-in learner's device/flow and explicit 200%-zoom/screen-reader checks remain unverified. Do not treat deterministic screenshot acceptance or successful deployment as proof of these observations. Track the post-release learner checks under [#765](https://github.com/lhanson-dev/revision/issues/765). The earlier notes in this document retain their dated candidate and visual-only approval history.
