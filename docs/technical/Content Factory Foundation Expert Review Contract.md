# Content Factory Foundation Expert Review Contract

**Status:** Slice 3C implementation record — expert-review contract in progress  
**Parent initiative:** Issue #289 — Content Factory — foundation-gated course production  
**Authority:** `80-company-workflows/Content Factory Foundation and Asset Production Model.md`  
**Implementation plan:** `docs/technical/Content Factory Foundation-Gated Implementation Plan.md`

## Purpose

Define the first Slice 3C implementation boundary after the exact retained AQA A-level Business 7132 Foundation completed deterministic assurance and fresh-context independent review successfully.

This contract does not perform or simulate qualified human review. It creates the portable, exact-version package and structured human submission boundary needed before a real qualified reviewer can approve or hold the Foundation.

## Slice 3B completion evidence

The governed **Content Factory Foundation Independent Review Proof** workflow run `33956520875` completed successfully on released `main` commit `2f2ae89f8280e3b0c1091346258e56f993f61f77`.

The proof reviewed the retained Foundation from source workflow run `33938173128`:

- source Foundation fingerprint: `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca`;
- deterministic assurance: `pass`;
- independent review: `pass`;
- independent-review findings: `0`;
- targeted remediation cycles: `0`;
- unresolved blockers: `0`;
- conservative independent-review provider spend: `$0.0731 / $12.00`;
- learner-facing assets: `0`;
- retained independent-review proof artifact id: `9966542905`;
- retained artifact digest: `sha256:df5b8fd23f7ed2b4fd03c64af7a8f59cf84abc1621b7a86b9f3f42a210c9c111`.

This satisfies the active implementation plan's operational completion condition for Slice 3B. It does **not** make the Foundation approved. Qualified human subject/assessment review remains mandatory.

## Slice 3C contract boundary

`src/content-factory/foundation-expert-review.ts` introduces two durable JSON contracts.

### Foundation expert-review package

A package may be created only when the exact Foundation Candidate has:

- deterministic assurance `pass`;
- independent review `pass`;
- no unresolved candidate blockers;
- deterministic assurance bound to the exact recomputed Foundation fingerprint; and
- independent review bound to that same exact fingerprint.

The package records:

- exact job and candidate identity;
- exact reviewed implementation commit;
- exact Foundation fingerprint;
- the complete Foundation Candidate;
- the reviewable Foundation artifact index and fingerprints;
- deterministic-assurance evidence references;
- independent-review evidence references;
- known limitations;
- required review scopes; and
- package creation timestamp.

For the Foundation gate, required human qualification coverage is deliberately expressed as two scopes:

1. `subject`;
2. `assessment`.

The scopes may be covered by one suitably qualified reviewer or by multiple reviewers. The contract does not invent a universal professional credential. Each reviewer must instead provide explicit qualification-evidence references, preserving the current authority requirement that the review be genuinely qualified rather than merely labelled expert.

### Qualified expert-review submission

A human submission records:

- exact package job/candidate/commit/fingerprint identity;
- one or more reviewer identities;
- qualification scopes and qualification-evidence references for each reviewer;
- `pass` or `fail_hold` decision;
- structured blocking/material/minor findings;
- evidence references;
- known limitations; and
- review timestamp.

Validation fails closed when:

- the submitted candidate, commit or Foundation fingerprint differs from the package;
- the combined reviewer qualifications do not cover both required review scopes;
- a finding targets an artifact outside the exact review package;
- a finding's artifact kind does not match the packaged artifact; or
- a `pass` decision contains a blocking/material finding.

A submission with any blocking/material expert finding must return `fail_hold`.

## Deliberately excluded from this PR

This first Slice 3C contract increment does not yet:

- generate the retained AQA expert-review package from the proof artifact store;
- provide an Admin UI for reviewer assignment or evidence upload;
- import a real human review submission;
- remediate expert findings;
- transition a real persisted Foundation job into `foundation_approved`;
- create an Approved Course Foundation record; or
- generate any Learn, Practice or Exam Prep asset.

Those are later Slice 3C steps. In particular, no AI worker may stand in for the qualified human review.

## Next governed step

After this contract is released:

1. assemble one retained expert-review package for Foundation fingerprint `8c3786491943091da31325812af0386a531b5c634513dfcece2147273bb022ca` using the exact passed assurance evidence;
2. obtain a real qualified subject/assessment human review against that exact package;
3. import and validate the structured submission;
4. if blocking/material findings exist, reopen only the affected Foundation truth and rerun required deterministic + independent assurance on the new fingerprint;
5. if expert review passes, persist exact qualified approval evidence and create immutable Approved Course Foundation v1 through the existing lifecycle/version-lineage gate; and
6. prove learner-facing asset count remains zero at `foundation_approved`.

## Documentation impact

This record moves implementation state from Slice 3B assurance qualification into Slice 3C qualified expert review under existing Content Factory authority. It does not change normative Content Factory policy and therefore does not require a new ADR. The active staged implementation plan must identify Slice 3C as the current increment and retain Run `33956520875` as the Slice 3B completion checkpoint.
