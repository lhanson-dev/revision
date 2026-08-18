# Content Operations Admin v0.1 Amendment

Status: Founder-approved authority change, pending merge.

## Purpose

Amend the approved Content Factory v0.1 operating boundary so ordinary course intake is operated through a minimal protected Revision Admin / Content Operations surface rather than requiring the Founder to initiate jobs directly in GitHub.

This amendment is narrow. It does not approve a broad administration platform or weaken any existing content, security, assurance, deployment or merge gate.

## Authority relationship

This document amends `80-company-workflows/Content Factory Operating Model.md` and the corresponding v0.1 admin deferral in `docs/technical/Content Factory Architecture.md`.

Where those documents say that no Admin UI is required before the pipeline is proven, the updated rule is:

> A **minimal Content Operations interface is part of v0.1** because it is the intended Founder entry point for course intake and job visibility. A broader operational dashboard remains deferred until the pipeline has been proven across representative course types.

All other Content Factory authority remains unchanged.

## v0.1 Admin boundary

Revision will provide a protected internal `/admin/` surface separate from the learner `/app/` runtime.

The first Content Operations capability is **Add Course**.

The minimum Add Course input is:

- one official awarding-body course/specification URL; and
- an optional Founder instruction or constraint.

Submitting the form must create the durable Content Factory job record and place it in the approved `requested` lifecycle state. The subsequent pipeline continues under the existing Content Factory operating model.

The Admin surface may later expose Course Jobs, blockers, assurance, CI/deployment state and usage/cost, but those additions must remain operational views over governed evidence rather than alternative sources of educational authority.

## Admin assignment

Admin access must be explicitly assigned in the Revision database to an authenticated user account.

Admin status must:

- be database-owned rather than inferred from an email address in browser code;
- be non-editable by ordinary authenticated browser clients;
- be checked by the protected Admin UI for presentation; and
- be rechecked server-side before any privileged Content Factory operation is performed.

The initial administrator is the existing authenticated account for `leehanson@hotmail.com`.

Future administrators may be assigned or removed by an authorised database operation without changing learner application code.

## Security boundary

The browser must never receive GitHub write credentials, Supabase service-role credentials, AI provider secrets or other privileged factory credentials.

The Add Course form must call a server-side trusted endpoint. That endpoint must validate the authenticated user and database-backed admin assignment before creating or mutating a Content Factory job.

The server-side endpoint may hold a narrowly scoped GitHub credential sufficient to create/update Content Factory issues. That credential must be stored as a deployment secret and must not be committed to the repository.

## Learner separation

`/admin/` is an internal administration route, not part of learner information architecture or learner navigation.

The canonical learner runtime remains `/app/`. Adding Content Operations must not introduce admin links into Home / Subjects / Progress / REV or couple learner content rendering to admin implementation.

## Merge and publication boundary

Creating a course job from Admin is not permission to generate unsupported content, publish a pack, or merge a PR.

The existing pipeline remains authoritative:

**official URL → job → identity → sources → coverage → generation → deterministic validation → independent review → remediation → exact-head CI → ready for Founder merge approval → explicit Founder merge → deployment verification → pilot live**

Every merge into `main` continues to require explicit Founder approval for that specific PR.

## Deferred capability

Still deferred from this initial Admin slice:

- a large dashboard;
- user analytics and system-health dashboards beyond already governed operations work;
- batch course intake;
- bulk job controls;
- automated merge;
- in-browser human subject benchmark review; and
- replacing the GitHub Issue durable job store with a new operational database.
