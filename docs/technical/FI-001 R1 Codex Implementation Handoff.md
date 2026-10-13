# FI-001 R1 — Codex Implementation Handoff (bounded engineering work)

**Status:** implementation handoff, **not a new product authority, execution report or merged code**.
**Founder decision:** `Approve FI-001 R1 Ready — implement via Codex`, explicitly recorded in [PR #611 comment](https://github.com/lhanson-dev/revision/pull/611#issuecomment-6139380663). The existing FI-001 is Live; R1 alone is Ready.
**Canonical authority:** `10-product-governance/Adaptive Revision Planning.md` v0.6 and `20-brand-and-experience/REV Guidance and Conversation Pattern.md` v2.3, with specialist Home, Course Learning Blueprint, evidence/claims, learner navigation and accessibility rules. Read `AGENTS.md`, Constitution and `80-company-workflows/Governed Implementation Workflow.md` from *current main*, not this handoff alone.
**Detailed approved acceptance contract:** `10-product-governance/backlog/FI-001 Evidence-led Planner R1 Readiness Analysis.md` (R1-01 through R1-14).
**Only authorised runtime:** React/Vite authenticated learner app at `/app/`, deployed as `/revision/app/`, routing in `src/app/PlannerRuntime.tsx`. Do not touch retired/static alternatives.

## Start condition and non-negotiable boundaries

1. **Before modifying production files**, confirm approved main includes the exact human Ready receipt and correctly scoped root agent instructions. If the documentation PR recording Ready/handoff has not merged, **do not begin production changes**. Start a fresh, short-lived feature branch from then-current approved `main`; do not branch from this documentation PR.
2. The requested engineering agent is **Codex**. Work serially in **R1a, R1b, R1c**, each with one bounded PR or a small set of separately reviewable commits. Never let R1b overwrite new main after R1a merges. A PR may be kept draft while iterating. The executing agent never merges, self-approves `Ready`, manufactures Founder approval, or bypasses exact-head CI.
3. Do **not** introduce a second planner, new LLM scheduler, altered evidence/mastery/readiness score, new paid-tier constraint, new exam-date source, speculative syllabus/AO mapping, arbitrary learning-effect estimate or 60-day-to-full-programme expansion. R2–R5 and FI-009/010/011/012 are separate approval boundaries.
4. Treat [the approved R1 analysis](../../10-product-governance/backlog/FI-001%20Evidence-led%20Planner%20R1%20Readiness%20Analysis.md) as the acceptance contract; if facts in code appear to conflict with it, report the conflict rather than changing policy in code.

## A. R1a — deadline and scope correctness (first Codex task)

**Goal:** Make deterministic recommendations eligible for their *scheduled date* and avoid duplicate obligations for genuinely shared knowledge across papers while protecting paper-specific intent.

Canonical files to inspect:
- `src/engine/planning/planning.ts`, `src/engine/planning/planning.test.ts`: `PlannerCandidate`, `rankPlannerCandidate`, `buildSchedule`, `buildAdaptivePlan`, the currently assessment-relative priority `daysUntilAssessment`.
- `src/app/planner-model.ts`, `src/app/planner-model.test.ts`: `stateForAssessment`, `scopeTopicIds`, `plannerCandidatesFromLearningState`, `plannerDaysFromAvailability`, `buildPlannerSnapshot`.
- `src/app/accepted-sessions.ts`, `src/services/planning/planner-service.ts`, `src/services/planning/planned-session-service.ts`, `src/app/catalogue-model.ts` and approved Business 7132/Psychology 7182 content registry/manifests.
- The engine's 60-day allocation, `PlanScreen.tsx`'s independent 60-day accepted-session loading, paper identities, user-selected options and existing asset-backed activity routes.

Required outcomes:
- Candidate opportunity model carries *verified relevant exam cutoff(s)* and paper/course/scope provenance; evaluate **each proposed scheduled day**, excluding date-only target exam day and later. Shared work can remain eligible for a later still-upcoming relevant paper; a paper-only task cannot.
- Prefer the smallest auditable nonduplicating representation for one shared content/intent unit; never collapse genuine paper/AO-specific work or apply one paper's scope to all. Unknown paper/option mappings are not permission to invent them.
- Use exact active course membership and assured supported activity route; no phantom `exam-question`, invalid course, unselected option, invalid assessment scope or unsupported content link.
- Preserve accepted-session capacity, skipped/done semantics, local-date/DST handling, learner-chosen commitments and deterministic stable IDs. Do not rewrite evidence or silently delete persisted sessions. An accepted-session conflict may be surfaced honestly to the learner without fabricating a completed task.
- Test date changed/archived, duplicate shared subject, current-day exam, zero/low capacity, unambiguous legacy subject-only assessment, selected-option and asset-unavailable fallback, and reproducibility. Prefer **fail-closed** for unsupported scope and honest fallback instead of inventing prerequisites.
- If full paper/AO ownership is unavailable in approved content manifests, document exactly what can be assured, implement only the safe subset and report the stopping condition rather than hard-code made-up exam content.

Acceptance tests applicable to R1a: primarily **R1-01 through R1-05, R1-09 through R1-14** from the approved R1 analysis. Keep a fixture index mapping each oracle to actual test name and result.

## B. R1b — single REV/Home/Plan recommendation authority (after R1a)

Canonical files: `src/app/PlannerHomeScreen.tsx`, `src/app/PlanScreen.tsx`, `src/app/PlannerRevScreen.tsx`, `src/app/rev-suggestions.ts`, `src/app/home-task.ts`, `src/app/home-v3-model.ts`, shared planner snapshot and related tests.

- Retire `rankSuggestions` fixed 14-day/7-day **independent priority**. When Today's Plan has actionable work, derive Home's promoted REV hero and REV rationale from **the exact next actionable today Plan item** (accepted or derived), preserving course/topic/activity and exact paper/question identity as applicable. Same source, same priority and truthful same-day alternatives; do not preserve a permanent parallel Home selector.
- Keep Home's one supported exact-activity `Start`, `Not now`, `Suggest something else` traversing other **today-plan** work, genuine same-item `On today's plan`/`Up next`, no-dates/no-availability truthful **unscheduled** first action and REV's negotiated student preferences. If no actionable item remains today, do not silently refill a completed/rest day. If accepted sessions cannot be read, do not claim an agreed next planned activity.
- Preserve **paper/course/activity identity** in direct Start destination; never route a chosen exact exam-question to a generic page in lieu of the selected activity.
- Freeze contexts in tests to prove **the same exact next task on Home/Plan/REV** even with accepted sessions, repeated dismissal, missing dates, actual exam-question Start, completed days and local midnight. Cross-check against separately open Home exact-exam-question PR #612 and bounded R1a PR #617; do not merge either by implication.

Acceptance tests: **R1-06 to R1-08**, with regression coverage for all R1a eligibility constraints.

## C. R1c — integration, validation, documentation and PR handoff

- Implement/finalise all **14** R1 deterministic scenarios. Use actual assured Business 7132 and Psychology 7182 content identities and selected-options constraints, not fabricated shipped syllabus nodes.
- Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, relevant `npm run test:e2e` with browser prerequisites and available Supabase/RLS assurance. Report exact executed commands, results, skipped tests and environmental blockers; a successful unit test alone is insufficient.
- Check responsive/keyboard/screen-reader-visible behavior, stable re-entry, no-date/no-availability and correctly matched Home hero vs Today. No visual redesign or unnecessary snapshot churn.
- Update `docs/technical/Adaptive Revision Planner Implementation.md` (actual code behavior only), applicable `90-governance-registers/` assurance coverage and any relevant ADR only if architecture materially changes. Do not rewrite research, historical audits or the approved product authority.
- PR description: scope, current-main integration state, schema/data migrations if any, before/after learner effects, security/evidence implications, test matrix R1-01..14 with PASS/FAIL/NOT RUN, CI links, risk/exclusions and clear **Founder merge-approval request**. Do not claim the work is deployed until release lineage proves it.

## Codex task launch and handoff

Codex Cloud uses a published GitHub-connected environment. This file and the corresponding GitHub task issue are a ready-to-use **specification**, not evidence that Codex has been launched. A human or an authorised Codex integration must start the task in that environment; Codex should start with **R1a only**.

**Suggested first task text (Codex Cloud, `lhanson-dev/revision` environment):**

> Implement **FI-001 R1a only** from current approved `main`. First read `AGENTS.md`, `INDEX.md`, the AI Agent Constitution, `80-company-workflows/Governed Implementation Workflow.md`, `10-product-governance/backlog/FI-001 Evidence-led Planner R1 Readiness Analysis.md` and `docs/technical/FI-001 R1 Codex Implementation Handoff.md`. Verify Founder R1 Ready approval is on `main`. Work only on the canonical learner app's deterministic planner eligibility, date-only exam cutoff, assured scope/assets, shared-paper nonduplication and accepted-session protections. Implement tests for applicable frozen R1 oracles, run risk-proportionate checks, update technical docs in the implementation PR and open a **draft PR**. Do not expand to R1b/R1c or R2–R5, do not merge or ask Founder to supervise CI. Report material uncertainty, results and actual blockers. Never claim execution without evidence.

**Post-task:** ChatGPT/engineering lead independently reviews Codex's diff and evidence against the approved R1 contract; GitHub runs CI; Founder approves the actual implementation PR merge. A successful Codex task or draft PR is **not** Founder merge approval.
