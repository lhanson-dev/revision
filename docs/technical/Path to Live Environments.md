# Path to Live Environments

Status: Approved target architecture; deployment automation not yet implemented
Decision: `decisions/ADR-0017-prototype-staging-production-path-to-live.md`
Authority: `50-engineering-standards/Release & Deployment Standard.md`

## Purpose

Define the technical responsibility and source-of-truth boundary for Revision's Prototype, Staging and Production application environments.

This document describes the approved target deployment model. Until the follow-on implementation PRs land, the existing Production workflow remains the only implemented deployment path.

## Repository topology

```text
lhanson-dev/revision
CANONICAL SOURCE REPOSITORY

main
short-lived feature / defect / governance branches
short-lived prototype branches
implementation PRs
source code
governance and technical documentation
tests / assurance
GitHub Actions and release controls

        | generated builds only
        v

lhanson-dev/revision-nonprod
NON-PRODUCTION HOST ONLY

/prototype/<prototype-name>/
/staging/

No independent source development
No competing governance
No product authority
No independent application code
```

`revision-nonprod` does not yet exist. Its creation and deployment workflows are follow-on implementation work.

## Environment responsibilities

### Prototype

Prototype exists to answer experience questions quickly before production implementation is committed.

Rules:

- start from the then-current `revision/main` baseline;
- use a short-lived prototype branch in the canonical repository;
- use synthetic/demo data and never genuine learner data;
- optimise for rapid review of journey, screen purpose, CTA, hierarchy, content and interaction;
- treat the prototype as disposable exploration;
- do not represent prototype approval as Definition-of-Ready approval;
- do not promote the prototype artifact or branch into Staging or Production; and
- refresh from current `main` before starting materially new prototype work so the concept is not built on a stale product baseline.

A prototype may occur during the governed `Analyse` lifecycle state when it is useful for resolving uncertainty.

### Staging

Staging exists to validate the real engineered release candidate before Founder production approval.

Rules:

- build from the final implementation PR head after current-main integration/revalidation;
- deploy only after the required risk-proportionate CI/assurance for that candidate is green;
- use isolated synthetic/test data or other deliberately non-production data paths appropriate to the change;
- expose the exact candidate identity/commit where practical;
- keep one stable `/staging/` review location representing the current candidate;
- rebuild when the final candidate changes; and
- never treat an older staging build as evidence for a newer PR head.

Staging is not a long-lived source branch and has no independent product state. It is a rendered view of one exact candidate from the canonical repository.

### Production

Production remains the live learner product deployed from `revision/main` only.

The existing production path remains authoritative:

1. explicit Founder approval for the specific PR change;
2. exact-head Founder approval evidence and required pre-merge status;
3. merge to `main`;
4. governed release-lineage verification;
5. backend readiness where applicable;
6. production build and GitHub Pages deployment;
7. production smoke; and
8. durable release/path-to-live evidence.

Staging review does not replace any of those controls.

## Product-development flow

```text
Discuss
  |
Analyse and define
  |
  +--> Prototype if useful
  |      current-main baseline
  |      synthetic/demo data
  |      Founder concept review
  |
  +--> Complete Definition of Ready
          |
     Founder approves Ready
          |
          v
   Implementation PR
          |
 integrate/revalidate with current main
          |
   required CI / assurance
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
  Production workflow
          |
 production smoke/evidence
```

## Promotion rules

### Prototype sync rule

- Prototype does not become Production.
- Before materially new prototype work, refresh from the latest `main` baseline.
- Prototype approval is agreement on the concept, not approval of implementation code.

### Staging candidate rule

- The approved concept is implemented in a real governed PR.
- The PR must be validated with the then-current `main` before its final assurance.
- Staging is rebuilt from that exact final current-main-integrated candidate.
- If the candidate materially changes after review, the staging evidence is stale and the changed candidate must be revalidated/reviewed as required.

### Production promotion rule

- Only `main` deploys to Production.
- Founder approval is still required for the specific PR merge.
- Merge to `main` triggers the existing production deployment and smoke controls.
- No Prototype or Staging workflow may write directly to the production Pages deployment.

## Data boundaries

The approved environment model does not create a second production backend.

- Production continues to use the single production Supabase project governed by existing authority.
- Prototype must use synthetic/demo data.
- Staging must use isolated test/synthetic data and must not cause test activity to be interpreted as live learner evidence, live learner metrics or production health.
- A future implementation PR must define the exact non-production data mechanics before any workflow that can exercise persisted learner/backend behaviour is enabled.

## Provenance and assurance target

The implementation should make it obvious which source produced each review surface.

At minimum, follow-on automation should aim to record or expose:

- environment name;
- source repository;
- source branch/PR;
- exact commit/head SHA;
- build/deployment time; and
- relevant assurance result.

For Staging, exact candidate provenance is a control, not decorative metadata: Founder review must be traceable to the candidate later proposed for merge.

## Deliberately deferred implementation

This foundation PR does not:

- create `lhanson-dev/revision-nonprod`;
- add Prototype or Staging GitHub Actions workflows;
- change the existing production workflow;
- create or alter Supabase projects/data stores;
- define prototype expiry/garbage collection automation;
- define the final staging smoke suite; or
- change the Founder merge/approval gate.

Those changes should be delivered as small governed follow-on PRs against this approved architecture.