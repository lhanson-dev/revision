# Content Factory Pilot #9 — Learning and Coverage Remediation

**Status:** implementation record for governed remediation after Pilot #9  
**Authority:** implements the existing Content Factory v2 Expert Review Ready Amendment and Content Accuracy Assurance Gate; it does not change educational authority.

## Trigger

Pilot #9 reached deterministic validation and fresh-context independent review on approved `main`, but the independent reviewer returned `fail_hold`. Three findings belong to the learning/coverage integrity boundary:

- leadership styles were not taught explicitly enough for the planned curriculum requirement;
- limited and unlimited liability were not taught explicitly enough before application;
- the canonical Coverage Map remained `planned` with empty `contentRefs` even though downstream artifacts existed, while deterministic coverage validation still passed.

The historical Pilot #9 evidence remains in Issue #195 and its workflow artifact. This remediation does not rewrite that record.

## Required teaching-point evidence

Coverage requirements already contain structured `skillsOrKnowledge`. These are now compiled into the exact required teaching-point list for every Learning Blueprint work unit.

Learn and Practice workers receive that list explicitly. Their strict provider contracts must return `coverageEvidence` containing every required teaching point exactly once. Each evidence value must be a verbatim excerpt from the generated learner content showing where the point is taught or practised.

Revision validates that:

- no required teaching point is omitted;
- no unassigned teaching point is claimed;
- evidence is not duplicated;
- evidence is an actual excerpt from the generated artifact rather than an unsupported metadata assertion.

This is a deterministic traceability contract. It does not replace independent educational judgement about whether the explanation is accurate, clear or sufficiently nuanced.

## Canonical Coverage Map finalisation

The initial Coverage Map remains the planning contract created before generation. Before deterministic assurance, Revision now derives a new final Coverage Map artifact from the actual current learner-content evidence:

- Learn artifact refs are attached to the requirements owned by their work unit;
- Practice artifact refs are attached the same way;
- assessment item refs are attached to the requirements claimed by those assessment artifacts;
- a requirement becomes `complete` only when all of its required Learn, Practice and Exam Prep evidence is present;
- partial evidence produces `partial`; no evidence remains `planned`;
- deferred and not-applicable requirements retain their governed state.

The job's `coverageMapRef` is moved to the new final artifact. The prior map remains in durable storage as historical stage evidence.

Deterministic assurance then requires every in-scope final requirement to be `complete` and requires its `contentRefs` to exactly match the generated evidence. A stale or falsely complete Coverage Map therefore cannot pass merely because other code can discover artifacts independently.

## Deliberate boundary

This increment does **not** solve Pilot #9's assessment-specific findings. In particular, assessment-item `requirementIds` are still treated as claims supplied by the assessment contract. A separate assessment-integrity remediation must ensure those claims are substantiated by actual question/subquestion demand, and must address calculation ambiguity, command/mark alignment and MCQ distractor quality.

Keeping these changes separate makes the learning/coverage correction independently reviewable and prevents an assessment schema redesign from obscuring this assurance fix.

## Provider and cost impact

The Learn and Practice worker contracts move to version 3 because the structured output changes materially. No additional model call is introduced. The provider returns a small auditable evidence map inside the same generation call.

No paid live pilot is run from this branch. A new live pilot is eligible only after all Pilot #9 remediation PRs are Founder-approved, merged and production-verified.

## Assurance

Provider-free regression assurance covers:

- derivation of required teaching points from multiple curriculum requirements;
- rejection of omitted teaching points;
- rejection of evidence not present in learner content;
- strict provider schemas carrying `coverageEvidence`;
- provider payloads carrying the exact required teaching points;
- final Coverage Map construction from real artifact refs;
- rejection of stale, partial or mismatched final coverage evidence;
- existing restart/idempotency and Learning Blueprint mode controls.

Standard repository TypeScript, lint, unit, build, responsive-browser, database/RLS and protected-service assurance remains required before merge.

## Documentation impact

No normative authority change is required: current authority already requires source-traceable content, mechanically checked coverage and resolution of material findings before `expert_review_ready`.

This implementation record documents how the current system now fulfils that requirement. `INDEX.md` indexes this record. Pilot #9 historical evidence remains unchanged.
