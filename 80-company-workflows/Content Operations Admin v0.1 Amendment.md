# Content Operations Admin v0.1 Amendment

Status: Founder-approved authority change, pending merge.

## Purpose

Amend the approved Content Factory v0.1 operating boundary so ordinary course intake is operated through a minimal protected Revision Content Operations capability rather than requiring the Founder to initiate jobs directly in GitHub.

This amendment is narrow. It does not approve a broad administration platform or weaken any existing content, security, assurance, deployment or merge gate.

## Authority relationship

This document amends `80-company-workflows/Content Factory Operating Model.md` and the corresponding v0.1 admin deferral in `docs/technical/Content Factory Architecture.md`.

Where those documents say that no Admin UI is required before the pipeline is proven, the updated rule is:

> A **minimal Content Operations interface is part of v0.1** because it is the intended Founder entry point for course intake and job visibility. A broader operational dashboard remains deferred until the pipeline has been proven across representative course types.

All other Content Factory authority remains unchanged.

## Canonical runtime and entry point

Content Operations is a **role-gated capability inside the canonical `/app/` React runtime**. Revision must not maintain a second standalone `/admin/` application or separate admin login experience for this v0.1 capability.

The standard learner navigation remains Home / Subjects / Progress / REV.

When the signed-in account has database-backed admin access:

- desktop navigation may expose an additional **Admin** item after the ordinary learner destinations;
- mobile must preserve the four-item learner bottom navigation and expose **Admin** through the account/additional-links menu; and
- selecting Admin opens the Content Operations screen inside `/app/`.

The Admin link is a privileged role-specific utility. It does not redefine the standard learner information architecture for ordinary student accounts.

The first Content Operations capability is **Add Course**.

The minimum Add Course input is:

- one official awarding-body course/specification URL; and
- an optional Founder instruction or constraint.

Submitting the form must create the durable Content Factory job record and place it in the approved `requested` lifecycle state. The subsequent pipeline continues under the existing Content Factory operating model.

The Content Operations screen may later expose Course Jobs, blockers, assurance, CI/deployment state and usage/cost, but those additions must remain operational views over governed evidence rather than alternative sources of educational authority.

## Authentication and account recovery

Revision uses the existing application sign-in experience for learners and administrators. There must not be a second admin-specific username/password flow.

The main sign-in experience must provide a **Forgot password** route using the approved Supabase Auth recovery mechanism. A recovery email returns the user to the canonical application, where the authenticated recovery session can set a new password before continuing.

Admin status is evaluated after normal authentication; password recovery does not confer or change admin access.

## Admin assignment

Admin access must be explicitly assigned in the Revision database to an authenticated user account.

Admin status must:

- be database-owned rather than inferred from an email address in browser code;
- be non-editable by ordinary authenticated browser clients;
- control whether the role-specific Admin navigation item is presented; and
- be rechecked server-side before any privileged Content Factory operation is performed.

The initial administrator is the existing authenticated account for `leehanson@hotmail.com`.

Future administrators may be assigned or removed by an authorised database operation without changing application code.

## Security boundary

Browser presentation of an Admin link is not authorization.

The browser must never receive GitHub write credentials, Supabase service-role credentials, AI provider secrets or other privileged factory credentials.

The Add Course form must call a server-side trusted endpoint. That endpoint must validate the authenticated user and database-backed admin assignment before creating or mutating a Content Factory job.

The server-side endpoint may hold a narrowly scoped GitHub credential sufficient to create/update Content Factory issues. That credential must be stored as a deployment secret and must not be committed to the repository.

## Learner separation

Content Operations shares the `/app/` runtime but remains role-gated operational functionality.

Ordinary learner accounts must not see Admin navigation or Content Operations controls. Adding Content Operations must not change the normal four-destination learner hierarchy or couple learner content rendering to Content Factory implementation.

## Merge and publication boundary

Creating a course job from Content Operations is not permission to generate unsupported content, publish a pack, or merge a PR.

The existing pipeline remains authoritative:

**official URL → job → identity → sources → coverage → generation → deterministic validation → independent review → remediation → exact-head CI → ready for Founder merge approval → explicit Founder merge → deployment verification → pilot live**

Every merge into `main` continues to require explicit Founder approval for that specific PR.

## Deferred capability

Still deferred from this initial Content Operations slice:

- a large dashboard;
- user analytics and system-health dashboards beyond already governed operations work;
- batch course intake;
- bulk job controls;
- automated merge;
- in-browser human subject benchmark review; and
- replacing the GitHub Issue durable job store with a new operational database.
