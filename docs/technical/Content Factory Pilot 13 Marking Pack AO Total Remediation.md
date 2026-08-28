# Content Factory Pilot 13 — Marking Pack AO Total Remediation

## Status
Implementation remediation record for live Pilot #13. This is current implementation truth, not new normative authority.

## Pilot evidence

Pilot #13 was a fresh `workflow_dispatch` run of `Content Factory Live Pilot` from approved production `main` commit `c320fc8a710fde450146a755de3a4aa4cdf5010f`.

- workflow run: `33124200984` / run number `13`;
- durable job issue: `#205`;
- job ID: `aqa-as-business-7131-live-c320fc8a710f-1787871183915`;
- artifact ID: `9668020048`;
- final state: `blocked`, from `generating`;
- source-rights status: `approved`;
- coverage completeness: `pending`;
- artifact compatibility: `pending`;
- cumulative course spend: `$0.901514`;
- remaining course budget: `$19.098486` of the governed `$20` ceiling;
- executed workers: `43`;
- reused workers: `0`;
- report worker runs: `44`;
- total retries: `0`;
- human interventions: `0`;
- successful Marking Packs before failure: `2`;
- failing Marking Pack provider call cost: `$0.05132`;
- generation model: `gpt-5.6-terra`;
- Marking Pack contract version: `2` in the durable factory provenance.

The exact terminal blocker was:

`marking_pack worker failure: provider_contract_failure: marking_pack_compilation: Marking Pack for urbanpod-school-channel-data-response AO ao2 total does not match subquestion guidance`

The rejected provider candidate was not persisted as a completed Marking Pack. This record therefore does not reconstruct or claim exact rejected wording or allocation beyond the durable failure evidence.

## Root cause

Pilot #13 progressed beyond the assessment response-demand defects exposed by Pilots #11 and #12 and reached Marking Pack compilation.

For structured assessment items, the Marking Pack contains two representations of AO allocation:

1. per-subquestion `assessmentObjectiveAllocation`, which expresses the educational allocation attached to each marked subquestion; and
2. an aggregate top-level `assessmentObjectiveAllocation`, which is arithmetic derived from those subquestion allocations.

The provider was allowed to author both representations independently. Deterministic validation correctly required the aggregate totals to equal the sum of the subquestion guidance and blocked the candidate when AO2 differed.

This was an implementation reliability defect: deterministic arithmetic was duplicated as model-authored output instead of being resolved by deterministic code. It was not a validator defect, source-rights issue, cost failure or reason to relax Marking Pack assurance.

## Correction

For structured Marking Packs, deterministic validation now treats the validated per-subquestion AO allocation as the source for aggregate arithmetic. After each subquestion has passed its existing checks — exact subquestion mark value, rewarded-demand compatibility, per-subquestion AO total and allowed AO IDs — Revision derives the aggregate AO totals from those validated allocations and replaces the duplicate top-level totals with the deterministic result.

The strict educational controls remain in force:

- every structured subquestion must still be guided exactly once;
- each subquestion AO allocation must still total that subquestion's marks;
- unavailable AO IDs still fail closed;
- rewarded demands absent from the question still fail closed;
- Question Family AO coverage remains required by the assessment factory;
- total item marks and other Marking Pack integrity checks remain unchanged.

The regression specifically proves that inconsistent model-authored aggregate AO arithmetic is replaced by the exact deterministic sum of validated subquestion guidance rather than becoming a repeated paid-pilot blocker.

## Deliberately unchanged

This remediation does **not**:

- weaken or remove deterministic Marking Pack validation;
- add fuzzy tolerance to integer mark allocation;
- add another AI call or retry;
- change source-rights handling;
- change the `$20` course spend ceiling;
- change learner-facing product behavior;
- invent expert calibration or bypass independent/human review;
- rewrite Pilot #13 or Issue #205 historical evidence.

## Governance and documentation impact

Active authority already requires deterministic code for deterministic work, explicitly including arithmetic and mark/AO totals, and requires mechanically checkable assessment/Marking Pack controls to fail closed. The correction therefore aligns implementation with existing authority rather than changing normative product or company policy.

No normative authority amendment or ADR is required. This technical remediation record and regression evidence document the implementation change. Pilot #13 / Issue #205 remains historical evidence.

## Next live proof

After this correction is merged through normal Founder approval and production verification, the next paid proof must be a fresh Pilot #14 from the new approved `main` head with `resume_job_issue_number` blank. Issue #205 must not be resumed across the changed implementation head.
