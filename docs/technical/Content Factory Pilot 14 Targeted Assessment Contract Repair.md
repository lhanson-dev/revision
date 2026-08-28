# Content Factory Pilot 14 — Targeted Assessment Contract Repair

## Status
Implementation remediation record for live Pilot #14. This is current implementation truth, not new normative authority.

## Pilot evidence

Pilot #14 was a fresh `workflow_dispatch` run of `Content Factory Live Pilot` from approved production `main` commit `4884d3b3395621a7f167e6d1c476828ae58ed9fd` with no resume issue.

- workflow run: `33141363385` / run number `14`;
- durable job issue: `#207`;
- job ID: `aqa-as-business-7131-live-4884d3b33956-1787890638097`;
- artifact ID: `9674250552`;
- final state: `blocked`, from `generating`;
- source-rights status: `approved`;
- coverage completeness: `pending`;
- artifact compatibility: `pending`;
- cumulative course spend: `$0.738562`;
- remaining course budget: `$19.261438` of the governed `$20` ceiling;
- executed workers: `39`;
- reused workers: `0`;
- report worker runs: `40`;
- total retries: `0`;
- human interventions: `0`;
- Marking Packs generated before failure: `0`;
- failing assessment-item provider call cost: `$0.033106`;
- generation model: `gpt-5.6-terra`;
- failing assessment-item contract version: `2`.

The exact terminal blocker was:

`generation worker failure: provider_contract_failure: assessment_item_compilation: Assessment item northstar-meals-financial-workforce-decision subquestion d command does not ask for rewarded demand interpretation`

The rejected provider candidate was not persisted as a completed assessment item, so this record does not invent its exact rejected wording. The durable evidence proves the mismatch class and exact failing item/subquestion/demand, but not the full rejected candidate text.

## What Pilot #14 proved

Pilot #14 returned to the response-demand contract class previously exposed by Pilots #11 and #12. PR #204 had correctly centralized the deterministic command-demand vocabulary and injected that same contract into provider instructions, removing duplicated vocabulary ownership. The validator remained correct and fail-closed.

The remaining reliability gap was different: a completed model response could still author both:

1. the learner-facing question/subquestion wording; and
2. structured `responseDemands` metadata describing what that wording asks the learner to do.

Prompting the model with the exact shared vocabulary materially reduces drift, but does not guarantee that these two representations will always be synchronized. Pilot #14 demonstrated that a completed paid assessment generation can still contain a deterministic contract mismatch and be discarded without a bounded correction opportunity.

This is not evidence that the response-demand validator should be weakened. A question that claims `interpretation` must still actually ask the learner to interpret. Silently deleting unsupported demands would risk allowing an under-demanding question to pass and would weaken A3 assessment assurance.

## Correction

Assessment-item provider contract version `3` keeps the existing deterministic checks and adds one bounded, validator-directed repair opportunity after a completed candidate fails assessment-item compilation.

The sequence is now:

`provider candidate → deterministic compilation/validation → if invalid, one targeted repair call carrying the exact deterministic error → deterministic compilation/validation again → success or fail closed`

The targeted repair instruction requires the worker to:

- return the complete corrected assessment item;
- preserve valid educational content, governed requirements, marks, context and Question Family intent;
- change only what is necessary to resolve the reported contract mismatch;
- make a genuinely intended demand explicit in learner-facing wording rather than deleting it merely to silence validation.

The repair is not a blind retry. The second call receives the exact deterministic validation error from the first completed candidate. There is no loop: at most one targeted repair call is permitted by this compiler path.

Worker provenance combines both provider-call costs and records one retry when the targeted repair path is exercised, so course spend and retry reporting remain truthful.

## Assurance retained

This remediation deliberately keeps the existing fail-closed controls:

- a selection-only question cannot claim calculation without explicit calculation wording;
- a selection-only question cannot claim interpretation without explicit interpretation-compatible wording;
- subquestion marks must still total the governed item maxMark;
- governed requirement coverage remains exact;
- coverage evidence must still cite exact learner-facing question excerpts;
- MCQ option and misconception-basis checks remain unchanged;
- the repaired candidate must pass the same deterministic validator as a first-pass candidate;
- no learner content is published by the live-pilot workflow;
- source-rights handling is unchanged;
- independent review and qualified expert gates remain unchanged.

## Cost and retry impact

The existing Content Factory bootstrap authority allows bounded retries and targeted remediation while prohibiting quality degradation for cost reasons. This change adds no routine call to successful assessment generation. A second generation call occurs only when a completed assessment item fails deterministic provider-contract compilation, and only once for that worker invocation.

The governed `$20` per-course ceiling is unchanged and remains enforced by the durable spend ledger before provider calls.

## Regression coverage

The assessment compiler tests now prove that:

1. valid first-pass assessment output still uses one provider call;
2. a completed but structurally invalid response gets one targeted repair opportunity and still fails closed if the repaired response remains invalid;
3. the Pilot #11 calculation-demand guard remains strict after the repair attempt;
4. the Pilot #12 interpretation-demand guard remains strict after the repair attempt; and
5. a Pilot #14-style interpretation mismatch can be corrected by a second response that receives the exact deterministic validation error and makes the intended demand explicit.

## Governance and documentation impact

No normative authority amendment is required. Existing active authority already requires:

- deterministic validation for mechanically checkable assessment contracts;
- targeted remediation of the smallest safe affected scope;
- bounded retries;
- fail-closed provider errors;
- preservation of educational quality and assessment integrity above cost minimisation.

This is therefore an implementation reliability correction within approved Content Factory v2 and bootstrap-cost authority.

Historical Pilot #14 / Issue #207 evidence remains unchanged. Pilot #13 / Issue #205 also remains historical and must not be resumed.

## Next live proof

After this correction passes exact-head CI, receives explicit Founder merge approval and is production-verified, the next paid proof must be a fresh Pilot #15 from the new approved `main` head with `resume_job_issue_number` blank. Issue #207 must not be resumed across the changed implementation head.
