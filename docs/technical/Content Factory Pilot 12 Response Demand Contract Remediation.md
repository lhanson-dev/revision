# Content Factory Pilot 12 Response Demand Contract Remediation

## Status

Technical implementation record for the corrective branch opened after Content Factory Live Pilot #12. This record does not replace or amend normative Content Factory authority.

## Trigger

Fresh Content Factory Live Pilot #12 ran from production-verified `main` at `8999697fb82bfbbea3e93708622d16e66fa8d461` with `resume_job_issue_number` blank. The durable job is Issue #203 and the workflow run is `33121436557`.

The run completed all 13 Learn/Practice work units, compiled the Assessment Blueprint and Question Families, and successfully generated four assessment items before failing closed on assessment item `refillworks-capacity-choice-case-study`. Subquestion `q1` declared a rewarded `interpretation` response demand while its learner-facing command/question did not explicitly ask the learner to interpret anything.

The final evidence artifact records:

- state: `blocked`;
- blocked from: `generating`;
- executed worker count: 40;
- reused worker count: 0;
- human intervention count: 0;
- source-rights status: `approved`;
- cumulative course spend: `$0.751956` against the governed `$20` ceiling;
- failing provider route: `gpt-5.6-terra`;
- failing assessment-item call cost: `$0.046038`;
- failing assessment-item contract version: `2`;
- retry count: 0;
- failure type: terminal `provider_contract_failure`.

The rejected provider candidate is not persisted as a completed assessment artifact, so this remediation does not infer or reconstruct its exact wording. The durable evidence proves the command/demand mismatch, not that the rejected item was otherwise pedagogically valid.

## Root cause

Pilot #11 exposed a calculation-specific command/demand mismatch. The subsequent correction explicitly taught the provider the deterministic `calculation` command vocabulary and quantitative-MCQ rule while retaining the existing fail-closed validator.

Pilot #12 demonstrates that the calculation correction worked but was too narrow as a reliability control. Four assessment items passed the v2 compiler before a different response-demand category failed: `interpretation`.

The deeper implementation defect was duplication. `assessment-integrity.ts` held the deterministic accepted command vocabulary for all seven response-demand categories, while `openai-assessment-integrity-compiler.ts` separately described only selected parts of that contract in prose. The validator and provider guidance could therefore drift even though the validator itself was correct.

This is a provider-contract generalisation defect. It is not evidence that the deterministic assessment-integrity gate is too strict.

## Correction

The deterministic response-demand contract is now the single implementation source of truth for both validation and provider guidance:

1. `assessment-integrity.ts` exposes the existing accepted command vocabulary for every response demand: `selection`, `knowledge`, `application`, `calculation`, `interpretation`, `analysis` and `evaluation`.
2. The validator uses that shared mapping when deciding whether learner-facing command/wording genuinely asks for each declared demand. The accepted vocabulary is not broadened or weakened by this refactor.
3. The assessment provider instruction is generated from the same mapping instead of maintaining a partial handwritten copy.
4. Provider guidance explicitly says not to declare a response demand merely because a learner might use that skill while reaching an answer; the demand must be visibly requested by the learner-facing task.
5. The quantitative-MCQ clarification from Pilot #11 remains because it describes how multiple demands should be combined for that specific response shape.
6. Regression assurance checks that the provider receives all seven deterministic demand mappings and reproduces both the Pilot #11 calculation mismatch and the Pilot #12 interpretation mismatch as terminal, non-retried contract failures.

The effective assessment-item contract remains version `2`: this correction does not change the durable assessment-item schema or the meaning of the existing v2 response-demand contract. It removes duplicated implementation guidance so generation is aligned with the contract that v2 already enforced.

## Assurance boundary

This change does **not**:

- relax `validateStructuredAssessment`;
- broaden the accepted command vocabulary;
- convert a failed item into a passing one;
- infer demands from hidden reasoning or answer process;
- add fuzzy matching or AI-based validation;
- add a model call;
- permit automatic retry of terminal structural defects;
- change source-rights boundaries;
- change the `$20` per-course live spend ceiling.

The fail-closed assessment gate remains authoritative implementation behaviour.

## Documentation impact

No normative authority change is required. Existing authority already requires authentic assessment demand, mechanically checked controls where possible, deterministic handling of deterministic work and fail-closed treatment of material uncertainty.

This technical record documents how the current implementation satisfies that authority after Pilot #12. Historical Pilot #12 / Issue #203 remains immutable evidence of the blocked run.

## Next live proof

After the corrective PR is merged with explicit Founder approval and the resulting `main` is production verified, the next paid Content Factory proof must be a **fresh** live pilot from that new approved `main` with `resume_job_issue_number` left blank.

Issue #203 must not be resumed across the changed implementation head.
