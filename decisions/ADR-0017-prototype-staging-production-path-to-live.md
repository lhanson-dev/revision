# ADR-0017 — Prototype, staging and production path to live

Status: Accepted on merge — explicit Founder approval of this PR is the acceptance decision
Date: 2026-08-23

## Context

Revision currently has one canonical source repository, one production application environment and one production Supabase project. `main` is the canonical integrated product state and production source of truth.

The product now needs two distinct forms of pre-production review:

1. fast visual/experience prototyping to resolve product, journey, content hierarchy and interaction questions before committing to production implementation; and
2. browser-based review of the exact engineered release candidate before Founder approval and production merge.

Using production itself for either purpose would couple experimentation to the live release path. Creating separate source repositories or long-lived source branches for Prototype and Staging would create competing sources of truth and increase integration risk.

ADR-0009 correctly established that additional environments should exist only when operational need justifies them. That need is now demonstrated for non-production application review surfaces. Its rules for one production application environment, one production Supabase project, synthetic test data and exclusion of test activity from live reporting remain in force.

## Decision

### 1. Keep one canonical source repository

`lhanson-dev/revision` remains the only canonical Revision source repository.

It owns:

- `main`;
- short-lived feature, defect, governance and prototype branches;
- implementation pull requests;
- source code;
- governance and technical documentation;
- tests and assurance;
- GitHub Actions and release controls.

`main` remains the single canonical integrated product state and the only source from which Production is deployed.

### 2. Add two non-production application review environments

Revision will operate three application review/deployment environments with distinct purposes:

- **Prototype** — disposable concept work derived from current `main`, used to resolve experience questions quickly. It is not a release candidate and does not represent Definition-of-Ready approval.
- **Staging** — the exact final current-main-integrated implementation candidate after required CI/assurance, used to validate what would be released next.
- **Production** — the live product deployed from Founder-approved `main` only.

Prototype and Staging are environments, not independent product codebases.

### 3. Use a non-production hosting repository as deployment space only

The target hosting topology is:

- `lhanson-dev/revision` — canonical source, governance and release repository;
- `lhanson-dev/revision-nonprod` — generated/static non-production deployment host only.

`revision-nonprod` must not become an independent development repository. It must contain no competing governance, no independent application source and no product authority. Its content is disposable deployment output generated from `revision`.

The intended Pages paths are:

- `/prototype/<prototype-name>/` for named prototype builds; and
- `/staging/` for the current staging candidate.

The exact workflow and repository implementation are deliberately deferred to later governed PRs.

### 4. Prototype is exploration, not promotion

A prototype may be created during `Analyse` when visualisation will resolve material uncertainty. Prototype approval means the concept is understood well enough to continue product definition; it does not mean the feature has achieved the governed `Ready` state.

Material product implementation still requires the complete Definition of Ready and explicit human `Analyse → Ready` approval under the Feature Definition and Measurement Workflow.

Prototype code is not promoted or copied into Staging as a release artifact. Once a concept is approved, the production implementation is built properly in a governed implementation PR from the then-current `main` baseline.

### 5. Staging represents the exact final candidate

Staging must represent the final implementation PR candidate after it has been integrated/revalidated with the then-current `main` and completed the required risk-proportionate CI/assurance.

Staging should expose enough provenance to identify the exact candidate, including commit/head identity where practical.

If the PR head changes materially after staging review, the changed candidate must be rebuilt/revalidated and reviewed again as required by the existing Founder-approval and integration-refresh rules.

### 6. Production remains unchanged in authority

Only `revision/main` deploys to Production.

Founder approval remains approval of a specific PR change entering Production. After approval, the PR merges to `main`; the existing production workflow then performs governed release lineage, backend readiness where applicable, production build/deployment, smoke and release evidence.

Staging approval never bypasses the explicit Founder merge gate and never writes directly to Production.

## Target path

```text
Discuss / Analyse
      |
      +--> Prototype when useful
      |       derived from current main
      |       synthetic/demo data
      |       Founder concept review
      |
      +--> Definition of Ready
              Founder Ready approval
                    |
                    v
             Implementation PR
                    |
          integrate with current main
                    |
             final CI / assurance
                    |
                    v
                 Staging
          exact final candidate
                    |
             Founder review
                    |
          Approve merge PR #X
                    |
                    v
                   main
                    |
             Production deploy
                    |
           Production smoke/evidence
```

## Consequences

- Revision gains fast visual review without weakening the production path.
- Staging becomes a faithful review surface for the real release candidate rather than a separate code line.
- `main` remains the only canonical integrated product state.
- Prototype remains disposable exploration and cannot silently become production implementation.
- No long-lived staging branch or separate staging source repository is introduced.
- The existing one-production-environment and one-production-Supabase principle remains intact.
- A second repository is introduced only as generated non-production hosting space when the later implementation PR creates it.
- Deployment automation, synthetic-data mechanics, non-production cleanup/expiry, staging provenance display and smoke checks are implementation work for subsequent governed PRs.