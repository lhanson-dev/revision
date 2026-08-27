# Content Factory Pilot 11 Assessment Command Contract Remediation

## Status

Technical implementation record for the corrective branch opened after Content Factory Live Pilot #11. This record does not replace or amend normative Content Factory authority.

## Trigger

Fresh Content Factory Live Pilot #11 ran from production-verified `main` at `cdae64c2c54c9db064455b451a24145cbeaac51d` with `resume_job_issue_number` blank. The durable job is Issue #201 and the workflow run is `33118319846`.

The run reached assessment generation and then failed closed on assessment item `paper1-mcq-business-leadership-quantitative-01` because subquestion `q1` declared a rewarded `calculation` response demand while its learner-facing command/question did not explicitly ask the learner to perform that calculation.

The final evidence artifact records:

- state: `blocked`;
- blocked from: `generating`;
- executed worker count: 36;
- reused worker count: 0;
- source-rights status: `approved`;
- cumulative course spend: `$0.642976` against the governed `$20` ceiling;
- failing provider route: `gpt-5.6-terra`;
- failing assessment-item call cost: `$0.046612`;
- retry count: 0;
- failure type: terminal `provider_contract_failure`.

The rejected provider candidate is not persisted as a completed assessment artifact, so this remediation does not infer or reconstruct its exact wording. The durable evidence proves the command/demand mismatch, not that the rejected item was otherwise pedagogically valid.

## Root cause

Pilot #9 deliberately introduced deterministic structured-assessment validation. That validator correctly requires each declared response demand to be visibly requested by the learner-facing command or wording. For `calculation`, the accepted deterministic command evidence is `calculate`, `work out` or `determine`.

Pilot #11 showed a remaining provider-contract gap. The assessment-integrity compiler already told the model that `responseDemands` must describe only what the question actually asks, but it did not explicitly state the accepted calculation command vocabulary or explain how a quantitative multiple-choice question should combine `selection` and `calculation` demands.

This is a provider-contract reliability defect. It is not evidence that the deterministic assessment-integrity gate is too strict.

A second implementation inconsistency was exposed by the durable evidence: the effective assessment and marking worker contracts are declared as version `2` in `assessment-and-marking.ts`, while the lower-level OpenAI adapter still reports version `1`. The assessment-integrity compiler is the effective v2 boundary and must expose v2 provenance consistently.

## Correction

The assessment-integrity compiler is hardened without weakening the deterministic validator:

1. Whenever a subquestion declares `calculation`, provider guidance now requires learner-facing wording to explicitly ask for the calculation using `calculate`, `work out` or `determine`.
2. For a multiple-choice question that genuinely requires calculation, provider guidance requires both `selection` and `calculation` response demands and requires the learner-facing task to ask the learner to calculate/work out/determine the result before selecting an option.
3. If a multiple-choice task only asks the learner to choose an answer, provider guidance requires `selection` only rather than falsely declaring `calculation`.
4. The effective assessment-item and marking-pack compiler boundary exposes contract version `2` in worker provenance, aligning runtime evidence with the existing declared worker contracts.
5. Regression assurance reproduces the Pilot #11 failure class and confirms that selection wording which declares an unasked calculation remains a terminal contract failure with no retry.

## Assurance boundary

This change does **not**:

- relax `validateStructuredAssessment`;
- broaden accepted calculation commands beyond the existing deterministic rule;
- convert a failed item into a passing one;
- add fuzzy matching or AI-based validation;
- add a model call;
- permit automatic retry of terminal structural defects;
- change source-rights boundaries;
- change the `$20` per-course live spend ceiling.

The fail-closed assessment gate remains authoritative implementation behaviour.

## Documentation impact

No normative authority change is required. Existing authority already requires assessment correctness, mechanically checked gates, deterministic handling of deterministic work, and fail-closed treatment of material uncertainty.

This technical record documents how the current implementation satisfies that authority after Pilot #11. Historical Pilot #11 / Issue #201 remains immutable evidence of the blocked run.

## Next live proof

After the corrective PR is merged with explicit Founder approval and the resulting `main` is production verified, the next paid Content Factory proof must be a **fresh** live pilot from that new approved `main` with `resume_job_issue_number` left blank.

Issue #201 must not be resumed across the changed implementation head.
