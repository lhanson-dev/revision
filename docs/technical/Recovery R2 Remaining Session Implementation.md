# Recovery R2 — remaining session recovery: exam submission retry integrity

**Status:** Governed implementation candidate, not merged or deployed; 21 October 2026.
**Baseline:** Approved `main` at PR #655 merge `3e0ad6c45de11970c67e74bbd477759074006f77`.
**Canonical learner runtime:** `/revision/app/` → `src/main.tsx` → `PlannerRuntime` → `CourseExperienceScreen` → `ExamPrepSection` → `ExamSimulator`. The old `src/app/App.tsx` is legacy, not the production edit target.

## Confirmed source defect and bounded correction

Before this correction, `ExamSimulator.saveResult()` generated its exam-attempt evidence afresh on each retry even though its previously generated ID was reused. Specifically `occurredAt: new Date().toISOString()`, and elapsed duration, could change after an earlier attempt row had already committed. `recordLearningEvidence()` correctly refuses a duplicate evidence ID with a different persisted payload. Thus, a partial success followed by another write failure could strand the student at saving, with some facts already persisted and no confirmable full result.

This bounded patch freezes a single complete submission batch on the first save, including every question evidence object, its own timestamp/ID, whole-paper evidence, elapsed duration, AO totals and result. The same exact facts are replayed on retries. Question mark inputs are locked once submission is frozen, and simultaneous duplicate save clicks are guarded. A failed save has an explicit retry instruction rather than declaring a successful exam. A blank exam still never creates scored evidence. Source-level regression covers a first committed record, identical retries, conflict rejection and blank-paper refusal.

The existing evidence service's learner-owner verification remains the authority for accepting duplicate keys; no RLS, schema, identity, readiness, subscription, assessed-content or pilot-restriction behaviour is changed. The paper result remains distinct from topic-scoped evidence under the previously merged #654 correction. No raw written response is added to scored evidence.

## Deliberately still incomplete

- **Refresh/re-entry:** the immutable submission batch still resides in component memory. Reloading the page during a partial save does **not** restore that batch. This change must not be called durable exam recovery.
- **Practice:** focused Practice question session and flashcard state still reside in React component memory and are lost on a page refresh. Its individual scored answer writes remain durable separately.
- **Exam:** full paper answers, pause/timer, options, flags, mark phase and pending submissions are not server-owned drafts and cannot be resumed across devices or reload.
- **Atomicity:** individual evidence rows are saved sequentially; no transactional full-paper submission contract is established. Retrying verifies committed rows but does not make a multi-row transaction atomic.
- **Educational acceptance:** restricted original assessments and expert review remain on HOLD; no approval for unrestricted pilot access follows from this fix.

## Required continuation sequence

1. Design and implement a learner-owned, RLS-restricted durable Practice session checkpoint (exact course/module/topic/content version, question order, adaptive/retry queue, last safely confirmed evidence), with a safe recovery screen and explicit discard. Do not infer unfinished session completion from scored evidence.
2. Design and implement secure, versioned durable exam-attempt drafts and idempotent final submission, including question/option/mark phase, elapsed/paused time semantics, multi-tab protection and checked source-version compatibility. Govern any schema migrations, privacy controls and production readiness before frontend deployment.
3. Prove reload, re-entry, ambiguous network acknowledgements, duplicate-key reconciliation, content changes, cross-user denial, expired/removed course and same-paper two-tab conflicts in domain, browser and database/RLS assurance. Validate production separately after Founder-approved PR merges.

Avoid adding storage of raw answers outside an expressly approved, purpose-limited authenticated attempt-draft store. A published final score remains scored evidence; an unsubmitted draft must never alter Understanding, coverage or Exam Readiness.

## Documentation and release gate

This change implements existing Learning Blueprint, Claims and Progress, Recovery Control Plan, Evidence Trust and release-authority rules; no normative authority change is proposed. This document and the defect register describe the candidate. Historical audits stay unchanged. Exact-head CI and the relevant integration/browser checks must pass before presenting an approval request. **No Founder merge approval has been requested or granted for this candidate.**
