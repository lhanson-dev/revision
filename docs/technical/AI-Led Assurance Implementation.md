# AI-Led Assurance Implementation

**Status:** Implemented on governed branch pending Founder-approved merge.  
**Authority:** `50-engineering-standards/AI-Led Development Assurance Standard.md`  
**AI rules:** `70-ai-operating-system/AI Assurance Review Rules.md`  
**Workflow:** `80-company-workflows/AI-Led Assurance Workflow.md`

## Purpose

Record how Revision currently implements compensating technical assurance for AI-led development when routine independent human technical code review is not available.

This is implementation truth. It does not redefine the normative standards above.

## Design objective

The implementation is deliberately asymmetric:

- ordinary Level 1/2 work does **not** acquire the expensive Level 3/4 security/adversarial process;
- Level 3/4 work gains additional independent and adversarial controls; and
- the existing conservative Revision CI suites remain in place until selective execution is separately proven safe.

The objective is to increase confidence where consequence/blast radius is high without turning every visual/copy/UI change into a security-release exercise.

## Risk classifier v2

`scripts/assurance/change-classifier.mjs` remains the machine-readable change classifier.

Version 2 adds the following rules:

- changes under `.github/workflows/` remain Level 3 / High;
- changes under `scripts/assurance/` are now Level 3 / High rather than ordinary Level-2 test maintenance;
- changes to declared critical RLS, protected-service, persistence and critical-browser assurance are Level 3 / High;
- changes to `.github/PULL_REQUEST_TEMPLATE.md` are Level 3 because the template now carries mandatory high-risk assurance evidence; and
- ordinary non-critical test maintenance under `tests/` remains Level 2 / Medium.

This prevents a safety-control change being down-classified merely because it lives in a test/assurance file.

The generated assurance plan schema is version 2 and explicitly declares whether the change requires:

- an assurance contract;
- adversarial review;
- test-sensitivity evidence;
- critical-assurance integrity; and
- independent security analysis.

`selectionMode` remains `conservative-full`: this change does not yet use risk classification to skip the existing Foundation or database assurance jobs.

## Critical assurance manifest

`scripts/assurance/critical-assurance-manifest.json` declares the current protected assurance assets and the Assurance Coverage Register controls they support.

The initial protected set covers:

- database/RLS assurance;
- learner-plan RLS/assignment assurance;
- starting-check/planning separation assurance;
- first-use RLS/event assurance;
- authenticated Supabase persistence;
- protected Edge-function authorisation;
- database-backed critical browser persistence;
- first-use browser assurance;
- change classification;
- release lineage; and
- Founder-approval status verification.

The manifest also records explicit CI command snippets that must remain present for critical tests invoked directly by `Revision CI`.

## Critical assurance integrity validator

`scripts/assurance/validate-critical-assurance.mjs` runs in the assurance-plan job on every Revision CI run.

It fails when:

- a declared critical assurance file is missing;
- a declared critical assurance file is unexpectedly empty/small;
- a protected executable test contains `skip`, `todo` or `only` suppression syntax;
- a minimum protected control ID disappears from the manifest; or
- an explicitly required critical assurance command disappears from `.github/workflows/ci.yml`.

This is deliberately a structural integrity gate. It cannot prove that every assertion remains semantically strong. Semantic weakening is handled by Level-3 classification, high-risk PR evidence, test-sensitivity evidence and adversarial review.

Unit coverage: `scripts/assurance/validate-critical-assurance.test.mjs`.

## High-risk PR evidence gate

`.github/PULL_REQUEST_TEMPLATE.md` now includes four exact Level-3/4 evidence sections:

- `### Assurance invariants`
- `### Failure and abuse hypotheses`
- `### Adversarial review`
- `### Test sensitivity`

`scripts/assurance/validate-high-risk-pr-evidence.mjs` reads the exact generated assurance plan and GitHub pull-request event payload.

For Level 1/2 it exits without requiring these sections, so ordinary work does not gain the extra process.

For Level 3/4 it fails if a required section is missing or contains only thin/placeholder evidence. The gate is enforced in the same `Revision CI` workflow as the existing release evidence.

On a post-merge `main` push, the validator does not require a second PR body: the production commit inherits the governed PR evidence and continues through the existing main/deployment path.

Unit coverage: `scripts/assurance/validate-high-risk-pr-evidence.test.mjs`.

## Independent security and dependency analysis

`Revision CI` now has an `Independent security and dependency analysis` job that runs only when:

- the event is a pull request; and
- the machine-readable risk level is 3 or 4.

The job uses:

- `actions/dependency-review-action@v5` with `fail-on-severity: high`; and
- `github/codeql-action@v4` for `javascript-typescript` using `build-mode: none`.

The CodeQL major version was chosen from the currently supported GitHub action line as of this implementation. Dependency Review v5 uses the Node 24 runtime and is compatible with the repository's current GitHub-hosted runner baseline.

These tools are independent of Revision's application test authoring. They do not replace RLS/Edge/service tests or secret scanning.

## CI execution profile

### All PRs / main pushes

Existing Revision CI remains mandatory, including the current conservative full suites. This change adds only fast structural checks to the assurance-plan job:

- secret scan;
- critical-assurance integrity validation; and
- high-risk evidence validation (which is effectively a no-op below Level 3).

### Level 3/4 PRs only

In addition to existing CI, run:

- high-risk PR contract/evidence validation; and
- independent Dependency Review + CodeQL analysis.

The adversarial review itself is a governed AI workflow step recorded in the PR rather than an autonomous GitHub-hosted model invocation.

## Test sensitivity and mutation strategy

This first implementation does **not** add a mutation-testing npm dependency or full-repository mutation job.

The reasons are deliberate:

1. mutation testing should target critical deterministic domains rather than every PR;
2. adding a package without validated lockfile/runtime integration would weaken supply-chain discipline; and
3. the immediate gap is first addressed by mandatory test-sensitivity evidence and stronger negative/invariant test expectations.

The next staged enhancement should evaluate a targeted mutation harness for critical deterministic modules such as readiness/scoring, evidence, planning, entitlements and billing calculations. It should be introduced through a separate governed PR with measured runtime and useful mutation-kill evidence before becoming a required control.

Property-based generation follows the same principle: introduce it where broad invariants materially improve defect detection; do not impose it as an unconditional dependency on all work.

## Speed position

This change deliberately does **not** add CodeQL, Dependency Review, formal adversarial evidence or mutation/fuzz work to Level 1/2 PRs.

The only new universal runtime is the lightweight structural integrity/evidence scripts in the assurance-plan job.

The existing CI remains conservative-full, so this PR does not yet make ordinary PRs faster. Selective execution remains a separate optimisation because weakening existing suites and strengthening independence in the same change would make assurance attribution harder to reason about.

## Residual risk

These controls materially reduce, but do not remove, the correlated-failure risk where AI designs, implements and reviews software without an independent technical human.

Known residual limits include:

- the same AI system may still share blind spots between builder and adversarial-review roles;
- structural test-integrity checks cannot prove assertion quality;
- CodeQL/dependency analysis does not prove business or educational correctness;
- there is not yet an automated mutation/property harness for all critical deterministic logic; and
- specialist human security/architecture review remains valuable for exceptionally consequential changes when available.

Revision must report these limits truthfully rather than treating a green pipeline as proof of zero risk.

## Documentation impact

This implementation adds and aligns:

- `50-engineering-standards/AI-Led Development Assurance Standard.md`;
- `70-ai-operating-system/AI Assurance Review Rules.md`;
- `80-company-workflows/AI-Led Assurance Workflow.md`;
- `90-governance-registers/Assurance Coverage Register.md`;
- `INDEX.md`;
- `.github/PULL_REQUEST_TEMPLATE.md`;
- `.github/workflows/ci.yml`; and
- the assurance scripts/tests described above.

No learner-facing product behaviour changes in this implementation.
