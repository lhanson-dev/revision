# Content Factory Pilot 21 Question Wording Ownership Remediation

## Status

Implementation remediation for Confirmation Pilot #21. Full-course Content Factory eligibility remains paused until Reliability v2 Q1-Q7 are requalified on approved `main` and a later separate Q8 transition restores eligibility.

## Trigger

Confirmation Pilot #21 ran from approved `main` `c6d7e7b200be7886a3d9fb4cda530bbc604fb254` as workflow run `33563478174` and durable job Issue #281.

The course stopped fail-closed during Assessment Item candidate recovery with the effective contract error:

`questionWording must contain subquestion q1-profit verbatim`

The run remained within the governed course ceiling at `$0.7454 / $20`, performed no learner publication and did not reach `expert_review_ready`.

## Classification

This is a new generic engineering contract class, not an educational finding and not a provider/infrastructure incident.

The provider was required to author two representations of the same learner-facing wording:

- structured `subquestions[].wording`, which contains the educational wording and must remain generative judgement;
- top-level `questionWording`, a clerical learner-visible aggregation that the contract later required to contain each structured subquestion verbatim.

That duplicated authorship created a mechanically provable failure mode with no educational benefit. It conflicts with the active Reliability Qualification Standard's compiler-first rule and prohibition on duplicated authorship where deterministic derivation preserves educational meaning.

## Correction

Assessment Item provider contract v9 removes top-level `questionWording` from provider ownership.

The provider continues to author the educational wording in each structured subquestion. After complete deterministic diagnostics pass, Revision composes the final top-level `questionWording` from the validated subquestions in governed order, separated by a stable blank line. Each subquestion wording is preserved verbatim.

This correction does not:

- weaken structured assessment validation;
- alter response-demand or coverage-evidence validation;
- change the two-candidate recovery ceiling;
- add a provider call or retry;
- change source-rights policy;
- change the `$20` full-course spend ceiling;
- publish learner content.

## Durable reuse impact

The effective Assessment Item semantic boundary advances from `output-integrity-v6` to `output-integrity-v7`.

That invalidates pre-correction Assessment Item outputs and genuine downstream dependants such as Marking Packs and independent review. It does not invalidate unrelated Learn or Practice artifacts merely because the implementation head changed.

## Permanent replay

`src/content-factory/pilot21-question-wording-ownership.test.ts` reproduces the generic failure with a stale provider-authored top-level wording that omits the `q1-profit` subquestion.

The current compiler must prove that:

1. the provider-facing v9 schema removes the duplicated top-level field;
2. the compiled final artifact contains every validated subquestion wording verbatim;
3. existing deterministic requirement-ID ownership remains intact;
4. durable dependency invalidation is limited to Assessment Item and genuine downstream dependants.

Historical Pilot #21 evidence remains unchanged in Issue #281 and the workflow artifact. The append-only classification record is `content-factory/reliability-pilot21-question-wording-ownership-defect.json`.

## Reliability state and next gates

This implementation does not itself restore qualification.

`content-factory/reliability-qualification.json` is reset to `paused`, Q1-Q7 are pending, `qualifiedEvidence` is cleared and `livePilotEligible` is false.

The next governed sequence is:

1. requalify affected provider-free Q1-Q6 evidence against the corrected compiler, including Pilot #21 in the historical replay corpus and ownership inventory;
2. run a new bounded Q7 live worker soak only after Q1-Q6 PASS;
3. classify Q7 evidence;
4. use a separate Q8 repository-state transition only after Q1-Q7 PASS;
5. only then consider another paid full-course confirmation pilot.

No paid full-course retry is permitted from this remediation branch or from approved `main` until that sequence is complete.

## Documentation impact

No normative authority changes are required. The active Reliability Qualification Standard and ADR-0019 already require compiler-first mechanical ownership, bounded candidate recovery, historical replay, dependency-aware invalidation and requalification after a new generic confirmation-pilot engineering failure.

This document records the changed implementation boundary. The existing `INDEX.md` already routes Content Factory reliability work through the active Reliability Qualification Standard and the indexed reliability qualification harness; Q1 requalification will update the machine-readable ownership inventory and qualification evidence rather than rewriting this historical remediation record.
