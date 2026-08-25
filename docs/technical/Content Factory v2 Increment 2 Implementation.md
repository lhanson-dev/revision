# Content Factory v2 Increment 2 Implementation

**Status:** In implementation  
**Initiative:** Issue #169 — Content Factory v2  
**Implementation increment:** Rights-safe intake → identity → Source Licence Register → Board Alignment → coverage → Course Knowledge Model  
**Canonical runtime / operational entry point:** `/app/` → role-gated Admin / Content Operations → protected `content-factory-intake` Supabase Edge Function  
**Base:** `main` at `429e32b68093503d3303d0ac0f5841121b8de2fa`

## Purpose

Implement the second material Content Factory v2 slice after Increment 1 established the durable v2 job, source-rights and lifecycle contracts.

This increment makes the front of the factory executable as a provider-neutral pipeline. A course job can be resolved and mapped into a Course Knowledge Model while enforcing the source-rights distinction between qualification alignment and reusable curriculum/subject truth.

It does not yet implement learning/practice generation, assessment generation, independent review, expert handoff or automated publication.

## Governing rules implemented

This increment implements the current approved requirements in:

- `40-evidence-and-trust/Educational Content Source Licensing and Provenance Standard.md`;
- `80-company-workflows/Awarding Body URL Content Intake Workflow.md`;
- `80-company-workflows/Content Factory v2 Expert Review Ready Amendment.md`; and
- `docs/technical/Content Factory v2 Implementation Plan.md`.

In particular:

- the official course URL remains an identity/alignment pointer rather than an automatic AI-ingestion licence;
- source rights are classified only through explicitly supplied approved reusable policy rules;
- no matching rule or multiple matching rules fail closed to `UNKNOWN`;
- `PROHIBITED` and `UNKNOWN` stop the pipeline with `source_rights_review_required`;
- `REFERENCE_ONLY` sources may support verified structured Board Alignment facts but cannot become generative curriculum authority;
- curriculum requirements and Course Knowledge Model nodes may reference only `OPEN`, `REVISION_OWNED` or `LICENSED` sources whose recorded derived-commercial-use permission is true;
- genuine unresolved course options block rather than being guessed.

## New implementation module

`src/content-factory/intake-to-knowledge-model.ts` provides:

- versioned worker input/output contracts for identity, source discovery, controlled structured evidence, Board Alignment, coverage and Course Knowledge Model compilation;
- a deterministic approved-policy source-rights classifier;
- stable SHA-256 fingerprints over canonical structured values;
- a provider-neutral worker execution/provenance contract;
- a provider-neutral artifact-store contract;
- schema validation and cross-artifact/source-rights validation at each stage; and
- `runIntakeToKnowledgeModel(...)`, which executes the governed front-of-factory sequence.

The module is exported from `src/content-factory/index.ts`.

## Execution sequence

For a schema-v2 job in `requested`:

```text
identity resolver
  ↓
resolved identity / cohort / components
  ↓
course-option blocker when genuinely unresolved
  ↓
identified
  ↓
source discovery (metadata contract)
  ↓
deterministic source-rights policy engine
  ↓
Source Licence Register
  ↓
source_rights_review_required when ambiguous/prohibited
  ↓
sourced
  ↓
rights-governed structured evidence resolver
  ↓
verified Board Alignment facts + permitted curriculum requirements
  ↓
Board Alignment compiler
  ↓
coverage compiler
  ↓
mapped
  ↓
Course Knowledge Model compiler
```

The job intentionally remains in `mapped` after the Course Knowledge Model is present. Increment 3 will add the Learning Blueprint and governed work units required before the existing state machine can advance to `generating`.

## Worker safety boundary

The durable downstream contracts do not contain raw protected awarding-body prose.

Worker source-input classes are explicit:

- identity: identity pointers only;
- source discovery: metadata only;
- structured evidence: rights-governed controlled extraction;
- Board Alignment: approved structured facts only;
- coverage: permitted curriculum requirements plus approved alignment;
- Course Knowledge Model: permitted curriculum requirements plus approved alignment.

Provider/model selection remains injected implementation detail. No provider secret or model name is introduced into the domain contract.

A concrete network/model adapter must obey the Source Licence Register when it fetches or supplies source material. This increment does not create a default rule that treats any named awarding body, public URL or source type as licensed for AI use.

## Source-rights policy engine

`classifySourcesWithApprovedRules(...)` matches discovered source metadata against a supplied set of reusable, approved rules using:

- issuer;
- exact hostname; and
- source type.

Exactly one rule must match. Zero or multiple matches produce an `UNKNOWN` Source Licence Record with AI input and derived commercial use both disabled.

This conservative design prevents the runtime from inventing a legal/licensing conclusion. Organisation-specific reusable policy rules can be introduced only when their authority/permission basis has been deliberately approved.

## Structured evidence boundary

The controlled evidence contract separates:

1. **Board Alignment facts** — verified structured qualification facts that may reference a non-blocked `REFERENCE_ONLY` source; and
2. **curriculum requirements** — reusable subject/curriculum requirements that may reference only sources permitted for derived commercial curriculum use.

The pipeline rejects an attempt to use a `REFERENCE_ONLY`, `PROHIBITED`, `UNKNOWN` or otherwise non-permitted source as curriculum authority.

This prevents a restrictive awarding-body source from becoming reusable generative input through an intermediate paraphrasing step.

## Artifact persistence

The pipeline writes four durable artifact classes through an injected `ContentFactoryArtifactStore`:

- Source Licence Register;
- Board Alignment;
- coverage map; and
- Course Knowledge Model.

The store contract returns repository/job references while the pipeline retains fingerprints in the governed artifacts/job state. A concrete GitHub branch artifact-store adapter remains a later implementation detail; this increment establishes the domain boundary needed to implement it without coupling worker logic to GitHub API calls.

## Failure and blocker behaviour

The pipeline records worker provenance in the existing `workerRuns` job history.

Worker failures/infrastructure failures become durable blockers rather than silent retries or discarded failures. Source-rights ambiguity and genuine course choices use explicit blocker reasons. Existing orchestrator resume behaviour remains the recovery mechanism.

The runner does not automatically clear rights/course blockers or infer Founder/legal decisions.

## Assurance added

`src/content-factory/intake-to-knowledge-model.test.ts` covers:

- fail-closed `UNKNOWN` classification when no approved source-rights rule matches;
- `REFERENCE_ONLY` classification without AI-input permission;
- successful end-to-end requested → mapped execution with Source Licence Register, Board Alignment, coverage and Course Knowledge Model artifacts;
- source-rights blocking before downstream mapping;
- rejection when `REFERENCE_ONLY` material is used as curriculum authority; and
- course-option blocking rather than automatic guessing.

Repository exact-head CI remains the final assurance gate for the PR.

## Security and privacy impact

No learner personal data is introduced.

No new browser secret or privileged client path is introduced. The canonical Admin intake remains unchanged. Model/provider credentials are not implemented in this increment and must remain server-side when a concrete adapter is added.

## User-facing impact

None. There is no learner-facing product change and no new Admin route in this increment.

The practical improvement is internal: the factory now has executable, source-rights-safe machinery for turning a course request into the structured knowledge foundation required by later content-generation stages.

## Deliberate non-scope / next increment

Not included:

- concrete live web/model provider adapters;
- approved organisation-specific source-rights rule catalogue;
- Learning Blueprint or learning/practice workers;
- assessment/Marking Pack workers;
- deterministic content assurance;
- independent review/remediation;
- expert export/import;
- Admin status UI changes;
- automated merge/publication.

Increment 3 is the Learning Blueprint + learning/practice factory. It should consume this Course Knowledge Model and create governed work units before entering `generating`.

## Documentation impact check

No normative authority change is introduced. This implementation follows the already-approved v2 authority and adds a current implementation record. Historical v0.1 and Increment 1 records remain unchanged.
