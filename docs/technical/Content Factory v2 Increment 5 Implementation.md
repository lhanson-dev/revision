# Content Factory v2 Increment 5 Implementation

**Status:** Implementation on governed branch pending Founder merge approval  
**Initiative:** Issue #169 — Content Factory v2  
**Increment:** deterministic assurance → independent fresh-context review → targeted remediation/revalidation

## Purpose

Implement the assurance/remediation stage already required by the approved Content Factory v2 operating contract and Content Accuracy Assurance Gate.

This increment takes a schema-v2 job in `validating` with a complete internal `factory_generated_unassured` course manifest and drives it to a clean `independent_review` state when automated assurance succeeds.

It does **not** create `expert_review_ready`, publish learner content, calibrate Marking Packs, implement FI-007 learner-answer marking, or remove qualified expert review.

## Canonical boundary

The canonical application/runtime remains `/app/`. This increment is upstream Content Factory production-plane domain code only. It adds no learner route, no duplicate Admin route and no browser-side model/provider secret.

## Implemented flow

```text
validating
  ↓
deterministic validation tied to exact content head
  ↓
PASS → independent_review
  ↓
fresh-context independent educational/assessment review
  ↓
no blocking/material findings → remain cleanly at independent_review
  ↓
blocking/material downstream finding → remediation
  ↓
smallest-safe artifact replacement(s)
  ↓
new corrected content version
  ↓
validating again
  ↓
new deterministic report
  ↓
new independent review in a different fresh context
```

A bounded remediation-cycle limit prevents an endless AI self-correction loop.

## Deterministic assurance

`src/content-factory/assurance-and-remediation.ts` creates a machine-readable deterministic validation report bound to:

- exact schema-v2 job;
- exact content head SHA;
- deterministic fingerprint of the complete reviewed artifact bundle.

The current validator set covers the mechanically defensible checks available from the existing structured artifacts:

1. **source-rights state** — no prohibited/unknown source is admitted and `REFERENCE_ONLY` cannot masquerade as AI-input permission;
2. **coverage completeness** — every non-deferred requirement has the Learn, Practice and/or Exam Prep evidence required by its governed coverage flags;
3. **artifact compatibility** — job IDs, fingerprints and first-class artifact relationships agree;
4. **assessment/Marking Pack integrity** — Question Family scope/mark range, exact question↔Marking Pack identity, AO totals, Marking Pack coverage and non-exhaustive indicative-content policy;
5. **structured calculation integrity** — calculation items must be linked to structured formula knowledge and may not carry duplicated structured data labels.

The arithmetic control is deliberately limited to what the current structured assessment contract can prove. The implementation does not pretend that free-text arithmetic or an unstructured model answer has been recomputed when no machine-readable expected calculation exists.

Any deterministic failure fails closed at `validating` and creates a durable blocker before independent review.

## Independent review contract

The independent-review worker receives:

- exact reviewed content/version;
- source-use metadata required to understand admissibility, not raw protected source prose;
- structured Board Alignment, coverage and Course Knowledge Model;
- Learning Blueprint;
- Assessment Blueprint and Question Families;
- exact Revision-owned Learn, Practice, assessment and Marking Pack artifacts;
- deterministic validation evidence.

The worker must return schema-valid findings containing severity, issue type, affected artifact, evidence, correction and resolution state.

The execution is rejected/fails closed if the reviewer reuses a successful generation, prior independent-review or remediation context. The reviewer is therefore not treated as independent merely because it is labelled `review`.

Blocking/material findings require `fail_hold`. Minor findings may support `conditional_pass` and are surfaced into job known limitations; they do not silently become material blockers.

## Targeted remediation

Automated remediation is deliberately limited to the smallest downstream scopes that can be safely replaced without silently rewriting curriculum or assessment authority:

- Learn artifact;
- Practice artifact;
- Revision-owned assessment item, with mandatory dependent Marking Pack rebuild;
- Marking Pack.

Stable identity/provenance fields are protected during remediation. A worker may correct explanatory/question/marking content but may not silently change job/course identity, knowledge-model linkage, source references, assessment-family identity or ownership status.

When an assessment item changes, its exact dependent Marking Pack must change in the same remediation target so the pack cannot remain attached to stale wording or mark demand.

A material finding against Board Alignment, coverage, Course Knowledge Model, Learning Blueprint, Assessment Blueprint, Question Family or the course manifest fails closed with an explicit upstream-remediation blocker. That class of change requires the governed upstream factory stage to reopen because downstream dependency invalidation would otherwise be hidden.

## Revalidation and history

Remediated artifacts are written as new artifact references; prior artifacts and prior review evidence are not overwritten.

The orchestration boundary supplies a `RemediationVersionPersister`. After the targeted replacements and rewritten unassured manifest exist, that boundary persists a new exact content head SHA. The job then records a remediation record and re-enters `validating`.

Subsequent deterministic and independent-review evidence must match the corrected head. Prior review/remediation worker runs remain in durable job history.

This implements append-only assurance evidence rather than rewriting the earlier failure out of history.

## Idempotency / restart behaviour

- a clean `independent_review` result already tied to the exact current head returns without another review call;
- each validation/review/remediation artifact is versioned and referenced from durable job evidence;
- worker failures become durable blockers using the existing Content Factory blocker/resume mechanism;
- remediation is bounded to prevent infinite review/fix loops;
- unaffected artifact references are retained during targeted remediation.

## Tests

`src/content-factory/assurance-and-remediation.test.ts` covers:

- deterministic PASS → fresh independent review PASS;
- automatic coverage/compatibility evidence updates;
- material Learn finding → targeted Learn-only remediation → corrected content version → revalidation → second fresh review PASS;
- preservation of unaffected Practice and Marking Pack artifacts during narrow remediation;
- fail-closed reviewer context reuse;
- deterministic Marking Pack-integrity failure before independent review.

Repository exact-head CI remains the required integration assurance for this PR.

## Documentation impact

No new normative authority is required. This increment implements the already-approved:

- `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`;
- `80-company-workflows/Content Accuracy Assurance Gate.md`;
- `docs/technical/Content Factory v2 Implementation Plan.md`.

Historical v0.1 and prior increment records remain unchanged.

The initiative remains `In Progress`. The next increment is expert-review packaging/import plus Admin visibility and the `expert_review_ready` state.

## Deliberate non-scope

- live external AI/provider adapter;
- raw protected awarding-body source ingestion;
- rewriting Board Alignment/Course Knowledge Model/Assessment Blueprint locally in remediation;
- qualified expert review or calibration;
- portable expert package/export/import;
- `expert_review_ready` Admin UI;
- learner catalogue projection/publication;
- FI-007 runtime answer marking;
- automated merge/publication.
