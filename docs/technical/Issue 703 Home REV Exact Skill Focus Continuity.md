# #703 — consistent exact-skill recommendation explanation across Plan, Home and REV

**State:** Governed PR candidate. **Runtime:** canonical `/revision/app/`; existing `PlanViews`, `PlannerHomeScreen` and Ask REV drawer (`PlannerRevScreen` embedded in `PlannerRuntime`). **Source:** main at branch creation `99fe1885c3906e809f975c095f35edd45909c9ac`. **Scope:** IA-05 shared action presentation, not a new scheduler.

## Source-first mismatch

PR #783 published `planSkillFocusLabel` and showed the single-target, separately assessed Business weaknesses (expected value / net gain) in Plan. But the Home hero and its today rows still displayed only topic, and Ask REV's `recommendationExplanation` still gave only a topic/general planner rationale even when their **same existing recommended HomeTask** carried `skillFocus`. A student could not tell which requirement a supposedly precise recommended check tested outside Plan.

## Change and evidence limits

- Reuse the **same `planSkillFocusLabel` utility** from the already published Plan, rather than creating additional state, algorithm, labels or a new recommendation engine.
- For **an existing source-backed `skillFocus` only**, show its skill name, repair/recheck stage and correct/uncertain provenance on the Home next activity and supported today rows; Ask REV's existing plain-language opener includes the same text. The selected recommendation ID, task order, direct Start, duration, Learn/Practice asset, student-booked sessions and calculated evidence remain unchanged.
- Unmapped, unsupported or student-booked work receives **no invented atomic skill diagnosis**. Reading a Learn page is exposure, not proof; one correct final number still does not prove method understanding, mastery or readiness.
- Deterministic test follows a source-targeted scored incorrect answer into the existing FI-001 `PlannerCandidate → PlannerItem → HomeTask` path, checking the exact unchanged recommendation ID and that Plan/REV's label matches. The canonical Home DOM renders the same utility only for an available `skillFocus`.
- **Still unverified:** `ProgrammeProgressScreen` presents a separate topic-level next action via `nextProgressAction → rankSuggestions` rather than the configured shared FI-001 schedule. This PR does not claim Progress is aligned, nor resolve initial selection and 14-day re-planning under changing capacity, Psychology option applicability or complete #698 teaching adequacy. Do not close #703/#705 because labels match.

## Authority and documentation impact

Approved `10-product-governance/Course Learning Blueprint.md`, `10-product-governance/Adaptive Revision Planning.md`, `40-evidence-and-trust/Claims and Progress Governance.md` and FI-001 Ready already require consistent, honest actual skill evidence. This is a scoped correction to existing approved presentation, not new product policy or feature scope. Code, regression, this note and INDEX are in the same PR. No database migration, new model grading, learning content or planner algorithm. Founder-specific merge approval, exact-head CI and production verification are separate.
