# Issue #736 — Saved Practice topics visible in the Practice selector

**Status:** Governed correction candidate — not merged or live until separately approved and production verified.

## Canonical route and ownership

The learner application is the React runtime at `/revision/app/`, not a legacy or migration surface. Shared-learning courses use `#/courses/:courseId/practice/:topicId?`; component-specific courses use their canonical module Practice route. The live ownership chain is `PlannerRuntime → CourseExperienceScreen → FocusedLearningWorkspace → PracticeStart`. The native “Change topic” select remains the student control; its existing saved-session owner continues to verify the checkpoint before any Continue operation.

## Scope and evidence model

The released Issue #727 implementation already projects saved, owner-scoped Practice checkpoint and mock metadata onto Home and Course Overview. This follow-up fixes a narrow usability inconsistency: inside Practice, a learner who is viewing topic B cannot see that unfinished Practice is saved under topic A until navigating away. It **does not** introduce a new activity, session type, content credit, recommendation, route, storage table or tracking event. It is classified as a **nonmaterial presentation/continuity correction**, not a separate strategic feature. The Founder requested this exact correction in the 30 October 2026 conversation.

The existing `loadSavedWork` read verifies authenticated owner, current active course, module, topic, expiry, checkpoint schema, current question content fingerprint and published question identity. It surfaces only safe topic names and confirmed answer counts, never raw answers. `CourseExperienceScreen` now performs that read for both Overview and Practice; previous Home/Overview functions are unchanged. Practice narrows the result to its exact course/module and marks each valid topic in the native chooser **“· In progress”**, with a small factual count when the list is available. The currently selected topic retains the existing explicit **Continue saved session** action and the Practice owner revalidates the checkpoint on actual resume. Switching topic refreshes saved status so a newly started or discarded checkpoint is not confused with an old snapshot.

A failure reading **exam attempts alone** does not suppress valid Practice topic markers: `SavedWorkResult.practiceError` distinguishes the source-table failure from its existing overall `partialError`. If Practice itself is unavailable, do not infer that no work is saved; show an unavailable state and retry. An empty verified list shows an ordinary selector without invented status. Completed, expired, changed-content, wrong-account, wrong-course/module and unpersisted warm-up sessions are excluded by existing discovery checks. No arbitrary automatic topic selection, force-resume or session restart.

## Product and safety boundaries

- **REV/Plan:** no new ranking, no changed planner completion or REV next action; these are learner-controlled factual recovery links only.
- **Free/Paid/Premium:** identical functionality, no lock or upsell; server reads remain bounded and owner-scoped.
- **Privacy and progress:** no raw exam answer snapshot, cross-user data, content rewrite or fabricated mastery; owner-specific checkpoint service remains final authority.
- **Accessibility/responsiveness:** status appears as text inside native select options; current topic remains distinguishable by selection, saved topics by readable suffix. Loading/unavailable states are explicit and nonblocking. Visual surfaces are limited to the Practice setup header/selector, not an active question screen.
- **Not covered:** flashcards, partially viewed Learn pages, unstarted/planned sessions, every topic's completion percentage, one-click auto-resume, or altered exam recovery.
- **Technical risk:** when the published question pool changes, its fingerprint can invalidate a checkpoint rather than falsely offer resumability. Existing user-scored evidence is not deleted by display filtering.

## Tests, release and documentation impact

- `src/app/saved-work.test.ts`: independently validated multiple distinct topic checkpoints, table-specific outages, wrong owner/content/expiry and completion filtering.
- `tests/e2e/practice-session-recovery.spec.ts`: synthetic authenticated browser with an existing saved topic but no local topic hint navigates to *another* topic, verifies native “In progress” option, selects saved topic, resumes question 2 and proves no duplicate scored evidence. Desktop, tablet and phone run the critical path.
- Full exact-head TypeScript, lint, unit, browser, database/RLS and signup CI; browser snapshot changes are checked separately, never accepted by blindly replacing approved baseline. Then Founder-specific PR merge approval, governed Pages deployment and production smoke verification.

**Documentation-impact check:** Existing product authority already permits Practice setup topic selection and factual saved-work orientation; there is no new normative behaviour, entitlement policy or ADR. This technical implementation note and INDEX pointer accompany the source/test repair. PR #733 independently reconciles the earlier #727 technical status labels and must not be overwritten. Historical audits remain unchanged.
